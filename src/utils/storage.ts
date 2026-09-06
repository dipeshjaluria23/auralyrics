import type { Song, ThemeColors, VisualSettings } from '../types/lyrics';

const DB_NAME = 'AuraLyricsDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_songs';

const SETTINGS_KEY = 'auralyrics_settings';
const THEME_KEY = 'auralyrics_theme';
const LAST_SONG_KEY = 'auralyrics_last_song_id';

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a custom user song into IndexedDB
 */
export async function saveCustomSong(song: Song): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put({
        ...song,
        isCustom: true,
        updatedAt: Date.now(),
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save song to IndexedDB, fallback to LocalStorage:', err);
    saveCustomSongFallback(song);
  }
}

/**
 * Load all custom songs from IndexedDB
 */
export async function loadCustomSongs(): Promise<Song[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to load songs from IndexedDB, reading fallback:', err);
    return loadCustomSongsFallback();
  }
}

/**
 * Delete a custom song from IndexedDB by ID
 */
export async function deleteCustomSong(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to delete song from IndexedDB:', err);
    deleteCustomSongFallback(id);
  }
}

/**
 * Fallback LocalStorage handlers if IndexedDB is blocked in private browsing
 */
const LS_SONGS_KEY = 'auralyrics_custom_songs_fallback';

function saveCustomSongFallback(song: Song) {
  try {
    const songs = loadCustomSongsFallback();
    const filtered = songs.filter((s) => s.id !== song.id);
    filtered.unshift(song);
    localStorage.setItem(LS_SONGS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('LocalStorage quota exceeded:', e);
  }
}

function loadCustomSongsFallback(): Song[] {
  try {
    const data = localStorage.getItem(LS_SONGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteCustomSongFallback(id: string) {
  try {
    const songs = loadCustomSongsFallback().filter((s) => s.id !== id);
    localStorage.setItem(LS_SONGS_KEY, JSON.stringify(songs));
  } catch {}
}

/**
 * LocalStorage Settings & Theme Persistence
 */
export function saveVisualSettings(settings: VisualSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadVisualSettings(defaultSettings: VisualSettings): VisualSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveThemeColors(colors: ThemeColors): void {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(colors));
  } catch {}
}

export function loadThemeColors(defaultColors: ThemeColors): ThemeColors {
  try {
    const data = localStorage.getItem(THEME_KEY);
    return data ? { ...defaultColors, ...JSON.parse(data) } : defaultColors;
  } catch {
    return defaultColors;
  }
}

export function saveLastSongId(songId: string): void {
  try {
    localStorage.setItem(LAST_SONG_KEY, songId);
  } catch {}
}

export function loadLastSongId(): string | null {
  try {
    return localStorage.getItem(LAST_SONG_KEY);
  } catch {
    return null;
  }
}

/**
 * Export full custom library as JSON string
 */
export async function exportLibraryJSON(): Promise<string> {
  const songs = await loadCustomSongs();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'AuraLyrics',
      version: '1.0',
      songs,
    },
    null,
    2
  );
}

/**
 * Import custom library from JSON string
 */
export async function importLibraryJSON(jsonString: string): Promise<Song[]> {
  const parsed = JSON.parse(jsonString);
  const songs: Song[] = Array.isArray(parsed) ? parsed : parsed.songs || [];
  for (const song of songs) {
    if (song.id && song.title && song.lyrics) {
      await saveCustomSong(song);
    }
  }
  return loadCustomSongs();
}

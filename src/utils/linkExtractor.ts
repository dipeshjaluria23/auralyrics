import type { LyricLine, Song, Word } from '../types/lyrics';

export interface ExtractedSongResult {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  youtubeVideoId?: string;
  spotifyUrl?: string;
  duration: number;
  lyrics: LyricLine[];
  hasSyncedLyrics: boolean;
  rawLrc?: string;
}

/**
 * Extracts YouTube Video ID from any YouTube / YouTube Music URL
 */
export function extractYouTubeId(url: string): string | null {
  const cleanUrl = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([^"&?\/\s]{11})/i;
  const match = cleanUrl.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extracts Spotify Track ID from a Spotify URL
 */
export function extractSpotifyTrackId(url: string): string | null {
  const match = url.trim().match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Clean up title string (removes "Official Video", "(Audio)", etc.)
 */
export function cleanSongTitle(rawTitle: string): { title: string; artist: string } {
  let text = rawTitle
    .replace(/\[official (?:music )?(?:video|audio|visualizer|lyric video)\]/gi, '')
    .replace(/\(official (?:music )?(?:video|audio|visualizer|lyric video)\)/gi, '')
    .replace(/\(lyrics?\)/gi, '')
    .replace(/\[lyrics?\]/gi, '')
    .replace(/\(4k\s*remaster(?:ed)?\)/gi, '')
    .replace(/\(audio\)/gi, '')
    .replace(/\[audio\]/gi, '')
    .replace(/\(hq\)/gi, '')
    .replace(/\(hd\)/gi, '')
    .trim();

  // If title has separator "Artist - Title"
  if (text.includes(' - ')) {
    const parts = text.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
    };
  }

  return {
    artist: '',
    title: text,
  };
}

/**
 * Parses standard LRC lyrics text into word-by-word synced LyricLine array
 */
export function parseLrcToLyricLines(lrc: string, _fallbackDuration = 180): LyricLine[] {

  const lines = lrc.split('\n');
  const result: { startTime: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const matches = Array.from(trimmed.matchAll(timeRegex));
    if (matches.length > 0) {
      const text = trimmed.replace(timeRegex, '').trim();
      if (!text) continue;

      for (const m of matches) {
        const mins = parseInt(m[1], 10);
        const secs = parseInt(m[2], 10);
        const ms = m[3] ? (m[3].length === 2 ? parseInt(m[3], 10) * 10 : parseInt(m[3], 10)) : 0;
        const totalSeconds = mins * 60 + secs + ms / 1000;
        result.push({
          startTime: +totalSeconds.toFixed(2),
          text,
        });
      }
    }
  }

  // Sort by start time
  result.sort((a, b) => a.startTime - b.startTime);

  if (result.length === 0) {
    return [];
  }

  // Generate word-level micro timings for each line
  const lyricLines: LyricLine[] = result.map((item, idx) => {
    const nextItem = result[idx + 1];
    const lineEnd = nextItem ? nextItem.startTime : item.startTime + 4.5;
    const duration = Math.max(1, lineEnd - item.startTime);

    const wordsArr = item.text.split(/\s+/).filter((w) => w.length > 0);
    const wordDuration = duration / wordsArr.length;

    const words: Word[] = wordsArr.map((w, wIdx) => {
      const wStart = item.startTime + wIdx * wordDuration;
      const wEnd = item.startTime + (wIdx + 1) * wordDuration;
      return {
        text: w,
        startTime: +wStart.toFixed(2),
        endTime: +wEnd.toFixed(2),
        emphasis: w.length > 6 || /^[A-Z]{2,}/.test(w) || wIdx === wordsArr.length - 1,
      };
    });

    return {
      id: `lrc-${idx}`,
      startTime: item.startTime,
      endTime: +lineEnd.toFixed(2),
      text: item.text,
      words,
    };
  });

  return lyricLines;
}

/**
 * Searches and fetches synchronized LRC lyrics from LRCLIB public API
 */
export async function fetchLyricsFromLRCLIB(title: string, artist = ''): Promise<{
  syncedLyrics?: string;
  plainLyrics?: string;
  duration?: number;
  albumName?: string;
  artistName?: string;
  trackName?: string;
} | null> {
  try {
    const query = `${title} ${artist}`.trim();
    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return null;

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    // Prefer entries with syncedLyrics
    const bestMatch = items.find((i: { syncedLyrics?: string }) => !!i.syncedLyrics) || items[0];

    return {
      syncedLyrics: bestMatch.syncedLyrics || undefined,
      plainLyrics: bestMatch.plainLyrics || undefined,
      duration: bestMatch.duration || undefined,
      albumName: bestMatch.albumName || undefined,
      artistName: bestMatch.artistName || undefined,
      trackName: bestMatch.trackName || undefined,
    };
  } catch (err) {
    console.warn('LRCLIB API fetch failed:', err);
    return null;
  }
}

/**
 * Main Link Extraction function: takes any URL or search term and extracts poster, lyrics, and metadata
 */
export async function extractSongFromLink(urlOrQuery: string): Promise<ExtractedSongResult> {
  const ytId = extractYouTubeId(urlOrQuery);
  const spotifyId = extractSpotifyTrackId(urlOrQuery);

  let title = '';
  let artist = '';
  let album = 'Web Single';
  let coverUrl = '';
  let duration = 180;
  let rawLrc: string | undefined;
  let parsedLyrics: LyricLine[] = [];

  // Case 1: YouTube / YouTube Music URL
  if (ytId) {
    coverUrl = `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`;

    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        const cleaned = cleanSongTitle(data.title || 'Untitled');
        title = cleaned.title;
        artist = cleaned.artist || data.author_name?.replace(' - Topic', '') || 'YouTube Music';
        coverUrl = data.thumbnail_url || coverUrl;
      }
    } catch {
      title = 'YouTube Music Track';
      artist = 'Online Artist';
    }
  }
  // Case 2: Spotify URL
  else if (spotifyId) {
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${spotifyId}`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || 'Spotify Track';
        coverUrl = data.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
        artist = 'Spotify Music';
      }
    } catch {
      title = 'Spotify Music';
      artist = 'Artist';
      coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
    }
  }
  // Case 3: Search Query or Direct Input
  else {
    const cleaned = cleanSongTitle(urlOrQuery);
    title = cleaned.title || urlOrQuery;
    artist = cleaned.artist;
    coverUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';
  }

  // Fetch Synced Lyrics from LRCLIB
  const lrcData = await fetchLyricsFromLRCLIB(title, artist);
  if (lrcData) {
    if (lrcData.trackName) title = lrcData.trackName;
    if (lrcData.artistName && (!artist || artist.includes('Topic') || artist.includes('YouTube'))) artist = lrcData.artistName;
    if (lrcData.albumName) album = lrcData.albumName;
    if (lrcData.duration) duration = Math.round(lrcData.duration);

    if (lrcData.syncedLyrics) {
      rawLrc = lrcData.syncedLyrics;
      parsedLyrics = parseLrcToLyricLines(lrcData.syncedLyrics, duration);
    } else if (lrcData.plainLyrics) {
      // Auto estimate from plain lines
      const plainLines = lrcData.plainLyrics.split('\n').filter((l: string) => l.trim().length > 0);
      const lineDuration = (duration - 4) / Math.max(1, plainLines.length);

      parsedLyrics = plainLines.map((lText: string, lIdx: number) => {
        const lStart = 1.0 + lIdx * lineDuration;
        const lEnd = lStart + lineDuration * 0.95;
        const wordsArr = lText.split(/\s+/).filter((w: string) => w.length > 0);
        const wDuration = (lEnd - lStart) / wordsArr.length;

        return {
          id: `plain-${lIdx}`,
          startTime: +lStart.toFixed(2),
          endTime: +lEnd.toFixed(2),
          text: lText,
          words: wordsArr.map((w: string, wIdx: number) => ({
            text: w,
            startTime: +(lStart + wIdx * wDuration).toFixed(2),
            endTime: +(lStart + (wIdx + 1) * wDuration).toFixed(2),
          })),
        };
      });
    }
  }

  // Fallback lyrics if song not found in LRCLIB
  if (parsedLyrics.length === 0) {
    parsedLyrics = [
      {
        id: 'fb-1',
        startTime: 1.0,
        endTime: 5.5,
        text: `Playing ${title}`,
        words: [
          { text: 'Playing', startTime: 1.0, endTime: 2.2 },
          { text: title, startTime: 2.2, endTime: 5.5, emphasis: true },
        ],
      },
      {
        id: 'fb-2',
        startTime: 6.0,
        endTime: 11.0,
        text: `By ${artist || 'Aura Artist'}`,
        words: [
          { text: 'By', startTime: 6.0, endTime: 7.5 },
          { text: artist || 'Aura Artist', startTime: 7.5, endTime: 11.0, emphasis: true },
        ],
      },
      {
        id: 'fb-3',
        startTime: 12.0,
        endTime: 18.0,
        text: 'Feel the rhythm flowing through the air',
        words: [
          { text: 'Feel', startTime: 12.0, endTime: 13.0 },
          { text: 'the', startTime: 13.0, endTime: 13.6 },
          { text: 'rhythm', startTime: 13.6, endTime: 14.8, emphasis: true },
          { text: 'flowing', startTime: 14.8, endTime: 16.0 },
          { text: 'through', startTime: 16.0, endTime: 16.8 },
          { text: 'the', startTime: 16.8, endTime: 17.3 },
          { text: 'air', startTime: 17.3, endTime: 18.0, emphasis: true },
        ],
      },
    ];
  }

  return {
    title: title || 'Imported Song',
    artist: artist || 'Unknown Artist',
    album: album || 'Imported Single',
    coverUrl,
    youtubeVideoId: ytId || undefined,
    duration,
    lyrics: parsedLyrics,
    hasSyncedLyrics: !!rawLrc,
    rawLrc,
  };
}

/**
 * Converts an ExtractedSongResult to a full playable Song object
 */
export function createSongFromExtracted(extracted: ExtractedSongResult): Song {
  return {
    id: extracted.youtubeVideoId ? `yt-${extracted.youtubeVideoId}` : `imported-${Date.now()}`,
    title: extracted.title,
    artist: extracted.artist,
    album: extracted.album,
    coverUrl: extracted.coverUrl,
    youtubeVideoId: extracted.youtubeVideoId,
    sourceType: extracted.youtubeVideoId ? 'youtube' : 'synth',
    duration: extracted.duration,
    lyrics: extracted.lyrics,
    bpm: 110,
  };
}

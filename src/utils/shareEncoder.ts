import type { Song, ThemeColors, VisualizerMode } from '../types/lyrics';

export interface SharePayload {
  song: Song;
  colors?: Partial<ThemeColors>;
  mode?: VisualizerMode;
  createdAt: number;
}

/**
 * Encode a song, colors, and visualizer mode into a safe URL hash string
 */
export function encodeSharePayload(payload: {
  song: Song;
  colors?: ThemeColors;
  mode?: VisualizerMode;
}): string {
  try {
    const dataToEncode: SharePayload = {
      song: payload.song,
      colors: payload.colors,
      mode: payload.mode,
      createdAt: Date.now(),
    };

    const jsonStr = JSON.stringify(dataToEncode);
    // Safe UTF-8 Base64 encoding
    const encoded = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return encoded;
  } catch (err) {
    console.error('Failed to encode share payload:', err);
    return '';
  }
}

/**
 * Decode a URL hash string back into a SharePayload
 */
export function decodeSharePayload(hashString: string): SharePayload | null {
  try {
    const cleanHash = hashString.replace(/^#share=/, '').replace(/^#/, '');
    if (!cleanHash) return null;

    // Safe UTF-8 Base64 decoding
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanHash), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const parsed: SharePayload = JSON.parse(jsonStr);
    if (parsed && parsed.song && parsed.song.title && parsed.song.lyrics) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to decode share payload from URL hash:', err);
    return null;
  }
}

/**
 * Generate full shareable URL
 */
export function generateShareUrl(payload: {
  song: Song;
  colors?: ThemeColors;
  mode?: VisualizerMode;
}): string {
  const encoded = encodeSharePayload(payload);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#share=${encoded}`;
}

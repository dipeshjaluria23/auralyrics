import React, { useState } from 'react';
import type { Song } from '../types/lyrics';
import { extractSongFromLink, createSongFromExtracted } from '../utils/linkExtractor';
import type { ExtractedSongResult } from '../utils/linkExtractor';
import { X, Link as LinkIcon, Sparkles, CheckCircle2, Loader2, ArrowRight, Disc3 } from 'lucide-react';
import confetti from 'canvas-confetti';


interface LinkImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSong: (song: Song) => void;
}

export const LinkImporterModal: React.FC<LinkImporterModalProps> = ({
  isOpen,
  onClose,
  onImportSong,
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedSongResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Preset Links for instant testing
  const sampleLinks = [
    {
      label: '🎵 The Weeknd - Blinding Lights (YT Music)',
      url: 'https://music.youtube.com/watch?v=4NRXx6U8ABQ',
    },
    {
      label: '⚡ Dua Lipa - Levitating (YouTube)',
      url: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    },
    {
      label: '✨ Rick Astley - Never Gonna Give You Up',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      label: '🎧 Post Malone - Sunflower',
      url: 'https://www.youtube.com/watch?v=ApXoWvfEYVU',
    },
  ];

  const handleExtract = async (urlToFetch?: string) => {
    const targetUrl = urlToFetch || inputUrl;
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setExtractedResult(null);

    try {
      const result = await extractSongFromLink(targetUrl);
      setExtractedResult(result);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not extract song data from this link. Please check the URL or try another.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAndPlay = () => {
    if (!extractedResult) return;
    const song = createSongFromExtracted(extractedResult);
    onImportSong(song);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
      <div
        className="w-full max-w-xl max-h-[92vh] bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(236,72,153,0.3)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                Import from Link <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-[11px] text-white/50">
                YouTube Music, YouTube, Spotify, or Song Title
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / URL Input Area */}
        <div className="py-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                placeholder="Paste YouTube Music / YouTube URL or Song name..."
                className="w-full bg-white/5 border border-white/15 focus:border-fuchsia-400 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none pr-10 placeholder-white/40"
              />
              {inputUrl && (
                <button
                  onClick={() => setInputUrl('')}
                  className="absolute right-3 top-3 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleExtract()}
              disabled={isLoading || !inputUrl.trim()}
              className="px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white disabled:opacity-50 transition-all flex items-center gap-2 flex-shrink-0 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Extract</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Samples */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-white/40 font-mono block">
              Try a sample song:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleLinks.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputUrl(s.url);
                    handleExtract(s.url);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-white/70 hover:text-white border border-white/10 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3 animate-pulse">
            <Disc3 className="w-12 h-12 text-fuchsia-400 animate-spin" />
            <p className="text-sm font-medium text-white/80">
              Extracting Poster Artwork, Audio & Synced Lyrics...
            </p>
            <p className="text-xs text-white/40 font-mono">
              Fetching metadata and LRCLIB timestamp data
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs my-2">
            {errorMsg}
          </div>
        )}

        {/* Extracted Preview Card */}
        {extractedResult && !isLoading && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex gap-4 items-center">
              {/* Poster Thumbnail */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 flex-shrink-0 shadow-xl">
                <img
                  src={extractedResult.coverUrl}
                  alt={extractedResult.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/80">
                  {extractedResult.duration}s
                </span>
              </div>

              {/* Extracted Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    {extractedResult.hasSyncedLyrics ? '✓ Synced Lyrics Ready' : '✓ Lyrics Extracted'}
                  </span>
                  {extractedResult.youtubeVideoId && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-semibold border border-red-500/30">
                      YouTube Audio
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white truncate mt-1">
                  {extractedResult.title}
                </h3>
                <p className="text-xs text-white/70 truncate">{extractedResult.artist}</p>
                <p className="text-[11px] text-white/40 mt-1 font-mono">
                  {extractedResult.lyrics.length} Lines • {extractedResult.lyrics.reduce((a, b) => a + b.words.length, 0)} Words
                </p>
              </div>
            </div>

            {/* Lyrics Preview */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-mono block mb-2">
                Sample Synced Lyrics Preview:
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                {extractedResult.lyrics.slice(0, 6).map((line, idx) => (
                  <div key={idx} className="text-white/70 flex gap-2">
                    <span className="text-fuchsia-400/80 select-none">[{line.startTime}s]</span>
                    <span className="truncate">{line.text}</span>
                  </div>
                ))}
                {extractedResult.lyrics.length > 6 && (
                  <div className="text-[11px] text-white/40 italic pt-1">
                    + {extractedResult.lyrics.length - 6} more lines synchronized
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-medium text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {extractedResult && (
            <button
              onClick={handleApplyAndPlay}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-cyan-400 text-black hover:opacity-95 shadow-xl transition-all flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Kinetic Visualizer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

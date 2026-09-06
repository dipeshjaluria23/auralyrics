import React, { useRef } from 'react';
import type { Song, ThemeColors } from '../types/lyrics';
import { X, Play, Music, Sparkles, Trash2, Download, Upload, Share2 } from 'lucide-react';

interface SongListDrawerProps {
  isOpen: boolean;
  songs: Song[];
  activeSongId: string;
  colors: ThemeColors;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  onDeleteSong?: (songId: string) => void;
  onShareSong?: (song: Song) => void;
  onExportLibrary?: () => void;
  onImportLibrary?: (json: string) => void;
  onOpenStudio: () => void;
  onOpenLinkImporter: () => void;
}

export const SongListDrawer: React.FC<SongListDrawerProps> = ({
  isOpen,
  songs,
  activeSongId,
  colors,
  onClose,
  onSelectSong,
  onDeleteSong,
  onShareSong,
  onExportLibrary,
  onImportLibrary,
  onOpenStudio,
  onOpenLinkImporter,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onImportLibrary) {
        onImportLibrary(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md transition-opacity">
      <div
        className="w-full max-w-md h-full bg-neutral-950/90 border-l border-white/10 p-6 flex flex-col shadow-2xl overflow-y-auto"
        style={{
          boxShadow: `-10px 0 30px ${colors.primary}15`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-white" style={{ color: colors.primary }} />
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Song Library</h2>
              <p className="text-[11px] text-white/50">{songs.length} tracks available • Saved in IndexedDB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Songs List */}
        <div className="flex-1 py-4 space-y-3 overflow-y-auto pr-1">
          {songs.map((song) => {
            const isSelected = song.id === activeSongId;
            const isCustom = (song as Song & { isCustom?: boolean }).isCustom || song.id.startsWith('custom-') || song.id.startsWith('imported-') || song.id.startsWith('shared-');

            return (
              <div
                key={song.id}
                className={`p-3.5 rounded-2xl transition-all duration-200 border flex items-center gap-3.5 group relative ${
                  isSelected
                    ? 'bg-white/15 border-white/30 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
                style={
                  isSelected
                    ? {
                        boxShadow: `0 0 20px ${colors.primary}33`,
                      }
                    : {}
                }
              >
                {/* Artwork & Play Click */}
                <div
                  onClick={() => {
                    onSelectSong(song);
                    onClose();
                  }}
                  className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-5 h-5 fill-white text-white animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div
                  onClick={() => {
                    onSelectSong(song);
                    onClose();
                  }}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                    {isSelected && <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />}
                    {isCustom && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 truncate mt-0.5">{song.artist}</p>
                  <div className="flex items-center gap-2.5 mt-1.5 text-[11px] text-white/40 font-mono">
                    <span>{song.duration}s</span>
                    {song.bpm && <span>{song.bpm} BPM</span>}
                    <span>{song.lyrics.length} lines</span>
                  </div>
                </div>

                {/* Actions (Share & Delete for custom) */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {onShareSong && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareSong(song);
                      }}
                      className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="Share Visualizer Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}

                  {isCustom && onDeleteSong && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSong(song.id);
                      }}
                      className="p-2 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Custom Song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Banners & Library Export/Import */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenLinkImporter();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 shadow-xl"
          >
            <span>🔗 Paste Song Link (YT Music / Spotify)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenStudio();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <span>✨ Custom Studio & Tap-to-Sync</span>
          </button>

          {/* Backup Export / Import */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onExportLibrary}
              className="py-2 px-3 rounded-xl text-[11px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              title="Download JSON backup of your custom library"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl text-[11px] font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              title="Import JSON backup into your library"
            >
              <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Import JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,application/json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

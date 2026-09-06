import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Music,
  PlusCircle,
  Repeat,
  Sparkles,
  Link as LinkIcon,
  Palette,
  Keyboard,
} from 'lucide-react';

import type { Song, ThemeColors, VisualSettings, VisualizerMode } from '../types/lyrics';


interface PlayerControlsProps {
  song: Song;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  volume: number;
  colors: ThemeColors;
  settings: VisualSettings;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onVolumeChange: (vol: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenStudio: () => void;
  onOpenSongList: () => void;
  onOpenLinkImporter: () => void;
  onOpenColorModal: () => void;
  onModeChange: (mode: VisualizerMode) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  song,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  volume,
  colors,
  settings,
  isFullscreen,
  onPlayPause,
  onSeek,
  onPrevTrack,
  onNextTrack,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleFullscreen,
  onOpenShortcuts,
  onOpenSettings,
  onOpenStudio,
  onOpenSongList,
  onOpenLinkImporter,
  onOpenColorModal,
  onModeChange,
}) => {

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume || 0.7);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const modes: { id: VisualizerMode; label: string; icon: string }[] = [
    { id: 'fisheye', label: 'Fisheye Lens', icon: '👁️' },
    { id: 'visual-symbols', label: 'Visual Symbols', icon: '🎨' },
    { id: 'ship-3d', label: '3D Wall', icon: '🚀' },
    { id: 'vinyl-spin', label: 'Vinyl Spin', icon: '💿' },
    { id: 'retro-ipod', label: 'Retro iPod', icon: '📱' },
    { id: 'imessage-bubbles', label: 'iMessage', icon: '💬' },
    { id: 'vhs-camcorder', label: '90s VHS', icon: '📼' },
    { id: 'apple-sing', label: 'Apple Sing', icon: '🎤' },
    { id: 'vortex-zoom', label: 'Warp Zoom', icon: '🌀' },
    { id: 'hero-word', label: 'Hero Word', icon: '✨' },
    { id: 'kinetic-flow', label: 'Flow', icon: '🌊' },
    { id: 'reel-pop', label: 'Reel Pop', icon: '⚡' },
    { id: 'minimal-zen', label: 'Zen', icon: '🌿' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-6 pt-2 select-none z-30">
      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 overflow-x-auto py-1 max-w-full">

        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              settings.mode === m.id
                ? 'bg-white text-black font-semibold shadow-lg scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white/70 backdrop-blur-md'
            }`}
            style={
              settings.mode === m.id
                ? { boxShadow: `0 0 15px ${colors.primary}88` }
                : {}
            }
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Main Glassmorphic Dock */}
      <div
        className="glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl transition-all duration-300 border border-white/15"
        style={{
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${colors.primary}20`,
        }}
      >
        {/* Progress Scrubber */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono text-white/50 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group py-2 cursor-pointer">
            {/* Custom Track Background */}
            <div className="relative w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-75"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                  boxShadow: `0 0 10px ${colors.primary}`,
                }}
              />
            </div>
            {/* Actual Slider Input */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono text-white/50 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls and Track Info Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Song artwork & Details */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-center sm:justify-start">
            <div
              onClick={onOpenSongList}
              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer group shadow-md border border-white/20 flex-shrink-0"
              title="Click to browse tracks"
            >
              <img
                src={song.coverUrl}
                alt={song.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Music className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="min-w-0 max-w-[200px] sm:max-w-xs cursor-pointer" onClick={onOpenSongList}>
              <h3 className="text-sm sm:text-base font-semibold text-white truncate hover:underline flex items-center gap-1.5">
                {song.title}
                <Sparkles className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              </h3>
              <p className="text-xs text-white/60 truncate font-light">
                {song.artist}
              </p>
            </div>
          </div>

          {/* Center: Playback Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onPrevTrack}
              className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-13 h-13 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl text-black font-bold"
              style={{
                background: '#ffffff',
                boxShadow: `0 0 25px ${colors.primary}99`,
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current text-black" />
              ) : (
                <Play className="w-6 h-6 fill-current text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => onSeek(0)}
              className="p-2 rounded-full text-white/50 hover:text-white/80 hover:bg-white/10 transition-all hidden sm:flex"
              title="Restart Song"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Actions, Volume & Tools */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
            {/* Playback speed selector */}
            <select
              value={playbackRate}
              onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
              className="bg-white/10 text-white/80 hover:text-white text-xs rounded-lg px-2 py-1 border border-white/10 cursor-pointer focus:outline-none backdrop-blur-md"
              title="Playback Speed"
            >
              <option value="0.75" className="bg-neutral-900 text-white">0.75x</option>
              <option value="1.0" className="bg-neutral-900 text-white">1.0x</option>
              <option value="1.25" className="bg-neutral-900 text-white">1.25x</option>
              <option value="1.5" className="bg-neutral-900 text-white">1.5x</option>
            </select>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group">
              <button
                onClick={handleVolumeToggle}
                className="p-1.5 text-white/60 hover:text-white transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setIsMuted(false);
                  onVolumeChange(parseFloat(e.target.value));
                }}
                className="w-16 h-1 cursor-pointer accent-white hidden sm:inline-block"
              />
            </div>

            {/* Paste Link Button */}
            <button
              onClick={onOpenLinkImporter}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1 text-xs"
              title="Paste YouTube Music / Spotify Link"
            >
              <LinkIcon className="w-4 h-4 text-fuchsia-400" />
              <span className="hidden md:inline">Link</span>
            </button>

            {/* Custom Studio / Upload */}
            <button
              onClick={onOpenStudio}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1 text-xs"
              title="Custom Song Studio & Sync Editor"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Studio</span>
            </button>

            {/* Lyric & Background Color Studio */}
            <button
              onClick={onOpenColorModal}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 flex items-center gap-1 text-xs"
              title="Customize Lyric & Background Colors"
            >
              <Palette className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Colors</span>
            </button>

            {/* Visual Settings Drawer Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              title="Visual Effects & Font Settings"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Keyboard DJ Shortcuts Modal Button */}
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              title="Pro Keyboard DJ Hotkeys (?)"
            >
              <Keyboard className="w-4 h-4 text-purple-400" />
            </button>

            {/* Fullscreen Zen Mode */}
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

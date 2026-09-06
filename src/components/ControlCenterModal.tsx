import React, { useState } from 'react';
import type { FontStyle, Song, ThemeColors, TransitionEffect, VisualSettings, VisualizerMode } from '../types/lyrics';
import {
  X,
  Sliders,
  Eye,
  Palette,
  Type,
  Sparkles,
  SunMedium,
  Activity,
  Disc,
  ArrowUpCircle,
  RefreshCw,
  Search,
  Check,
  Music,
  Link as LinkIcon,
  PlusCircle,
  Volume2,
  Gauge,
  Layers,
  RotateCcw,
  Share2,
  Database,
  Download,
  Upload,
} from 'lucide-react';

export type ControlCenterTab = 'modes' | 'colors' | 'typography' | 'atmosphere' | 'audio' | 'tools';

interface ControlCenterModalProps {
  isOpen: boolean;
  initialTab?: ControlCenterTab;
  settings: VisualSettings;
  colors: ThemeColors;
  currentSong: Song;
  playbackRate: number;
  volume: number;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<VisualSettings>) => void;
  onUpdateColors: (newColors: Partial<ThemeColors>) => void;
  onResetToPoster: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onVolumeChange: (vol: number) => void;
  onOpenSongList: () => void;
  onOpenLinkImporter: () => void;
  onOpenStudio: () => void;
  onShareVisualizer?: () => void;
  onExportLibrary?: () => void;
  onImportLibrary?: (json: string) => void;
}

export const ControlCenterModal: React.FC<ControlCenterModalProps> = ({
  isOpen,
  initialTab = 'modes',
  settings,
  colors,
  currentSong,
  playbackRate,
  volume,
  onClose,
  onUpdateSettings,
  onUpdateColors,
  onResetToPoster,
  onPlaybackRateChange,
  onVolumeChange,
  onOpenSongList,
  onOpenLinkImporter,
  onOpenStudio,
  onShareVisualizer,
  onExportLibrary,
  onImportLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<ControlCenterTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Preset Color Palettes
  const PRESET_THEMES = [
    {
      name: 'Cyberpunk Neon',
      icon: '🌸',
      colors: {
        primary: '#ff2a85',
        secondary: '#00f0ff',
        tertiary: '#7928ca',
        bgDark: '#070514',
        glow: 'rgba(255, 42, 133, 0.85)',
        accent: '#ff007f',
        lyricTextColor: '#ffffff',
        inactiveTextColor: 'rgba(255, 255, 255, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Golden Sunset',
      icon: '🌅',
      colors: {
        primary: '#f59e0b',
        secondary: '#ec4899',
        tertiary: '#8b5cf6',
        bgDark: '#0f0814',
        glow: 'rgba(245, 158, 11, 0.85)',
        accent: '#fbbf24',
        lyricTextColor: '#fef08a',
        inactiveTextColor: 'rgba(253, 230, 138, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Deep Galaxy Blue',
      icon: '🌌',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        tertiary: '#06b6d4',
        bgDark: '#030712',
        glow: 'rgba(59, 130, 246, 0.85)',
        accent: '#60a5fa',
        lyricTextColor: '#93c5fd',
        inactiveTextColor: 'rgba(147, 197, 253, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Emerald Neon',
      icon: '🍃',
      colors: {
        primary: '#10b981',
        secondary: '#06b6d4',
        tertiary: '#f43f5e',
        bgDark: '#020f09',
        glow: 'rgba(16, 185, 129, 0.9)',
        accent: '#34d399',
        lyricTextColor: '#a7f3d0',
        inactiveTextColor: 'rgba(167, 243, 208, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Monochrome AMOLED',
      icon: '🖤',
      colors: {
        primary: '#ffffff',
        secondary: '#9ca3af',
        tertiary: '#4b5563',
        bgDark: '#000000',
        glow: 'rgba(255, 255, 255, 0.75)',
        accent: '#f3f4f6',
        lyricTextColor: '#ffffff',
        inactiveTextColor: 'rgba(255, 255, 255, 0.25)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Pastel Dream',
      icon: '🍬',
      colors: {
        primary: '#f472b6',
        secondary: '#a78bfa',
        tertiary: '#38bdf8',
        bgDark: '#110b17',
        glow: 'rgba(244, 114, 182, 0.85)',
        accent: '#fb7185',
        lyricTextColor: '#fdf2f8',
        inactiveTextColor: 'rgba(253, 242, 248, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Inferno Crimson',
      icon: '🔥',
      colors: {
        primary: '#ef4444',
        secondary: '#f97316',
        tertiary: '#eab308',
        bgDark: '#120404',
        glow: 'rgba(239, 68, 68, 0.85)',
        accent: '#fb7185',
        lyricTextColor: '#fef2f2',
        inactiveTextColor: 'rgba(254, 242, 242, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Glacier Arctic',
      icon: '❄️',
      colors: {
        primary: '#06b6d4',
        secondary: '#3b82f6',
        tertiary: '#6366f1',
        bgDark: '#040d1a',
        glow: 'rgba(6, 182, 212, 0.85)',
        accent: '#67e8f9',
        lyricTextColor: '#ecfeff',
        inactiveTextColor: 'rgba(236, 254, 255, 0.35)',
        autoPosterSync: false,
      },
    },
  ];

  // Visualizer Modes
  const MODES: { id: VisualizerMode; label: string; badge: string; desc: string; icon: string }[] = [
    {
      id: 'fisheye',
      label: 'Verci Convex Lens',
      badge: 'Instagram Reel Viral',
      desc: 'Convex 3D lens shader: singing word bulges closest to screen with depth blur',
      icon: '👁️',
    },
    {
      id: 'visual-symbols',
      label: 'Verci Visual Symbols',
      badge: 'SF Icons',
      desc: 'Semantic aesthetic emojis & SF symbols pop in dynamically beside lyrics',
      icon: '🎨',
    },
    {
      id: 'ship-3d',
      label: 'Verci 3D Drift Wall',
      badge: '3D Spatial',
      desc: 'Floating 3D perspective wall drifting seamlessly through space',
      icon: '🚀',
    },
    {
      id: 'vinyl-spin',
      label: 'Vinyl Turntable & Grooves',
      badge: 'Aesthetic Vinyl',
      desc: '3D rotating vinyl record with concentric grooves, center artwork, and floating halo lyrics',
      icon: '💿',
    },
    {
      id: 'retro-ipod',
      label: 'Retro iPod Classic',
      badge: '2000s Y2K Aesthetic',
      desc: 'Classic Apple iPod chassis with glowing cyan LCD lyric ticker and click wheel',
      icon: '📱',
    },
    {
      id: 'imessage-bubbles',
      label: 'iMessage Chat Bubbles',
      badge: 'iOS Conversation',
      desc: 'Glass chat bubbles popping in word-by-word with live typing indicator',
      icon: '💬',
    },
    {
      id: 'vhs-camcorder',
      label: '90s VHS Camcorder',
      badge: 'Vintage Analog',
      desc: 'Retro REC timestamp, CRT scanlines, RGB glitch split, and glowing OSD subtitles',
      icon: '📼',
    },
    {
      id: 'apple-sing',
      label: 'Apple Music Sing Spotlight',
      badge: 'Karaoke Beam',
      desc: 'Luminous center spotlight with fluid Gaussian blur depth and sweeping word glow',
      icon: '🎤',
    },
    {
      id: 'vortex-zoom',
      label: 'Hyperspace Warp Zoom',
      badge: 'Hyperpop / Phonk',
      desc: 'Cosmic speed warp tunnel shooting active words directly forward at the camera',
      icon: '🌀',
    },
    {
      id: 'hero-word',
      label: 'Hero Single Word',
      badge: 'Full Focus',
      desc: 'High-impact center stage word glow with smooth motion trails',
      icon: '✨',
    },
    {
      id: 'kinetic-flow',
      label: 'Kinetic Flow',
      badge: 'Karaoke',
      desc: 'Full lyric sentence with active word-by-word luminous bounce',
      icon: '🌊',
    },
    {
      id: 'reel-pop',
      label: 'Reel Kinetic Pop',
      badge: 'TikTok Style',
      desc: 'Punchy typography cards with dynamic kinetic tilt and bounce',
      icon: '⚡',
    },
    {
      id: 'minimal-zen',
      label: 'Minimal Zen',
      badge: 'Editorial',
      desc: 'Clean editorial line layout with high contrast refined focus',
      icon: '🌿',
    },
  ];

  // Fonts
  const FONTS: { id: FontStyle; name: string; preview: string; fontClass: string; desc: string }[] = [
    { id: 'syne', name: 'Syne (Verci Style)', preview: 'Electric Aura', fontClass: 'font-syne', desc: 'Punchy bold display font used in viral aesthetic reels' },
    { id: 'orbitron', name: 'Orbitron', preview: 'CYBERPULSE', fontClass: 'font-orbitron', desc: 'Futuristic sci-fi aesthetic' },
    { id: 'playfair', name: 'Playfair Display', preview: 'Velvet Dreams', fontClass: 'font-playfair', desc: 'Elegant high-fashion luxury serif' },
    { id: 'outfit', name: 'Outfit', preview: 'Midnight Horizon', fontClass: 'font-outfit', desc: 'Clean modern geometric sans' },
    { id: 'cinzel', name: 'Cinzel', preview: 'ETHEREAL LIGHT', fontClass: 'font-cinzel', desc: 'Cinematic Roman classic' },
    { id: 'space', name: 'Space Grotesk', preview: 'Digital Horizon', fontClass: 'font-space', desc: 'Tech-focused monospace feel' },
    { id: 'cormorant', name: 'Cormorant Garamond', preview: 'Soft Whispers', fontClass: 'font-cormorant', desc: 'Graceful editorial aesthetic' },
  ];

  // Motion Transitions
  const TRANSITIONS: { id: TransitionEffect; label: string; desc: string }[] = [
    { id: 'rise-up', label: '⬆️ Smooth Rise Up', desc: 'Glides up with silky vertical motion blur' },
    { id: 'kinetic-pop', label: '⚡ Kinetic Pop Up', desc: 'Punchy upward scale pop & spring bounce' },
    { id: 'flip-rise', label: '🎲 3D Flip Rise', desc: '3D perspective upward tilt and arrival' },
    { id: 'glow-float', label: '🔮 Floating Glow Up', desc: 'Luminous upward halo glide and pulse' },
  ];

  // Reset to Verci aesthetic defaults
  const handleResetToDefaults = () => {
    onUpdateSettings({
      mode: 'fisheye',
      font: 'syne',
      textSize: 'extra-massive',
      transitionEffect: 'rise-up',
      glowIntensity: 1.3,
      particleCount: 40,
      ambientMotionSpeed: 1.0,
      audioReactive: true,
      showFilmGrain: true,
      showVisualizerBars: true,
      showNextLinePreview: true,
      showLockScreenClock: true,
      lumnLighting: true,
      visualIcons: true,
    });
    onResetToPoster();
  };

  // Filtered items when searching
  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-4xl h-[90vh] max-h-[820px] bg-neutral-950/95 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white transition-all"
        style={{
          boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 35px ${colors.primary}30`,
        }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center glass-panel shadow-md"
              style={{ background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)` }}
            >
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-syne">
                  Control Center
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                  Settings
                </span>
              </div>
              <p className="text-xs text-white/50 hidden sm:block">
                Configure visual modes, dynamic lighting, typography, and theme palettes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
              title="Reset all settings to Verci + Lumn defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Status Pill Strip */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search features (e.g. font, lumn, scale, amoled)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Active Summary Badges */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full text-[11px] text-white/60 font-mono">
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 truncate">
              Mode: <strong className="text-white capitalize">{settings.mode}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 truncate">
              Font: <strong className="text-white capitalize">{settings.font}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 truncate">
              Scale: <strong className="text-white">{settings.textSize}</strong>
            </span>
          </div>
        </div>

        {/* Main Body: Tabs Layout */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full sm:w-56 p-3 sm:p-4 bg-white/[0.02] border-b sm:border-b-0 sm:border-r border-white/10 flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-y-auto flex-shrink-0">
            {[
              { id: 'modes', label: 'Visual Modes', icon: Eye, desc: '7 kinetic styles' },
              { id: 'colors', label: 'Colors & Themes', icon: Palette, desc: 'Presets & custom' },
              { id: 'typography', label: 'Typography & Motion', icon: Type, desc: 'Fonts & scale' },
              { id: 'atmosphere', label: 'Atmosphere & FX', icon: Sparkles, desc: 'Lumn, clock & glow' },
              { id: 'audio', label: 'Audio & Playback', icon: Gauge, desc: 'Speed, EQ & sync' },
              { id: 'tools', label: 'Music & Importer', icon: Music, desc: 'Links, studio, songs' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ControlCenterTab);
                    setSearchQuery('');
                  }}
                  className={`w-full p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 transition-all text-left flex-shrink-0 sm:flex-shrink ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold border border-white/20 shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow: `0 4px 20px ${colors.primary}25`,
                        }
                      : {}
                  }
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white text-black' : 'bg-white/5 text-white/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className="text-xs font-medium leading-tight">{tab.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5 truncate">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: VISUAL MODES */}
            {(activeTab === 'modes' || (isSearching && 'modes fisheye symbol drift vinyl ipod imessage chat vhs camcorder apple sing warp vortex hero flow reel zen'.includes(query))) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" /> Kinetic Visualizer Modes
                    </h3>
                    <p className="text-xs text-white/50">
                      Choose how lyrics animate and react in real time to the vocal melody
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MODES.map((m) => {
                    const isSelected = settings.mode === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onUpdateSettings({ mode: m.id })}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 group relative overflow-hidden ${
                          isSelected
                            ? 'bg-white/20 border-white shadow-xl scale-[1.02]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                        style={
                          isSelected
                            ? {
                                boxShadow: `0 0 25px ${colors.primary}35`,
                              }
                            : {}
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{m.icon}</span>
                            <div>
                              <div className="text-sm font-bold text-white flex items-center gap-2">
                                {m.label}
                                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                              </div>
                              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                                {m.badge}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/60 mt-2.5 leading-relaxed">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COLORS & THEMES */}
            {(activeTab === 'colors' || (isSearching && 'colors theme palette dark neon amoled glow background'.includes(query))) && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-amber-400" /> 1-Click Aesthetic Theme Presets
                      </h3>
                      <p className="text-xs text-white/50">
                        Select a curated neon palette or customize exact colors below
                      </p>
                    </div>

                    <button
                      onClick={onResetToPoster}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all border border-white/10"
                      title="Sample colors from album artwork"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-300" />
                      <span>Sync to Poster</span>
                    </button>
                  </div>

                  {/* Preset Theme Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                    {PRESET_THEMES.map((theme) => {
                      const isActive =
                        colors.primary.toLowerCase() === theme.colors.primary.toLowerCase() &&
                        colors.bgDark?.toLowerCase() === theme.colors.bgDark?.toLowerCase();

                      return (
                        <button
                          key={theme.name}
                          onClick={() => onUpdateColors(theme.colors)}
                          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                            isActive
                              ? 'border-white bg-white/20 shadow-lg scale-102'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{theme.icon}</span>
                            {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>

                          <div className="text-xs font-bold text-white truncate">{theme.name}</div>

                          {/* Mini Palette preview circles */}
                          <div className="flex items-center gap-1 mt-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ background: theme.colors.primary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ background: theme.colors.secondary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                              style={{ background: theme.colors.bgDark }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Granular Custom Color Studio */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-white/70 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-rose-400" /> Custom Live Color Pickers
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Active Lyric Text Color */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-white">Active Singing Lyric Color</div>
                        <div className="text-[11px] text-white/50">Highlighted singing word</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.lyricTextColor || '#ffffff'}
                          onChange={(e) => onUpdateColors({ lyricTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-white/70 uppercase">
                          {colors.lyricTextColor || '#ffffff'}
                        </span>
                      </div>
                    </div>

                    {/* Inactive Lyric Color */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-white">Past / Unsung Lyric Color</div>
                        <div className="text-[11px] text-white/50">Dimmed inactive lyrics</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.inactiveTextColor || '#a0a0b0'}
                          onChange={(e) => onUpdateColors({ inactiveTextColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-white/70 uppercase">
                          {colors.inactiveTextColor || '#a0a0b0'}
                        </span>
                      </div>
                    </div>

                    {/* Primary Glow Color */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-white">Primary Ambient Light & Glow</div>
                        <div className="text-[11px] text-white/50">Neon halo & Lumn bias edge</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.primary}
                          onChange={(e) =>
                            onUpdateColors({
                              primary: e.target.value,
                              glow: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-white/70 uppercase">{colors.primary}</span>
                      </div>
                    </div>

                    {/* Base Background Color (AMOLED Dark) */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <div className="text-xs font-bold text-white">Base Background Dark</div>
                        <div className="text-[11px] text-white/50">Deep backdrop (#000000 for OLED)</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.bgDark || '#070514'}
                          onChange={(e) => onUpdateColors({ bgDark: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-white/70 uppercase">
                          {colors.bgDark || '#070514'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY & MOTION */}
            {(activeTab === 'typography' || (isSearching && 'typography font size scale motion rise transition'.includes(query))) && (
              <div className="space-y-6">
                {/* Font Selection */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-pink-400" /> Aesthetic Font Styles
                  </h3>
                  <p className="text-xs text-white/50">
                    Typography defines the soul and aesthetic vibe of the kinetic lyrics
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                    {FONTS.map((f) => {
                      const isSelected = settings.font === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => onUpdateSettings({ font: f.id })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/20 border-white text-white shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white/50 font-mono">{f.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <div className={`${f.fontClass} text-lg font-bold mt-1 text-white truncate`}>
                            {f.preview}
                          </div>
                          <div className="text-[11px] text-white/40 mt-1">{f.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Typography Scale */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <label className="text-xs uppercase font-mono tracking-wider text-white/70 block">
                    Display Scale & Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'normal', label: 'Normal' },
                      { id: 'large', label: 'Large' },
                      { id: 'massive', label: 'Massive' },
                      { id: 'extra-massive', label: '💻 Full Laptop Screen' },
                    ].map((sz) => {
                      const isSelected = settings.textSize === sz.id;
                      return (
                        <button
                          key={sz.id}
                          onClick={() => onUpdateSettings({ textSize: sz.id as VisualSettings['textSize'] })}
                          className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                            isSelected
                              ? 'bg-white text-black border-white shadow-lg font-bold scale-102'
                              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {sz.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Motion Transition Effects */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-white/70 flex items-center gap-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-fuchsia-400" /> Lyric Change & Motion Transition
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TRANSITIONS.map((eff) => {
                      const isSelected = settings.transitionEffect === eff.id;
                      return (
                        <button
                          key={eff.id}
                          onClick={() => onUpdateSettings({ transitionEffect: eff.id as TransitionEffect })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-md'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                          }`}
                        >
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{eff.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                          </div>
                          <div className="text-[11px] text-white/50 mt-1">{eff.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ATMOSPHERE & FX */}
            {(activeTab === 'atmosphere' || (isSearching && 'atmosphere lumn clock stardust particles glow film grain'.includes(query))) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" /> Atmosphere, Lighting & Overlay FX
                  </h3>
                  <p className="text-xs text-white/50">
                    Fine-tune ambient lighting, particle stardust, and Apple Mac lockscreen overlays
                  </p>
                </div>

                {/* Sliders Grid */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  {/* Neon Glow Intensity */}
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Neon Glow Intensity
                      </span>
                      <span className="font-mono text-white font-bold">{Math.round(settings.glowIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.0"
                      step="0.1"
                      value={settings.glowIntensity}
                      onChange={(e) => onUpdateSettings({ glowIntensity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* Stardust Particle Count */}
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1.5">
                      <span>✨ Floating Stardust Particles</span>
                      <span className="font-mono text-white font-bold">{settings.particleCount} particles</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={settings.particleCount}
                      onChange={(e) => onUpdateSettings({ particleCount: parseInt(e.target.value) })}
                      className="w-full h-1.5 cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Ambient Fluid Motion Speed */}
                  <div>
                    <div className="flex justify-between text-xs text-white/70 mb-1.5">
                      <span>🌀 Fluid Mesh Blob Speed</span>
                      <span className="font-mono text-white font-bold">{settings.ambientMotionSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.5"
                      step="0.1"
                      value={settings.ambientMotionSpeed}
                      onChange={(e) => onUpdateSettings({ ambientMotionSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 cursor-pointer accent-purple-400"
                    />
                  </div>
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <SunMedium className="w-3.5 h-3.5 text-cyan-400" /> Lumn Edge Bias Lighting
                      </div>
                      <div className="text-[11px] text-white/50">Ambient border glow reaction</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.lumnLighting}
                      onChange={(e) => onUpdateSettings({ lumnLighting: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        🕰️ Mac Lock Screen Clock
                      </div>
                      <div className="text-[11px] text-white/50">Verci signature lock overlay</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showLockScreenClock}
                      onChange={(e) => onUpdateSettings({ showLockScreenClock: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" /> Audio Reactive Pulse
                      </div>
                      <div className="text-[11px] text-white/50">Canvas pulses with beat</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.audioReactive}
                      onChange={(e) => onUpdateSettings({ audioReactive: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white">🎬 Film Grain Texture</div>
                      <div className="text-[11px] text-white/50">Cinematic analog grain</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showFilmGrain}
                      onChange={(e) => onUpdateSettings({ showFilmGrain: e.target.checked })}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: AUDIO & PLAYBACK */}
            {(activeTab === 'audio' || (isSearching && 'audio playback speed volume sound equalizer next line'.includes(query))) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" /> Audio & Playback Engine
                  </h3>
                  <p className="text-xs text-white/50">
                    Scrubbing speed, volume modulation, and background audio settings
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  {/* Playback Speed */}
                  <div>
                    <label className="text-xs uppercase font-mono text-white/70 block mb-2">
                      Playback Rate
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => onPlaybackRateChange(rate)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            playbackRate === rate
                              ? 'bg-white text-black border-white shadow-lg'
                              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs text-white/70 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-white/80" /> Volume
                      </span>
                      <span className="font-mono text-white font-bold">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1.5 cursor-pointer accent-white"
                    />
                  </div>
                </div>

                {/* Additional Audio Toggles */}
                <div className="space-y-2.5">
                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5 text-cyan-400" /> Equalizer Wave in Background
                      </div>
                      <div className="text-[11px] text-white/50">Visual audio frequency wave bars</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showVisualizerBars}
                      onChange={(e) => onUpdateSettings({ showVisualizerBars: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-white">🔮 Show Upcoming Next Line Preview</div>
                      <div className="text-[11px] text-white/50">Displays capsule preview of next sentence</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showNextLinePreview}
                      onChange={(e) => onUpdateSettings({ showNextLinePreview: e.target.checked })}
                      className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 6: TOOLS & IMPORTER */}
            {(activeTab === 'tools' || (isSearching && 'tools import link studio upload song library'.includes(query))) && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-fuchsia-400" /> Song Library & Creation Tools
                  </h3>
                  <p className="text-xs text-white/50">
                    Import links from YouTube Music & Spotify or synchronize custom lyrics
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Link Importer */}
                  <div
                    onClick={() => {
                      onClose();
                      onOpenLinkImporter();
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-900/30 to-pink-900/30 border border-fuchsia-500/30 hover:border-fuchsia-400/60 cursor-pointer transition-all hover:scale-102 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-3 text-fuchsia-400 group-hover:scale-110 transition-transform">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Paste Song Link</h4>
                    <p className="text-xs text-white/60 mt-1">
                      Extract audio & synced lyrics from YouTube Music, Spotify & YouTube.
                    </p>
                  </div>

                  {/* Custom Studio & Tap-to-Sync */}
                  <div
                    onClick={() => {
                      onClose();
                      onOpenStudio();
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer transition-all hover:scale-102 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Tap-to-Sync Studio</h4>
                    <p className="text-xs text-white/60 mt-1">
                      Record exact word-by-word timestamps in real time with your spacebar.
                    </p>
                  </div>

                  {/* Track Library */}
                  <div
                    onClick={() => {
                      onClose();
                      onOpenSongList();
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all hover:scale-102 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Song Library</h4>
                    <p className="text-xs text-white/60 mt-1">
                      Browse and switch between all loaded and custom tracks.
                    </p>
                  </div>
                </div>

                {/* Current Song & Instant Share Link Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-neutral-900/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                    <img
                      src={currentSong.coverUrl}
                      alt={currentSong.title}
                      className="w-14 h-14 rounded-xl object-cover shadow-md border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-purple-300 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-300" /> Share Current Visualizer
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
                      <p className="text-xs text-white/60 truncate">{currentSong.artist}</p>
                    </div>
                  </div>

                  {onShareVisualizer && (
                    <button
                      onClick={onShareVisualizer}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all hover:scale-102 shrink-0"
                      title="Copy instant shareable visualizer link with current theme and style"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Copy Share Link</span>
                    </button>
                  )}
                </div>

                {/* Persistent Storage & Cloud Backup Manager */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white">Browser Storage & Library Backup</h4>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800">
                      IndexedDB Persistent
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Custom songs, audio uploads, and theme palettes are stored safely on your device. You can download a JSON backup file or restore songs anytime.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {onExportLibrary && (
                      <button
                        onClick={onExportLibrary}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>Export Backup (JSON)</span>
                      </button>
                    )}

                    {onImportLibrary && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 transition-all"
                        >
                          <Upload className="w-4 h-4 text-fuchsia-400" />
                          <span>Import Backup</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const content = evt.target?.result as string;
                              if (content && onImportLibrary) {
                                onImportLibrary(content);
                              }
                            };
                            reader.readAsText(file);
                            e.target.value = '';
                          }}
                          accept=".json,application/json"
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="text-xs text-white/40 font-mono hidden sm:block">
            Changes apply instantly to live lyrics
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl font-semibold text-xs bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

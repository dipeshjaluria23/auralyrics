import React from 'react';
import type { ThemeColors } from '../types/lyrics';
import { X, Palette, Sparkles, RefreshCw, Check, SunMedium } from 'lucide-react';

interface ThemeColorModalProps {
  isOpen: boolean;
  colors: ThemeColors;
  currentSongTitle: string;
  onClose: () => void;
  onUpdateColors: (newColors: Partial<ThemeColors>) => void;
  onResetToPoster: () => void;
}

export const ThemeColorModal: React.FC<ThemeColorModalProps> = ({
  isOpen,
  colors,
  currentSongTitle,
  onClose,
  onUpdateColors,
  onResetToPoster,
}) => {
  if (!isOpen) return null;

  // Preset Color Palettes
  const PRESET_THEMES: {
    name: string;
    icon: string;
    colors: ThemeColors;
  }[] = [
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
        secondary: '#38bdf8',
        tertiary: '#c084fc',
        bgDark: '#090a18',
        glow: 'rgba(244, 114, 182, 0.85)',
        accent: '#fb7185',
        lyricTextColor: '#fbcfe8',
        inactiveTextColor: 'rgba(251, 207, 232, 0.35)',
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
        bgDark: '#140505',
        glow: 'rgba(239, 68, 68, 0.85)',
        accent: '#f87171',
        lyricTextColor: '#fecaca',
        inactiveTextColor: 'rgba(254, 202, 202, 0.35)',
        autoPosterSync: false,
      },
    },
    {
      name: 'Glacier Arctic',
      icon: '🧊',
      colors: {
        primary: '#38bdf8',
        secondary: '#818cf8',
        tertiary: '#2dd4bf',
        bgDark: '#040a14',
        glow: 'rgba(56, 189, 248, 0.85)',
        accent: '#7dd3fc',
        lyricTextColor: '#bae6fd',
        inactiveTextColor: 'rgba(186, 230, 253, 0.35)',
        autoPosterSync: false,
      },
    },
  ];

  // Quick Swatches for Lyric Colors
  const LYRIC_SWATCHES = [
    '#ffffff', // Pure White
    '#ff2a85', // Hot Pink
    '#00f0ff', // Cyber Cyan
    '#10b981', // Emerald Mint
    '#f59e0b', // Amber Gold
    '#a855f7', // Electric Violet
    '#ef4444', // Neon Red
    '#38bdf8', // Sky Blue
    '#facc15', // Neon Yellow
  ];

  const BASE_BG_SWATCHES = [
    '#000000', // AMOLED Pitch Black
    '#070514', // Deep Cyber Indigo
    '#030712', // Midnight Navy
    '#020f09', // Deep Forest Night
    '#140505', // Smoked Crimson
    '#0a0a0f', // Minimal Obsidian
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
      <div
        className="w-full max-w-xl max-h-[92vh] bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 35px ${colors.primary}35`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: colors.primary }}
            >
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                Lyric & Background Color Studio
              </h2>
              <p className="text-[11px] text-white/50">
                Customize singing words, glow halos, and fluid aura mesh colors
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          {/* Auto Poster Sync Action */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Auto Poster Palette Sync
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">
                Extract dynamic hues from "{currentSongTitle}"
              </div>
            </div>
            <button
              onClick={onResetToPoster}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
            >
              <RefreshCw className="w-3.5 h-3.5 text-fuchsia-400" /> Sync from Poster
            </button>
          </div>

          {/* 1-Click Aesthetic Preset Palettes */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-2.5">
              Curated Aesthetic Themes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_THEMES.map((theme, idx) => (
                <button
                  key={idx}
                  onClick={() => onUpdateColors(theme.colors)}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-left transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm">{theme.icon}</span>
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.colors.primary }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: theme.colors.secondary }} />
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 1: LYRIC TEXT COLORS */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-fuchsia-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                1. Lyric Typography Colors
              </h3>
            </div>

            {/* Active / Singing Word Color */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Active Singing Word Color</span>
                <span className="font-mono text-white/50">
                  {colors.lyricTextColor || colors.accent || '#ffffff'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.lyricTextColor || colors.accent || '#ffffff'}
                  onChange={(e) => onUpdateColors({ lyricTextColor: e.target.value, autoPosterSync: false })}
                  className="w-10 h-9 rounded-xl bg-transparent cursor-pointer border border-white/20 p-0.5"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {LYRIC_SWATCHES.map((hex, i) => (
                    <button
                      key={i}
                      onClick={() => onUpdateColors({ lyricTextColor: hex, autoPosterSync: false })}
                      className="w-6 h-6 rounded-full border border-white/20 hover:scale-120 transition-transform shadow"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Glow / Halo Color */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Glow Halo Color</span>
                <span className="font-mono text-white/50">{colors.primary}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.primary.startsWith('#') ? colors.primary : '#ec4899'}
                  onChange={(e) => onUpdateColors({
                    primary: e.target.value,
                    glow: `rgba(${parseInt(e.target.value.slice(1,3),16)},${parseInt(e.target.value.slice(3,5),16)},${parseInt(e.target.value.slice(5,7),16)},0.85)`,
                    autoPosterSync: false,
                  })}
                  className="w-10 h-9 rounded-xl bg-transparent cursor-pointer border border-white/20 p-0.5"
                />
                <span className="text-xs text-white/40">Select color for the text halo & fluid lighting</span>
              </div>
            </div>

            {/* Inactive Word Color */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Surrounding / Past Words Color</span>
                <span className="font-mono text-white/50">{colors.inactiveTextColor || 'rgba(255,255,255,0.4)'}</span>
              </div>
              <div className="flex gap-2">
                {[
                  { label: 'White Dim', val: 'rgba(255, 255, 255, 0.4)' },
                  { label: 'Soft Slate', val: 'rgba(148, 163, 184, 0.5)' },
                  { label: 'Tinted Primary', val: `${colors.primary}66` },
                  { label: 'Deep Dim', val: 'rgba(255, 255, 255, 0.18)' },
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateColors({ inactiveTextColor: preset.val, autoPosterSync: false })}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/80 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: BACKGROUND FLUID MESH COLORS */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                2. Dynamic Background & Fluid Mesh Colors
              </h3>
            </div>

            {/* Fluid Blobs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Blob 1 (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.primary.startsWith('#') ? colors.primary : '#ff2a85'}
                    onChange={(e) => onUpdateColors({ primary: e.target.value, autoPosterSync: false })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 p-0.5"
                  />
                  <span className="text-xs font-mono text-white/70">{colors.primary}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/60 block mb-1">Blob 2 (Secondary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.secondary.startsWith('#') ? colors.secondary : '#00f0ff'}
                    onChange={(e) => onUpdateColors({ secondary: e.target.value, autoPosterSync: false })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 p-0.5"
                  />
                  <span className="text-xs font-mono text-white/70">{colors.secondary}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/60 block mb-1">Blob 3 (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.tertiary.startsWith('#') ? colors.tertiary : '#7928ca'}
                    onChange={(e) => onUpdateColors({ tertiary: e.target.value, autoPosterSync: false })}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 p-0.5"
                  />
                  <span className="text-xs font-mono text-white/70">{colors.tertiary}</span>
                </div>
              </div>
            </div>

            {/* Base Background Tone */}
            <div className="pt-2">
              <label className="text-[11px] text-white/60 block mb-1.5">
                Base Background Dark Tone
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors.bgDark.startsWith('#') ? colors.bgDark : '#05050a'}
                  onChange={(e) => onUpdateColors({ bgDark: e.target.value, autoPosterSync: false })}
                  className="w-10 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20 p-0.5"
                />
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {BASE_BG_SWATCHES.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => onUpdateColors({ bgDark: hex, autoPosterSync: false })}
                      className="w-6 h-6 rounded-md border border-white/20 hover:scale-115 transition-transform"
                      style={{ background: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">
            Changes apply instantly to live lyrics and background
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Done
          </button>
        </div>
      </div>
    </div>
  );
};

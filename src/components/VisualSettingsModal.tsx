import React from 'react';
import type { FontStyle, ThemeColors, TransitionEffect, VisualSettings, VisualizerMode } from '../types/lyrics';
import { X, Sliders, Type, Sparkles, Activity, Eye, Disc, ArrowUpCircle } from 'lucide-react';



interface VisualSettingsModalProps {
  isOpen: boolean;
  settings: VisualSettings;
  colors: ThemeColors;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<VisualSettings>) => void;
}

export const VisualSettingsModal: React.FC<VisualSettingsModalProps> = ({
  isOpen,
  settings,
  colors,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const fontOptions: { id: FontStyle; name: string; preview: string; fontClass: string }[] = [
    { id: 'syne', name: 'Syne (Punchy Display)', preview: 'Electric Vibes', fontClass: 'font-syne' },
    { id: 'orbitron', name: 'Orbitron (Cyberpunk)', preview: 'CYBERPULSE', fontClass: 'font-orbitron' },
    { id: 'playfair', name: 'Playfair (Aesthetic Serif)', preview: 'Velvet Dreams', fontClass: 'font-playfair' },
    { id: 'outfit', name: 'Outfit (Modern Geometric)', preview: 'Midnight Horizon', fontClass: 'font-outfit' },
    { id: 'cinzel', name: 'Cinzel (Cinematic Luxury)', preview: 'ETHEREAL LIGHT', fontClass: 'font-cinzel' },
    { id: 'space', name: 'Space Grotesk (Tech Sans)', preview: 'Digital Horizon', fontClass: 'font-space' },
    { id: 'cormorant', name: 'Cormorant (Ethereal Classic)', preview: 'Soft Whispers', fontClass: 'font-cormorant' },
  ];

  const modes: { id: VisualizerMode; label: string; desc: string }[] = [
    { id: 'fisheye', label: '👁️ Verci Convex Lens', desc: 'Signature 3D lock screen lens shader with active word closest to glass' },
    { id: 'visual-symbols', label: '🎨 Verci Visual Icons', desc: 'Matched aesthetic SF symbols and emojis pop beside lyrics' },
    { id: 'ship-3d', label: '🚀 Verci 3D Drift Wall', desc: 'Floating 3D depth wall drifting through vertical space' },
    { id: 'hero-word', label: '✨ Hero Word Focus', desc: 'Single word glowing center stage with smooth blur trails' },
    { id: 'kinetic-flow', label: '🌊 Kinetic Flow', desc: 'Full active lyric line with word-by-word highlighted bounce' },
    { id: 'reel-pop', label: '⚡ Reel Kinetic Pop', desc: 'Modern TikTok/Reel punchy kinetic typography cards' },
    { id: 'minimal-zen', label: '🌿 Minimal Zen', desc: 'Clean editorial line layout with high contrast focus' },
  ];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-neutral-950/95 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${colors.primary}25`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-lg font-bold text-white tracking-wide">Aesthetic & Visualizer Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Visualizer Mode */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-mono flex items-center gap-1.5 mb-3">
              <Eye className="w-3.5 h-3.5" /> Visualizer Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {modes.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onUpdateSettings({ mode: m.id })}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all ${
                    settings.mode === m.id
                      ? 'bg-white/20 border-white shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-sm text-white">{m.label}</div>
                  <div className="text-xs text-white/50 mt-1 leading-relaxed">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Font Picker */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-mono flex items-center gap-1.5 mb-3">
              <Type className="w-3.5 h-3.5" /> Typography Font
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ font: f.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.font === f.id
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="text-xs text-white/50">{f.name}</div>
                  <div className={`${f.fontClass} text-base font-bold mt-0.5 text-white truncate`}>
                    {f.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Size */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-mono mb-2 block">
              Typography Scale
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Large' },
                { id: 'massive', label: 'Massive' },
                { id: 'extra-massive', label: '💻 Full Laptop Screen' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => onUpdateSettings({ textSize: sz.id as VisualSettings['textSize'] })}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                    settings.textSize === sz.id
                      ? 'bg-white text-black border-white shadow-lg font-bold scale-102'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lyric Change & Motion Transition Effect */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 font-mono flex items-center gap-1.5 mb-2.5">
              <ArrowUpCircle className="w-3.5 h-3.5 text-fuchsia-400" /> Lyric Change & Rising Motion Effect
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rise-up', label: '⬆️ Smooth Rise Up', desc: 'Glides up with motion blur' },
                { id: 'kinetic-pop', label: '⚡ Kinetic Pop Up', desc: 'Punchy upward pop & bounce' },
                { id: 'flip-rise', label: '🎲 3D Flip Rise', desc: '3D perspective upward tilt' },
                { id: 'glow-float', label: '🔮 Floating Glow Up', desc: 'Luminous upward halo glide' },
              ].map((eff) => (
                <button
                  key={eff.id}
                  onClick={() => onUpdateSettings({ transitionEffect: eff.id as TransitionEffect })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    settings.transitionEffect === eff.id
                      ? 'bg-fuchsia-500/20 border-fuchsia-400 text-white shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{eff.label}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">{eff.desc}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Sliders Section */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            {/* Glow Intensity */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Neon Glow Intensity
                </span>
                <span className="font-mono">{Math.round(settings.glowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={settings.glowIntensity}
                onChange={(e) => onUpdateSettings({ glowIntensity: parseFloat(e.target.value) })}
                className="w-full h-1.5 cursor-pointer"
              />
            </div>

            {/* Particle Stardust Count */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>✨ Floating Stardust Particles</span>
                <span className="font-mono">{settings.particleCount}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.particleCount}
                onChange={(e) => onUpdateSettings({ particleCount: parseInt(e.target.value) })}
                className="w-full h-1.5 cursor-pointer"
              />
            </div>

            {/* Ambient Motion Speed */}
            <div>
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>🌀 Ambient Fluid Mesh Speed</span>
                <span className="font-mono">{settings.ambientMotionSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={settings.ambientMotionSpeed}
                onChange={(e) => onUpdateSettings({ ambientMotionSpeed: parseFloat(e.target.value) })}
                className="w-full h-1.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Audio-Reactive Pulse Effect
              </span>
              <input
                type="checkbox"
                checked={settings.audioReactive}
                onChange={(e) => onUpdateSettings({ audioReactive: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80 flex items-center gap-2">
                <Disc className="w-4 h-4 text-cyan-400" /> Equalizer Wave in Background
              </span>
              <input
                type="checkbox"
                checked={settings.showVisualizerBars}
                onChange={(e) => onUpdateSettings({ showVisualizerBars: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80">🎬 Film Grain Texture Overlay</span>
              <input
                type="checkbox"
                checked={settings.showFilmGrain}
                onChange={(e) => onUpdateSettings({ showFilmGrain: e.target.checked })}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80">🕰️ Mac Lock Screen Clock Overlay (Verci Setup)</span>
              <input
                type="checkbox"
                checked={settings.showLockScreenClock}
                onChange={(e) => onUpdateSettings({ showLockScreenClock: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80">💡 Lumn-Style Ambient Edge Backlight</span>
              <input
                type="checkbox"
                checked={settings.lumnLighting}
                onChange={(e) => onUpdateSettings({ lumnLighting: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white/5">
              <span className="text-xs text-white/80">🔮 Show Next Line Preview</span>
              <input
                type="checkbox"
                checked={settings.showNextLinePreview}
                onChange={(e) => onUpdateSettings({ showNextLinePreview: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </label>

          </div>
        </div>

        {/* Done Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

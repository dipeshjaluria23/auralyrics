import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import type { ThemeColors } from '../types/lyrics';

interface ShortcutsModalProps {
  isOpen: boolean;
  colors: ThemeColors;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  colors,
  onClose,
}) => {
  if (!isOpen) return null;

  const SHORTCUT_CATEGORIES = [
    {
      title: 'Playback & Scrubber',
      shortcuts: [
        { key: 'Space', desc: 'Play / Pause audio playback' },
        { key: '← / →', desc: 'Seek 5 seconds backward / forward' },
        { key: '↑ / ↓', desc: 'Increase / decrease volume (5%)' },
        { key: 'M', desc: 'Mute / unmute audio' },
        { key: 'R', desc: 'Restart track from 0:00' },
        { key: 'N', desc: 'Skip to next song' },
        { key: 'P', desc: 'Skip to previous song' },
      ],
    },
    {
      title: 'Aesthetic Visualizer Modes',
      shortcuts: [
        { key: '1', desc: '👁️ Verci Convex Fisheye Lens' },
        { key: '2', desc: '🎨 Verci Visual Symbols & Emojis' },
        { key: '3', desc: '🚀 Verci 3D Drift Wall' },
        { key: '4', desc: '💿 Vinyl Turntable & Grooves' },
        { key: '5', desc: '📱 Retro iPod Classic' },
        { key: '6', desc: '💬 iMessage Chat Bubbles' },
        { key: '7', desc: '📼 90s VHS Camcorder HUD' },
        { key: '8', desc: '🎤 Apple Music Sing Spotlight' },
        { key: '9', desc: '🌀 Hyperspace Warp Zoom' },
        { key: '0', desc: '✨ Hero Single Word Focus' },
      ],
    },
    {
      title: 'Tools & Studio Panes',
      shortcuts: [
        { key: 'F', desc: '⛶ Toggle Fullscreen Zen Mode' },
        { key: 'C', desc: '🎨 Open Color & Theme Studio' },
        { key: 'S', desc: '⚙️ Open Master Control Center' },
        { key: 'L', desc: '🔗 Open Paste Song Link Importer' },
        { key: 'T', desc: '🎙️ Open Tap-to-Sync Song Studio' },
        { key: 'B', desc: '📁 Open Song Library Drawer' },
        { key: '?', desc: '⌨️ Show this Keyboard Shortcuts HUD' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-2xl bg-neutral-950/95 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white"
        style={{
          boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 35px ${colors.primary}30`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center glass-panel shadow-md"
              style={{ background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}40)` }}
            >
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide font-syne flex items-center gap-2">
                Pro Keyboard DJ Shortcuts
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                  Hotkeys
                </span>
              </h2>
              <p className="text-xs text-white/50">Control lyrics playback and switch visual modes seamlessly with your keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Shortcut Cards */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div key={cat.title} className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                {cat.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xs text-white/80">{sc.desc}</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 text-xs font-mono font-bold text-white shadow-inner flex-shrink-0 ml-2">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40 font-mono">Press Esc or click Done to close</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-semibold text-xs bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

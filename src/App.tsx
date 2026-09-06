import { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_SONGS } from './data/demoSongs';
import type { Song, ThemeColors, VisualSettings, VisualizerMode } from './types/lyrics';

import { extractPaletteFromImage } from './utils/colorExtractor';
import { audioEngine } from './utils/audioSynth';
import { ytAudio } from './utils/youtubePlayer';
import { AestheticBackground } from './components/AestheticBackground';
import { WordVisualizer } from './components/WordVisualizer';
import { PlayerControls } from './components/PlayerControls';
import { SongListDrawer } from './components/SongListDrawer';
import { SongStudioModal } from './components/SongStudioModal';
import { LinkImporterModal } from './components/LinkImporterModal';
import { ControlCenterModal, type ControlCenterTab } from './components/ControlCenterModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Sparkles, Sliders, Link as LinkIcon, Palette, Keyboard, Share2 } from 'lucide-react';
import {
  saveCustomSong,
  loadCustomSongs,
  deleteCustomSong as deleteStoredSong,
  saveVisualSettings,
  loadVisualSettings,
  saveThemeColors,
  loadThemeColors,
  saveLastSongId,
  loadLastSongId,
  exportLibraryJSON,
  importLibraryJSON,
} from './utils/storage';
import { generateShareUrl, decodeSharePayload } from './utils/shareEncoder';

export function App() {
  const [songs, setSongs] = useState<Song[]>(DEMO_SONGS);
  const [currentSong, setCurrentSong] = useState<Song>(DEMO_SONGS[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.75);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Dynamic Theme Colors
  const [colors, setColors] = useState<ThemeColors>(() =>
    loadThemeColors(
      (DEMO_SONGS[0].customColors as ThemeColors) || {
        primary: '#ff2a85',
        secondary: '#00f0ff',
        tertiary: '#7928ca',
        bgDark: '#070514',
        glow: 'rgba(255, 42, 133, 0.85)',
        accent: '#ff007f',
        lyricTextColor: '#ffffff',
        inactiveTextColor: 'rgba(255, 255, 255, 0.35)',
        autoPosterSync: true,
      }
    )
  );

  // Visualizer Settings (Verci + Lumn lighting defaults)
  const [settings, setSettings] = useState<VisualSettings>(() =>
    loadVisualSettings({
      mode: 'fisheye',
      font: 'syne',
      glowIntensity: 1.3,
      particleCount: 40,
      ambientMotionSpeed: 1.0,
      audioReactive: true,
      showFilmGrain: true,
      showVisualizerBars: true,
      showNextLinePreview: true,
      textSize: 'extra-massive',
      transitionEffect: 'rise-up',
      showLockScreenClock: true,
      lumnLighting: true,
      visualIcons: true,
    })
  );

  // UI Modals & Drawers
  const [isSongListOpen, setIsSongListOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [controlCenterTab, setControlCenterTab] = useState<ControlCenterTab>('modes');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isLinkImporterOpen, setIsLinkImporterOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const openControlCenter = (tab: ControlCenterTab = 'modes') => {
    setControlCenterTab(tab);
    setIsControlCenterOpen(true);
  };

  // Live Mac Lockscreen Clock
  const [lockTime, setLockTime] = useState({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
  });

  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setLockTime({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        date: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
      });
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);


  // Load custom songs from IndexedDB on startup & check shared URL
  useEffect(() => {
    let isMounted = true;

    // Check URL hash for shared visualizer
    if (window.location.hash && window.location.hash.startsWith('#share=')) {
      const shared = decodeSharePayload(window.location.hash);
      if (shared && shared.song) {
        const sharedSong: Song = { ...shared.song, isCustom: true };
        setSongs((prev) => {
          const exists = prev.some((s) => s.id === sharedSong.id);
          return exists ? prev : [sharedSong, ...prev];
        });
        setCurrentSong(sharedSong);
        if (shared.colors) {
          setColors((c) => ({ ...c, ...shared.colors }));
        }
        if (shared.mode) {
          const validMode = shared.mode;
          setSettings((s) => ({ ...s, mode: validMode }));
        }
        saveCustomSong(sharedSong);
        showToast(`✨ Loaded shared visualizer: "${sharedSong.title}"!`);
        return;
      }
    }

    // Load custom songs from IndexedDB
    loadCustomSongs().then((savedSongs) => {
      if (isMounted && savedSongs.length > 0) {
        setSongs((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newUnique = savedSongs.filter((s) => !existingIds.has(s.id));
          return [...newUnique, ...prev];
        });

        // Restore last played song if exists
        const lastId = loadLastSongId();
        if (lastId) {
          const found = savedSongs.find((s) => s.id === lastId);
          if (found) setCurrentSong(found);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save settings & theme colors to LocalStorage
  useEffect(() => {
    saveVisualSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveThemeColors(colors);
  }, [colors]);

  useEffect(() => {
    if (currentSong?.id) {
      saveLastSongId(currentSong.id);
    }
  }, [currentSong]);

  const idleTimerRef = useRef<number | null>(null);
  const playbackRafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);

  // Extract colors when song changes
  useEffect(() => {
    let isMounted = true;

    if (currentSong.customColors && currentSong.customColors.primary) {
      setColors(currentSong.customColors as ThemeColors);
    }

    extractPaletteFromImage(currentSong.coverUrl).then((palette) => {
      if (isMounted) {
        setColors((prev) => ({
          ...prev,
          ...palette,
          ...(currentSong.customColors || {}),
        }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentSong]);

  // Audio Playback Engine Sync
  useEffect(() => {
    if (isPlaying) {
      audioEngine.init();
      audioEngine.resumeAudioContext();

      if (currentSong.youtubeVideoId) {
        audioEngine.stopSynth();
        audioEngine.pauseCustomAudio();
        ytAudio.loadVideo(currentSong.youtubeVideoId, currentTime);
        ytAudio.play();
        ytAudio.setVolume(volume);
      } else if (currentSong.audioUrl) {
        audioEngine.playCustomAudio(currentSong.audioUrl, currentTime, playbackRate);
      } else {
        // Synthesizer track vibe mapping
        const trackType = currentSong.id.includes('lofi')
          ? 'lofi'
          : currentSong.id.includes('cyber')
          ? 'cyberpunk'
          : currentSong.id.includes('pastel')
          ? 'pastel'
          : 'synthwave';
        audioEngine.startSynth(trackType, currentSong.bpm || 110);
      }

      startTimeRef.current = performance.now() - (currentTime * 1000) / playbackRate;

      const loop = () => {
        if (currentSong.youtubeVideoId) {
          const ytTime = ytAudio.getCurrentTime();
          if (ytTime > 0) {
            setCurrentTime(ytTime);
          } else {
            const now = performance.now();
            const elapsed = ((now - startTimeRef.current) * playbackRate) / 1000;
            setCurrentTime(elapsed);
          }
        } else {
          const now = performance.now();
          const elapsed = ((now - startTimeRef.current) * playbackRate) / 1000;

          if (elapsed >= currentSong.duration) {
            handleNextTrack();
            return;
          } else {
            setCurrentTime(elapsed);

            // Real-Time Vocal Singing Voice Synchronization (Apple Music Sing Vocal Bus)
            if (!currentSong.youtubeVideoId && !currentSong.audioUrl && currentSong.lyrics) {
              for (let l = 0; l < currentSong.lyrics.length; l++) {
                const line = currentSong.lyrics[l];
                if (elapsed >= line.startTime && elapsed <= line.endTime) {
                  for (let w = 0; w < line.words.length; w++) {
                    const word = line.words[w];
                    if (elapsed >= word.startTime && elapsed <= word.endTime) {
                      audioEngine.syncSingingWord(word.text, word.endTime - word.startTime, currentSong.id, w);
                      break;
                    }
                  }
                  break;
                }
              }
            }
          }
        }

        playbackRafRef.current = requestAnimationFrame(loop);
      };

      playbackRafRef.current = requestAnimationFrame(loop);
    } else {
      if (playbackRafRef.current) {
        cancelAnimationFrame(playbackRafRef.current);
      }
      if (currentSong.youtubeVideoId) {
        ytAudio.pause();
      } else if (currentSong.audioUrl) {
        audioEngine.pauseCustomAudio();
      } else {
        audioEngine.stopSynth();
      }
      pausedAtRef.current = currentTime;
    }

    return () => {
      if (playbackRafRef.current) {
        cancelAnimationFrame(playbackRafRef.current);
      }
    };
  }, [isPlaying, currentSong, playbackRate]);

  // Volume synchronization
  useEffect(() => {
    audioEngine.setVolume(volume);
    ytAudio.setVolume(volume);
  }, [volume]);


  // Handle Seeking
  const handleSeek = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(currentSong.duration, time));
      setCurrentTime(clampedTime);
      startTimeRef.current = performance.now() - (clampedTime * 1000) / playbackRate;

      if (currentSong.youtubeVideoId) {
        ytAudio.seekTo(clampedTime);
      } else if (currentSong.audioUrl) {
        audioEngine.seekCustomAudio(clampedTime);
      }
    },
    [currentSong, playbackRate]
  );

  // Play / Pause Toggle
  const handlePlayPause = () => {
    audioEngine.init();
    audioEngine.resumeAudioContext();
    setIsPlaying((prev) => !prev);
  };

  // Next / Prev Track
  const handleNextTrack = () => {
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    if (currentTime > 3) {
      handleSeek(0);
      return;
    }
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setCurrentTime(0);
  };

  // Switch Visualizer Mode
  const handleModeChange = (mode: VisualizerMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  };

  // Add custom song from Studio / Link Importer & persist in IndexedDB
  const handleSaveCustomSong = async (newSong: Song) => {
    const customSong = { ...newSong, isCustom: true };
    await saveCustomSong(customSong);
    setSongs((prev) => [customSong, ...prev.filter((s) => s.id !== customSong.id)]);
    setCurrentSong(customSong);
    setCurrentTime(0);
    setIsPlaying(true);
    showToast(`💾 Saved "${customSong.title}" to persistent library!`);
  };

  // Delete custom song from library & IndexedDB
  const handleDeleteSong = async (songId: string) => {
    await deleteStoredSong(songId);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    if (currentSong.id === songId) {
      setCurrentSong(DEMO_SONGS[0]);
      setCurrentTime(0);
    }
    showToast('🗑️ Song removed from library');
  };

  // Instant Shareable Visualizer Link Generator
  const handleShareVisualizer = (targetSong: Song = currentSong) => {
    const shareUrl = generateShareUrl({
      song: targetSong,
      colors,
      mode: settings.mode,
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showToast('🔗 Shareable visualizer link copied to clipboard!');
        })
        .catch(() => {
          window.prompt('Copy your shareable visualizer link:', shareUrl);
        });
    } else {
      window.prompt('Copy your shareable visualizer link:', shareUrl);
    }
  };

  // Export full custom library as JSON
  const handleExportLibrary = async () => {
    const json = await exportLibraryJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auralyrics-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Exported library backup JSON!');
  };

  // Import custom library from JSON
  const handleImportLibrary = async (jsonString: string) => {
    try {
      const imported = await importLibraryJSON(jsonString);
      setSongs((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newUnique = imported.filter((s) => !existingIds.has(s.id));
        return [...newUnique, ...prev];
      });
      showToast(`✨ Successfully imported ${imported.length} custom songs!`);
    } catch {
      showToast('❌ Invalid library JSON file');
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Global Pro Keyboard DJ Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Safeguard: ignore if user is currently typing in an input, textarea, or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(currentSong.duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, Math.round((v + 0.05) * 100) / 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, Math.round((v - 0.05) * 100) / 100));
          break;
        case 'KeyM':
          e.preventDefault();
          setVolume((v) => (v > 0 ? 0 : 0.75));
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyC':
          e.preventDefault();
          openControlCenter('colors');
          break;
        case 'KeyS':
          e.preventDefault();
          openControlCenter('modes');
          break;
        case 'KeyL':
          e.preventDefault();
          setIsLinkImporterOpen(true);
          break;
        case 'KeyT':
          e.preventDefault();
          setIsStudioOpen(true);
          break;
        case 'KeyB':
        case 'KeyO':
          e.preventDefault();
          setIsSongListOpen(true);
          break;
        case 'KeyR':
          e.preventDefault();
          handleSeek(0);
          break;
        case 'KeyN':
          e.preventDefault();
          handleNextTrack();
          break;
        case 'KeyP':
          e.preventDefault();
          handlePrevTrack();
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setIsShortcutsOpen((prev) => !prev);
          }
          break;
        case 'Digit1':
          setSettings((prev) => ({ ...prev, mode: 'fisheye' }));
          break;
        case 'Digit2':
          setSettings((prev) => ({ ...prev, mode: 'visual-symbols' }));
          break;
        case 'Digit3':
          setSettings((prev) => ({ ...prev, mode: 'ship-3d' }));
          break;
        case 'Digit4':
          setSettings((prev) => ({ ...prev, mode: 'vinyl-spin' }));
          break;
        case 'Digit5':
          setSettings((prev) => ({ ...prev, mode: 'retro-ipod' }));
          break;
        case 'Digit6':
          setSettings((prev) => ({ ...prev, mode: 'imessage-bubbles' }));
          break;
        case 'Digit7':
          setSettings((prev) => ({ ...prev, mode: 'vhs-camcorder' }));
          break;
        case 'Digit8':
          setSettings((prev) => ({ ...prev, mode: 'apple-sing' }));
          break;
        case 'Digit9':
          setSettings((prev) => ({ ...prev, mode: 'vortex-zoom' }));
          break;
        case 'Digit0':
          setSettings((prev) => ({ ...prev, mode: 'hero-word' }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, currentSong.duration, isPlaying, handlePlayPause, handleSeek, handleNextTrack, handlePrevTrack]);

  // Reset theme colors to match current song poster
  const handleResetToPoster = async () => {
    const palette = await extractPaletteFromImage(currentSong.coverUrl);
    setColors({
      ...palette,
      lyricTextColor: '#ffffff',
      inactiveTextColor: 'rgba(255, 255, 255, 0.35)',
      autoPosterSync: true,
    });
  };

  // Idle detection for Zen Mode (auto-hide controls on mouse idle)
  const handleMouseMove = () => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setIsIdle(true);
      }
    }, 4000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isPlaying]);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-white transition-colors duration-700"
      style={{
        '--glow-color': colors.glow,
      } as React.CSSProperties}
    >
      {/* Layered Dynamic Canvas & Poster Backdrop Background */}
      <AestheticBackground
        colors={colors}
        coverUrl={currentSong.coverUrl}
        settings={settings}
        isPlaying={isPlaying}
      />

      {/* Top Navigation Bar */}
      <header
        className={`w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-30 transition-opacity duration-500 ${
          isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center glass-panel box-glow shadow-lg cursor-pointer"
            style={{ '--glow-color': colors.primary } as React.CSSProperties}
            onClick={() => openControlCenter('modes')}
            title="Open Control Center"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-syne">
              AURA<span style={{ color: colors.primary }}>LYRICS</span>
            </h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase font-mono">
              Word-By-Word Kinetic Visualizer
            </p>
          </div>
        </div>

        {/* Center Now-Playing Track Capsule */}
        <button
          onClick={() => setIsSongListOpen(true)}
          className="glass-button px-4 py-1.5 rounded-full hidden md:flex items-center gap-2.5 text-xs font-medium text-white/90 hover:text-white border border-white/15 bg-white/5 hover:bg-white/10 shadow-lg transition-all hover:scale-102 group max-w-xs lg:max-w-md"
          title="Click to browse Song Library"
        >
          <div className="relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0 border border-white/20">
            <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-white truncate">{currentSong.title}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/60 truncate">{currentSong.artist}</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 group-hover:text-white flex-shrink-0">
            Library
          </span>
        </button>

        {/* Header Action Badges */}
        <div className="flex items-center gap-2">
          {/* Instant Share Visualizer Button */}
          <button
            onClick={() => handleShareVisualizer(currentSong)}
            className="glass-button px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-purple-600/40 to-pink-600/40 hover:from-purple-600/70 hover:to-pink-600/70 border border-purple-500/30 flex items-center gap-1.5 shadow-lg"
            title="Share Visualizer Link (Current Theme & Song)"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Paste Link Badge */}
          <button
            onClick={() => setIsLinkImporterOpen(true)}
            className="glass-button px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-fuchsia-600/40 to-pink-600/40 hover:from-fuchsia-600/70 hover:to-pink-600/70 border border-fuchsia-500/30 flex items-center gap-1.5 shadow-lg"
            title="Import from YouTube Music, Spotify or Song Link (Shortkey: L)"
          >
            <LinkIcon className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="hidden sm:inline">Paste Link</span>
          </button>

          {/* Color Studio Quick Shortcut */}
          <button
            onClick={() => openControlCenter('colors')}
            className="glass-button px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-amber-500/30 to-rose-500/30 hover:from-amber-500/60 hover:to-rose-500/60 border border-amber-500/30 flex items-center gap-1.5 shadow-lg"
            title="Customize Lyric & Background Colors (Shortkey: C)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Colors</span>
          </button>

          {/* Master Control Center / Settings Button */}
          <button
            onClick={() => openControlCenter('modes')}
            className="glass-button px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-200 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 flex items-center gap-1.5 shadow-lg"
            title="Open Master Control Center (Shortkey: S)"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Settings</span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="glass-button p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            title="Pro Keyboard DJ Hotkeys (?)"
          >
            <Keyboard className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </header>

      {/* Optional Mac Lock Screen Clock (Verci Style) */}
      {settings.showLockScreenClock && (
        <div className={`text-center pt-1 pb-0 z-20 select-none transition-opacity duration-500 ${isIdle ? 'opacity-25' : 'opacity-85'}`}>
          <div className="text-xs sm:text-sm font-medium tracking-wide text-white/70 font-sans">
            {lockTime.date}
          </div>
          <div className="text-5xl sm:text-7xl font-semibold tracking-tighter text-white/95 font-sans my-0.5" style={{ textShadow: `0 0 25px ${colors.glow}40` }}>
            {lockTime.time}
          </div>
        </div>
      )}

      {/* Main Kinetic Typography Lyrics Stage */}
      <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto z-20">

        <WordVisualizer
          song={currentSong}
          currentTime={currentTime}
          colors={colors}
          settings={settings}
          onSeek={handleSeek}
        />
      </main>

      {/* Bottom Floating Glass Player Bar */}
      <footer
        className={`w-full transition-all duration-500 z-30 ${
          isIdle ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <PlayerControls
          song={currentSong}
          currentTime={currentTime}
          duration={currentSong.duration}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          volume={volume}
          colors={colors}
          settings={settings}
          isFullscreen={isFullscreen}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onVolumeChange={setVolume}
          onPlaybackRateChange={setPlaybackRate}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSettings={() => openControlCenter('modes')}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenSongList={() => setIsSongListOpen(true)}
          onOpenLinkImporter={() => setIsLinkImporterOpen(true)}
          onOpenColorModal={() => openControlCenter('colors')}
          onModeChange={handleModeChange}
        />
      </footer>

      {/* Dynamic Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-none">
          <div className="px-5 py-2.5 rounded-full bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 shadow-purple-500/20">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modals and Drawers */}
      <SongListDrawer
        isOpen={isSongListOpen}
        songs={songs}
        activeSongId={currentSong.id}
        colors={colors}
        onClose={() => setIsSongListOpen(false)}
        onSelectSong={(song) => {
          setCurrentSong(song);
          setCurrentTime(0);
          setIsPlaying(true);
        }}
        onDeleteSong={handleDeleteSong}
        onShareSong={handleShareVisualizer}
        onExportLibrary={handleExportLibrary}
        onImportLibrary={handleImportLibrary}
        onOpenStudio={() => {
          setIsSongListOpen(false);
          setIsStudioOpen(true);
        }}
        onOpenLinkImporter={() => {
          setIsSongListOpen(false);
          setIsLinkImporterOpen(true);
        }}
      />

      {/* Master Organized Control Center */}
      <ControlCenterModal
        isOpen={isControlCenterOpen}
        initialTab={controlCenterTab}
        settings={settings}
        colors={colors}
        currentSong={currentSong}
        playbackRate={playbackRate}
        volume={volume}
        onClose={() => setIsControlCenterOpen(false)}
        onUpdateSettings={(newPartial) => setSettings((prev) => ({ ...prev, ...newPartial }))}
        onUpdateColors={(newColors) => setColors((prev) => ({ ...prev, ...newColors }))}
        onResetToPoster={handleResetToPoster}
        onPlaybackRateChange={setPlaybackRate}
        onVolumeChange={setVolume}
        onShareVisualizer={() => handleShareVisualizer(currentSong)}
        onExportLibrary={handleExportLibrary}
        onImportLibrary={handleImportLibrary}
        onOpenSongList={() => {
          setIsControlCenterOpen(false);
          setIsSongListOpen(true);
        }}
        onOpenLinkImporter={() => {
          setIsControlCenterOpen(false);
          setIsLinkImporterOpen(true);
        }}
        onOpenStudio={() => {
          setIsControlCenterOpen(false);
          setIsStudioOpen(true);
        }}
      />

      <SongStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSaveSong={handleSaveCustomSong}
      />

      <LinkImporterModal
        isOpen={isLinkImporterOpen}
        onClose={() => setIsLinkImporterOpen(false)}
        onImportSong={handleSaveCustomSong}
      />

      {/* Pro Keyboard DJ Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        colors={colors}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;


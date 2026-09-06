export interface Word {
  text: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  emphasis?: boolean; // high intensity word (chorus/punch)
}

export interface LyricLine {
  id: string;
  startTime: number;
  endTime: number;
  words: Word[];
  text: string;
}

export interface ThemeColors {
  primary: string;    // Dominant accent color (e.g., #ec4899)
  secondary: string;  // Vibrant complement (e.g., #8b5cf6)
  tertiary: string;   // Secondary accent (e.g., #06b6d4)
  bgDark: string;     // Deep moody background tone (e.g., #09090e)
  glow: string;       // Glowing text tint (e.g., rgba(236,72,153,0.8))
  accent: string;     // Bright highlight (e.g., #f43f5e)
  lyricTextColor?: string; // Custom active singing word color override
  inactiveTextColor?: string; // Custom inactive lyric color override
  autoPosterSync?: boolean; // When true, syncs with active poster
}

export type VisualizerMode =
  | 'hero-word'
  | 'fisheye'
  | 'ship-3d'
  | 'visual-symbols'
  | 'kinetic-flow'
  | 'reel-pop'
  | 'minimal-zen'
  | 'vinyl-spin'
  | 'retro-ipod'
  | 'imessage-bubbles'
  | 'vhs-camcorder'
  | 'apple-sing'
  | 'vortex-zoom';

export type FontStyle = 'syne' | 'orbitron' | 'playfair' | 'outfit' | 'cinzel' | 'space' | 'cormorant';

export type TransitionEffect = 'rise-up' | 'kinetic-pop' | 'flip-rise' | 'glow-float';

export interface VisualSettings {
  mode: VisualizerMode;
  font: FontStyle;
  glowIntensity: number; // 0.2 to 2.0
  particleCount: number; // 0 to 100
  ambientMotionSpeed: number; // 0.2 to 2.0
  audioReactive: boolean;
  showFilmGrain: boolean;
  showVisualizerBars: boolean;
  showNextLinePreview: boolean;
  textSize: 'normal' | 'large' | 'massive' | 'extra-massive';
  transitionEffect: TransitionEffect;
  showLockScreenClock: boolean;
  lumnLighting: boolean;
  visualIcons: boolean;
}




export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl?: string; // custom audio blob or synthesized track identifier
  youtubeVideoId?: string; // YouTube / YT Music video identifier
  sourceType?: 'synth' | 'audio' | 'youtube';
  duration: number; // in seconds
  lyrics: LyricLine[];
  customColors?: Partial<ThemeColors>;
  bpm?: number;
  isCustom?: boolean;
  updatedAt?: number;
}


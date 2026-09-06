/**
 * Semantic word to emoji / symbol mapping for Verci "Visual" mode
 */
const SYMBOL_DICTIONARY: Record<string, string> = {
  // Celestial & Night
  night: '🌙',
  midnight: '🌕',
  dark: '🌑',
  sky: '🌌',
  skies: '🌌',
  star: '⭐',
  stars: '✨',
  starlight: '✨',
  sun: '☀️',
  sunlight: '🌅',
  sunset: '🌇',
  sunrise: '🌅',
  moon: '🌙',
  space: '🚀',
  outer: '🛸',
  cloud: '☁️',
  clouds: '☁️',

  // Fire, Energy & Tech
  fire: '🔥',
  flame: '🔥',
  burn: '🔥',
  burning: '🔥',
  light: '⚡',
  lights: '✨',
  electric: '⚡',
  electricity: '⚡',
  spark: '⚡',
  flashing: '📸',
  glow: '✨',
  glowing: '✨',
  shine: '💎',
  shining: '✨',
  laser: '🪄',
  neon: '🔮',
  synapses: '🧠',
  optical: '🌐',
  cyber: '🤖',
  system: '💻',
  digital: '👾',
  stream: '🌊',

  // Emotion & Vibe
  love: '🖤',
  heart: '🤍',
  heartbeat: '💓',
  kiss: '💋',
  feel: '💫',
  feeling: '✨',
  feelings: '💫',
  dream: '💭',
  dreams: '✨',
  dreaming: '💭',
  peace: '🕊️',
  cry: '💧',
  tears: '💧',
  rain: '🌧️',
  droplets: '💧',
  pain: '💔',
  aching: '💔',
  broken: '💔',
  sorrow: '🥀',
  sweet: '🍯',
  memories: '🎞️',
  quiet: '🤫',
  sleepy: '😴',

  // Movement & Journey
  drive: '🚗',
  driving: '🏎️',
  car: '🚗',
  rear: '🚘',
  mirror: '🪞',
  run: '🏃',
  running: '🏃',
  drift: '🌊',
  drifting: '🍃',
  dance: '💃',
  dancing: '🕺',
  rhythm: '🥁',
  pulse: '🔊',
  pulses: '🔉',
  music: '🎵',
  song: '🎶',
  sound: '🎧',
  echo: '🎙️',
  echoes: '📻',

  // Everyday & Lifestyle
  coffee: '☕',
  steam: '♨️',
  window: '🪟',
  blinds: '🪟',
  world: '🌍',
  earth: '🌎',
  time: '⏳',
  times: '🕰️',
  forever: '♾️',
  home: '🏡',
  face: '👤',
  eyes: '👁️',
  breath: '💨',
  gold: '🪙',
  golden: '✨',
  violet: '💜',
  blue: '💙',
  green: '💚',
  red: '❤️',
  pink: '💖',
  magic: '🪄',
  city: '🌆',
  game: '🎮',
};

export function getSymbolForWord(wordText: string): string | null {
  const clean = wordText.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return null;

  if (SYMBOL_DICTIONARY[clean]) {
    return SYMBOL_DICTIONARY[clean];
  }

  // Check prefix or partial
  for (const [key, icon] of Object.entries(SYMBOL_DICTIONARY)) {
    if (clean.length > 3 && (clean.startsWith(key) || key.startsWith(clean))) {
      return icon;
    }
  }

  return null;
}

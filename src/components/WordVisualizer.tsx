import React, { useMemo } from 'react';
import type { Song, ThemeColors, VisualSettings, Word } from '../types/lyrics';
import { getSymbolForWord } from '../utils/symbolMatcher';
import { Sparkles, Music2, Play } from 'lucide-react';

interface WordVisualizerProps {
  song: Song;
  currentTime: number;
  colors: ThemeColors;
  settings: VisualSettings;
  onSeek: (time: number) => void;
}

export const WordVisualizer: React.FC<WordVisualizerProps> = ({
  song,
  currentTime,
  colors,
  settings,
  onSeek,
}) => {
  // Find active line and word
  const { currentLineIndex, currentWordIndex, activeLine, activeWord, nextLine } = useMemo(() => {
    let lineIdx = -1;
    let wordIdx = -1;

    for (let i = 0; i < song.lyrics.length; i++) {
      const line = song.lyrics[i];
      if (currentTime >= line.startTime && currentTime <= line.endTime + 0.5) {
        lineIdx = i;
        // Find active word
        for (let j = 0; j < line.words.length; j++) {
          const w = line.words[j];
          if (currentTime >= w.startTime && currentTime <= w.endTime) {
            wordIdx = j;
            break;
          } else if (currentTime < w.startTime && wordIdx === -1) {
            // In between words
            wordIdx = Math.max(0, j - 1);
            break;
          }
        }
        if (wordIdx === -1 && line.words.length > 0) {
          wordIdx = line.words.length - 1;
        }
        break;
      }
    }

    const currentLine = lineIdx !== -1 ? song.lyrics[lineIdx] : null;
    const currentW = currentLine && wordIdx !== -1 ? currentLine.words[wordIdx] : null;
    const nLine = lineIdx !== -1 && lineIdx + 1 < song.lyrics.length ? song.lyrics[lineIdx + 1] : null;

    return {
      currentLineIndex: lineIdx,
      currentWordIndex: wordIdx,
      activeLine: currentLine,
      activeWord: currentW,
      nextLine: nLine,
    };
  }, [song.lyrics, currentTime]);

  // Determine font family class
  const fontClass = `font-${settings.font}`;

  // Font size multiplier
  const sizeMultiplierClass =
    settings.textSize === 'extra-massive'
      ? 'text-extra-massive font-black'
      : settings.textSize === 'massive'
      ? 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black'
      : settings.textSize === 'large'
      ? 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold'
      : 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold';

  // Transition animation class (rising up, kinetic pop, flip rise, glow float)
  const transitionClass =
    settings.transitionEffect === 'kinetic-pop'
      ? 'animate-kinetic-pop'
      : settings.transitionEffect === 'flip-rise'
      ? 'animate-flip-rise'
      : settings.transitionEffect === 'glow-float'
      ? 'animate-glow-float'
      : 'animate-rise-up';

  const isExtraMassive = settings.textSize === 'extra-massive';

  return (
    <div className={`relative w-full ${isExtraMassive ? 'min-h-[75vh]' : 'min-h-[60vh]'} flex flex-col items-center justify-center p-2 sm:p-6 select-none overflow-hidden`}>
      {/* Intro / Outro or Silent State */}
      {!activeLine && (
        <div className="flex flex-col items-center justify-center text-center py-16 animate-pulse">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 glass-panel box-glow"
            style={{ '--glow-color': colors.primary } as React.CSSProperties}
          >
            <Music2 className="w-8 h-8 text-white/80 animate-bounce" />
          </div>
          <h2 className={`${fontClass} text-2xl sm:text-3xl font-light text-white/60 tracking-wider`}>
            {currentTime < (song.lyrics[0]?.startTime || 0) ? 'Music starting soon...' : '... Instrumental ...'}
          </h2>
          <p className="text-sm text-white/40 mt-2 font-mono">
            {song.title} — {song.artist}
          </p>
        </div>
      )}

      {/* MODE 1: HERO SINGLE WORD DISPLAY */}
      {activeLine && settings.mode === 'hero-word' && (
        <div className="w-full flex flex-col items-center justify-center text-center">
          {/* Previous words ghost trail */}
          {!isExtraMassive && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 max-w-2xl px-4 opacity-40 hover:opacity-80 transition-opacity">
              {activeLine.words.slice(0, Math.max(0, currentWordIndex)).map((w, idx) => (
                <span
                  key={idx}
                  onClick={() => onSeek(w.startTime)}
                  className={`${fontClass} text-base sm:text-xl font-medium cursor-pointer text-white/70 hover:text-white transition-colors`}
                >
                  {w.text}
                </span>
              ))}
            </div>
          )}

          {/* Massive / Extra-Massive Active Word Display with Rising Up Transition */}
          <div className="relative my-2 sm:my-4 px-2 flex items-center justify-center max-w-full">
            {activeWord && (
              <div
                key={`${currentLineIndex}-${currentWordIndex}-${activeWord.text}`}
                className={`relative inline-block ${transitionClass} text-center`}
              >
                {/* Glow Backdrop */}
                <span
                  className={`absolute inset-0 select-none blur-3xl opacity-75 pointer-events-none ${fontClass} ${sizeMultiplierClass} font-black uppercase tracking-tight`}
                  style={{ color: colors.primary }}
                >
                  {activeWord.text}
                </span>

                {/* Primary Hero Text with dynamic gradient & kinetic rising animation */}
                <span
                  className={`relative z-10 inline-block font-black uppercase tracking-tight cursor-pointer ${fontClass} ${sizeMultiplierClass} transition-all duration-150`}
                  style={{
                    color: colors.lyricTextColor || (activeWord.emphasis ? colors.accent : '#ffffff'),
                    textShadow: `0 0 ${35 * settings.glowIntensity}px ${colors.glow}, 0 0 ${70 * settings.glowIntensity}px ${colors.primary}`,
                  }}
                  onClick={() => onSeek(activeWord.startTime)}
                >
                  {activeWord.text}
                  {activeWord.emphasis && (
                    <Sparkles
                      className={`inline-block ml-3 ${isExtraMassive ? 'w-14 h-14 -mt-12' : 'w-8 h-8 -mt-6'} animate-spin text-amber-300`}
                      style={{ animationDuration: '4s' }}
                    />
                  )}
                </span>

              </div>
            )}
          </div>

          {/* Upcoming words in active sentence */}
          {!isExtraMassive && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl px-4 opacity-30 hover:opacity-70 transition-opacity">
              {activeLine.words.slice(currentWordIndex + 1).map((w, idx) => (
                <span
                  key={idx}
                  onClick={() => onSeek(w.startTime)}
                  className={`${fontClass} text-base sm:text-xl font-light cursor-pointer text-white/80 hover:text-white transition-colors`}
                >
                  {w.text}
                </span>
              ))}
            </div>
          )}

          {/* Next Line Preview */}
          {settings.showNextLinePreview && nextLine && (
            <div
              onClick={() => onSeek(nextLine.startTime)}
              className="mt-8 px-6 py-2 rounded-full glass-panel cursor-pointer opacity-40 hover:opacity-90 transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-xs uppercase tracking-widest text-white/50 font-mono">Up next</span>
              <span className={`${fontClass} text-sm sm:text-base text-white/80 font-light truncate max-w-xs sm:max-w-md`}>
                {nextLine.text}
              </span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: VERCI FISHEYE CONVEX LENS (Signature Instagram Reel Lock Screen look) */}
      {activeLine && settings.mode === 'fisheye' && (
        <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center px-4" style={{ perspective: '1200px' }}>
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 transform-style-3d">
            {/* Line -2 */}
            {currentLineIndex > 1 && (
              <div
                onClick={() => onSeek(song.lyrics[currentLineIndex - 2].startTime)}
                className="opacity-20 blur-[3px] scale-80 transform -rotate-x-[35deg] -translate-y-4 cursor-pointer hover:opacity-50 transition-all"
              >
                <p className={`${fontClass} text-xl sm:text-3xl font-light text-white/60 truncate max-w-2xl`}>
                  {song.lyrics[currentLineIndex - 2].text}
                </p>
              </div>
            )}

            {/* Line -1 (Past Line) */}
            {currentLineIndex > 0 && (
              <div
                onClick={() => onSeek(song.lyrics[currentLineIndex - 1].startTime)}
                className="opacity-40 blur-[1px] scale-90 transform -rotate-x-[20deg] cursor-pointer hover:opacity-75 transition-all"
              >
                <p className={`${fontClass} text-2xl sm:text-4xl font-normal text-white/70 truncate max-w-3xl`}>
                  {song.lyrics[currentLineIndex - 1].text}
                </p>
              </div>
            )}

            {/* Active Center Convex Lens Line (Sits closest to the glass with maximum bulge) */}
            <div
              className="p-4 sm:p-6 rounded-3xl scale-110 sm:scale-120 transform translate-z-[50px] z-30 transition-all duration-300"
              style={{
                textShadow: `0 0 ${30 * settings.glowIntensity}px ${colors.glow}`,
              }}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2">
                {activeLine.words.map((word: Word, idx: number) => {
                  const isCurrent = idx === currentWordIndex;
                  const isPast = idx < currentWordIndex;

                  return (
                    <span
                      key={idx}
                      onClick={() => onSeek(word.startTime)}
                      className={`inline-block cursor-pointer font-black transition-all duration-200 ${fontClass} ${
                        isCurrent
                          ? `${sizeMultiplierClass} ${transitionClass} text-white scale-125 z-30`
                          : isPast
                          ? 'text-4xl sm:text-6xl hover:text-white/90'
                          : 'text-4xl sm:text-6xl hover:text-white/60'
                      }`}
                      style={{
                        color: isCurrent
                          ? (colors.lyricTextColor || (word.emphasis ? colors.accent : '#ffffff'))
                          : (isPast ? (colors.inactiveTextColor || 'rgba(255,255,255,0.6)') : 'rgba(255,255,255,0.25)'),
                        textShadow: isCurrent
                          ? `0 0 35px ${colors.glow}, 0 0 70px ${colors.primary}`
                          : undefined,
                      }}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Line +1 (Next Line) */}
            {nextLine && (
              <div
                onClick={() => onSeek(nextLine.startTime)}
                className="opacity-40 blur-[1px] scale-90 transform rotate-x-[20deg] cursor-pointer hover:opacity-75 transition-all"
              >
                <p className={`${fontClass} text-2xl sm:text-4xl font-normal text-white/70 truncate max-w-3xl`}>
                  {nextLine.text}
                </p>
              </div>
            )}

            {/* Line +2 */}
            {currentLineIndex + 2 < song.lyrics.length && (
              <div
                onClick={() => onSeek(song.lyrics[currentLineIndex + 2].startTime)}
                className="opacity-20 blur-[3px] scale-80 transform rotate-x-[35deg] translate-y-4 cursor-pointer hover:opacity-50 transition-all"
              >
                <p className={`${fontClass} text-xl sm:text-3xl font-light text-white/60 truncate max-w-2xl`}>
                  {song.lyrics[currentLineIndex + 2].text}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: VERCI VISUAL SYMBOLS MODE (Words + SF Symbols / Emojis Pop-In) */}
      {activeLine && settings.mode === 'visual-symbols' && (
        <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-4 my-6 p-6 rounded-3xl glass-panel box-glow" style={{ '--glow-color': colors.primary } as React.CSSProperties}>
            {activeLine.words.map((word: Word, idx: number) => {
              const isCurrent = idx === currentWordIndex;
              const isPast = idx < currentWordIndex;
              const symbol = getSymbolForWord(word.text);

              return (
                <div key={idx} className="relative inline-flex flex-col items-center">
                  {/* Symbol badge popping above keyword */}
                  {symbol && (
                    <span
                      className={`text-2xl sm:text-3xl mb-1 transition-all transform duration-200 ${
                        isCurrent
                          ? 'scale-130 -translate-y-2 opacity-100 animate-bounce'
                          : isPast
                          ? 'opacity-60 scale-100'
                          : 'opacity-20 scale-80'
                      }`}
                    >
                      {symbol}
                    </span>
                  )}

                  <span
                    onClick={() => onSeek(word.startTime)}
                    className={`inline-block cursor-pointer font-black transition-all duration-200 ${fontClass} ${
                      isCurrent
                        ? `${sizeMultiplierClass} ${transitionClass} text-white z-30`
                        : isPast
                        ? 'text-3xl sm:text-5xl'
                        : 'text-3xl sm:text-5xl'
                    }`}
                    style={{
                      color: isCurrent
                        ? (colors.lyricTextColor || (word.emphasis ? colors.accent : '#ffffff'))
                        : (isPast ? (colors.inactiveTextColor || 'rgba(255,255,255,0.5)') : 'rgba(255,255,255,0.2)'),
                      textShadow: isCurrent
                        ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.primary}`
                        : undefined,
                    }}
                  >
                    {word.text}
                  </span>
                </div>
              );
            })}

          </div>

          {nextLine && (
            <p
              onClick={() => onSeek(nextLine.startTime)}
              className={`${fontClass} text-base sm:text-xl text-white/30 hover:text-white/60 cursor-pointer font-light mt-4`}
            >
              {nextLine.text}
            </p>
          )}
        </div>
      )}

      {/* MODE 4: VERCI SHIP 3D DRIFT WALL */}
      {activeLine && settings.mode === 'ship-3d' && (
        <div className="w-full max-w-6xl flex flex-col items-center justify-center text-center px-4" style={{ perspective: '1400px' }}>
          <div className="space-y-4 transform -rotate-y-[8deg] rotate-x-[12deg] transition-transform duration-700">
            {song.lyrics.slice(Math.max(0, currentLineIndex - 2), currentLineIndex + 3).map((line, lIdx) => {
              const actualLineIdx = Math.max(0, currentLineIndex - 2) + lIdx;
              const isCurrentLine = actualLineIdx === currentLineIndex;

              return (
                <div
                  key={line.id}
                  onClick={() => onSeek(line.startTime)}
                  className={`p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isCurrentLine
                      ? 'bg-white/15 backdrop-blur-xl border border-white/30 scale-110 shadow-2xl z-20'
                      : 'opacity-30 blur-[1px] hover:opacity-60 scale-95'
                  }`}
                  style={
                    isCurrentLine
                      ? {
                          boxShadow: `0 0 40px ${colors.primary}40`,
                          transform: 'translateZ(60px)',
                        }
                      : {}
                  }
                >
                  <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4">
                    {line.words.map((w, wIdx) => {
                      const isCurWord = isCurrentLine && wIdx === currentWordIndex;
                      return (
                        <span
                          key={wIdx}
                          className={`font-black ${fontClass} ${
                            isCurWord
                              ? `text-4xl sm:text-6xl text-white scale-115 ${transitionClass}`
                              : isCurrentLine
                              ? 'text-3xl sm:text-4xl text-white/70'
                              : 'text-2xl sm:text-3xl text-white/40'
                          }`}
                          style={{
                            color: isCurWord ? colors.accent : undefined,
                            textShadow: isCurWord ? `0 0 25px ${colors.glow}` : undefined,
                          }}
                        >
                          {w.text}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 5: KINETIC FLOW */}
      {activeLine && settings.mode === 'kinetic-flow' && (
        <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center px-4 space-y-6">
          {/* Previous Line Ghost */}
          {currentLineIndex > 0 && (
            <p
              onClick={() => onSeek(song.lyrics[currentLineIndex - 1].startTime)}
              className={`${fontClass} text-lg sm:text-2xl text-white/25 hover:text-white/50 cursor-pointer font-light transition-all transform -translate-y-2`}
            >
              {song.lyrics[currentLineIndex - 1].text}
            </p>
          )}

          {/* Main Active Line with Word-by-Word Kinetic Animation */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-3 sm:gap-y-4 my-4 p-4 rounded-3xl transition-all">
            {activeLine.words.map((word: Word, idx: number) => {
              const isPast = idx < currentWordIndex;
              const isCurrent = idx === currentWordIndex;

              return (
                <span
                  key={idx}
                  onClick={() => onSeek(word.startTime)}
                  className={`relative inline-block cursor-pointer font-bold transition-all duration-200 ${fontClass} ${
                    isCurrent
                      ? `${sizeMultiplierClass} scale-110 z-20 ${transitionClass}`
                      : isPast
                      ? 'text-3xl sm:text-4xl md:text-5xl text-white/40 hover:text-white/70'
                      : 'text-3xl sm:text-4xl md:text-5xl text-white/20 hover:text-white/50'
                  }`}
                  style={{
                    color: isCurrent ? (word.emphasis ? colors.accent : '#ffffff') : undefined,
                    textShadow: isCurrent
                      ? `0 0 ${20 * settings.glowIntensity}px ${colors.glow}, 0 0 ${40 * settings.glowIntensity}px ${colors.primary}`
                      : undefined,
                  }}
                >
                  {word.text}

                  {/* Active word underline glow line */}
                  {isCurrent && (
                    <span
                      className="absolute -bottom-2 left-0 right-0 h-1 rounded-full animate-pulse"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                        boxShadow: `0 0 10px ${colors.primary}`,
                      }}
                    />
                  )}
                </span>
              );
            })}
          </div>

          {/* Next Line Preview */}
          {nextLine && (
            <p
              onClick={() => onSeek(nextLine.startTime)}
              className={`${fontClass} text-lg sm:text-2xl text-white/25 hover:text-white/50 cursor-pointer font-light transition-all transform translate-y-2`}
            >
              {nextLine.text}
            </p>
          )}
        </div>
      )}

      {/* MODE 6: REEL / TIKTOK KINETIC POP */}
      {activeLine && settings.mode === 'reel-pop' && (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center">
          <div className="p-8 rounded-3xl glass-panel box-glow max-w-3xl w-full" style={{ '--glow-color': colors.primary } as React.CSSProperties}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {activeLine.words.map((w: Word, idx: number) => {
                const isCurrent = idx === currentWordIndex;
                const isPast = idx < currentWordIndex;

                return (
                  <span
                    key={idx}
                    onClick={() => onSeek(w.startTime)}
                    className={`inline-block px-3 py-1.5 rounded-xl cursor-pointer font-black transition-all transform duration-150 ${fontClass} ${
                      isCurrent
                        ? 'text-4xl sm:text-6xl scale-125 rotate-1 bg-white text-black shadow-2xl z-20'
                        : isPast
                        ? 'text-2xl sm:text-3xl text-white/80 bg-white/10'
                        : 'text-2xl sm:text-3xl text-white/20'
                    }`}
                    style={
                      isCurrent
                        ? {
                            boxShadow: `0 0 30px ${colors.primary}`,
                          }
                        : {}
                    }
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 7: MINIMAL ZEN */}
      {activeLine && settings.mode === 'minimal-zen' && (
        <div className="w-full max-w-3xl flex flex-col items-start justify-center px-8 sm:px-16 border-l-2 border-white/20 py-8 transition-all">
          <span className="text-xs uppercase tracking-widest text-white/40 font-mono mb-4">
            Line {currentLineIndex + 1} / {song.lyrics.length}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {activeLine.words.map((w: Word, idx: number) => {
              const isCurrent = idx === currentWordIndex;
              return (
                <span
                  key={idx}
                  onClick={() => onSeek(w.startTime)}
                  className={`cursor-pointer transition-all duration-200 ${fontClass} ${
                    isCurrent
                      ? 'text-4xl sm:text-6xl font-normal text-white border-b-2 border-white/80 pb-1'
                      : 'text-2xl sm:text-4xl font-light text-white/30 hover:text-white/60'
                  }`}
                  style={{
                    color: isCurrent ? colors.accent : undefined,
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 8: 💿 VINYL ROTATING TURNTABLE & GROOVES */}
      {activeLine && settings.mode === 'vinyl-spin' && (
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-8 px-4">
          {/* Rotating Vinyl Record with Glossy Grooves */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex-shrink-0 flex items-center justify-center">
            {/* Ambient Vinyl Glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-50"
              style={{ background: colors.primary }}
            />

            {/* 3D Vinyl Disc Body */}
            <div
              className="relative w-full h-full rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-2xl animate-spin-slow flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: `0 0 35px ${colors.primary}40, inset 0 0 40px rgba(255,255,255,0.08)`,
                backgroundImage: `radial-gradient(circle, transparent 28%, rgba(255,255,255,0.05) 30%, transparent 32%, rgba(255,255,255,0.04) 45%, transparent 47%, rgba(255,255,255,0.06) 60%, transparent 62%, rgba(255,255,255,0.05) 75%, transparent 77%)`,
              }}
            >
              {/* Concentric Vinyl Grooves */}
              <div className="absolute inset-4 rounded-full border border-white/10 opacity-70" />
              <div className="absolute inset-8 rounded-full border border-white/10 opacity-60" />
              <div className="absolute inset-12 rounded-full border border-white/10 opacity-50" />
              <div className="absolute inset-16 rounded-full border border-white/10 opacity-40" />

              {/* Glossy Sheen Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 45%, rgba(255,255,255,0.4) 100%)',
                }}
              />

              {/* Center Spinning Album Artwork Label */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/40 shadow-inner flex items-center justify-center">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                {/* Spindle Hole */}
                <div className="absolute w-3 h-3 rounded-full bg-neutral-900 border border-white/50" />
              </div>
            </div>

            {/* Tonearm Needle Graphic */}
            <div className="absolute -top-4 -right-2 w-20 h-28 pointer-events-none hidden sm:block">
              <div className="w-4 h-4 rounded-full bg-neutral-300 border border-neutral-700 shadow-md absolute right-2 top-0" />
              <div className="w-1.5 h-20 bg-gradient-to-b from-neutral-300 to-neutral-500 rounded-full absolute right-3.5 top-3 origin-top transform rotate-[25deg] shadow-lg">
                <div
                  className="w-2.5 h-4 bg-amber-400 rounded-sm absolute bottom-0 -left-0.5 shadow-sm"
                  style={{ boxShadow: `0 0 10px ${colors.primary}` }}
                />
              </div>
            </div>
          </div>

          {/* Kinetic Halo Lyrics Column */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            {/* Ghost Past Line */}
            {currentLineIndex > 0 && (
              <p
                onClick={() => onSeek(song.lyrics[currentLineIndex - 1].startTime)}
                className={`${fontClass} text-sm sm:text-lg text-white/30 hover:text-white/60 cursor-pointer font-light`}
              >
                {song.lyrics[currentLineIndex - 1].text}
              </p>
            )}

            {/* Main Active Singing Line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 sm:gap-x-4 gap-y-2">
              {activeLine.words.map((w, idx) => {
                const isCurrent = idx === currentWordIndex;
                const isPast = idx < currentWordIndex;
                return (
                  <span
                    key={idx}
                    onClick={() => onSeek(w.startTime)}
                    className={`inline-block cursor-pointer font-black transition-all duration-200 ${fontClass} ${
                      isCurrent
                        ? `${sizeMultiplierClass} ${transitionClass} text-white scale-110 z-20`
                        : isPast
                        ? 'text-3xl sm:text-5xl text-white/70'
                        : 'text-3xl sm:text-5xl text-white/30'
                    }`}
                    style={{
                      color: isCurrent
                        ? (colors.lyricTextColor || (w.emphasis ? colors.accent : '#ffffff'))
                        : (isPast ? (colors.inactiveTextColor || 'rgba(255,255,255,0.6)') : 'rgba(255,255,255,0.25)'),
                      textShadow: isCurrent
                        ? `0 0 35px ${colors.glow}, 0 0 70px ${colors.primary}`
                        : undefined,
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>

            {/* Upcoming Next Line */}
            {nextLine && (
              <p
                onClick={() => onSeek(nextLine.startTime)}
                className={`${fontClass} text-sm sm:text-lg text-white/40 hover:text-white/70 cursor-pointer font-light`}
              >
                {nextLine.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODE 9: 📱 RETRO IPOD CLASSIC */}
      {activeLine && settings.mode === 'retro-ipod' && (
        <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-[2.5rem] bg-gradient-to-b from-neutral-200 to-neutral-400 text-neutral-900 shadow-2xl border-4 border-neutral-300 flex flex-col items-center select-none animate-float">
          {/* LCD Screen Display */}
          <div className="w-full bg-gradient-to-b from-cyan-950/90 to-cyan-900/90 rounded-2xl p-4 border-2 border-neutral-800 shadow-inner text-cyan-200 font-mono flex flex-col space-y-3 relative overflow-hidden">
            {/* Screen Header Bar */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-cyan-400/80 border-b border-cyan-800/60 pb-1.5 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3 fill-cyan-400" /> Now Playing
              </span>
              <span>{currentLineIndex + 1}/{song.lyrics.length}</span>
              <span>[▮▮▮▯]</span>
            </div>

            {/* Track Info & Artwork */}
            <div className="flex items-center gap-3">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover border border-cyan-500/40 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-black text-cyan-100 truncate">{song.title}</div>
                <div className="text-[11px] text-cyan-400 truncate">{song.artist}</div>
              </div>
            </div>

            {/* Kinetic Lyric LCD Ticker */}
            <div className="py-2 min-h-[70px] flex items-center justify-center text-center">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {activeLine.words.map((w, idx) => {
                  const isCurrent = idx === currentWordIndex;
                  return (
                    <span
                      key={idx}
                      onClick={() => onSeek(w.startTime)}
                      className={`cursor-pointer transition-all duration-150 ${
                        isCurrent
                          ? 'text-lg sm:text-2xl font-black text-cyan-50 bg-cyan-400/30 px-1.5 py-0.5 rounded shadow-md scale-110'
                          : 'text-sm sm:text-base font-medium text-cyan-300/50'
                      }`}
                      style={
                        isCurrent
                          ? {
                              textShadow: '0 0 12px #22d3ee',
                            }
                          : {}
                      }
                    >
                      {w.text}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Classic iPod Click Wheel */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white shadow-xl mt-4 border-2 border-neutral-300 flex items-center justify-center">
            <span className="absolute top-2 text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest">
              MENU
            </span>
            <span className="absolute left-3 text-[10px] sm:text-xs font-bold text-neutral-400">
              |◀◀
            </span>
            <span className="absolute right-3 text-[10px] sm:text-xs font-bold text-neutral-400">
              ▶▶|
            </span>
            <span className="absolute bottom-2 text-[10px] sm:text-xs font-bold text-neutral-400">
              ▶||
            </span>

            {/* Center Select Button */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-neutral-200 to-neutral-300 border border-neutral-400 shadow-inner flex items-center justify-center cursor-pointer active:scale-95 transition-transform" />
          </div>
        </div>
      )}

      {/* MODE 10: 💬 iMESSAGE CHAT BUBBLES */}
      {activeLine && settings.mode === 'imessage-bubbles' && (
        <div className="w-full max-w-xl flex flex-col space-y-3 px-4 py-6">
          {/* Past Line Bubble */}
          {currentLineIndex > 0 && (
            <div
              onClick={() => onSeek(song.lyrics[currentLineIndex - 1].startTime)}
              className="self-end max-w-md p-3.5 rounded-2xl rounded-tr-sm bg-white/10 backdrop-blur-md border border-white/15 text-white/50 cursor-pointer hover:text-white/80 transition-all text-sm sm:text-base font-medium"
            >
              {song.lyrics[currentLineIndex - 1].text}
            </div>
          )}

          {/* Active Line Bubble (Luminous iOS Blue/Purple Gradient) */}
          <div className="self-end max-w-lg animate-bubble-pop">
            <div
              className="p-4 sm:p-5 rounded-3xl rounded-tr-md shadow-2xl text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 10px 30px ${colors.primary}50`,
              }}
            >
              <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1.5">
                {activeLine.words.map((w, idx) => {
                  const isCurrent = idx === currentWordIndex;
                  return (
                    <span
                      key={idx}
                      onClick={() => onSeek(w.startTime)}
                      className={`cursor-pointer transition-all duration-150 ${fontClass} ${
                        isCurrent
                          ? 'text-2xl sm:text-4xl text-white font-black underline decoration-white/80 decoration-2 underline-offset-4 scale-105'
                          : 'text-xl sm:text-3xl text-white/70 font-semibold'
                      }`}
                      style={{
                        textShadow: isCurrent ? '0 0 15px rgba(255,255,255,0.9)' : undefined,
                      }}
                    >
                      {w.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Delivered Indicator */}
            <div className="text-[10px] text-white/40 text-right mt-1 font-sans mr-1">
              Delivered
            </div>
          </div>

          {/* Upcoming Line Typing Indicator Bubble */}
          {nextLine && (
            <div
              onClick={() => onSeek(nextLine.startTime)}
              className="self-start flex items-center gap-1.5 p-3 rounded-2xl rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/10 text-white/60 cursor-pointer hover:text-white transition-all text-xs sm:text-sm"
            >
              <span className="flex items-center gap-1 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="truncate max-w-xs font-light">{nextLine.text}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 11: 📼 90s VHS CAMCORDER */}
      {activeLine && settings.mode === 'vhs-camcorder' && (
        <div className="w-full max-w-4xl p-6 sm:p-8 rounded-3xl border border-white/20 bg-black/60 backdrop-blur-md shadow-2xl relative overflow-hidden font-mono select-none animate-vhs-flicker">
          {/* CRT Scanline Simulation */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 4px)',
            }}
          />

          {/* Top HUD Display */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-yellow-300 font-bold mb-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping inline-block" />
              <span className="text-red-500 tracking-wider">● REC</span>
              <span className="text-white/60">[SP]</span>
            </div>
            <div className="flex items-center gap-4 text-white/80">
              <span>[▮▮▮▯] 84%</span>
              <span className="hidden sm:inline">L ❚❚❚❚❚❚❚❚ R ❚❚❚❚❚</span>
            </div>
          </div>

          {/* Center Target Frame Focus Brackets */}
          <div className="relative py-6 flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none opacity-30 text-white text-3xl">
              <span>⌜</span>
              <span>⌝</span>
            </div>

            {/* Kinetic Yellow/Cyan VHS Subtitles */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2 relative z-10">
              {activeLine.words.map((w, idx) => {
                const isCurrent = idx === currentWordIndex;
                const isPast = idx < currentWordIndex;
                return (
                  <span
                    key={idx}
                    onClick={() => onSeek(w.startTime)}
                    className={`cursor-pointer font-black transition-all duration-150 uppercase tracking-wide ${
                      isCurrent
                        ? `${sizeMultiplierClass} text-yellow-300 scale-110 z-20`
                        : isPast
                        ? 'text-3xl sm:text-5xl text-yellow-100/70'
                        : 'text-3xl sm:text-5xl text-white/30'
                    }`}
                    style={{
                      textShadow: isCurrent
                        ? '2px 2px 0px #ff0055, -2px -2px 0px #00f0ff, 0 0 25px rgba(253, 224, 71, 0.9)'
                        : '1px 1px 0px rgba(0,0,0,0.8)',
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Bottom HUD Date & Timecode Stamp */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-yellow-300/80 font-bold mt-8 pt-4 border-t border-white/10">
            <div>SEP 05 1998</div>
            <div>08:42:{String(Math.floor(currentTime % 60)).padStart(2, '0')}:18 PM</div>
          </div>
        </div>
      )}

      {/* MODE 12: 🎤 APPLE MUSIC SING SPOTLIGHT */}
      {activeLine && settings.mode === 'apple-sing' && (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center px-4 space-y-6">
          {/* Above Lines (Blurred & Translucent) */}
          {currentLineIndex > 1 && (
            <p
              onClick={() => onSeek(song.lyrics[currentLineIndex - 2].startTime)}
              className={`${fontClass} text-xl sm:text-2xl text-white/15 blur-[2px] cursor-pointer hover:text-white/40 transition-all`}
            >
              {song.lyrics[currentLineIndex - 2].text}
            </p>
          )}

          {currentLineIndex > 0 && (
            <p
              onClick={() => onSeek(song.lyrics[currentLineIndex - 1].startTime)}
              className={`${fontClass} text-2xl sm:text-3xl text-white/35 blur-[1px] cursor-pointer hover:text-white/60 transition-all`}
            >
              {song.lyrics[currentLineIndex - 1].text}
            </p>
          )}

          {/* Main Spotlight Active Line */}
          <div className="relative py-4 px-6 rounded-3xl w-full flex items-center justify-center">
            {/* Luminous Spotlight Beam Backdrop */}
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${colors.primary}66 0%, ${colors.secondary}22 60%, transparent 80%)`,
              }}
            />

            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2 relative z-10">
              {activeLine.words.map((w, idx) => {
                const isCurrent = idx === currentWordIndex;
                const isPast = idx < currentWordIndex;
                return (
                  <span
                    key={idx}
                    onClick={() => onSeek(w.startTime)}
                    className={`inline-block cursor-pointer font-black transition-all duration-200 ${fontClass} ${
                      isCurrent
                        ? `${sizeMultiplierClass} ${transitionClass} text-white scale-115 z-30`
                        : isPast
                        ? 'text-4xl sm:text-6xl text-white/80'
                        : 'text-4xl sm:text-6xl text-white/30'
                    }`}
                    style={{
                      color: isCurrent
                        ? (colors.lyricTextColor || (w.emphasis ? colors.accent : '#ffffff'))
                        : (isPast ? (colors.inactiveTextColor || 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.3)'),
                      textShadow: isCurrent
                        ? `0 0 35px ${colors.glow}, 0 0 70px ${colors.primary}`
                        : undefined,
                    }}
                  >
                    {w.text}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Below Next Lines (Gentle Blur Fade) */}
          {nextLine && (
            <p
              onClick={() => onSeek(nextLine.startTime)}
              className={`${fontClass} text-2xl sm:text-3xl text-white/35 blur-[1px] cursor-pointer hover:text-white/60 transition-all`}
            >
              {nextLine.text}
            </p>
          )}
        </div>
      )}

      {/* MODE 13: 🌀 HYPERSPACE WARP ZOOM */}
      {activeLine && settings.mode === 'vortex-zoom' && (
        <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center px-4" style={{ perspective: '1000px' }}>
          {/* Cosmic Warp Speed Rings */}
          <div className="relative w-full flex items-center justify-center my-6">
            {/* Speed Tunnel Halo Lines */}
            <div
              className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 border-white/20 animate-ping opacity-25 pointer-events-none"
              style={{ borderColor: colors.primary, animationDuration: '2s' }}
            />
            <div
              className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/30 animate-ping opacity-35 pointer-events-none"
              style={{ borderColor: colors.secondary, animationDuration: '1.5s' }}
            />

            {activeWord && (
              <div
                key={`${currentLineIndex}-${currentWordIndex}-${activeWord.text}`}
                className="relative z-20 animate-warp-zoom flex flex-col items-center"
              >
                {/* Glow Backdrop */}
                <span
                  className={`absolute inset-0 blur-3xl opacity-80 pointer-events-none font-black uppercase ${fontClass} ${sizeMultiplierClass}`}
                  style={{ color: colors.primary }}
                >
                  {activeWord.text}
                </span>

                {/* Primary Warp Text */}
                <span
                  className={`relative z-10 font-black uppercase tracking-tight cursor-pointer ${fontClass} ${sizeMultiplierClass}`}
                  style={{
                    color: colors.lyricTextColor || (activeWord.emphasis ? colors.accent : '#ffffff'),
                    textShadow: `0 0 ${40 * settings.glowIntensity}px ${colors.glow}, 0 0 ${80 * settings.glowIntensity}px ${colors.primary}`,
                  }}
                  onClick={() => onSeek(activeWord.startTime)}
                >
                  {activeWord.text}
                </span>
              </div>
            )}
          </div>

          {/* Full Line Sub-Preview */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-xl opacity-50 hover:opacity-90 transition-opacity">
            {activeLine.words.map((w, idx) => (
              <span
                key={idx}
                onClick={() => onSeek(w.startTime)}
                className={`${fontClass} text-sm sm:text-base cursor-pointer ${
                  idx === currentWordIndex ? 'text-white font-bold underline' : 'text-white/60'
                }`}
              >
                {w.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


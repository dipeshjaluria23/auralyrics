import React, { useEffect, useRef, useState } from 'react';
import type { ThemeColors, VisualSettings } from '../types/lyrics';
import { audioEngine } from '../utils/audioSynth';

interface AestheticBackgroundProps {
  colors: ThemeColors;
  coverUrl: string;
  settings: VisualSettings;
  isPlaying: boolean;
}

export const AestheticBackground: React.FC<AestheticBackgroundProps> = ({
  colors,
  coverUrl,
  settings,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bgStyle = settings.backgroundStyle || 'album-cover-original';
  const isCustom = bgStyle === 'custom-wallpaper';
  const isCoverStyle =
    bgStyle === 'album-cover-original' ||
    bgStyle === 'album-cover-cinematic' ||
    bgStyle === 'album-cover-blur' ||
    isCustom;

  // Active target cover (custom wallpaper or song's cover)
  const targetImage = isCustom && settings.customWallpaperUrl ? settings.customWallpaperUrl : coverUrl;

  // Smooth Cross-Fade between Song Covers
  const [activeCover, setActiveCover] = useState<string>(targetImage);
  const [prevCover, setPrevCover] = useState<string | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  useEffect(() => {
    if (targetImage && targetImage !== activeCover) {
      setPrevCover(activeCover);
      setActiveCover(targetImage);
      setIsCrossFading(true);

      const timer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevCover(null);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [targetImage, activeCover]);

  const defaultBlur = bgStyle === 'album-cover-original' ? 0 : bgStyle === 'album-cover-cinematic' ? 8 : 40;
  const coverBlur = settings.coverBlurAmount !== undefined ? settings.coverBlurAmount : defaultBlur;
  const coverOpacity = settings.coverOpacity !== undefined ? settings.coverOpacity : 0.85;
  const isKenBurns = settings.kenBurnsEffect !== false;

  const showCanvas = bgStyle === 'dynamic-canvas' || bgStyle === 'album-cover-blur';

  useEffect(() => {
    if (!showCanvas) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      baseAlpha: number;
    }

    const particles: Particle[] = [];
    const count = settings.particleCount || 40;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4 * (settings.ambientMotionSpeed || 1),
        vy: -(Math.random() * 0.5 + 0.2) * (settings.ambientMotionSpeed || 1),
        alpha: Math.random() * 0.7 + 0.2,
        baseAlpha: Math.random() * 0.7 + 0.2,
        color: i % 2 === 0 ? colors.primary : colors.secondary,
      });
    }

    // Dynamic blobs
    const blobs = [
      { x: width * 0.25, y: height * 0.3, radius: Math.min(width, height) * 0.45, color: colors.primary },
      { x: width * 0.75, y: height * 0.65, radius: Math.min(width, height) * 0.42, color: colors.secondary },
      { x: width * 0.5, y: height * 0.85, radius: Math.min(width, height) * 0.38, color: colors.tertiary },
      { x: width * 0.8, y: height * 0.2, radius: Math.min(width, height) * 0.35, color: colors.accent },
    ];

    let time = 0;

    const render = () => {
      time += 0.008 * (settings.ambientMotionSpeed || 1);
      ctx.clearRect(0, 0, width, height);

      // Audio reactive boost
      let audioBoost = 1;
      if (settings.audioReactive && isPlaying) {
        const avgFreq = audioEngine.getAverageFrequency();
        audioBoost = 1 + (avgFreq / 255) * 0.45;
      }

      // Draw glowing fluid blobs
      blobs.forEach((blob, idx) => {
        const offsetX = Math.sin(time + idx * 1.5) * 50 * (settings.ambientMotionSpeed || 1);
        const offsetY = Math.cos(time + idx * 1.2) * 50 * (settings.ambientMotionSpeed || 1);
        const currentX = blob.x + offsetX;
        const currentY = blob.y + offsetY;
        const currentRadius = blob.radius * audioBoost;

        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          currentRadius * 0.1,
          currentX,
          currentY,
          currentRadius
        );

        gradient.addColorStop(0, hexToRgba(blob.color, 0.42));
        gradient.addColorStop(0.5, hexToRgba(blob.color, 0.18));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Stardust Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const pulse = Math.sin(time * 3 + p.x) * 0.3;
        const alpha = Math.max(0.1, Math.min(1, p.baseAlpha + pulse));

        ctx.fillStyle = hexToRgba(p.color, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * audioBoost, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, settings, isPlaying, showCanvas]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-[#040409] transition-colors duration-700">
      {/* 1. Base Dark Theme Tone */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: colors.bgDark || '#05050e',
        }}
      />

      {/* 2. Full-Bleed Album Cover Backdrop (Original, Cinematic, Blur, or Custom Uploaded Wallpaper) */}
      {isCoverStyle && prevCover && (
        <div
          className={`absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center transition-opacity duration-700 ${
            isKenBurns && isPlaying ? 'animate-ken-burns' : 'scale-105'
          }`}
          style={{
            backgroundImage: `url(${prevCover})`,
            opacity: isCrossFading ? 0 : coverOpacity,
            filter: `blur(${coverBlur}px) saturate(1.35) brightness(${
              bgStyle === 'album-cover-original'
                ? 0.85
                : bgStyle === 'album-cover-cinematic'
                ? 0.75
                : 0.65
            })`,
            willChange: 'transform, opacity, filter',
          }}
        />
      )}

      {isCoverStyle && activeCover && (
        <div
          className={`absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center transition-opacity duration-700 ${
            isKenBurns && isPlaying ? 'animate-ken-burns' : 'scale-105'
          }`}
          style={{
            backgroundImage: `url(${activeCover})`,
            opacity: coverOpacity,
            filter: `blur(${coverBlur}px) saturate(1.35) brightness(${
              bgStyle === 'album-cover-original'
                ? 0.85
                : bgStyle === 'album-cover-cinematic'
                ? 0.75
                : 0.65
            })`,
            willChange: 'transform, opacity, filter',
          }}
        />
      )}

      {/* 3. Dynamic Animated Fluid Canvas */}
      {showCanvas && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-80 transition-opacity duration-700"
        />
      )}

      {/* 4. Minimal AMOLED Mode Soft Radial Accent */}
      {bgStyle === 'minimal-gradient' && (
        <div
          className="absolute inset-0 opacity-40 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${colors.primary}33 0%, ${colors.secondary}15 45%, transparent 75%)`,
          }}
        />
      )}

      {/* 5. Cinematic Vignette Overlay (Ensures lyrics remain 100% legible) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            bgStyle === 'album-cover-original'
              ? 'radial-gradient(circle at center, rgba(3,3,7,0.3) 15%, rgba(3,3,7,0.7) 65%, rgba(3,3,7,0.94) 100%)'
              : bgStyle === 'album-cover-cinematic'
              ? 'radial-gradient(circle at center, rgba(3,3,7,0.3) 20%, rgba(3,3,7,0.75) 70%, rgba(3,3,7,0.92) 100%)'
              : 'radial-gradient(circle at center, transparent 25%, rgba(3,3,7,0.65) 80%, rgba(3,3,7,0.9) 100%)',
        }}
      />

      {/* 6. Lumn-Style Reactive Ambient Edge Backlight */}
      {settings.lumnLighting && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            boxShadow: `inset 0 0 100px 30px ${colors.primary}44, inset 0 0 180px 80px ${colors.secondary}22`,
          }}
        />
      )}

      {/* 7. Optional Film Grain Texture */}
      {settings.showFilmGrain && (
        <div
          className="absolute inset-0 opacity-12 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return `rgba(236, 72, 153, ${alpha})`;
  if (hex.startsWith('rgba')) return hex;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 200;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 100;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 220;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

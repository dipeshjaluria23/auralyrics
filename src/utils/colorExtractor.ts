import type { ThemeColors } from '../types/lyrics';


/**
 * Extracts aesthetic dynamic color palette from an image element or URL
 */
export async function extractPaletteFromImage(imageSrc: string): Promise<ThemeColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;

    const fallback: ThemeColors = {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      tertiary: '#06b6d4',
      bgDark: '#070712',
      glow: 'rgba(236, 72, 153, 0.8)',
      accent: '#f43f5e',
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(fallback);
          return;
        }

        // Downscale for ultra-fast sampling
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorCounts: { [hex: string]: { r: number; g: number; b: number; count: number; sat: number; bright: number } } = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparent

          // Calculate brightness and saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (r + g + b) / 3;
          const saturation = max === 0 ? 0 : (max - min) / max;

          // Skip washed out whites and muddy pure blacks for accents
          if (brightness < 20 || (brightness > 235 && saturation < 0.15)) continue;

          // Quantize color to smooth buckets
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;

          if (!colorCounts[hex]) {
            colorCounts[hex] = { r: qr, g: qg, b: qb, count: 0, sat: saturation, bright: brightness };
          }
          colorCounts[hex].count += 1;
        }

        const sortedColors = Object.values(colorCounts).sort((a, b) => {
          // Weight by vibrant saturation and frequency
          const scoreA = a.count * (1 + a.sat * 2);
          const scoreB = b.count * (1 + b.sat * 2);
          return scoreB - scoreA;
        });

        if (sortedColors.length === 0) {
          resolve(fallback);
          return;
        }

        const top1 = sortedColors[0];
        const top2 = sortedColors[Math.min(1, sortedColors.length - 1)] || top1;
        const top3 = sortedColors[Math.min(3, sortedColors.length - 1)] || top2;

        const primary = rgbToHex(top1.r, top1.g, top1.b);
        const secondary = rgbToHex(top2.r, top2.g, top2.b);
        const tertiary = rgbToHex(top3.r, top3.g, top3.b);
        const bgDark = rgbToHex(Math.floor(top1.r * 0.08), Math.floor(top1.g * 0.08), Math.floor(top1.b * 0.12));
        const glow = `rgba(${top1.r}, ${top1.g}, ${top1.b}, 0.85)`;
        const accent = rgbToHex(Math.min(255, Math.floor(top1.r * 1.25)), Math.min(255, Math.floor(top1.g * 1.25)), Math.min(255, Math.floor(top1.b * 1.25)));

        resolve({
          primary,
          secondary,
          tertiary,
          bgDark,
          glow,
          accent,
        });
      } catch (err) {
        console.warn('Canvas palette extraction error, using fallback:', err);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      resolve(fallback);
    };
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  return `#${((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1)}`;
}

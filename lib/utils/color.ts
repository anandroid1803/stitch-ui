// Color utility functions for the AdvancedColorPicker

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSB {
  h: number; // 0-360
  s: number; // 0-100
  b: number; // 0-100
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export type ColorFormat = 'hex' | 'rgb' | 'hsb' | 'pantone';

// Hex to RGB
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Handle shorthand hex (e.g., #fff -> #ffffff)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex.slice(0, 6);

  const num = parseInt(fullHex, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// RGB to Hex
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// RGB to HSB (HSV)
// Note: We keep full precision here to avoid color drift when converting back to RGB
export function rgbToHsb(rgb: RGB): HSB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = h * 60;
    if (h < 0) h += 360;
  }

  // Keep full precision - rounding happens when converting back to RGB
  return {
    h,
    s: s * 100,
    b: v * 100,
  };
}

// HSB to RGB
export function hsbToRgb(hsb: HSB): RGB {
  const h = hsb.h;
  const s = hsb.s / 100;
  const v = hsb.b / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// HSB to Hex
export function hsbToHex(hsb: HSB): string {
  return rgbToHex(hsbToRgb(hsb));
}

// Hex to HSB
export function hexToHsb(hex: string): HSB {
  return rgbToHsb(hexToRgb(hex));
}

// RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Parse alpha from hex string (supports #RRGGBB and #RRGGBBAA)
export function parseAlpha(hex: string): number {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 8) {
    return parseInt(cleanHex.slice(6, 8), 16) / 255;
  }
  return 1;
}

// Add alpha to hex string
export function addAlphaToHex(hex: string, alpha: number): string {
  const baseHex = hex.replace(/^#/, '').slice(0, 6);
  if (alpha >= 1) {
    return `#${baseHex}`;
  }
  const alphaHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `#${baseHex}${alphaHex}`;
}

// Parse any color input and return all formats
export function parseColor(input: string): {
  hex: string;
  rgb: RGB;
  hsb: HSB;
  alpha: number;
} {
  let hex = '#000000';
  let alpha = 1;

  // Clean input
  const cleanInput = input.trim().toLowerCase();

  // Handle hex
  if (cleanInput.startsWith('#')) {
    const hexValue = cleanInput.slice(1);
    if (/^[0-9a-f]{3}$/.test(hexValue)) {
      hex = `#${hexValue.split('').map(c => c + c).join('')}`;
    } else if (/^[0-9a-f]{6}$/.test(hexValue)) {
      hex = `#${hexValue}`;
    } else if (/^[0-9a-f]{8}$/.test(hexValue)) {
      hex = `#${hexValue.slice(0, 6)}`;
      alpha = parseInt(hexValue.slice(6, 8), 16) / 255;
    }
  }
  // Handle rgb/rgba
  else if (cleanInput.startsWith('rgb')) {
    const match = cleanInput.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      const rgb: RGB = {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
      hex = rgbToHex(rgb);
      if (match[4]) {
        alpha = parseFloat(match[4]);
      }
    }
  }
  // Handle hsl/hsla (convert to hsb first)
  else if (cleanInput.startsWith('hsl')) {
    const match = cleanInput.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);
      // Convert HSL to RGB then to hex
      const hslToRgb = (h: number, s: number, l: number): RGB => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return {
          r: Math.round((r + m) * 255),
          g: Math.round((g + m) * 255),
          b: Math.round((b + m) * 255),
        };
      };
      hex = rgbToHex(hslToRgb(h, s, l));
      if (match[4]) {
        alpha = parseFloat(match[4]);
      }
    }
  }

  const rgb = hexToRgb(hex);
  const hsb = rgbToHsb(rgb);

  return { hex, rgb, hsb, alpha };
}

// Format color based on selected format
export function formatColor(
  hsb: HSB,
  alpha: number,
  format: ColorFormat
): string {
  const rgb = hsbToRgb(hsb);
  const hex = rgbToHex(rgb);

  switch (format) {
    case 'hex':
      return alpha < 1 ? addAlphaToHex(hex, alpha) : hex;
    case 'rgb':
      return alpha < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsb':
      return `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
    case 'pantone':
      // Will be handled separately with pantone matching
      return hex;
    default:
      return hex;
  }
}

// Validate hex color
export function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
}

// Get contrasting text color (black or white) for a background
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Lighten or darken a color
export function adjustBrightness(hex: string, amount: number): string {
  const hsb = hexToHsb(hex);
  hsb.b = Math.max(0, Math.min(100, hsb.b + amount));
  return hsbToHex(hsb);
}

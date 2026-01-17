/**
 * Google Fonts API integration
 * Fetches font catalog and loads fonts on demand
 */

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
}

interface GoogleFontsAPIResponse {
  kind: string;
  items: Array<{
    family: string;
    variants: string[];
    subsets: string[];
    category: string;
  }>;
}

// Default fallback fonts (system fonts that don't need loading)
export const FALLBACK_FONTS: GoogleFont[] = [
  { family: 'Arial', variants: ['regular', '700'], subsets: ['latin'], category: 'sans-serif' },
  { family: 'Georgia', variants: ['regular', '700'], subsets: ['latin'], category: 'serif' },
  { family: 'Times New Roman', variants: ['regular', '700'], subsets: ['latin'], category: 'serif' },
  { family: 'Courier New', variants: ['regular', '700'], subsets: ['latin'], category: 'monospace' },
  { family: 'Verdana', variants: ['regular', '700'], subsets: ['latin'], category: 'sans-serif' },
  { family: 'Trebuchet MS', variants: ['regular', '700'], subsets: ['latin'], category: 'sans-serif' },
];

// Popular fonts to prioritize in the list
const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Source Sans Pro', 'Oswald', 'Raleway', 'Ubuntu', 'Playfair Display',
  'Merriweather', 'Nunito', 'PT Sans', 'Rubik', 'Work Sans', 'Fira Sans',
  'Quicksand', 'Karla', 'Mulish', 'DM Sans', 'Space Grotesk', 'Manrope',
];

// Cache for the font catalog
let fontCatalogCache: GoogleFont[] | null = null;
let fontCatalogPromise: Promise<GoogleFont[]> | null = null;

/**
 * Fetch the Google Fonts catalog
 * Uses API key from environment variable
 */
export async function fetchGoogleFontsCatalog(): Promise<GoogleFont[]> {
  // Return cached data if available
  if (fontCatalogCache) {
    return fontCatalogCache;
  }

  // Return existing promise if fetch is in progress
  if (fontCatalogPromise) {
    return fontCatalogPromise;
  }

  fontCatalogPromise = (async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
      
      if (!apiKey) {
        console.warn('Google Fonts API key not configured. Using fallback fonts.');
        return FALLBACK_FONTS;
      }

      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
      );

      if (!response.ok) {
        throw new Error(`Google Fonts API error: ${response.status}`);
      }

      const data: GoogleFontsAPIResponse = await response.json();
      
      const fonts: GoogleFont[] = data.items.map((item) => ({
        family: item.family,
        variants: item.variants,
        subsets: item.subsets,
        category: item.category as GoogleFont['category'],
      }));

      // Sort: popular fonts first, then alphabetically
      fonts.sort((a, b) => {
        const aPopular = POPULAR_FONTS.indexOf(a.family);
        const bPopular = POPULAR_FONTS.indexOf(b.family);
        
        if (aPopular !== -1 && bPopular !== -1) {
          return aPopular - bPopular;
        }
        if (aPopular !== -1) return -1;
        if (bPopular !== -1) return 1;
        return a.family.localeCompare(b.family);
      });

      fontCatalogCache = fonts;
      return fonts;
    } catch (error) {
      console.error('Failed to fetch Google Fonts catalog:', error);
      return FALLBACK_FONTS;
    } finally {
      fontCatalogPromise = null;
    }
  })();

  return fontCatalogPromise;
}

/**
 * Search fonts by name
 */
export function searchFonts(fonts: GoogleFont[], query: string): GoogleFont[] {
  if (!query.trim()) {
    return fonts;
  }
  
  const lowerQuery = query.toLowerCase();
  return fonts.filter((font) =>
    font.family.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter fonts by category
 */
export function filterFontsByCategory(
  fonts: GoogleFont[],
  category: GoogleFont['category'] | 'all'
): GoogleFont[] {
  if (category === 'all') {
    return fonts;
  }
  return fonts.filter((font) => font.category === category);
}

// ============================================================================
// Font Loader - Runtime loading of Google Fonts
// ============================================================================

// Track which fonts have been loaded
const loadedFonts = new Set<string>();
const loadingFonts = new Map<string, Promise<void>>();

// Event emitter for font load events
type FontLoadCallback = (family: string) => void;
const fontLoadCallbacks: FontLoadCallback[] = [];

export function onFontLoad(callback: FontLoadCallback): () => void {
  fontLoadCallbacks.push(callback);
  return () => {
    const index = fontLoadCallbacks.indexOf(callback);
    if (index > -1) {
      fontLoadCallbacks.splice(index, 1);
    }
  };
}

function notifyFontLoaded(family: string) {
  fontLoadCallbacks.forEach((cb) => cb(family));
}

/**
 * Check if a font is a system font (doesn't need loading)
 */
export function isSystemFont(family: string): boolean {
  return FALLBACK_FONTS.some((f) => f.family === family);
}

/**
 * Check if a font has been loaded
 */
export function isFontLoaded(family: string): boolean {
  return loadedFonts.has(family) || isSystemFont(family);
}

/**
 * Convert variant strings to CSS weight/style
 */
function variantToWeightStyle(variant: string): { weight: string; style: string } {
  if (variant === 'regular') {
    return { weight: '400', style: 'normal' };
  }
  if (variant === 'italic') {
    return { weight: '400', style: 'italic' };
  }
  
  const isItalic = variant.includes('italic');
  const weight = variant.replace('italic', '') || '400';
  
  return {
    weight,
    style: isItalic ? 'italic' : 'normal',
  };
}

/**
 * Load a Google Font dynamically
 * Returns a promise that resolves when the font is ready to use
 */
export async function loadGoogleFont(
  family: string,
  variants: string[] = ['regular', '700']
): Promise<void> {
  // Skip system fonts
  if (isSystemFont(family)) {
    return;
  }

  // Already loaded
  if (loadedFonts.has(family)) {
    return;
  }

  // Already loading
  if (loadingFonts.has(family)) {
    return loadingFonts.get(family);
  }

  const loadPromise = (async () => {
    try {
      // Build the Google Fonts CSS2 URL
      // Format: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
      const weights = variants
        .map((v) => variantToWeightStyle(v).weight)
        .filter((w, i, arr) => arr.indexOf(w) === i) // unique
        .sort()
        .join(';');
      
      const encodedFamily = encodeURIComponent(family);
      const url = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weights}&display=swap`;

      // Create and append link element
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      // Wait for the stylesheet to load
      await new Promise<void>((resolve, reject) => {
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load font: ${family}`));
        document.head.appendChild(link);
      });

      // Wait for the font to be ready using Font Loading API
      // Try loading with common weights
      const weightsToCheck = ['400', '700'];
      const fontChecks = weightsToCheck.map(async (weight) => {
        try {
          await document.fonts.load(`${weight} 16px "${family}"`);
        } catch {
          // Font weight might not exist, that's ok
        }
      });
      
      await Promise.all(fontChecks);

      loadedFonts.add(family);
      notifyFontLoaded(family);
    } catch (error) {
      console.error(`Failed to load font "${family}":`, error);
      throw error;
    } finally {
      loadingFonts.delete(family);
    }
  })();

  loadingFonts.set(family, loadPromise);
  return loadPromise;
}

/**
 * Preload a font without blocking
 */
export function preloadFont(family: string, variants?: string[]): void {
  loadGoogleFont(family, variants).catch(() => {
    // Ignore preload errors
  });
}

/**
 * Get all loaded font families
 */
export function getLoadedFonts(): string[] {
  return [...loadedFonts];
}

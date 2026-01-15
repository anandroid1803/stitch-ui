// Fill History Utility
// Stores recently used fill colors in localStorage for quick access

const FILL_HISTORY_KEY = 'stitch_fill_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Save a fill color to history
 * @param color - Hex color string (with or without alpha)
 */
export function saveFillToHistory(color: string): void {
  try {
    const history = getFillHistory();
    // Remove duplicate if exists and add to front
    const updated = [color, ...history.filter(c => c !== color)].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(FILL_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save fill history:', error);
  }
}

/**
 * Get fill color history
 * @returns Array of recent fill colors (most recent first)
 */
export function getFillHistory(): string[] {
  try {
    const stored = localStorage.getItem(FILL_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load fill history:', error);
    return [];
  }
}

/**
 * Clear fill history
 */
export function clearFillHistory(): void {
  try {
    localStorage.removeItem(FILL_HISTORY_KEY);
  } catch (error) {
    console.warn('Failed to clear fill history:', error);
  }
}

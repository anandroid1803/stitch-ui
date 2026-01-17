/**
 * Text measurement utilities for Konva text elements
 * Uses a hidden canvas context to accurately measure text dimensions
 */

interface TextMeasureOptions {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  lineHeight?: number;
  letterSpacing?: number;
  width?: number; // For wrapping
  padding?: number;
}

/**
 * Measure the height of text given its content and styling.
 * This mimics Konva's internal text measurement to ensure consistency.
 */
export function measureTextHeight(options: TextMeasureOptions): number {
  const {
    text,
    fontSize,
    fontFamily,
    fontWeight = 400,
    fontStyle = 'normal',
    lineHeight = 1.2,
    letterSpacing = 0,
    width,
    padding = 0,
  } = options;

  // Create a temporary canvas context for measurement
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    // Fallback if canvas is not available
    const lines = text.split('\n').length;
    return lines * fontSize * lineHeight + padding * 2;
  }

  // Set font to match Konva's text rendering
  const fontStyleStr = fontStyle === 'italic' ? 'italic' : 'normal';
  const fontVariant = fontWeight >= 600 ? 'bold' : 'normal';
  context.font = `${fontStyleStr} ${fontVariant} ${fontSize}px ${fontFamily}`;

  const lineHeightPx = fontSize * lineHeight;
  const maxWidth = width ? width - padding * 2 : undefined;

  // Split by newlines first
  const paragraphs = text.split('\n');
  let totalLines = 0;

  for (const paragraph of paragraphs) {
    if (!maxWidth || paragraph === '') {
      // No wrapping needed or empty line
      totalLines += 1;
      continue;
    }

    // Measure and wrap text
    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width + (letterSpacing * testLine.length);

      if (testWidth > maxWidth && currentLine !== '') {
        totalLines += 1;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    // Count the last line of the paragraph
    if (currentLine !== '' || paragraph === '') {
      totalLines += 1;
    }
  }

  // Ensure at least one line
  totalLines = Math.max(1, totalLines);

  return totalLines * lineHeightPx + padding * 2;
}

/**
 * Calculate the width of text content
 */
export function measureTextWidth(options: Omit<TextMeasureOptions, 'width'>): number {
  const {
    text,
    fontSize,
    fontFamily,
    fontWeight = 400,
    fontStyle = 'normal',
    letterSpacing = 0,
    padding = 0,
  } = options;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    // Rough estimate fallback
    return text.length * fontSize * 0.6 + padding * 2;
  }

  const fontStyleStr = fontStyle === 'italic' ? 'italic' : 'normal';
  const fontVariant = fontWeight >= 600 ? 'bold' : 'normal';
  context.font = `${fontStyleStr} ${fontVariant} ${fontSize}px ${fontFamily}`;

  // Find the widest line
  const lines = text.split('\n');
  let maxWidth = 0;

  for (const line of lines) {
    const metrics = context.measureText(line);
    const lineWidth = metrics.width + (letterSpacing * line.length);
    maxWidth = Math.max(maxWidth, lineWidth);
  }

  return maxWidth + padding * 2;
}

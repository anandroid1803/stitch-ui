# Typography System

## Overview

The typography system is built around three main font families with a consistent scale for sizes, weights, and line heights. The system ensures readable, hierarchical text across all interfaces.

## Font Families

### Primary Font: Satoshi Variable
```css
font-family: 'Satoshi Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- **Usage**: Primary font for headings, body text, and UI elements
- **Fallbacks**: System fonts for optimal performance

### Secondary Font: Libre Franklin
```css
font-family: 'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- **Usage**: Secondary font for specific UI elements and accents
- **Characteristics**: Geometric, modern sans-serif

### Tertiary Font: Public Sans
```css
font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- **Usage**: Tertiary font for specialized content
- **Characteristics**: Clean, neutral design

## Font Sizes

The font size scale follows a consistent ratio:

- **xs**: 12px - Small labels and captions
- **sm**: 14px - Secondary text and small UI elements
- **base**: 16px - Body text and default content
- **lg**: 22px - Large body text and subheadings
- **xl**: 32px - Headings and hero text

## Font Weights

Available weights across all fonts:

- **normal**: 400 - Regular body text
- **medium**: 500 - Slightly emphasized text
- **semibold**: 600 - Button text and labels
- **bold**: 700 - Headings and strong emphasis
- **black**: 900 - Heavy headings and display text

## Line Heights

Optimized line heights for readability:

- **tight**: 1.21 - For compact text blocks
- **normal**: 1.25 - Standard line height for body text
- **loose**: 1.35 - For improved readability in longer content

## Usage Guidelines

### Text Hierarchy
1. **Display/Headings**: Use xl size with black weight
2. **Subheadings**: Use lg size with bold weight
3. **Body Text**: Use base size with normal weight
4. **Secondary Text**: Use sm size with normal weight
5. **Captions/Labels**: Use xs size with medium weight

### Responsive Typography
- Font sizes scale appropriately across different screen sizes
- Maintain consistent hierarchy regardless of device

### Accessibility
- Minimum contrast ratios met for all text combinations
- Line heights ensure comfortable reading
- Font sizes meet WCAG guidelines for minimum readable text

### CSS Custom Properties

Typography tokens are defined as CSS variables:

```css
--font-family-primary: 'Satoshi Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-secondary: 'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-tertiary: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 22px;
--font-size-xl: 32px;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;

--line-height-tight: 1.21;
--line-height-normal: 1.25;
--line-height-loose: 1.35;
```
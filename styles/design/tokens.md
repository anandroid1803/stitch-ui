# Design Tokens

## Overview

This document outlines all design tokens extracted from the Figma design system. These tokens form the foundation of the design system and are implemented as CSS custom properties in the Tailwind CSS v4 theme.

## Color Tokens

### Primary Colors
```css
--color-primary: #5B2165;
```

### Neutral Colors
```css
--color-background: #F7F8FA;
--color-surface: rgba(255, 255, 255, 0.5);
--color-surface-light: #F2F3F5;
--color-white: #FFFFFF;

--color-text-primary: #1E1E1E;
--color-text-secondary: #434343;
--color-text-tertiary: #ACB0B0;
--color-border: #CACACC;
```

### Semantic Colors
```css
--color-success: #40916C;
--color-error: #FF0050;
--color-warning: #B41D75;
--color-info: #1B81B0;

--color-accent-pink: #B41D75;
--color-accent-purple: #651BB0;
--color-accent-dark-pink: #B01B4F;
```

## Typography Tokens

### Font Families
```css
--font-family-primary: 'Satoshi Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-secondary: 'Libre Franklin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-tertiary: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```css
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 22px;
--font-size-xl: 32px;
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-black: 900;
```

### Line Heights
```css
--line-height-tight: 1.21;
--line-height-normal: 1.25;
--line-height-loose: 1.35;
```

## Spacing Tokens

### Spacing Scale (4px base unit)
```css
--spacing-0: 0px;
--spacing-1: 2px;
--spacing-2: 4px;
--spacing-3: 6px;
--spacing-4: 8px;
--spacing-5: 10px;
--spacing-6: 12px;
--spacing-8: 16px;
--spacing-10: 20px;
--spacing-12: 24px;
```

## Border Radius Tokens

```css
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
--border-radius-xl: 16px;
--border-radius-2xl: 20px;
--border-radius-3xl: 24px;
--border-radius-full: 9999px;
```

## Shadow Tokens

```css
--shadow-sm: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
--shadow-md: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Implementation

### Tailwind CSS v4 Integration

All tokens are integrated into the Tailwind theme using CSS custom properties:

```css
@theme inline {
  /* Colors */
  --color-primary: #5B2165;
  --color-background: #F7F8FA;
  /* ... all other tokens */

  /* Typography */
  --font-family-primary: 'Satoshi Variable', ...;
  --font-size-xs: 12px;
  /* ... all typography tokens */

  /* Spacing */
  --spacing-1: 2px;
  --spacing-2: 4px;
  /* ... all spacing tokens */
}
```

### Usage Examples

#### Colors in Tailwind Classes
```html
<!-- Primary brand color -->
<div class="bg-primary text-white">Primary Button</div>

<!-- Semantic colors -->
<div class="bg-success text-white">Success Message</div>
<div class="bg-error text-white">Error Message</div>

<!-- Neutral colors -->
<div class="bg-background text-text-primary">Content Area</div>
```

#### Typography in Tailwind Classes
```html
<!-- Font families -->
<h1 class="font-primary font-black text-xl">Main Heading</h1>
<p class="font-secondary text-base">Body text</p>

<!-- Font sizes -->
<p class="text-xs">Caption</p>
<p class="text-sm">Small text</p>
<p class="text-base">Body text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Heading</p>
```

#### Spacing in Tailwind Classes
```html
<!-- Spacing scale -->
<div class="p-2 m-4 gap-6">Spaced content</div>

<!-- Border radius -->
<div class="rounded-sm rounded-md rounded-lg">Various border radii</div>
```

## Maintenance

### Adding New Tokens

1. **Colors**: Add to the color palette with semantic naming
2. **Typography**: Follow the existing scale patterns
3. **Spacing**: Use the 4px base unit for consistency
4. **Update Documentation**: Keep this file and color/typography docs in sync

### Token Naming Convention

- **Colors**: `primary`, `background`, `text-primary`, `success`, etc.
- **Typography**: `font-family-primary`, `font-size-base`, `font-weight-bold`
- **Spacing**: `spacing-1`, `spacing-2`, etc. (4px increments)
- **Border Radius**: `border-radius-sm`, `border-radius-md`, etc.

## Figma Integration

Tokens are extracted from the Figma design file and maintained in sync with the design system. When updating designs in Figma, corresponding tokens should be updated here to maintain consistency.
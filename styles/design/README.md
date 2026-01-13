# Design System

This directory contains the comprehensive design system for the application, extracted from the Figma design file.

## Files

- **`tokens.md`** - Complete reference of all design tokens
- **`colors.md`** - Color palette and usage guidelines
- **`typography.md`** - Typography scale and font specifications

## Implementation

The design system is implemented using Tailwind CSS v4 theme variables in `app/globals.css`. All tokens are available as CSS custom properties and integrated into Tailwind's utility classes.

## Usage Examples

### Colors
```html
<!-- Primary brand color -->
<div class="bg-primary text-white">Primary Button</div>

<!-- Semantic colors -->
<div class="bg-success text-white">Success Message</div>
<div class="bg-error text-white">Error Message</div>

<!-- Neutral colors -->
<div class="bg-background text-text-primary">Content Area</div>
```

### Typography
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

### Spacing & Layout
```html
<!-- Spacing scale -->
<div class="p-2 m-4 gap-6">Spaced content</div>

<!-- Border radius -->
<div class="rounded-sm rounded-md rounded-lg">Various border radii</div>

<!-- Shadows -->
<div class="shadow-sm shadow-md shadow-lg">Different shadow depths</div>
```

## Maintenance

When updating the design system:

1. **Update Figma first** - Make changes in the design file
2. **Extract new tokens** - Update the token values from Figma
3. **Update documentation** - Keep all `.md` files in sync
4. **Update CSS variables** - Modify `app/globals.css` accordingly
5. **Test across components** - Ensure changes work across the application

## Token Categories

- **Colors**: Primary, neutral, semantic, and accent colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale based on 4px units
- **Border Radius**: Standardized corner radius values
- **Shadows**: Box shadow definitions for depth

## Browser Support

The design system uses modern CSS features with fallbacks:
- CSS custom properties with fallbacks
- Modern font stacks with system font fallbacks
- Progressive enhancement for newer features
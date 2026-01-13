# Color System

## Overview

The design system uses a carefully curated color palette extracted from the Figma design. Colors are organized into semantic categories for consistent usage across the application.

## Primary Colors

### Brand Purple
- **Primary**: `#5B2165` - Main brand color used for primary actions and brand elements

## Neutral Grays

### Background & Surface Colors
- **Background**: `#F7F8FA` - Main page background
- **Surface**: `rgba(255, 255, 255, 0.5)` - Semi-transparent white for overlays and cards
- **Surface Light**: `#F2F3F5` - Light gray background for secondary surfaces
- **White**: `#FFFFFF` - Pure white for content areas

### Text Colors
- **Text Primary**: `#1E1E1E` - Primary text color for headings and important content
- **Text Secondary**: `#434343` - Secondary text color for body content
- **Text Tertiary**: `#ACB0B0` - Tertiary text color for muted content and labels
- **Border**: `#CACACC` - Color for borders, dividers, and passive/inactive icons

## Accent Colors

### Status & Feedback Colors
- **Success**: `#40916C` - Green for success states and positive feedback
- **Error**: `#FF0050` - Red for error states and destructive actions
- **Warning**: `#B41D75` - Pink for warning states
- **Info**: `#1B81B0` - Blue for informational content

### Additional Accents
- **Accent Pink**: `#B41D75` - Bright pink for highlights
- **Accent Purple**: `#651BB0` - Deep purple accent
- **Accent Dark Pink**: `#B01B4F` - Dark pink variant

## Usage Guidelines

### Semantic Usage
- **Primary**: Use for primary buttons, links, and brand elements
- **Success/Error/Warning/Info**: Use for status indicators, alerts, and feedback
- **Neutrals**: Use for backgrounds, borders, text hierarchy, and passive/inactive icons

### Accessibility
- Ensure sufficient contrast ratios between text and background colors
- Primary text (#1E1E1E) should be used on light backgrounds
- Use text-tertiary (#ACB0B0) sparingly for subtle content

### Color Variables

The colors are defined as CSS custom properties in the Tailwind theme:

```css
--color-primary: #5B2165;
--color-background: #F7F8FA;
--color-surface: rgba(255, 255, 255, 0.5);
/* ... additional colors */
```
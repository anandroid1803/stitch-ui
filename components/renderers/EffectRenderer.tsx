'use client';

import type { Effect, ShadowEffect } from '@/types/effects';
import { isShadowEffect } from '@/types/effects';

/**
 * Get effect props for rendering effects on a Konva shape
 * Returns props to be spread onto a Konva shape
 *
 * Note: Konva supports one shadow at a time, so we use the topmost
 * enabled drop-shadow effect. Inner shadows and multiple effects
 * would require custom rendering logic.
 */
export function useEffectProps(effects?: Effect[]) {
  if (!effects || effects.length === 0) {
    return {};
  }

  // Get enabled effects
  const enabledEffects = effects.filter(e => e.enabled);

  if (enabledEffects.length === 0) {
    return {};
  }

  // Find the topmost drop-shadow effect
  const dropShadows = enabledEffects.filter(
    e => isShadowEffect(e) && e.type === 'drop-shadow'
  ) as ShadowEffect[];

  if (dropShadows.length === 0) {
    return {};
  }

  // Use the topmost drop-shadow (last in array)
  const shadow = dropShadows[dropShadows.length - 1];

  return {
    shadowColor: shadow.color,
    shadowBlur: shadow.blur,
    shadowOffset: { x: shadow.offsetX, y: shadow.offsetY },
    shadowOpacity: shadow.opacity,
  };
}

/**
 * Get enabled effects from an element
 */
export function getEnabledEffects(effects?: Effect[]): Effect[] {
  if (!effects || effects.length === 0) return [];
  return effects.filter(e => e.enabled);
}

/**
 * Check if element has any enabled effects
 */
export function hasEffects(effects?: Effect[]): boolean {
  return getEnabledEffects(effects).length > 0;
}

/**
 * Get all enabled drop shadows
 */
export function getDropShadows(effects?: Effect[]): ShadowEffect[] {
  const enabled = getEnabledEffects(effects);
  return enabled.filter(
    e => isShadowEffect(e) && e.type === 'drop-shadow'
  ) as ShadowEffect[];
}

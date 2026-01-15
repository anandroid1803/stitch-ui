// Effect Types for Universal Effect System

export type EffectType = 'drop-shadow' | 'inner-shadow' | 'blur';

export interface BaseEffect {
  id: string;
  type: EffectType;
  enabled: boolean;
}

export interface ShadowEffect extends BaseEffect {
  type: 'drop-shadow' | 'inner-shadow';
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;     // rgba or hex with alpha
  opacity: number;   // 0-1
}

export interface BlurEffect extends BaseEffect {
  type: 'blur';
  radius: number;
}

export type Effect = ShadowEffect | BlurEffect;

// Type guards
export function isShadowEffect(effect: Effect): effect is ShadowEffect {
  return effect.type === 'drop-shadow' || effect.type === 'inner-shadow';
}

export function isBlurEffect(effect: Effect): effect is BlurEffect {
  return effect.type === 'blur';
}

// Factory functions
export function createShadowEffect(
  offsetX: number,
  offsetY: number,
  blur: number,
  color: string,
  opacity = 1,
  type: 'drop-shadow' | 'inner-shadow' = 'drop-shadow'
): ShadowEffect {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type,
    enabled: true,
    offsetX,
    offsetY,
    blur,
    color,
    opacity,
  };
}

export function createBlurEffect(radius: number): BlurEffect {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: 'blur',
    enabled: true,
    radius,
  };
}

/**
 * Sistema de Tokens de Design - Let's Roll
 * Centraliza todos os valores de design para consistência e manutenibilidade
 */

/**
 * Escala de espaçamento (8px base)
 */
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
} as const

/**
 * Tokens de tipografia
 */
export const typography = {
  fontFamily: {
    sans: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'sans-serif',
    ].join(', '),
    mono: [
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ].join(', '),
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

/**
 * Paleta de cores completa
 */
export const colors = {
  // Cores principais do tema
  primary: {
    50: '#F3E8FF',
    100: '#E9D5FF',
    200: '#D8B4FE',
    300: '#C084FC',
    400: '#A855F7',
    500: '#8000FF', // Accent principal
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // Cores semânticas
  semantic: {
    success: {
      light: '#10B981',
      DEFAULT: '#22C55E',
      dark: '#059669',
    },
    error: {
      light: '#EF4444',
      DEFAULT: '#DC2626',
      dark: '#B91C1C',
    },
    warning: {
      light: '#F59E0B',
      DEFAULT: '#F97316',
      dark: '#D97706',
    },
    info: {
      light: '#3B82F6',
      DEFAULT: '#2563EB',
      dark: '#1D4ED8',
    },
  },
  // Recursos do RPG
  rpg: {
    pv: {
      light: '#F87171',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
    },
    pe: {
      light: '#4ADE80',
      DEFAULT: '#22C55E',
      dark: '#16A34A',
    },
    san: {
      light: '#FCD34D',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
    },
    xp: {
      light: '#A855F7',
      DEFAULT: '#8000FF',
      dark: '#6D28D9',
    },
  },
  // Neutros
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const

/**
 * Sistema de elevação (sombras)
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: {
    sm: '0 0 10px rgba(128, 0, 255, 0.3)',
    md: '0 0 20px rgba(128, 0, 255, 0.4)',
    lg: '0 0 30px rgba(128, 0, 255, 0.5)',
    xl: '0 0 40px rgba(128, 0, 255, 0.6)',
  },
} as const

/**
 * Tokens de animação
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  delay: {
    none: '0ms',
    short: '100ms',
    medium: '200ms',
    long: '300ms',
  },
} as const

/**
 * Breakpoints responsivos
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

/**
 * Border radius
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const

/**
 * Z-index layers
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const

/**
 * Opacidade
 */
export const opacity = {
  transparent: '0',
  '10': '0.1',
  '20': '0.2',
  '30': '0.3',
  '40': '0.4',
  '50': '0.5',
  '60': '0.6',
  '70': '0.7',
  '80': '0.8',
  '90': '0.9',
  opaque: '1',
} as const

/**
 * Tokens de design consolidados
 */
export const designTokens = {
  spacing,
  typography,
  colors,
  shadows,
  animations,
  breakpoints,
  borderRadius,
  zIndex,
  opacity,
} as const

/**
 * Helper para acessar tokens de forma type-safe
 */
export type SpacingKey = keyof typeof spacing
export type ColorKey = keyof typeof colors
export type ShadowKey = keyof typeof shadows
export type AnimationDurationKey = keyof typeof animations.duration
export type AnimationEasingKey = keyof typeof animations.easing
export type BreakpointKey = keyof typeof breakpoints

/**
 * Funções utilitárias para tokens
 */
export const tokenUtils = {
  /**
   * Obtém valor de espaçamento
   */
  spacing: (key: SpacingKey): string => spacing[key],

  /**
   * Obtém cor da paleta
   */
  color: (category: keyof typeof colors, key?: string): string => {
    const categoryColors = colors[category]
    if (typeof categoryColors === 'object' && 'DEFAULT' in categoryColors) {
      return categoryColors.DEFAULT as string
    }
    return categoryColors as unknown as string
  },

  /**
   * Obtém sombra
   */
  shadow: (key: ShadowKey): string => shadows[key],

  /**
   * Obtém duração de animação
   */
  animationDuration: (key: AnimationDurationKey): string =>
    animations.duration[key],

  /**
   * Obtém easing de animação
   */
  animationEasing: (key: AnimationEasingKey): string => animations.easing[key],

  /**
   * Obtém breakpoint
   */
  breakpoint: (key: BreakpointKey): string => breakpoints[key],
}

export default designTokens


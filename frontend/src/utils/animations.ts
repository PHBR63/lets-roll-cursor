/**
 * Sistema Centralizado de Animações
 * Presets reutilizáveis de animação usando framer-motion
 */

import { Variants, Transition } from 'framer-motion'
import { animations } from '@/design-system/tokens'

/**
 * Presets de animação de entrada
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUp: Variants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
}

export const slideDown: Variants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
}

export const slideLeft: Variants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
}

export const slideRight: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

export const scaleUp: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

export const rotateIn: Variants = {
  initial: { rotate: -180, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
}

/**
 * Presets de animação de hover
 */
export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: { y: -4 },
}

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
}

export const hoverGlow: Variants = {
  initial: { boxShadow: '0 0 0px rgba(128, 0, 255, 0)' },
  hover: { boxShadow: '0 0 20px rgba(128, 0, 255, 0.5)' },
}

/**
 * Presets de animação de loading
 */
export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

/**
 * Presets de transição
 */
export const transitions = {
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  normal: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  slow: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  slower: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
  },
} as const

/**
 * Animações de stagger (cascata)
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerFast: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerSlow: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

/**
 * Animações específicas para componentes
 */
export const modalAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

export const backdropAnimation: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const toastAnimation: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
}

export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -8,
    scale: 1.02,
    transition: transitions.normal,
  },
}

export const buttonPress: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.95 },
}

/**
 * Helper para criar animação customizada
 */
export function createAnimation(
  initial: Record<string, unknown>,
  animate: Record<string, unknown>,
  exit?: Record<string, unknown>
): Variants {
  return {
    initial,
    animate,
    exit: exit || initial,
  }
}

/**
 * Helper para criar transição customizada
 */
export function createTransition(
  duration: number = 0.2,
  ease: string | [number, number, number, number] = 'easeInOut'
): Transition {
  if (typeof ease === 'string') {
    return { duration, ease }
  }
  return { duration, ease }
}

/**
 * Animações combinadas
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const slideInScale: Variants = {
  initial: { x: -20, opacity: 0, scale: 0.95 },
  animate: { x: 0, opacity: 1, scale: 1 },
  exit: { x: 20, opacity: 0, scale: 0.95 },
}

/**
 * Exportar todas as animações
 */
export const animationPresets = {
  // Entrada
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  scaleUp,
  rotateIn,
  fadeInUp,
  fadeInScale,
  slideInScale,
  // Hover
  hoverLift,
  hoverScale,
  hoverGlow,
  cardHover,
  // Loading
  pulse,
  shimmer,
  spin,
  // Componentes
  modalAnimation,
  backdropAnimation,
  toastAnimation,
  buttonPress,
  // Stagger
  staggerContainer,
  staggerFast,
  staggerSlow,
  // Transições
  transitions,
  // Helpers
  createAnimation,
  createTransition,
} as const

export default animationPresets


/**
 * Constantes de cores do tema Let's Roll
 * Tema Dark Game: Roxo Escuro + Roxo Vibrante
 */

export const colors = {
  // Cores principais
  background: '#1A0033', // hsl(271, 100%, 10%)
  card: '#2A2A3A', // hsl(240, 16%, 20%)
  accent: '#8000FF', // hsl(270, 100%, 50%)
  accentLight: '#B366FF', // Roxo claro para hover
  
  // Recursos do RPG
  pv: '#FF0000', // Vida (vermelho)
  pe: '#00FF00', // Energia (verde)
  san: '#FFFF00', // Sanidade (amarelo)
  xp: '#8000FF', // Experiência (roxo)
  
  // Estados
  success: '#00FF00',
  error: '#FF0000',
  warning: '#FFA500',
  info: '#8000FF',
  
  // Textos
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
} as const

export type ColorKey = keyof typeof colors


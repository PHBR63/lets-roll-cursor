/**
 * Hook para gerenciar preferências de acessibilidade
 * Lê preferências do sistema e do usuário
 */
import { useState, useEffect } from 'react'

interface AccessibilityPreferences {
  /**
   * Se deve reduzir animações (prefers-reduced-motion)
   */
  reducedMotion: boolean
  /**
   * Se deve desabilitar efeitos visuais (preferência do usuário)
   */
  disableVisualEffects: boolean
  /**
   * Se deve desabilitar sons (preferência do usuário)
   */
  disableSounds: boolean
}

/**
 * Hook para gerenciar preferências de acessibilidade
 */
export function useAccessibility(): AccessibilityPreferences {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [disableVisualEffects, setDisableVisualEffects] = useState(() => {
    const stored = localStorage.getItem('accessibility-disable-visual-effects')
    return stored === 'true'
  })
  const [disableSounds, setDisableSounds] = useState(() => {
    const stored = localStorage.getItem('accessibility-disable-sounds')
    return stored === 'true'
  })

  useEffect(() => {
    // Verificar prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    reducedMotion,
    disableVisualEffects,
    disableSounds,
  }
}

/**
 * Função para atualizar preferências de acessibilidade
 */
export function updateAccessibilityPreferences(
  preferences: Partial<AccessibilityPreferences>
) {
  if (preferences.disableVisualEffects !== undefined) {
    localStorage.setItem(
      'accessibility-disable-visual-effects',
      preferences.disableVisualEffects.toString()
    )
  }
  if (preferences.disableSounds !== undefined) {
    localStorage.setItem(
      'accessibility-disable-sounds',
      preferences.disableSounds.toString()
    )
  }
}


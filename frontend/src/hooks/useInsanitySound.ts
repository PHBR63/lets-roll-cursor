/**
 * Hook para gerenciar efeitos sonoros de insanidade
 * Toca sons baseados no estado de SAN do personagem
 */
import { useEffect, useRef, useState } from 'react'
import type { InsanityState } from './useInsanityState'
import { useInsanityState } from './useInsanityState'
import { useAccessibility } from './useAccessibility'

interface UseInsanitySoundOptions {
  /**
   * Se os sons estão habilitados (padrão: true)
   */
  enabled?: boolean
  /**
   * Volume dos sons (0-1, padrão: 0.3)
   */
  volume?: number
  /**
   * Se deve tocar sons apenas em transições (padrão: false)
   */
  transitionOnly?: boolean
}

/**
 * Hook para gerenciar efeitos sonoros de insanidade
 */
export function useInsanitySound(
  currentSAN: number,
  maxSAN: number,
  options: UseInsanitySoundOptions = {}
) {
  const { enabled: optionEnabled = true, volume = 0.3, transitionOnly = false } = options
  const { disableSounds } = useAccessibility()
  const enabled = optionEnabled && !disableSounds
  const insanityState = useInsanityState(currentSAN, maxSAN)
  const [previousState, setPreviousState] = useState<InsanityState | null>(null)
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())

  // Inicializar áudios
  useEffect(() => {
    if (!enabled) return

    // Criar elementos de áudio para cada estado
    const audioFiles: Record<InsanityState, string> = {
      NORMAL: '', // Sem som para normal
      ABALADO_MENTAL: '', // Som sutil opcional
      PERTURBADO: '/sounds/insanity-low.mp3', // Som de tensão
      ENLOUQUECENDO: '/sounds/insanity-medium.mp3', // Som de alerta
      TOTALMENTE_INSANO: '/sounds/insanity-critical.mp3', // Som crítico
    }

    Object.entries(audioFiles).forEach(([state, src]) => {
      if (src) {
        const audio = new Audio(src)
        audio.volume = volume
        audio.loop = state === 'TOTALMENTE_INSANO' || state === 'ENLOUQUECENDO'
        audioRefs.current.set(state, audio)
      }
    })

    return () => {
      // Limpar áudios ao desmontar
      audioRefs.current.forEach((audio: HTMLAudioElement) => {
        audio.pause()
        audio.src = ''
      })
      audioRefs.current.clear()
    }
  }, [enabled, volume])

  // Tocar sons baseado no estado
  useEffect(() => {
    if (!enabled) return

    const currentState = insanityState.state
    const previous = previousState

    // Se transitionOnly, tocar apenas em transições
    if (transitionOnly && previous === currentState) {
      return
    }

    // Parar som anterior se mudou de estado
    if (previous && previous !== currentState) {
      const prevAudio = audioRefs.current.get(previous)
      if (prevAudio) {
        prevAudio.pause()
        prevAudio.currentTime = 0
      }
    }

    // Tocar som do estado atual
    const currentAudio = audioRefs.current.get(currentState)
    if (currentAudio && currentState !== 'NORMAL' && currentState !== 'ABALADO_MENTAL') {
      currentAudio.play().catch((err: unknown) => {
        // Ignorar erros de autoplay (precisa de interação do usuário)
        console.debug('Erro ao tocar som de insanidade:', err)
      })
    }

    setPreviousState(currentState)
  }, [insanityState.state, enabled, transitionOnly, previousState])

  // Ajustar volume dinamicamente baseado na intensidade
  useEffect(() => {
    if (!enabled) return

    const currentAudio = audioRefs.current.get(insanityState.state)
    if (currentAudio) {
      currentAudio.volume = volume * insanityState.intensity
    }
  }, [insanityState.intensity, insanityState.state, volume, enabled])

  return {
    /**
     * Parar todos os sons
     */
    stopAll: () => {
      audioRefs.current.forEach((audio: HTMLAudioElement) => {
        audio.pause()
        audio.currentTime = 0
      })
    },
    /**
     * Estado atual de insanidade
     */
    state: insanityState.state,
  }
}


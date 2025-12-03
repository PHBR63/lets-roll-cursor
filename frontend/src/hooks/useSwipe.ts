import { useRef, useState, useCallback } from 'react'

/**
 * Opções do hook de swipe
 */
interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number // Distância mínima para considerar swipe (px)
  velocity?: number // Velocidade mínima (px/ms)
}

/**
 * Hook para detectar gestos de swipe
 * Retorna handlers e estado do swipe
 */
export function useSwipe(options: UseSwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3,
  } = options

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)

  /**
   * Handler para início do toque
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    setSwipeDirection(null)
  }, [])

  /**
   * Handler para movimento do toque
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevenir scroll durante swipe
    if (touchStart.current) {
      e.preventDefault()
    }
  }, [])

  /**
   * Handler para fim do toque
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const deltaTime = Date.now() - touchStart.current.time
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const speed = distance / deltaTime

      // Verificar se atendeu aos critérios de swipe
      if (distance >= threshold && speed >= velocity) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        // Determinar direção principal
        if (absX > absY) {
          // Swipe horizontal
          if (deltaX > 0) {
            setSwipeDirection('right')
            onSwipeRight?.()
          } else {
            setSwipeDirection('left')
            onSwipeLeft?.()
          }
        } else {
          // Swipe vertical
          if (deltaY > 0) {
            setSwipeDirection('down')
            onSwipeDown?.()
          } else {
            setSwipeDirection('up')
            onSwipeUp?.()
          }
        }
      }

      touchStart.current = null
    },
    [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]
  )

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    swipeDirection,
  }
}


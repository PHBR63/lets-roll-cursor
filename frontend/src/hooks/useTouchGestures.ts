// @ts-nocheck
import { useRef, useEffect, useState } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onLongPress?: () => void
  threshold?: number // Distância mínima para considerar swipe (px)
  longPressDelay?: number // Tempo para long press (ms)
}

/**
 * Hook para detectar gestos touch (swipe, pinch, tap, long press)
 */
export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          setIsLongPressing(true)
          onLongPress()
        }, longPressDelay)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Cancelar long press se mover
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      // Cancelar long press se já estava ativo
      if (isLongPressing) {
        setIsLongPressing(false)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Cancelar long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Se foi um tap (movimento pequeno e rápido)
      if (distance < threshold && deltaTime < 300 && !isLongPressing) {
        onTap?.()
      }

      // Se foi um swipe (movimento grande)
      if (distance >= threshold) {
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)

        if (absX > absY) {
          // Swipe horizontal
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          // Swipe vertical
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }

      touchStartRef.current = null
      setIsLongPressing(false)
    }

    // Pinch gesture (dois dedos)
    let initialDistance = 0
    const handleTouchStartMulti = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
      }
    }

    const handleTouchMoveMulti = (e: TouchEvent) => {
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        const scale = currentDistance / initialDistance
        onPinch(scale)
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)
    element.addEventListener('touchstart', handleTouchStartMulti)
    element.addEventListener('touchmove', handleTouchMoveMulti)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchstart', handleTouchStartMulti)
      element.removeEventListener('touchmove', handleTouchMoveMulti)
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onLongPress,
    threshold,
    longPressDelay,
    isLongPressing,
  ])

  return elementRef
}

/**
 * Hook para detectar orientação do dispositivo
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  )

  useEffect(() => {
    const handleResize = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return orientation
}

/**
 * Hook para detectar se é dispositivo touch
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    )
  }, [])

  return isTouch
}


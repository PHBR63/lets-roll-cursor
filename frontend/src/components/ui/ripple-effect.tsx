// @ts-nocheck
import { useState, useRef, MouseEvent, TouchEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Props do RippleEffect
 */
interface RippleEffectProps {
  /**
   * Cor do ripple
   */
  color?: string
  /**
   * Duração da animação (ms)
   */
  duration?: number
  /**
   * Opacidade do ripple
   */
  opacity?: number
}

/**
 * Hook para adicionar efeito ripple em elementos
 */
export function useRipple({
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 600,
  opacity = 0.5,
}: RippleEffectProps = {}) {
  const [ripples, setRipples] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
  }>>([])
  const rippleIdRef = useRef(0)

  /**
   * Cria um ripple no ponto de clique/toque
   */
  const createRipple = (
    event: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>
  ) => {
    const element = event.currentTarget
    const rect = element.getBoundingClientRect()

    let x: number
    let y: number

    if ('touches' in event && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left
      y = event.touches[0].clientY - rect.top
    } else if ('clientX' in event) {
      x = event.clientX - rect.left
      y = event.clientY - rect.top
    } else {
      return
    }

    const size = Math.max(rect.width, rect.height)
    const id = rippleIdRef.current++

    const newRipple = {
      id,
      x,
      y,
      size,
    }

    setRipples((prev) => [...prev, newRipple])

    // Remover ripple após animação
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, duration)
  }

  /**
   * Componente de ripple
   */
  const RippleComponent = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color,
              opacity,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )

  return {
    createRipple,
    RippleComponent,
  }
}

/**
 * Componente wrapper que adiciona ripple automaticamente
 */
export function withRipple<P extends object>(
  Component: React.ComponentType<P>,
  rippleProps?: RippleEffectProps
) {
  return function RippleWrapper(props: P) {
    const { createRipple, RippleComponent } = useRipple(rippleProps)

    return (
      <div
        className="relative"
        onMouseDown={createRipple}
        onTouchStart={createRipple}
      >
        <Component {...props} />
        <RippleComponent />
      </div>
    )
  }
}


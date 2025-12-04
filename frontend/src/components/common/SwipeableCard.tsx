import { ReactNode, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useSwipe } from '@/hooks/useSwipe'

/**
 * Props do card deslizável
 */
interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: ReactNode
  rightAction?: ReactNode
  threshold?: number
  disabled?: boolean
  className?: string
}

/**
 * Card que pode ser deslizado para revelar ações
 * Útil para ações rápidas em mobile
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  disabled = false,
  className = '',
}: SwipeableCardProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-threshold, 0, threshold], [0, 1, 0])
  const cardRef = useRef<HTMLDivElement>(null)

  const { handleTouchStart, handleTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      if (!disabled && onSwipeLeft) {
        onSwipeLeft()
        x.set(0)
      }
    },
    onSwipeRight: () => {
      if (!disabled && onSwipeRight) {
        onSwipeRight()
        x.set(0)
      }
    },
    threshold: threshold * 0.5,
  })

  /**
   * Handler para arrastar (drag)
   */
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (disabled) return

    const offset = info.offset.x
    const velocity = info.velocity.x

    // Se arrastou além do threshold ou com velocidade suficiente
    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Resetar posição
    x.set(0)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Ação esquerda (aparece ao deslizar para direita) */}
      {leftAction && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-start px-4 bg-red-500/80 z-0"
          style={{ opacity, width: threshold }}
        >
          {leftAction}
        </motion.div>
      )}

      {/* Ação direita (aparece ao deslizar para esquerda) */}
      {rightAction && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end px-4 bg-green-500/80 z-0"
          style={{ opacity, width: threshold }}
        >
          {rightAction}
        </motion.div>
      )}

      {/* Card principal */}
      <motion.div
        ref={cardRef}
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10"
      >
        <Card className="bg-card border-card-secondary">{children}</Card>
      </motion.div>
    </div>
  )
}


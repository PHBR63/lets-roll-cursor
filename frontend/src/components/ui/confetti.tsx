// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Props do Confetti
 */
interface ConfettiProps {
  /**
   * Ativar confetti
   */
  active: boolean
  /**
   * Duração da animação (ms)
   */
  duration?: number
  /**
   * Número de partículas
   */
  count?: number
  /**
   * Cores das partículas
   */
  colors?: string[]
  /**
   * Callback quando animação termina
   */
  onComplete?: () => void
}

/**
 * Componente de confetti para celebrações
 * Exibe partículas coloridas caindo
 */
export function Confetti({
  active,
  duration = 3000,
  count = 50,
  colors = ['#8000FF', '#A855F7', '#C084FC', '#22C55E', '#F59E0B', '#EF4444'],
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    color: string
    delay: number
  }>>([])

  useEffect(() => {
    if (active) {
      // Criar partículas
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      // Limpar após animação
      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setParticles([])
    }
  }, [active, count, colors, duration, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${particle.x}%`,
                backgroundColor: particle.color,
                top: '-10px',
              }}
              initial={{ y: -10, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 100,
                opacity: [1, 1, 0],
                rotate: 360,
                x: [
                  0,
                  (Math.random() - 0.5) * 100,
                  (Math.random() - 0.5) * 200,
                ],
              }}
              transition={{
                duration: duration / 1000,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}


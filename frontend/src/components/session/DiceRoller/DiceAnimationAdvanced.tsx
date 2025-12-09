// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dice1 } from 'lucide-react'

/**
 * Props do DiceAnimationAdvanced
 */
interface DiceAnimationAdvancedProps {
  /**
   * Resultado final da rolagem
   */
  result: number
  /**
   * Tipo de dado (4, 6, 8, 10, 12, 20, 100)
   */
  dice?: number
  /**
   * É crítico?
   */
  isCritical?: boolean
  /**
   * Callback quando animação completa
   */
  onComplete?: () => void
}

/**
 * Animação avançada de rolagem de dados
 * Inclui efeito 3D, shake, partículas e contagem
 */
export function DiceAnimationAdvanced({
  result,
  dice = 20,
  isCritical = false,
  onComplete,
}: DiceAnimationAdvancedProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [displayResult, setDisplayResult] = useState<number | null>(null)
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    // Fase 1: Shake e números aleatórios
    const shakeDuration = 800
    const interval = setInterval(() => {
      setDisplayResult(Math.floor(Math.random() * dice) + 1)
    }, 100)

    // Fase 2: Revelar resultado
    setTimeout(() => {
      clearInterval(interval)
      setDisplayResult(result)
      if (isCritical) {
        setShowParticles(true)
      }
    }, shakeDuration)

    // Fase 3: Completar
    setTimeout(() => {
      setIsAnimating(false)
      if (onComplete) {
        setTimeout(onComplete, 500)
      }
    }, shakeDuration + 1000)

    return () => clearInterval(interval)
  }, [result, dice, isCritical, onComplete])

  return (
    <div className="relative flex items-center justify-center min-h-[200px]">
      <AnimatePresence>
        {isAnimating && (
          <>
            {/* Dado principal com animação 3D */}
            <motion.div
              className="relative"
              initial={{ rotateX: 0, rotateY: 0 }}
              animate={{
                rotateX: [0, 360, 0],
                rotateY: [0, 180, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <Dice1
                  className={`w-24 h-24 ${
                    isCritical ? 'text-yellow-400' : 'text-accent'
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Número sendo exibido */}
            {displayResult !== null && (
              <motion.div
                key={displayResult}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <span
                  className={`text-6xl font-bold ${
                    isCritical
                      ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]'
                      : 'text-white'
                  }`}
                >
                  {displayResult}
                </span>
              </motion.div>
            )}

            {/* Partículas de crítico */}
            {showParticles && isCritical && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [1, 1, 0],
                      x: [
                        0,
                        (Math.random() - 0.5) * 200,
                        (Math.random() - 0.5) * 300,
                      ],
                      y: [
                        0,
                        (Math.random() - 0.5) * 200,
                        (Math.random() - 0.5) * 300,
                      ],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Efeito de brilho em resultados altos */}
            {displayResult !== null && displayResult >= dice * 0.8 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{
                    background: `radial-gradient(circle, rgba(128, 0, 255, 0.5) 0%, transparent 70%)`,
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Resultado final */}
      {!isAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div
            className={`text-7xl font-bold mb-2 ${
              isCritical
                ? 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,1)]'
                : 'text-white'
            }`}
          >
            {result}
          </div>
          {isCritical && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-yellow-400"
            >
              CRÍTICO!
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}


import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Props do componente de animação de dados
 */
interface DiceAnimationProps {
  result: number
  dice: number[]
  onComplete?: () => void
}

/**
 * Componente de animação de rolagem de dados
 * Exibe animação visual quando dados são rolados
 */
export function DiceAnimation({ result, dice, onComplete }: DiceAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [displayResult, setDisplayResult] = useState<number | null>(null)

  useEffect(() => {
    // Animação de rolagem
    const animationDuration = 1000
    const interval = setInterval(() => {
      setDisplayResult(Math.floor(Math.random() * 20) + 1)
    }, 100)

    setTimeout(() => {
      clearInterval(interval)
      setDisplayResult(result)
      setIsAnimating(false)
      if (onComplete) {
        setTimeout(onComplete, 500)
      }
    }, animationDuration)

    return () => clearInterval(interval)
  }, [result, onComplete])

  return (
    <AnimatePresence>
      {isAnimating || displayResult !== null ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            className="bg-card border border-card-secondary rounded-lg p-8 text-center"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="text-6xl font-bold text-accent mb-4"
              animate={isAnimating ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
            >
              {displayResult || '?'}
            </motion.div>
            {dice.length > 0 && (
              <div className="text-text-secondary text-sm">
                Dados: [{dice.join(', ')}]
              </div>
            )}
            {!isAnimating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-lg mt-4"
              >
                Resultado: {result}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}


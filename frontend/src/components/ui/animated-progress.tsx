import * as React from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Props do componente de progresso animado
 */
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  showValue?: boolean
  duration?: number
  delay?: number
}

/**
 * Componente de barra de progresso animada
 * Usa framer-motion para animações suaves
 */
export function AnimatedProgress({
  value,
  max = 100,
  className,
  color = 'purple',
  showValue = false,
  duration = 0.8,
  delay = 0,
}: AnimatedProgressProps) {
  // Calcular percentual
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  // Animação suave do valor
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001,
  })

  // Atualizar valor animado quando percentage mudar
  React.useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(percentage)
    }, delay)

    return () => clearTimeout(timer)
  }, [percentage, spring, delay])

  // Transformar valor animado para largura
  const width = useTransform(spring, (val) => `${val}%`)

  // Cores por tipo
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  }

  const bgColorClasses = {
    red: 'bg-red-900/30',
    blue: 'bg-blue-900/30',
    green: 'bg-green-900/30',
    yellow: 'bg-yellow-900/30',
    purple: 'bg-purple-900/30',
  }

  return (
    <div className={cn('relative w-full overflow-hidden rounded-full', className)}>
      {/* Barra de fundo */}
      <div
        className={cn(
          'h-full w-full rounded-full',
          bgColorClasses[color]
        )}
        style={{ height: className?.includes('h-') ? undefined : '0.75rem' }}
      />

      {/* Barra animada */}
      <motion.div
        className={cn(
          'absolute top-0 left-0 h-full rounded-full transition-colors',
          colorClasses[color],
          'shadow-lg'
        )}
        style={{
          width,
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1], // easeOutCubic
        }}
      >
        {/* Efeito de brilho (opcional) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Valor exibido (opcional) */}
      {showValue && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + duration }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  )
}

/**
 * Componente de progresso com label e valores
 * Versão animada do ProgressBar
 */
interface AnimatedProgressBarProps {
  label: string
  current: number
  max: number
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
  showValues?: boolean
  className?: string
  duration?: number
  delay?: number
  size?: 'sm' | 'md' | 'lg'
}

export function AnimatedProgressBar({
  label,
  current,
  max,
  color = 'purple',
  showValues = true,
  className,
  duration = 0.8,
  delay = 0,
  size = 'md',
}: AnimatedProgressBarProps) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0

  const sizeClasses = {
    sm: 'text-xs space-y-1',
    md: 'text-sm space-y-2',
    lg: 'text-base space-y-2',
  }

  const barHeightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn(sizeClasses[size], className)}>
      <div className="flex justify-between items-center">
        <span className="text-text-secondary">{label}</span>
        {showValues && (
          <motion.span
            className="text-white font-semibold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + duration * 0.5 }}
          >
            {current}/{max}
          </motion.span>
        )}
      </div>
      <AnimatedProgress
        value={current}
        max={max}
        color={color}
        duration={duration}
        delay={delay}
        className={barHeightClasses[size]}
      />
    </div>
  )
}


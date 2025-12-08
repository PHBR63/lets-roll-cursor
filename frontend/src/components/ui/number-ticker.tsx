/**
 * Number Ticker - Contador animado de números
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  /**
   * Valor a ser exibido
   */
  value: number
  /**
   * Duração da animação em milissegundos (padrão: 2000)
   */
  duration?: number
  /**
   * Classe CSS adicional
   */
  className?: string
  /**
   * Se deve formatar como moeda
   */
  formatAsCurrency?: boolean
  /**
   * Se deve formatar com separador de milhares
   */
  formatWithCommas?: boolean
  /**
   * Prefixo do número
   */
  prefix?: string
  /**
   * Sufixo do número
   */
  suffix?: string
  /**
   * Direção da animação ('up' ou 'down', padrão: 'up')
   */
  direction?: 'up' | 'down'
}

/**
 * Componente Number Ticker
 * Anima números de forma suave
 */
export function NumberTicker({
  value,
  duration = 2000,
  className,
  formatAsCurrency = false,
  formatWithCommas = false,
  prefix = '',
  suffix = '',
  direction = 'up',
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef<number>(value)

  useEffect(() => {
    if (value === displayValue) return

    setIsAnimating(true)
    startValueRef.current = displayValue
    const startValue = displayValue
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue =
        direction === 'up'
          ? startValue + (endValue - startValue) * easeOut
          : startValue - (startValue - endValue) * easeOut

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        setIsAnimating(false)
        startTimeRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [value, duration, direction])

  const formatNumber = (num: number): string => {
    let formatted = num.toString()

    if (formatAsCurrency) {
      formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num)
    } else if (formatWithCommas) {
      formatted = new Intl.NumberFormat('pt-BR').format(num)
    }

    return `${prefix}${formatted}${suffix}`
  }

  return (
    <span
      className={cn(
        'inline-block tabular-nums',
        isAnimating && 'transition-all duration-75',
        className
      )}
    >
      {formatNumber(displayValue)}
    </span>
  )
}


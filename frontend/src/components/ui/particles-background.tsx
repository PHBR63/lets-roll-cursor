// @ts-nocheck
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do ParticlesBackground
 */
interface ParticlesBackgroundProps {
  /**
   * Número de partículas
   */
  count?: number
  /**
   * Cor das partículas
   */
  color?: string
  /**
   * Velocidade de movimento
   */
  speed?: number
  /**
   * Tamanho das partículas
   */
  size?: number
  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Background animado com partículas flutuantes
 */
export function ParticlesBackground({
  count = 50,
  color = '#8000FF',
  speed = 0.5,
  size = 2,
  className,
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Criar partículas
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
    }> = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * size + 1,
      })
    }

    // Função de animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Atualizar posição
        particle.x += particle.vx
        particle.y += particle.vy

        // Borda
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Desenhar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = 0.6
        ctx.fill()
      })

      // Conectar partículas próximas
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = color
            ctx.globalAlpha = 0.1 * (1 - distance / 100)
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [count, color, speed, size])

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-none z-0', className)}
      style={{ opacity: 0.3 }}
    />
  )
}


"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Componente Vortex - Background animado com partículas
 * Baseado no componente da Aceternity UI
 */
export interface VortexProps {
  className?: string
  containerClassName?: string
  particleCount?: number
  rangeY?: number
  baseHue?: number
  baseSpeed?: number
  rangeSpeed?: number
  baseRadius?: number
  rangeRadius?: number
  backgroundColor?: string
  children?: React.ReactNode
}

export function Vortex({
  className,
  containerClassName,
  particleCount = 700,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.0,
  rangeSpeed = 1.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "#000000",
  children,
}: VortexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Criar partículas
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      hue: number
      speed: number
    }

    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: baseRadius + Math.random() * rangeRadius,
        hue: baseHue + Math.random() * 60,
        speed: baseSpeed + Math.random() * rangeSpeed,
      })
    }

    // Função de animação
    let animationFrameId: number
    const animate = () => {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Atualizar e desenhar partículas
      particles.forEach((particle) => {
        // Atualizar posição
        particle.x += particle.vx * particle.speed
        particle.y += particle.vy * particle.speed

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Desenhar partícula
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%, 0.8)`
        ctx.fill()

        // Desenhar conexões entre partículas próximas
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `hsl(${particle.hue}, 70%, 60%, ${0.2 * (1 - distance / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [
    particleCount,
    rangeY,
    baseHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
    backgroundColor,
  ])

  return (
    <div className={cn("relative h-full w-full overflow-hidden", containerClassName)}>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 h-full w-full", className)}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}


// @ts-nocheck
import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do GlassCard
 */
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Intensidade do blur (0-20)
   */
  blur?: number
  /**
   * Opacidade do fundo (0-1)
   */
  opacity?: number
  /**
   * Mostrar borda brilhante
   */
  glow?: boolean
}

/**
 * Card com efeito glassmorphism
 * Fundo translúcido com blur e borda sutil
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, blur = 10, opacity = 0.1, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border border-white/10',
          'backdrop-blur-md',
          glow && 'shadow-lg shadow-accent/20',
          className
        )}
        style={{
          backgroundColor: `rgba(42, 42, 58, ${opacity})`,
          backdropFilter: `blur(${blur}px)`,
        }}
        {...props}
      >
        {glow && (
          <div
            className="absolute inset-0 rounded-lg opacity-50"
            style={{
              background:
                'linear-gradient(135deg, rgba(128, 0, 255, 0.1) 0%, rgba(128, 0, 255, 0.05) 100%)',
              filter: 'blur(20px)',
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    )
  }
)

GlassCard.displayName = 'GlassCard'


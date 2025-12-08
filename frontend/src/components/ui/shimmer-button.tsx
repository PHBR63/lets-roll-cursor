import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Shimmer Button - Botão com efeito shimmer/brilho
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
type VariantType = 'default' | 'primary' | 'secondary' | 'accent'
type SizeType = 'sm' | 'md' | 'lg' | 'xl'

interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
  /**
   * Variante do botão
   */
  variant?: VariantType
  /**
   * Tamanho do botão
   */
  size?: SizeType
  /**
   * Se deve mostrar shimmer constante (padrão: false, apenas no hover)
   */
  constantShimmer?: boolean
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "rgba(255,255,255,0.3)",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "0.5rem",
      background = "#8000FF",
      className = "",
      children,
      variant = 'default' as VariantType,
      size = 'md' as SizeType,
      constantShimmer = false,
      ...props
    },
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const variantStyles: Record<VariantType, { background: string; border: string; hoverBorder: string }> = {
      default: {
        background: '#8000FF',
        border: 'border-[#8000FF]/20',
        hoverBorder: 'hover:border-[#8000FF]',
      },
      primary: {
        background: '#8000FF',
        border: 'border-[#8000FF]/30',
        hoverBorder: 'hover:border-[#8000FF]',
      },
      secondary: {
        background: '#2A2A3A',
        border: 'border-[#8000FF]/20',
        hoverBorder: 'hover:border-[#8000FF]/50',
      },
      accent: {
        background: '#A855F7',
        border: 'border-[#A855F7]/20',
        hoverBorder: 'hover:border-[#A855F7]',
      },
    }

    const sizeStyles: Record<SizeType, string> = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      xl: 'px-12 py-6 text-lg',
    }

    const variantStyle = variantStyles[variant as VariantType]
    const sizeStyle = sizeStyles[size as SizeType]
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--background": variantStyle.background,
          } as React.CSSProperties
        }
        className={cn(
          "relative z-10 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
          "border font-semibold text-white",
          variantStyle.border,
          variantStyle.hoverBorder,
          sizeStyle,
          "transition-all duration-300 hover:scale-[1.02]",
          "hover:shadow-[0_0_20px_rgba(128,0,255,0.5)]",
          "before:absolute before:inset-0 before:rounded-[var(--border-radius)]",
          "before:bg-[linear-gradient(110deg,transparent,var(--shimmer-color),transparent)]",
          constantShimmer
            ? "before:translate-x-[100%] before:translate-y-[100%] before:animate-shimmer"
            : "before:translate-x-[-100%] before:translate-y-[-100%]",
          constantShimmer
            ? ""
            : "before:transition-transform before:duration-[var(--shimmer-duration)] before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:translate-x-[100%] hover:before:translate-y-[100%]",
          "after:absolute after:inset-[var(--shimmer-size)] after:rounded-[calc(var(--border-radius)-var(--shimmer-size))]",
          "after:bg-[var(--background)] after:content-['']",
          "after:z-[-1]",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"


import React from "react"
import { cn } from "@/lib/utils"

/**
 * Shimmer Button - Botão com efeito shimmer/brilho
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
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
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--background": background,
          } as React.CSSProperties
        }
        className={cn(
          "relative z-10 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
          "border border-[#8000FF]/20 px-6 py-3 text-sm font-semibold text-white",
          "transition-all duration-300 hover:scale-[1.02] hover:border-[#8000FF]",
          "hover:shadow-[0_0_20px_rgba(128,0,255,0.5)]",
          "before:absolute before:inset-0 before:rounded-[var(--border-radius)]",
          "before:bg-[linear-gradient(110deg,transparent,var(--shimmer-color),transparent)]",
          "before:translate-x-[-100%] before:translate-y-[-100%]",
          "before:transition-transform before:duration-[var(--shimmer-duration)]",
          "before:ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:before:translate-x-[100%] hover:before:translate-y-[100%]",
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


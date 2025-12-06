import * as React from "react"
import { cn } from "@/lib/utils"
import { AnimatedInput, AnimatedInputProps } from "./animated-input"

/**
 * Componente de input - agora usa AnimatedInput por padrão
 * Mantém compatibilidade com código existente
 */
export interface InputProps extends AnimatedInputProps {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Se tiver label, usar AnimatedInput, senão usar input simples
    if (props.label) {
      return <AnimatedInput ref={ref} type={type} className={className} {...props} />
    }

    // Input simples sem label (compatibilidade)
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#8000FF]/20 bg-[#2A2A3A] px-3 py-2 text-sm text-white",
          "placeholder:text-[#A0A0A0]",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8000FF] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 hover:border-[#8000FF]/40",
          "focus:border-[#8000FF] focus:shadow-[0_0_0_3px_rgba(128,0,255,0.1)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


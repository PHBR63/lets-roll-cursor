import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Animated Input - Input com label flutuante e animação de focus
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /**
   * Mensagem de erro
   */
  error?: string
  /**
   * Mensagem de sucesso
   */
  success?: string
  /**
   * Ícone à esquerda
   */
  leftIcon?: React.ReactNode
  /**
   * Ícone à direita
   */
  rightIcon?: React.ReactNode
  /**
   * Se deve mostrar contador de caracteres
   */
  showCharCount?: boolean
  /**
   * Limite de caracteres (para contador)
   */
  maxLength?: number
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ 
    className, 
    type, 
    label, 
    placeholder, 
    id, 
    error,
    success,
    leftIcon,
    rightIcon,
    showCharCount,
    maxLength,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setHasValue(value.length > 0)
      setCharCount(value.length)
      props.onChange?.(e)
    }

    const isLabelActive = isFocused || hasValue
    const hasError = !!error
    const hasSuccess = !!success && !hasError

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none z-10",
              leftIcon && "left-10",
              isLabelActive
                ? "top-2 text-xs"
                : "top-1/2 -translate-y-1/2 text-sm",
              hasError
                ? "text-red-500"
                : hasSuccess
                ? "text-green-500"
                : isLabelActive
                ? "text-[#8000FF]"
                : "text-[#A0A0A0]"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#A0A0A0]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            maxLength={maxLength}
            className={cn(
              "flex h-10 w-full rounded-md border bg-[#2A2A3A] text-sm text-white",
              "placeholder:text-transparent",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              hasError
                ? "border-red-500 focus-visible:ring-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                : hasSuccess
                ? "border-green-500 focus-visible:ring-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]"
                : isFocused
                ? "border-[#8000FF] focus-visible:ring-[#8000FF] shadow-[0_0_0_3px_rgba(128,0,255,0.1)]"
                : "border-[#8000FF]/20 hover:border-[#8000FF]/40",
              label && isLabelActive && "pt-5 pb-1",
              label && !isLabelActive && "py-2",
              !label && "py-2",
              className
            )}
            placeholder={label ? undefined : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#A0A0A0]">
              {rightIcon}
            </div>
          )}
        </div>
        {/* Mensagens de erro/sucesso e contador */}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex-1">
            {error && (
              <p className="text-xs text-red-500 animate-in fade-in-50">
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-xs text-green-500 animate-in fade-in-50">
                {success}
              </p>
            )}
          </div>
          {showCharCount && maxLength && (
            <p
              className={cn(
                "text-xs",
                charCount > maxLength * 0.9
                  ? "text-yellow-500"
                  : "text-[#A0A0A0]"
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }


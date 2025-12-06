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
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, type, label, placeholder, id, ...props }, ref) => {
    const inputId = id || React.useId()
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

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
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const isLabelActive = isFocused || hasValue

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              isLabelActive
                ? "top-2 text-xs text-[#8000FF]"
                : "top-1/2 -translate-y-1/2 text-sm text-[#A0A0A0]"
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border bg-[#2A2A3A] px-3 text-sm text-white",
            "placeholder:text-transparent",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8000FF] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            isFocused
              ? "border-[#8000FF] shadow-[0_0_0_3px_rgba(128,0,255,0.1)]"
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
      </div>
    )
  }
)
AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }


import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-[#8000FF]/20 bg-[#2A2A3A] px-3 py-2 text-sm text-white placeholder:text-[#A0A0A0]",
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
})
Textarea.displayName = "Textarea"

export { Textarea }

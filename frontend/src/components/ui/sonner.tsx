// @ts-nocheck
"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Sonner Toaster - Toast moderno com ícone e auto-dismiss
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#2A2A3A] group-[.toaster]:text-white group-[.toaster]:border-[#8000FF]/20 group-[.toaster]:shadow-lg group-[.toaster]:shadow-[0_0_20px_rgba(128,0,255,0.3)]",
          description: "group-[.toast]:text-[#A0A0A0]",
          actionButton:
            "group-[.toast]:bg-[#8000FF] group-[.toast]:text-white group-[.toast]:hover:bg-[#8000FF]/80",
          cancelButton:
            "group-[.toast]:bg-[#2A2A3A] group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }


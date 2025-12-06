import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Mesh Gradient - Gradient animado com mesh effect
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
interface MeshGradientProps {
  className?: string
  children?: React.ReactNode
}

export function MeshGradient({ className, children }: MeshGradientProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(128, 0, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(128, 0, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(179, 102, 255, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(26, 0, 51, 0.8) 0%, rgba(42, 42, 58, 0.6) 100%)
          `,
          backgroundSize: "200% 200%",
          animation: "mesh-gradient 15s ease infinite",
        }}
      />
      <style>{`
        @keyframes mesh-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}


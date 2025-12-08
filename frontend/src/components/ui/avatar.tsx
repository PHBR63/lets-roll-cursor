// @ts-nocheck
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

/**
 * Avatar with Status - Avatar circular com indicador de status
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#8000FF]/20",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-[#8000FF] text-white",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/**
 * Status Indicator - Indicador de status (online/offline)
 */
interface AvatarWithStatusProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  status?: "online" | "offline" | "away" | "busy"
  src?: string
  alt?: string
  fallback?: string
}

const AvatarWithStatus = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarWithStatusProps
>(({ status = "offline", src, alt, fallback, className, ...props }, ref) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  }

  return (
    <div className="relative inline-block">
      <Avatar ref={ref} className={className} {...props}>
        {src && <AvatarImage src={src} alt={alt} />}
        {fallback && <AvatarFallback>{fallback}</AvatarFallback>}
      </Avatar>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2A2A3A]",
            statusColors[status]
          )}
        />
      )}
    </div>
  )
})
AvatarWithStatus.displayName = "AvatarWithStatus"

export { Avatar, AvatarImage, AvatarFallback, AvatarWithStatus }


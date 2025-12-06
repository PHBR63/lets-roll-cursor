import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Chat Bubble - Interface de chat com bubbles, avatar, timestamp
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
interface ChatBubbleProps {
  message: string
  username?: string
  avatar?: string
  timestamp?: string
  isOwn?: boolean
  className?: string
}

export function ChatBubble({
  message,
  username,
  avatar,
  timestamp,
  isOwn = false,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isOwn && "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#8000FF] flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        {username && (
          <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
            <span className="text-xs font-semibold text-white">{username}</span>
            {timestamp && (
              <span className="text-xs text-[#A0A0A0]">{timestamp}</span>
            )}
          </div>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            "transition-all duration-200",
            isOwn
              ? "bg-[#8000FF] text-white rounded-br-sm"
              : "bg-[#2A2A3A] text-white border border-[#8000FF]/20 rounded-bl-sm"
          )}
        >
          {message}
        </div>
      </div>
    </div>
  )
}

interface ChatBubbleContainerProps {
  children: React.ReactNode
  className?: string
}

export function ChatBubbleContainer({
  children,
  className,
}: ChatBubbleContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 overflow-y-auto",
        "scrollbar-hide",
        className
      )}
    >
      {children}
    </div>
  )
}


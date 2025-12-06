import { cn } from "@/lib/utils"
import { ReactNode } from "react"

/**
 * Bento Grid Card - Layout de grid assimétrico estilo Bento Box
 * Baseado no componente do 21st.dev Magic UI
 * Customizado para tema roxo Let's Roll
 */
interface BentoGridProps {
  className?: string
  children: ReactNode
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-max grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoCardProps {
  className?: string
  name?: string
  description?: string
  header?: ReactNode
  icon?: ReactNode
  href?: string
  onClick?: () => void
  children?: ReactNode
  backgroundImage?: string
}

export function BentoCard({
  className,
  name,
  description,
  header,
  icon,
  href,
  onClick,
  children,
  backgroundImage,
}: BentoCardProps) {
  const Comp = href ? "a" : onClick ? "button" : "div"
  
  return (
    <Comp
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-lg",
        "border border-[#8000FF]/20 bg-[#2A2A3A] p-4",
        "transition-all duration-300 hover:border-[#8000FF] hover:shadow-[0_0_20px_rgba(128,0,255,0.3)]",
        "hover:scale-[1.02]",
        href && "cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      href={href}
      onClick={onClick}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      
      <div className="relative z-10">
        {header || (
          <>
            {icon && (
              <div className="mb-2 text-[#8000FF] transition-colors group-hover:text-[#B366FF]">
                {icon}
              </div>
            )}
            {name && (
              <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
            )}
            {description && (
              <p className="text-sm text-[#A0A0A0] line-clamp-2">{description}</p>
            )}
          </>
        )}
        {children}
      </div>
    </Comp>
  )
}

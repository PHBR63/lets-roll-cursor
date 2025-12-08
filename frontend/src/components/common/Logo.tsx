/**
 * Componente de Logo do Let's Roll
 * Substitui o placeholder "Logo" por um componente reutilizável
 */
import { Link } from 'react-router-dom'

interface LogoProps {
  /**
   * Tamanho do logo
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Se deve ser um link (padrão: true)
   */
  link?: boolean
  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Componente de Logo
 * Por enquanto usa texto estilizado, mas pode ser substituído por imagem SVG
 */
export function Logo({ size = 'md', link = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-gradient-to-br from-accent to-accent-secondary p-2 rounded-lg">
        <span className="text-white font-bold">🎲</span>
      </div>
      <span className={`text-white font-bold ${sizeClasses[size]}`}>Let's Roll</span>
    </div>
  )

  if (link) {
    return (
      <Link to="/dashboard" className="flex items-center">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}


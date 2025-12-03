import { motion } from 'framer-motion'
import { ReactNode } from 'react'

/**
 * Props do componente de transição de página
 */
interface PageTransitionProps {
  children: ReactNode
}

/**
 * Componente para transições suaves entre páginas
 * Usa framer-motion para animações
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}


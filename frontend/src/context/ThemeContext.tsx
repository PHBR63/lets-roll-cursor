// @ts-nocheck
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/**
 * Tipos de tema disponíveis
 */
export type Theme = 'dark-purple' | 'light-purple' | 'dark-blue' | 'dark-green' | 'high-contrast' | 'custom'

/**
 * Configuração de tema customizado
 */
export interface CustomTheme {
  name: string
  colors: {
    primary: string
    background: string
    card: string
    text: string
    accent: string
  }
}

/**
 * Contexto de tema
 */
interface ThemeContextType {
  theme: Theme
  customTheme: CustomTheme | null
  setTheme: (theme: Theme) => void
  setCustomTheme: (theme: CustomTheme) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Provider de tema
 */
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'dark-purple' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Carregar tema do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved && ['dark-purple', 'light-purple', 'dark-blue', 'dark-green', 'high-contrast', 'custom'].includes(saved)) {
        return saved
      }
    }
    return defaultTheme
  })

  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customTheme')
      if (saved) {
        try {
          return JSON.parse(saved) as CustomTheme
        } catch {
          return null
        }
      }
    }
    return null
  })

  // Aplicar tema ao documento
  useEffect(() => {
    const root = document.documentElement
    
    // Remover classes de tema anteriores
    root.classList.remove(
      'theme-dark-purple',
      'theme-light-purple',
      'theme-dark-blue',
      'theme-dark-green',
      'theme-high-contrast',
      'theme-custom'
    )

    // Adicionar classe do tema atual
    root.classList.add(`theme-${theme}`)

    // Aplicar variáveis CSS do tema
    if (theme === 'custom' && customTheme) {
      root.style.setProperty('--theme-primary', customTheme.colors.primary)
      root.style.setProperty('--theme-background', customTheme.colors.background)
      root.style.setProperty('--theme-card', customTheme.colors.card)
      root.style.setProperty('--theme-text', customTheme.colors.text)
      root.style.setProperty('--theme-accent', customTheme.colors.accent)
    } else {
      // Resetar variáveis customizadas
      root.style.removeProperty('--theme-primary')
      root.style.removeProperty('--theme-background')
      root.style.removeProperty('--theme-card')
      root.style.removeProperty('--theme-text')
      root.style.removeProperty('--theme-accent')
    }
  }, [theme, customTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }

  const setCustomTheme = (newCustomTheme: CustomTheme) => {
    setCustomThemeState(newCustomTheme)
    setTheme('custom')
    if (typeof window !== 'undefined') {
      localStorage.setItem('customTheme', JSON.stringify(newCustomTheme))
      localStorage.setItem('theme', 'custom')
    }
  }

  const resetTheme = () => {
    setThemeState(defaultTheme)
    setCustomThemeState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme')
      localStorage.removeItem('customTheme')
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        customTheme,
        setTheme,
        setCustomTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook para usar o tema
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


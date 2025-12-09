/**
 * Utilitários de acessibilidade WCAG 2.1 AA
 */

/**
 * Verificar contraste de cores (WCAG AA)
 * Retorna true se contraste >= 4.5:1 (texto normal) ou 3:1 (texto grande)
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)

  if (!fg || !bg) {
    return false
  }

  const ratio = getContrastRatio(fg, bg)
  const threshold = isLargeText ? 3 : 4.5

  return ratio >= threshold
}

/**
 * Converter hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calcular luminância relativa
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calcular razão de contraste
 */
function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Gerar ID único para ARIA
 */
let ariaIdCounter = 0
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${++ariaIdCounter}`
}

/**
 * Focus trap para modais
 */
export function createFocusTrap(
  container: HTMLElement,
  onEscape?: () => void
): () => void {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  // Focar primeiro elemento
  if (firstElement) {
    firstElement.focus()
  }

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEscape?.()
    }
  }

  container.addEventListener('keydown', handleTab)
  container.addEventListener('keydown', handleEscape)

  return () => {
    container.removeEventListener('keydown', handleTab)
    container.removeEventListener('keydown', handleEscape)
  }
}

/**
 * Anunciar mudança para screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Skip link para conteúdo principal
 */
export function createSkipLink(targetId: string = 'main-content'): HTMLElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = 'Pular para conteúdo principal'
  skipLink.className = 'skip-link'
  skipLink.setAttribute('aria-label', 'Pular para conteúdo principal')

  // Estilos inline para garantir visibilidade
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #8000FF;
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    z-index: 10000;
    border-radius: 4px;
  `

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0'
  })

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px'
  })

  return skipLink
}

/**
 * Verificar se elemento está visível na viewport
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Scroll suave para elemento com foco
 */
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth') {
  element.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'nearest',
  })
  
  // Focar elemento após scroll
  setTimeout(() => {
    element.focus()
  }, 300)
}


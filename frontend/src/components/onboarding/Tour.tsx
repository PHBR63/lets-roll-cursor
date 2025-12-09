// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Etapa do tour
 */
export interface TourStep {
  id: string
  target: string // Seletor CSS do elemento alvo
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: () => void // Ação a executar antes de mostrar o step
}

interface TourProps {
  steps: TourStep[]
  onComplete?: () => void
  onSkip?: () => void
  storageKey?: string
  enabled?: boolean
}

/**
 * Componente de tour guiado para onboarding
 */
export function Tour({ 
  steps, 
  onComplete, 
  onSkip,
  storageKey = 'tour-completed',
  enabled = true,
}: TourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Verificar se tour já foi completado
  useEffect(() => {
    if (!enabled) {
      return
    }

    const completed = localStorage.getItem(storageKey)
    if (completed === 'true') {
      return
    }

    // Aguardar um pouco antes de iniciar
    const timer = setTimeout(() => {
      setIsVisible(true)
      showStep(0)
    }, 1000)

    return () => clearTimeout(timer)
  }, [enabled, storageKey])

  // Mostrar step específico
  const showStep = (index: number) => {
    if (index < 0 || index >= steps.length) {
      return
    }

    const step = steps[index]
    setCurrentStep(index)

    // Executar ação se houver
    if (step.action) {
      step.action()
    }

    // Aguardar um pouco para o DOM atualizar
    setTimeout(() => {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setTargetElement(element)
        scrollToElement(element)
        highlightElement(element)
      }
    }, 100)
  }

  // Scroll para elemento
  const scrollToElement = (element: HTMLElement) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }

  // Destacar elemento
  const highlightElement = (element: HTMLElement) => {
    // Adicionar classe de highlight
    element.classList.add('tour-highlight')
    
    // Remover highlight de outros elementos
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      if (el !== element) {
        el.classList.remove('tour-highlight')
      }
    })
  }

  // Próximo step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  // Step anterior
  const prevStep = () => {
    if (currentStep > 0) {
      showStep(currentStep - 1)
    }
  }

  // Completar tour
  const completeTour = () => {
    setIsVisible(false)
    localStorage.setItem(storageKey, 'true')
    
    // Remover highlights
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      el.classList.remove('tour-highlight')
    })
    
    onComplete?.()
  }

  // Pular tour
  const skipTour = () => {
    completeTour()
    onSkip?.()
  }

  if (!isVisible || !enabled) {
    return null
  }

  const step = steps[currentStep]
  const position = step.position || 'bottom'

  // Calcular posição do tooltip
  const getTooltipPosition = () => {
    if (!targetElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const rect = targetElement.getBoundingClientRect()
    const tooltipHeight = 200
    const tooltipWidth = 320
    const spacing = 16

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - tooltipHeight - spacing}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          top: `${rect.bottom + spacing}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - tooltipWidth - spacing}px`,
          transform: 'translateY(-50%)',
        }
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + spacing}px`,
          transform: 'translateY(-50%)',
        }
      case 'center':
      default:
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  return (
    <>
      {/* Overlay escuro */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={overlayRef}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Não fechar ao clicar no overlay (apenas no botão)
              e.stopPropagation()
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && targetElement && (
          <motion.div
            ref={tooltipRef}
            className="fixed z-[9999]"
            style={getTooltipPosition()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-80 bg-card border-accent shadow-xl">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipTour}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-text-secondary">
                    {currentStep + 1} de {steps.length}
                  </div>
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="bg-accent hover:bg-accent/90"
                    >
                      {currentStep < steps.length - 1 ? (
                        <>
                          Próximo
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        'Concluir'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos para highlight */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 9999 !important;
          outline: 3px solid #8000FF !important;
          outline-offset: 4px;
          box-shadow: 0 0 0 4px rgba(128, 0, 255, 0.3) !important;
        }
      `}</style>
    </>
  )
}

/**
 * Hook para usar tour em componentes
 */
export function useTour(steps: TourStep[], storageKey?: string) {
  const [isActive, setIsActive] = useState(false)

  const startTour = () => {
    setIsActive(true)
  }

  const stopTour = () => {
    setIsActive(false)
  }

  return {
    Tour: isActive ? (
      <Tour
        steps={steps}
        storageKey={storageKey}
        onComplete={stopTour}
        onSkip={stopTour}
      />
    ) : null,
    startTour,
    stopTour,
    isActive,
  }
}


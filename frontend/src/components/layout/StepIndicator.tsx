import { Settings, FlaskConical, User } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Componente de indicador de etapas do wizard
 * Mostra as 3 etapas: Base do RPG, Adquiríveis, Personalidades
 */
interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    {
      number: 1,
      label: 'Base do RPG',
      icon: Settings,
    },
    {
      number: 2,
      label: 'Definição de Adquiríveis',
      icon: FlaskConical,
    },
    {
      number: 3,
      label: 'Definição de Personalidades',
      icon: User,
    },
  ]

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.number
        const isCompleted = currentStep > step.number
        const isPending = currentStep < step.number

        return (
          <div key={step.number} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-colors',
                  isActive && 'bg-accent border-accent text-white',
                  isCompleted && 'bg-accent/50 border-accent text-white',
                  isPending && 'bg-card border-card-secondary text-text-secondary'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive && 'text-white',
                  isPending && 'text-text-secondary'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 transition-colors',
                  currentStep > step.number ? 'bg-accent' : 'bg-card-secondary'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}


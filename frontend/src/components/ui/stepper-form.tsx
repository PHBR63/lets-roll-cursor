// @ts-nocheck
import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

/**
 * Stepper Form - Formulário multi-etapas com indicador de progresso
 * Baseado no componente do 21st.dev
 * Customizado para tema roxo Let's Roll
 */
interface StepperFormProps {
  steps: string[]
  currentStep: number
  onStepChange?: (step: number) => void
  className?: string
  children?: React.ReactNode
}

export function StepperForm({
  steps,
  currentStep,
  onStepChange,
  className,
  children,
}: StepperFormProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Indicador de Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center flex-1">
                  {/* Círculo do Step */}
                  <button
                    type="button"
                    onClick={() => onStepChange?.(stepNumber)}
                    disabled={!onStepChange || isUpcoming}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted &&
                        "border-[#8000FF] bg-[#8000FF] text-white cursor-pointer hover:scale-110",
                      isCurrent &&
                        "border-[#8000FF] bg-[#2A2A3A] text-[#8000FF] ring-4 ring-[#8000FF]/20",
                      isUpcoming &&
                        "border-[#8000FF]/30 bg-[#2A2A3A] text-[#A0A0A0] cursor-not-allowed"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </button>

                  {/* Label do Step */}
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isCurrent && "text-[#8000FF]",
                        isCompleted && "text-white",
                        isUpcoming && "text-[#A0A0A0]"
                      )}
                    >
                      {step}
                    </p>
                  </div>
                </div>

                {/* Linha conectora */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 transition-colors duration-300",
                      stepNumber < currentStep
                        ? "bg-[#8000FF]"
                        : "bg-[#8000FF]/30"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Conteúdo do Step Atual */}
      <div className="min-h-[400px]">{children}</div>
    </div>
  )
}

interface StepperFormActionsProps {
  onNext?: () => void
  onPrevious?: () => void
  onFinish?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  isLastStep?: boolean
  isLoading?: boolean
  className?: string
}

export function StepperFormActions({
  onNext,
  onPrevious,
  onFinish,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
  isLoading = false,
  className,
}: StepperFormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[#8000FF]/20",
        className
      )}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious || isLoading}
        className={cn(
          "px-6 py-2 rounded-md border border-[#8000FF]/20 text-white",
          "transition-all duration-200",
          "hover:border-[#8000FF] hover:bg-[#8000FF]/10",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Anterior
      </button>

      {isLastStep ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={!canGoNext || isLoading}
          className={cn(
            "px-6 py-2 rounded-md bg-[#8000FF] text-white font-semibold",
            "transition-all duration-200",
            "hover:bg-[#8000FF]/80 hover:scale-105",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-[0_0_20px_rgba(128,0,255,0.3)]"
          )}
        >
          {isLoading ? "Salvando..." : "Finalizar"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className={cn(
            "px-6 py-2 rounded-md bg-[#8000FF] text-white font-semibold",
            "transition-all duration-200",
            "hover:bg-[#8000FF]/80 hover:scale-105",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-[0_0_20px_rgba(128,0,255,0.3)]"
          )}
        >
          Próximo
        </button>
      )}
    </div>
  )
}


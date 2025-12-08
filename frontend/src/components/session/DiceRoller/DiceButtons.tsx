// @ts-nocheck
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

/**
 * Componente de botões rápidos de dados com ícones visuais
 */

interface DiceButtonProps {
  label: string
  formula: string
  onClick: (formula: string) => void
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

/**
 * Ícone SVG de dado (d20) - Ícone icosaedro
 */
function DiceIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-4 h-4 ${className}`}
    >
      {/* Ícone de dado d20 (icosaedro) */}
      <path d="M12 2L2 7L7 12L2 17L12 22L22 17L17 12L22 7L12 2Z" opacity="0.3" />
      <path d="M12 2L7 7L12 12L17 7L12 2Z" />
      <path d="M2 7L7 12L2 17L2 7Z" />
      <path d="M22 7L17 12L22 17L22 7Z" />
      <path d="M12 12L7 17L12 22L17 17L12 12Z" />
    </svg>
  )
}

/**
 * Botão individual de dado com ícone
 */
function DiceButton({ label, formula, onClick, disabled, className = '', icon }: DiceButtonProps) {
  return (
    <Button
      onClick={() => onClick(formula)}
      disabled={disabled}
      className={`bg-card-secondary hover:bg-accent hover:text-white text-white border border-card-secondary transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      size="sm"
      title={`Rolar ${formula}`}
    >
      <div className="flex items-center gap-1.5">
        {icon || <DiceIcon />}
        <span className="font-bold text-sm">{label}</span>
      </div>
    </Button>
  )
}

interface DiceButtonsProps {
  onRoll: (formula: string) => void
  rolling?: boolean
}

/**
 * Componente de botões rápidos de dados
 * Exibe botões para rolagens comuns com ícones visuais
 */
export function DiceButtons({ onRoll, rolling = false }: DiceButtonsProps) {
  // Dados individuais com cores
  const singleDice = [
    { label: 'd4', formula: '1d4', color: 'hover:border-purple-400 hover:text-purple-400' },
    { label: 'd6', formula: '1d6', color: 'hover:border-blue-400 hover:text-blue-400' },
    { label: 'd8', formula: '1d8', color: 'hover:border-green-400 hover:text-green-400' },
    { label: 'd10', formula: '1d10', color: 'hover:border-yellow-400 hover:text-yellow-400' },
    { label: 'd12', formula: '1d12', color: 'hover:border-orange-400 hover:text-orange-400' },
    { label: 'd20', formula: '1d20', color: 'hover:border-red-400 hover:text-red-400 hover:bg-red-500/20' },
    { label: 'd100', formula: '1d100', color: 'hover:border-pink-400 hover:text-pink-400' },
  ]

  // Rolagens comuns do sistema Ordem Paranormal
  const commonRolls = [
    { label: '2d6', formula: '2d6', description: 'Dano comum' },
    { label: '3d6', formula: '3d6', description: 'Dano médio' },
    { label: '4d6', formula: '4d6', description: 'Dano alto' },
    { label: '2d20', formula: '2d20', description: 'Vantagem/Desvantagem' },
    { label: '1d20+5', formula: '1d20+5', description: 'Teste Treinado' },
    { label: '1d20+10', formula: '1d20+10', description: 'Teste Veterano' },
    { label: '1d20+15', formula: '1d20+15', description: 'Teste Expert' },
    { label: '1d8+3', formula: '1d8+3', description: 'Ataque básico' },
  ]

  return (
    <div className="space-y-4">
      {/* Dados Individuais */}
      <div>
        <p className="text-text-secondary text-xs mb-2 font-medium uppercase tracking-wide">
          Dados Individuais
        </p>
        <div className="grid grid-cols-7 gap-2">
          {singleDice.map((dice) => (
            <DiceButton
              key={dice.formula}
              label={dice.label}
              formula={dice.formula}
              onClick={onRoll}
              disabled={rolling}
              className={dice.color}
            />
          ))}
        </div>
      </div>

      {/* Rolagens Comuns */}
      <div>
        <p className="text-text-secondary text-xs mb-2 font-medium uppercase tracking-wide">
          Rolagens Comuns
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
          {commonRolls.map((roll) => (
            <Button
              key={roll.formula}
              onClick={() => onRoll(roll.formula)}
              disabled={rolling}
              className="bg-card-secondary hover:bg-accent hover:text-white text-white border border-card-secondary transition-all duration-200 hover:scale-105 active:scale-95"
              size="sm"
              title={roll.description}
            >
              {rolling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <DiceIcon />
                  <span className="font-semibold text-sm">{roll.label}</span>
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}


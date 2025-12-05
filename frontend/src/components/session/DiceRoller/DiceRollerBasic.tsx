import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { validateDiceFormula } from '@/utils/diceValidation'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'
import { DiceRollResult } from '@/types/dice'
import { AppError } from '@/types/common'

const DICE_TYPES = [
  { label: 'd4', value: 4 },
  { label: 'd6', value: 6 },
  { label: 'd8', value: 8 },
  { label: 'd10', value: 10 },
  { label: 'd12', value: 12 },
  { label: 'd20', value: 20 },
  { label: 'd100', value: 100 },
]

interface DiceRollerBasicProps {
  sessionId?: string
  campaignId?: string
  characterId?: string
  isPrivate: boolean
  onRoll: (result: DiceRollResult) => void
}

export function DiceRollerBasic({ sessionId, campaignId, characterId, isPrivate, onRoll }: DiceRollerBasicProps) {
  const [formula, setFormula] = useState('')
  const [formulaError, setFormulaError] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const toast = useToast()

  const rollFormula = async (rollFormula: string) => {
    if (!campaignId) {
      toast.error('Erro', 'Você precisa estar em uma campanha para rolar dados')
      return
    }

    const validation = validateDiceFormula(rollFormula)
    if (!validation.valid) {
      setFormulaError(validation.error || 'Fórmula inválida')
      toast.error('Fórmula inválida', validation.error || 'Use formato: 1d20, 2d6+3, etc.')
      return
    }

    setFormulaError(null)
    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/dice/roll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          formula: rollFormula,
          sessionId: sessionId || null,
          campaignId,
          characterId: characterId || null,
          isPrivate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao rolar dados')
      }

      const result = await response.json()
      onRoll({ type: 'basic', ...result })
      return result
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar dados')
      toast.error('Erro ao rolar dados', err.message || 'Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  const handleRollDice = async (sides: number) => {
    await rollFormula(`1d${sides}`)
  }

  const handleRollFormula = async () => {
    if (formula.trim()) {
      await rollFormula(formula)
      setFormula('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRollFormula()
    }
    // Atalho: Ctrl/Cmd + Enter para rolagem rápida
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRollFormula()
    }
  }

  // Atalho global: R para rolagem rápida (1d20)
  useEffect(() => {
    if (!campaignId) return

    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Apenas se não estiver digitando em um input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // R para rolar 1d20
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        handleRollDice(20)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyPress)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId])

  return (
    <div className="space-y-4">
      {/* Botões Rápidos */}
      <div className="grid grid-cols-7 gap-2">
        {DICE_TYPES.map((dice) => (
          <Button
            key={dice.value}
            onClick={() => handleRollDice(dice.value)}
            disabled={rolling}
            className="bg-card-secondary hover:bg-accent hover:text-white text-white border border-card-secondary"
            size="sm"
          >
            {dice.label}
          </Button>
        ))}
      </div>

      {/* Campo de Fórmula */}
      <div className="space-y-2">
        <Label htmlFor="formula" className="text-white">
          Fórmula (ex: 2d6+3, 1d20)
        </Label>
        <div className="flex gap-2">
          <Input
            id="formula"
            placeholder="2d6+3"
            value={formula}
            onChange={(e) => {
              setFormula(e.target.value)
              setFormulaError(null)
            }}
            onKeyPress={handleKeyPress}
            className={`bg-input border-white/20 flex-1 ${
              formulaError ? 'border-red-500' : ''
            }`}
            disabled={rolling}
          />
          <Button
            onClick={handleRollFormula}
            disabled={rolling || !formula.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {rolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rolando...
              </>
            ) : (
              'Rolar'
            )}
          </Button>
        </div>
        {formulaError && (
          <p className="text-red-500 text-sm animate-in fade-in-50">
            {formulaError}
          </p>
        )}
      </div>
    </div>
  )
}


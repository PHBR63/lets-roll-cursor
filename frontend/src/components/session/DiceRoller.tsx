import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'

/**
 * Componente de rolagem de dados
 * Botões rápidos (d4, d6, d8, d10, d12, d20, d100) + campo de fórmula
 */
interface DiceRollerProps {
  sessionId?: string
  campaignId?: string
}

const DICE_TYPES = [
  { label: 'd4', value: 4 },
  { label: 'd6', value: 6 },
  { label: 'd8', value: 8 },
  { label: 'd10', value: 10 },
  { label: 'd12', value: 12 },
  { label: 'd20', value: 20 },
  { label: 'd100', value: 100 },
]

export function DiceRoller({ sessionId, campaignId }: DiceRollerProps) {
  const { user } = useAuth()
  const [formula, setFormula] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [rolling, setRolling] = useState(false)

  /**
   * Rola um dado específico
   */
  const rollDice = async (sides: number) => {
    await rollFormula(`1d${sides}`)
  }

  /**
   * Rola dados baseado na fórmula
   */
  const rollFormula = async (customFormula?: string) => {
    if (!campaignId || !user) return

    const rollFormula = customFormula || formula.trim()
    if (!rollFormula) return

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      // Buscar personagem do usuário na campanha
      let characterId = null
      const charResponse = await fetch(
        `${apiUrl}/api/characters?userId=${user.id}&campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (charResponse.ok) {
        const chars = await charResponse.json()
        characterId = chars[0]?.id || null
      }

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
          characterId,
          isPrivate,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao rolar dados')
      }

      const result = await response.json()
      setLastResult(result)

      // Limpar fórmula se foi uma rolagem rápida
      if (customFormula) {
        setFormula('')
      }
    } catch (error) {
      console.error('Erro ao rolar dados:', error)
      alert('Erro ao rolar dados. Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  /**
   * Handler para Enter no campo de fórmula
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      rollFormula()
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Rolagem de Dados</h3>

      {/* Botões Rápidos */}
      <div className="grid grid-cols-7 gap-2">
        {DICE_TYPES.map((dice) => (
          <Button
            key={dice.value}
            onClick={() => rollDice(dice.value)}
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
            onChange={(e) => setFormula(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-input border-white/20 flex-1"
            disabled={rolling}
          />
          <Button
            onClick={() => rollFormula()}
            disabled={rolling || !formula.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {rolling ? 'Rolando...' : 'Rolar'}
          </Button>
        </div>
      </div>

      {/* Checkbox Privado */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="private"
          checked={isPrivate}
          onCheckedChange={(checked) => setIsPrivate(!!checked)}
        />
        <Label htmlFor="private" className="text-text-secondary text-sm cursor-pointer">
          Rolagem Privada
        </Label>
      </div>

      {/* Último Resultado */}
      {lastResult && (
        <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-lg">
          <div className="text-white font-bold text-xl text-center">
            {lastResult.result}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {lastResult.formula}
            {lastResult.details && (
              <span className="block text-xs mt-1">
                ({lastResult.details.join(', ')})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


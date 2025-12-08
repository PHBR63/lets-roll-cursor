// @ts-nocheck
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Repeat, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { DiceRollResult } from './types'

interface ChainRollerProps {
  onRoll: (result: DiceRollResult) => void
  sessionId?: string
  campaignId?: string
  characterId?: string
  isPrivate?: boolean
}

/**
 * Componente para rolagem em cadeia
 * Permite rolar múltiplas vezes rapidamente
 */
export function ChainRoller({ onRoll, sessionId, campaignId, characterId, isPrivate }: ChainRollerProps) {
  const [formula, setFormula] = useState('1d20')
  const [rollCount, setRollCount] = useState<number>(1)
  const [rolling, setRolling] = useState(false)
  const [results, setResults] = useState<Array<{ id: number; result: DiceRollResult; timestamp: Date }>>([])

  const rollDice = async (formulaToRoll: string) => {
    if (!campaignId) return

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
          formula: formulaToRoll,
          sessionId: sessionId || null,
          campaignId,
          characterId: characterId || null,
          isPrivate,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao rolar dados')
      }

      const result = await response.json()
      return { type: 'basic', ...result } as DiceRollResult
    } catch (error) {
      console.error('Erro ao rolar dados:', error)
      return null
    }
  }

  const handleChainRoll = async () => {
    if (rollCount < 1 || rollCount > 10) {
      return
    }

    setRolling(true)
    const newResults: Array<{ id: number; result: DiceRollResult; timestamp: Date }> = []

    for (let i = 0; i < rollCount; i++) {
      const result = await rollDice(formula)
      if (result) {
        const rollData = {
          id: Date.now() + i,
          result,
          timestamp: new Date(),
        }
        newResults.push(rollData)
        onRoll(result)

        // Pequeno delay entre rolagens para animação
        if (i < rollCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }
    }

    setResults((prev) => [...newResults, ...prev].slice(0, 20)) // Manter últimas 20
    setRolling(false)
  }

  const clearResults = () => {
    setResults([])
  }

  const total = results.reduce((sum, r) => sum + (r.result.result || r.result.total || 0), 0)
  const average = results.length > 0 ? total / results.length : 0
  const highest = results.length > 0
    ? Math.max(...results.map((r) => r.result.result || r.result.total || 0))
    : 0
  const lowest = results.length > 0
    ? Math.min(...results.map((r) => r.result.result || r.result.total || 0))
    : 0

  return (
    <Card className="bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <Repeat className="w-4 h-4" />
          Rolagem em Cadeia
        </h4>
        {results.length > 0 && (
          <Button onClick={clearResults} size="sm" variant="ghost">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-white text-xs">Fórmula</Label>
          <Input
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="1d20"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-white text-xs">Quantidade</Label>
          <Input
            type="number"
            value={rollCount}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1
              setRollCount(Math.max(1, Math.min(10, val)))
            }}
            className="mt-1"
            min={1}
            max={10}
          />
        </div>
      </div>

      <Button
        onClick={handleChainRoll}
        disabled={rolling || !formula}
        className="w-full"
        variant="default"
      >
        {rolling ? `Rolando ${rollCount}...` : `Rolar ${rollCount}x`}
      </Button>

      {results.length > 0 && (
        <div className="pt-4 border-t border-card-secondary space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Total:</span>
            <span className="text-white font-semibold">{total}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Média:</span>
            <span className="text-white font-semibold">{average.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Maior:</span>
            <span className="text-green-500 font-semibold">{highest}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Menor:</span>
            <span className="text-red-500 font-semibold">{lowest}</span>
          </div>

          <div className="pt-2 border-t border-card-secondary">
            <Label className="text-text-secondary text-xs mb-2 block">
              Últimas {Math.min(results.length, 10)} rolagens:
            </Label>
            <div className="flex flex-wrap gap-1">
              {results.slice(0, 10).map((r) => (
                <Badge
                  key={r.id}
                  variant="outline"
                  className="text-xs"
                >
                  {r.result.result || r.result.total || 0}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}


// @ts-nocheck
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/utils/logger'
import { Character } from './types'
import { DiceRollResult } from '@/types/dice'
import { AppError } from '@/types/common'
import { getApiBaseUrl } from '@/utils/apiUrl'

interface DiceRollerResistanceProps {
  character: Character | null
  sessionId?: string
  campaignId?: string
  onRoll: (result: DiceRollResult) => void
}

/**
 * Componente para rolar testes de resistência
 * Fortitude (VIG): Resistir a dor física, doenças, venenos
 * Reflexos (AGI): Esquivar de explosões, armadilhas, projéteis
 * Vontade (PRE): Resistir a medo, manipulação mental, insanidade
 */
export function DiceRollerResistance({ character, sessionId, campaignId, onRoll }: DiceRollerResistanceProps) {
  const [resistanceType, setResistanceType] = useState<'Fortitude' | 'Reflexos' | 'Vontade'>('Fortitude')
  const [difficulty, setDifficulty] = useState(15)
  const [advantageDice, setAdvantageDice] = useState(0)
  const [rolling, setRolling] = useState(false)
  const toast = useToast()

  const handleRoll = async () => {
    if (!character) {
      toast.warning('Aviso', 'Selecione um personagem')
      return
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()

      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-resistance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            resistanceType,
            difficulty,
            advantageDice,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de resistência')
      }

      const result = await response.json()
      onRoll({ type: 'resistance', ...result })
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar teste de resistência')
      toast.error('Erro ao rolar teste de resistência', err.message || 'Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  if (!character) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Nenhum personagem encontrado nesta campanha
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Tipo de Resistência</Label>
        <Select value={resistanceType} onValueChange={(value: any) => setResistanceType(value)}>
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fortitude">
              Fortitude (VIG) - Dor física, doenças, venenos
            </SelectItem>
            <SelectItem value="Reflexos">
              Reflexos (AGI) - Explosões, armadilhas, projéteis
            </SelectItem>
            <SelectItem value="Vontade">
              Vontade (PRE) - Medo, manipulação mental, insanidade
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Dificuldade (DT)</Label>
        <Select
          value={String(difficulty)}
          onValueChange={(value) => setDifficulty(parseInt(value))}
        >
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Fácil (DT 5)</SelectItem>
            <SelectItem value="10">Média (DT 10)</SelectItem>
            <SelectItem value="15">Difícil (DT 15)</SelectItem>
            <SelectItem value="20">Muito Difícil (DT 20)</SelectItem>
            <SelectItem value="25">Formidável (DT 25)</SelectItem>
            <SelectItem value="30">Heroica (DT 30)</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={1}
          max={50}
          value={difficulty}
          onChange={(e) => setDifficulty(parseInt(e.target.value) || 15)}
          placeholder="Ou digite um valor personalizado"
          className="bg-input border-white/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Vantagem/Desvantagem de Dados</Label>
        <Select
          value={String(advantageDice)}
          onValueChange={(value) => setAdvantageDice(parseInt(value))}
        >
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-1">-1d20 (Desvantagem)</SelectItem>
            <SelectItem value="0">Nenhuma (0)</SelectItem>
            <SelectItem value="1">+1d20 (Vantagem)</SelectItem>
            <SelectItem value="2">+2d20</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleRoll}
        disabled={rolling}
        className="w-full bg-accent hover:bg-accent/90"
      >
        {rolling ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rolando...
          </>
        ) : (
          'Rolar Teste de Resistência'
        )}
      </Button>
    </div>
  )
}


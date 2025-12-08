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
import { ALL_SKILLS } from '@/types/ordemParanormal'
import { Character } from './types'
import { DiceRollResult } from '@/types/dice'
import { AppError } from '@/types/common'

interface DiceRollerSkillProps {
  character: Character | null
  sessionId?: string
  campaignId?: string
  onRoll: (result: DiceRollResult) => void
}

export function DiceRollerSkill({ character, sessionId, campaignId, onRoll }: DiceRollerSkillProps) {
  const [selectedSkill, setSelectedSkill] = useState('')
  const [difficulty, setDifficulty] = useState(15)
  const [rolling, setRolling] = useState(false)
  const toast = useToast()

  const availableSkills = character?.skills
    ? Object.keys(character.skills).filter((skill) => ALL_SKILLS[skill])
    : []

  const handleRoll = async () => {
    if (!character || !selectedSkill) {
      toast.warning('Aviso', 'Selecione uma perícia')
      return
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-skill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName: selectedSkill,
            difficulty,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de perícia')
      }

      const result = await response.json()
      onRoll({ type: 'skill', ...result })
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar teste de perícia')
      toast.error('Erro ao rolar teste de perícia', err.message || 'Tente novamente.')
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
        <Label className="text-white">Perícia</Label>
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue placeholder="Selecione uma perícia" />
          </SelectTrigger>
          <SelectContent>
            {availableSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Dificuldade (DT)</Label>
        <Input
          type="number"
          min={1}
          max={30}
          value={difficulty}
          onChange={(e) => setDifficulty(parseInt(e.target.value) || 15)}
          className="bg-input border-white/20"
        />
      </div>

      <Button
        onClick={handleRoll}
        disabled={rolling || !selectedSkill}
        className="w-full bg-accent hover:bg-accent/90"
      >
        {rolling ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rolando...
          </>
        ) : (
          'Rolar Teste de Perícia'
        )}
      </Button>
    </div>
  )
}


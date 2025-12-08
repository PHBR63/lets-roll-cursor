// @ts-nocheck
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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

interface DiceRollerAttackProps {
  character: Character | null
  sessionId?: string
  campaignId?: string
  onRoll: (result: DiceRollResult) => void
}

export function DiceRollerAttack({ character, sessionId, campaignId, onRoll }: DiceRollerAttackProps) {
  const [selectedSkill, setSelectedSkill] = useState('')
  const [targetDefense, setTargetDefense] = useState(10)
  const [weaponDice, setWeaponDice] = useState('1d6')
  const [isMelee, setIsMelee] = useState(true)
  const [threatRange, setThreatRange] = useState(20) // Margem de Ameaça
  const [advantageDice, setAdvantageDice] = useState(0) // +1d20 ou -1d20
  const [rolling, setRolling] = useState(false)
  const toast = useToast()

  const availableSkills = character?.skills
    ? Object.keys(character.skills).filter((skill) => ALL_SKILLS[skill])
    : []

  const attackSkills = availableSkills.filter(
    (skill) => skill === 'Luta' || skill === 'Pontaria'
  )

  const handleRoll = async () => {
    if (!character || !selectedSkill) {
      toast.warning('Aviso', 'Selecione uma perícia de ataque (Luta ou Pontaria)')
      return
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-attack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName: selectedSkill,
            targetDefense: parseInt(String(targetDefense)),
            weaponDice,
            isMelee,
            threatRange, // Margem de Ameaça para crítico
            advantageDice, // Vantagem/desvantagem de dados
            criticalMultiplier: 2,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar ataque')
      }

      const result = await response.json()
      onRoll({ type: 'attack', ...result })
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao rolar ataque')
      toast.error('Erro ao rolar ataque', err.message || 'Tente novamente.')
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
        <Label className="text-white">Perícia de Ataque</Label>
        <Select value={selectedSkill} onValueChange={setSelectedSkill}>
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue placeholder="Selecione Luta ou Pontaria" />
          </SelectTrigger>
          <SelectContent>
            {attackSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Defesa do Alvo</Label>
        <Input
          type="number"
          min={1}
          max={30}
          value={targetDefense}
          onChange={(e) => setTargetDefense(parseInt(e.target.value) || 10)}
          className="bg-input border-white/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Dado de Dano (ex: 1d6, 2d8)</Label>
        <Input
          placeholder="1d6"
          value={weaponDice}
          onChange={(e) => setWeaponDice(e.target.value)}
          className="bg-input border-white/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Margem de Ameaça (Crítico)</Label>
        <Select
          value={String(threatRange)}
          onValueChange={(value) => setThreatRange(parseInt(value))}
        >
          <SelectTrigger className="bg-input border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="18">18-20 (x2)</SelectItem>
            <SelectItem value="19">19-20 (x2)</SelectItem>
            <SelectItem value="20">20 (x2)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-secondary">
          Quando o dado (sem bônus) {'>='} Margem de Ameaça, o ataque é crítico e multiplica os dados de dano.
        </p>
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="melee"
          checked={isMelee}
          onCheckedChange={(checked) => setIsMelee(!!checked)}
        />
        <Label htmlFor="melee" className="text-text-secondary text-sm cursor-pointer">
          Corpo-a-corpo (adiciona Força ao dano)
        </Label>
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
          'Rolar Ataque'
        )}
      </Button>
    </div>
  )
}


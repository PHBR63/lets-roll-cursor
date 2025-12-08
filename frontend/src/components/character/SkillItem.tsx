// @ts-nocheck
import { memo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ALL_SKILLS, SkillTraining } from '@/types/ordemParanormal'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { Character } from '@/types/character'

/**
 * Props do item de perícia
 */
interface SkillItemProps {
  skillName: string
  currentSkill: {
    attribute: string
    training: SkillTraining
    bonus: number
  }
  onSkillChange: (skillName: string, training: SkillTraining) => void
  character?: Character | null
}

/**
 * Item de perícia memoizado
 * Evita re-renders desnecessários quando outras perícias mudam
 */
export const SkillItem = memo(({
  skillName,
  currentSkill,
  onSkillChange,
  character,
}: SkillItemProps) => {
  const skillInfo = ALL_SKILLS[skillName]
  const [rolling, setRolling] = useState(false)
  const toast = useToast()

  /**
   * Rola teste de perícia
   */
  const handleRollSkill = async () => {
    if (!character?.id) {
      toast.warning('Aviso', 'Personagem não encontrado')
      return
    }

    setRolling(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-skill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName,
            difficulty: 15, // DT padrão
            advantageDice: 0,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de perícia')
      }

      const result = await response.json()
      toast.success(
        'Teste de Perícia',
        `${skillName}: ${result.total} ${result.success ? '✅' : '❌'} (DT ${result.difficulty})`
      )
    } catch (error: unknown) {
      const err = error as Error
      toast.error('Erro ao rolar teste de perícia', err.message || 'Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="flex-1 text-sm text-muted-foreground">
        {skillName}
        {skillInfo.requiresTraining && (
          <span className="text-xs text-yellow-400 ml-1">*</span>
        )}
      </Label>
      <Select
        value={currentSkill.training}
        onValueChange={(value) =>
          onSkillChange(skillName, value as SkillTraining)
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="UNTRAINED">Destreinado (+0)</SelectItem>
          <SelectItem value="TRAINED">Treinado (+5)</SelectItem>
          <SelectItem value="COMPETENT">Competente (+10)</SelectItem>
          <SelectItem value="EXPERT">Expert (+15)</SelectItem>
        </SelectContent>
      </Select>
      <div className="w-12 text-right text-sm font-bold text-white">
        +{currentSkill.bonus}
      </div>
      {character && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRollSkill}
          disabled={rolling}
          className="w-8 h-8 p-0 hover:bg-accent/20"
          title={`Rolar teste de ${skillName}`}
        >
          {rolling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <span className="text-xs">🎲</span>
          )}
        </Button>
      )}
    </div>
  )
})

SkillItem.displayName = 'SkillItem'


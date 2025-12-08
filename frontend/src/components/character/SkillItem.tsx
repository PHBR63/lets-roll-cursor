// @ts-nocheck
import { memo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ALL_SKILLS, SkillTraining } from '@/types/ordemParanormal'

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
}

/**
 * Item de perícia memoizado
 * Evita re-renders desnecessários quando outras perícias mudam
 */
export const SkillItem = memo(({
  skillName,
  currentSkill,
  onSkillChange,
}: SkillItemProps) => {
  const skillInfo = ALL_SKILLS[skillName]

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
    </div>
  )
})

SkillItem.displayName = 'SkillItem'


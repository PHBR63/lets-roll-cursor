import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { ALL_SKILLS, SkillTraining, TRAINING_BONUS } from '@/types/ordemParanormal'

interface SkillsGridProps {
  character: any
  onUpdate: (updates: any) => void
}

/**
 * Grid de perícias do sistema Ordem Paranormal
 * Exibe todas as perícias com seus atributos base e níveis de treinamento
 */
export function SkillsGrid({ character, onUpdate }: SkillsGridProps) {
  const skills = character.skills || {}
  const [localSkills, setLocalSkills] = useState(skills)
  const [hasChanges, setHasChanges] = useState(false)

  /**
   * Handler para atualizar nível de treinamento de uma perícia
   */
  const handleSkillChange = (skillName: string, training: SkillTraining) => {
    const skillInfo = ALL_SKILLS[skillName]
    if (!skillInfo) return

    const bonus = TRAINING_BONUS[training]
    const newSkills = {
      ...localSkills,
      [skillName]: {
        attribute: skillInfo.attribute,
        training,
        bonus,
      },
    }
    setLocalSkills(newSkills)
    setHasChanges(true)
  }

  /**
   * Salva alterações das perícias
   */
  const handleSave = () => {
    onUpdate({ skills: localSkills })
    setHasChanges(false)
  }

  /**
   * Agrupa perícias por atributo
   */
  const skillsByAttribute: Record<string, string[]> = {
    AGI: [],
    FOR: [],
    INT: [],
    PRE: [],
    VIG: [],
  }

  Object.keys(ALL_SKILLS).forEach((skillName) => {
    const skillInfo = ALL_SKILLS[skillName]
    skillsByAttribute[skillInfo.attribute].push(skillName)
  })

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Perícias</h2>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(skillsByAttribute).map(([attribute, skillNames]) => (
          <div key={attribute} className="space-y-2">
            <Label className="text-primary font-semibold">
              {attribute === 'AGI' && 'Agilidade'}
              {attribute === 'FOR' && 'Força'}
              {attribute === 'INT' && 'Intelecto'}
              {attribute === 'PRE' && 'Presença'}
              {attribute === 'VIG' && 'Vigor'}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillNames.map((skillName) => {
                const skillInfo = ALL_SKILLS[skillName]
                const currentSkill = localSkills[skillName] || {
                  attribute: skillInfo.attribute,
                  training: 'UNTRAINED' as SkillTraining,
                  bonus: 0,
                }

                return (
                  <div key={skillName} className="flex items-center gap-2">
                    <Label className="flex-1 text-sm text-muted-foreground">
                      {skillName}
                      {skillInfo.requiresTraining && (
                        <span className="text-xs text-yellow-400 ml-1">*</span>
                      )}
                    </Label>
                    <Select
                      value={currentSkill.training}
                      onValueChange={(value) =>
                        handleSkillChange(skillName, value as SkillTraining)
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
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>* Perícias marcadas com asterisco requerem treinamento para uso</p>
      </div>
    </div>
  )
}


import { useState, useMemo, memo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { ALL_SKILLS, SkillTraining, TRAINING_BONUS } from '@/types/ordemParanormal'
import { SkillItem } from './SkillItem'
import { Character, CharacterUpdateData } from '@/types/character'

interface SkillsGridProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

/**
 * Grid de perícias do sistema Ordem Paranormal
 * Exibe todas as perícias com seus atributos base e níveis de treinamento
 */
/**
 * Converte skill do formato antigo para o novo formato
 */
function convertSkillToNewFormat(
  skillName: string,
  skillValue: { value: number; trained: boolean } | { attribute: string; training: SkillTraining; bonus: number }
): { attribute: string; training: SkillTraining; bonus: number } | null {
  // Se já está no formato novo, retorna como está
  if ('attribute' in skillValue && 'training' in skillValue && 'bonus' in skillValue) {
    return skillValue as { attribute: string; training: SkillTraining; bonus: number }
  }

  // Se está no formato antigo, converte
  if ('value' in skillValue && 'trained' in skillValue) {
    const skillInfo = ALL_SKILLS[skillName]
    if (!skillInfo) {
      // Se a skill não existe em ALL_SKILLS, não pode converter
      return null
    }

    // Converte trained (boolean) para training (SkillTraining)
    const training: SkillTraining = skillValue.trained ? 'TRAINED' : 'UNTRAINED'
    const bonus = TRAINING_BONUS[training]

    return {
      attribute: skillInfo.attribute,
      training,
      bonus,
    }
  }

  // Formato desconhecido
  return null
}

export function SkillsGrid({ character, onUpdate }: SkillsGridProps) {
  const skills = character.skills || {}
  const [localSkills, setLocalSkills] = useState<Record<string, { attribute: string; training: SkillTraining; bonus: number }>>(
    Object.entries(skills).reduce((acc, [key, value]) => {
      const converted = convertSkillToNewFormat(
        key, 
        value as { value: number; trained: boolean } | { attribute: string; training: SkillTraining; bonus: number }
      )
      if (converted) {
        acc[key] = converted
      }
      return acc
    }, {} as Record<string, { attribute: string; training: SkillTraining; bonus: number }>)
  )
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
    // Converter para o formato esperado pelo CharacterUpdateData
    onUpdate({ skills: localSkills as any })
    setHasChanges(false)
  }

  /**
   * Agrupa perícias por atributo (memoizado)
   */
  const skillsByAttribute = useMemo(() => {
    const grouped: Record<string, string[]> = {
      AGI: [],
      FOR: [],
      INT: [],
      PRE: [],
      VIG: [],
    }

    Object.keys(ALL_SKILLS).forEach((skillName) => {
      const skillInfo = ALL_SKILLS[skillName]
      grouped[skillInfo.attribute].push(skillName)
    })

    return grouped
  }, [])

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
                  <SkillItem
                    key={skillName}
                    skillName={skillName}
                    currentSkill={currentSkill}
                    onSkillChange={handleSkillChange}
                  />
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


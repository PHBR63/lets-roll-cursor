import { Character, CharacterUpdateData } from '@/types/character'
import { ALL_SKILLS, SkillTraining } from '@/types/ordemParanormal'
import { cn } from '@/lib/utils'
import { Dices, Book, AlertCircle, Eye, Hand, Shield } from 'lucide-react'
import { ElementType } from 'react'

interface SkillsGridProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

export function SkillsGrid({ character }: SkillsGridProps) {
  // Cast icons
  const HandIcon = Hand as ElementType
  const EyeIcon = Eye as ElementType
  const AlertCircleIcon = AlertCircle as ElementType
  const ShieldIcon = Shield as ElementType
  const BookIcon = Book as ElementType
  const DiceD20Icon = Dices as ElementType

  const getSkillIcon = (skillName: string) => {
    const l = skillName.toLowerCase()
    if (l.includes('luta') || l.includes('pontaria') || l.includes('briga')) return <HandIcon className="w-5 h-5 text-red-400" />
    if (l.includes('investigação') || l.includes('percepção')) return <EyeIcon className="w-5 h-5 text-blue-400" />
    if (l.includes('ocultismo')) return <AlertCircleIcon className="w-5 h-5 text-purple-400" />
    if (l.includes('fortitude') || l.includes('reflexos') || l.includes('vontade')) return <ShieldIcon className="w-5 h-5 text-yellow-400" />
    if (l.includes('tecnologia') || l.includes('ciências')) return <BookIcon className="w-5 h-5 text-cyan-400" />
    return <DiceD20Icon className="w-5 h-5 text-zinc-400" />
  }

  const skills = character.skills || {}

  const getSkillValue = (skillName: string): number => {
    const skill = skills[skillName]
    if (!skill) return 0
    const skillAny = skill as any
    if (skillAny.value !== undefined) return skillAny.value || 0
    if (skillAny.bonus !== undefined) return skillAny.bonus || 0
    if (skillAny.training) {
      switch (skillAny.training as SkillTraining) {
        case 'TRAINED': return 5 // Matches definition in TRAINING_BONUS
        case 'COMPETENT': return 10
        case 'EXPERT': return 15
        default: return 0 // UNTRAINED
      }
    }
    return 0
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4 px-2">
        <h3 className="text-base font-semibold text-white uppercase tracking-wider">Perícias</h3>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      <div className="panel p-4">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Object.keys(ALL_SKILLS).map((skillName) => {
            const value = getSkillValue(skillName)
            const iconElement = getSkillIcon(skillName)

            return (
              <div key={skillName} className="flex flex-col items-center p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="mb-2 p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                  {iconElement}
                </div>
                <span className="text-[10px] uppercase text-zinc-400 text-center leading-tight min-h-[2.5em] flex items-center justify-center">
                  {skillName}
                </span>
                <div className="mt-1 w-full bg-black/40 rounded border border-white/10 text-center py-1">
                  <span className={cn("text-sm font-bold", value > 0 ? "text-purple-300" : "text-zinc-500")}>
                    {value > 0 ? `+${value}` : value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

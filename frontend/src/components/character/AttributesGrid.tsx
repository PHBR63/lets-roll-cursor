import { Character, CharacterUpdateData } from '@/types/character'
import { useCharacterResources } from '@/hooks/useCharacterResources'
import { CharacterClass } from '@/types/ordemParanormal'
import { Dices, Shield } from 'lucide-react'
import { ElementType } from 'react'

interface AttributesGridProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

export function AttributesGrid({ character, onUpdate }: AttributesGridProps) {
  const attributes = character.attributes || { agi: 0, for: 0, int: 0, pre: 0, vig: 0 }

  // Cast icons to ElementType to avoid JSX errors
  const ShieldIcon = Shield as ElementType
  const DiceD20Icon = Dices as ElementType

  // Explicitly construct Attributes object to satisfy type checker
  const attributesTyped = {
    agi: attributes.agi ?? 0,
    for: attributes.for ?? 0,
    int: attributes.int ?? 0,
    pre: attributes.pre ?? 0,
    vig: attributes.vig ?? 0
  }

  // Usar hook para calcular defesa automaticamente
  const { defense } = useCharacterResources(
    character.class as CharacterClass | undefined,
    attributesTyped,
    character.stats?.nex || 0
  )

  const attributeInfo = [
    { key: 'agi', label: 'Agilidade', icon: '🏃' },
    { key: 'for', label: 'Força', icon: '💪' },
    { key: 'int', label: 'Intelecto', icon: '🧠' },
    { key: 'pre', label: 'Presença', icon: '👁️' },
    { key: 'vig', label: 'Vigor', icon: '❤️' },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-base font-semibold text-white uppercase tracking-wider">Atributos</h3>
        <div className="flex items-center gap-2 text-zinc-300 text-xs font-medium bg-black/30 px-2 py-1 rounded">
          <ShieldIcon className="w-3 h-3 text-blue-400" />
          Defesa: <span className="text-white font-bold">{defense}</span>
        </div>
      </div>

      <div className="panel p-4 flex flex-wrap justify-center gap-4 sm:gap-6">
        {attributeInfo.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-1 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform group-hover:scale-105">
              {/* Hexagon/D20 Shape Background - using SVG or CSS shape */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-900/40 fill-current drop-shadow-md">
                <path d="M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z" />
              </svg>

              {/* Border Outline */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-500/50 fill-none stroke-current stroke-2">
                <path d="M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z" />
              </svg>

              {/* D20 Icon for style */}
              <DiceD20Icon className="absolute w-8 h-8 text-red-500/20 top-1" />

              {/* Value */}
              <span className="relative z-10 text-2xl font-bold text-white font-mono">
                {attributes[key as keyof typeof attributes]}
              </span>
            </div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest group-hover:text-red-400 transition-colors">
              {label}
            </span>
            {/* Edit Input Overlay (could be implemented on click) */}
          </div>
        ))}
      </div>
    </div>
  )
}

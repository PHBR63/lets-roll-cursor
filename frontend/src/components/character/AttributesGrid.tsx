import { Character, CharacterUpdateData } from '@/types/character'
import { useCharacterResources } from '@/hooks/useCharacterResources'
import { CharacterClass } from '@/types/ordemParanormal'
import { Dices, Shield } from 'lucide-react'
import { ElementType } from 'react'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const [editingAttr, setEditingAttr] = useState<{ key: string, label: string, value: number } | null>(null)
  const [newValue, setNewValue] = useState<string>('')

  const handleEditClick = (key: string, label: string, value: number) => {
    setEditingAttr({ key, label, value })
    setNewValue(value.toString())
  }

  const handleSave = () => {
    if (!editingAttr) return
    const numValue = parseInt(newValue)
    if (isNaN(numValue)) return

    const newAttributes = { ...attributesTyped, [editingAttr.key]: numValue }
    onUpdate({ attributes: newAttributes })
    setEditingAttr(null)
  }

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
          <div
            key={key}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            onClick={() => handleEditClick(key, label, attributes[key as keyof typeof attributes])}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95">
              {/* Hexagon/D20 Shape Background - using SVG or CSS shape */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-900/40 fill-current drop-shadow-md">
                <path d="M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z" />
              </svg>

              {/* Border Outline */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-500/50 fill-none stroke-current stroke-2 group-hover:text-red-400">
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
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {/* @ts-expect-error - ReactNode type mismatch */}
      <Dialog open={!!editingAttr} onOpenChange={(open) => !open && setEditingAttr(null)}>
        {/* @ts-expect-error - ReactNode type mismatch */}
        <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[300px]">
          {/* @ts-expect-error - ReactNode type mismatch */}
          <DialogHeader>
            {/* @ts-expect-error - ReactNode type mismatch */}
            <DialogTitle>Editar {editingAttr?.label}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {/* @ts-expect-error - ReactNode type mismatch */}
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="text-center text-2xl font-bold bg-black/50 border-white/20 h-16"
              autoFocus
            />
          </div>
          {/* @ts-expect-error - ReactNode type mismatch */}
          <DialogFooter>
            {/* @ts-expect-error - ReactNode type mismatch */}
            <Button variant="ghost" onClick={() => setEditingAttr(null)}>Cancelar</Button>
            {/* @ts-expect-error - ReactNode type mismatch */}
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

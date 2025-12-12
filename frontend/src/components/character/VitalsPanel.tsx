import { Checkbox } from "@/components/ui/checkbox"
import { Character } from "@/types/character"
import { useState, ElementType } from "react"
// import { cn } from "@/lib/utils" // Unused
import { AlertCircle } from 'lucide-react'

interface VitalsPanelProps {
  character: Character
  onUpdateResource: (resource: 'pv' | 'san' | 'pe', value: number, isDelta?: boolean) => void
}

export function VitalsPanel({ character }: VitalsPanelProps) {

  const AlertCircleIcon = AlertCircle as ElementType
  const CheckboxAny = Checkbox as any

  // onUpdateResource unused for now in this display-only refactor, but kept in props interface
  const [conditions, setConditions] = useState({
    lesao: false,
    inconsciente: false,
    morrendo: false
  })

  // Safely access nested stats
  const pvCurrent = character.stats?.pv?.current ?? character.resources?.pv?.current ?? 0
  const pvMax = character.stats?.pv?.max ?? character.resources?.pv?.max ?? 1

  const sanCurrent = character.stats?.san?.current ?? character.resources?.san?.current ?? 0
  const sanMax = character.stats?.san?.max ?? character.resources?.san?.max ?? 1

  const peCurrent = character.stats?.pe?.current ?? character.resources?.pe?.current ?? 0
  const peMax = character.stats?.pe?.max ?? character.resources?.pe?.max ?? 1

  const nex = character.stats?.nex ?? 0

  // Calculate percentages
  const pvPercent = Math.min(100, Math.max(0, (pvCurrent / pvMax) * 100))
  const sanPercent = Math.min(100, Math.max(0, (sanCurrent / sanMax) * 100))
  const pePercent = Math.min(100, Math.max(0, (peCurrent / peMax) * 100))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-white">
        <h3 className="font-semibold text-lg">Vida</h3>
        <div className="text-sm text-zinc-400">
          {pvCurrent} / {pvMax}
        </div>
      </div>

      {/* PV Bar */}
      <div className="relative h-6 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/10">
        <div
          className="absolute top-0 left-0 h-full bg-red-700 transition-all duration-300 ease-in-out flex items-center justify-end px-2"
          style={{ width: `${pvPercent}%` }}
        >
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md">
          {pvCurrent} / {pvMax}
        </div>
      </div>

      {/* Conditions */}
      <div className="flex flex-wrap gap-4 py-2">
        <div className="flex items-center space-x-2">
          {/* @ts-ignore */}
          <CheckboxAny
            id="lesao"
            checked={conditions.lesao}
            onCheckedChange={(c: any) => setConditions(prev => ({ ...prev, lesao: !!c }))}
            className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
          />
          <label htmlFor="lesao" className="text-sm font-medium leading-none text-zinc-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Lesão grave
          </label>
        </div>
        <div className="flex items-center space-x-2">
          {/* @ts-ignore */}
          <CheckboxAny
            id="inconsciente"
            checked={conditions.inconsciente}
            onCheckedChange={(c: any) => setConditions(prev => ({ ...prev, inconsciente: !!c }))}
            className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
          />
          <label htmlFor="inconsciente" className="text-sm font-medium leading-none text-zinc-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Inconsciente
          </label>
        </div>
        <div className="flex items-center space-x-2">
          {/* @ts-ignore */}
          <CheckboxAny
            id="morrendo"
            checked={conditions.morrendo}
            onCheckedChange={(c: any) => setConditions(prev => ({ ...prev, morrendo: !!c }))}
            className="border-white/20 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
          />
          <label htmlFor="morrendo" className="text-sm font-medium leading-none text-zinc-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Morrendo
          </label>
        </div>
      </div>

      {/* PE Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-white">
          <h3 className="font-semibold text-sm">Energia</h3>
          <span className="text-xs text-zinc-400">{peCurrent} / {peMax}</span>
        </div>
        <div className="relative h-5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/10">
          <div
            className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300 ease-in-out"
            style={{ width: `${pePercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
            {peCurrent} / {peMax}
          </div>
        </div>
      </div>

      {/* SAN Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-white">
          <h3 className="font-semibold text-sm">Sanidade</h3>
          <span className="text-xs text-zinc-400">{sanCurrent} / {sanMax}</span>
        </div>
        <div className="relative h-5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/10">
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${sanPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
            {sanCurrent} / {sanMax}
          </div>
        </div>
      </div>

      {/* NEX Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-white">
          <h3 className="font-semibold text-sm">NEX</h3>
          <span className="text-xs text-zinc-400">{nex}%</span>
        </div>
        <div className="relative h-5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/10">
          <div
            className="absolute top-0 left-0 h-full bg-purple-600 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(100, nex)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-md">
            {nex}%
          </div>
        </div>
      </div>

      {/* Minimal Stats Slots */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        <div className="bg-zinc-900/40 p-2 rounded-md border border-white/5 text-center">
          <span className="block text-[10px] text-zinc-400 uppercase">Desl.</span>
          <span className="text-sm font-bold text-white">{character.attributes?.agi ? 9 + (character.attributes.agi > 0 ? 3 : 0) : 9}m</span>
        </div>
        <div className="bg-zinc-900/40 p-2 rounded-md border border-white/5 text-center">
          <span className="block text-[10px] text-zinc-400 uppercase">Corpo</span>
          <span className="text-sm font-bold text-white">0</span>
        </div>
        <div className="bg-zinc-900/40 p-2 rounded-md border border-white/5 text-center">
          <span className="block text-[10px] text-zinc-400 uppercase">Tam.</span>
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <div className="bg-zinc-900/40 p-2 rounded-md border border-white/5 text-center">
          <span className="block text-[10px] text-zinc-400 uppercase">Defesa</span>
          <span className="text-sm font-bold text-white">{10 + (character.attributes?.agi || 0)}</span>
        </div>
      </div>
    </div>
  )
}

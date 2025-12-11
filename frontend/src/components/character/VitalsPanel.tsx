// @ts-nocheck
import { useState, useEffect } from 'react'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus, AlertCircle } from 'lucide-react'
import { useCharacterResources } from '@/hooks/useCharacterResources'
import { usePETurnLimit } from '@/hooks/usePETurnLimit'
import { useToast } from '@/hooks/useToast'
import { Character } from '@/types/character'
import { CharacterClass, Attributes } from '@/types/ordemParanormal'
import { Badge } from '@/components/ui/badge'
import { InsanityIndicator } from './InsanityIndicator'
import { InsanityAura } from './InsanityAura'
import { InsanityTurnCounter } from './InsanityTurnCounter'
import { InsanityPermanentEffects } from './InsanityPermanentEffects'

interface VitalsPanelProps {
  character: Character
  onUpdateResource: (resource: 'pv' | 'san' | 'pe', value: number, isDelta: boolean) => void
}

/**
 * Painel de recursos vitais do personagem (PV, SAN, PE, NEX, Defesa)
 * Sistema Ordem Paranormal
 */
export function VitalsPanel({ character, onUpdateResource }: VitalsPanelProps) {
  const stats = character.stats || {}
  const attributes = character.attributes || {}
  const nex = stats.nex || 0

  // Converter attributes para formato Attributes
  const attributesForHook: Attributes = {
    agi: attributes.agi || 0,
    for: attributes.for || 0,
    int: attributes.int || 0,
    pre: attributes.pre || 0,
    vig: attributes.vig || 0,
  }

  // Usar hook para calcular recursos automaticamente
  const { pvMax, sanMax, peMax, defense, validateStats } = useCharacterResources(
    character.class as CharacterClass | undefined,
    attributesForHook,
    nex,
    stats && stats.pv && stats.san && stats.pe && stats.nex !== undefined
      ? {
        pv: stats.pv,
        san: stats.san,
        pe: stats.pe,
        nex: stats.nex,
      }
      : undefined
  )

  // Hook para limite de PE por turno
  const { limit: peTurnLimit, canSpend } = usePETurnLimit(nex)
  const toast = useToast()

  // Validar e ajustar stats com os valores calculados
  const validatedStats = validateStats(
    stats && stats.pv && stats.san && stats.pe && stats.nex !== undefined
      ? {
        pv: stats.pv,
        san: stats.san,
        pe: stats.pe,
        nex: stats.nex,
      }
      : undefined
  )

  const pv = validatedStats.pv
  const san = validatedStats.san
  const pe = validatedStats.pe

  const pvPercent = pv.max > 0 ? (pv.current / pv.max) * 100 : 0
  const sanPercent = san.max > 0 ? (san.current / san.max) * 100 : 0
  const pePercent = pe.max > 0 ? (pe.current / pe.max) * 100 : 0

  /**
   * Handler para incrementar/decrementar recursos
   * Valida limites antes de atualizar
   */
  const handleResourceChange = (
    resource: 'pv' | 'san' | 'pe',
    delta: number
  ) => {
    const current = resource === 'pv' ? pv.current : resource === 'san' ? san.current : pe.current
    const max = resource === 'pv' ? pv.max : resource === 'san' ? san.max : pe.max
    const newValue = current + delta

    // Validação especial para PE: verificar limite por turno ao gastar
    if (resource === 'pe' && delta < 0) {
      const peCost = Math.abs(delta)
      if (!canSpend(peCost)) {
        toast.error(
          'Limite de PE por turno excedido',
          `Você pode gastar no máximo ${peTurnLimit} PE por turno (NEX ${nex}%).`
        )
        return
      }
    }

    // Valida limites
    if (newValue < 0) {
      toast.error('Valor inválido', `${resource.toUpperCase()} não pode ser menor que 0`)
      return
    }
    if (newValue > max) {
      toast.error('Valor inválido', `${resource.toUpperCase()} não pode exceder o máximo (${max})`)
      return
    }

    onUpdateResource(resource, delta, true)
  }

  return (
    <div className="glass-panel rounded-xl p-6 space-y-8 animate-in fade-in-50 duration-300 relative overflow-hidden">
      {/* Aura de Insanidade */}
      <InsanityAura character={character} mode="container" />

      {/* Vida (PV) */}
      <div className="relative z-10 space-y-1">
        <div className="flex justify-between items-end px-1">
          <Label className="text-red-400 font-bold tracking-wider uppercase text-xs">Vida</Label>
          <span className="text-white text-sm font-medium tracking-wide">
            {pv.current} <span className="text-white/40">/</span> {pv.max}
          </span>
        </div>

        <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500 ease-out"
            style={{ width: `${pvPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('pv', -1)}
            className="h-6 w-6 rounded-full p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            disabled={pv.current <= 0}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('pv', 1)}
            className="h-6 w-6 rounded-full p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            disabled={pv.current >= pv.max}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Sanidade (SAN) */}
      <div className="relative z-10 space-y-1">
        <div className="flex justify-between items-end px-1">
          <Label className="text-blue-400 font-bold tracking-wider uppercase text-xs">Sanidade</Label>
          <span className="text-white text-sm font-medium tracking-wide">
            {san.current} <span className="text-white/40">/</span> {san.max}
          </span>
        </div>

        <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out"
            style={{ width: `${sanPercent}%` }}
          />
        </div>

        {/* Indicadores de Sanidade */}
        <div className="flex justify-center gap-2 mt-2">
          <InsanityIndicator
            currentSAN={san.current}
            maxSAN={san.max}
            showDescription={false}
            size="sm"
          />
          <InsanityTurnCounter character={character} />
        </div>
        <InsanityPermanentEffects
          character={character}
          onUpdate={() => { }}
        />

        <div className="flex justify-between items-center pt-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('san', -1)}
            className="h-6 w-6 rounded-full p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            disabled={san.current <= 0}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('san', 1)}
            className="h-6 w-6 rounded-full p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            disabled={san.current >= san.max}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Esforço (PE) */}
      <div className="relative z-10 space-y-1">
        <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2">
            <Label className="text-yellow-400 font-bold tracking-wider uppercase text-xs">Esforço</Label>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">
              LIM: {peTurnLimit}
            </span>
          </div>
          <span className="text-white text-sm font-medium tracking-wide">
            {pe.current} <span className="text-white/40">/</span> {pe.max}
          </span>
        </div>

        <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-900 via-yellow-600 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-500 ease-out"
            style={{ width: `${pePercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center pt-1 opacity-0 hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('pe', -1)}
            className="h-6 w-6 rounded-full p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
            disabled={pe.current <= 0}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleResourceChange('pe', 1)}
            className="h-6 w-6 rounded-full p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
            disabled={pe.current >= pe.max}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* NEX Badge */}
      <div className="absolute top-2 right-2">
        <div className="bg-black/60 backdrop-blur border border-purple-500/30 rounded px-2 py-0.5 text-xs text-purple-300 font-bold tracking-wider">
          {nex}% NEX
        </div>
      </div>
    </div>
  )
}


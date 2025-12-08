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
    <div className="bg-card rounded-lg p-6 space-y-6 animate-in fade-in-50 duration-300 relative overflow-hidden">
      {/* Aura de Insanidade */}
      <InsanityAura character={character} mode="container" />
      
      <h2 className="text-xl font-bold text-white relative z-10">Recursos</h2>

      {/* PV - Pontos de Vida */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-red-400 font-semibold">Pontos de Vida (PV)</Label>
          <span className="text-white text-sm">
            {pv.current} / {pv.max}
          </span>
        </div>
        <AnimatedProgress 
          value={pv.current} 
          max={pv.max}
          color="red"
          className="h-3"
          duration={0.6}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pv', -1)}
            className="flex-1"
            aria-label="Diminuir Pontos de Vida"
            disabled={pv.current <= 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={pv.current}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                if (value < 0) {
                  alert('PV não pode ser menor que 0')
                  return
                }
                if (value > pv.max) {
                  alert(`PV não pode exceder o máximo (${pv.max})`)
                  return
                }
                onUpdateResource('pv', value, false)
              }}
              className="w-20 text-center"
              min={0}
              max={pv.max}
              aria-label="Pontos de Vida atuais"
              aria-valuemin={0}
              aria-valuemax={pv.max}
              aria-valuenow={pv.current}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pv', 1)}
            className="flex-1"
            aria-label="Aumentar Pontos de Vida"
            disabled={pv.current >= pv.max}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SAN - Sanidade */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <Label className="text-blue-400 font-semibold">Sanidade (SAN)</Label>
          <span className="text-white text-sm">
            {san.current} / {san.max}
          </span>
        </div>
        <AnimatedProgress 
          value={san.current} 
          max={san.max}
          color="blue"
          className="h-3"
          duration={0.6}
        />
        {/* Indicador de Estado de Insanidade */}
        <InsanityIndicator 
          currentSAN={san.current} 
          maxSAN={san.max}
          showDescription={false}
          size="sm"
        />
        {/* Contador de Turnos de Insanidade */}
        <InsanityTurnCounter character={character} />
        {/* Consequências Permanentes */}
        <InsanityPermanentEffects 
          character={character} 
          onUpdate={(updated) => {
            // Atualizar personagem quando efeitos permanentes mudarem
            // Isso será tratado pelo componente pai
          }}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('san', -1)}
            className="flex-1"
            aria-label="Diminuir Sanidade"
            disabled={san.current <= 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={san.current}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                if (value < 0) {
                  alert('SAN não pode ser menor que 0')
                  return
                }
                if (value > san.max) {
                  alert(`SAN não pode exceder o máximo (${san.max})`)
                  return
                }
                onUpdateResource('san', value, false)
              }}
              className="w-20 text-center"
              min={0}
              max={san.max}
              aria-label="Sanidade atual"
              aria-valuemin={0}
              aria-valuemax={san.max}
              aria-valuenow={san.current}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('san', 1)}
            className="flex-1"
            aria-label="Aumentar Sanidade"
            disabled={san.current >= san.max}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PE - Pontos de Esforço */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-green-400 font-semibold">Pontos de Esforço (PE)</Label>
            <Badge variant="outline" className="text-xs">
              Limite/Turno: {peTurnLimit}
            </Badge>
          </div>
          <span className="text-white text-sm">
            {pe.current} / {pe.max}
          </span>
        </div>
        <AnimatedProgress 
          value={pe.current} 
          max={pe.max}
          color="green"
          className="h-3"
          duration={0.6}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pe', -1)}
            className="flex-1"
            aria-label="Diminuir Pontos de Esforço"
            disabled={pe.current <= 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={pe.current}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                if (value < 0) {
                  alert('PE não pode ser menor que 0')
                  return
                }
                if (value > pe.max) {
                  alert(`PE não pode exceder o máximo (${pe.max})`)
                  return
                }
                onUpdateResource('pe', value, false)
              }}
              className="w-20 text-center"
              min={0}
              max={pe.max}
              aria-label="Pontos de Esforço atuais"
              aria-valuemin={0}
              aria-valuemax={pe.max}
              aria-valuenow={pe.current}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pe', 1)}
            className="flex-1"
            aria-label="Aumentar Pontos de Esforço"
            disabled={pe.current >= pe.max}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* NEX e Defesa */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <Label className="text-purple-400 font-semibold">NEX</Label>
          <div className="text-2xl font-bold text-white mt-1">{nex}%</div>
        </div>
        <div>
          <Label className="text-yellow-400 font-semibold">Defesa</Label>
          <div className="text-2xl font-bold text-white mt-1">{defense}</div>
        </div>
      </div>
    </div>
  )
}


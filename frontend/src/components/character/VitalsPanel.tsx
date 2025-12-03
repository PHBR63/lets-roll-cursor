import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus } from 'lucide-react'

interface VitalsPanelProps {
  character: any
  onUpdateResource: (resource: 'pv' | 'san' | 'pe', value: number, isDelta: boolean) => void
}

/**
 * Painel de recursos vitais do personagem (PV, SAN, PE, NEX, Defesa)
 * Sistema Ordem Paranormal
 */
export function VitalsPanel({ character, onUpdateResource }: VitalsPanelProps) {
  const stats = character.stats || {}
  const attributes = character.attributes || {}
  const defense = character.defense || 10

  const pv = stats.pv || { current: 0, max: 0 }
  const san = stats.san || { current: 0, max: 0 }
  const pe = stats.pe || { current: 0, max: 0 }
  const nex = stats.nex || 0

  const pvPercent = pv.max > 0 ? (pv.current / pv.max) * 100 : 0
  const sanPercent = san.max > 0 ? (san.current / san.max) * 100 : 0
  const pePercent = pe.max > 0 ? (pe.current / pe.max) * 100 : 0

  /**
   * Handler para incrementar/decrementar recursos
   */
  const handleResourceChange = (
    resource: 'pv' | 'san' | 'pe',
    delta: number
  ) => {
    onUpdateResource(resource, delta, true)
  }

  return (
    <div className="bg-card rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Recursos</h2>

      {/* PV - Pontos de Vida */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-red-400 font-semibold">Pontos de Vida (PV)</Label>
          <span className="text-white text-sm">
            {pv.current} / {pv.max}
          </span>
        </div>
        <Progress value={pvPercent} className="h-3 bg-red-900/30" />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pv', -1)}
            className="flex-1"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={pv.current}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              onUpdateResource('pv', value, false)
            }}
            className="w-20 text-center"
            min={0}
            max={pv.max}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pv', 1)}
            className="flex-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SAN - Sanidade */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-blue-400 font-semibold">Sanidade (SAN)</Label>
          <span className="text-white text-sm">
            {san.current} / {san.max}
          </span>
        </div>
        <Progress value={sanPercent} className="h-3 bg-blue-900/30" />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('san', -1)}
            className="flex-1"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={san.current}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              onUpdateResource('san', value, false)
            }}
            className="w-20 text-center"
            min={0}
            max={san.max}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('san', 1)}
            className="flex-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PE - Pontos de Esforço */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-green-400 font-semibold">Pontos de Esforço (PE)</Label>
          <span className="text-white text-sm">
            {pe.current} / {pe.max}
          </span>
        </div>
        <Progress value={pePercent} className="h-3 bg-green-900/30" />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pe', -1)}
            className="flex-1"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={pe.current}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0
              onUpdateResource('pe', value, false)
            }}
            className="w-20 text-center"
            min={0}
            max={pe.max}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResourceChange('pe', 1)}
            className="flex-1"
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


import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { useCharacterResources } from '@/hooks/useCharacterResources'

interface AttributesGridProps {
  character: any
  onUpdate: (updates: any) => void
}

/**
 * Grid de atributos do sistema Ordem Paranormal
 * 5 atributos: Agilidade, Força, Intelecto, Presença, Vigor
 */
export function AttributesGrid({ character, onUpdate }: AttributesGridProps) {
  const attributes = character.attributes || {
    agi: 0,
    for: 0,
    int: 0,
    pre: 0,
    vig: 0,
  }

  const [localAttributes, setLocalAttributes] = useState(attributes)
  const [hasChanges, setHasChanges] = useState(false)

  const attributeLabels: Record<string, { label: string; short: string }> = {
    agi: { label: 'Agilidade', short: 'AGI' },
    for: { label: 'Força', short: 'FOR' },
    int: { label: 'Intelecto', short: 'INT' },
    pre: { label: 'Presença', short: 'PRE' },
    vig: { label: 'Vigor', short: 'VIG' },
  }

  /**
   * Handler para atualizar atributo localmente
   */
  const handleAttributeChange = (key: string, value: number) => {
    const newAttributes = {
      ...localAttributes,
      [key]: value,
    }
    setLocalAttributes(newAttributes)
    setHasChanges(true)
  }

  /**
   * Salva alterações dos atributos
   * Recalcula defesa automaticamente
   */
  const handleSave = async () => {
    // Atualiza atributos e recalcula defesa
    await onUpdate({ attributes: localAttributes, defense })
    setHasChanges(false)
  }

  // Usar hook para calcular defesa automaticamente
  const { defense } = useCharacterResources(
    character.class,
    localAttributes,
    character.stats?.nex || 0
  )

  return (
    <div className="bg-card rounded-lg p-6 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Atributos</h2>
          <div className="text-xs text-muted-foreground mt-1">
            Defesa calculada: {defense} (10 + AGI)
          </div>
        </div>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(attributeLabels).map(([key, info]) => (
          <div key={key} className="space-y-2">
            <Label className="text-muted-foreground text-sm">
              {info.label} ({info.short})
            </Label>
            <Input
              type="number"
              value={localAttributes[key] || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                handleAttributeChange(key, value)
              }}
              className="text-center text-lg font-bold"
              min={-5}
              max={20}
            />
            <div className="text-xs text-muted-foreground text-center">
              {localAttributes[key] > 0
                ? `+${localAttributes[key]} dados (vantagem)`
                : localAttributes[key] < 0
                ? `${Math.abs(localAttributes[key])} dados (desvantagem)`
                : '1 dado (desvantagem mínima)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


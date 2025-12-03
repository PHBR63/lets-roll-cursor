import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

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
   */
  const handleSave = () => {
    onUpdate({ attributes: localAttributes })
    setHasChanges(false)
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Atributos</h2>
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


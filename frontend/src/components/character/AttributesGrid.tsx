// @ts-nocheck
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'
import { useCharacterResources } from '@/hooks/useCharacterResources'
import { useToast } from '@/hooks/useToast'
import { Character, CharacterUpdateData } from '@/types/character'
import { Attributes } from '@/types/ordemParanormal'
import { CharacterClass } from '@/types/ordemParanormal'
import { supabase } from '@/integrations/supabase/client'
import { getApiBaseUrl } from '@/utils/apiUrl'

interface AttributesGridProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

/**
 * Grid de atributos do sistema Ordem Paranormal
 * 5 atributos: Agilidade, Força, Intelecto, Presença, Vigor
 */
export function AttributesGrid({ character, onUpdate }: AttributesGridProps) {
  const toast = useToast()
  const attributes = character.attributes || {
    agi: 0,
    for: 0,
    int: 0,
    pre: 0,
    vig: 0,
  }

  const [localAttributes, setLocalAttributes] = useState(attributes)
  const [hasChanges, setHasChanges] = useState(false)
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({})

  const attributeLabels: Record<string, { label: string; short: string }> = {
    agi: { label: 'Agilidade', short: 'AGI' },
    for: { label: 'Força', short: 'FOR' },
    int: { label: 'Intelecto', short: 'INT' },
    pre: { label: 'Presença', short: 'PRE' },
    vig: { label: 'Vigor', short: 'VIG' },
  }

  /**
   * Valida valor de atributo
   * Limites: -5 a 20 (sistema Ordem Paranormal)
   */
  const validateAttribute = (key: string, value: number): string | null => {
    if (value < -5) {
      return 'Atributo não pode ser menor que -5'
    }
    if (value > 20) {
      return 'Atributo não pode ser maior que 20'
    }
    return null
  }

  /**
   * Handler para atualizar atributo localmente
   */
  const handleAttributeChange = (key: string, value: number) => {
    const error = validateAttribute(key, value)
    
    if (error) {
      setAttributeErrors((prev) => ({ ...prev, [key]: error }))
      toast.warning('Valor inválido', error)
      return
    }

    setAttributeErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[key]
      return newErrors
    })

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

  // Converter localAttributes para formato Attributes
  const attributesForHook: Attributes = {
    agi: localAttributes.agi || 0,
    for: localAttributes.for || 0,
    int: localAttributes.int || 0,
    pre: localAttributes.pre || 0,
    vig: localAttributes.vig || 0,
  }

  // Usar hook para calcular defesa automaticamente
  const { defense } = useCharacterResources(
    character.class as CharacterClass | undefined,
    attributesForHook,
    character.stats?.nex || 0
  )

  const [rollingAttribute, setRollingAttribute] = useState<string | null>(null)

  /**
   * Rola teste de atributo (teste de resistência)
   */
  const handleRollAttribute = async (attributeKey: string) => {
    if (!character?.id) {
      toast.warning('Aviso', 'Personagem não encontrado')
      return
    }

    const resistanceMap: Record<string, 'Fortitude' | 'Reflexos' | 'Vontade'> = {
      vig: 'Fortitude',
      agi: 'Reflexos',
      pre: 'Vontade',
    }

    const resistanceType = resistanceMap[attributeKey]
    if (!resistanceType) {
      toast.warning('Aviso', 'Este atributo não possui teste de resistência direto')
      return
    }

    setRollingAttribute(attributeKey)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-resistance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            resistanceType,
            difficulty: 15, // DT padrão
            advantageDice: 0,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de resistência')
      }

      const result = await response.json()
      toast.success(
        'Teste de Resistência',
        `${resistanceType}: ${result.total} ${result.success ? '✅' : '❌'} (DT ${result.difficulty})`
      )
    } catch (error: unknown) {
      const err = error as Error
      toast.error('Erro ao rolar teste de resistência', err.message || 'Tente novamente.')
    } finally {
      setRollingAttribute(null)
    }
  }

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
        {Object.entries(attributeLabels).map(([key, info]) => {
          const canRollResistance = ['vig', 'agi', 'pre'].includes(key)
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-sm">
                  {info.label} ({info.short})
                </Label>
                {canRollResistance && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRollAttribute(key)}
                    disabled={rollingAttribute === key}
                    className="w-8 h-8 p-0 hover:bg-accent/20"
                    title={`Rolar teste de ${info.label === 'Vigor' ? 'Fortitude' : info.label === 'Agilidade' ? 'Reflexos' : 'Vontade'}`}
                  >
                    {rollingAttribute === key ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span className="text-xs">🎲</span>
                    )}
                  </Button>
                )}
              </div>
              <Input
                type="number"
                value={localAttributes[key] || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  handleAttributeChange(key, value)
                }}
                className={`text-center text-lg font-bold ${
                  attributeErrors[key] ? 'border-red-500' : ''
                }`}
                min={-5}
                max={20}
                aria-label={`${info.label} (${info.short})`}
                aria-valuemin={-5}
                aria-valuemax={20}
                aria-valuenow={localAttributes[key] || 0}
                aria-invalid={!!attributeErrors[key]}
                aria-describedby={attributeErrors[key] ? `${key}-error` : undefined}
              />
              {attributeErrors[key] && (
                <p id={`${key}-error`} className="text-red-500 text-xs animate-in fade-in-50" role="alert">
                  {attributeErrors[key]}
                </p>
              )}
              <div className="text-xs text-muted-foreground text-center">
                {localAttributes[key] > 0
                  ? `+${localAttributes[key]} dados (vantagem)`
                  : localAttributes[key] < 0
                  ? `${Math.abs(localAttributes[key])} dados (desvantagem)`
                  : '1 dado (desvantagem mínima)'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// @ts-nocheck
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { Character, CharacterUpdateData } from '@/types/character'

interface PersonalDataProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

/**
 * Componente para dados pessoais do personagem
 */
export function PersonalData({ character, onUpdate }: PersonalDataProps) {
  const [localData, setLocalData] = useState({
    name: character.name || '',
    class: character.class || '',
    origin: character.origin || '',
    age: character.age || '',
    height: character.height || '',
    weight: character.weight || '',
  })
  const [hasChanges, setHasChanges] = useState(false)

  /**
   * Handler para atualizar campo
   */
  const handleChange = (field: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  /**
   * Salva alterações
   */
  const handleSave = () => {
    onUpdate(localData)
    setHasChanges(false)
  }

  return (
    <div className="space-y-4 glass-panel p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">Dados Pessoais</h2>
        {hasChanges && (
          <Button onClick={handleSave} className="gap-2 bg-accent hover:bg-accent/90" size="sm">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Nome</Label>
          <Input
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome do personagem"
            className="input-underlined text-lg font-medium text-white placeholder:text-white/20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Classe</Label>
          <Input
            value={localData.class}
            onChange={(e) => handleChange('class', e.target.value)}
            placeholder="Combatente, Especialista, Ocultista"
            className="input-underlined text-white/80"
            disabled
          />
        </div>
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Origem</Label>
          <Input
            value={localData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="Origem do personagem"
            className="input-underlined text-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Idade</Label>
          <Input
            type="number"
            value={localData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="Idade"
            className="input-underlined text-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Local de Origem</Label>
          {/* Campo fictício para alinhar com o design */}
          <Input
            value="Brasil"
            disabled
            className="input-underlined text-white/50 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Local Atual</Label>
          {/* Campo fictício para alinhar com o design */}
          <Input
            value="????"
            disabled
            className="input-underlined text-white/50 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  )
}


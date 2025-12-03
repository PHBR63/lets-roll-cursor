import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface PersonalDataProps {
  character: any
  onUpdate: (updates: any) => void
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nome do personagem"
          />
        </div>
        <div className="space-y-2">
          <Label>Classe</Label>
          <Input
            value={localData.class}
            onChange={(e) => handleChange('class', e.target.value)}
            placeholder="Combatente, Especialista, Ocultista"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label>Origem</Label>
          <Input
            value={localData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="Origem do personagem"
          />
        </div>
        <div className="space-y-2">
          <Label>Idade</Label>
          <Input
            type="number"
            value={localData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="Idade"
          />
        </div>
        <div className="space-y-2">
          <Label>Altura</Label>
          <Input
            value={localData.height}
            onChange={(e) => handleChange('height', e.target.value)}
            placeholder="Ex: 1.75m"
          />
        </div>
        <div className="space-y-2">
          <Label>Peso</Label>
          <Input
            value={localData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            placeholder="Ex: 70kg"
          />
        </div>
      </div>
      {hasChanges && (
        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      )}
    </div>
  )
}


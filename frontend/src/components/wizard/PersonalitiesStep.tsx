import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Personality } from '@/types/wizard'

/**
 * Etapa 3 do wizard: Definição de Personalidades
 * NPCs/Criaturas com barras e propriedades customizáveis
 */
interface PersonalitiesStepProps {
  personalities: Personality[]
  onChange: (personalities: Personality[]) => void
  onBack: () => void
  onSubmit: () => void
}

export function PersonalitiesStep({
  personalities,
  onChange,
  onBack,
  onSubmit,
}: PersonalitiesStepProps) {
  /**
   * Adiciona uma nova personalidade
   */
  const handleAddPersonality = () => {
    onChange([
      ...personalities,
      {
        id: Date.now().toString(),
        name: '',
        bars: [
          { title: 'Ex: Energia', type: 'numerico' },
        ],
        properties: ['Ex: Nome', 'Ex: Descrição'],
      },
    ])
  }

  /**
   * Remove uma personalidade
   */
  const handleRemovePersonality = (id: string) => {
    onChange(personalities.filter((p) => p.id !== id))
  }

  /**
   * Atualiza o nome de uma personalidade
   */
  const handleUpdateName = (id: string, name: string) => {
    onChange(personalities.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  /**
   * Adiciona uma barra a uma personalidade
   */
  const handleAddBar = (personalityId: string) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? {
              ...p,
              bars: [...p.bars, { title: '', type: 'numerico' }],
            }
          : p
      )
    )
  }

  /**
   * Remove uma barra
   */
  const handleRemoveBar = (personalityId: string, index: number) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? { ...p, bars: p.bars.filter((_, i) => i !== index) }
          : p
      )
    )
  }

  /**
   * Atualiza uma barra
   */
  const handleUpdateBar = (
    personalityId: string,
    index: number,
    field: 'title' | 'type',
    value: string
  ) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? {
              ...p,
              bars: p.bars.map((b, i) =>
                i === index ? { ...b, [field]: value } : b
              ),
            }
          : p
      )
    )
  }

  /**
   * Adiciona uma propriedade
   */
  const handleAddProperty = (personalityId: string) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? { ...p, properties: [...p.properties, ''] }
          : p
      )
    )
  }

  /**
   * Remove uma propriedade
   */
  const handleRemoveProperty = (personalityId: string, index: number) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? { ...p, properties: p.properties.filter((_, i) => i !== index) }
          : p
      )
    )
  }

  /**
   * Atualiza uma propriedade
   */
  const handleUpdateProperty = (
    personalityId: string,
    index: number,
    value: string
  ) => {
    onChange(
      personalities.map((p) =>
        p.id === personalityId
          ? {
              ...p,
              properties: p.properties.map((prop, i) =>
                i === index ? value : prop
              ),
            }
          : p
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Personalidades */}
      <div className="space-y-4">
        {personalities.map((personality) => (
          <Card
            key={personality.id}
            className="p-6 border-card-secondary bg-card relative"
          >
            <button
              onClick={() => handleRemovePersonality(personality.id)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label className="text-white">Nome:</Label>
                <Input
                  placeholder="Ex: NPC"
                  value={personality.name}
                  onChange={(e) =>
                    handleUpdateName(personality.id, e.target.value)
                  }
                  className="bg-input border-white/20"
                />
              </div>

              {/* Barras */}
              <div className="space-y-2">
                <Label className="text-white">Barras:</Label>
                <div className="space-y-2">
                  {personality.bars.map((bar, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ex: Energia"
                        value={bar.title}
                        onChange={(e) =>
                          handleUpdateBar(
                            personality.id,
                            index,
                            'title',
                            e.target.value
                          )
                        }
                        className="bg-input border-white/20 flex-1"
                      />
                      <Select
                        value={bar.type}
                        onValueChange={(value) =>
                          handleUpdateBar(
                            personality.id,
                            index,
                            'type',
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-32 bg-input border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-card-secondary">
                          <SelectItem value="percentual">Percentual</SelectItem>
                          <SelectItem value="numerico">Numérico</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBar(personality.id, index)}
                        className="text-text-secondary hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBar(personality.id)}
                    className="text-accent hover:text-accent-light"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Barra
                  </Button>
                </div>
              </div>

              {/* Propriedades */}
              <div className="space-y-2">
                <Label className="text-white">Propriedades:</Label>
                <div className="space-y-2">
                  {personality.properties.map((property, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ex: Nome"
                        value={property}
                        onChange={(e) =>
                          handleUpdateProperty(
                            personality.id,
                            index,
                            e.target.value
                          )
                        }
                        className="bg-input border-white/20 flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveProperty(personality.id, index)
                        }
                        className="text-text-secondary hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddProperty(personality.id)}
                    className="text-accent hover:text-accent-light"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Propriedade
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Botão para adicionar nova personalidade */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleAddPersonality}
          className="border-accent text-accent hover:bg-accent hover:text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Personalidade
        </Button>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-accent hover:bg-accent/90"
        >
          Finalizar
        </Button>
      </div>
    </div>
  )
}


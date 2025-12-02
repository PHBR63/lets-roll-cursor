import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Acquirable } from '@/types/wizard'
import { cn } from '@/lib/utils'

/**
 * Etapa 2 do wizard: Definição de Adquiríveis
 * Cards dinâmicos com nome e propriedades customizáveis
 */
interface AcquirablesStepProps {
  acquirables: Acquirable[]
  onChange: (acquirables: Acquirable[]) => void
  onNext: () => void
  onBack: () => void
}

export function AcquirablesStep({
  acquirables,
  onChange,
  onNext,
  onBack,
}: AcquirablesStepProps) {
  /**
   * Adiciona um novo adquirível
   */
  const handleAddAcquirable = () => {
    onChange([
      ...acquirables,
      {
        id: Date.now().toString(),
        name: '',
        properties: ['Ex: Nome', 'Ex: Descrição'],
      },
    ])
  }

  /**
   * Remove um adquirível
   */
  const handleRemoveAcquirable = (id: string) => {
    onChange(acquirables.filter((a) => a.id !== id))
  }

  /**
   * Atualiza o nome de um adquirível
   */
  const handleUpdateName = (id: string, name: string) => {
    onChange(
      acquirables.map((a) => (a.id === id ? { ...a, name } : a))
    )
  }

  /**
   * Adiciona uma propriedade a um adquirível
   */
  const handleAddProperty = (acquirableId: string) => {
    onChange(
      acquirables.map((a) =>
        a.id === acquirableId
          ? { ...a, properties: [...a.properties, ''] }
          : a
      )
    )
  }

  /**
   * Remove uma propriedade de um adquirível
   */
  const handleRemoveProperty = (acquirableId: string, index: number) => {
    onChange(
      acquirables.map((a) =>
        a.id === acquirableId
          ? { ...a, properties: a.properties.filter((_, i) => i !== index) }
          : a
      )
    )
  }

  /**
   * Atualiza uma propriedade
   */
  const handleUpdateProperty = (
    acquirableId: string,
    index: number,
    value: string
  ) => {
    onChange(
      acquirables.map((a) =>
        a.id === acquirableId
          ? {
              ...a,
              properties: a.properties.map((p, i) => (i === index ? value : p)),
            }
          : a
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Texto explicativo */}
      <div className="text-text-secondary mb-6">
        <p>
          Aqui você indica cada tipo de elemento adquirível pelos jogadores ao
          longo da campanha como por exemplo armas, itens, habilidades e magias
          se fizerem sentido para o seu universo.
        </p>
      </div>

      {/* Cards de Adquiríveis */}
      <div className="space-y-4">
        {acquirables.map((acquirable) => (
          <Card
            key={acquirable.id}
            className="p-6 border-card-secondary bg-card relative"
          >
            <button
              onClick={() => handleRemoveAcquirable(acquirable.id)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label className="text-white">Nome:</Label>
                <Input
                  placeholder="Ex: itens"
                  value={acquirable.name}
                  onChange={(e) =>
                    handleUpdateName(acquirable.id, e.target.value)
                  }
                  className="bg-input border-white/20"
                />
              </div>

              {/* Propriedades */}
              <div className="space-y-2">
                <Label className="text-white">Propriedades:</Label>
                <div className="space-y-2">
                  {acquirable.properties.map((property, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Ex: Nome"
                        value={property}
                        onChange={(e) =>
                          handleUpdateProperty(
                            acquirable.id,
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
                          handleRemoveProperty(acquirable.id, index)
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
                    onClick={() => handleAddProperty(acquirable.id)}
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

      {/* Botão para adicionar novo adquirível */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleAddAcquirable}
          className="border-accent text-accent hover:bg-accent hover:text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Adquirível
        </Button>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          onClick={onNext}
          className="bg-accent hover:bg-accent/90"
        >
          Prosseguir
        </Button>
      </div>
    </div>
  )
}


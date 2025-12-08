// @ts-nocheck
import { useState, useRef } from 'react'
import { Camera, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Etapa 1 do wizard: Base do RPG
 * Upload de imagem, seleção de sistema, título e descrição
 */
interface BaseRPGStepProps {
  data: {
    image?: File
    systemRpg?: string
    title: string
    description: string
  }
  onChange: (data: Partial<BaseRPGStepProps['data']>) => void
  onNext: () => void
}

const SYSTEMS = ['Sistema X', 'Sistema Y', 'Sistema Z', 'Sistema XYZ']

export function BaseRPGStep({ data, onChange, onNext }: BaseRPGStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  /**
   * Função para lidar com upload de imagem
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange({ image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * Função para selecionar sistema RPG
   */
  const handleSystemSelect = (system: string) => {
    onChange({ systemRpg: system })
  }

  /**
   * Validação antes de avançar
   */
  const canProceed = data.title.trim().length > 0

  return (
    <div className="space-y-8">
      {/* Upload de Imagem */}
      <div>
        <Label className="text-white mb-2 block">Imagem da Campanha</Label>
        <Card
          className="h-64 border-card-secondary bg-card cursor-pointer hover:border-accent transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <Camera className="w-12 h-12 mb-2" />
              <span>Imagem</span>
            </div>
          )}
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Seleção de Sistema */}
      <div>
        <Label className="text-white mb-4 block">Sistema do RPG:</Label>
        <div className="grid grid-cols-4 gap-4">
          {SYSTEMS.map((system) => (
            <Card
              key={system}
              className={cn(
                'h-32 border-2 cursor-pointer transition-all hover:scale-105',
                data.systemRpg === system
                  ? 'border-accent bg-accent/20'
                  : 'border-card-secondary bg-card hover:border-accent/50'
              )}
              onClick={() => handleSystemSelect(system)}
            >
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {data.systemRpg === system ? (
                  <Check className="w-8 h-8 text-accent" />
                ) : (
                  <div className="w-8 h-8 bg-card-secondary rounded" />
                )}
                <span className="text-white text-sm text-center px-2">
                  {system}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">
          Título do RPG:
        </Label>
        <Input
          id="title"
          placeholder="Nome do seu RPG aqui"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="bg-input border-white/20"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Descrição do RPG:
        </Label>
        <textarea
          id="description"
          placeholder="Descreva aqui o mundo e particularidades de seu RPG..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full min-h-32 px-3 py-2 rounded-md border border-white/20 bg-input text-white placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      {/* Botão Prosseguir */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-accent hover:bg-accent/90"
        >
          Prosseguir
        </Button>
      </div>
    </div>
  )
}


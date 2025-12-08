// @ts-nocheck
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Sparkles } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { useApiError } from '@/hooks/useApiError'
import { OriginConfig } from '@/types/origin'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface OriginSelectorProps {
  value?: string
  onChange: (origin: string | undefined) => void
  disabled?: boolean
}

/**
 * Componente para seleção de origem
 * Mostra perícias treinadas e poder da origem selecionada
 */
export function OriginSelector({ value, onChange, disabled }: OriginSelectorProps) {
  const [origins, setOrigins] = useState<OriginConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrigin, setSelectedOrigin] = useState<OriginConfig | null>(null)
  const toast = useToast()
  const { handleErrorWithToast, handleResponseError } = useApiError()

  useEffect(() => {
    loadOrigins()
  }, [])

  useEffect(() => {
    if (value && origins.length > 0) {
      const origin = origins.find(o => o.id === value)
      setSelectedOrigin(origin || null)
    } else {
      setSelectedOrigin(null)
    }
  }, [value, origins])

  const loadOrigins = async () => {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/origins`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao carregar origens')
        return
      }

      const data = await response.json()
      setOrigins(data)
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao carregar origens')
    } finally {
      setLoading(false)
    }
  }

  const handleOriginChange = (originId: string) => {
    const origin = origins.find(o => o.id === originId)
    setSelectedOrigin(origin || null)
    onChange(originId || undefined)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="origin" className="text-white">
            Origem
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-text-secondary cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  A origem define o passado do personagem e concede perícias treinadas e um poder especial automaticamente.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value || ''}
          onValueChange={handleOriginChange}
          disabled={disabled || loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma origem (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {origins.map((origin) => (
              <SelectItem key={origin.id} value={origin.id}>
                <div className="flex items-center gap-2">
                  <span>{origin.name}</span>
                  {origin.isHomebrew && (
                    <Badge variant="outline" className="text-xs bg-yellow-900/20 border-yellow-600 text-yellow-400">
                      Homebrew
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Informações da origem selecionada */}
      {selectedOrigin && (
        <Card className="bg-card-secondary p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-semibold">{selectedOrigin.name}</h4>
            {selectedOrigin.isHomebrew && (
              <Badge variant="outline" className="text-xs bg-yellow-900/20 border-yellow-600 text-yellow-400">
                Homebrew
              </Badge>
            )}
          </div>

          <p className="text-text-secondary text-sm">{selectedOrigin.description}</p>

          {/* Perícias treinadas */}
          <div>
            <Label className="text-text-secondary text-xs mb-2 block">
              Perícias Treinadas:
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedOrigin.trainedSkills.map((skill) => (
                <Badge key={skill} variant="default" className="bg-purple-600">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Poder da origem */}
          <div>
            <Label className="text-text-secondary text-xs mb-2 block">
              Poder da Origem:
            </Label>
            <div className="bg-card p-3 rounded-md">
              <h5 className="text-white font-semibold text-sm mb-1">
                {selectedOrigin.power.name}
              </h5>
              <p className="text-text-secondary text-xs">
                {selectedOrigin.power.description}
              </p>
              {selectedOrigin.power.effect && (
                <p className="text-purple-400 text-xs mt-1 italic">
                  {selectedOrigin.power.effect}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}


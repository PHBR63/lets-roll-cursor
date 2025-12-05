import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import { useApiError } from '@/hooks/useApiError'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { ArrowLeft, Loader2, Plus, Minus } from 'lucide-react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OriginSelector } from '@/components/character/OriginSelector'

/**
 * Schema de validação para criação de personagem
 */
const createCharacterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  class: z.enum(['COMBATENTE', 'ESPECIALISTA', 'OCULTISTA'], {
    required_error: 'Classe é obrigatória',
  }),
  origin: z.string().optional(),
  path: z.string().max(100).optional(),
  agi: z.number().int().min(0).max(3),
  for: z.number().int().min(0).max(3),
  int: z.number().int().min(0).max(3),
  pre: z.number().int().min(0).max(3),
  vig: z.number().int().min(0).max(3),
  nex: z.number().int().min(0).max(99).default(5),
})

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>

/**
 * Página de criação de personagem
 * Formulário para criar um novo personagem na campanha
 * Implementa sistema de distribuição de pontos: base 1, pool 4, max 3, soma 9
 */
export function CreateCharacter() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const [loading, setLoading] = useState(false)
  
  // Estado para atributos (começam em 1)
  const [attributes, setAttributes] = useState({
    agi: 1,
    for: 1,
    int: 1,
    pre: 1,
    vig: 1,
  })
  
  // Pool de pontos disponíveis (inicial: 4)
  const [availablePoints, setAvailablePoints] = useState(4)
  
  // Flag para rastrear se já reduziu um atributo para 0
  const [hasReducedAttribute, setHasReducedAttribute] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCharacterFormData>({
    // @ts-expect-error - zodResolver type incompatibility
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      agi: 1,
      for: 1,
      int: 1,
      pre: 1,
      vig: 1,
      nex: 5,
      origin: undefined,
    },
  })

  const selectedOrigin = watch('origin')
  
  // Observar mudanças nos atributos do formulário
  const watchedAttributes = watch(['agi', 'for', 'int', 'pre', 'vig'])
  
  // Sincronizar estado local com formulário
  useEffect(() => {
    setAttributes({
      agi: watchedAttributes[0] || 1,
      for: watchedAttributes[1] || 1,
      int: watchedAttributes[2] || 1,
      pre: watchedAttributes[3] || 1,
      vig: watchedAttributes[4] || 1,
    })
  }, [watchedAttributes])
  
  // Calcular soma total dos atributos
  const totalAttributes = useMemo(() => {
    return attributes.agi + attributes.for + attributes.int + attributes.pre + attributes.vig
  }, [attributes])
  
  // Calcular pontos usados (atributos - 5 base)
  const usedPoints = useMemo(() => {
    return totalAttributes - 5
  }, [totalAttributes])
  
  // Validar se distribuição está correta
  const isValidDistribution = useMemo(() => {
    // Soma deve ser 9 (5 base + 4 distribuídos)
    return totalAttributes === 9
  }, [totalAttributes])
  
  // Verificar se algum atributo excede o máximo (3)
  const exceedsMax = useMemo(() => {
    return Object.values(attributes).some(attr => attr > 3)
  }, [attributes])
  
  /**
   * Ajusta atributo e pool de pontos
   */
  const adjustAttribute = (attrName: keyof typeof attributes, delta: number) => {
    const currentValue = attributes[attrName]
    const newValue = currentValue + delta
    
    // Validações
    if (newValue < 0) {
      // Permitir reduzir para 0 apenas uma vez
      if (!hasReducedAttribute && currentValue === 1) {
        setAttributes(prev => ({ ...prev, [attrName]: 0 }))
        setAvailablePoints(prev => prev + 1) // Incrementa pool ao reduzir para 0
        setHasReducedAttribute(true)
        setValue(attrName, 0)
      }
      return
    }
    
    if (newValue > 3) {
      return // Máximo 3 na criação
    }
    
    // Se estava em 0 e está aumentando, não precisa mais do bônus
    if (currentValue === 0 && delta > 0 && hasReducedAttribute) {
      setAvailablePoints(prev => prev - 1) // Remove bônus ao sair de 0
      setHasReducedAttribute(false)
    }
    
    // Calcular mudança no pool
    const poolChange = -delta
    
    if (availablePoints + poolChange < 0) {
      return // Não há pontos suficientes
    }
    
    setAttributes(prev => ({ ...prev, [attrName]: newValue }))
    setAvailablePoints(prev => prev + poolChange)
    setValue(attrName, newValue)
  }

  useEffect(() => {
    if (!campaignId) {
      toast.error('Campanha não encontrada')
      navigate('/dashboard')
    }
  }, [campaignId, navigate, toast])

  /**
   * Submete o formulário e cria o personagem
   */
  const onSubmit = async (data: CreateCharacterFormData) => {
    if (!user || !campaignId) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Sessão não encontrada')
      }

      const apiUrl = getApiBaseUrl()

      // Preparar dados para envio conforme schema do backend
      const characterData = {
        campaignId,
        name: data.name,
        class: data.class,
        origin: data.origin || undefined,
        path: data.path || undefined,
        attributes: {
          agi: data.agi,
          for: data.for,
          int: data.int,
          pre: data.pre,
          vig: data.vig,
        },
        stats: {
          pv: {
            current: 1, // Valor mínimo, será recalculado pelo backend
            max: 1, // Valor mínimo, será recalculado pelo backend
          },
          san: {
            current: 1, // Valor mínimo, será recalculado pelo backend
            max: 1, // Valor mínimo, será recalculado pelo backend
          },
          pe: {
            current: 1, // Valor mínimo, será recalculado pelo backend
            max: 1, // Valor mínimo, será recalculado pelo backend
          },
          nex: data.nex,
        },
      }

      const response = await fetch(`${apiUrl}/api/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(characterData),
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao criar personagem')
        return
      }

      const character = await response.json()
      toast.success('Personagem criado com sucesso!')
      navigate(`/character/${character.id}`)
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao criar personagem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/campaign/${campaignId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Criar Personagem</h1>
          </div>

          <Card className="bg-card border-card-secondary">
            <CardHeader>
              <CardTitle className="text-white">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Nome do Personagem
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Ex: João Silva"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>

                {/* Classe */}
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-white">
                    Classe
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('class', value as 'COMBATENTE' | 'ESPECIALISTA' | 'OCULTISTA')}
                  >
                    <SelectTrigger className={errors.class ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione uma classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMBATENTE">Combatente</SelectItem>
                      <SelectItem value="ESPECIALISTA">Especialista</SelectItem>
                      <SelectItem value="OCULTISTA">Ocultista</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.class && (
                    <p className="text-red-500 text-sm">{errors.class.message}</p>
                  )}
                </div>

                {/* Origem */}
                <OriginSelector
                  value={selectedOrigin}
                  onChange={(origin) => setValue('origin', origin)}
                />

                {/* Caminho (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="path" className="text-white">
                    Caminho (Opcional)
                  </Label>
                  <Input
                    id="path"
                    {...register('path')}
                    placeholder="Ex: Aniquilador"
                    className={errors.path ? 'border-red-500' : ''}
                  />
                  {errors.path && (
                    <p className="text-red-500 text-sm">{errors.path.message}</p>
                  )}
                </div>

                {/* NEX */}
                <div className="space-y-2">
                  <Label htmlFor="nex" className="text-white">
                    NEX (%)
                  </Label>
                  <Input
                    id="nex"
                    type="number"
                    min="0"
                    max="99"
                    {...register('nex', { valueAsNumber: true })}
                    className={errors.nex ? 'border-red-500' : ''}
                  />
                  {errors.nex && (
                    <p className="text-red-500 text-sm">{errors.nex.message}</p>
                  )}
                </div>

                {/* Atributos - Sistema de Distribuição de Pontos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white text-lg">Distribuição de Atributos</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary text-sm">Pontos disponíveis:</span>
                      <span className={`text-lg font-bold ${availablePoints === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {availablePoints}
                      </span>
                    </div>
                  </div>
                  
                  {/* Informações de validação */}
                  <div className="bg-card-secondary p-3 rounded-md space-y-1">
                    <p className="text-text-secondary text-sm">
                      Todos os atributos começam em 1. Você tem 4 pontos para distribuir.
                    </p>
                    <p className="text-text-secondary text-sm">
                      Máximo de 3 por atributo na criação. Soma total deve ser 9.
                    </p>
                    {hasReducedAttribute && (
                      <p className="text-yellow-400 text-sm">
                        Você reduziu um atributo para 0 (+1 ponto no pool).
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-text-secondary text-sm">Soma atual:</span>
                      <span className={`font-bold ${isValidDistribution ? 'text-green-400' : 'text-red-400'}`}>
                        {totalAttributes} / 9
                      </span>
                    </div>
                    {!isValidDistribution && (
                      <p className="text-red-400 text-sm mt-1">
                        A soma dos atributos deve ser exatamente 9 para continuar.
                      </p>
                    )}
                    {exceedsMax && (
                      <p className="text-red-400 text-sm mt-1">
                        Nenhum atributo pode exceder 3 na criação.
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(['agi', 'for', 'int', 'pre', 'vig'] as const).map((attrName) => {
                      const attrLabel = {
                        agi: 'Agilidade',
                        for: 'Força',
                        int: 'Intelecto',
                        pre: 'Presença',
                        vig: 'Vigor',
                      }[attrName]
                      
                      const value = attributes[attrName]
                      const canDecrease = value > 0
                      const canIncrease = value < 3 && availablePoints > 0
                      
                      return (
                        <div key={attrName} className="space-y-2">
                          <Label htmlFor={attrName} className="text-white text-sm">
                            {attrLabel}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => adjustAttribute(attrName, -1)}
                              disabled={!canDecrease}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id={attrName}
                              type="number"
                              min="0"
                              max="3"
                              value={value}
                              readOnly
                              className="text-center font-bold"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => adjustAttribute(attrName, 1)}
                              disabled={!canIncrease}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <input
                            type="hidden"
                            {...register(attrName, { valueAsNumber: true })}
                            value={value}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/campaign/${campaignId}`)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    disabled={loading || !isValidDistribution || exceedsMax}
                    title={
                      !isValidDistribution
                        ? 'A soma dos atributos deve ser 9'
                        : exceedsMax
                        ? 'Nenhum atributo pode exceder 3'
                        : ''
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Personagem'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}


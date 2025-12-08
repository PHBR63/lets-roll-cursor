// @ts-nocheck
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { NotFoundState } from '@/components/common/EmptyState'
import { VitalsPanel } from '@/components/character/VitalsPanel'
import { AttributesGrid } from '@/components/character/AttributesGrid'
import { PersonalData } from '@/components/character/PersonalData'
import { SkillsGrid } from '@/components/character/SkillsGrid'
import { InventoryPanel } from '@/components/character/InventoryPanel'
import { ConditionsPanel } from '@/components/character/ConditionsPanel'
import { Biography } from '@/components/character/Biography'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import { useApiError } from '@/hooks/useApiError'
import { useRetry } from '@/hooks/useRetry'
import { Character, CharacterUpdateData } from '@/types/character'
import { AppError } from '@/types/common'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SEOHead } from '@/components/common/SEOHead'

/**
 * Página da ficha de personagem do sistema Ordem Paranormal
 * Exibe todas as informações do personagem em layout 2 colunas
 */
export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleErrorWithToast, handleResponseError } = useApiError()

  useEffect(() => {
    if (id) {
      loadCharacter().then(() => {
        setLoading(false)
      })
    }
  }, [id, user])

  /**
   * Carrega dados do personagem (com retry)
   */
  const loadCharacterFn = async () => {
    if (!id || !user) return null

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      throw new Error('Sessão não encontrada')
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/characters/${id}`, {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        setError('Personagem não encontrado')
        return null
      }
      await handleResponseError(response, 'Erro ao carregar personagem')
      return null
    }

    const data = await response.json()
    setCharacter(data)
    return data
  }

  const { execute: loadCharacter, loading: loadingCharacter } = useRetry(loadCharacterFn, {
    maxRetries: 3,
    delay: 1000,
    onError: (err) => {
      handleErrorWithToast(err, 'Erro ao carregar personagem')
    },
  })

  /**
   * Salva alterações do personagem (debounce automático)
   */
  const saveCharacter = async (updates: CharacterUpdateData) => {
    if (!id || !user || saving) return

    setSaving(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao salvar personagem')
        return
      }

      const data = await response.json()
      setCharacter(data)
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  /**
   * Handler para atualizar recursos (PV, SAN, PE)
   */
  const handleUpdateResource = async (
    resource: 'pv' | 'san' | 'pe',
    value: number,
    isDelta: boolean = false
  ) => {
    if (!id || !user) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/characters/${id}/${resource}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ value, isDelta }),
      })

      if (!response.ok) {
        await handleResponseError(response, `Erro ao atualizar ${resource.toUpperCase()}`)
        return
      }

      const data = await response.json()
      setCharacter(data.character)
    } catch (error) {
      handleErrorWithToast(error, `Erro ao atualizar ${resource.toUpperCase()}`)
    }
  }

  if (loading || loadingCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando ficha...</div>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <NotFoundState
            title={error || 'Personagem não encontrado'}
            description="O personagem que você está procurando não existe ou foi removido."
          />
        </div>
        <Footer />
      </div>
    )
  }

  const baseUrl = import.meta.env.VITE_APP_URL || 'https://lets-roll.vercel.app'
  const characterName = character.name || 'Personagem'
  const characterClass = character.class || ''
  const campaignName = character.campaign?.name || ''

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${characterName} - Ficha de Personagem ${characterClass ? `(${characterClass})` : ''} | Let's Roll`}
        description={`Ficha completa do personagem ${characterName}${characterClass ? ` - ${characterClass}` : ''}${campaignName ? ` na campanha ${campaignName}` : ''}. Atributos, perícias, inventário, condições e biografia do sistema Ordem Paranormal.`}
        keywords={`ficha de personagem, ${characterName}, ${characterClass}, Ordem Paranormal, personagem RPG, ficha RPG online${campaignName ? `, ${campaignName}` : ''}`}
        canonical={`${baseUrl}/character/${id}`}
        ogTitle={`${characterName} - Ficha de Personagem`}
        ogDescription={`Ficha completa do personagem ${characterName} no sistema Ordem Paranormal.`}
        noindex={true}
      />
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {characterName}
            </h1>
          </div>
          {saving && (
            <div className="text-sm text-muted-foreground">Salvando...</div>
          )}
        </div>

        {/* Layout 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Vitals Panel */}
            <VitalsPanel
              character={character}
              onUpdateResource={handleUpdateResource}
            />

            {/* Attributes Grid */}
            <AttributesGrid
              character={character}
              onUpdate={saveCharacter}
            />

            {/* Personal Data */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personal-data">
                <AccordionTrigger>Dados Pessoais</AccordionTrigger>
                <AccordionContent>
                  <PersonalData
                    character={character}
                    onUpdate={saveCharacter}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Inventory */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="inventory">
                <AccordionTrigger>Inventário</AccordionTrigger>
                <AccordionContent>
                  <InventoryPanel
                    character={character}
                    onUpdate={loadCharacter}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Biography */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="biography">
                <AccordionTrigger>Biografia</AccordionTrigger>
                <AccordionContent>
                  <Biography
                    character={character}
                    onUpdate={saveCharacter}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Skills Grid */}
            <SkillsGrid
              character={character}
              onUpdate={saveCharacter}
            />

            {/* Conditions */}
            <ConditionsPanel
              character={character}
              onUpdate={loadCharacter}
            />

            {/* Seções adicionais podem ser adicionadas aqui */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}


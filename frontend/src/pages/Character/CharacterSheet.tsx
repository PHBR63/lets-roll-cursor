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
import { Grimoire } from '@/components/character/Grimoire'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
import { getApiBaseUrl } from '@/utils/apiUrl'
import { DiceRoller } from '@/components/session/DiceRoller/DiceRoller'
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog'
import { useToast } from '@/hooks/useToast'

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const toast = useToast()

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

    const apiUrl = getApiBaseUrl()
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

      const apiUrl = getApiBaseUrl()
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

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/characters/${id}/${resource}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ [resource]: value, isDelta }),
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

  /**
   * Handler para deletar personagem
   */
  const handleDeleteCharacter = async () => {
    if (!id || !user || !character) return

    setDeleting(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/characters/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao deletar personagem')
        return
      }

      toast.success('Personagem deletado', `${character.name} foi removido com sucesso.`)

      // Redirecionar para lista de personagens ou dashboard
      if (character.campaign_id) {
        navigate(`/campaign/${character.campaign_id}`)
      } else {
        navigate('/characters')
      }
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao deletar personagem')
    } finally {
      setDeleting(false)
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
      <div className="page-container py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary/80 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-title leading-tight">{characterName}</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {saving && (
              <div className="text-sm text-text-secondary">Salvando...</div>
            )}
            {character && character.user_id === user?.id && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 w-full sm:w-auto justify-center"
                title="Deletar personagem"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
            )}
          </div>
        </div>

        {/* Layout responsivo em colunas */}
        <div className="section-grid lg:gap-6 xl:grid-cols-3">
          {/* Coluna Esquerda (informações principais) */}
          <div className="space-y-4 sm:space-y-5 min-w-0 xl:col-span-2">
            {/* Vitals Panel */}
            <div className="min-w-0">
              <VitalsPanel
                character={character}
                onUpdateResource={handleUpdateResource}
              />
            </div>

            {/* Attributes Grid */}
            <div className="section-card p-4 sm:p-5 min-w-0">
              <AttributesGrid
                character={character}
                onUpdate={saveCharacter}
              />
            </div>

            {/* Personal Data */}
            <div className="section-card p-4 sm:p-5 min-w-0">
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
            </div>

            {/* Inventory */}
            <div className="section-card p-4 sm:p-5 min-w-0 overflow-x-auto">
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
            </div>

            {/* Biography */}
            <div className="section-card p-4 sm:p-5 min-w-0">
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
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4 sm:space-y-5 min-w-0">
            {/* Skills Grid */}
            <div className="section-card p-4 sm:p-5 min-w-0 overflow-x-auto">
              <SkillsGrid
                character={character}
                onUpdate={saveCharacter}
              />
            </div>

            {/* Conditions */}
            <div className="section-card p-4 sm:p-5 min-w-0">
              <ConditionsPanel
                character={character}
                onUpdate={loadCharacter}
              />
            </div>

            {/* Rolagem de Dados */}
            <div className="section-card p-4 sm:p-5 min-w-0">
              <h2 className="text-subtitle mb-4">Rolagem de Dados</h2>
              <DiceRoller
                sessionId={undefined}
                campaignId={character.campaign_id || undefined}
              />
            </div>

            {/* Seções adicionais podem ser adicionadas aqui */}
          </div>
        </div>
      </div>
      <Footer />

      {/* Dialog de confirmação de exclusão */}
      {character && (
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteCharacter}
          title="Deletar Personagem"
          description={`Tem certeza que deseja deletar o personagem "${character.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`}
          confirmLabel="Deletar Personagem"
          loading={deleting}
        />
      )}
    </div>
  )
}


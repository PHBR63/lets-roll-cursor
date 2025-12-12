
import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useApiError } from '@/hooks/useApiError'
import { useRetry } from '@/hooks/useRetry'
import { Character, CharacterUpdateData } from '@/types/character'
import { getApiBaseUrl } from '@/utils/apiUrl'


// New Layout Components
import { CharacterSheetTopbar } from '@/components/character/layout/CharacterSheetTopbar'
import { CharacterSheetLeftColumn } from '@/components/character/CharacterSheetLeftColumn'
import { CharacterSheetRightColumn } from '@/components/character/CharacterSheetRightColumn'
import { DiceRoller } from '@/components/session/DiceRoller/DiceRoller'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Dices } from 'lucide-react'
import { SEOHead } from '@/components/common/SEOHead'

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleErrorWithToast, handleResponseError } = useApiError()


  const loadCharacterFn = useCallback(async () => {
    if (!id || !user) return null
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) throw new Error('Sessão não encontrada')

    const apiUrl = getApiBaseUrl()
    const response = await fetch(`${apiUrl}/api/characters/${id}`, {
      headers: { Authorization: `Bearer ${session.session.access_token}` },
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
  }, [id, user, handleResponseError])

  const handleRetryError = useCallback((err: Error) => {
    handleErrorWithToast(err, 'Erro ao carregar personagem')
  }, [handleErrorWithToast])

  const { execute: loadCharacter } = useRetry(loadCharacterFn, {
    maxRetries: 3,
    baseDelay: 1000,
    onError: handleRetryError,
  })

  useEffect(() => {
    if (id) {
      loadCharacter().then(() => setLoading(false))
    }
  }, [id, loadCharacter])

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white animate-pulse">Carregando Grimório...</div>
  if (error || !character) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">{error || 'Erro desconhecido'}</div>

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${character.name} | Ficha`}
        description="Ficha de Personagem"
      />

      {/* Topbar */}
      <CharacterSheetTopbar
        title="Ficha de Personagem"
        onBack={() => navigate(-1)}
      />

      <div className="page-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column (Fixed/Smaller) */}
          <div className="lg:col-span-4 xl:col-span-4 min-w-0">
            <CharacterSheetLeftColumn
              character={character}
              onUpdate={saveCharacter}
              onRefresh={loadCharacter}
            />
          </div>

          {/* Right Column (Scrollable/Larger) */}
          <div className="lg:col-span-8 xl:col-span-8 min-w-0">
            <CharacterSheetRightColumn
              character={character}
              onUpdate={saveCharacter}
            />
          </div>
        </div>
      </div>

      {/* Floating Dice Roller Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* @ts-expect-error - Known ReactNode type mismatch issue with functional components */}
        <Sheet>
          {/* @ts-expect-error - Known ReactNode type mismatch issue with functional components */}
          <SheetTrigger asChild>
            <Button className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-500 shadow-2xl border-2 border-purple-400/50 flex items-center justify-center">
              {/* @ts-expect-error - Known ReactNode type mismatch issue with functional components */}
              <Dices className="w-8 h-8 text-white" />
            </Button>
          </SheetTrigger>
          {/* @ts-expect-error - Known ReactNode type mismatch issue with functional components */}
          <SheetContent side="right" className="w-[400px] bg-zinc-900/95 border-l border-white/10 backdrop-blur-xl p-0">
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                {/* @ts-expect-error - Known ReactNode type mismatch issue with functional components */}
                <Dices className="w-6 h-6 text-purple-500" />
                Rolador de Dados
              </h2>
              <DiceRoller
                campaignId={character.campaign_id}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

    </div>
  )
}

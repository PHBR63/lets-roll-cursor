import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { GameBoard } from '@/components/session/GameBoard/index'
import { PlayerListSidebar } from '@/components/session/PlayerListSidebar'
import { DiceRoller } from '@/components/session/DiceRoller'
import { ChatPanel } from '@/components/session/ChatPanel'
import { RollHistory } from '@/components/session/RollHistory'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Users, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useApiError } from '@/hooks/useApiError'
import { useRetry } from '@/hooks/useRetry'
import { NotFoundState } from '@/components/common/EmptyState'
import { Session } from '@/types/session'
import { CampaignParticipant } from '@/types/campaign'

/**
 * Página principal da sala de sessão de jogo
 * Layout: Header + GameBoard (centro) + Sidebar (direita)
 */
export function SessionRoom() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMaster, setIsMaster] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleErrorWithToast, handleResponseError } = useApiError()

  useEffect(() => {
    if (campaignId && user) {
      // Verificar role primeiro, depois carregar sessão
      checkMasterRole().then(() => {
        loadSession().then(() => {
          setLoading(false)
        })
      })
    }
  }, [campaignId, user])

  /**
   * Carrega ou cria sessão ativa (com retry)
   */
  const loadSessionFn = async () => {
    if (!user || !campaignId) return null

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      throw new Error('Sessão não encontrada')
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    
    // Tentar buscar sessão ativa
    const response = await fetch(
      `${apiUrl}/api/sessions?campaignId=${campaignId}&active=true`,
      {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // Não é erro, apenas não há sessão ativa
        return null
      }
      await handleResponseError(response, 'Erro ao carregar sessão')
      return null
    }

    const sessions = await response.json()
    if (sessions.length > 0) {
      setSession(sessions[0])
      return sessions[0]
    } else {
      // Criar nova sessão se não existir (apenas mestre)
      await checkMasterRole()
      if (isMaster) {
        const newSession = await createSession()
        return newSession
      }
    }

    return null
  }

  const { execute: loadSession, loading: loadingSession } = useRetry(loadSessionFn, {
    maxRetries: 3,
    delay: 1000,
    onError: (err) => {
      handleErrorWithToast(err, 'Erro ao carregar sessão')
    },
  })

  /**
   * Cria uma nova sessão
   */
  const createSession = async () => {
    try {
      if (!user || !campaignId) return null

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('Sessão não encontrada')
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          campaignId,
          name: `Sessão ${new Date().toLocaleDateString()}`,
        }),
      })

      if (response.ok) {
        const newSession = await response.json()
        setSession(newSession)
        return newSession
      } else {
        await handleResponseError(response, 'Erro ao criar sessão')
        return null
      }
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao criar sessão')
      return null
    }
  }

  /**
   * Verifica se usuário é mestre
   */
  const checkMasterRole = async () => {
    try {
      if (!user || !campaignId) return false

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return false

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      })

      if (response.ok) {
        const campaign = await response.json()
        const participant = campaign.participants?.find(
          (p: CampaignParticipant) => p.user?.id === user.id && p.role === 'master'
        )
        setIsMaster(!!participant)
        return !!participant
      }
      return false
    } catch (error) {
      // Erro silencioso - role pode não estar disponível
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando sessão...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="session-room">
      <Navbar />

      <main className="flex-1 flex overflow-hidden relative">
        {/* Área Principal - Game Board */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Botão para abrir sidebar em mobile */}
          <div className="lg:hidden absolute top-4 right-4 z-10">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="default" className="bg-accent">
                  <Users className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-card-secondary w-80 p-0">
                <PlayerListSidebar
                  campaignId={campaignId}
                  sessionId={session?.id}
                  isMaster={isMaster}
                />
              </SheetContent>
            </Sheet>
          </div>

          <GameBoard sessionId={session?.id} campaignId={campaignId} />
          
          {/* Área inferior: Dice Roller, Histórico e Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 p-2 md:p-4 border-t border-card-secondary bg-background">
            <div className="bg-card border border-card-secondary rounded-lg p-3 md:p-4 min-h-[250px] md:min-h-[300px] max-h-[350px] md:max-h-[400px] overflow-y-auto">
              <DiceRoller sessionId={session?.id} campaignId={campaignId} />
            </div>
            <div className="bg-card border border-card-secondary rounded-lg min-h-[250px] md:min-h-[300px] max-h-[350px] md:max-h-[400px] flex flex-col">
              <div className="p-3 md:p-4 border-b border-card-secondary">
                <h3 className="text-white font-semibold text-sm md:text-base">Histórico de Rolagens</h3>
              </div>
              <RollHistory sessionId={session?.id} campaignId={campaignId} />
            </div>
            <div className="bg-card border border-card-secondary rounded-lg min-h-[250px] md:min-h-[300px] max-h-[350px] md:max-h-[400px] flex flex-col">
              <ChatPanel sessionId={session?.id} campaignId={campaignId} />
            </div>
          </div>
        </div>

        {/* Sidebar Direita - Player List (Desktop) */}
        <div className="hidden lg:block w-80 border-l border-card-secondary bg-card/50">
          <PlayerListSidebar
            campaignId={campaignId}
            sessionId={session?.id}
            isMaster={isMaster}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}


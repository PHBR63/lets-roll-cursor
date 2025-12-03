import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { GameBoard } from '@/components/session/GameBoard'
import { PlayerListSidebar } from '@/components/session/PlayerListSidebar'
import { DiceRoller } from '@/components/session/DiceRoller'
import { ChatPanel } from '@/components/session/ChatPanel'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'

/**
 * Página principal da sala de sessão de jogo
 * Layout: Header + GameBoard (centro) + Sidebar (direita)
 */
export function SessionRoom() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMaster, setIsMaster] = useState(false)

  useEffect(() => {
    if (campaignId && user) {
      // Verificar role primeiro, depois carregar sessão
      checkMasterRole().then(() => {
        loadSession()
      })
    }
  }, [campaignId, user])

  /**
   * Carrega ou cria sessão ativa
   */
  const loadSession = async () => {
    try {
      if (!user || !campaignId) return

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return

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

      if (response.ok) {
        const sessions = await response.json()
        if (sessions.length > 0) {
          setSession(sessions[0])
        } else {
          // Criar nova sessão se não existir (apenas mestre)
          // Aguardar verificação de mestre antes de criar
          await checkMasterRole()
          if (isMaster) {
            await createSession()
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cria uma nova sessão
   */
  const createSession = async () => {
    try {
      if (!user || !campaignId) return

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return

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
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error)
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
          (p: any) => p.user?.id === user.id && p.role === 'master'
        )
        setIsMaster(!!participant)
        return !!participant
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar role:', error)
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex overflow-hidden">
        {/* Área Principal - Game Board */}
        <div className="flex-1 flex flex-col min-w-0">
          <GameBoard sessionId={session?.id} />
          
          {/* Área inferior: Dice Roller e Chat */}
          <div className="grid grid-cols-2 gap-4 p-4 border-t border-card-secondary bg-background">
            <div className="bg-card border border-card-secondary rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              <DiceRoller sessionId={session?.id} campaignId={campaignId} />
            </div>
            <div className="bg-card border border-card-secondary rounded-lg min-h-[300px] max-h-[400px] flex flex-col">
              <ChatPanel sessionId={session?.id} campaignId={campaignId} />
            </div>
          </div>
        </div>

        {/* Sidebar Direita - Player List */}
        <div className="w-80 border-l border-card-secondary bg-card/50">
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


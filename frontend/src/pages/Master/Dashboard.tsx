import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RollHistory } from '@/components/master/RollHistory'
import { CreaturesPanel } from '@/components/master/CreaturesPanel'
import { PlayersPanel } from '@/components/master/PlayersPanel'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Session } from '@/types/session'
import { CampaignParticipant } from '@/types/campaign'

/**
 * Painel do Mestre - Dashboard completo para gerenciar a sessão
 * Layout 3 colunas: Roll History, Criaturas/NPCs, Jogadores
 */
export function MasterDashboard() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMaster, setIsMaster] = useState(false)

  useEffect(() => {
    if (campaignId && user) {
      checkMasterRole()
      loadSession()
    }
  }, [campaignId, user])

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
        // Garantir que participants seja sempre um array
        const participants = Array.isArray(campaign.participants) 
          ? campaign.participants 
          : []
        const participant = participants.find(
          (p: CampaignParticipant) => p.user?.id === user.id && p.role === 'master'
        )
        const master = !!participant
        setIsMaster(master)
        
        if (!master) {
          // Redirecionar se não for mestre
          navigate(`/campaign/${campaignId}`)
        }
        
        return master
      }
      return false
    } catch (error) {
      console.error('Erro ao verificar role:', error)
      return false
    }
  }

  /**
   * Carrega sessão ativa
   */
  const loadSession = async () => {
    try {
      if (!campaignId) return

      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
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
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando painel do mestre...</div>
      </div>
    )
  }

  if (!isMaster) {
    return null // Será redirecionado
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-3 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/campaign/${campaignId}`)}
              className="text-white hover:bg-accent"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <h1 className="text-lg md:text-2xl font-bold text-white">Painel do Mestre</h1>
          </div>
        </div>

        {/* Layout Responsivo: 1 coluna mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 h-[calc(100vh-150px)] md:h-[calc(100vh-200px)]">
          {/* Coluna 1: Dashboard (Nome do Mestre + Dados + Roll History) */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="bg-card rounded-lg border border-card-secondary p-3 md:p-4">
              <h2 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Dashboard</h2>
              
              {/* Nome do Mestre */}
              <div className="mb-4">
                <label className="text-text-secondary text-xs md:text-sm mb-2 block">Nome do Mestre</label>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-card-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    placeholder="Digite o nome do mestre"
                    defaultValue={user?.email?.split('@')[0] || 'Mestre'}
                    className="flex-1 bg-card-secondary border border-card-secondary rounded px-3 py-2 text-white text-sm md:text-base focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Indicador de Rolagem de Dados */}
              <div className="mb-4">
                <label className="text-text-secondary text-xs md:text-sm mb-2 block">Rolagem de Dados</label>
                <div className="flex items-center gap-2 bg-card-secondary rounded px-3 py-2">
                  <span className="text-white text-sm md:text-base">x D x</span>
                  <div className="ml-auto">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Rolagens */}
            <div className="bg-card rounded-lg border border-card-secondary p-3 md:p-4 flex-1 flex flex-col min-h-[300px]">
              <h2 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Histórico de Rolagens</h2>
              <RollHistory
                sessionId={session?.id}
                campaignId={campaignId}
                maxRolls={15}
              />
            </div>
          </div>

          {/* Coluna 2: Criaturas/NPCs */}
          <div className="bg-card rounded-lg border border-card-secondary p-3 md:p-4 flex-1 flex flex-col min-h-[300px]">
            <CreaturesPanel campaignId={campaignId} />
          </div>

          {/* Coluna 3: Jogadores */}
          <div className="bg-card rounded-lg border border-card-secondary p-3 md:p-4 flex-1 flex flex-col min-h-[300px]">
            <PlayersPanel campaignId={campaignId} sessionId={session?.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


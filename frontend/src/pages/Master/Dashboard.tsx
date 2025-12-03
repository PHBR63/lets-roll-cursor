import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RollHistory } from '@/components/master/RollHistory'
import { CreaturesPanel } from '@/components/master/CreaturesPanel'
import { PlayersPanel } from '@/components/master/PlayersPanel'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Painel do Mestre - Dashboard completo para gerenciar a sessão
 * Layout 3 colunas: Roll History, Criaturas/NPCs, Jogadores
 */
export function MasterDashboard() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState<any>(null)
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
        const participant = campaign.participants?.find(
          (p: any) => p.user?.id === user.id && p.role === 'master'
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

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/campaign/${campaignId}`)}
              className="text-white hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Painel do Mestre</h1>
          </div>
        </div>

        {/* Layout 3 Colunas */}
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Coluna 1: Roll History + Master Info */}
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-lg border border-card-secondary p-4 flex-1 flex flex-col">
              <h2 className="text-white font-semibold mb-4">Histórico de Rolagens</h2>
              <RollHistory
                sessionId={session?.id}
                campaignId={campaignId}
                maxRolls={15}
              />
            </div>
            
            {/* Master Info (opcional) */}
            <div className="bg-card rounded-lg border border-card-secondary p-4">
              <h3 className="text-white font-semibold mb-2">Informações do Mestre</h3>
              <div className="text-text-secondary text-sm">
                <p>Campanha: {campaignId}</p>
                <p>Sessão: {session?.name || 'Nenhuma sessão ativa'}</p>
              </div>
            </div>
          </div>

          {/* Coluna 2: Criaturas/NPCs */}
          <div className="bg-card rounded-lg border border-card-secondary p-4 flex-1 flex flex-col">
            <CreaturesPanel campaignId={campaignId} />
          </div>

          {/* Coluna 3: Jogadores */}
          <div className="bg-card rounded-lg border border-card-secondary p-4 flex-1 flex flex-col">
            <PlayersPanel campaignId={campaignId} sessionId={session?.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


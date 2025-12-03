import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { CharacterStatusCard } from '@/components/character/CharacterStatusCard'
import { PlayersSidebar } from '@/components/campaign/PlayersSidebar'
import { InvitePlayers } from '@/components/campaign/InvitePlayers'
import { EditCampaignModal } from '@/components/campaign/EditCampaignModal'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { EmptyState, NotFoundState } from '@/components/common/EmptyState'
import { Users } from 'lucide-react'
import { ChevronRight, Edit, Settings } from 'lucide-react'
import { useApiError } from '@/hooks/useApiError'
import { LazyImage } from '@/components/common/LazyImage'
import { useRetry } from '@/hooks/useRetry'

/**
 * Página de detalhes da campanha
 * Mostra informações, personagens e jogadores
 */
export function CampaignDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [campaign, setCampaign] = useState<any>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isMaster, setIsMaster] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleErrorWithToast, handleResponseError } = useApiError()

  useEffect(() => {
    if (id) {
      loadCampaign().then(() => {
        setLoading(false)
      })
      loadCharacters()
    }
  }, [id, user])

  /**
   * Carrega dados da campanha (com retry)
   */
  const loadCampaignFn = async () => {
    if (!user || !id) return null

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      throw new Error('Sessão não encontrada')
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/api/campaigns/${id}`, {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        setError('Campanha não encontrada')
        return null
      }
      await handleResponseError(response, 'Erro ao carregar campanha')
      return null
    }

    const data = await response.json()
    setCampaign(data)

    // Verificar se usuário é mestre
    const participant = data.participants?.find(
      (p: any) => p.user?.id === user.id && p.role === 'master'
    )
    setIsMaster(!!participant)

    return data
  }

  const { execute: loadCampaign, loading: loadingCampaign } = useRetry(loadCampaignFn, {
    maxRetries: 3,
    delay: 1000,
    onError: (err) => {
      handleErrorWithToast(err, 'Erro ao carregar campanha')
    },
  })

  /**
   * Carrega personagens da campanha
   */
  const loadCharacters = async () => {
    try {
      if (!user || !id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/characters?campaignId=${id}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters(data)
      }
    } catch (error) {
      console.error('Erro ao carregar personagens:', error)
    }
  }

  /**
   * Handler para entrar na sessão
   */
  const handleEnterSession = () => {
    navigate(`/session/${id}`)
  }

  if (loading || loadingCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <NotFoundState
            title={error || 'Campanha não encontrada'}
            description="A campanha que você está procurando não existe ou foi removida."
          />
        </div>
        <Footer />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Campanha não encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-text-secondary mb-4">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Hem
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{campaign.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título Central */}
            <h1 className="text-4xl font-bold text-white text-center">
              {campaign.name}
            </h1>

            {/* Imagem e Descrição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-card-secondary rounded-lg h-64 overflow-hidden">
                {campaign.image_url ? (
                  <LazyImage
                    src={campaign.image_url}
                    alt={campaign.name}
                    className="w-full h-full rounded-lg"
                    fallback={<span className="text-text-secondary">Imagem</span>}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-text-secondary">Imagem</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-text-secondary whitespace-pre-wrap">
                  {campaign.description || 'Sem descrição'}
                </p>
                <Button
                  onClick={handleEnterSession}
                  className="bg-accent hover:bg-accent/90 w-full"
                >
                  Entrar na Sessão
                </Button>
              </div>
            </div>

            {/* Seção Ações (apenas para mestre) */}
            {isMaster && (
              <div className="bg-card border border-card-secondary rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Ações</h2>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-accent hover:bg-accent/90"
                  >
                    Convidar Jogadores
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                    className="border-white/20"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Campanha
                  </Button>
                  <Button
                    onClick={() => navigate(`/master/${id}`)}
                    variant="outline"
                    className="border-white/20"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Painel do Mestre
                  </Button>
                </div>
              </div>
            )}

            {/* Seção Status - Grid de Personagens */}
            <div className="bg-card border border-card-secondary rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Status</h2>
              {characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {characters.map((character) => (
                    <CharacterStatusCard
                      key={character.id}
                      character={character}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Users className="w-8 h-8 text-text-secondary" />}
                  title="Nenhum personagem"
                  description="Ainda não há personagens criados nesta campanha. Convide jogadores para começar!"
                />
              )}
            </div>
          </div>

          {/* Sidebar - Jogadores (oculta em mobile, mostra em lg+) */}
          <div className="hidden lg:block lg:col-span-1">
            <PlayersSidebar
              participants={campaign.participants || []}
              currentUserId={user?.id}
              campaignId={id}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modais */}
      {showInviteModal && isMaster && (
        <InvitePlayers
          campaignId={id!}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            loadCampaign()
          }}
        />
      )}
      {showEditModal && isMaster && campaign && (
        <EditCampaignModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          campaign={campaign}
          onSuccess={() => {
            setShowEditModal(false)
            loadCampaign()
          }}
        />
      )}
    </div>
  )
}


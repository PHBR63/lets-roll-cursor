// @ts-nocheck
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { ChevronLeft, ChevronRight, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { EmptyState } from '@/components/common/EmptyState'
import { useNavigate } from 'react-router-dom'
import { useCache } from '@/hooks/useCache'
import { useApiError } from '@/hooks/useApiError'
import { useRetry } from '@/hooks/useRetry'
import { Campaign } from '@/types/campaign'
import { Character } from '@/types/character'
import { getApiBaseUrl } from '@/utils/apiUrl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/**
 * Dashboard principal
 * Header + 2 seções: "Mestrando" e "Participando"
 * Cada seção com carrossel horizontal de cards
 */
export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [masteringCampaigns, setMasteringCampaigns] = useState<Campaign[]>([])
  const [participatingCampaigns, setParticipatingCampaigns] = useState<Campaign[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCharacters, setLoadingCharacters] = useState(false)
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false)
  const cache = useCache<Campaign[]>({ ttl: 2 * 60 * 1000 }) // Cache de 2 minutos
  const { handleErrorWithToast, handleResponseError } = useApiError()
  
  // Campanhas onde o usuário pode criar personagem (participando como player)
  const availableCampaignsForCharacter = useMemo(() => {
    return participatingCampaigns.filter(c => c.role === 'player')
  }, [participatingCampaigns])

  /**
   * Carrega campanhas do usuário da API (com cache e retry)
   */
  const loadCampaignsFn = async () => {
    if (!user) return null

    const cacheKey = `campaigns:${user.id}`
    
    // Tentar obter do cache primeiro
    const cached = cache.get(cacheKey)
    if (cached) {
      const mastering = cached.filter((c: Campaign) => c.role === 'master')
      const participating = cached.filter(
        (c: Campaign) => c.role === 'player' || c.role === 'observer'
      )
      setMasteringCampaigns(mastering)
      setParticipatingCampaigns(participating)
      return cached
    }

    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      throw new Error('Sessão não encontrada')
    }

    const apiUrl = getApiBaseUrl()
    
    try {
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao carregar campanhas')
        return null
      }

      const campaigns = await response.json()

      // Salvar no cache
      cache.set(cacheKey, campaigns)

      // Separar por role
      const mastering = campaigns.filter((c: Campaign) => c.role === 'master')
      const participating = campaigns.filter(
        (c: Campaign) => c.role === 'player' || c.role === 'observer'
      )

      setMasteringCampaigns(mastering)
      setParticipatingCampaigns(participating)

      return campaigns
    } catch (error) {
      // Se for erro de conexão, mostrar mensagem mais amigável
      if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
        console.warn('Backend não está disponível. Verifique se VITE_API_URL está configurada corretamente.')
        // Não quebrar a aplicação, apenas logar o erro
        // Retornar arrays vazios para permitir que o dashboard seja exibido
        setMasteringCampaigns([])
        setParticipatingCampaigns([])
        return []
      }
      // Para outros erros, propagar
      throw error
    }
  }

  const { execute: loadCampaigns, loading: loadingCampaigns } = useRetry(loadCampaignsFn, {
    maxRetries: 3,
    delay: 1000,
    onError: (err) => {
      // Se for erro de conexão, não mostrar toast (já foi tratado no loadCampaignsFn)
      if (!(err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')))) {
        handleErrorWithToast(err, 'Erro ao carregar campanhas')
      }
      setLoading(false) // Garantir que loading seja false mesmo em caso de erro
    },
  })

  /**
   * Carrega personagens do usuário da API
   */
  const loadUserCharacters = async () => {
    if (!user) return

    setLoadingCharacters(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setLoadingCharacters(false)
        return
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/characters?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCharacters(Array.isArray(data) ? data : [])
      } else {
        // Se der erro, apenas logar, não quebrar a aplicação
        console.warn('Erro ao carregar personagens:', response.status)
        setCharacters([])
      }
    } catch (error) {
      // Se for erro de conexão, não quebrar a aplicação
      if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED'))) {
        console.warn('Backend não está disponível para carregar personagens.')
        setCharacters([])
      } else {
        console.error('Erro ao carregar personagens:', error)
        setCharacters([])
      }
    } finally {
      setLoadingCharacters(false)
    }
  }

  /**
   * Carregar campanhas e personagens quando o componente montar ou o usuário mudar
   */
  useEffect(() => {
    if (user) {
      Promise.all([
        loadCampaigns(),
        loadUserCharacters()
      ])
        .then(() => {
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      // Se não há usuário, não precisa carregar dados
      setLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Função para scrollar carrossel
   */
  const scrollCarousel = (direction: 'left' | 'right', containerId: string) => {
    const container = document.getElementById(containerId)
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (loading || loadingCampaigns) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-4 md:py-8 space-y-8 md:space-y-12">
        {/* Header com estatísticas */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <AnimatedGradientText size="2xl">
              Minhas Campanhas
            </AnimatedGradientText>
          </div>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span>
              Mestrando: <NumberTicker value={masteringCampaigns.length} />
            </span>
            <span>
              Participando: <NumberTicker value={participatingCampaigns.length} />
            </span>
          </div>
        </div>

        {/* Seção Mestrando */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
            Mestrando
          </h2>
          {masteringCampaigns.length > 0 ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white flex-shrink-0 hidden sm:flex"
                onClick={() => scrollCarousel('left', 'mastering-carousel')}
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <div
                id="mastering-carousel"
                className="flex gap-3 md:gap-4 overflow-x-auto flex-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {masteringCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex-shrink-0 snap-start" data-testid="campaign-card">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white flex-shrink-0 hidden sm:flex"
                onClick={() => scrollCarousel('right', 'mastering-carousel')}
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={<Plus className="w-8 h-8 text-text-secondary" />}
              title="Nenhuma campanha mestrada"
              description="Você ainda não está mestrando nenhuma campanha. Crie uma nova campanha para começar!"
              action={{
                label: 'Criar Campanha',
                onClick: () => navigate('/campaign/create'),
              }}
            />
          )}
        </section>

        {/* Seção Participando */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Participando</h2>
          {participatingCampaigns.length > 0 ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white flex-shrink-0 hidden sm:flex"
                onClick={() => scrollCarousel('left', 'participating-carousel')}
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <div
                id="participating-carousel"
                className="flex gap-3 md:gap-4 overflow-x-auto flex-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {participatingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex-shrink-0 snap-start" data-testid="campaign-card">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white flex-shrink-0 hidden sm:flex"
                onClick={() => scrollCarousel('right', 'participating-carousel')}
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </div>
          ) : (
            <EmptyState
              icon={<Plus className="w-8 h-8 text-text-secondary" />}
              title="Nenhuma campanha"
              description="Você ainda não está participando de nenhuma campanha. Aceite um convite ou crie uma nova campanha!"
              action={{
                label: 'Criar Campanha',
                onClick: () => navigate('/campaign/create'),
              }}
            />
          )}
        </section>

        {/* Seção Meus Personagens */}
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Meus Personagens
            </h2>
            <div className="flex items-center gap-2">
              {availableCampaignsForCharacter.length > 0 && (
                <Button
                  onClick={() => setShowCreateCharacterModal(true)}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Personagem
                </Button>
              )}
              <Button
                onClick={() => navigate('/characters')}
                variant="ghost"
                className="text-white hover:text-accent"
              >
                Ver Todos
              </Button>
            </div>
          </div>
          {loadingCharacters ? (
            <div className="text-center py-8 text-white/70">Carregando personagens...</div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.slice(0, 6).map((character) => (
                <div
                  key={character.id}
                  onClick={() => navigate(`/character/${character.id}`)}
                  className="bg-card border border-card-secondary rounded-lg p-4 cursor-pointer hover:border-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{character.name}</h3>
                    {character.stats?.pv && (
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <span className="text-red-400">PV</span>
                        <span>{character.stats.pv.current}/{character.stats.pv.max}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {character.class && (
                      <p className="text-text-secondary text-sm">
                        {character.class} • NEX {character.stats?.nex || 5}%
                      </p>
                    )}
                    {character.campaign && (
                      <p className="text-text-secondary text-xs">
                        Campanha: {character.campaign.name}
                      </p>
                    )}
                    {character.origin && (
                      <p className="text-text-secondary text-xs">
                        Origem: {character.origin}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<User className="w-8 h-8 text-text-secondary" />}
              title="Nenhum personagem criado"
              description={
                availableCampaignsForCharacter.length > 0
                  ? "Você ainda não criou nenhum personagem. Crie um para começar suas aventuras!"
                  : "Você ainda não criou nenhum personagem. Para criar um personagem, você precisa estar participando de uma campanha como jogador."
              }
              action={
                availableCampaignsForCharacter.length > 0
                  ? {
                      label: '+ Criar Personagem',
                      onClick: () => setShowCreateCharacterModal(true),
                    }
                  : {
                      label: 'Ver Campanhas',
                      onClick: () => navigate('/dashboard'),
                    }
              }
            />
          )}
        </section>
      </main>

      {/* Modal para selecionar campanha e criar personagem */}
      <Dialog open={showCreateCharacterModal} onOpenChange={setShowCreateCharacterModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Personagem</DialogTitle>
            <DialogDescription>
              Selecione a campanha onde deseja criar seu personagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableCampaignsForCharacter.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">
                  Você precisa estar participando de uma campanha como jogador para criar um personagem.
                </p>
                <Button
                  onClick={() => {
                    setShowCreateCharacterModal(false)
                    navigate('/campaign/create')
                  }}
                  className="bg-accent hover:bg-accent/90"
                >
                  Criar Nova Campanha
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {availableCampaignsForCharacter.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => {
                      setShowCreateCharacterModal(false)
                      navigate(`/campaign/${campaign.id}/character/create`)
                    }}
                    className="bg-card border border-card-secondary rounded-lg p-4 cursor-pointer hover:border-accent transition-colors"
                  >
                    <h3 className="text-white font-semibold mb-1">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}

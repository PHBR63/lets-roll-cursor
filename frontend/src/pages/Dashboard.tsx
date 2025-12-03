import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { EmptyState } from '@/components/common/EmptyState'
import { useNavigate } from 'react-router-dom'
import { useCache } from '@/hooks/useCache'

/**
 * Dashboard principal
 * Header + 2 seções: "Mestrando" e "Participando"
 * Cada seção com carrossel horizontal de cards
 */
export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [masteringCampaigns, setMasteringCampaigns] = useState<any[]>([])
  const [participatingCampaigns, setParticipatingCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const cache = useCache<any[]>({ ttl: 2 * 60 * 1000 }) // Cache de 2 minutos

  useEffect(() => {
    if (user) {
      loadCampaigns()
    }
  }, [user])

  /**
   * Carrega campanhas do usuário da API (com cache)
   */
  const loadCampaigns = async () => {
    try {
      if (!user) return

      const cacheKey = `campaigns:${user.id}`
      
      // Tentar obter do cache primeiro
      const cached = cache.get(cacheKey)
      if (cached) {
        const mastering = cached.filter((c: any) => c.role === 'master')
        const participating = cached.filter(
          (c: any) => c.role === 'player' || c.role === 'observer'
        )
        setMasteringCampaigns(mastering)
        setParticipatingCampaigns(participating)
        setLoading(false)
        return
      }

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) throw new Error('Erro ao carregar campanhas')

      const campaigns = await response.json()

      // Salvar no cache
      cache.set(cacheKey, campaigns)

      // Separar por role
      const mastering = campaigns.filter((c: any) => c.role === 'master')
      const participating = campaigns.filter(
        (c: any) => c.role === 'player' || c.role === 'observer'
      )

      setMasteringCampaigns(mastering)
      setParticipatingCampaigns(participating)
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
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
        {/* Seção Mestrando */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Mestrando</h2>
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
                  <div key={campaign.id} className="flex-shrink-0 snap-start">
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
                  <div key={campaign.id} className="flex-shrink-0 snap-start">
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
      </main>

      <Footer />
    </div>
  )
}

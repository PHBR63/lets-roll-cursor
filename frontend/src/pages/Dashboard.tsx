import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

/**
 * Dashboard principal
 * Header + 2 seções: "Mestrando" e "Participando"
 * Cada seção com carrossel horizontal de cards
 */
export function Dashboard() {
  const { user } = useAuth()
  const [masteringCampaigns, setMasteringCampaigns] = useState<any[]>([])
  const [participatingCampaigns, setParticipatingCampaigns] = useState<any[]>([])

  useEffect(() => {
    // TODO: Buscar campanhas do usuário
    // Por enquanto, dados mockados
    setMasteringCampaigns([
      { id: 1, name: 'Nome do RPG', image: null },
      { id: 2, name: 'Nome do RPG', image: null },
      { id: 3, name: 'Nome do RPG', image: null },
    ])
    setParticipatingCampaigns([
      { id: 4, name: 'Nome do RPG', image: null },
      { id: 5, name: 'Nome do RPG', image: null },
    ])
  }, [user])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">
        {/* Seção Mestrando */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Mestrando</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <div className="flex gap-4 overflow-x-auto flex-1">
              {masteringCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </section>

        {/* Seção Participando */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Participando</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white">
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <div className="flex gap-4 overflow-x-auto flex-1">
              {participatingCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


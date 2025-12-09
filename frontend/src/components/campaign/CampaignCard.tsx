// @ts-nocheck
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BentoCard } from '@/components/ui/bento-grid'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { BorderBeam } from '@/components/ui/border-beam'
import { OptimizedImage } from '@/components/common/OptimizedImage'
import { Gamepad2 } from 'lucide-react'

/**
 * Card de campanha estilo lobby
 * Card cinza escuro: área "Imagem", "Nome do RPG", botão "Iniciar" roxo
 */
interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    image_url?: string | null
    status?: string
  }
}

export const CampaignCard = memo(function CampaignCard({ campaign }: CampaignCardProps) {
  const navigate = useNavigate()

  /**
   * Navega para detalhes da campanha
   */
  const handleClick = useCallback(() => {
    navigate(`/campaign/${campaign.id}`)
  }, [navigate, campaign.id])

  const statusText = campaign.status === 'active' ? 'Ativa' : 
                     campaign.status === 'paused' ? 'Pausada' : 'Encerrada'

  return (
    <div className="group relative w-64 h-80 flex-shrink-0">
      <SpotlightCard className="h-full">
        <BentoCard
          className="w-full h-full"
          name={campaign.name}
          description={statusText}
          icon={<Gamepad2 className="w-6 h-6" />}
          backgroundImage={campaign.image_url || undefined}
          onClick={handleClick}
        >
      <div className="mt-4 flex flex-col gap-3">
        {campaign.image_url && (
          <div className="w-full h-32 rounded-md overflow-hidden border border-[#8000FF]/20">
            <OptimizedImage
              src={campaign.image_url}
              alt={campaign.name}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-[#2A2A3A] flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-[#8000FF]/50" />
                </div>
              }
            />
          </div>
        )}
        <Button
          variant="shimmer"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
          className="w-full"
        >
          Iniciar
        </Button>
      </div>
    </BentoCard>
      </SpotlightCard>
      <BorderBeam />
    </div>
  )
})


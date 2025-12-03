import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { LazyImage } from '@/components/common/LazyImage'

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

export function CampaignCard({ campaign }: CampaignCardProps) {
  const navigate = useNavigate()

  /**
   * Navega para detalhes da campanha
   */
  const handleClick = () => {
    navigate(`/campaign/${campaign.id}`)
  }

  return (
    <Card className="w-64 h-80 flex flex-col bg-card border-card-secondary hover:border-accent transition-colors cursor-pointer flex-shrink-0">
      <CardContent className="flex-1 p-0" onClick={handleClick}>
        <div className="w-full h-48 border-b border-card-secondary overflow-hidden">
          {campaign.image_url ? (
            <LazyImage
              src={campaign.image_url}
              alt={campaign.name}
              className="w-full h-full"
              fallback={<span className="text-text-secondary">Imagem</span>}
            />
          ) : (
            <div className="w-full h-full bg-card-secondary flex items-center justify-center">
              <span className="text-text-secondary">Imagem</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold">{campaign.name}</h3>
          {campaign.status && (
            <p className="text-text-secondary text-xs mt-1">
              {campaign.status === 'active' ? 'Ativa' : 
               campaign.status === 'paused' ? 'Pausada' : 'Encerrada'}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleClick}
          className="w-full bg-accent hover:bg-accent/90 ml-auto"
        >
          Iniciar
        </Button>
      </CardFooter>
    </Card>
  )
}


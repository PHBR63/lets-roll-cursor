import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

/**
 * Card de campanha estilo lobby
 * Card cinza escuro: área "Imagem", "Nome do RPG", botão "Iniciar" roxo
 */
interface CampaignCardProps {
  campaign: {
    id: number
    name: string
    image: string | null
  }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Card className="w-64 h-80 flex flex-col bg-card border-card-secondary">
      <CardContent className="flex-1 p-0">
        <div className="w-full h-48 bg-card-secondary flex items-center justify-center border-b border-card-secondary">
          <span className="text-text-secondary">Imagem</span>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold">{campaign.name}</h3>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-accent hover:bg-accent/90 ml-auto">
          Iniciar
        </Button>
      </CardFooter>
    </Card>
  )
}


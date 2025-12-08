// @ts-nocheck
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Campaign } from '@/types/campaign'
import { useNavigate } from 'react-router-dom'

interface CreateCharacterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableCampaigns: Campaign[]
  onSelectCampaign: (campaignId: string) => void
  onCreateCampaign: () => void
}

/**
 * Modal compartilhado para seleção de campanha ao criar personagem
 */
export function CreateCharacterModal({
  open,
  onOpenChange,
  availableCampaigns,
  onSelectCampaign,
  onCreateCampaign,
}: CreateCharacterModalProps) {
  const navigate = useNavigate()

  const handleCreateStandalone = () => {
    onOpenChange(false)
    navigate('/character/create')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Personagem</DialogTitle>
          <DialogDescription>
            Selecione a campanha onde deseja criar seu personagem, ou crie um personagem standalone para testes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Opção para criar sem campanha (sempre disponível) */}
          <div
            onClick={handleCreateStandalone}
            className="bg-card border border-card-secondary rounded-lg p-4 cursor-pointer hover:border-accent transition-colors"
          >
            <h3 className="text-white font-semibold mb-1">Personagem Standalone</h3>
            <p className="text-text-secondary text-sm">
              Criar personagem para testes ou uso futuro (sem campanha)
            </p>
          </div>

          {availableCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                Você precisa estar participando de uma campanha como jogador para criar um personagem vinculado.
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  onCreateCampaign()
                }}
                className="bg-accent hover:bg-accent/90"
              >
                Criar Nova Campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => {
                    onOpenChange(false)
                    onSelectCampaign(campaign.id)
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
  )
}


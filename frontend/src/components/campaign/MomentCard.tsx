// @ts-nocheck
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar, User, Link as LinkIcon, Dice1 } from 'lucide-react'
import { CampaignMoment } from '@/types/moment'
import { useAuth } from '@/context/AuthContext'
import { LazyImage } from '@/components/common/LazyImage'

interface MomentCardProps {
  moment: CampaignMoment
  onDelete?: (momentId: string) => void
}

/**
 * Card individual de momento da campanha
 */
export function MomentCard({ moment, onDelete }: MomentCardProps) {
  const { user } = useAuth()
  const isOwner = moment.created_by === user?.id

  /**
   * Formata data do momento
   */
  const formattedDate = moment.created_at
    ? new Date(moment.created_at).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Data desconhecida'

  return (
    <Card className="bg-card-secondary border-card-secondary hover:border-accent transition-colors animate-in fade-in-50">
      <CardContent className="p-4">
        {/* Imagem (se houver) */}
        {moment.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <LazyImage
              src={moment.image_url}
              alt={moment.title}
              className="w-full h-48 object-cover"
              fallback={
                <div className="w-full h-48 bg-card flex items-center justify-center">
                  <span className="text-text-secondary">Sem imagem</span>
                </div>
              }
            />
          </div>
        )}

        {/* Título */}
        <h3 className="text-white font-semibold text-lg mb-2">{moment.title}</h3>

        {/* Descrição */}
        {moment.description && (
          <p className="text-text-secondary text-sm mb-3 whitespace-pre-wrap">
            {moment.description}
          </p>
        )}

        {/* Metadados */}
        <div className="space-y-2 text-xs text-text-secondary">
          {/* Data */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>

          {/* Autor */}
          {moment.created_by_user && (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>
                Por {moment.created_by_user.username || 'Usuário desconhecido'}
              </span>
            </div>
          )}

          {/* Sessão */}
          {moment.session && (
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3 h-3" />
              <span>Sessão: {moment.session.name}</span>
            </div>
          )}

          {/* Rolagem de dados */}
          {moment.dice_roll && (
            <div className="flex items-center gap-2">
              <Dice1 className="w-3 h-3" />
              <span>
                Rolagem: {moment.dice_roll.formula} = {moment.dice_roll.result}
              </span>
            </div>
          )}
        </div>

        {/* Botão de deletar (apenas para criador) */}
        {isOwner && onDelete && (
          <div className="mt-4 pt-3 border-t border-card-secondary">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(moment.id)}
              className="w-full hover:bg-destructive/20 text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Deletar Momento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


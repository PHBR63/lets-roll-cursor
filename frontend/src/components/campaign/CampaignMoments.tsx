// @ts-nocheck
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useCampaignMoments } from '@/hooks/useCampaignMoments'
import { useToast } from '@/hooks/useToast'
import { MomentCard } from './MomentCard'
import { CreateMomentModal } from './CreateMomentModal'
import { CreateMomentData } from '@/types/moment'
import { logger } from '@/utils/logger'
import { AppError } from '@/types/common'

interface CampaignMomentsProps {
  campaignId: string
  sessionId?: string
  canCreate?: boolean
}

/**
 * Componente para exibir momentos da campanha (stories)
 */
export function CampaignMoments({
  campaignId,
  sessionId,
  canCreate = true,
}: CampaignMomentsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { moments, loading, createMoment, deleteMoment } = useCampaignMoments(
    campaignId,
    sessionId
  )
  const toast = useToast()

  /**
   * Handler para criar momento
   */
  const handleCreate = async (data: CreateMomentData) => {
    try {
      await createMoment(data)
      setShowCreateModal(false)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao criar momento')
      throw err
    }
  }

  /**
   * Handler para deletar momento
   */
  const handleDelete = async (momentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este momento?')) {
      return
    }

    try {
      await deleteMoment(momentId)
      toast.success('Momento deletado', 'O momento foi removido com sucesso.')
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao deletar momento')
      toast.error('Erro ao deletar momento', err.message || 'Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com botão criar */}
      {canCreate && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Momentos da Campanha</h2>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Momento
          </Button>
        </div>
      )}

      {/* Lista de momentos */}
      {moments.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          {canCreate
            ? 'Nenhum momento criado ainda. Crie o primeiro momento marcante da campanha!'
            : 'Nenhum momento disponível'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onDelete={canCreate ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal de criar */}
      {canCreate && (
        <CreateMomentModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          campaignId={campaignId}
          sessionId={sessionId || null}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}


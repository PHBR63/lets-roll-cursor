import { Card } from '@/components/ui/card'
import { usePresence } from '@/hooks/usePresence'

/**
 * Sidebar com lista de jogadores
 * Mostra avatares, nomes, status (conectado/desconectado) e role (mestre)
 */
interface PlayersSidebarProps {
  participants: Array<{
    role: 'master' | 'player' | 'observer'
    user?: {
      id: string
      username?: string
      avatar_url?: string
    }
  }>
  currentUserId?: string
  campaignId?: string
}

export function PlayersSidebar({
  participants,
  currentUserId: _currentUserId,
  campaignId,
}: PlayersSidebarProps) {
  const { checkUserOnline } = usePresence(campaignId || '')

  return (
    <Card className="bg-card border-card-secondary p-6">
      <h2 className="text-xl font-bold text-white mb-4">Jogadores</h2>
      <div className="space-y-3">
        {participants.length > 0 ? (
          participants.map((participant, index) => {
            const isOnline = checkUserOnline(participant.user?.id || '')

            return (
              <div
                key={participant.user?.id || index}
                className="flex items-center gap-3 p-3 bg-card-secondary rounded-lg"
              >
                {/* Avatar */}
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center flex-shrink-0">
                  {participant.user?.avatar_url ? (
                    <img
                      src={participant.user.avatar_url}
                      alt={participant.user.username || 'User'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-text-secondary text-xs">Perfil</span>
                  )}
                </div>

                {/* Nome e Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">
                      {participant.user?.username || 'Usuário'}
                    </p>
                    {participant.role === 'master' && (
                      <span className="text-accent text-xs font-semibold">
                        (mestre)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="text-text-secondary text-xs">
                      {isOnline ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-text-secondary text-sm">
            Nenhum participante
          </p>
        )}
      </div>
    </Card>
  )
}


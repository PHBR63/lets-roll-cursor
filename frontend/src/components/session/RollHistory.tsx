import { useRealtimeRolls } from '@/hooks/useRealtimeRolls'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Componente de histórico de rolagens
 * Exibe rolagens recentes em cards hexagonais
 */
interface RollHistoryProps {
  sessionId?: string
  campaignId?: string
  maxRolls?: number
}

export function RollHistory({
  sessionId,
  campaignId,
  maxRolls = 20,
}: RollHistoryProps) {
  const { rolls, loading } = useRealtimeRolls(sessionId, campaignId)

  if (loading) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Carregando rolagens...
      </div>
    )
  }

  if (rolls.length === 0) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Nenhuma rolagem ainda
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-2">
        {rolls.slice(0, maxRolls).map((roll) => {
          const userName = roll.user?.username || 'Jogador'
          const characterName = roll.character?.name
          const displayName = characterName
            ? `${userName} (${characterName})`
            : userName

          return (
            <Card
              key={roll.id}
              className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-bold text-2xl text-center">
                    {roll.result}
                  </div>
                  <div className="text-text-secondary text-xs text-center mt-1">
                    {displayName}
                  </div>
                  <div className="text-text-secondary text-xs text-center mt-1">
                    {roll.formula}
                  </div>
                  {roll.details?.rolls && (
                    <div className="text-text-secondary text-xs text-center mt-1">
                      [{roll.details.rolls.join(', ')}]
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}


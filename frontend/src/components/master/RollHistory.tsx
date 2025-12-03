import { useState } from 'react'
import { useRealtimeRolls } from '@/hooks/useRealtimeRolls'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Componente de histórico de rolagens para o mestre
 * Cards hexagonais com filtros
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
  const [filterPlayer, setFilterPlayer] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  if (loading) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Carregando rolagens...
      </div>
    )
  }

  // Obter lista única de jogadores
  const players = Array.from(
    new Set(
      rolls
        .map((roll) => roll.user?.username)
        .filter((name): name is string => !!name)
    )
  )

  // Filtrar rolagens
  const filteredRolls = rolls.filter((roll) => {
    if (filterPlayer !== 'all' && roll.user?.username !== filterPlayer) {
      return false
    }
    // TODO: Filtrar por tipo quando tiver tipo na rolagem
    return true
  })

  if (filteredRolls.length === 0) {
    return (
      <div className="space-y-4">
        {/* Filtros */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Filtros</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filterPlayer} onValueChange={setFilterPlayer}>
              <SelectTrigger className="bg-input border-white/20 text-white">
                <SelectValue placeholder="Jogador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {players.map((player) => (
                  <SelectItem key={player} value={player}>
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-input border-white/20 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="basic">Básica</SelectItem>
                <SelectItem value="skill">Perícia</SelectItem>
                <SelectItem value="attack">Ataque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-text-secondary text-sm text-center py-4">
          Nenhuma rolagem encontrada
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filtros */}
      <div className="space-y-2 mb-4">
        <Label className="text-white text-sm">Filtros</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={filterPlayer} onValueChange={setFilterPlayer}>
            <SelectTrigger className="bg-input border-white/20 text-white">
              <SelectValue placeholder="Jogador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {players.map((player) => (
                <SelectItem key={player} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-input border-white/20 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="basic">Básica</SelectItem>
              <SelectItem value="skill">Perícia</SelectItem>
              <SelectItem value="attack">Ataque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Rolagens */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-2">
          {filteredRolls.slice(0, maxRolls).map((roll) => {
            const userName = roll.user?.username || 'Jogador'
            const characterName = roll.character?.name
            const displayName = characterName
              ? `${userName} (${characterName})`
              : userName

            return (
              <Card
                key={roll.id}
                className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3 cursor-pointer"
                onClick={() => {
                  // TODO: Abrir modal com detalhes
                  console.log('Detalhes da rolagem:', roll)
                }}
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
    </div>
  )
}


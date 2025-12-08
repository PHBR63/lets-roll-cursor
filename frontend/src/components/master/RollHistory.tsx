// @ts-nocheck
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

  // Garantir que rolls seja sempre um array
  const safeRolls = Array.isArray(rolls) ? rolls : []

  // Obter lista única de jogadores
  const players = Array.from(
    new Set(
      safeRolls
        .map((roll) => roll.user?.username)
        .filter((name): name is string => !!name)
    )
  )

  // Filtrar rolagens
  const filteredRolls = safeRolls.filter((roll) => {
    if (filterPlayer !== 'all' && roll.user?.username !== filterPlayer) {
      return false
    }
    
    // Filtrar por tipo se especificado
    if (filterType !== 'all') {
      // Verificar se o roll tem tipo explícito
      if (roll.type) {
        if (filterType === 'basic' && roll.type !== 'basic') return false
        if (filterType === 'skill' && roll.type !== 'skill') return false
        if (filterType === 'attack' && roll.type !== 'attack') return false
      } else {
        // Se não tem tipo explícito, inferir do contexto (details pode ter skillName ou targetDefense)
        const details = roll.details as { skillName?: string; targetDefense?: number } | undefined
        if (filterType === 'skill' && !details?.skillName) return false
        if (filterType === 'attack' && !details?.targetDefense) return false
        if (filterType === 'basic' && (details?.skillName || details?.targetDefense)) return false
      }
    }
    
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

      {/* Lista de Rolagens em formato hexagonal */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-2">
          {filteredRolls.slice(0, maxRolls).map((roll) => {
            const userName = roll.user?.username || 'Jogador'
            const characterName = roll.character?.name
            const displayName = characterName
              ? `${userName} (${characterName})`
              : userName

            return (
              <div
                key={roll.id}
                className="relative cursor-pointer group"
                onClick={() => {
                  // Nota: Modal de detalhes pode ser implementado futuramente para mostrar breakdown completo da rolagem
                  console.log('Detalhes da rolagem:', roll)
                }}
              >
                {/* Container hexagonal principal */}
                <div 
                  className="relative w-full"
                  style={{
                    paddingBottom: '115.47%', // Proporção para hexágono
                  }}
                >
                  <div
                    className="absolute inset-0 bg-card-secondary border-2 border-card-secondary group-hover:border-accent transition-colors flex flex-col items-center justify-center p-2 md:p-3"
                    style={{
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                    }}
                  >
                    {/* Nome do jogador */}
                    <div className="text-white text-xs md:text-sm font-semibold mb-2 text-center leading-tight">
                      {displayName}
                    </div>
                    
                    {/* Resultado principal em hexágono menor */}
                    <div className="relative w-12 h-12 md:w-14 md:h-14">
                      <div
                        className="absolute inset-0 bg-card border border-accent/30 flex items-center justify-center"
                        style={{
                          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                        }}
                      >
                        <div className="text-white font-bold text-base md:text-lg">
                          {String(roll.result).padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Resultado secundário (se houver) */}
                    {roll.details?.rolls && roll.details.rolls.length > 1 && (
                      <div className="mt-1 text-text-secondary text-xs text-center">
                        [{roll.details.rolls.join(', ')}]
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}


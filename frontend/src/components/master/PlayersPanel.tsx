import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ExternalLink } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { ApplyDamageModal } from './ApplyDamageModal'
import { ApplyConditionModal } from './ApplyConditionModal'
import { useRealtimeCharacters } from '@/hooks/useRealtimeCharacters'
import { CampaignParticipant } from '@/types/campaign'
import { logger } from '@/utils/logger'

/**
 * Painel de jogadores para o mestre
 * Lista vertical de cards com stats editáveis
 */
interface PlayersPanelProps {
  campaignId?: string
  sessionId?: string
}

export function PlayersPanel({ campaignId, sessionId }: PlayersPanelProps) {
  const navigate = useNavigate()
  const { characters: realtimeCharacters } = useRealtimeCharacters(campaignId)
  const [players, setPlayers] = useState<CampaignParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showConditionModal, setShowConditionModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<{ character: { id: string; stats?: Record<string, unknown>; conditions?: string[] }; user?: { id: string; username: string; avatar_url?: string } } | null>(null)

  useEffect(() => {
    if (campaignId) {
      loadPlayers()
    }
  }, [campaignId])

  // Atualizar quando personagens mudarem via Realtime
  useEffect(() => {
    if (realtimeCharacters.length > 0 && players.length > 0) {
      // Atualizar stats dos personagens nos players
      setPlayers((prev) =>
        prev.map((player) => {
          const updatedChar = realtimeCharacters.find(
            (char) => char.id === player.character?.id
          )
          if (updatedChar) {
            return {
              ...player,
              character: {
                id: updatedChar.id,
                name: updatedChar.name,
                ...updatedChar,
              } as CampaignParticipant['character'],
            }
          }
          return player
        })
      )
    }
  }, [realtimeCharacters])

  /**
   * Carrega jogadores da campanha
   */
  const loadPlayers = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const campaign = await response.json()
        const participants = campaign.participants || []

        // Buscar personagens de cada participante
        const playersWithCharacters = await Promise.all(
          participants.map(async (participant: CampaignParticipant) => {
            const charResponse = await fetch(
              `${apiUrl}/api/characters?userId=${participant.user?.id}&campaignId=${campaignId}`,
              {
                headers: {
                  Authorization: `Bearer ${session.session.access_token}`,
                },
              }
            )

            let character = null
            if (charResponse.ok) {
              const chars = await charResponse.json()
              character = chars[0] || null
            }

            return {
              ...participant,
              character,
            }
          })
        )

        setPlayers(playersWithCharacters)
      }
    } catch (error) {
      logger.error('Erro ao carregar jogadores:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Abre ficha do personagem
   */
  const handleOpenCharacterSheet = (characterId: string) => {
    navigate(`/character/${characterId}`)
  }

  if (loading) {
    return <div className="text-text-secondary text-sm">Carregando jogadores...</div>
  }

  if (players.length === 0) {
    return (
      <div className="text-text-secondary text-sm text-center py-8">
        Nenhum jogador na campanha
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-white font-semibold text-lg mb-4">Jogadores</h2>
      <div className="flex-1 overflow-y-auto space-y-3">
        {players.map((player) => {
          const character = player.character
          if (!character) {
            return (
              <Card
                key={player.user?.id}
                className="bg-white/5 border-card-secondary p-3"
              >
                <div className="text-white font-semibold">
                  {player.user?.username || 'Jogador'}
                </div>
                <div className="text-text-secondary text-xs mt-1">
                  Sem personagem
                </div>
              </Card>
            )
          }

          const stats = (character.stats || {}) as Record<string, unknown>
          const pv = (stats.pv as { current: number; max: number }) || { current: 0, max: 0 }
          const san = (stats.san as { current: number; max: number }) || { current: 0, max: 0 }
          const pe = (stats.pe as { current: number; max: number }) || { current: 0, max: 0 }
          const nex = (stats.nex as number) || 0

          const pvPercent = pv.max > 0 ? (pv.current / pv.max) * 100 : 0
          const sanPercent = san.max > 0 ? (san.current / san.max) * 100 : 0
          const pePercent = pe.max > 0 ? (pe.current / pe.max) * 100 : 0

          return (
            <Card
              key={player.user?.id}
              className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
            >
              <div className="space-y-2">
                {/* Nome do Jogador */}
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">
                    {player.user?.username || 'Jogador'}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenCharacterSheet(character.id)}
                    className="h-6 w-6 p-0 text-white hover:bg-accent"
                    aria-label={`Abrir ficha do personagem ${character.name}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>

                {/* Nome do Personagem */}
                <div className="text-text-secondary text-sm">{character.name}</div>

                {/* Barras de Recursos */}
                <div className="space-y-2">
                  {/* PV */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400">Vida</span>
                      <span className="text-white">
                        {pv.current}/{pv.max}
                      </span>
                    </div>
                    <Progress value={pvPercent} className="h-2 bg-red-900/30" />
                  </div>

                  {/* NEX */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-400">NEX</span>
                      <span className="text-white">{nex}%</span>
                    </div>
                    <Progress value={nex} className="h-2 bg-purple-900/30" />
                  </div>

                  {/* PE */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-400">Energia</span>
                      <span className="text-white">
                        {pe.current}/{pe.max}
                      </span>
                    </div>
                    <Progress value={pePercent} className="h-2 bg-green-900/30" />
                  </div>

                  {/* SAN */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400">Sanidade</span>
                      <span className="text-white">
                        {san.current}/{san.max}
                      </span>
                    </div>
                    <Progress value={sanPercent} className="h-2 bg-blue-900/30" />
                  </div>
                </div>

                {/* Botões de Ação Rápida */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSelectedPlayer({ character, user: player.user })
                      setShowDamageModal(true)
                    }}
                    aria-label={`Aplicar dano ou cura em ${character.name}`}
                  >
                    Dano/Cura
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => {
                      setSelectedPlayer({ character, user: player.user })
                      setShowConditionModal(true)
                    }}
                    aria-label={`Aplicar condição em ${character.name}`}
                  >
                    Condição
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modais */}
      {selectedPlayer && (
        <>
          <ApplyDamageModal
            open={showDamageModal}
            onOpenChange={setShowDamageModal}
            target="character"
            targetId={selectedPlayer.character.id}
            currentStats={selectedPlayer.character.stats || {}}
            onSuccess={() => {
              loadPlayers()
              setSelectedPlayer(null)
            }}
          />
          <ApplyConditionModal
            open={showConditionModal}
            onOpenChange={setShowConditionModal}
            target="character"
            targetId={selectedPlayer.character.id}
            currentConditions={selectedPlayer.character.conditions || []}
            onSuccess={() => {
              loadPlayers()
              setSelectedPlayer(null)
            }}
          />
        </>
      )}
    </div>
  )
}


import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { AudioControls } from './AudioControls'

/**
 * Sidebar com grid de cards de jogadores (2x3)
 * Avatar superior (persona), personagem inferior (anime style)
 * Stats: Vida e outro recurso
 */
interface PlayerListSidebarProps {
  campaignId?: string
  sessionId?: string
  isMaster?: boolean
}

export function PlayerListSidebar({
  campaignId,
  sessionId,
  isMaster,
}: PlayerListSidebarProps) {
  const { user } = useAuth()
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      loadPlayers()
    }
  }, [campaignId])

  /**
   * Carrega jogadores da campanha
   */
  const loadPlayers = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/campaigns/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const campaign = await response.json()
        const participants = campaign.participants || []
        
        // Buscar personagens de cada participante
        const playersWithCharacters = await Promise.all(
          participants.map(async (participant: any) => {
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
      console.error('Erro ao carregar jogadores:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Botão Abrir Gerenciador (apenas mestre) */}
      {isMaster && (
        <div className="p-4 border-b border-card-secondary">
          <Button className="w-full bg-accent hover:bg-accent/90">
            Abrir Gerenciador
          </Button>
        </div>
      )}

      {/* Controles de Áudio */}
      <div className="p-4 border-b border-card-secondary">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-semibold">Áudio</span>
        </div>
        <AudioControls />
      </div>

      {/* Grid de Players (2x3) */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {players.slice(0, 6).map((player, index) => {
            const character = player.character
            // Usar dados do sistema Ordem Paranormal
            const stats = character?.stats || {}
            const pv = stats.pv || { current: 0, max: 0 }
            const san = stats.san || { current: 0, max: 0 }
            const pe = stats.pe || { current: 0, max: 0 }

            return (
              <Card
                key={player.user?.id || index}
                className="bg-white/5 border-card-secondary hover:border-accent transition-colors"
              >
                <div className="relative aspect-square">
                  {/* Avatar Superior - Persona com fones */}
                  <div className="absolute top-0 left-0 right-0 h-2/3 flex items-center justify-center">
                    <div className="w-16 h-16 bg-card-secondary rounded-full flex items-center justify-center">
                      {player.user?.avatar_url ? (
                        <img
                          src={player.user.avatar_url}
                          alt={player.user.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-accent rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Avatar Inferior - Personagem (anime style) */}
                  {character && (
                    <div className="absolute bottom-0 left-0 right-0 h-2/3 flex items-end justify-center pb-2">
                      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border-2 border-white/20">
                        {character.avatar_url ? (
                          <img
                            src={character.avatar_url}
                            alt={character.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-text-secondary text-xs">Char</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nome do Personagem */}
                  {character && (
                    <div className="absolute bottom-0 left-0 right-0 pb-1">
                      <p className="text-white text-xs font-semibold text-center">
                        {character.name}
                      </p>
                    </div>
                  )}

                  {/* Stats - Sistema Ordem Paranormal */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 space-y-1">
                    <div className="text-red-500 text-xs font-bold text-center bg-black/50 px-2 py-0.5 rounded">
                      PV: {pv.current}/{pv.max}
                    </div>
                    <div className="text-blue-500 text-xs font-bold text-center bg-black/50 px-2 py-0.5 rounded">
                      SAN: {san.current}/{san.max}
                    </div>
                    <div className="text-green-500 text-xs font-bold text-center bg-black/50 px-2 py-0.5 rounded">
                      PE: {pe.current}/{pe.max}
                    </div>
                  </div>

                  {/* Indicador de voz ativa (se for o primeiro) */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      <div className="w-3 h-3 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">🎤</span>
                      </div>
                      <div className="w-3 h-3 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-[8px]">🔊</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}


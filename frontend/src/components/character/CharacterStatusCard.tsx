import { ProgressBar } from '@/components/ui/progress-bar'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'

/**
 * Card de status de personagem
 * Mostra avatar, nome e barras de progresso (Vida, XP, Energia, Saúde)
 */
interface CharacterStatusCardProps {
  character: {
    id: string
    name: string
    avatar_url?: string
    stats?: {
      vida?: { current: number; max: number }
      energia?: { current: number; max: number }
      saude?: { current: number; max: number }
      xp?: number
    }
    user?: {
      username?: string
    }
  }
}

export function CharacterStatusCard({ character }: CharacterStatusCardProps) {
  const stats = character.stats || {}
  const vida = stats.vida || { current: 10, max: 20 }
  const energia = stats.energia || { current: 20, max: 20 }
  const saude = stats.saude || { current: 15, max: 20 }
  const xp = stats.xp || 30

  return (
    <Link to={`/character/${character.id}`}>
      <Card className="bg-card border-card-secondary hover:border-accent transition-colors cursor-pointer">
        <div className="p-4 space-y-4">
          {/* Avatar e Nome */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-card-secondary rounded-full flex items-center justify-center">
              {character.avatar_url ? (
                <img
                  src={character.avatar_url}
                  alt={character.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-text-secondary text-sm">Char</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">
                {character.name}
              </h3>
              {character.user?.username && (
                <p className="text-text-secondary text-sm">
                  ({character.user.username})
                </p>
              )}
            </div>
          </div>

          {/* Barras de Progresso */}
          <div className="space-y-3">
            <ProgressBar
              label="Vida"
              current={vida.current}
              max={vida.max}
              variant="life"
            />
            <ProgressBar
              label="XP"
              current={xp}
              max={100}
              variant="xp"
              showValues={false}
            />
            <ProgressBar
              label="Energia"
              current={energia.current}
              max={energia.max}
              variant="energy"
            />
            <ProgressBar
              label="Saúde"
              current={saude.current}
              max={saude.max}
              variant="health"
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}


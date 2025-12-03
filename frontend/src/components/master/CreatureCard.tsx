import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Heart, Zap, Shield, Award } from 'lucide-react'

/**
 * Props do card de criatura
 */
interface CreatureCardProps {
  creature: any
  onEdit: (creature: any) => void
  onDelete: (creatureId: string) => void
  onDamage: (creature: any) => void
  onCondition: (creature: any) => void
}

/**
 * Card de criatura memoizado
 * Evita re-renders quando outras criaturas mudam
 */
export const CreatureCard = memo(({
  creature,
  onEdit,
  onDelete,
  onDamage,
  onCondition,
}: CreatureCardProps) => {
  const stats = creature.stats || {}
  const vida = stats.vida || { current: 0, max: 0 }
  const energia = stats.energia || { current: 0, max: 0 }
  const saude = stats.saude || { current: 0, max: 0 }
  const xp = stats.xp || { current: 0, max: 0 }

  return (
    <Card className="bg-card border-card-secondary hover:border-accent transition-colors p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{creature.name}</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(creature)}
            className="h-7 w-7 p-0"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(creature.id)}
            className="h-7 w-7 p-0 text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Barras de recursos */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs text-text-secondary">Vida</span>
            </div>
            <span className="text-xs text-white">
              {vida.current}/{vida.max}
            </span>
          </div>
          <AnimatedProgress
            value={vida.current}
            max={vida.max}
            color="red"
            className="h-2"
            duration={0.4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-text-secondary">Energia</span>
            </div>
            <span className="text-xs text-white">
              {energia.current}/{energia.max}
            </span>
          </div>
          <AnimatedProgress
            value={energia.current}
            max={energia.max}
            color="yellow"
            className="h-2"
            duration={0.4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-text-secondary">Saúde</span>
            </div>
            <span className="text-xs text-white">
              {saude.current}/{saude.max}
            </span>
          </div>
          <AnimatedProgress
            value={saude.current}
            max={saude.max}
            color="blue"
            className="h-2"
            duration={0.4}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-text-secondary">EXP</span>
            </div>
            <span className="text-xs text-white">
              {xp.current}/{xp.max}
            </span>
          </div>
          <AnimatedProgress
            value={xp.current}
            max={xp.max}
            color="purple"
            className="h-2"
            duration={0.4}
          />
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDamage(creature)}
          className="flex-1 text-xs"
        >
          Dano/Cura
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCondition(creature)}
          className="flex-1 text-xs"
        >
          Condição
        </Button>
      </div>
    </Card>
  )
})

CreatureCard.displayName = 'CreatureCard'


// @ts-nocheck
import { memo, useMemo } from 'react'
import { AnimatedProgressBar } from '@/components/ui/animated-progress'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { SwipeableCard } from '@/components/common/SwipeableCard'
import { QuickActions } from '@/components/common/QuickActions'
import { LazyImage } from '@/components/common/LazyImage'

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
      pv?: { current: number; max: number }
      san?: { current: number; max: number }
      pe?: { current: number; max: number }
      nex?: number
    }
    conditions?: string[]
    class?: string
    attributes?: {
      agi?: number
      for?: number
      int?: number
      pre?: number
      vig?: number
    }
    defense?: number
    user?: {
      username?: string
    }
  }
}

export const CharacterStatusCard = memo(function CharacterStatusCard({ character }: CharacterStatusCardProps) {
  const stats = character.stats || {}
  
  // Memoizar cálculos de recursos
  const { vida, energia, saude, xp } = useMemo(() => {
    // Sistema Ordem Paranormal: pv, san, pe, nex
    return {
      vida: stats.pv || stats.vida || { current: 10, max: 20 },
      energia: stats.pe || stats.energia || { current: 20, max: 20 },
      saude: stats.san || stats.saude || { current: 15, max: 20 },
      xp: stats.nex || stats.xp || 0,
    }
  }, [stats.pv, stats.vida, stats.pe, stats.energia, stats.san, stats.saude, stats.nex, stats.xp])

  const conditions = character.conditions || []
  const hasConditions = conditions.length > 0

  // Memoizar informações para o tooltip
  const tooltipInfo = useMemo(() => {
    return [
      character.class && `Classe: ${character.class}`,
      character.attributes && `AGI: ${character.attributes.agi || 0} | FOR: ${character.attributes.for || 0} | INT: ${character.attributes.int || 0} | PRE: ${character.attributes.pre || 0} | VIG: ${character.attributes.vig || 0}`,
      character.defense !== undefined && `Defesa: ${character.defense}`,
      hasConditions && `Condições: ${conditions.join(', ')}`,
    ].filter(Boolean).join('\n')
  }, [character.class, character.attributes, character.defense, hasConditions, conditions])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <SwipeableCard
            onSwipeLeft={() => {
              // Ação rápida: ver ficha
              window.location.href = `/character/${character.id}`
            }}
            onSwipeRight={() => {
              // Ação rápida: ver ficha
              window.location.href = `/character/${character.id}`
            }}
            leftAction={
              <QuickActions
                onView={() => window.location.href = `/character/${character.id}`}
                variant="vertical"
              />
            }
            rightAction={
              <QuickActions
                onView={() => window.location.href = `/character/${character.id}`}
                variant="vertical"
              />
            }
            className="md:pointer-events-none"
          >
            <Link to={`/character/${character.id}`} className="block">
              <Card className="bg-card border-card-secondary hover:border-accent transition-colors cursor-pointer relative">
              {/* Indicador de Condições */}
              {hasConditions && (
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-500/20 border border-yellow-500 rounded-full p-1.5">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              )}

              <div className="p-3 md:p-4">
                <div className="flex gap-3 md:gap-4">
                  {/* Avatar quadrado à esquerda */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-card-secondary border border-card-secondary flex-shrink-0 overflow-hidden">
                    {character.avatar_url ? (
                      <LazyImage
                        src={character.avatar_url}
                        alt={character.name}
                        className="w-full h-full"
                        fallback={<span className="text-text-secondary text-xs md:text-sm font-semibold">Char</span>}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-text-secondary text-xs md:text-sm font-semibold">Char</span>
                      </div>
                    )}
                  </div>

                  {/* Informações e barras */}
                  <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                    {/* Nome do personagem */}
                    <div>
                      <h3 className="text-white font-semibold text-sm md:text-base truncate">
                        {character.name}
                      </h3>
                      {character.user?.username && (
                        <p className="text-text-secondary text-xs md:text-sm truncate">
                          ({character.user.username})
                        </p>
                      )}
                    </div>

                    {/* Barras de Progresso - Layout compacto */}
                    <div className="space-y-1.5 md:space-y-2">
                      <AnimatedProgressBar
                        label="Vida"
                        current={vida.current}
                        max={vida.max}
                        color="red"
                        duration={0.5}
                        delay={0}
                        size="sm"
                      />
                      <AnimatedProgressBar
                        label="NEX"
                        current={xp}
                        max={99}
                        color="purple"
                        showValues={false}
                        duration={0.5}
                        delay={0.1}
                        size="sm"
                      />
                      <AnimatedProgressBar
                        label="Energia"
                        current={energia.current}
                        max={energia.max}
                        color="green"
                        duration={0.5}
                        delay={0.2}
                        size="sm"
                      />
                      <AnimatedProgressBar
                        label="Saúde"
                        current={saude.current}
                        max={saude.max}
                        color="yellow"
                        duration={0.5}
                        delay={0.3}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </Link>
          </SwipeableCard>
        </TooltipTrigger>
        {tooltipInfo && (
          <TooltipContent className="bg-card border-card-secondary text-white max-w-xs">
            <div className="space-y-1 text-sm whitespace-pre-line">
              {tooltipInfo.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
})


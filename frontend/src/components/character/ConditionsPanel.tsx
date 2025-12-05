import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Condition } from '@/types/ordemParanormal'
import { AddConditionModal } from './AddConditionModal'
import { ConditionTimer } from './ConditionTimer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Character } from '@/types/character'

interface ConditionsPanelProps {
  character: Character
  onUpdate: () => void
}

/**
 * Painel de condições do personagem
 * Exibe condições ativas e permite adicionar/remover
 */
export function ConditionsPanel({ character, onUpdate }: ConditionsPanelProps) {
  const conditions = character.conditions || []
  const [showAddModal, setShowAddModal] = useState(false)
  const [conditionTimers, setConditionTimers] = useState<Record<string, number>>(
    Array.isArray(character.conditionTimers) 
      ? character.conditionTimers.reduce((acc, timer) => {
          acc[timer.condition] = timer.duration
          return acc
        }, {} as Record<string, number>)
      : ((character.conditionTimers as unknown as Record<string, number>) || {})
  )

  /**
   * Remove condição do personagem
   */
  const handleRemoveCondition = async (condition: Condition) => {
    try {
      if (!character?.id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/conditions/${condition}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao remover condição:', error)
      alert('Erro ao remover condição. Tente novamente.')
    }
  }

  /**
   * Mapeia condições para nomes legíveis e efeitos
   */
  const conditionLabels: Record<Condition, string> = {
    CAIDO: 'Caído',
    DESPREVENIDO: 'Desprevenido',
    ATORDADO: 'Atordado',
    INCONSCIENTE: 'Inconsciente',
    MORRENDO: 'Morrendo',
    ABALADO: 'Abalado',
    APAVORADO: 'Apavorado',
    PERTURBADO: 'Perturbado',
    ENLOUQUECENDO: 'Enlouquecendo',
    LENTO: 'Lento',
    IMOVEL: 'Imóvel',
    PARALISADO: 'Paralisado',
    AGARRADO: 'Agarrado',
    ENREDADO: 'Enredado',
    CEGO: 'Cego',
    SURDO: 'Surdo',
    ENJOADO: 'Enjoado',
    NAUSEA: 'Náusea',
    DOENTE: 'Doente',
    ENVENENADO: 'Envenenado',
    FRACO: 'Fraco',
    DEBILITADO: 'Debilitado',
    ESMORECIDO: 'Esmorecido',
    FRUSTRADO: 'Frustrado',
    EXAUSTO: 'Exausto',
    FADIGADO: 'Fadigado',
    SANGRANDO: 'Sangrando',
    EM_CHAMAS: 'Em Chamas',
    FASCINADO: 'Fascinado',
    INDEFESO: 'Indefeso',
    SOBRECARREGADO: 'Sobrecarregado',
    VULNERAVEL: 'Vulnerável',
    MORTO: 'Morto',
  }

  /**
   * Mapeia condições para descrições de efeitos
   */
  const conditionEffects: Record<Condition, string> = {
    CAIDO: 'Prone. -2D em testes de ataque corpo-a-corpo. Levantar = ação de movimento',
    DESPREVENIDO: 'Surpreso. -5 em Defesa até próximo turno',
    ATORDADO: '-2D em todos os testes. Dura 1 rodada',
    INCONSCIENTE: 'Inconsciente. Não pode agir. Falha em Reflexos',
    MORRENDO: '0 PV. Teste Fortitude DT 15 por turno ou morre',
    ABALADO: '-1D em todos os testes',
    APAVORADO: 'Abalado + não pode se aproximar da fonte do medo',
    PERTURBADO: 'Abalado mentalmente. Efeitos até fim da cena',
    ENLOUQUECENDO: 'Age irracionalmente. Efeitos até fim da missão',
    LENTO: 'Metade do movimento. -1D em Reflexos',
    IMOVEL: 'Não pode se mover',
    PARALISADO: 'Imóvel + não pode agir',
    AGARRADO: 'Imóvel. Alvo pode se soltar com ação padrão',
    ENREDADO: 'Agarrado + -2D em todos os testes',
    CEGO: '-5D em Percepção. Falha em testes visuais',
    SURDO: '-2D em Percepção. Falha em testes auditivos',
    ENJOADO: '-1D em todos os testes',
    NAUSEA: 'Enjoado + ação padrão para vomitar',
    DOENTE: '-1D em todos os testes. Piora sem tratamento',
    ENVENENADO: 'Doente + perde PV por turno',
    FRACO: '-1D em testes físicos',
    DEBILITADO: 'Fraco + metade da força',
    ESMORECIDO: '-2D em todos os testes',
    FRUSTRADO: '-1D em testes mentais',
    EXAUSTO: 'Debilitado + Lento',
    FADIGADO: '-1D em todos os testes. Piora sem descanso',
    SANGRANDO: 'Perde 1d6 PV por turno. Teste Fortitude DT 15 para estancar',
    EM_CHAMAS: '1d6 dano de fogo por turno. Ação padrão para apagar',
    FASCINADO: 'Não pode agir além de observar. -2D em Percepção',
    INDEFESO: 'Inconsciente + Paralisado. Falha em Reflexos',
    SOBRECARREGADO: 'Carga excede capacidade. -1D em todos os testes',
    VULNERAVEL: 'Defesa reduzida em 2',
    MORTO: 'Personagem morto. Não pode agir',
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Condições</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddModal(true)}
        >
          Adicionar Condição
        </Button>
      </div>

      <AddConditionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        characterId={character.id}
        currentConditions={conditions as Condition[]}
        onSuccess={onUpdate}
      />

      {conditions.length === 0 ? (
        <div className="text-muted-foreground text-sm text-center py-4">
          Nenhuma condição ativa
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(conditions as Condition[]).map((condition: Condition) => {
            const hasTimer = conditionTimers[condition] !== undefined
            const timerDuration = conditionTimers[condition]

            return (
              <div key={condition} className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1 px-3 py-1 cursor-help"
                      >
                        {conditionLabels[condition] || condition}
                        {hasTimer && (
                          <Clock className="w-3 h-3" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveCondition(condition)
                          }}
                          className="ml-1 hover:bg-destructive/80 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-semibold">{conditionLabels[condition]}</div>
                        <div className="text-sm text-text-secondary">
                          {conditionEffects[condition] || 'Sem descrição'}
                        </div>
                        {hasTimer && (
                          <div className="text-xs text-yellow-400 mt-1">
                            Expira em {timerDuration} rodada{timerDuration !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {hasTimer && (
                  <ConditionTimer
                    condition={condition}
                    duration={timerDuration}
                    onExpire={() => {
                      handleRemoveCondition(condition)
                      const newTimers = { ...conditionTimers }
                      delete newTimers[condition]
                      setConditionTimers(newTimers)
                    }}
                    onRemove={() => {
                      const newTimers = { ...conditionTimers }
                      delete newTimers[condition]
                      setConditionTimers(newTimers)
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


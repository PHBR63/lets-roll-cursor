// @ts-nocheck
/**
 * Componente para gerenciar consequências permanentes de insanidade
 * Exibe e gerencia efeitos permanentes após 10+ turnos em estado de insanidade
 */
import { useState, useEffect } from 'react'
import { Character } from '@/types/character'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, Plus } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'

interface PermanentEffect {
  id: string
  name: string
  description: string
  severity: 'minor' | 'moderate' | 'severe'
  turnsTriggered: number
  createdAt: string
}

interface InsanityPermanentEffectsProps {
  character: Character
  /**
   * Callback quando efeitos são atualizados
   */
  onUpdate?: (character: Character) => void
  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Componente de Consequências Permanentes de Insanidade
 */
export function InsanityPermanentEffects({
  character,
  onUpdate,
  className,
}: InsanityPermanentEffectsProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [effects, setEffects] = useState<PermanentEffect[]>([])
  const [loading, setLoading] = useState(false)

  // Buscar efeitos permanentes do personagem
  useEffect(() => {
    const permanentEffects = character.permanentEffects || []
    setEffects(permanentEffects)
  }, [character])

  // Verificar se deve aplicar novo efeito permanente
  useEffect(() => {
    const conditionTimers = character.conditionTimers || []
    const insanityTimer = conditionTimers.find(t => t.condition === 'INSANIDADE')
    const turnCount = insanityTimer?.duration || 0

    // Aplicar efeito permanente após 10 turnos
    if (turnCount >= 10 && !effects.some(e => e.turnsTriggered === 10)) {
      applyPermanentEffect(10)
    }
  }, [character.conditionTimers, effects])

  /**
   * Aplica um novo efeito permanente
   */
  const applyPermanentEffect = async (turnsTriggered: number) => {
    if (!user || !character.id) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Sessão não encontrada')
      }

      // Gerar efeito baseado no número de turnos
      const effect = generatePermanentEffect(turnsTriggered)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/permanent-effects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify(effect),
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao aplicar efeito permanente')
      }

      const updatedCharacter = await response.json()
      setEffects(updatedCharacter.permanentEffects || [])
      onUpdate?.(updatedCharacter)

      toast.toast({
        title: 'Efeito Permanente Aplicado',
        description: `${effect.name}: ${effect.description}`,
        variant: 'destructive',
      })
    } catch (error) {
      toast.error('Erro ao aplicar efeito permanente', String(error))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Remove um efeito permanente
   */
  const removePermanentEffect = async (effectId: string) => {
    if (!user || !character.id) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Sessão não encontrada')
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/permanent-effects/${effectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao remover efeito permanente')
      }

      const updatedCharacter = await response.json()
      setEffects(updatedCharacter.permanentEffects || [])
      onUpdate?.(updatedCharacter)

      toast.toast({
        title: 'Efeito Removido',
        description: 'Efeito permanente foi removido do personagem.',
      })
    } catch (error) {
      toast.error('Erro ao remover efeito permanente', String(error))
    } finally {
      setLoading(false)
    }
  }

  if (effects.length === 0) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-white font-semibold text-sm">
          Consequências Permanentes
        </h3>
      </div>

      <div className="space-y-2">
        {effects.map(effect => (
          <div
            key={effect.id}
            className="bg-red-900/20 border border-red-500/50 rounded-lg p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">
                    {effect.name}
                  </span>
                  <Badge
                    variant={
                      effect.severity === 'severe'
                        ? 'destructive'
                        : effect.severity === 'moderate'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {effect.severity === 'severe'
                      ? 'Severo'
                      : effect.severity === 'moderate'
                      ? 'Moderado'
                      : 'Leve'}
                  </Badge>
                </div>
                <p className="text-red-300 text-xs">{effect.description}</p>
                <p className="text-red-400/70 text-xs mt-1">
                  Aplicado após {effect.turnsTriggered} turnos em insanidade
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removePermanentEffect(effect.id)}
                disabled={loading}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Gera um efeito permanente baseado no número de turnos
 */
function generatePermanentEffect(turnsTriggered: number): Omit<PermanentEffect, 'id' | 'createdAt'> {
  const effects: Array<Omit<PermanentEffect, 'id' | 'createdAt'>> = [
    // Efeitos Leves (10 turnos)
    {
      name: 'Pesadelos Recorrentes',
      description: 'Personagem sofre de pesadelos frequentes. -1 em testes de Vontade durante descanso.',
      severity: 'minor',
      turnsTriggered: 10,
    },
    {
      name: 'Ansiedade Crônica',
      description: 'Personagem desenvolveu ansiedade constante. -2 em testes de Presença relacionados a medo.',
      severity: 'moderate',
      turnsTriggered: 10,
    },
    {
      name: 'Perda de Memória Leve',
      description: 'Personagem perdeu memórias importantes. -1 em testes de Intelecto relacionados a conhecimento.',
      severity: 'minor',
      turnsTriggered: 10,
    },
    {
      name: 'Insônia',
      description: 'Personagem sofre de insônia crônica. Recupera apenas metade dos PE durante descanso.',
      severity: 'minor',
      turnsTriggered: 10,
    },
    {
      name: 'Hipervigilância',
      description: 'Personagem está sempre alerta, mas cansado. +1 em Iniciativa, -1 em testes de Furtividade.',
      severity: 'minor',
      turnsTriggered: 10,
    },
    {
      name: 'Tremores',
      description: 'Personagem desenvolveu tremores nas mãos. -1 em testes de Precisão e Tiro.',
      severity: 'minor',
      turnsTriggered: 10,
    },
    
    // Efeitos Moderados (15 turnos)
    {
      name: 'Paranoia',
      description: 'Personagem desenvolveu paranoia. Desconfia de aliados e pode recusar ajuda.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    {
      name: 'Fobias Específicas',
      description: 'Personagem desenvolveu fobias. -3 em testes de Presença quando confrontado com objeto do medo.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    {
      name: 'Perda de Memória Moderada',
      description: 'Personagem perdeu memórias significativas. -2 em testes de Intelecto e -1 em testes de Vontade.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    {
      name: 'Despersonalização',
      description: 'Personagem sente-se desconectado de si mesmo. -2 em testes de Presença e Vontade.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    {
      name: 'Ataques de Pânico',
      description: 'Personagem pode ter ataques de pânico em situações estressantes. Teste de Vontade DT 15 ou fica Apavorado.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    {
      name: 'Dependência de Substâncias',
      description: 'Personagem desenvolveu dependência. Precisa de substâncias para funcionar normalmente. -1 em todos os testes sem uso.',
      severity: 'moderate',
      turnsTriggered: 15,
    },
    
    // Efeitos Severos (20+ turnos)
    {
      name: 'Alucinações',
      description: 'Personagem sofre de alucinações ocasionais. Mestre pode criar percepções falsas.',
      severity: 'severe',
      turnsTriggered: 20,
    },
    {
      name: 'Amnésia Parcial',
      description: 'Personagem perdeu memórias críticas. -3 em testes de Intelecto e não se lembra de eventos importantes.',
      severity: 'severe',
      turnsTriggered: 20,
    },
    {
      name: 'Delírios',
      description: 'Personagem desenvolveu crenças falsas persistentes. Pode agir contra seus próprios interesses.',
      severity: 'severe',
      turnsTriggered: 20,
    },
    {
      name: 'Dissociação',
      description: 'Personagem perde conexão com a realidade. -3 em todos os testes de Presença e Vontade.',
      severity: 'severe',
      turnsTriggered: 25,
    },
    {
      name: 'Transtorno de Personalidade',
      description: 'Personagem desenvolveu mudanças permanentes de personalidade. Mestre pode impor comportamentos específicos.',
      severity: 'severe',
      turnsTriggered: 30,
    },
    {
      name: 'Colapso Mental',
      description: 'A mente do personagem entrou em colapso. -5 em todos os testes mentais e pode ficar inconsciente em situações extremas.',
      severity: 'severe',
      turnsTriggered: 40,
    },
  ]

  // Selecionar efeito baseado no número de turnos
  if (turnsTriggered >= 40) {
    return effects[effects.length - 1] // Colapso Mental
  } else if (turnsTriggered >= 30) {
    return effects[effects.length - 2] // Transtorno de Personalidade
  } else if (turnsTriggered >= 25) {
    return effects[effects.length - 3] // Dissociação
  } else if (turnsTriggered >= 20) {
    // Efeitos severos (20-24 turnos)
    const severeEffects = effects.filter(e => e.severity === 'severe' && e.turnsTriggered <= 20)
    return severeEffects[Math.floor(Math.random() * severeEffects.length)]
  } else if (turnsTriggered >= 15) {
    // Efeitos moderados (15-19 turnos)
    const moderateEffects = effects.filter(e => e.severity === 'moderate' && e.turnsTriggered <= 15)
    return moderateEffects[Math.floor(Math.random() * moderateEffects.length)]
  } else {
    // Efeitos leves (10-14 turnos)
    const minorEffects = effects.filter(e => e.severity === 'minor' && e.turnsTriggered <= 10)
    return minorEffects[Math.floor(Math.random() * minorEffects.length)]
  }
}


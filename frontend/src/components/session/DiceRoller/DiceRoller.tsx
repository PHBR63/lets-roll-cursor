import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import { DiceRollerBasic } from './DiceRollerBasic'
import { DiceRollerSkill } from './DiceRollerSkill'
import { DiceRollerAttack } from './DiceRollerAttack'
import { ChainRoller } from './ChainRoller'
import { RollHistory } from './RollHistory'
import { DiceRollResult } from './DiceRollResult'
import { DiceAnimation } from '@/components/common/DiceAnimation'
import { DTCalculator } from '@/components/common/DTCalculator'
import { Character } from './types'
import { logger } from '@/utils/logger'
import { DiceRollResult as DiceRollResultType } from '@/types/dice'

/**
 * Componente de rolagem de dados com sistema Ordem Paranormal
 * Refatorado em componentes menores
 */
interface DiceRollerProps {
  sessionId?: string
  campaignId?: string
}

export function DiceRoller({ sessionId, campaignId }: DiceRollerProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('basic')
  const [isPrivate, setIsPrivate] = useState(false)
  const [character, setCharacter] = useState<Character | null>(null)
  const [lastResult, setLastResult] = useState<DiceRollResultType | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationResult, setAnimationResult] = useState<{ result: number; dice: number[] } | null>(null)

  /**
   * Carrega personagem do usuário na campanha
   */
  const loadCharacter = async () => {
    try {
      if (!campaignId || !user) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters?userId=${user.id}&campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const chars = await response.json()
        const charactersData = chars.data || chars
        if (charactersData.length > 0) {
          setCharacter(charactersData[0])
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar personagem:', error)
    }
  }

  useEffect(() => {
    if (campaignId && user) {
      loadCharacter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, user])

  const handleRoll = (result: DiceRollResultType) => {
    // Mostrar animação
    if (result.details?.rolls) {
      const rolls = Array.isArray(result.details.rolls) 
        ? result.details.rolls.map((r: { die?: number; value?: number } | number) => 
            typeof r === 'number' ? r : (r.value || r.die || 0)
          )
        : []
      setAnimationResult({
        result: result.result || result.total,
        dice: rolls,
      })
      setShowAnimation(true)
    }

    setLastResult({
      type: result.type || 'basic',
      ...result,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Rolagem de Dados</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básica</TabsTrigger>
          <TabsTrigger value="skill" disabled={!character}>
            Perícia
          </TabsTrigger>
          <TabsTrigger value="attack" disabled={!character}>
            Ataque
          </TabsTrigger>
          <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <DiceRollerBasic
            sessionId={sessionId}
            campaignId={campaignId}
            characterId={character?.id}
            isPrivate={isPrivate}
            onRoll={handleRoll}
          />
        </TabsContent>

        <TabsContent value="skill" className="space-y-4 mt-4">
          <DiceRollerSkill
            character={character}
            sessionId={sessionId}
            campaignId={campaignId}
            onRoll={handleRoll}
          />
        </TabsContent>

        <TabsContent value="attack" className="space-y-4 mt-4">
          <DiceRollerAttack
            character={character}
            sessionId={sessionId}
            campaignId={campaignId}
            onRoll={handleRoll}
          />
        </TabsContent>

        <TabsContent value="tools" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DTCalculator />
            <ChainRoller
              onRoll={(result) => handleRoll(result as any)}
              sessionId={sessionId}
              campaignId={campaignId}
              characterId={character?.id}
              isPrivate={isPrivate}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Checkbox Privado */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="private"
          checked={isPrivate}
          onCheckedChange={(checked) => setIsPrivate(!!checked)}
        />
        <Label htmlFor="private" className="text-text-secondary text-sm cursor-pointer">
          Rolagem Privada
        </Label>
      </div>

      {/* Histórico de Rolagens */}
      <RollHistory sessionId={sessionId} campaignId={campaignId} />

      {/* Último Resultado */}
      {lastResult && <DiceRollResult result={lastResult as any} />}

      {/* Animação de rolagem de dados */}
      {showAnimation && animationResult && (
        <DiceAnimation
          result={animationResult.result}
          dice={animationResult.dice}
          onComplete={() => {
            setShowAnimation(false)
            setAnimationResult(null)
            toast.success('Dados rolados!', `Resultado: ${animationResult.result}`)
          }}
        />
      )}
    </div>
  )
}


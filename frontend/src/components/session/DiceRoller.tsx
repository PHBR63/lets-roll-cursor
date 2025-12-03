import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ALL_SKILLS } from '@/types/ordemParanormal'
import { useRealtimeRolls } from '@/hooks/useRealtimeRolls'

/**
 * Componente de rolagem de dados com sistema Ordem Paranormal
 * Suporta: rolagem básica, teste de perícia, e ataque
 */
interface DiceRollerProps {
  sessionId?: string
  campaignId?: string
}

const DICE_TYPES = [
  { label: 'd4', value: 4 },
  { label: 'd6', value: 6 },
  { label: 'd8', value: 8 },
  { label: 'd10', value: 10 },
  { label: 'd12', value: 12 },
  { label: 'd20', value: 20 },
  { label: 'd100', value: 100 },
]

export function DiceRoller({ sessionId, campaignId }: DiceRollerProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [formula, setFormula] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [rolling, setRolling] = useState(false)
  const [character, setCharacter] = useState<any>(null)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [difficulty, setDifficulty] = useState(15)
  const [targetDefense, setTargetDefense] = useState(10)
  const [weaponDice, setWeaponDice] = useState('1d6')
  const [isMelee, setIsMelee] = useState(true)
  
  // Integração Realtime - carrega rolagens em tempo real
  const { rolls: recentRolls } = useRealtimeRolls(sessionId, campaignId)

  useEffect(() => {
    if (campaignId && user) {
      loadCharacter()
    }
  }, [campaignId, user])

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
        if (chars.length > 0) {
          setCharacter(chars[0])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar personagem:', error)
    }
  }

  /**
   * Rola um dado específico (rolagem básica)
   */
  const rollDice = async (sides: number) => {
    await rollFormula(`1d${sides}`)
  }

  /**
   * Rola dados baseado na fórmula (rolagem básica)
   */
  const rollFormula = async (customFormula?: string) => {
    if (!campaignId || !user) return

    const rollFormula = customFormula || formula.trim()
    if (!rollFormula) return

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(`${apiUrl}/api/dice/roll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          formula: rollFormula,
          sessionId: sessionId || null,
          campaignId,
          characterId: character?.id || null,
          isPrivate,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao rolar dados')
      }

      const result = await response.json()
      setLastResult({
        type: 'basic',
        ...result,
      })

      if (customFormula) {
        setFormula('')
      }
    } catch (error) {
      console.error('Erro ao rolar dados:', error)
      alert('Erro ao rolar dados. Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  /**
   * Rola teste de perícia (sistema Ordem Paranormal)
   */
  const rollSkillTest = async () => {
    if (!character || !selectedSkill) {
      alert('Selecione uma perícia')
      return
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-skill`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName: selectedSkill,
            difficulty,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar teste de perícia')
      }

      const result = await response.json()
      setLastResult({
        type: 'skill',
        ...result,
      })
    } catch (error: any) {
      console.error('Erro ao rolar teste de perícia:', error)
      alert(error.message || 'Erro ao rolar teste de perícia. Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  /**
   * Rola ataque (sistema Ordem Paranormal)
   */
  const rollAttack = async () => {
    if (!character || !selectedSkill) {
      alert('Selecione uma perícia de ataque (Luta ou Pontaria)')
      return
    }

    setRolling(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/roll-attack`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            skillName: selectedSkill,
            targetDefense: parseInt(String(targetDefense)),
            weaponDice,
            isMelee,
            criticalMultiplier: 2,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao rolar ataque')
      }

      const result = await response.json()
      setLastResult({
        type: 'attack',
        ...result,
      })
    } catch (error: any) {
      console.error('Erro ao rolar ataque:', error)
      alert(error.message || 'Erro ao rolar ataque. Tente novamente.')
    } finally {
      setRolling(false)
    }
  }

  /**
   * Handler para Enter no campo de fórmula
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      rollFormula()
    }
  }

  /**
   * Obtém perícias disponíveis do personagem
   */
  const availableSkills = character?.skills
    ? Object.keys(character.skills).filter((skill) => ALL_SKILLS[skill])
    : []

  /**
   * Perícias de ataque
   */
  const attackSkills = availableSkills.filter(
    (skill) => skill === 'Luta' || skill === 'Pontaria'
  )

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">Rolagem de Dados</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Básica</TabsTrigger>
          <TabsTrigger value="skill" disabled={!character}>
            Perícia
          </TabsTrigger>
          <TabsTrigger value="attack" disabled={!character}>
            Ataque
          </TabsTrigger>
        </TabsList>

        {/* Rolagem Básica */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Botões Rápidos */}
          <div className="grid grid-cols-7 gap-2">
            {DICE_TYPES.map((dice) => (
              <Button
                key={dice.value}
                onClick={() => rollDice(dice.value)}
                disabled={rolling}
                className="bg-card-secondary hover:bg-accent hover:text-white text-white border border-card-secondary"
                size="sm"
              >
                {dice.label}
              </Button>
            ))}
          </div>

          {/* Campo de Fórmula */}
          <div className="space-y-2">
            <Label htmlFor="formula" className="text-white">
              Fórmula (ex: 2d6+3, 1d20)
            </Label>
            <div className="flex gap-2">
              <Input
                id="formula"
                placeholder="2d6+3"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-white/20 flex-1"
                disabled={rolling}
              />
              <Button
                onClick={() => rollFormula()}
                disabled={rolling || !formula.trim()}
                className="bg-accent hover:bg-accent/90"
              >
                {rolling ? 'Rolando...' : 'Rolar'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Teste de Perícia */}
        <TabsContent value="skill" className="space-y-4 mt-4">
          {!character ? (
            <div className="text-text-secondary text-sm text-center py-4">
              Nenhum personagem encontrado nesta campanha
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-white">Perícia</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="bg-input border-white/20">
                    <SelectValue placeholder="Selecione uma perícia" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Dificuldade (DT)</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value) || 15)}
                  className="bg-input border-white/20"
                />
              </div>

              <Button
                onClick={rollSkillTest}
                disabled={rolling || !selectedSkill}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {rolling ? 'Rolando...' : 'Rolar Teste de Perícia'}
              </Button>
            </>
          )}
        </TabsContent>

        {/* Ataque */}
        <TabsContent value="attack" className="space-y-4 mt-4">
          {!character ? (
            <div className="text-text-secondary text-sm text-center py-4">
              Nenhum personagem encontrado nesta campanha
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-white">Perícia de Ataque</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="bg-input border-white/20">
                    <SelectValue placeholder="Selecione Luta ou Pontaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {attackSkills.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Defesa do Alvo</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={targetDefense}
                  onChange={(e) =>
                    setTargetDefense(parseInt(e.target.value) || 10)
                  }
                  className="bg-input border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Dado de Dano (ex: 1d6, 2d8)</Label>
                <Input
                  placeholder="1d6"
                  value={weaponDice}
                  onChange={(e) => setWeaponDice(e.target.value)}
                  className="bg-input border-white/20"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="melee"
                  checked={isMelee}
                  onCheckedChange={(checked) => setIsMelee(!!checked)}
                />
                <Label htmlFor="melee" className="text-text-secondary text-sm cursor-pointer">
                  Corpo-a-corpo (adiciona Força ao dano)
                </Label>
              </div>

              <Button
                onClick={rollAttack}
                disabled={rolling || !selectedSkill}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {rolling ? 'Rolando...' : 'Rolar Ataque'}
              </Button>
            </>
          )}
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

      {/* Último Resultado */}
      {lastResult && (
        <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-lg">
          {lastResult.type === 'basic' && (
            <>
              <div className="text-white font-bold text-xl text-center">
                {lastResult.result}
              </div>
              <div className="text-text-secondary text-sm text-center mt-1">
                {lastResult.formula}
                {lastResult.details && (
                  <span className="block text-xs mt-1">
                    ({lastResult.details.join(', ')})
                  </span>
                )}
              </div>
            </>
          )}

          {lastResult.type === 'skill' && (
            <>
              <div className="text-white font-bold text-xl text-center">
                {lastResult.total} {lastResult.success ? '✅' : '❌'}
              </div>
              <div className="text-text-secondary text-sm text-center mt-1">
                {lastResult.skillName} vs DT {lastResult.difficulty}
              </div>
              <div className="text-xs text-text-secondary mt-2 text-center">
                Dados: [{lastResult.dice.join(', ')}] + Bônus: {lastResult.skillBonus} = {lastResult.total}
                {lastResult.advantage && ' (Vantagem)'}
                {lastResult.disadvantage && ' (Desvantagem)'}
              </div>
              <div className="text-xs text-center mt-2">
                {lastResult.success ? (
                  <span className="text-green-400">Sucesso!</span>
                ) : (
                  <span className="text-red-400">Falha</span>
                )}
              </div>
            </>
          )}

          {lastResult.type === 'attack' && (
            <>
              <div className="text-white font-bold text-xl text-center">
                {lastResult.total} {lastResult.hit ? '✅' : '❌'}
                {lastResult.critical && ' 🎯'}
              </div>
              <div className="text-text-secondary text-sm text-center mt-1">
                {lastResult.skillName} vs Defesa {lastResult.targetDefense}
              </div>
              <div className="text-xs text-text-secondary mt-2 text-center">
                Ataque: [{lastResult.dice.join(', ')}] + {lastResult.bonus} = {lastResult.total}
                {lastResult.critical && ' (CRÍTICO!)'}
              </div>
              {lastResult.hit && lastResult.damage && (
                <div className="text-xs text-center mt-2">
                  <span className="text-red-400">
                    Dano: {lastResult.damage.total} ({lastResult.damage.dice.join(', ')})
                  </span>
                </div>
              )}
              <div className="text-xs text-center mt-2">
                {lastResult.hit ? (
                  <span className="text-green-400">Acertou!</span>
                ) : (
                  <span className="text-red-400">Errou</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

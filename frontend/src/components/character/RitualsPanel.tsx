import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Sparkles } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ALL_RITUALS, type Ritual } from '@/data/rituals'
import { usePELimit } from '@/hooks/usePELimit'

import { Character } from '@/types/character'

/**
 * Painel de rituais paranormais do personagem
 * Permite adicionar, remover e conjurar rituais
 */
interface RitualsPanelProps {
  character: Character
  onUpdate: () => void
}

// Rituais disponíveis do sistema (todos os rituais já estão em ALL_RITUALS)
const AVAILABLE_RITUALS: Ritual[] = ALL_RITUALS

export function RitualsPanel({ character, onUpdate }: RitualsPanelProps) {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRitual, setSelectedRitual] = useState<string>('')
  const [conjuring, setConjuring] = useState<string | null>(null)
  const [filterCircle, setFilterCircle] = useState<string>('all')
  const [filterElement, setFilterElement] = useState<string>('all')
  const [peSpentThisTurn, setPeSpentThisTurn] = useState(0) // Rastrear PE gasto no turno atual

  // Calcular limite de PE por turno
  const nex = character.stats?.nex || 5
  const { limit: peLimit, canSpend, getRemaining } = usePELimit(nex)

  useEffect(() => {
    // Carregar rituais do personagem (armazenados em JSONB ou tabela separada)
    // Por enquanto, vamos usar uma lista vazia e permitir adicionar
    const characterRituals = (character.rituals || []) as unknown as Ritual[]
    setRituals(characterRituals)
  }, [character])

  /**
   * Adiciona ritual ao personagem
   */
  const handleAddRitual = async () => {
    if (!selectedRitual || !character?.id) return

    const ritual = AVAILABLE_RITUALS.find((r) => r.id === selectedRitual)
    if (!ritual) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Adicionar ritual ao personagem (pode ser via API ou atualizar JSONB)
      const currentRituals = character.rituals || []
      const updatedRituals = [...currentRituals, ritual]

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          rituals: updatedRituals,
        }),
      })

      if (response.ok) {
        setShowAddModal(false)
        setSelectedRitual('')
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao adicionar ritual:', error)
      alert('Erro ao adicionar ritual. Tente novamente.')
    }
  }

  /**
   * Remove ritual do personagem
   */
  const handleRemoveRitual = async (ritualId: string) => {
    if (!character?.id) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const currentRituals = (character.rituals || []) as unknown as Ritual[]
      const updatedRituals = currentRituals.filter((r) => r.id !== ritualId)

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          rituals: updatedRituals,
        }),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao remover ritual:', error)
      alert('Erro ao remover ritual. Tente novamente.')
    }
  }

  /**
   * Conjura ritual (gasta PE/SAN)
   */
  const handleConjureRitual = async (ritual: Ritual) => {
    if (!character?.id || conjuring) return

    const stats = character.stats || {}
    const pe = stats.pe || { current: 0, max: 0 }
    const san = stats.san || { current: 0, max: 0 }

    // Verificar se tem PE suficiente
    if (pe.current < ritual.cost.pe) {
      alert('PE insuficiente para conjurar este ritual')
      return
    }

    // Verificar limite de PE por turno
    if (!canSpend(ritual.cost.pe, peSpentThisTurn)) {
      const remaining = getRemaining(peSpentThisTurn)
      alert(
        `Limite de PE por turno excedido!\n` +
          `Você pode gastar até ${peLimit} PE por turno (NEX ${nex}%).\n` +
          `Você já gastou ${peSpentThisTurn} PE neste turno.\n` +
          `Este ritual custa ${ritual.cost.pe} PE, mas você só tem ${remaining} PE restantes.`
      )
      return
    }

    // Verificar se tem SAN suficiente (se necessário)
    if (ritual.cost.san && san.current < ritual.cost.san) {
      alert('SAN insuficiente para conjurar este ritual')
      return
    }

    // Verificar se tem afinidade (50% NEX) - não precisa de ingredientes
    const hasAffinity = character.affinity === ritual.element && (character.stats?.nex || 0) >= 50

    // Verificar ingredientes (se não tiver afinidade)
    if (!hasAffinity && ritual.requiresIngredients && ritual.ingredients) {
      const characterIngredients = character.ingredients || []
      const missingIngredients = ritual.ingredients.filter(
        (ing) => !((characterIngredients as unknown as string[]) || []).includes(ing)
      )

      if (missingIngredients.length > 0) {
        alert(
          `Este ritual requer os seguintes ingredientes: ${missingIngredients.join(', ')}\n` +
            `Você possui: ${characterIngredients.join(', ') || 'Nenhum'}`
        )
        return
      }
    }

    setConjuring(ritual.id)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Conjurar ritual com teste de custo
      const response = await fetch(`${apiUrl}/api/characters/${character.id}/conjure-ritual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          ritualCost: ritual.cost.pe,
          peSpentThisTurn,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao conjurar ritual')
        return
      }

      const result = await response.json()

      // Atualizar PE gasto no turno atual
      setPeSpentThisTurn(prev => prev + ritual.cost.pe)

      // Mostrar resultado do teste
      let message = `Ritual "${ritual.name}" `
      if (result.success) {
        message += `conjurado com sucesso!\n\n${result.message}`
      } else if (result.criticalFailure) {
        message += `FALHA CRÍTICA!\n\n${result.message}\n\n⚠️ ATENÇÃO: Sua SAN máxima foi reduzida permanentemente!`
      } else {
        message += `falhou no teste de custo.\n\n${result.message}`
      }

      // Mostrar detalhes do teste
      message += `\n\nTeste de Custo:\n`
      message += `- Dados rolados: ${result.testResult.dice.join(', ')}\n`
      message += `- INT: ${result.testResult.attributeValue}\n`
      message += `- Bônus de Ocultismo: +${result.testResult.skillBonus}\n`
      message += `- Total: ${result.testResult.rollResult}\n`
      message += `- DT: ${result.testResult.dt} (20 + ${ritual.cost.pe} PE)`

      alert(message)
      onUpdate()
    } catch (error) {
      console.error('Erro ao conjurar ritual:', error)
      alert('Erro ao conjurar ritual. Tente novamente.')
    } finally {
      setConjuring(null)
    }
  }

  const characterRituals = character.rituals || []

  // Filtrar rituais disponíveis
  const filteredRituals = AVAILABLE_RITUALS.filter((r) => {
    const notOwned = !((characterRituals as unknown as Ritual[]) || []).some((cr) => cr.id === r.id)
    const circleMatch = filterCircle === 'all' || r.circle.toString() === filterCircle
    const elementMatch = filterElement === 'all' || r.element === filterElement
    return notOwned && circleMatch && elementMatch
  })

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Rituais Paranormais</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary">Limite PE/turno:</span>
            <span className="text-yellow-400 font-semibold">{peLimit}</span>
            <span className="text-text-secondary">(NEX {nex}%)</span>
            {peSpentThisTurn > 0 && (
              <>
                <span className="text-text-secondary">| Gasto:</span>
                <span className="text-orange-400 font-semibold">{peSpentThisTurn}</span>
                <span className="text-text-secondary">| Restante:</span>
                <span className={`font-semibold ${getRemaining(peSpentThisTurn) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {getRemaining(peSpentThisTurn)}
                </span>
              </>
            )}
          </div>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ritual
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Ritual</DialogTitle>
              <DialogDescription>
                Selecione um ritual para adicionar ao personagem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filtrar por Círculo</Label>
                  <Select value={filterCircle} onValueChange={setFilterCircle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os círculos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="1">1º Círculo</SelectItem>
                      <SelectItem value="2">2º Círculo</SelectItem>
                      <SelectItem value="3">3º Círculo</SelectItem>
                      <SelectItem value="4">4º Círculo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filtrar por Elemento</Label>
                  <Select value={filterElement} onValueChange={setFilterElement}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os elementos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="SANGUE">Sangue</SelectItem>
                      <SelectItem value="MORTE">Morte</SelectItem>
                      <SelectItem value="ENERGIA">Energia</SelectItem>
                      <SelectItem value="CONHECIMENTO">Conhecimento</SelectItem>
                      <SelectItem value="MEDO">Medo</SelectItem>
                      <SelectItem value="VARIÁVEL">Variável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Ritual</Label>
                <Select value={selectedRitual} onValueChange={setSelectedRitual}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ritual" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRituals.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        Nenhum ritual disponível com os filtros selecionados
                      </div>
                    ) : (
                      filteredRituals.map((ritual) => (
                        <SelectItem key={ritual.id} value={ritual.id}>
                          {ritual.name} - Círculo {ritual.circle} ({ritual.element})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedRitual && (
                <div className="p-3 bg-card-secondary rounded-md">
                  {(() => {
                    const ritual = AVAILABLE_RITUALS.find((r) => r.id === selectedRitual)
                    if (!ritual) return null
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="font-semibold text-white">{ritual.name}</div>
                        <div className="text-text-secondary">{ritual.description}</div>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <span className="text-text-secondary">Custo: </span>
                            <span className="text-green-400">{ritual.cost.pe} PE</span>
                          </div>
                          <div>
                            <span className="text-text-secondary">Alcance: </span>
                            <span>{ritual.range}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary">Alvo: </span>
                            <span>{ritual.target}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAddRitual} disabled={!selectedRitual}>
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {characterRituals.length === 0 ? (
        <div className="text-muted-foreground text-sm text-center py-4">
          Nenhum ritual conhecido
        </div>
      ) : (
        <div className="space-y-3">
          {((characterRituals as unknown as Ritual[]) || []).map((ritual) => {
            const stats = character.stats || {}
            const pe = stats.pe || { current: 0, max: 0 }
            const hasAffinity =
              character.affinity === ritual.element && (character.stats?.nex || 0) >= 50
            const canConjure = pe.current >= ritual.cost.pe

            return (
              <Card key={ritual.id} className="p-4 bg-card-secondary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{ritual.name}</h3>
                      <Badge variant="outline">Círculo {ritual.circle}</Badge>
                      {ritual.element && (
                        <Badge variant="secondary">{ritual.element}</Badge>
                      )}
                      {hasAffinity && (
                        <Badge variant="default" className="bg-purple-600">
                          Afinidade
                        </Badge>
                      )}
                    </div>
                    {ritual.description && (
                      <p className="text-sm text-text-secondary mb-2">{ritual.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm mb-2">
                      <div>
                        <span className="text-text-secondary">Custo: </span>
                        <span className="text-green-400 font-semibold">
                          {ritual.cost.pe} PE
                        </span>
                        {ritual.cost.san && (
                          <span className="text-blue-400 font-semibold ml-2">
                            {ritual.cost.san} SAN
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-text-secondary">Alcance: </span>
                        <span className="text-white">{ritual.range}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Alvo: </span>
                        <span className="text-white">{ritual.target}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Duração: </span>
                        <span className="text-white">{ritual.duration}</span>
                      </div>
                      {ritual.resistance && (
                        <div>
                          <span className="text-text-secondary">Resistência: </span>
                          <span className="text-white">{ritual.resistance}</span>
                        </div>
                      )}
                    </div>
                    {(ritual.discente || ritual.verdadeiro) && (
                      <div className="text-xs text-text-secondary mb-2">
                        <div className="font-semibold mb-1">Versões Avançadas:</div>
                        {ritual.discente && (
                          <div className="ml-2">
                            <span className="text-purple-400">Discente (+{ritual.discente.pe} PE):</span>{' '}
                            {ritual.discente.description}
                            {ritual.discente.requiresCircle && (
                              <span className="text-yellow-400">
                                {' '}Requer {ritual.discente.requiresCircle}º círculo.
                              </span>
                            )}
                          </div>
                        )}
                        {ritual.verdadeiro && (
                          <div className="ml-2">
                            <span className="text-purple-600">Verdadeiro (+{ritual.verdadeiro.pe} PE):</span>{' '}
                            {ritual.verdadeiro.description}
                            {ritual.verdadeiro.requiresCircle && (
                              <span className="text-yellow-400">
                                {' '}Requer {ritual.verdadeiro.requiresCircle}º círculo.
                              </span>
                            )}
                            {ritual.verdadeiro.requiresAffinity && (
                              <span className="text-purple-600"> Requer afinidade.</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {ritual.requiresIngredients && !hasAffinity && ritual.ingredients && (
                      <div className="text-yellow-400 text-xs mb-2">
                        <span className="font-semibold">Ingredientes: </span>
                        {ritual.ingredients.join(', ')}
                      </div>
                    )}
                    {hasAffinity && (
                      <div className="text-purple-400 text-xs mb-2">
                        Sem ingredientes necessários (Afinidade)
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleConjureRitual(ritual)}
                      disabled={!canConjure || conjuring === ritual.id}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {conjuring === ritual.id ? 'Conjurando...' : 'Conjurar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRitual(ritual.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}


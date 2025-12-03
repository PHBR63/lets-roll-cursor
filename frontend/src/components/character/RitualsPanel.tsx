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

/**
 * Painel de rituais paranormais do personagem
 * Permite adicionar, remover e conjurar rituais
 */
interface RitualsPanelProps {
  character: any
  onUpdate: () => void
}

interface Ritual {
  id: string
  name: string
  circle: number // Círculo do ritual (1-5)
  cost: {
    pe: number
    san?: number
  }
  requiresIngredients: boolean
  element?: string // Elemento paranormal
  description?: string
}

// Rituais básicos do sistema (pode ser expandido)
const AVAILABLE_RITUALS: Ritual[] = [
  {
    id: 'ritual-1',
    name: 'Amaldiçoar Arma',
    circle: 1,
    cost: { pe: 1 },
    requiresIngredients: true,
    element: 'SANGUE',
    description: 'Imbui uma arma com energia paranormal',
  },
  {
    id: 'ritual-2',
    name: 'Armadura de Sangue',
    circle: 1,
    cost: { pe: 1 },
    requiresIngredients: true,
    element: 'SANGUE',
    description: 'Cria uma armadura temporária de sangue',
  },
  {
    id: 'ritual-3',
    name: 'Cicatrização',
    circle: 1,
    cost: { pe: 1 },
    requiresIngredients: true,
    element: 'SANGUE',
    description: 'Regenera pontos de vida',
  },
  {
    id: 'ritual-4',
    name: 'Comunhão Vital',
    circle: 2,
    cost: { pe: 2 },
    requiresIngredients: true,
    element: 'SANGUE',
    description: 'Compartilha vida entre aliados',
  },
  {
    id: 'ritual-5',
    name: 'Hemofagia',
    circle: 2,
    cost: { pe: 2 },
    requiresIngredients: true,
    element: 'SANGUE',
    description: 'Drena vida de inimigos',
  },
]

export function RitualsPanel({ character, onUpdate }: RitualsPanelProps) {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRitual, setSelectedRitual] = useState<string>('')
  const [conjuring, setConjuring] = useState<string | null>(null)

  useEffect(() => {
    // Carregar rituais do personagem (armazenados em JSONB ou tabela separada)
    // Por enquanto, vamos usar uma lista vazia e permitir adicionar
    const characterRituals = character.rituals || []
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
      
      const currentRituals = character.rituals || []
      const updatedRituals = currentRituals.filter((r: Ritual) => r.id !== ritualId)

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

    // Verificar se tem SAN suficiente (se necessário)
    if (ritual.cost.san && san.current < ritual.cost.san) {
      alert('SAN insuficiente para conjurar este ritual')
      return
    }

    // Verificar se tem afinidade (50% NEX) - não precisa de ingredientes
    const hasAffinity = character.affinity === ritual.element && (character.stats?.nex || 0) >= 50

    if (!hasAffinity && ritual.requiresIngredients) {
      // Por enquanto, apenas avisar (pode implementar sistema de ingredientes depois)
      if (!confirm('Este ritual requer ingredientes. Deseja conjurar mesmo assim?')) {
        return
      }
    }

    setConjuring(ritual.id)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Atualizar PE e SAN
      const updatedStats = {
        ...stats,
        pe: {
          ...pe,
          current: Math.max(0, pe.current - ritual.cost.pe),
        },
        san: ritual.cost.san
          ? {
              ...san,
              current: Math.max(0, san.current - ritual.cost.san),
            }
          : san,
      }

      const response = await fetch(`${apiUrl}/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          stats: updatedStats,
        }),
      })

      if (response.ok) {
        alert(`Ritual "${ritual.name}" conjurado com sucesso!`)
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao conjurar ritual:', error)
      alert('Erro ao conjurar ritual. Tente novamente.')
    } finally {
      setConjuring(null)
    }
  }

  const characterRituals = character.rituals || []

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Rituais Paranormais</h2>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ritual
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Ritual</DialogTitle>
              <DialogDescription>
                Selecione um ritual para adicionar ao personagem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Ritual</Label>
                <Select value={selectedRitual} onValueChange={setSelectedRitual}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ritual" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_RITUALS.filter(
                      (r) => !characterRituals.some((cr: Ritual) => cr.id === r.id)
                    ).map((ritual) => (
                      <SelectItem key={ritual.id} value={ritual.id}>
                        {ritual.name} (Círculo {ritual.circle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
          {characterRituals.map((ritual: Ritual) => {
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
                    <div className="flex gap-4 text-sm">
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
                      {ritual.requiresIngredients && !hasAffinity && (
                        <div className="text-yellow-400">
                          Requer ingredientes
                        </div>
                      )}
                      {hasAffinity && (
                        <div className="text-purple-400">Sem ingredientes (Afinidade)</div>
                      )}
                    </div>
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


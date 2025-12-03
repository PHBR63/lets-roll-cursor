import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { CreateCreatureModal } from './CreateCreatureModal'
import { NPCsPanel } from './NPCsPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Painel de criaturas e NPCs
 * Grid de cards com barras de recursos
 */
interface CreaturesPanelProps {
  campaignId?: string
}

export function CreaturesPanel({ campaignId }: CreaturesPanelProps) {
  const [creatures, setCreatures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'creatures' | 'list'>('creatures')

  useEffect(() => {
    if (campaignId) {
      loadCreatures()
    }
  }, [campaignId])

  /**
   * Carrega criaturas da campanha
   */
  const loadCreatures = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/creatures?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCreatures(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar criaturas:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Remove criatura
   */
  const handleDeleteCreature = async (creatureId: string) => {
    if (!confirm('Tem certeza que deseja remover esta criatura?')) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/creatures/${creatureId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        loadCreatures()
      }
    } catch (error) {
      console.error('Erro ao remover criatura:', error)
      alert('Erro ao remover criatura. Tente novamente.')
    }
  }

  if (loading) {
    return <div className="text-text-secondary text-sm">Carregando criaturas...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Criaturas</h2>
        <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
          <SelectTrigger className="w-[140px] bg-input border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="creatures">+ Novo</SelectItem>
            <SelectItem value="list">Lista Completa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs: Criaturas / NPCs */}
      <Tabs defaultValue="creatures" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="creatures">Criaturas</TabsTrigger>
          <TabsTrigger value="npcs">NPCs</TabsTrigger>
        </TabsList>

        <TabsContent value="creatures" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {creatures.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8">
                Nenhuma criatura criada ainda
                <br />
                <Button
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-accent hover:bg-accent/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Criatura
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {creatures.map((creature) => {
                  const stats = creature.stats || {}
                  const vida = stats.vida || stats.pv || { current: 0, max: 0 }
                  const energia = stats.energia || stats.pe || { current: 0, max: 0 }
                  const saude = stats.saude || stats.san || { current: 0, max: 0 }
                  const exp = stats.exp || stats.nex || 0

                  const vidaPercent = vida.max > 0 ? (vida.current / vida.max) * 100 : 0
                  const energiaPercent = energia.max > 0 ? (energia.current / energia.max) * 100 : 0
                  const saudePercent = saude.max > 0 ? (saude.current / saude.max) * 100 : 0

                  return (
                    <Card
                      key={creature.id}
                      className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3 cursor-pointer"
                      onClick={() => {
                        // TODO: Abrir modal de edição
                        console.log('Editar criatura:', creature)
                      }}
                    >
                      <div className="space-y-2">
                        {/* Nome e Avatar */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">{creature.name}</h3>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Editar
                              }}
                              className="h-6 w-6 p-0 text-white hover:bg-accent"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteCreature(creature.id)
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:bg-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Avatar placeholder */}
                        <div className="w-16 h-16 bg-card-secondary rounded-full mx-auto flex items-center justify-center">
                          <span className="text-text-secondary text-xs">Char</span>
                        </div>

                        {/* Barras de Recursos */}
                        <div className="space-y-2">
                          {/* Vida */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-red-400">Vida</span>
                              <span className="text-white">
                                {vida.current}/{vida.max} ({Math.round(vidaPercent)}%)
                              </span>
                            </div>
                            <Progress value={vidaPercent} className="h-2 bg-red-900/30" />
                          </div>

                          {/* EXP */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-text-secondary">EXP</span>
                              <span className="text-white">{exp}%</span>
                            </div>
                            <Progress value={exp} className="h-2 bg-gray-700" />
                          </div>

                          {/* Energia */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-green-400">Energia</span>
                              <span className="text-white">
                                {energia.current}/{energia.max}
                              </span>
                            </div>
                            <Progress value={energiaPercent} className="h-2 bg-green-900/30" />
                          </div>

                          {/* Saúde */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-yellow-400">Saúde</span>
                              <span className="text-white">
                                {saude.current}/{saude.max}
                              </span>
                            </div>
                            <Progress value={saudePercent} className="h-2 bg-yellow-900/30" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
          {/* Botão Criar */}
          <div className="mt-4">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Criatura
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="npcs" className="flex-1 overflow-y-auto">
          <NPCsPanel campaignId={campaignId} />
        </TabsContent>

      {/* Modal Criar Criatura */}
      <CreateCreatureModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        campaignId={campaignId}
        onSuccess={loadCreatures}
      />
    </div>
  )
}


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
import { useRealtimeCreatures } from '@/hooks/useRealtimeCreatures'
import { CreateCreatureModal } from './CreateCreatureModal'
import { EditCreatureModal } from './EditCreatureModal'
import { ApplyDamageModal } from './ApplyDamageModal'
import { ApplyConditionModal } from './ApplyConditionModal'
import { NPCsPanel } from './NPCsPanel'
import { SearchAndFilters } from './SearchAndFilters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Painel de criaturas e NPCs
 * Grid de cards com barras de recursos
 */
interface CreaturesPanelProps {
  campaignId?: string
}

export function CreaturesPanel({ campaignId }: CreaturesPanelProps) {
  const { creatures, loading, refresh: loadCreatures } = useRealtimeCreatures(campaignId)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showConditionModal, setShowConditionModal] = useState(false)
  const [selectedCreature, setSelectedCreature] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'creatures' | 'list'>('creatures')
  const [searchValue, setSearchValue] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

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
          {/* Busca e Filtros */}
          <div className="mb-4">
            <SearchAndFilters
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              filters={{ type: filterType }}
              onFilterChange={(key, value) => {
                if (key === 'type') setFilterType(value)
              }}
              onClearFilters={() => {
                setSearchValue('')
                setFilterType('all')
              }}
              placeholder="Buscar criaturas..."
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {(() => {
              // Filtrar criaturas
              let filtered = creatures
              
              if (searchValue) {
                filtered = filtered.filter((c) =>
                  c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  c.type?.toLowerCase().includes(searchValue.toLowerCase())
                )
              }
              
              if (filterType !== 'all') {
                filtered = filtered.filter((c) => {
                  if (filterType === 'creature') return c.type && c.type !== 'NPC'
                  if (filterType === 'npc') return c.type === 'NPC' || !c.type
                  return true
                })
              }

              return filtered.length === 0 ? (
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
                {filtered.map((creature) => {
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
                  className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
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
                            setSelectedCreature(creature)
                            setShowEditModal(true)
                          }}
                          className="h-6 w-6 p-0 text-white hover:bg-accent"
                          title="Editar"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCreature(creature)
                            setShowDamageModal(true)
                          }}
                          className="h-6 w-6 p-0 text-yellow-400 hover:bg-yellow-900/30"
                          title="Dano/Cura"
                        >
                          ⚔️
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCreature(creature.id)
                          }}
                          className="h-6 w-6 p-0 text-red-400 hover:bg-destructive"
                          title="Remover"
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

      {/* Modais */}
      <CreateCreatureModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        campaignId={campaignId}
        onSuccess={loadCreatures}
      />
      {selectedCreature && (
        <>
          <EditCreatureModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            creature={selectedCreature}
            onSuccess={() => {
              loadCreatures()
              setSelectedCreature(null)
            }}
          />
          <ApplyDamageModal
            open={showDamageModal}
            onOpenChange={setShowDamageModal}
            target="creature"
            targetId={selectedCreature.id}
            currentStats={selectedCreature.stats || {}}
            onSuccess={() => {
              loadCreatures()
              setSelectedCreature(null)
            }}
          />
        </>
      )}
    </div>
  )
}


import { useState, useEffect, useMemo, memo } from 'react'
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
import { supabase } from '@/integrations/supabase/client'
import { CreateCreatureModal } from './CreateCreatureModal'
import { EditCreatureModal } from './EditCreatureModal'
import { ApplyDamageModal } from './ApplyDamageModal'
import { ApplyConditionModal } from './ApplyConditionModal'
import { NPCsPanel } from './NPCsPanel'
import { SearchAndFilters } from './SearchAndFilters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatureCard } from './CreatureCard'

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
   * Filtrar criaturas (memoizado)
   */
  const filteredCreatures = useMemo(() => {
    let result = creatures
    
    if (searchValue) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        c.type?.toLowerCase().includes(searchValue.toLowerCase())
      )
    }
    
    if (filterType !== 'all') {
      result = result.filter((c) => {
        if (filterType === 'creature') return c.type && c.type !== 'NPC'
        if (filterType === 'npc') return c.type === 'NPC' || !c.type
        return true
      })
    }
    
    return result
  }, [creatures, searchValue, filterType])

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
            {filteredCreatures.length === 0 ? (
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
                {filteredCreatures.map((creature) => (
                  <CreatureCard
                    key={creature.id}
                    creature={creature}
                    onEdit={(c) => {
                      setSelectedCreature(c)
                      setShowEditModal(true)
                    }}
                    onDelete={handleDeleteCreature}
                    onDamage={(c) => {
                      setSelectedCreature(c)
                      setShowDamageModal(true)
                    }}
                    onCondition={(c) => {
                      setSelectedCreature(c)
                      setShowConditionModal(true)
                    }}
                  />
                ))}
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
      </Tabs>

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


// @ts-nocheck
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Item } from '@/types/item'
import { Ability } from '@/types/ability'
import { logger } from '@/utils/logger'

/**
 * Painel de NPCs com Tabs
 * Equipamentos, Itens, Habilidades, Magias
 */
interface NPCsPanelProps {
  campaignId?: string
}

export function NPCsPanel({ campaignId }: NPCsPanelProps) {
  const [items, setItems] = useState<Item[]>([])
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para modais de itens
  const [createItemModalOpen, setCreateItemModalOpen] = useState(false)
  const [editItemModalOpen, setEditItemModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [itemModalType, setItemModalType] = useState<'equipment' | 'item'>('item')
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false)
  
  // Estados para modais de habilidades
  const [createAbilityModalOpen, setCreateAbilityModalOpen] = useState(false)
  const [editAbilityModalOpen, setEditAbilityModalOpen] = useState(false)
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null)

  useEffect(() => {
    if (campaignId) {
      loadItems()
      loadAbilities()
    }
  }, [campaignId])

  /**
   * Carrega itens da campanha
   */
  const loadItems = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/items?campaignId=${campaignId}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar itens:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega habilidades da campanha
   */
  const loadAbilities = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/abilities?campaignId=${campaignId}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAbilities(data || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar habilidades:', error)
    }
  }

  /**
   * Remove item
   */
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        loadItems()
      }
    } catch (error) {
      logger.error('Erro ao remover item:', error)
      alert('Erro ao remover item. Tente novamente.')
    }
  }

  /**
   * Remove habilidade
   */
  const handleDeleteAbility = async (abilityId: string) => {
    if (!confirm('Tem certeza que deseja remover esta habilidade?')) return

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/abilities/${abilityId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        loadAbilities()
      }
    } catch (error) {
      logger.error('Erro ao remover habilidade:', error)
      alert('Erro ao remover habilidade. Tente novamente.')
    }
  }

  // Separar itens em equipamentos e itens gerais
  const equipments = items.filter((item) => item.type === 'equipment' || item.type === 'weapon')
  const generalItems = items.filter((item) => item.type !== 'equipment' && item.type !== 'weapon')

  if (loading) {
    return <div className="text-text-secondary text-sm">Carregando...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-white font-semibold text-lg mb-4">NPCs</h2>
      
      <Tabs defaultValue="equipments" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="abilities">Habilidades</TabsTrigger>
          <TabsTrigger value="magics">Magias</TabsTrigger>
        </TabsList>

        {/* Tab Equipamentos */}
        <TabsContent value="equipments" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => setEquipmentModalOpen(true)}
              className="w-full mb-2 bg-primary hover:bg-primary/90"
            >
              <Package className="w-4 h-4 mr-2" />
              Abrir Modal de Equipamentos
            </Button>
            {equipments.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8">
                Nenhum equipamento criado
              </div>
            ) : (
              equipments.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-text-secondary text-xs mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          logger.debug('Editar item:', item)
                          setSelectedItem(item)
                          setEditItemModalOpen(true)
                        }}
                        aria-label={`Editar item ${item.name}`}
                        className="h-6 w-6 p-0 text-white hover:bg-accent"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:bg-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logger.debug('Criar novo equipamento')
                setItemModalType('equipment')
                setCreateItemModalOpen(true)
              }}
              className="w-full mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Equipamento
            </Button>
          </div>
        </TabsContent>

        {/* Tab Itens */}
        <TabsContent value="items" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-2">
            {generalItems.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8">
                Nenhum item criado
              </div>
            ) : (
              generalItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-text-secondary text-xs mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          logger.debug('Editar item:', item)
                          setSelectedItem(item)
                          setEditItemModalOpen(true)
                        }}
                        aria-label={`Editar item ${item.name}`}
                        className="h-6 w-6 p-0 text-white hover:bg-accent"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:bg-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // TODO: Criar novo item
                logger.debug('Criar item')
                setItemModalType('item')
                setCreateItemModalOpen(true)
              }}
              className="w-full mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </TabsContent>

        {/* Tab Habilidades */}
        <TabsContent value="abilities" className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-2">
            {abilities.length === 0 ? (
              <div className="text-text-secondary text-sm text-center py-8">
                Nenhuma habilidade criada
              </div>
            ) : (
              abilities.map((ability) => (
                <Card
                  key={ability.id}
                  className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{ability.name}</h3>
                      {ability.description && (
                        <p className="text-text-secondary text-xs mt-1">
                          {ability.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          logger.debug('Editar habilidade:', ability)
                          setSelectedAbility(ability)
                          setEditAbilityModalOpen(true)
                        }}
                        aria-label={`Editar habilidade ${ability.name}`}
                        className="h-6 w-6 p-0 text-white hover:bg-accent"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAbility(ability.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:bg-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logger.debug('Criar nova habilidade')
                setCreateAbilityModalOpen(true)
              }}
              className="w-full mt-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Habilidade
            </Button>
          </div>
        </TabsContent>

        {/* Tab Magias */}
        <TabsContent value="magics" className="flex-1 overflow-y-auto mt-4">
          <div className="text-text-secondary text-sm text-center py-8">
            Magias/Rituais (em desenvolvimento)
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Equipamentos */}
      {campaignId && (
        <EquipmentModal
          open={equipmentModalOpen}
          onOpenChange={setEquipmentModalOpen}
          campaignId={campaignId}
        />
      )}
    </div>
  )
}


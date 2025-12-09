// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, ChevronDown, ChevronUp, Edit, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { Item } from '@/types/item'
import { CreateItemModal } from '@/components/master/CreateItemModal'
import { EditItemModal } from '@/components/master/EditItemModal'
import { AppError } from '@/types/common'
import { logger } from '@/utils/logger'

interface EquipmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
}

/**
 * Mapeamento de raridade para labels e cores
 */
const RARITY_LABELS: Record<string, { label: string; color: string }> = {
  common: { label: 'Comum', color: 'bg-gray-500' },
  uncommon: { label: 'Incomum', color: 'bg-green-500' },
  rare: { label: 'Raro', color: 'bg-blue-500' },
  epic: { label: 'Épico', color: 'bg-purple-500' },
  legendary: { label: 'Lendário', color: 'bg-orange-500' },
}

/**
 * Modal dedicado para visualizar e gerenciar equipamentos da campanha
 */
export function EquipmentModal({
  open,
  onOpenChange,
  campaignId,
}: EquipmentModalProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const toast = useToast()

  /**
   * Carrega equipamentos da campanha
   */
  const loadEquipment = async () => {
    if (!campaignId) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/items?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar equipamentos')
      }

      const data = await response.json()
      // Filtrar apenas equipamentos
      const equipment = (data || []).filter(
        (item: Item) =>
          item.type === 'equipment' ||
          item.type === 'weapon' ||
          item.type === 'armor' ||
          item.type === 'accessory'
      )
      setItems(equipment)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao carregar equipamentos')
      toast.error('Erro ao carregar equipamentos', err.message || 'Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega equipamentos quando o modal abre
   */
  useEffect(() => {
    if (open && campaignId) {
      loadEquipment()
      setSearchQuery('')
      setExpandedItems(new Set())
    }
  }, [open, campaignId])

  /**
   * Filtra equipamentos baseado na busca
   */
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  /**
   * Alterna expansão de um card
   */
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  /**
   * Abre modal de edição
   */
  const handleEdit = (item: Item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  /**
   * Deleta equipamento
   */
  const handleDelete = async (item: Item) => {
    if (!confirm(`Tem certeza que deseja deletar "${item.name}"?`)) {
      return
    }

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar equipamento')
      }

      toast.success('Equipamento deletado', `${item.name} foi removido com sucesso.`)
      loadEquipment()
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao deletar equipamento')
      toast.error('Erro ao deletar equipamento', err.message || 'Tente novamente.')
    }
  }

  /**
   * Handler após criar item
   */
  const handleCreateSuccess = () => {
    loadEquipment()
    setShowCreateModal(false)
  }

  /**
   * Handler após editar item
   */
  const handleEditSuccess = () => {
    loadEquipment()
    setShowEditModal(false)
    setSelectedItem(null)
  }

  /**
   * Obtém label e cor da raridade
   */
  const getRarityInfo = (rarity?: string) => {
    if (!rarity) return { label: 'Sem raridade', color: 'bg-gray-500' }
    return RARITY_LABELS[rarity] || { label: rarity, color: 'bg-gray-500' }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-background border-card-secondary text-white max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Equipamentos
            </DialogTitle>
          </DialogHeader>

          {/* Header com busca e botão novo */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Buscar equipamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border-white/20 text-white pl-10"
              />
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </Button>
          </div>

          {/* Lista de equipamentos */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                {searchQuery
                  ? 'Nenhum equipamento encontrado'
                  : 'Nenhum equipamento criado ainda'}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const isExpanded = expandedItems.has(item.id)
                  const rarityInfo = getRarityInfo(item.attributes?.rarity as string || item.type)

                  return (
                    <Card
                      key={item.id}
                      className="bg-card-secondary border-card-secondary hover:border-accent transition-colors"
                    >
                      <CardContent className="p-4">
                        {/* Header do card */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white text-sm truncate flex-1">
                            {item.name || 'Sem nome'}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(item.id)}
                            className="w-6 h-6 p-0 hover:bg-accent/20"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {/* Conteúdo expandido */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3 animate-in fade-in-50">
                            {/* Raridade */}
                            {item.attributes?.rarity && (
                              <div>
                                <Badge
                                  className={`${rarityInfo.color} text-white text-xs`}
                                >
                                  {rarityInfo.label}
                                </Badge>
                              </div>
                            )}

                            {/* Descrição */}
                            {item.description && (
                              <p className="text-sm text-text-secondary">
                                {item.description}
                              </p>
                            )}

                            {/* Tipo */}
                            {item.type && (
                              <p className="text-xs text-text-secondary">
                                Tipo: <span className="text-white">{item.type}</span>
                              </p>
                            )}

                            {/* Ações */}
                            <div className="flex gap-2 pt-2 border-t border-card-secondary">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="flex-1 hover:bg-accent/20"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item)}
                                className="flex-1 hover:bg-destructive/20 text-destructive"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Deletar
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de criar */}
      <CreateItemModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        campaignId={campaignId}
        itemType="equipment"
        onSuccess={handleCreateSuccess}
      />

      {/* Modal de editar */}
      {selectedItem && (
        <EditItemModal
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open)
            if (!open) setSelectedItem(null)
          }}
          item={selectedItem}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}


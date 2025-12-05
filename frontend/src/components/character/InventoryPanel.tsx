import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { AddItemModal } from './AddItemModal'
import { Character, CharacterInventoryItem } from '@/types/character'

interface InventoryPanelProps {
  character: Character
  onUpdate: () => void
}

/**
 * Painel de inventário do personagem
 * Exibe itens, peso total e moedas
 */
export function InventoryPanel({ character, onUpdate }: InventoryPanelProps) {
  const [inventory, setInventory] = useState<CharacterInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loadInfo, setLoadInfo] = useState<{
    currentLoad: number
    maxLoad: number
    isOverloaded: boolean
    remaining: number
  } | null>(null)

  useEffect(() => {
    if (character?.id) {
      loadInventory()
      loadLoadInfo()
    }
  }, [character?.id])

  /**
   * Carrega inventário do personagem
   */
  const loadInventory = async () => {
    try {
      if (!character?.id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/inventory`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      }
    } catch (error) {
      console.error('Erro ao carregar inventário:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Carrega informações de carga do personagem
   */
  const loadLoadInfo = async () => {
    try {
      if (!character?.id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/load`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setLoadInfo(data)
      }
    } catch (error) {
      console.error('Erro ao carregar carga:', error)
    }
  }

  /**
   * Remove item do inventário
   */
  const handleRemoveItem = async (itemId: string) => {
    try {
      if (!character?.id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/inventory/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        loadInventory()
        loadLoadInfo()
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
      alert('Erro ao remover item. Tente novamente.')
    }
  }

  /**
   * Calcula peso total
   */
  const totalWeight = inventory.reduce((sum, item) => {
    return sum + (item.item?.weight || 0) * (item.quantity || 1)
  }, 0)

  if (loading) {
    return <div className="text-muted-foreground">Carregando inventário...</div>
  }

  // Calcular capacidade máxima (5 * FOR, mínimo 2)
  const attributes = character.attributes || {}
  const forAttr = attributes.for || 0
  const calculatedMaxLoad = Math.max(5 * forAttr, 2)
  const maxLoad = loadInfo?.maxLoad || calculatedMaxLoad
  const currentLoad = loadInfo?.currentLoad || totalWeight
  const isOverloaded = loadInfo?.isOverloaded || currentLoad > maxLoad
  const loadPercentage = maxLoad > 0 ? Math.min((currentLoad / maxLoad) * 100, 100) : 0

  return (
    <div className="space-y-4">
      {/* Carga e Moedas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Carga</Label>
            {isOverloaded && (
              <span className="text-red-400 text-xs font-semibold">SOBRECARREGADO</span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">
                {currentLoad.toFixed(1)} / {maxLoad} kg
              </span>
              <span className={`text-sm ${isOverloaded ? 'text-red-400' : 'text-green-400'}`}>
                {loadInfo?.remaining !== undefined ? `${loadInfo.remaining.toFixed(1)} restantes` : ''}
              </span>
            </div>
            {/* Barra de progresso */}
            <div className="w-full bg-card-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isOverloaded
                    ? 'bg-red-500'
                    : loadPercentage > 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
              />
            </div>
            {isOverloaded && (
              <div className="text-xs text-red-400 mt-1">
                Penalidades: -5 em testes de FOR/AGI/VIG, -3m em Deslocamento
              </div>
            )}
          </div>
        </div>
        <div>
          <Label className="text-muted-foreground">Moedas</Label>
          <div className="text-lg font-bold text-white">
            {character.coins || 0} C
          </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-white font-semibold">Itens</Label>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        </div>

        <AddItemModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          characterId={character.id}
          campaignId={character.campaign_id}
          onSuccess={() => {
            loadInventory()
            loadLoadInfo()
            onUpdate()
          }}
        />

        {inventory.length === 0 ? (
          <div className="text-muted-foreground text-sm text-center py-4">
            Nenhum item no inventário
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-muted/50 rounded p-2"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {item.item?.name || 'Item sem nome'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Quantidade: {item.quantity} | Peso: {(item.item?.weight || 0) * (item.quantity || 1)} kg
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveItem(item.item_id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


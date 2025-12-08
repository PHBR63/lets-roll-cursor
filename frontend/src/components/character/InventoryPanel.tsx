import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Trash2, Plus } from 'lucide-react'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { supabase } from '@/integrations/supabase/client'
import { AddItemModal } from './AddItemModal'
import { useCarryCapacity } from '@/hooks/useCarryCapacity'
import { useToast } from '@/hooks/useToast'
import { Character, CharacterInventoryItem } from '@/types/character'
import { Attributes } from '@/types/ordemParanormal'

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
  const toast = useToast()

  // Converter attributes para formato Attributes
  const attributes: Attributes = useMemo(
    () => ({
      agi: character.attributes?.agi || 0,
      for: character.attributes?.for || 0,
      int: character.attributes?.int || 0,
      pre: character.attributes?.pre || 0,
      vig: character.attributes?.vig || 0,
    }),
    [character.attributes]
  )

  // Calcular peso total
  const totalWeight = useMemo(() => {
    return inventory.reduce((sum, item) => {
      return sum + (item.item?.weight || 0) * (item.quantity || 1)
    }, 0)
  }, [inventory])

  // Hook para capacidade de carga
  const { maxCapacity, overloaded, capacityPercentage } = useCarryCapacity(attributes, totalWeight)

  useEffect(() => {
    if (character?.id) {
      loadInventory()
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
        onUpdate()
        
        // Verificar sobrecarga após remover item
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        try {
          await fetch(`${apiUrl}/api/characters/${character.id}/inventory/check-overload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          })
        } catch (err) {
          // Ignorar erro de verificação de sobrecarga
        }
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
      toast.error('Erro ao remover item', 'Tente novamente.')
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Carregando inventário...</div>
  }

  return (
    <div className="space-y-4">
      {/* Peso e Moedas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Peso Total</Label>
            {overloaded && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sobrecarregado
              </Badge>
            )}
          </div>
          <div className="text-lg font-bold text-white">
            {totalWeight.toFixed(1)} / {maxCapacity} kg
          </div>
          <AnimatedProgress
            value={capacityPercentage}
            max={100}
            color={overloaded ? 'red' : capacityPercentage > 80 ? 'yellow' : 'green'}
            className="h-2"
          />
          {overloaded && (
            <p className="text-xs text-red-400">
              Penalidades: -5 em testes FOR/AGI/VIG, -3m deslocamento
            </p>
          )}
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


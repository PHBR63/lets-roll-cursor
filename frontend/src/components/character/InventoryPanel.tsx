import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface InventoryPanelProps {
  character: any
  onUpdate: () => void
}

/**
 * Painel de inventário do personagem
 * Exibe itens, peso total e moedas
 */
export function InventoryPanel({ character, onUpdate }: InventoryPanelProps) {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-4">
      {/* Peso e Moedas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground">Peso Total</Label>
          <div className="text-lg font-bold text-white">
            {totalWeight} / {character.carryCapacity || 0} kg
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
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Item
          </Button>
        </div>

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


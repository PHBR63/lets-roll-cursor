import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'

interface AddItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  characterId: string
  campaignId?: string
  onSuccess: () => void
}

/**
 * Modal para adicionar itens ao inventário do personagem
 */
export function AddItemModal({
  open,
  onOpenChange,
  characterId,
  campaignId,
  onSuccess,
}: AddItemModalProps) {
  const [items, setItems] = useState<Array<{ id: string; name: string; description?: string; weight?: number }>>([])
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    if (open) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId])

  /**
   * Carrega itens disponíveis da campanha
   */
  const loadItems = async () => {
    setLoadingItems(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      let url = `${apiUrl}/api/items`
      if (campaignId) {
        url += `?campaignId=${campaignId}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  /**
   * Adiciona item ao inventário
   */
  const handleAddItem = async () => {
    if (!selectedItemId || !characterId || quantity < 1) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${characterId}/inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            itemId: selectedItemId,
            quantity,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        throw new Error(errorData.error || 'Erro ao adicionar item')
      }

      onSuccess()
      setSelectedItemId('')
      setQuantity(1)
      onOpenChange(false)

      // Verificar sobrecarga após adicionar item
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      try {
        await fetch(`${apiUrl}/api/characters/${characterId}/inventory/check-overload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        })
      } catch (err) {
        // Ignorar erro de verificação de sobrecarga
      }
    } catch (error: unknown) {
      const err = error as Error
      console.error('Erro ao adicionar item:', error)
      alert(err.message || 'Erro ao adicionar item. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const selectedItem = items.find((item) => item.id === selectedItemId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item ao Inventário</DialogTitle>
          <DialogDescription>
            Selecione um item da biblioteca da campanha para adicionar ao inventário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loadingItems ? (
            <div className="text-center py-4 text-muted-foreground">
              Carregando itens...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Item</Label>
                <Select
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.length === 0 ? (
                      <SelectItem value="" disabled>
                        Nenhum item disponível
                      </SelectItem>
                    ) : (
                      items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} {item.weight ? `(${item.weight}kg)` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedItem && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedItem.description || 'Sem descrição'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              {selectedItem && (
                <div className="bg-muted/50 rounded p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso unitário:</span>
                    <span className="text-white">{selectedItem.weight || 0} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso total:</span>
                    <span className="text-white font-semibold">
                      {(selectedItem.weight || 0) * quantity} kg
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={!selectedItemId || loading || loadingItems}
          >
            {loading ? 'Adicionando...' : 'Adicionar Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


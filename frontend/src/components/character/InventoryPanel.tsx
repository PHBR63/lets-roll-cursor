import { useState, useEffect, useMemo, ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Trash2, Plus, Package } from 'lucide-react'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { supabase } from '@/integrations/supabase/client'
import { AddItemModal } from './AddItemModal'
import { EquipmentModal } from '@/components/items/EquipmentModal'
import { useCarryCapacity } from '@/hooks/useCarryCapacity'
import { useToast } from '@/hooks/useToast'
import { Character, CharacterInventoryItem } from '@/types/character'
import { Attributes } from '@/types/ordemParanormal'

interface InventoryPanelProps {
  character: Character
  onUpdate: () => void
}

export function InventoryPanel({ character, onUpdate }: InventoryPanelProps) {
  const AlertCircleIcon = AlertCircle as ElementType
  const Trash2Icon = Trash2 as ElementType
  const PlusIcon = Plus as ElementType
  const PackageIcon = Package as ElementType
  const [inventory, setInventory] = useState<CharacterInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const toast = useToast()

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

  const totalWeight = useMemo(() => {
    return inventory.reduce((sum, item) => {
      return sum + (item.item?.weight || 0) * (item.quantity || 1)
    }, 0)
  }, [inventory])

  const { maxCapacity, overloaded, capacityPercentage } = useCarryCapacity(attributes, totalWeight)

  useEffect(() => {
    if (character?.id) {
      loadInventory()
    }
  }, [character?.id])

  const loadInventory = async () => {
    try {
      if (!character?.id) return
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/inventory`,
        { headers: { Authorization: `Bearer ${session.session.access_token}` } }
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
          headers: { Authorization: `Bearer ${session.session.access_token}` },
        }
      )

      if (response.ok) {
        loadInventory()
        onUpdate()
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        try {
          await fetch(`${apiUrl}/api/characters/${character.id}/inventory/check-overload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.session.access_token}` },
          })
        } catch { /* Ignore */ }
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
      toast.error('Erro ao remover item', { description: 'Tente novamente.' })
    }
  }

  if (loading) {
    return <div className="text-zinc-400 text-sm">Carregando inventário...</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-base font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          Inventário
          <span className="text-xs font-normal text-zinc-400 normal-case tracking-normal">
            (Peso: {totalWeight.toFixed(1)}/{maxCapacity} kg)
          </span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-full hover:bg-white/10 text-white"
          onClick={() => setShowAddModal(true)}
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="panel p-4 space-y-4">
        {/* Barras e Moedas */}
        <div className="grid grid-cols-1 gap-2">
          {/* Barra de Carga */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Carga</span>
              <span>{Math.round(capacityPercentage)}%</span>
            </div>
            <AnimatedProgress
              value={capacityPercentage}
              max={100}
              color={overloaded ? 'red' : capacityPercentage > 80 ? 'yellow' : 'green'}
              className="h-1.5 bg-black/40"
            />
            {overloaded && (
              <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1">
                <AlertCircleIcon className="w-3 h-3" />
                <span>Penalidade: -5 FOR/AGI/VIG, -3m desl.</span>
              </div>
            )}
          </div>

          {/* Coin: 1300 C */}
          <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2 mt-2">
            <span className="text-zinc-300">Coin:</span>
            <span className="font-bold text-white underline decoration-dashed underline-offset-4 decoration-zinc-600 cursor-help" title="Crédito">{character.coins || 0} C</span>
          </div>
        </div>

        {/* Lista simples */}
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
          {inventory.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-4 italic">Vazio...</div>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Trash2Icon
                    className="w-3 h-3 text-red-900/0 group-hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                    onClick={() => handleRemoveItem(item.item_id)}
                  />
                  <span className="truncate text-zinc-300 group-hover:text-white transition-colors cursor-pointer decoration-dotted hover:underline">
                    {item.item?.name || '???'}
                    {item.quantity > 1 && <span className="text-xs text-zinc-500 ml-1">x{item.quantity}</span>}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {(item.item?.weight || 0).toFixed(1)}
                </span>
              </div>
            ))
          )}
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
        {character.campaign_id && (
          <EquipmentModal
            open={showEquipmentModal}
            onOpenChange={setShowEquipmentModal}
            campaignId={character.campaign_id}
          />
        )}
      </div>
    </div>
  )
}

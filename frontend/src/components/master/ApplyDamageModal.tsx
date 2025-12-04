import { useState } from 'react'
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

interface ApplyDamageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: 'creature' | 'character'
  targetId: string
  currentStats: {
    pv?: { current: number; max: number }
    san?: { current: number; max: number }
    vida?: { current: number; max: number }
    saude?: { current: number; max: number }
  }
  onSuccess: () => void
}

/**
 * Modal para aplicar dano/cura em criaturas ou personagens
 */
export function ApplyDamageModal({
  open,
  onOpenChange,
  target,
  targetId,
  currentStats,
  onSuccess,
}: ApplyDamageModalProps) {
  const [damageType, setDamageType] = useState<'physical' | 'mental' | 'heal'>('physical')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  /**
   * Aplica dano/cura
   */
  const handleApply = async () => {
    if (amount === 0) {
      alert('Valor deve ser diferente de zero')
      return
    }

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      if (target === 'character') {
        // Aplicar dano/cura em personagem
        const endpoint = damageType === 'heal'
          ? `/api/characters/${targetId}/pv`
          : damageType === 'physical'
          ? `/api/characters/${targetId}/apply-damage`
          : `/api/characters/${targetId}/apply-damage`

        const body = damageType === 'heal'
          ? { value: amount }
          : {
              type: damageType === 'physical' ? 'physical' : 'mental',
              amount: amount,
            }

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: damageType === 'heal' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao aplicar dano/cura')
        }
      } else {
        // Aplicar dano/cura em criatura
        const stats = currentStats
        const vida = stats.vida || stats.pv || { current: 0, max: 0 }
        
        let newCurrent = vida.current
        if (damageType === 'heal') {
          newCurrent = Math.min(vida.current + amount, vida.max)
        } else {
          newCurrent = Math.max(0, vida.current - amount)
        }

        const response = await fetch(`${apiUrl}/api/creatures/${targetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            stats: {
              ...stats,
              vida: {
                current: newCurrent,
                max: vida.max,
              },
            },
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao aplicar dano/cura')
        }
      }

      onSuccess()
      onOpenChange(false)
      setAmount(0)
    } catch (error: unknown) {
      const err = error as AppError
      console.error('Erro ao aplicar dano/cura:', error)
      alert(err.message || 'Erro ao aplicar dano/cura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const currentValue = damageType === 'physical' || damageType === 'heal'
    ? (currentStats.pv?.current || currentStats.vida?.current || 0)
    : (currentStats.san?.current || currentStats.saude?.current || 0)

  const maxValue = damageType === 'physical' || damageType === 'heal'
    ? (currentStats.pv?.max || currentStats.vida?.max || 0)
    : (currentStats.san?.max || currentStats.saude?.max || 0)

  const newValue = damageType === 'heal'
    ? Math.min(currentValue + amount, maxValue)
    : Math.max(0, currentValue - amount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Aplicar Dano/Cura</DialogTitle>
          <DialogDescription>
            Aplique dano físico, mental ou cura em {target === 'character' ? 'personagem' : 'criatura'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={damageType} onValueChange={(v: string) => setDamageType(v)}>
              <SelectTrigger className="bg-input border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Dano Físico (PV/Vida)</SelectItem>
                <SelectItem value="mental">Dano Mental (SAN/Saúde)</SelectItem>
                <SelectItem value="heal">Cura (PV/Vida)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              placeholder="Quantidade"
              className="bg-input border-white/20"
            />
          </div>

          <div className="bg-card-secondary p-3 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Valor Atual:</span>
              <span className="text-white">{currentValue}/{maxValue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Novo Valor:</span>
              <span className={`font-semibold ${newValue <= 0 ? 'text-red-400' : newValue >= maxValue ? 'text-green-400' : 'text-white'}`}>
                {newValue}/{maxValue}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={loading || amount === 0}>
            {loading ? 'Aplicando...' : 'Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


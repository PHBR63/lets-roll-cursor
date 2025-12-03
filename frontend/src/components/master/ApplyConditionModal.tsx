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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { ALL_CONDITIONS } from '@/types/ordemParanormal'

interface ApplyConditionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: 'creature' | 'character'
  targetId: string
  currentConditions?: string[]
  onSuccess: () => void
}

/**
 * Modal para aplicar condições em criaturas ou personagens
 */
export function ApplyConditionModal({
  open,
  onOpenChange,
  target,
  targetId,
  currentConditions = [],
  onSuccess,
}: ApplyConditionModalProps) {
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [loading, setLoading] = useState(false)

  /**
   * Aplica condição
   */
  const handleApply = async () => {
    if (!selectedCondition) {
      alert('Selecione uma condição')
      return
    }

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      if (target === 'character') {
        // Aplicar condição em personagem
        const response = await fetch(
          `${apiUrl}/api/characters/${targetId}/apply-condition`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.session.access_token}`,
            },
            body: JSON.stringify({
              condition: selectedCondition,
            }),
          }
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao aplicar condição')
        }
      } else {
        // Para criaturas, precisaríamos de uma API similar
        // Por enquanto, apenas mostra mensagem
        alert('Aplicação de condições em criaturas será implementada em breve')
        setLoading(false)
        return
      }

      onSuccess()
      onOpenChange(false)
      setSelectedCondition('')
    } catch (error: any) {
      console.error('Erro ao aplicar condição:', error)
      alert(error.message || 'Erro ao aplicar condição. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Remove condição
   */
  const handleRemove = async (condition: string) => {
    if (target !== 'character') {
      alert('Remoção de condições em criaturas será implementada em breve')
      return
    }

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${targetId}/conditions/${condition}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao remover condição')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao remover condição:', error)
      alert(error.message || 'Erro ao remover condição. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aplicar Condição</DialogTitle>
          <DialogDescription>
            Aplique ou remova condições em {target === 'character' ? 'personagem' : 'criatura'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Condições Ativas */}
          {currentConditions.length > 0 && (
            <div className="space-y-2">
              <Label>Condições Ativas</Label>
              <div className="flex flex-wrap gap-2">
                {currentConditions.map((condition) => (
                  <div
                    key={condition}
                    className="bg-card-secondary px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    <span className="text-white text-sm">{condition}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(condition)}
                      className="h-5 w-5 p-0 text-red-400 hover:bg-destructive"
                      disabled={loading}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selecionar Nova Condição */}
          <div className="space-y-2">
            <Label>Nova Condição</Label>
            <Select
              value={selectedCondition}
              onValueChange={setSelectedCondition}
            >
              <SelectTrigger className="bg-input border-white/20">
                <SelectValue placeholder="Selecione uma condição" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CONDITIONS.filter(
                  (cond) => !currentConditions.includes(cond)
                ).map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button
            onClick={handleApply}
            disabled={loading || !selectedCondition}
          >
            {loading ? 'Aplicando...' : 'Aplicar Condição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


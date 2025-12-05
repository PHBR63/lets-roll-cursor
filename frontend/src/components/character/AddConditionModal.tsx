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
import { Condition } from '@/types/ordemParanormal'
import { supabase } from '@/integrations/supabase/client'

interface AddConditionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  characterId: string
  currentConditions: Condition[]
  onSuccess: () => void
}

/**
 * Modal para adicionar condições ao personagem
 */
export function AddConditionModal({
  open,
  onOpenChange,
  characterId,
  currentConditions,
  onSuccess,
}: AddConditionModalProps) {
  const [selectedCondition, setSelectedCondition] = useState<Condition | ''>('')
  const [loading, setLoading] = useState(false)

  /**
   * Lista completa de condições disponíveis
   */
  const allConditions: Condition[] = [
    'CAIDO',
    'DESPREVENIDO',
    'ATORDADO',
    'INCONSCIENTE',
    'MORRENDO',
    'ABALADO',
    'APAVORADO',
    'PERTURBADO',
    'ENLOUQUECENDO',
    'LENTO',
    'IMOVEL',
    'PARALISADO',
    'AGARRADO',
    'ENREDADO',
    'CEGO',
    'SURDO',
    'ENJOADO',
    'NAUSEA',
    'DOENTE',
    'ENVENENADO',
    'FRACO',
    'DEBILITADO',
    'ESMORECIDO',
    'FRUSTRADO',
    'EXAUSTO',
    'FADIGADO',
    'SANGRANDO',
    'EM_CHAMAS',
    'FASCINADO',
    'INDEFESO',
  ]

  /**
   * Condições já ativas (não podem ser adicionadas novamente)
   */
  const availableConditions = allConditions.filter(
    (c) => !currentConditions.includes(c)
  )

  /**
   * Labels legíveis para condições
   */
  const conditionLabels: Record<Condition, string> = {
    CAIDO: 'Caído',
    DESPREVENIDO: 'Desprevenido',
    ATORDADO: 'Atordado',
    INCONSCIENTE: 'Inconsciente',
    MORRENDO: 'Morrendo',
    ABALADO: 'Abalado',
    APAVORADO: 'Apavorado',
    PERTURBADO: 'Perturbado',
    ENLOUQUECENDO: 'Enlouquecendo',
    LENTO: 'Lento',
    IMOVEL: 'Imóvel',
    PARALISADO: 'Paralisado',
    AGARRADO: 'Agarrado',
    ENREDADO: 'Enredado',
    CEGO: 'Cego',
    SURDO: 'Surdo',
    ENJOADO: 'Enjoado',
    NAUSEA: 'Náusea',
    DOENTE: 'Doente',
    ENVENENADO: 'Envenenado',
    FRACO: 'Fraco',
    DEBILITADO: 'Debilitado',
    ESMORECIDO: 'Esmorecido',
    FRUSTRADO: 'Frustrado',
    EXAUSTO: 'Exausto',
    FADIGADO: 'Fadigado',
    SANGRANDO: 'Sangrando',
    EM_CHAMAS: 'Em Chamas',
    FASCINADO: 'Fascinado',
    INDEFESO: 'Indefeso',
    SOBRECARREGADO: 'Sobrecarregado',
    VULNERAVEL: 'Vulnerável',
    MORTO: 'Morto',
  }

  /**
   * Aplica condição ao personagem
   */
  const handleApplyCondition = async () => {
    if (!selectedCondition || !characterId) return

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${characterId}/apply-condition`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ condition: selectedCondition }),
        }
      )

      if (!response.ok) throw new Error('Erro ao aplicar condição')

      onSuccess()
      setSelectedCondition('')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao aplicar condição:', error)
      alert('Erro ao aplicar condição. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Condição</DialogTitle>
          <DialogDescription>
            Selecione uma condição para aplicar ao personagem. Algumas condições
            podem aplicar outras automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Condição</Label>
            <Select
              value={selectedCondition}
              onValueChange={(value) => setSelectedCondition(value as Condition)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma condição" />
              </SelectTrigger>
              <SelectContent>
                {availableConditions.length === 0 ? (
                  <SelectItem value="" disabled>
                    Todas as condições já estão ativas
                  </SelectItem>
                ) : (
                  availableConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {conditionLabels[condition]}
                    </SelectItem>
                  ))
                )}
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
            onClick={handleApplyCondition}
            disabled={!selectedCondition || loading}
          >
            {loading ? 'Aplicando...' : 'Aplicar Condição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


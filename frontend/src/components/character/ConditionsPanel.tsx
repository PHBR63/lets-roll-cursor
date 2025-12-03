import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Condition } from '@/types/ordemParanormal'
import { AddConditionModal } from './AddConditionModal'

interface ConditionsPanelProps {
  character: any
  onUpdate: () => void
}

/**
 * Painel de condições do personagem
 * Exibe condições ativas e permite adicionar/remover
 */
export function ConditionsPanel({ character, onUpdate }: ConditionsPanelProps) {
  const conditions = character.conditions || []
  const [showAddModal, setShowAddModal] = useState(false)

  /**
   * Remove condição do personagem
   */
  const handleRemoveCondition = async (condition: Condition) => {
    try {
      if (!character?.id) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/characters/${character.id}/conditions/${condition}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Erro ao remover condição:', error)
      alert('Erro ao remover condição. Tente novamente.')
    }
  }

  /**
   * Mapeia condições para nomes legíveis
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
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Condições</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddModal(true)}
        >
          Adicionar Condição
        </Button>
      </div>

      <AddConditionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        characterId={character.id}
        currentConditions={conditions}
        onSuccess={onUpdate}
      />

      {conditions.length === 0 ? (
        <div className="text-muted-foreground text-sm text-center py-4">
          Nenhuma condição ativa
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition: Condition) => (
            <Badge
              key={condition}
              variant="destructive"
              className="flex items-center gap-1 px-3 py-1"
            >
              {conditionLabels[condition] || condition}
              <button
                onClick={() => handleRemoveCondition(condition)}
                className="ml-1 hover:bg-destructive/80 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}


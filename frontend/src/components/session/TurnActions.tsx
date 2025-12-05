import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useApiError } from '@/hooks/useApiError'
import { RefreshCw, Droplet } from 'lucide-react'
import { Character } from '@/types/character'

interface TurnActionsProps {
  character: Character | null
  onCharacterUpdate?: (character: Character) => void
}

/**
 * Componente para ações de turno (processar turno, estancar sangramento)
 */
export function TurnActions({ character, onCharacterUpdate }: TurnActionsProps) {
  const { user } = useAuth()
  const toast = useToast()
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const [processing, setProcessing] = useState(false)
  const [stoppingBleeding, setStoppingBleeding] = useState(false)

  if (!character) {
    return null
  }

  const conditions = character.conditions || []
  const hasBleeding = conditions.includes('SANGRANDO')
  const hasDying = conditions.includes('MORRENDO')
  const hasUnconscious = conditions.includes('INCONSCIENTE')
  const hasVulnerable = conditions.includes('VULNERAVEL')

  /**
   * Processa turno do personagem (aplica condições automáticas)
   */
  const handleProcessTurn = async () => {
    if (!character || !user) return

    setProcessing(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Sessão não encontrada')
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/characters/${character.id}/process-turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao processar turno')
        return
      }

      const result = await response.json()
      
      // Mostrar mudanças aplicadas
      if (result.changes && result.changes.length > 0) {
        toast.toast({
          title: 'Turno processado',
          description: result.changes.join(', '),
          variant: result.isDead ? 'destructive' : 'default',
        })
      }

      // Atualizar personagem
      if (result.character && onCharacterUpdate) {
        onCharacterUpdate(result.character)
      }

      if (result.isDead) {
        toast.toast({
          title: 'Personagem morreu',
          description: 'O personagem morreu após 3 rodadas em estado de Morrendo.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao processar turno')
    } finally {
      setProcessing(false)
    }
  }

  /**
   * Tenta estancar sangramento (teste de Vigor DT 20)
   */
  const handleStopBleeding = async () => {
    if (!character || !user) return

    setStoppingBleeding(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Sessão não encontrada')
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/characters/${character.id}/stop-bleeding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao estancar sangramento')
        return
      }

      const result = await response.json()
      
      toast.toast({
        title: result.success ? 'Sangramento estancado!' : 'Falha ao estancar',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      })

      // Atualizar personagem se sucesso
      if (result.success && result.character && onCharacterUpdate) {
        onCharacterUpdate(result.character)
      }
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao estancar sangramento')
    } finally {
      setStoppingBleeding(false)
    }
  }

  // Não mostrar se não houver condições automáticas ativas
  if (!hasBleeding && !hasDying && !hasUnconscious && !hasVulnerable) {
    return null
  }

  return (
    <div className="p-4 border-t border-card-secondary space-y-2">
      <div className="text-white text-sm font-semibold mb-2">Ações de Turno</div>
      
      {/* Processar Turno */}
      <Button
        onClick={handleProcessTurn}
        disabled={processing || hasUnconscious}
        className="w-full bg-accent hover:bg-accent/90"
        size="sm"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
        {processing ? 'Processando...' : 'Processar Turno'}
      </Button>

      {/* Estancar Sangramento */}
      {hasBleeding && (
        <Button
          onClick={handleStopBleeding}
          disabled={stoppingBleeding || hasUnconscious}
          className="w-full bg-red-600 hover:bg-red-700"
          size="sm"
          variant="destructive"
        >
          <Droplet className={`w-4 h-4 mr-2 ${stoppingBleeding ? 'animate-pulse' : ''}`} />
          {stoppingBleeding ? 'Tentando estancar...' : 'Estancar Sangramento'}
        </Button>
      )}

      {/* Avisos */}
      {hasDying && (
        <div className="text-red-500 text-xs mt-2 p-2 bg-red-900/20 rounded border border-red-500/50">
          ⚠️ Personagem está MORRENDO! Processe o turno para avançar o contador de rodadas.
        </div>
      )}

      {hasUnconscious && (
        <div className="text-yellow-500 text-xs mt-2 p-2 bg-yellow-900/20 rounded border border-yellow-500/50">
          ⚠️ Personagem está INCONSCIENTE e não pode realizar ações.
        </div>
      )}
    </div>
  )
}


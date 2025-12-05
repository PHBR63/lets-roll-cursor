import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { useApiError } from '@/hooks/useApiError'
import { Reload, Minus, Plus } from 'lucide-react'
import { AnimatedProgress } from '@/components/ui/animated-progress'

interface AmmunitionPanelProps {
  characterId: string
  sessionId: string
  isMaster?: boolean
}

/**
 * Painel de munição abstrata por cena
 * Sistema Ordem Paranormal: munição não é rastreada individualmente,
 * mas sim de forma abstrata (0-100, onde 100 = totalmente abastecido)
 */
export function AmmunitionPanel({ characterId, sessionId, isMaster }: AmmunitionPanelProps) {
  const { user } = useAuth()
  const toast = useToast()
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const [ammunition, setAmmunition] = useState<number>(100)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (characterId && sessionId) {
      loadAmmunition()
    }
  }, [characterId, sessionId])

  const loadAmmunition = async () => {
    try {
      if (!user) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/sessions/${sessionId}/ammunition/${characterId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao carregar munição')
        return
      }

      const data = await response.json()
      setAmmunition(data.ammunition || 100)
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao carregar munição')
    } finally {
      setLoading(false)
    }
  }

  const handleSpend = async (amount: number = 1) => {
    if (updating) return
    setUpdating(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/sessions/${sessionId}/ammunition/${characterId}/spend`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ amount }),
        }
      )

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao gastar munição')
        return
      }

      const data = await response.json()
      setAmmunition(data.ammunition)
      toast.toast({
        title: 'Munição gasta',
        description: `Munição reduzida em ${amount}. Restante: ${data.ammunition}%`,
      })
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao gastar munição')
    } finally {
      setUpdating(false)
    }
  }

  const handleReload = async (amount: number = 50) => {
    if (updating) return
    setUpdating(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/sessions/${sessionId}/ammunition/${characterId}/reload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ amount }),
        }
      )

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao recarregar munição')
        return
      }

      const data = await response.json()
      setAmmunition(data.ammunition)
      toast.toast({
        title: 'Munição recarregada',
        description: `Munição aumentada em ${amount}. Total: ${data.ammunition}%`,
      })
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao recarregar munição')
    } finally {
      setUpdating(false)
    }
  }

  const handleSetAmmunition = async (amount: number) => {
    if (updating || !isMaster) return
    setUpdating(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/sessions/${sessionId}/ammunition/${characterId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ amount }),
        }
      )

      if (!response.ok) {
        await handleResponseError(response, 'Erro ao definir munição')
        return
      }

      const data = await response.json()
      setAmmunition(data.ammunition)
      toast.toast({
        title: 'Munição definida',
        description: `Munição ajustada para ${data.ammunition}%`,
      })
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao definir munição')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-4">
        <div className="text-white text-sm">Carregando munição...</div>
      </div>
    )
  }

  const getAmmunitionColor = () => {
    if (ammunition >= 75) return 'green'
    if (ammunition >= 50) return 'yellow'
    if (ammunition >= 25) return 'orange'
    return 'red'
  }

  return (
    <div className="bg-card rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white font-semibold">Munição Abstrata</Label>
        <span className="text-white text-sm">
          {ammunition}%
        </span>
      </div>

      <AnimatedProgress
        value={ammunition}
        max={100}
        color={getAmmunitionColor()}
        className="h-3"
        duration={0.6}
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSpend(1)}
          disabled={updating || ammunition <= 0}
          className="flex-1"
        >
          <Minus className="w-4 h-4 mr-1" />
          Gastar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleReload(50)}
          disabled={updating || ammunition >= 100}
          className="flex-1"
        >
          <Reload className="w-4 h-4 mr-1" />
          Recarregar
        </Button>
      </div>

      {isMaster && (
        <div className="pt-2 border-t border-card-secondary">
          <Label className="text-text-secondary text-xs mb-2 block">
            Ajuste Manual (Mestre)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={ammunition}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0
                if (value >= 0 && value <= 100) {
                  setAmmunition(value)
                }
              }}
              onBlur={(e) => {
                const value = parseInt(e.target.value) || 0
                handleSetAmmunition(Math.max(0, Math.min(100, value)))
              }}
              className="w-20 text-center"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSetAmmunition(ammunition)}
              disabled={updating}
            >
              Definir
            </Button>
          </div>
        </div>
      )}

      <div className="text-text-secondary text-xs pt-2 border-t border-card-secondary">
        <p>
          Sistema abstrato: 100% = totalmente abastecido, 0% = sem munição.
          Gaste ao usar armas de fogo, recarregue entre cenas.
        </p>
      </div>
    </div>
  )
}


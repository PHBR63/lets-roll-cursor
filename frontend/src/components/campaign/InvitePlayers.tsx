import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'

/**
 * Modal para convidar jogadores para a campanha
 */
interface InvitePlayersProps {
  campaignId: string
  onClose: () => void
  onSuccess: () => void
}

export function InvitePlayers({
  campaignId,
  onClose,
  onSuccess,
}: InvitePlayersProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Função para enviar convite
   */
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email.trim()) {
        setError('Email é obrigatório')
        return
      }

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        setError('Sessão não encontrada')
        return
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/campaigns/${campaignId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ email }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao convidar jogador')
      }

      setEmail('')
      setError(null)
      onSuccess()
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Erro ao convidar jogador')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-background border-card-secondary">
        <DialogHeader>
          <DialogTitle className="text-white">Convidar Jogadores</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              E-mail do jogador
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jogador@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-white/20"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'

interface CreateCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId?: string
  onSuccess: () => void
}

/**
 * Modal para criar nova criatura/NPC
 */
export function CreateCreatureModal({
  open,
  onOpenChange,
  campaignId,
  onSuccess,
}: CreateCreatureModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [vidaMax, setVidaMax] = useState(10)
  const [energiaMax, setEnergiaMax] = useState(10)
  const [saudeMax, setSaudeMax] = useState(10)
  const [loading, setLoading] = useState(false)

  /**
   * Cria a criatura
   */
  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/creatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          campaignId,
          name,
          type: type || null,
          description: description || null,
          stats: {
            vida: { current: vidaMax, max: vidaMax },
            energia: { current: energiaMax, max: energiaMax },
            saude: { current: saudeMax, max: saudeMax },
          },
          isGlobal: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar criatura')
      }

      onSuccess()
      // Reset form
      setName('')
      setType('')
      setDescription('')
      setVidaMax(10)
      setEnergiaMax(10)
      setSaudeMax(10)
      onOpenChange(false)
    } catch (error: unknown) {
      const err = error as AppError
      console.error('Erro ao criar criatura:', error)
      alert(err.message || 'Erro ao criar criatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Criatura/NPC</DialogTitle>
          <DialogDescription>
            Adicione uma nova criatura ou NPC para a campanha.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da criatura"
              className="bg-input border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Zumbi, Vampiro, NPC"
              className="bg-input border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da criatura"
              className="bg-input border-white/20"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vida Máxima</Label>
              <Input
                type="number"
                min={1}
                value={vidaMax}
                onChange={(e) => setVidaMax(parseInt(e.target.value) || 10)}
                className="bg-input border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Energia Máxima</Label>
              <Input
                type="number"
                min={0}
                value={energiaMax}
                onChange={(e) => setEnergiaMax(parseInt(e.target.value) || 10)}
                className="bg-input border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Saúde Máxima</Label>
              <Input
                type="number"
                min={0}
                value={saudeMax}
                onChange={(e) => setSaudeMax(parseInt(e.target.value) || 10)}
                className="bg-input border-white/20"
              />
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
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'Criando...' : 'Criar Criatura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


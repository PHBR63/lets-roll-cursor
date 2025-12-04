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
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { Creature } from '@/types/creature'
import { AppError } from '@/types/common'

interface EditCreatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creature: Creature
  onSuccess: () => void
}

/**
 * Modal para editar criatura/NPC
 */
export function EditCreatureModal({
  open,
  onOpenChange,
  creature,
  onSuccess,
}: EditCreatureModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [vidaCurrent, setVidaCurrent] = useState(10)
  const [vidaMax, setVidaMax] = useState(10)
  const [energiaCurrent, setEnergiaCurrent] = useState(10)
  const [energiaMax, setEnergiaMax] = useState(10)
  const [saudeCurrent, setSaudeCurrent] = useState(10)
  const [saudeMax, setSaudeMax] = useState(10)
  const [exp, setExp] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (creature) {
      setName(creature.name || '')
      setType(creature.type || '')
      setDescription(creature.description || '')
      
      const stats = creature.stats || {}
      const vida = stats.vida || stats.pv || { current: 10, max: 10 }
      const energia = stats.energia || stats.pe || { current: 10, max: 10 }
      const saude = stats.saude || stats.san || { current: 10, max: 10 }
      const expValue = stats.exp || stats.nex || 0

      setVidaCurrent(vida.current || 0)
      setVidaMax(vida.max || 10)
      setEnergiaCurrent(energia.current || 0)
      setEnergiaMax(energia.max || 10)
      setSaudeCurrent(saude.current || 0)
      setSaudeMax(saude.max || 10)
      setExp(expValue)
    }
  }, [creature])

  /**
   * Atualiza a criatura
   */
  const handleUpdate = async () => {
    if (!name.trim()) {
      alert('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/creatures/${creature.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          name,
          type: type || null,
          description: description || null,
          stats: {
            vida: { current: vidaCurrent, max: vidaMax },
            energia: { current: energiaCurrent, max: energiaMax },
            saude: { current: saudeCurrent, max: saudeMax },
            exp: exp,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar criatura')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const err = error as AppError
      console.error('Erro ao atualizar criatura:', error)
      alert(err.message || 'Erro ao atualizar criatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Criatura/NPC</DialogTitle>
          <DialogDescription>
            Edite os dados e stats da criatura.
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

          {/* Stats */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-white font-semibold">Estatísticas</h3>
            
            {/* Vida */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vida Atual</Label>
                <Input
                  type="number"
                  min={0}
                  max={vidaMax}
                  value={vidaCurrent}
                  onChange={(e) => setVidaCurrent(parseInt(e.target.value) || 0)}
                  className="bg-input border-white/20"
                />
              </div>
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
            </div>

            {/* Energia */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Energia Atual</Label>
                <Input
                  type="number"
                  min={0}
                  max={energiaMax}
                  value={energiaCurrent}
                  onChange={(e) => setEnergiaCurrent(parseInt(e.target.value) || 0)}
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
            </div>

            {/* Saúde */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Saúde Atual</Label>
                <Input
                  type="number"
                  min={0}
                  max={saudeMax}
                  value={saudeCurrent}
                  onChange={(e) => setSaudeCurrent(parseInt(e.target.value) || 0)}
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

            {/* EXP */}
            <div className="space-y-2">
              <Label>EXP (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={exp}
                onChange={(e) => setExp(parseInt(e.target.value) || 0)}
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
          <Button onClick={handleUpdate} disabled={loading || !name.trim()}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


// @ts-nocheck
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { AppError } from '@/types/common'

interface EditAbilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ability: any
  onSuccess: () => void
}

/**
 * Modal para editar habilidade
 */
export function EditAbilityModal({
  open,
  onOpenChange,
  ability,
  onSuccess,
}: EditAbilityModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('active')
  const [loading, setLoading] = useState(false)

  // Preencher formulário quando habilidade mudar
  useEffect(() => {
    if (ability) {
      setName(ability.name || '')
      setDescription(ability.description || '')
      setType(ability.type || 'active')
    }
  }, [ability])

  /**
   * Atualiza a habilidade
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
      const response = await fetch(`${apiUrl}/api/abilities/${ability.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type: type || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar habilidade')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const err = error as AppError
      console.error('Erro ao atualizar habilidade:', error)
      alert(err.message || 'Erro ao atualizar habilidade. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!ability) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-card-secondary text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Habilidade</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Edite as informações da habilidade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Nome *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da habilidade"
              className="bg-input border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da habilidade"
              className="bg-input border-white/20 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">
              Tipo
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-input border-white/20 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="passive">Passiva</SelectItem>
                <SelectItem value="reaction">Reação</SelectItem>
                <SelectItem value="ritual">Ritual</SelectItem>
                <SelectItem value="spell">Magia</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-accent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || !name.trim()}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


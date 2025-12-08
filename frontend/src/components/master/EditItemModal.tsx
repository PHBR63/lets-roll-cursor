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

interface EditItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
  onSuccess: () => void
}

/**
 * Modal para editar item ou equipamento
 */
export function EditItemModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditItemModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [rarity, setRarity] = useState('common')
  const [loading, setLoading] = useState(false)

  // Preencher formulário quando item mudar
  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setDescription(item.description || '')
      setType(item.type || '')
      setRarity(item.rarity || 'common')
    }
  }, [item])

  /**
   * Atualiza o item
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
      const response = await fetch(`${apiUrl}/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          type: type || null,
          rarity: rarity || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar item')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const err = error as AppError
      console.error('Erro ao atualizar item:', error)
      alert(err.message || 'Erro ao atualizar item. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  const isEquipment = item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-card-secondary text-white max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEquipment ? 'Editar Equipamento' : 'Editar Item'}
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            {isEquipment
              ? 'Edite as informações do equipamento'
              : 'Edite as informações do item'}
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
              placeholder="Nome do item"
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
              placeholder="Descrição do item"
              className="bg-input border-white/20 text-white min-h-[80px]"
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
                {isEquipment ? (
                  <>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                    <SelectItem value="weapon">Arma</SelectItem>
                    <SelectItem value="armor">Armadura</SelectItem>
                    <SelectItem value="accessory">Acessório</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="consumable">Consumível</SelectItem>
                    <SelectItem value="tool">Ferramenta</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rarity" className="text-white">
              Raridade
            </Label>
            <Select value={rarity} onValueChange={setRarity}>
              <SelectTrigger className="bg-input border-white/20 text-white">
                <SelectValue placeholder="Selecione a raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="uncommon">Incomum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
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


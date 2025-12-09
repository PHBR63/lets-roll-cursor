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
import { Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/useToast'
import { CreateMomentData } from '@/types/moment'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { logger } from '@/utils/logger'
import { AppError } from '@/types/common'

interface CreateMomentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  sessionId?: string | null
  onCreate: (data: CreateMomentData) => Promise<void>
}

interface DiceRollOption {
  id: string
  formula: string
  result: number
  created_at: string
}

/**
 * Modal para criar novo momento da campanha
 */
export function CreateMomentModal({
  open,
  onOpenChange,
  campaignId,
  sessionId,
  onCreate,
}: CreateMomentModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [selectedDiceRollId, setSelectedDiceRollId] = useState<string>('')
  const [diceRolls, setDiceRolls] = useState<DiceRollOption[]>([])
  const [loadingRolls, setLoadingRolls] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  /**
   * Carrega últimas rolagens quando o modal abre
   */
  useEffect(() => {
    if (open && campaignId) {
      loadDiceRolls()
    } else {
      // Reset form quando fecha
      setTitle('')
      setDescription('')
      setImageUrl('')
      setSelectedDiceRollId('')
    }
  }, [open, campaignId])

  /**
   * Carrega últimas rolagens da campanha/sessão
   */
  const loadDiceRolls = async () => {
    setLoadingRolls(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = getApiBaseUrl()
      const url = new URL(`${apiUrl}/api/dice/history`)
      if (sessionId) url.searchParams.set('sessionId', sessionId)
      url.searchParams.set('campaignId', campaignId)
      url.searchParams.set('limit', '10')

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDiceRolls(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      logger.error({ error }, 'Erro ao carregar rolagens')
    } finally {
      setLoadingRolls(false)
    }
  }

  /**
   * Cria o momento
   */
  const handleCreate = async () => {
    if (!title.trim()) {
      toast.warning('Aviso', 'Título é obrigatório')
      return
    }

    setLoading(true)
    try {
      await onCreate({
        campaignId,
        sessionId: sessionId || null,
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        diceRollId: selectedDiceRollId || null,
      })

      toast.success('Momento criado', 'O momento foi criado com sucesso!')
      onOpenChange(false)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Erro ao criar momento')
      toast.error('Erro ao criar momento', err.message || 'Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-card-secondary text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Momento</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Crie um momento marcante da campanha
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vitória épica contra o dragão"
              className="bg-input border-white/20 text-white"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que aconteceu neste momento..."
              className="bg-input border-white/20 text-white min-h-[100px]"
            />
          </div>

          {/* URL da Imagem */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-white">
              URL da Imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="bg-input border-white/20 text-white"
            />
          </div>

          {/* Vincular Rolagem de Dados */}
          <div className="space-y-2">
            <Label htmlFor="diceRoll" className="text-white">
              Vincular Rolagem de Dados (opcional)
            </Label>
            {loadingRolls ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
              </div>
            ) : (
              <Select
                value={selectedDiceRollId}
                onValueChange={setSelectedDiceRollId}
              >
                <SelectTrigger className="bg-input border-white/20 text-white">
                  <SelectValue placeholder="Selecione uma rolagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {diceRolls.map((roll) => (
                    <SelectItem key={roll.id} value={roll.id}>
                      {roll.formula} = {roll.result}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {diceRolls.length === 0 && !loadingRolls && (
              <p className="text-xs text-text-secondary">
                Nenhuma rolagem recente disponível
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-accent"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !title.trim()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Momento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


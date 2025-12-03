import { useState, useEffect, useRef } from 'react'
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
import { Upload, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Campaign {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  system_rpg?: string | null
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface EditCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign
  onSuccess: () => void
}

/**
 * Modal para editar campanha
 */
export function EditCampaignModal({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: EditCampaignModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || campaign.title || '')
      setDescription(campaign.description || '')
      setImagePreview(campaign.image_url || null)
    }
  }, [campaign])

  /**
   * Handler para seleção de arquivo
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo: 10MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Remove imagem selecionada
   */
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Atualiza a campanha
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
      
      // Preparar FormData se houver imagem
      const formData = new FormData()
      formData.append('title', name)
      formData.append('description', description)
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch(`${apiUrl}/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar campanha')
      }

      onSuccess()
      onOpenChange(false)
      setImageFile(null)
    } catch (error: any) {
      console.error('Erro ao atualizar campanha:', error)
      alert(error.message || 'Erro ao atualizar campanha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
          <DialogDescription>
            Atualize as informações da campanha.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da campanha"
              className="bg-input border-white/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da campanha"
              className="bg-input border-white/20"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem</Label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-card-secondary"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {imagePreview ? 'Trocar Imagem' : 'Adicionar Imagem'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
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


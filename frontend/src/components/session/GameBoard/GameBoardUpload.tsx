// @ts-nocheck
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para upload de imagem do GameBoard
 */
export function GameBoardUpload() {
  const { state, setImageUrl, uploading, setUploading, fileInputRef } = useGameBoardContext()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true)

    try {
      const { supabase } = await import('@/integrations/supabase/client')
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        alert('Você precisa estar logado para fazer upload')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${session.session.user.id}-${Date.now()}.${fileExt}`
      const filePath = `game-boards/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        const localUrl = URL.createObjectURL(file)
        setImageUrl(localUrl)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('game-assets').getPublicUrl(filePath)

      setImageUrl(publicUrl)
    } catch (error) {
      const { logger } = await import('@/utils/logger')
      logger.error({ error }, 'Erro ao fazer upload')
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (state.imageUrl) {
    return (
      <div className="absolute top-4 right-4">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-card/80 backdrop-blur-sm text-white hover:bg-accent"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Enviando...' : 'Trocar Imagem'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-text-secondary text-lg mb-4">Cenário do RPG</span>
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-accent hover:bg-accent/90"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Enviando...' : 'Carregar Mapa/Imagem'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  )
}


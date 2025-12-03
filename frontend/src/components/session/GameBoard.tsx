import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, Upload, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

/**
 * Componente Game Board
 * Área central grande para exibir cenário/mapa do RPG
 * Funcionalidades: upload de imagem, zoom, drag para mover
 */
interface GameBoardProps {
  sessionId?: string
}

export function GameBoard({ sessionId }: GameBoardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [uploading, setUploading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionId) {
      loadBoardImage()
    }
  }, [sessionId])

  /**
   * Carrega imagem do board da sessão
   */
  const loadBoardImage = async () => {
    // TODO: Implementar carregamento de imagem da sessão do banco
    // Por enquanto, mantém placeholder
  }

  /**
   * Salva imagem do board na sessão
   */
  const saveBoardImage = async (url: string) => {
    // TODO: Implementar salvamento de URL da imagem na sessão
    // Por enquanto, apenas salva no estado local
  }

  /**
   * Handler para upload de imagem
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem')
      return
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo: 10MB')
      return
    }

    setUploading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        alert('Você precisa estar logado para fazer upload')
        return
      }

      // Upload para Supabase Storage
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
        // Se o bucket não existir, usar URL local temporária
        const localUrl = URL.createObjectURL(file)
        setImageUrl(localUrl)
        await saveBoardImage(localUrl)
        return
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('game-assets').getPublicUrl(filePath)

      setImageUrl(publicUrl)
      await saveBoardImage(publicUrl)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  /**
   * Handler para zoom in
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  /**
   * Handler para zoom out
   */
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  /**
   * Handler para resetar zoom e posição
   */
  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  /**
   * Handler para remover imagem
   */
  const handleRemoveImage = () => {
    setImageUrl(null)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  /**
   * Handler para iniciar drag
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  /**
   * Handler para mover durante drag
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageUrl) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  /**
   * Handler para finalizar drag
   */
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-card-secondary border-b border-card-secondary relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {imageUrl ? (
        <>
          {/* Imagem do mapa com zoom e drag */}
          <div
            className="absolute inset-0 cursor-move"
            onMouseDown={handleMouseDown}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <img
              src={imageUrl}
              alt="Mapa do jogo"
              className="w-full h-full object-contain select-none"
              draggable={false}
            />
          </div>

          {/* Controles de zoom e reset */}
          <div className="absolute bottom-4 right-4 flex gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-accent"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm px-2 flex items-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-accent"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="text-white hover:bg-accent"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveImage}
              className="text-white hover:bg-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Placeholder quando não há imagem */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-text-secondary text-lg mb-4">
              Cenário do RPG
            </span>
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
        </>
      )}

      {/* Botão de upload quando há imagem (canto superior direito) */}
      {imageUrl && (
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
      )}
    </div>
  )
}

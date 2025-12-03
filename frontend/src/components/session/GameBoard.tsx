import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  X,
  Grid,
  Square,
  Circle,
  Minus,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'

/**
 * Componente Game Board
 * Área central grande para exibir cenário/mapa do RPG
 * Funcionalidades: upload de imagem, zoom, drag, tokens, grid, ferramentas de desenho
 */
interface GameBoardProps {
  sessionId?: string
}

interface Token {
  id: string
  x: number
  y: number
  name: string
  imageUrl?: string
  color?: string
  size: number
}

interface Drawing {
  id: string
  type: 'line' | 'circle' | 'rect'
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
}

export function GameBoard({ sessionId }: GameBoardProps) {
  const { user } = useAuth()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [uploading, setUploading] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [drawingMode, setDrawingMode] = useState<'none' | 'line' | 'circle' | 'rect'>('none')
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null)
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tokenIdCounter = useRef(0)

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
        await saveBoardImage(localUrl)
        return
      }

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
    setTokens([])
    setDrawings([])
  }

  /**
   * Handler para iniciar drag do mapa
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (drawingMode !== 'none') {
      // Iniciar desenho
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / zoom
        const y = (e.clientY - rect.top - position.y) / zoom
        setDrawingStart({ x, y })
        setCurrentDrawing({
          id: `draw-${Date.now()}`,
          type: drawingMode,
          points: [{ x, y }],
          color: '#ff6b6b',
          strokeWidth: 2,
        })
      }
      return
    }

    // Verificar se clicou em um token
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const clickX = (e.clientX - rect.left - position.x) / zoom
      const clickY = (e.clientY - rect.top - position.y) / zoom

      const clickedToken = tokens.find((token) => {
        const distance = Math.sqrt(
          Math.pow(clickX - token.x, 2) + Math.pow(clickY - token.y, 2)
        )
        return distance <= token.size / 2
      })

      if (clickedToken) {
        setSelectedToken(clickedToken.id)
        setIsDragging(true)
        setDragStart({
          x: e.clientX - clickedToken.x * zoom,
          y: e.clientY - clickedToken.y * zoom,
        })
        return
      }
    }

    // Drag do mapa
    if (imageUrl) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  /**
   * Handler para mover durante drag
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (drawingMode !== 'none' && currentDrawing && drawingStart) {
      // Continuar desenho
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / zoom
        const y = (e.clientY - rect.top - position.y) / zoom
        setCurrentDrawing({
          ...currentDrawing,
          points: [...currentDrawing.points, { x, y }],
        })
      }
      return
    }

    if (isDragging && selectedToken) {
      // Mover token
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const newX = (e.clientX - dragStart.x) / zoom
        const newY = (e.clientY - dragStart.y) / zoom
        setTokens((prev) =>
          prev.map((token) =>
            token.id === selectedToken
              ? { ...token, x: newX, y: newY }
              : token
          )
        )
      }
      return
    }

    if (isDragging && imageUrl) {
      // Mover mapa
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  /**
   * Handler para finalizar drag/desenho
   */
  const handleMouseUp = () => {
    if (currentDrawing && drawingStart) {
      // Finalizar desenho
      setDrawings((prev) => [...prev, currentDrawing])
      setCurrentDrawing(null)
      setDrawingStart(null)
      setDrawingMode('none')
    }
    setIsDragging(false)
    setSelectedToken(null)
  }

  /**
   * Adiciona token no board
   */
  const handleAddToken = () => {
    const newToken: Token = {
      id: `token-${tokenIdCounter.current++}`,
      x: 200,
      y: 200,
      name: `Token ${tokens.length + 1}`,
      color: '#ff6b6b',
      size: 40,
    }
    setTokens((prev) => [...prev, newToken])
  }

  /**
   * Remove token selecionado
   */
  const handleRemoveToken = () => {
    if (selectedToken) {
      setTokens((prev) => prev.filter((token) => token.id !== selectedToken))
      setSelectedToken(null)
    }
  }

  /**
   * Handler para clique no board (adicionar token ou desenhar)
   */
  const handleBoardClick = (e: React.MouseEvent) => {
    if (drawingMode !== 'none' || isDragging) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - position.x) / zoom
    const y = (e.clientY - rect.top - position.y) / zoom

    // Se não clicou em token, pode adicionar novo token (duplo clique)
    // Por enquanto, apenas limpa seleção
    setSelectedToken(null)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-card-secondary border-b border-card-secondary relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleMouseDown}
      onClick={handleBoardClick}
    >
      {imageUrl ? (
        <>
          {/* Grid opcional */}
          {showGrid && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            />
          )}

          {/* Imagem do mapa com zoom e drag */}
          <div
            className="absolute inset-0 cursor-move"
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

            {/* Desenhos */}
            <svg className="absolute inset-0 pointer-events-none">
              {drawings.map((drawing) => (
                <g key={drawing.id}>
                  {drawing.type === 'line' && drawing.points.length >= 2 && (
                    <polyline
                      points={drawing.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(' ')}
                      fill="none"
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth}
                    />
                  )}
                  {drawing.type === 'circle' && drawing.points.length >= 2 && (
                    <circle
                      cx={drawing.points[0].x}
                      cy={drawing.points[0].y}
                      r={Math.sqrt(
                        Math.pow(drawing.points[1].x - drawing.points[0].x, 2) +
                          Math.pow(drawing.points[1].y - drawing.points[0].y, 2)
                      )}
                      fill="none"
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth}
                    />
                  )}
                  {drawing.type === 'rect' && drawing.points.length >= 2 && (
                    <rect
                      x={Math.min(drawing.points[0].x, drawing.points[1].x)}
                      y={Math.min(drawing.points[0].y, drawing.points[1].y)}
                      width={Math.abs(drawing.points[1].x - drawing.points[0].x)}
                      height={Math.abs(drawing.points[1].y - drawing.points[0].y)}
                      fill="none"
                      stroke={drawing.color}
                      strokeWidth={drawing.strokeWidth}
                    />
                  )}
                </g>
              ))}
              {currentDrawing && (
                <g>
                  {currentDrawing.type === 'line' && (
                    <polyline
                      points={currentDrawing.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(' ')}
                      fill="none"
                      stroke={currentDrawing.color}
                      strokeWidth={currentDrawing.strokeWidth}
                    />
                  )}
                  {currentDrawing.type === 'circle' &&
                    currentDrawing.points.length >= 2 && (
                      <circle
                        cx={currentDrawing.points[0].x}
                        cy={currentDrawing.points[0].y}
                        r={Math.sqrt(
                          Math.pow(
                            currentDrawing.points[1].x -
                              currentDrawing.points[0].x,
                            2
                          ) +
                            Math.pow(
                              currentDrawing.points[1].y -
                                currentDrawing.points[0].y,
                              2
                            )
                        )}
                        fill="none"
                        stroke={currentDrawing.color}
                        strokeWidth={currentDrawing.strokeWidth}
                      />
                    )}
                  {currentDrawing.type === 'rect' &&
                    currentDrawing.points.length >= 2 && (
                      <rect
                        x={Math.min(
                          currentDrawing.points[0].x,
                          currentDrawing.points[1].x
                        )}
                        y={Math.min(
                          currentDrawing.points[0].y,
                          currentDrawing.points[1].y
                        )}
                        width={Math.abs(
                          currentDrawing.points[1].x -
                            currentDrawing.points[0].x
                        )}
                        height={Math.abs(
                          currentDrawing.points[1].y -
                            currentDrawing.points[0].y
                        )}
                        fill="none"
                        stroke={currentDrawing.color}
                        strokeWidth={currentDrawing.strokeWidth}
                      />
                    )}
                </g>
              )}
            </svg>

            {/* Tokens */}
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`absolute cursor-move transition-transform ${
                  selectedToken === token.id ? 'ring-2 ring-accent' : ''
                }`}
                style={{
                  left: `${token.x}px`,
                  top: `${token.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedToken(token.id)
                }}
              >
                <div
                  className="rounded-full border-2 border-white shadow-lg"
                  style={{
                    width: `${token.size}px`,
                    height: `${token.size}px`,
                    backgroundColor: token.color || '#ff6b6b',
                  }}
                />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-0.5 rounded whitespace-nowrap">
                  {token.name}
                </div>
              </div>
            ))}
          </div>

          {/* Controles de zoom e ferramentas */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="flex gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
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
                variant={showGrid ? 'default' : 'ghost'}
                onClick={() => setShowGrid(!showGrid)}
                className="text-white hover:bg-accent"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            {/* Ferramentas de desenho */}
            <div className="flex gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
              <Button
                size="sm"
                variant={drawingMode === 'line' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'line' ? 'none' : 'line')}
                className="text-white hover:bg-accent"
                title="Linha"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={drawingMode === 'circle' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'circle' ? 'none' : 'circle')}
                className="text-white hover:bg-accent"
                title="Círculo"
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={drawingMode === 'rect' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'rect' ? 'none' : 'rect')}
                className="text-white hover:bg-accent"
                title="Retângulo"
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddToken}
                className="text-white hover:bg-accent"
                title="Adicionar Token"
              >
                +
              </Button>
              {selectedToken && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveToken}
                  className="text-white hover:bg-destructive"
                  title="Remover Token"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
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

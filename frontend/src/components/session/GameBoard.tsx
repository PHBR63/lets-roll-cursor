import { useState, useRef, useEffect, useCallback } from 'react'
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
  Ruler,
  Layers,
  Users,
  Skull,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { useRealtimeSession } from '@/hooks/useRealtimeSession'
import { Character } from '@/types/character'
import { Creature } from '@/types/creature'
import { logger } from '@/utils/logger'

/**
 * Componente Game Board
 * Área central grande para exibir cenário/mapa do RPG
 * Funcionalidades: upload de imagem, zoom, drag, tokens, grid, ferramentas de desenho,
 * medição de distância, camadas, salvamento no banco
 */
interface GameBoardProps {
  sessionId?: string
  campaignId?: string
}

interface Token {
  id: string
  x: number
  y: number
  name: string
  imageUrl?: string
  color?: string
  size: number
  type?: 'character' | 'creature' | 'generic'
  entityId?: string // ID do personagem ou criatura
}

interface Drawing {
  id: string
  type: 'line' | 'circle' | 'rect'
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
  layer: 'annotations'
}

interface Measurement {
  start: { x: number; y: number } | null
  end: { x: number; y: number } | null
  distance: number
}

type Layer = 'background' | 'tokens' | 'annotations'

export function GameBoard({ sessionId, campaignId }: GameBoardProps) {
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
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurement, setMeasurement] = useState<Measurement>({
    start: null,
    end: null,
    distance: 0,
  })
  const [layers, setLayers] = useState<Record<Layer, boolean>>({
    background: true,
    tokens: true,
    annotations: true,
  })
  const [characters, setCharacters] = useState<Character[]>([])
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tokenIdCounter = useRef(0)

  // Debounce para salvar estado
  const debouncedBoardState = useDebounce(
    {
      imageUrl,
      zoom,
      position,
      tokens,
      drawings,
    },
    1000
  )

  // Integração Realtime - sincronizar board_state em tempo real
  const { session: realtimeSession } = useRealtimeSession(sessionId)

  useEffect(() => {
    if (sessionId) {
      loadBoardState()
      loadCharactersAndCreatures()
    }
  }, [sessionId, campaignId])

  // Atualizar board quando session mudar via Realtime
  useEffect(() => {
    if (realtimeSession?.board_state && typeof realtimeSession.board_state === 'object' && Object.keys(realtimeSession.board_state).length > 0) {
      const boardState = realtimeSession.board_state as Record<string, unknown>
      // Só atualizar se for diferente do estado atual (evitar loops)
      if (typeof boardState.imageUrl === 'string' && boardState.imageUrl !== imageUrl) {
        setImageUrl(boardState.imageUrl)
      } else if (boardState.imageUrl === null && imageUrl !== null) {
        setImageUrl(null)
      }
      if (typeof boardState.zoom === 'number' && boardState.zoom !== zoom) {
        setZoom(boardState.zoom)
      }
      if (boardState.position && typeof boardState.position === 'object' && 'x' in boardState.position && 'y' in boardState.position) {
        const pos = boardState.position as { x: number; y: number }
        if (pos.x !== position.x || pos.y !== position.y) {
          setPosition(pos)
        }
      }
      if (Array.isArray(boardState.tokens)) {
        setTokens(boardState.tokens as Token[])
      }
      if (Array.isArray(boardState.drawings)) {
        setDrawings(boardState.drawings as Drawing[])
      }
      if (boardState.layers && typeof boardState.layers === 'object') {
        setLayers(boardState.layers as Record<Layer, boolean>)
      }
    }
  }, [realtimeSession?.board_state])

  // Salvar estado quando mudar (com debounce)
  useEffect(() => {
    if (sessionId && debouncedBoardState) {
      saveBoardState()
    }
  }, [debouncedBoardState, sessionId])

  /**
   * Carrega estado do board da sessão
   */
  const loadBoardState = async () => {
    try {
      if (!sessionId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      })

      if (response.ok) {
        const sessionData = await response.json()
        const boardState = sessionData.board_state || {}

        if (boardState.imageUrl) setImageUrl(boardState.imageUrl)
        if (boardState.zoom) setZoom(boardState.zoom)
        if (boardState.position) setPosition(boardState.position)
        if (boardState.tokens) setTokens(boardState.tokens || [])
        if (boardState.drawings) setDrawings(boardState.drawings || [])
        if (boardState.layers) setLayers(boardState.layers)
      }
    } catch (error) {
      logger.error('Erro ao carregar estado do board:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Salva estado do board na sessão
   */
  const saveBoardState = async () => {
    try {
      if (!sessionId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      await fetch(`${apiUrl}/api/sessions/${sessionId}/board-state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          imageUrl,
          zoom,
          position,
          tokens,
          drawings,
          layers,
        }),
      })
    } catch (error) {
      logger.error('Erro ao salvar estado do board:', error)
    }
  }

  /**
   * Carrega personagens e criaturas para tokens
   */
  const loadCharactersAndCreatures = async () => {
    try {
      if (!campaignId) return

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

      // Carregar personagens
      const charsResponse = await fetch(
        `${apiUrl}/api/characters?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )
      if (charsResponse.ok) {
        const chars = await charsResponse.json()
        setCharacters(chars || [])
      }

      // Carregar criaturas
      const creaturesResponse = await fetch(
        `${apiUrl}/api/creatures?campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )
      if (creaturesResponse.ok) {
        const creatures = await creaturesResponse.json()
        setCreatures(creatures || [])
      }
    } catch (error) {
      logger.error('Erro ao carregar personagens/criaturas:', error)
    }
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
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('game-assets').getPublicUrl(filePath)

      setImageUrl(publicUrl)
    } catch (error) {
      logger.error('Erro ao fazer upload:', error)
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
   * Calcula distância entre dois pontos
   */
  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  /**
   * Converte pixels para unidades do jogo (assumindo 1 unidade = 5 pixels)
   */
  const pixelsToUnits = (pixels: number) => {
    return Math.round((pixels / zoom) / 5)
  }

  /**
   * Handler para pinch to zoom (touch)
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      setDragStart({ x: distance, y: 0 })
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && dragStart.x > 0) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      const scale = distance / dragStart.x
      const newZoom = Math.max(0.5, Math.min(3, zoom * scale))
      setZoom(newZoom)
    }
  }, [dragStart, zoom])

  const handleTouchEnd = useCallback(() => {
    setDragStart({ x: 0, y: 0 })
  }, [])

  /**
   * Handler para iniciar drag/medir/desenhar
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - position.x) / zoom
    const y = (e.clientY - rect.top - position.y) / zoom

    if (measurementMode) {
      // Modo medição
      if (!measurement.start) {
        setMeasurement({ start: { x, y }, end: null, distance: 0 })
      } else {
        const distance = calculateDistance(measurement.start, { x, y })
        setMeasurement({
          start: measurement.start,
          end: { x, y },
          distance,
        })
        setMeasurementMode(false)
      }
      return
    }

    if (drawingMode !== 'none') {
      // Iniciar desenho
      setDrawingStart({ x, y })
      setCurrentDrawing({
        id: `draw-${Date.now()}`,
        type: drawingMode,
        points: [{ x, y }],
        color: '#ff6b6b',
        strokeWidth: 2,
        layer: 'annotations',
      })
      return
    }

    // Verificar se clicou em um token
    const clickedToken = tokens.find((token) => {
      const distance = Math.sqrt(
        Math.pow(x - token.x, 2) + Math.pow(y - token.y, 2)
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
   * Handler para mover durante drag/medir/desenhar
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - position.x) / zoom
    const y = (e.clientY - rect.top - position.y) / zoom

    if (measurementMode && measurement.start) {
      // Atualizar medição em tempo real
      const distance = calculateDistance(measurement.start, { x, y })
      setMeasurement({
        start: measurement.start,
        end: { x, y },
        distance,
      })
      return
    }

    if (drawingMode !== 'none' && currentDrawing && drawingStart) {
      // Continuar desenho
      setCurrentDrawing({
        ...currentDrawing,
        points: [...currentDrawing.points, { x, y }],
      })
      return
    }

    if (isDragging && selectedToken) {
      // Mover token
      const newX = (e.clientX - dragStart.x) / zoom
      const newY = (e.clientY - dragStart.y) / zoom
      setTokens((prev) =>
        prev.map((token) =>
          token.id === selectedToken
            ? { ...token, x: newX, y: newY }
            : token
        )
      )
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
   * Adiciona token genérico
   */
  const handleAddToken = () => {
    const newToken: Token = {
      id: `token-${tokenIdCounter.current++}`,
      x: 200,
      y: 200,
      name: `Token ${tokens.length + 1}`,
      color: '#ff6b6b',
      size: 40,
      type: 'generic',
    }
    setTokens((prev) => [...prev, newToken])
  }

  /**
   * Adiciona token de personagem
   */
  const handleAddCharacterToken = (character: Character) => {
    const newToken: Token = {
      id: `token-char-${character.id}`,
      x: 200,
      y: 200,
      name: character.name,
      imageUrl: character.avatar_url || undefined,
      color: '#6366f1',
      size: 40,
      type: 'character',
      entityId: character.id,
    }
    setTokens((prev) => [...prev, newToken])
  }

  /**
   * Adiciona token de criatura
   */
  const handleAddCreatureToken = (creature: Creature) => {
    const newToken: Token = {
      id: `token-creature-${creature.id}`,
      x: 200,
      y: 200,
      name: creature.name,
      imageUrl: undefined, // Criaturas podem não ter imagem
      color: '#ef4444',
      size: 40,
      type: 'creature',
      entityId: creature.id,
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
   * Toggle de camada
   */
  const toggleLayer = (layer: Layer) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }

  if (loading) {
    return (
      <div className="flex-1 bg-card-secondary flex items-center justify-center">
        <div className="text-white">Carregando board...</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-card-secondary border-b border-card-secondary relative overflow-hidden touch-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {imageUrl ? (
        <>
          {/* Grid opcional */}
          {showGrid && layers.background && (
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            />
          )}

          {/* Imagem do mapa com zoom e drag */}
          {layers.background && (
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
            </div>
          )}

          {/* Medição de distância */}
          {measurement.start && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            >
              <line
                x1={measurement.start.x}
                y1={measurement.start.y}
                x2={measurement.end?.x || measurement.start.x}
                y2={measurement.end?.y || measurement.start.y}
                stroke="#ff6b6b"
                strokeWidth={2}
                strokeDasharray="5,5"
              />
              {measurement.end && (
                <circle
                  cx={measurement.end.x}
                  cy={measurement.end.y}
                  r={5}
                  fill="#ff6b6b"
                />
              )}
              {measurement.distance > 0 && (
                <text
                  x={(measurement.start.x + (measurement.end?.x || measurement.start.x)) / 2}
                  y={(measurement.start.y + (measurement.end?.y || measurement.start.y)) / 2 - 10}
                  fill="#ff6b6b"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-lg"
                >
                  {pixelsToUnits(measurement.distance)} unidades
                </text>
              )}
            </svg>
          )}

          {/* Desenhos (camada annotations) */}
          {layers.annotations && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
            >
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
          )}

          {/* Tokens (camada tokens) */}
          {layers.tokens &&
            tokens.map((token) => (
              <div
                key={token.id}
                className={`absolute cursor-move transition-transform ${
                  selectedToken === token.id ? 'ring-2 ring-accent' : ''
                }`}
                style={{
                  left: `${token.x * zoom + position.x}px`,
                  top: `${token.y * zoom + position.y}px`,
                  transform: 'translate(-50%, -50%) scale(' + zoom + ')',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedToken(token.id)
                }}
              >
                {token.imageUrl ? (
                  <img
                    src={token.imageUrl}
                    alt={token.name}
                    className="rounded-full border-2 border-white shadow-lg"
                    style={{
                      width: `${token.size}px`,
                      height: `${token.size}px`,
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{
                      width: `${token.size}px`,
                      height: `${token.size}px`,
                      backgroundColor: token.color || '#ff6b6b',
                    }}
                  >
                    {token.type === 'character' && (
                      <Users className="w-5 h-5 text-white" />
                    )}
                    {token.type === 'creature' && (
                      <Skull className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-0.5 rounded whitespace-nowrap">
                  {token.name}
                </div>
              </div>
            ))}

          {/* Controles de zoom e ferramentas */}
          <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-accent touch-manipulation"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-xs md:text-sm px-1 md:px-2 flex items-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-accent touch-manipulation"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                className="text-white hover:bg-accent touch-manipulation"
                title="Resetar"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={showGrid ? 'default' : 'ghost'}
                onClick={() => setShowGrid(!showGrid)}
                className="text-white hover:bg-accent touch-manipulation"
                title="Grid"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={measurementMode ? 'default' : 'ghost'}
                onClick={() => {
                  setMeasurementMode(!measurementMode)
                  if (measurementMode) {
                    setMeasurement({ start: null, end: null, distance: 0 })
                  }
                }}
                className="text-white hover:bg-accent touch-manipulation"
                title="Medição"
              >
                <Ruler className="w-4 h-4" />
              </Button>
            </div>

            {/* Ferramentas de desenho (oculto em mobile muito pequeno) */}
            <div className="hidden sm:flex gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
              <Button
                size="sm"
                variant={drawingMode === 'line' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'line' ? 'none' : 'line')}
                className="text-white hover:bg-accent touch-manipulation"
                title="Linha"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={drawingMode === 'circle' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'circle' ? 'none' : 'circle')}
                className="text-white hover:bg-accent touch-manipulation"
                title="Círculo"
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={drawingMode === 'rect' ? 'default' : 'ghost'}
                onClick={() => setDrawingMode(drawingMode === 'rect' ? 'none' : 'rect')}
                className="text-white hover:bg-accent touch-manipulation"
                title="Retângulo"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>

            {/* Controles de camadas (oculto em mobile muito pequeno) */}
            <div className="hidden md:block bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-semibold">Camadas</span>
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={layers.background}
                    onChange={() => toggleLayer('background')}
                    className="w-3 h-3"
                  />
                  Background
                </label>
                <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={layers.tokens}
                    onChange={() => toggleLayer('tokens')}
                    className="w-3 h-3"
                  />
                  Tokens
                </label>
                <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
                  <input
                    type="checkbox"
                    checked={layers.annotations}
                    onChange={() => toggleLayer('annotations')}
                    className="w-3 h-3"
                  />
                  Anotações
                </label>
              </div>
            </div>

            {/* Adicionar tokens (oculto em mobile muito pequeno) */}
            <div className="hidden lg:block bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
              <Select
                onValueChange={(value) => {
                  if (value === 'generic') {
                    handleAddToken()
                  } else if (value.startsWith('char-')) {
                    const charId = value.replace('char-', '')
                    const char = characters.find((c) => c.id === charId)
                    if (char) handleAddCharacterToken(char)
                  } else if (value.startsWith('creature-')) {
                    const creatureId = value.replace('creature-', '')
                    const creature = creatures.find((c) => c.id === creatureId)
                    if (creature) handleAddCreatureToken(creature)
                  }
                }}
              >
                <SelectTrigger className="w-full bg-input border-white/20 text-white text-xs h-8">
                  <SelectValue placeholder="Adicionar Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">Token Genérico</SelectItem>
                  {characters.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-text-secondary">Personagens</div>
                      {characters.map((char) => (
                        <SelectItem key={char.id} value={`char-${char.id}`}>
                          {char.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {creatures.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-text-secondary">Criaturas</div>
                      {creatures.map((creature) => (
                        <SelectItem key={creature.id} value={`creature-${creature.id}`}>
                          {creature.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {selectedToken && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveToken}
                  className="w-full mt-2 text-white hover:bg-destructive touch-manipulation"
                  title="Remover Token"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover Token
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

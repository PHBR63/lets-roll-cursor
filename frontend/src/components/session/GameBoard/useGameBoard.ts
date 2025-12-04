import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useDebounce } from '@/hooks/useDebounce'
import { useRealtimeSession } from '@/hooks/useRealtimeSession'
import { GameBoardState, Token, Character, Creature, Layer, Drawing, Measurement } from './types'
import { logger } from '@/utils/logger'

/**
 * Hook para gerenciar estado e lógica do GameBoard
 */
export function useGameBoard(sessionId?: string, campaignId?: string) {
  const { user } = useAuth()
  const tokenIdCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<GameBoardState>({
    imageUrl: null,
    zoom: 1,
    position: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    showGrid: false,
    tokens: [],
    selectedToken: null,
    drawingMode: 'none',
    drawings: [],
    currentDrawing: null,
    drawingStart: null,
    measurementMode: false,
    measurement: null,
    layers: {
      background: true,
      tokens: true,
      annotations: true,
    },
  })

  const [characters, setCharacters] = useState<Character[]>([])
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Debounce para salvar estado
  const debouncedBoardState = useDebounce(
    {
      imageUrl: state.imageUrl,
      zoom: state.zoom,
      position: state.position,
      tokens: state.tokens,
      drawings: state.drawings,
    },
    1000
  )

  // Integração Realtime
  const { session: realtimeSession } = useRealtimeSession(sessionId)

  // Carregar estado inicial
  useEffect(() => {
    if (sessionId) {
      loadBoardState()
      loadCharactersAndCreatures()
    }
  }, [sessionId, campaignId])

  // Sincronizar com Realtime
  useEffect(() => {
    if (realtimeSession?.board_state && typeof realtimeSession.board_state === 'object' && Object.keys(realtimeSession.board_state).length > 0) {
      const boardState = realtimeSession.board_state as Record<string, unknown>
      if (typeof boardState.imageUrl === 'string' && boardState.imageUrl !== state.imageUrl) {
        setState((prev) => ({ ...prev, imageUrl: boardState.imageUrl as string }))
      } else if (boardState.imageUrl === null && state.imageUrl !== null) {
        setState((prev) => ({ ...prev, imageUrl: null }))
      }
      if (typeof boardState.zoom === 'number' && boardState.zoom !== state.zoom) {
        setState((prev) => ({ ...prev, zoom: boardState.zoom as number }))
      }
      if (boardState.position && typeof boardState.position === 'object' && 'x' in boardState.position && 'y' in boardState.position) {
        const pos = boardState.position as { x: number; y: number }
        if (pos.x !== state.position.x || pos.y !== state.position.y) {
          setState((prev) => ({ ...prev, position: pos }))
        }
      }
      if (Array.isArray(boardState.tokens)) {
        setState((prev) => ({ ...prev, tokens: boardState.tokens as Token[] }))
      }
      if (Array.isArray(boardState.drawings)) {
        setState((prev) => ({ ...prev, drawings: boardState.drawings as Drawing[] }))
      }
      if (boardState.layers && typeof boardState.layers === 'object') {
        setState((prev) => ({ ...prev, layers: boardState.layers as Record<Layer, boolean> }))
      }
    }
  }, [realtimeSession?.board_state])

  // Salvar estado quando mudar
  useEffect(() => {
    if (sessionId && debouncedBoardState) {
      saveBoardState()
    }
  }, [debouncedBoardState, sessionId])

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

        if (boardState.imageUrl) setState((prev) => ({ ...prev, imageUrl: boardState.imageUrl }))
        if (boardState.zoom) setState((prev) => ({ ...prev, zoom: boardState.zoom }))
        if (boardState.position) setState((prev) => ({ ...prev, position: boardState.position }))
        if (boardState.tokens) setState((prev) => ({ ...prev, tokens: boardState.tokens || [] }))
        if (boardState.drawings) setState((prev) => ({ ...prev, drawings: boardState.drawings || [] }))
        if (boardState.layers) setState((prev) => ({ ...prev, layers: boardState.layers }))
      }
    } catch (error) {
      logger.error({ error }, 'Erro ao carregar estado do board')
    } finally {
      setLoading(false)
    }
  }

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
          imageUrl: state.imageUrl,
          zoom: state.zoom,
          position: state.position,
          tokens: state.tokens,
          drawings: state.drawings,
          layers: state.layers,
        }),
      })
    } catch (error) {
      logger.error({ error }, 'Erro ao salvar estado do board')
    }
  }

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
        setCharacters((chars.data || chars) || [])
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
        setCreatures((creatures.data || creatures) || [])
      }
    } catch (error) {
      logger.error({ error }, 'Erro ao carregar personagens/criaturas')
    }
  }

  // Handlers
  const handleZoomIn = () => {
    setState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }))
  }

  const handleZoomOut = () => {
    setState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.5) }))
  }

  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      zoom: 1,
      position: { x: 0, y: 0 },
    }))
  }

  const handleAddToken = () => {
    const newToken: Token = {
      id: `token-${tokenIdCounter.current++}`,
      x: 200,
      y: 200,
      name: `Token ${state.tokens.length + 1}`,
      color: '#ff6b6b',
      size: 40,
      type: 'generic',
    }
    setState((prev) => ({ ...prev, tokens: [...prev.tokens, newToken] }))
  }

  const handleAddCharacterToken = (character: Character) => {
    const newToken: Token = {
      id: `token-char-${character.id}`,
      x: 200,
      y: 200,
      name: character.name,
      imageUrl: character.avatar_url || null,
      color: '#6366f1',
      size: 40,
      type: 'character',
      entityId: character.id,
    }
    setState((prev) => ({ ...prev, tokens: [...prev.tokens, newToken] }))
  }

  const handleAddCreatureToken = (creature: Creature) => {
    const newToken: Token = {
      id: `token-creature-${creature.id}`,
      x: 200,
      y: 200,
      name: creature.name,
      imageUrl: null,
      color: '#ef4444',
      size: 40,
      type: 'creature',
      entityId: creature.id,
    }
    setState((prev) => ({ ...prev, tokens: [...prev.tokens, newToken] }))
  }

  const handleRemoveToken = () => {
    if (state.selectedToken) {
      setState((prev) => ({
        ...prev,
        tokens: prev.tokens.filter((token) => token.id !== prev.selectedToken),
        selectedToken: null,
      }))
    }
  }

  const toggleLayer = (layer: Layer) => {
    setState((prev) => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layer]: !prev.layers[layer],
      },
    }))
  }

  return {
    state,
    setState,
    characters,
    creatures,
    loading,
    uploading,
    setUploading,
    sessionId,
    campaignId,
    fileInputRef,
    setImageUrl: (url: string | null) => setState((prev) => ({ ...prev, imageUrl: url })),
    setZoom: (zoom: number | ((prev: number) => number)) => setState((prev) => ({
      ...prev,
      zoom: typeof zoom === 'function' ? zoom(prev.zoom) : zoom,
    })),
    setPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => setState((prev) => ({
      ...prev,
      position: typeof pos === 'function' ? pos(prev.position) : pos,
    })),
    setTokens: (tokens: Token[] | ((prev: Token[]) => Token[])) => setState((prev) => ({
      ...prev,
      tokens: typeof tokens === 'function' ? tokens(prev.tokens) : tokens,
    })),
    setDrawings: (drawings: Drawing[] | ((prev: Drawing[]) => Drawing[])) => setState((prev) => ({
      ...prev,
      drawings: typeof drawings === 'function' ? drawings(prev.drawings) : drawings,
    })),
    setMeasurement: (measurement: Measurement | ((prev: Measurement | null) => Measurement | null)) => setState((prev) => ({
      ...prev,
      measurement: typeof measurement === 'function' ? measurement(prev.measurement) : measurement,
    })),
    toggleLayer,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleAddToken,
    handleAddCharacterToken,
    handleAddCreatureToken,
    handleRemoveToken,
  }
}


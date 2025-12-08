import { createContext, useContext, ReactNode } from 'react'
import { GameBoardState, Token, Drawing, Measurement, Layer, Character, Creature } from './types'

/**
 * Contexto para estado compartilhado do GameBoard
 */
interface GameBoardContextValue {
  state: GameBoardState
  setState: React.Dispatch<React.SetStateAction<GameBoardState>>
  characters: Character[]
  creatures: Creature[]
  loading: boolean
  uploading: boolean
  setUploading: (uploading: boolean) => void
  sessionId?: string
  campaignId?: string
  fileInputRef: React.RefObject<HTMLInputElement>
  // Helpers
  setImageUrl: (url: string | null) => void
  setZoom: (zoom: number | ((prev: number) => number)) => void
  setPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void
  setTokens: (tokens: Token[] | ((prev: Token[]) => Token[])) => void
  setDrawings: (drawings: Drawing[] | ((prev: Drawing[]) => Drawing[])) => void
  setMeasurement: (measurement: Measurement | null | ((prev: Measurement | null) => Measurement | null)) => void
  toggleLayer: (layer: Layer) => void
  // Actions
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleReset: () => void
  handleAddToken: () => void
  handleAddCharacterToken: (character: Character) => void
  handleAddCreatureToken: (creature: Creature) => void
  handleRemoveToken: () => void
}

const GameBoardContext = createContext<GameBoardContextValue | undefined>(undefined)

export function useGameBoardContext() {
  const context = useContext(GameBoardContext)
  if (!context) {
    // Em vez de lançar erro, retornar um objeto vazio para evitar quebra da aplicação
    // Isso pode acontecer durante hot reload ou em casos de renderização condicional
    console.warn('useGameBoardContext must be used within GameBoardProvider. Returning empty context.')
    return {
      state: {
        imageUrl: null,
        zoom: 1,
        position: { x: 0, y: 0 },
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        showGrid: false,
        tokens: [],
        selectedToken: null,
        drawingMode: 'none' as const,
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
      },
      setState: () => {},
      characters: [],
      creatures: [],
      loading: false,
      uploading: false,
      setUploading: () => {},
      sessionId: undefined,
      campaignId: undefined,
      fileInputRef: { current: null },
      setImageUrl: () => {},
      setZoom: () => {},
      setPosition: () => {},
      setTokens: () => {},
      setDrawings: () => {},
      setMeasurement: () => {},
      toggleLayer: () => {},
      handleZoomIn: () => {},
      handleZoomOut: () => {},
      handleReset: () => {},
      handleAddToken: () => {},
      handleAddCharacterToken: () => {},
      handleAddCreatureToken: () => {},
      handleRemoveToken: () => {},
    } as GameBoardContextValue
  }
  return context
}

interface GameBoardProviderProps {
  children: ReactNode
  value: GameBoardContextValue
}

export function GameBoardProvider({ children, value }: GameBoardProviderProps) {
  return <GameBoardContext.Provider value={value}>{children}</GameBoardContext.Provider>
}


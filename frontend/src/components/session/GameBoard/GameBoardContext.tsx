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
    throw new Error('useGameBoardContext must be used within GameBoardProvider')
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


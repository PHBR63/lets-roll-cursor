/**
 * Tipos compartilhados para GameBoard
 */

export interface Token {
  id: string
  x: number
  y: number
  name: string
  imageUrl?: string | null
  color?: string
  size: number
  type?: 'character' | 'creature' | 'generic'
  entityId?: string
}

export interface Drawing {
  id: string
  type: 'line' | 'circle' | 'rect'
  points: { x: number; y: number }[]
  color: string
  strokeWidth: number
  layer: 'annotations'
}

export interface Measurement {
  start: { x: number; y: number } | null
  end: { x: number; y: number } | null
  distance: number
}

export type Layer = 'background' | 'tokens' | 'annotations'

export interface GameBoardState {
  imageUrl: string | null
  zoom: number
  position: { x: number; y: number }
  isDragging: boolean
  dragStart: { x: number; y: number }
  showGrid: boolean
  tokens: Token[]
  selectedToken: string | null
  drawingMode: 'none' | 'line' | 'circle' | 'rect'
  drawings: Drawing[]
  currentDrawing: Drawing | null
  drawingStart: { x: number; y: number } | null
  measurementMode: boolean
  measurement: Measurement
  layers: Record<Layer, boolean>
}

export interface Character {
  id: string
  name: string
  avatar_url?: string
}

export interface Creature {
  id: string
  name: string
}


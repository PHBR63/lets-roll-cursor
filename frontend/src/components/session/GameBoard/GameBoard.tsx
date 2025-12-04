import { GameBoardProvider, useGameBoardContext } from './GameBoardContext'
import { useGameBoard } from './useGameBoard'
import { GameBoardCanvas } from './GameBoardCanvas'
import { GameBoardToolbar } from './GameBoardToolbar'
import { GameBoardTokens } from './GameBoardTokens'
import { GameBoardDrawings } from './GameBoardDrawings'
import { GameBoardMeasurement } from './GameBoardMeasurement'
import { GameBoardUpload } from './GameBoardUpload'
import { GameBoardTools } from './GameBoardTools'
import { GameBoardTokenSelector } from './GameBoardTokenSelector'
import { useRef, useCallback } from 'react'

/**
 * Componente Game Board Refatorado
 * Área central grande para exibir cenário/mapa do RPG
 * Dividido em componentes menores para melhor manutenibilidade
 */
interface GameBoardProps {
  sessionId?: string
  campaignId?: string
}

export function GameBoard({ sessionId, campaignId }: GameBoardProps) {
  const gameBoardData = useGameBoard(sessionId, campaignId)
  const interactions = useGameBoardInteractions()

  if (gameBoardData.loading) {
    return (
      <div className="flex-1 bg-card-secondary flex items-center justify-center">
        <div className="text-white">Carregando board...</div>
      </div>
    )
  }

  return (
    <GameBoardProvider value={{ ...gameBoardData, ...interactions }}>
      <div
        ref={interactions.containerRef}
        className="flex-1 bg-card-secondary border-b border-card-secondary relative overflow-hidden touch-none"
        onMouseMove={interactions.handleMouseMove}
        onMouseUp={interactions.handleMouseUp}
        onMouseLeave={interactions.handleMouseUp}
        onMouseDown={interactions.handleMouseDown}
        onTouchStart={interactions.handleTouchStart}
        onTouchMove={interactions.handleTouchMove}
        onTouchEnd={interactions.handleTouchEnd}
      >
        <GameBoardCanvas />
        <GameBoardMeasurement />
        <GameBoardDrawings />
        <GameBoardTokens />
        <GameBoardToolbar />
        <GameBoardTools />
        <GameBoardTokenSelector />
        <GameBoardUpload />
      </div>
    </GameBoardProvider>
  )
}


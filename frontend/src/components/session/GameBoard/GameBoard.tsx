import { GameBoardProvider } from './GameBoardContext'
import { useGameBoard } from './useGameBoard'
import { useGameBoardInteractions } from './GameBoardInteractions'
import { GameBoardCanvas } from './GameBoardCanvas'
import { GameBoardToolbar } from './GameBoardToolbar'
import { GameBoardTokens } from './GameBoardTokens'
import { GameBoardDrawings } from './GameBoardDrawings'
import { GameBoardMeasurement } from './GameBoardMeasurement'
import { GameBoardUpload } from './GameBoardUpload'
import { GameBoardTools } from './GameBoardTools'
import { GameBoardTokenSelector } from './GameBoardTokenSelector'

/**
 * Componente Game Board Refatorado
 * Área central grande para exibir cenário/mapa do RPG
 * Dividido em componentes menores para melhor manutenibilidade
 */
interface GameBoardProps {
  sessionId?: string
  campaignId?: string
}

/**
 * Componente wrapper interno que usa o contexto
 * As interações são criadas aqui, dentro do provider
 */
function GameBoardContent() {
  const interactions = useGameBoardInteractions()

  return (
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
  )
}

export function GameBoard({ sessionId, campaignId }: GameBoardProps) {
  const gameBoardData = useGameBoard(sessionId, campaignId)

  if (gameBoardData.loading) {
    return (
      <div className="flex-1 bg-card-secondary flex items-center justify-center">
        <div className="text-white">Carregando board...</div>
      </div>
    )
  }

  // Criar um objeto com os dados básicos para o provider
  // As interações serão criadas dentro do GameBoardContent que usa o contexto
  return (
    <GameBoardProvider value={gameBoardData as any}>
      <GameBoardContent />
    </GameBoardProvider>
  )
}


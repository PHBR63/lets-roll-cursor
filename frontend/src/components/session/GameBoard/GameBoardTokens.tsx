// @ts-nocheck
import { Users, Skull } from 'lucide-react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para renderizar tokens no GameBoard
 */
export function GameBoardTokens() {
  const { state, setState } = useGameBoardContext()

  if (!state.layers.tokens) return null

  const handleTokenClick = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setState((prev) => ({
      ...prev,
      selectedToken: prev.selectedToken === tokenId ? null : tokenId,
    }))
  }

  return (
    <>
      {state.tokens.map((token) => (
        <div
          key={token.id}
          className={`absolute cursor-move transition-transform z-30 ${
            state.selectedToken === token.id ? 'ring-2 ring-accent' : ''
          }`}
          style={{
            left: `${token.x * state.zoom + state.position.x}px`,
            top: `${token.y * state.zoom + state.position.y}px`,
            transform: 'translate(-50%, -50%) scale(' + state.zoom + ')',
          }}
          onClick={(e) => handleTokenClick(token.id, e)}
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
              {token.type === 'character' && <Users className="w-5 h-5 text-white" />}
              {token.type === 'creature' && <Skull className="w-5 h-5 text-white" />}
            </div>
          )}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-0.5 rounded whitespace-nowrap">
            {token.name}
          </div>
        </div>
      ))}
    </>
  )
}


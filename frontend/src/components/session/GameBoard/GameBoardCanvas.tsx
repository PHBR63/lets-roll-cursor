import { useRef } from 'react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente principal do canvas do GameBoard
 * Renderiza a imagem do mapa, grid, e gerencia interações básicas
 */
export function GameBoardCanvas() {
  const { state, setState, setImageUrl, setPosition, setZoom } = useGameBoardContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (state.measurementMode || state.drawingMode !== 'none') return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || !state.imageUrl) return

    const x = (e.clientX - rect.left - state.position.x) / state.zoom
    const y = (e.clientY - rect.top - state.position.y) / state.zoom

    // Verificar se clicou em um token (será tratado no componente de tokens)
    // Por enquanto, apenas drag do mapa
    setState((prev) => ({
      ...prev,
      isDragging: true,
      dragStart: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y,
      },
    }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!state.isDragging || !state.imageUrl || state.selectedToken) return

    setPosition({
      x: e.clientX - state.dragStart.x,
      y: e.clientY - state.dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setState((prev) => ({
      ...prev,
      isDragging: false,
    }))
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid opcional */}
      {state.showGrid && state.layers.background && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: `${20 * state.zoom}px ${20 * state.zoom}px`,
            transform: `translate(${state.position.x}px, ${state.position.y}px)`,
          }}
        />
      )}

      {/* Imagem do mapa com zoom e drag */}
      {state.layers.background && state.imageUrl && (
        <div
          className="absolute inset-0 cursor-move"
          style={{
            transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.zoom})`,
            transformOrigin: 'center center',
            transition: state.isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <img
            src={state.imageUrl}
            alt="Mapa do jogo"
            className="w-full h-full object-contain select-none"
            draggable={false}
          />
        </div>
      )}
    </div>
  )
}


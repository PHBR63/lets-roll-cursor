import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para renderizar desenhos e anotações no GameBoard
 */
export function GameBoardDrawings() {
  const { state } = useGameBoardContext()

  if (!state.layers.annotations) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.zoom})`,
      }}
    >
      {/* Desenhos salvos */}
      {state.drawings.map((drawing) => (
        <g key={drawing.id}>
          {drawing.type === 'line' && drawing.points.length >= 2 && (
            <polyline
              points={drawing.points.map((p) => `${p.x},${p.y}`).join(' ')}
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

      {/* Desenho atual em progresso */}
      {state.currentDrawing && (
        <g>
          {state.currentDrawing.type === 'line' && (
            <polyline
              points={state.currentDrawing.points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={state.currentDrawing.color}
              strokeWidth={state.currentDrawing.strokeWidth}
            />
          )}
          {state.currentDrawing.type === 'circle' && state.currentDrawing.points.length >= 2 && (
            <circle
              cx={state.currentDrawing.points[0].x}
              cy={state.currentDrawing.points[0].y}
              r={Math.sqrt(
                Math.pow(
                  state.currentDrawing.points[1].x - state.currentDrawing.points[0].x,
                  2
                ) +
                  Math.pow(
                    state.currentDrawing.points[1].y - state.currentDrawing.points[0].y,
                    2
                  )
              )}
              fill="none"
              stroke={state.currentDrawing.color}
              strokeWidth={state.currentDrawing.strokeWidth}
            />
          )}
          {state.currentDrawing.type === 'rect' && state.currentDrawing.points.length >= 2 && (
            <rect
              x={Math.min(
                state.currentDrawing.points[0].x,
                state.currentDrawing.points[1].x
              )}
              y={Math.min(
                state.currentDrawing.points[0].y,
                state.currentDrawing.points[1].y
              )}
              width={Math.abs(
                state.currentDrawing.points[1].x - state.currentDrawing.points[0].x
              )}
              height={Math.abs(
                state.currentDrawing.points[1].y - state.currentDrawing.points[0].y
              )}
              fill="none"
              stroke={state.currentDrawing.color}
              strokeWidth={state.currentDrawing.strokeWidth}
            />
          )}
        </g>
      )}
    </svg>
  )
}


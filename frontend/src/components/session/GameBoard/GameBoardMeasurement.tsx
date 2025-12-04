import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para medição de distância no GameBoard
 */
export function GameBoardMeasurement() {
  const { state, setState } = useGameBoardContext()

  if (!state.measurement?.start) return null

  const pixelsToUnits = (pixels: number) => {
    return Math.round((pixels / state.zoom) / 5)
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.zoom})`,
      }}
    >
      <line
        x1={state.measurement.start!.x}
        y1={state.measurement.start!.y}
        x2={state.measurement.end?.x || state.measurement.start!.x}
        y2={state.measurement.end?.y || state.measurement.start!.y}
        stroke="#ff6b6b"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
      {state.measurement.end && (
        <circle
          cx={state.measurement.end!.x}
          cy={state.measurement.end!.y}
          r={5}
          fill="#ff6b6b"
        />
      )}
      {state.measurement.distance! > 0 && (
        <text
          x={(state.measurement.start!.x + (state.measurement.end?.x || state.measurement.start!.x)) / 2}
          y={(state.measurement.start!.y + (state.measurement.end?.y || state.measurement.start!.y)) / 2 - 10}
          fill="#ff6b6b"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          className="drop-shadow-lg"
        >
          {pixelsToUnits(state.measurement.distance!)} unidades
        </text>
      )}
    </svg>
  )
}


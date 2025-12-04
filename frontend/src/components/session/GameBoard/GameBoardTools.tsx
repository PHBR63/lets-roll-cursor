import { Button } from '@/components/ui/button'
import { Ruler, Minus, Circle, Square } from 'lucide-react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para ferramentas de desenho e medição
 */
export function GameBoardTools() {
  const { state, setState } = useGameBoardContext()

  return (
    <div className="hidden sm:flex gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
      <Button
        size="sm"
        variant={state.drawingMode === 'line' ? 'default' : 'ghost'}
        onClick={() => setState((prev) => ({
          ...prev,
          drawingMode: prev.drawingMode === 'line' ? 'none' : 'line',
        }))}
        className="text-white hover:bg-accent touch-manipulation"
        title="Linha"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={state.drawingMode === 'circle' ? 'default' : 'ghost'}
        onClick={() => setState((prev) => ({
          ...prev,
          drawingMode: prev.drawingMode === 'circle' ? 'none' : 'circle',
        }))}
        className="text-white hover:bg-accent touch-manipulation"
        title="Círculo"
      >
        <Circle className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={state.drawingMode === 'rect' ? 'default' : 'ghost'}
        onClick={() => setState((prev) => ({
          ...prev,
          drawingMode: prev.drawingMode === 'rect' ? 'none' : 'rect',
        }))}
        className="text-white hover:bg-accent touch-manipulation"
        title="Retângulo"
      >
        <Square className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={state.measurementMode ? 'default' : 'ghost'}
        onClick={() => {
          setState((prev) => ({
            ...prev,
            measurementMode: !prev.measurementMode,
            measurement: prev.measurementMode
              ? { start: null, end: null, distance: 0 }
              : prev.measurement,
          }))
        }}
        className="text-white hover:bg-accent touch-manipulation"
        title="Medição"
      >
        <Ruler className="w-4 h-4" />
      </Button>
    </div>
  )
}


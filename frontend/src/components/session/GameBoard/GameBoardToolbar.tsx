// @ts-nocheck
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, Grid, Layers } from 'lucide-react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Barra de ferramentas do GameBoard
 * Controles de zoom, grid, e camadas
 */
export function GameBoardToolbar() {
  const { state, handleZoomIn, handleZoomOut, handleReset, toggleLayer, setState } = useGameBoardContext()

  return (
    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 flex flex-col gap-2">
      {/* Controles de zoom */}
      <div className="flex flex-wrap gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomOut}
          disabled={state.zoom <= 0.5}
          className="text-white hover:bg-accent touch-manipulation"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-white text-xs md:text-sm px-1 md:px-2 flex items-center">
          {Math.round(state.zoom * 100)}%
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleZoomIn}
          disabled={state.zoom >= 3}
          className="text-white hover:bg-accent touch-manipulation"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="text-white hover:bg-accent touch-manipulation"
          title="Resetar"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={state.showGrid ? 'default' : 'ghost'}
          onClick={() => setState((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
          className="text-white hover:bg-accent touch-manipulation"
          title="Grid"
        >
          <Grid className="w-4 h-4" />
        </Button>
      </div>

      {/* Controles de camadas */}
      <div className="hidden md:block bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-semibold">Camadas</span>
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
            <input
              type="checkbox"
              checked={state.layers.background}
              onChange={() => toggleLayer('background')}
              className="w-3 h-3"
            />
            Background
          </label>
          <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
            <input
              type="checkbox"
              checked={state.layers.tokens}
              onChange={() => toggleLayer('tokens')}
              className="w-3 h-3"
            />
            Tokens
          </label>
          <label className="flex items-center gap-2 text-white text-xs cursor-pointer touch-manipulation">
            <input
              type="checkbox"
              checked={state.layers.annotations}
              onChange={() => toggleLayer('annotations')}
              className="w-3 h-3"
            />
            Anotações
          </label>
        </div>
      </div>
    </div>
  )
}


import { useRef, useCallback } from 'react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Hook para gerenciar interações do mouse/touch no GameBoard
 */
export function useGameBoardInteractions() {
  const { state, setState, setPosition, setTokens, setDrawings, setMeasurement } = useGameBoardContext()
  const containerRef = useRef<HTMLDivElement>(null)

  const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - state.position.x) / state.zoom
    const y = (e.clientY - rect.top - state.position.y) / state.zoom

    if (state.measurementMode) {
      if (!state.measurement.start) {
        setMeasurement({ start: { x, y }, end: null, distance: 0 })
      } else {
        const distance = calculateDistance(state.measurement.start, { x, y })
        setMeasurement({
          start: state.measurement.start,
          end: { x, y },
          distance,
        })
        setState((prev) => ({ ...prev, measurementMode: false }))
      }
      return
    }

    if (state.drawingMode !== 'none') {
      setState((prev) => ({
        ...prev,
        drawingStart: { x, y },
        currentDrawing: {
          id: `draw-${Date.now()}`,
          type: prev.drawingMode,
          points: [{ x, y }],
          color: '#ff6b6b',
          strokeWidth: 2,
          layer: 'annotations',
        },
      }))
      return
    }

    // Verificar se clicou em um token
    const clickedToken = state.tokens.find((token) => {
      const distance = Math.sqrt(
        Math.pow(x - token.x, 2) + Math.pow(y - token.y, 2)
      )
      return distance <= token.size / 2
    })

    if (clickedToken) {
      setState((prev) => ({
        ...prev,
        selectedToken: clickedToken.id,
        isDragging: true,
        dragStart: {
          x: e.clientX - clickedToken.x * prev.zoom,
          y: e.clientY - clickedToken.y * prev.zoom,
        },
      }))
      return
    }

    // Drag do mapa
    if (state.imageUrl) {
      setState((prev) => ({
        ...prev,
        isDragging: true,
        dragStart: {
          x: e.clientX - prev.position.x,
          y: e.clientY - prev.position.y,
        },
      }))
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - state.position.x) / state.zoom
    const y = (e.clientY - rect.top - state.position.y) / state.zoom

    if (state.measurementMode && state.measurement.start) {
      const distance = calculateDistance(state.measurement.start, { x, y })
      setMeasurement({
        start: state.measurement.start,
        end: { x, y },
        distance,
      })
      return
    }

    if (state.drawingMode !== 'none' && state.currentDrawing && state.drawingStart) {
      setState((prev) => {
        if (!prev.currentDrawing) return prev
        return {
          ...prev,
          currentDrawing: {
            ...prev.currentDrawing,
            points: [...prev.currentDrawing.points, { x, y }],
          },
        }
      })
      return
    }

    if (state.isDragging && state.selectedToken) {
      const newX = (e.clientX - state.dragStart.x) / state.zoom
      const newY = (e.clientY - state.dragStart.y) / state.zoom
      setTokens((prev) =>
        prev.map((token) =>
          token.id === state.selectedToken
            ? { ...token, x: newX, y: newY }
            : token
        )
      )
      return
    }

    if (state.isDragging && state.imageUrl) {
      setPosition({
        x: e.clientX - state.dragStart.x,
        y: e.clientY - state.dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    if (state.currentDrawing && state.drawingStart) {
      setDrawings((prev) => [...prev, state.currentDrawing!])
      setState((prev) => ({
        ...prev,
        currentDrawing: null,
        drawingStart: null,
        drawingMode: 'none',
      }))
    }
    setState((prev) => ({
      ...prev,
      isDragging: false,
      selectedToken: null,
    }))
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      setState((prev) => ({ ...prev, dragStart: { x: distance, y: 0 } }))
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && state.dragStart.x > 0) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      const scale = distance / state.dragStart.x
      const newZoom = Math.max(0.5, Math.min(3, state.zoom * scale))
      setState((prev) => ({ ...prev, zoom: newZoom }))
    }
  }, [state.dragStart, state.zoom])

  const handleTouchEnd = useCallback(() => {
    setState((prev) => ({ ...prev, dragStart: { x: 0, y: 0 } }))
  }, [])

  return {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}


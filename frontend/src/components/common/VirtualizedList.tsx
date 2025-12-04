// Temporariamente removido react-window devido a problemas de compatibilidade com v2
// import { List as FixedSizeList } from 'react-window'
import { ReactNode } from 'react'

/**
 * Props do componente de lista virtualizada
 */
interface VirtualizedListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscanCount?: number
}

/**
 * Componente de lista virtualizada
 * Renderiza apenas os itens visíveis para melhor performance
 */
export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscanCount = 5,
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index]
    return <div style={style}>{renderItem(item, index)}</div>
  }

  if (items.length === 0) {
    return null
  }

  // TODO: Reimplementar virtualização com react-window v2 quando API estiver correta
  // Por enquanto, renderização normal
  return (
    <div className={className} style={{ height, overflow: 'auto' }}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  )
}


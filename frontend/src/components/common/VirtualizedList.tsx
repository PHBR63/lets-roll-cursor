import { FixedSizeList as List } from 'react-window'
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

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      className={className}
      overscanCount={overscanCount}
    >
      {Row}
    </List>
  )
}


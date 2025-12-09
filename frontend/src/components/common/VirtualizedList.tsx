// @ts-nocheck
import { useRef, ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

/**
 * Props do componente de lista virtualizada
 */
interface VirtualizedListProps<T> {
  items: T[]
  height: number | string
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  overscan?: number
  /**
   * Estimar tamanho do item (para itens dinâmicos)
   */
  estimateSize?: (index: number) => number
}

/**
 * Componente de lista virtualizada usando @tanstack/react-virtual
 * Renderiza apenas os itens visíveis para melhor performance
 * 
 * @example
 * ```tsx
 * <VirtualizedList
 *   items={messages}
 *   height={400}
 *   itemHeight={60}
 *   renderItem={(message, index) => <MessageCard key={index} message={message} />}
 * />
 * ```
 */
export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
  estimateSize,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Calcular tamanho do item
  const getItemSize = (index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index)
    }
    if (estimateSize) {
      return estimateSize(index)
    }
    return itemHeight
  }

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan,
  })

  if (items.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-text-secondary text-sm">Nenhum item encontrado</p>
      </div>
    )
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height, overflowAnchor: 'none' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Hook para usar virtualização em listas horizontais
 */
export function useHorizontalVirtualizer<T>({
  items,
  itemWidth,
  overscan = 5,
}: {
  items: T[]
  itemWidth: number | ((index: number) => number)
  overscan?: number
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  const getItemSize = (index: number): number => {
    if (typeof itemWidth === 'function') {
      return itemWidth(index)
    }
    return itemWidth
  }

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan,
  })

  return {
    parentRef,
    virtualizer,
  }
}

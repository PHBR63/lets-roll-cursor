/**
 * Hook para calcular capacidade de carga e verificar sobrecarga
 */
import { useMemo } from 'react'
import { Attributes } from '@/types/ordemParanormal'

/**
 * Calcula capacidade máxima de carga baseado em Força
 * @param forca - Valor de Força
 * @returns Capacidade máxima de carga (mínimo 2)
 */
export function calculateMaxCarryCapacity(forca: number): number {
  return Math.max(2, 5 * forca)
}

/**
 * Verifica se o personagem está sobrecarregado
 * @param currentWeight - Peso atual do inventário
 * @param maxCapacity - Capacidade máxima de carga
 * @returns true se sobrecarregado, false caso contrário
 */
export function isOverloaded(currentWeight: number, maxCapacity: number): boolean {
  return currentWeight > maxCapacity
}

/**
 * Hook para usar capacidade de carga
 * @param attributes - Atributos do personagem
 * @param currentWeight - Peso atual do inventário
 * @returns Informações sobre carga
 */
export function useCarryCapacity(attributes: Attributes | undefined, currentWeight: number = 0) {
  const maxCapacity = useMemo(() => {
    if (!attributes) return 2
    return calculateMaxCarryCapacity(attributes.for || 0)
  }, [attributes])

  const overloaded = useMemo(() => {
    return isOverloaded(currentWeight, maxCapacity)
  }, [currentWeight, maxCapacity])

  const capacityPercentage = useMemo(() => {
    if (maxCapacity === 0) return 0
    return Math.min(100, (currentWeight / maxCapacity) * 100)
  }, [currentWeight, maxCapacity])

  return {
    maxCapacity,
    currentWeight,
    overloaded,
    capacityPercentage,
    remainingCapacity: Math.max(0, maxCapacity - currentWeight),
  }
}


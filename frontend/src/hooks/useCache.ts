import { useState, useCallback, useRef } from 'react'

/**
 * Interface para item do cache
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Opções do cache
 */
interface CacheOptions {
  ttl?: number // Time to live em milissegundos (padrão: 5 minutos)
  maxSize?: number // Tamanho máximo do cache (padrão: 100 itens)
}

/**
 * Hook para cache de dados frequentes
 * Armazena dados em memória com TTL (Time To Live)
 * Útil para evitar requisições repetidas
 */
export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options
  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map())

  /**
   * Obtém item do cache se ainda válido
   */
  const get = useCallback(
    (key: string): T | null => {
      const item = cacheRef.current.get(key)
      if (!item) return null

      const now = Date.now()
      if (now > item.expiresAt) {
        // Item expirado, remover
        cacheRef.current.delete(key)
        return null
      }

      return item.data
    },
    []
  )

  /**
   * Adiciona item ao cache
   */
  const set = useCallback(
    (key: string, data: T, customTtl?: number) => {
      const now = Date.now()
      const expiresAt = now + (customTtl || ttl)

      // Limpar cache se exceder tamanho máximo
      if (cacheRef.current.size >= maxSize) {
        // Remover item mais antigo
        const oldestKey = Array.from(cacheRef.current.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0]
        if (oldestKey) {
          cacheRef.current.delete(oldestKey)
        }
      }

      cacheRef.current.set(key, {
        data,
        timestamp: now,
        expiresAt,
      })
    },
    [ttl, maxSize]
  )

  /**
   * Remove item do cache
   */
  const remove = useCallback((key: string) => {
    cacheRef.current.delete(key)
  }, [])

  /**
   * Limpa todo o cache
   */
  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  /**
   * Verifica se item existe e está válido
   */
  const has = useCallback((key: string): boolean => {
    return get(key) !== null
  }, [get])

  /**
   * Obtém ou busca dados (com cache automático)
   */
  const getOrFetch = useCallback(
    async (
      key: string,
      fetchFn: () => Promise<T>,
      customTtl?: number
    ): Promise<T> => {
      const cached = get(key)
      if (cached !== null) {
        return cached
      }

      const data = await fetchFn()
      set(key, data, customTtl)
      return data
    },
    [get, set]
  )

  /**
   * Limpa itens expirados
   */
  const cleanExpired = useCallback(() => {
    const now = Date.now()
    for (const [key, item] of cacheRef.current.entries()) {
      if (now > item.expiresAt) {
        cacheRef.current.delete(key)
      }
    }
  }, [])

  return {
    get,
    set,
    remove,
    clear,
    has,
    getOrFetch,
    cleanExpired,
    size: cacheRef.current.size,
  }
}


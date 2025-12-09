/**
 * Sistema de Monitoramento de Performance
 * Captura métricas de Web Vitals, API times, render times
 */

import { logger } from './logger'

/**
 * Métricas de Web Vitals
 */
interface WebVitals {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  inp?: number // Interaction to Next Paint
}

/**
 * Métricas de API
 */
interface APIMetrics {
  url: string
  method: string
  duration: number
  status: number
  timestamp: number
}

/**
 * Métricas de renderização
 */
interface RenderMetrics {
  component: string
  renderTime: number
  timestamp: number
}

let performanceMetrics: {
  webVitals: Partial<WebVitals>
  apiMetrics: APIMetrics[]
  renderMetrics: RenderMetrics[]
} = {
  webVitals: {},
  apiMetrics: [],
  renderMetrics: [],
}

/**
 * Inicializar monitoramento de performance
 */
export function initPerformanceMonitoring() {
  // Web Vitals
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = entry.startTime
            performanceMetrics.webVitals.fcp = fcp
            logger.info({ fcp }, 'FCP metric')
            reportWebVital('FCP', fcp)
          }
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
    } catch (error) {
      logger.warn('Erro ao observar FCP:', error)
    }

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number
          loadTime?: number
        }
        if (lastEntry) {
          const lcp = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime
          performanceMetrics.webVitals.lcp = lcp
          logger.info({ lcp }, 'LCP metric')
          reportWebVital('LCP', lcp)
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      logger.warn('Erro ao observar LCP:', error)
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime
          performanceMetrics.webVitals.fid = fid
          logger.info({ fid }, 'FID metric')
          reportWebVital('FID', fid)
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      logger.warn('Erro ao observar FID:', error)
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as LayoutShift).hadRecentInput) {
            clsValue += (entry as LayoutShift).value
            performanceMetrics.webVitals.cls = clsValue
            logger.info({ cls: clsValue }, 'CLS metric')
            reportWebVital('CLS', clsValue)
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      logger.warn('Erro ao observar CLS:', error)
    }

    // TTFB - Time to First Byte
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            const ttfb = navEntry.responseStart - navEntry.requestStart
            performanceMetrics.webVitals.ttfb = ttfb
            logger.info({ ttfb }, 'TTFB metric')
            reportWebVital('TTFB', ttfb)
          }
        }
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      logger.warn('Erro ao observar TTFB:', error)
    }
  }
}

/**
 * Reportar Web Vital
 */
function reportWebVital(name: string, value: number) {
  // Enviar para analytics ou error tracking
  if (typeof window !== 'undefined' && (window as { gtag?: unknown }).gtag) {
    try {
      ;(window as { gtag: (command: string, targetId: string, params: Record<string, unknown>) => void }).gtag(
        'event',
        name,
        {
          value: Math.round(value),
          metric_name: name,
          metric_value: value,
        }
      )
    } catch (error) {
      logger.warn('Erro ao reportar Web Vital:', error)
    }
  }
}

/**
 * Medir tempo de API
 */
export function measureAPITime(
  url: string,
  method: string,
  duration: number,
  status: number
) {
  const metric: APIMetrics = {
    url,
    method,
    duration,
    status,
    timestamp: Date.now(),
  }

  performanceMetrics.apiMetrics.push(metric)

  // Manter apenas últimas 100 métricas
  if (performanceMetrics.apiMetrics.length > 100) {
    performanceMetrics.apiMetrics.shift()
  }

  // Log se for lento (> 1s)
  if (duration > 1000) {
    logger.warn({ metric }, 'API call lenta')
  }
}

/**
 * Medir tempo de renderização de componente
 */
export function measureRenderTime(component: string, renderTime: number) {
  const metric: RenderMetrics = {
    component,
    renderTime,
    timestamp: Date.now(),
  }

  performanceMetrics.renderMetrics.push(metric)

  // Manter apenas últimas 100 métricas
  if (performanceMetrics.renderMetrics.length > 100) {
    performanceMetrics.renderMetrics.shift()
  }

  // Log se for lento (> 16ms = 60fps)
  if (renderTime > 16) {
    logger.warn({ metric }, 'Renderização lenta')
  }
}

/**
 * Hook para medir tempo de renderização
 */
export function useRenderTime(componentName: string) {
  if (typeof window === 'undefined') return

  const startTime = performance.now()

  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    measureRenderTime(componentName, renderTime)
  }
}

/**
 * Obter métricas atuais
 */
export function getPerformanceMetrics() {
  return {
    ...performanceMetrics,
    // Calcular médias
    averageAPITime:
      performanceMetrics.apiMetrics.length > 0
        ? performanceMetrics.apiMetrics.reduce((sum, m) => sum + m.duration, 0) /
          performanceMetrics.apiMetrics.length
        : 0,
    averageRenderTime:
      performanceMetrics.renderMetrics.length > 0
        ? performanceMetrics.renderMetrics.reduce((sum, m) => sum + m.renderTime, 0) /
          performanceMetrics.renderMetrics.length
        : 0,
  }
}

/**
 * Limpar métricas
 */
export function clearPerformanceMetrics() {
  performanceMetrics = {
    webVitals: {},
    apiMetrics: [],
    renderMetrics: [],
  }
}

/**
 * Wrapper para medir tempo de função
 */
export function measureFunctionTime<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name?: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now()
    const result = fn(...args)
    const endTime = performance.now()
    const duration = endTime - startTime

    if (duration > 100) {
      logger.warn({ duration, function: name || fn.name }, 'Função lenta')
    }

    return result
  }) as T
}

/**
 * Wrapper para medir tempo de Promise
 */
export async function measurePromiseTime<T>(
  promise: Promise<T>,
  name?: string
): Promise<T> {
  const startTime = performance.now()
  try {
    const result = await promise
    const endTime = performance.now()
    const duration = endTime - startTime

    if (duration > 1000) {
      logger.warn({ duration, promise: name }, 'Promise lenta')
    }

    return result
  } catch (error) {
    const endTime = performance.now()
    const duration = endTime - startTime
    logger.error({ duration, promise: name, error }, 'Promise falhou')
    throw error
  }
}

// Tipos auxiliares
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}


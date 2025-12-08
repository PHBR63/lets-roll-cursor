/**
 * Testes para o hook useAccessibility
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAccessibility, updateAccessibilityPreferences } from '../useAccessibility'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('useAccessibility', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('deve retornar valores padrão quando não há preferências salvas', () => {
    const { result } = renderHook(() => useAccessibility())
    
    expect(result.current.reducedMotion).toBe(true) // Mock retorna true
    expect(result.current.disableVisualEffects).toBe(false)
    expect(result.current.disableSounds).toBe(false)
  })

  it('deve ler preferências do localStorage', () => {
    localStorageMock.setItem('accessibility-disable-visual-effects', 'true')
    localStorageMock.setItem('accessibility-disable-sounds', 'true')
    
    const { result } = renderHook(() => useAccessibility())
    
    expect(result.current.disableVisualEffects).toBe(true)
    expect(result.current.disableSounds).toBe(true)
  })

  it('deve atualizar preferências via updateAccessibilityPreferences', () => {
    updateAccessibilityPreferences({
      disableVisualEffects: true,
      disableSounds: true,
    })
    
    expect(localStorageMock.getItem('accessibility-disable-visual-effects')).toBe('true')
    expect(localStorageMock.getItem('accessibility-disable-sounds')).toBe('true')
  })

  it('deve atualizar apenas preferências fornecidas', () => {
    localStorageMock.setItem('accessibility-disable-visual-effects', 'true')
    
    updateAccessibilityPreferences({
      disableSounds: true,
    })
    
    expect(localStorageMock.getItem('accessibility-disable-visual-effects')).toBe('true')
    expect(localStorageMock.getItem('accessibility-disable-sounds')).toBe('true')
  })
})


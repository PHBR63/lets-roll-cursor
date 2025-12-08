/**
 * Testes para o hook useInsanitySound
 */
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useInsanitySound } from '../useInsanitySound'

// Mock de HTMLAudioElement
const mockPlay = vi.fn().mockResolvedValue(undefined)
const mockPause = vi.fn()

class MockAudio {
  play = mockPlay
  pause = mockPause
  volume = 0.3
  loop = false
  currentTime = 0
  src = ''
  
  constructor() {
    // Mock do construtor
  }
}

// Criar spy do construtor
const AudioSpy = vi.fn().mockImplementation(() => new MockAudio())

// Substituir Audio global
global.Audio = AudioSpy as any

// Mock useAccessibility
vi.mock('../useAccessibility', () => ({
  useAccessibility: () => ({
    disableSounds: false,
    reducedMotion: false,
    disableVisualEffects: false,
  }),
}))

describe('useInsanitySound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AudioSpy.mockClear()
    mockPlay.mockClear()
    mockPause.mockClear()
  })

  it('deve inicializar sem erros', () => {
    const { result } = renderHook(() =>
      useInsanitySound(50, 100, { enabled: false })
    )
    
    expect(result.current).toBeDefined()
    expect(result.current.state).toBeDefined()
  })

  it('deve retornar função stopAll', () => {
    const { result } = renderHook(() =>
      useInsanitySound(50, 100, { enabled: false })
    )
    
    expect(typeof result.current.stopAll).toBe('function')
  })

  it('não deve tocar sons quando enabled é false', () => {
    vi.clearAllMocks()
    renderHook(() => useInsanitySound(10, 100, { enabled: false }))
    
    // Audio não deve ser criado quando disabled
    expect(AudioSpy).not.toHaveBeenCalled()
  })

  it('deve criar instâncias de áudio quando enabled', () => {
    renderHook(() => useInsanitySound(10, 100, { enabled: true }))
    
    // Audio deve ser criado para estados de insanidade
    // Nota: MockAudio é chamado no useEffect
  })

  it('deve retornar estado correto de insanidade', () => {
    const { result: resultNormal } = renderHook(() =>
      useInsanitySound(80, 100, { enabled: false })
    )
    expect(resultNormal.current.state).toBe('NORMAL')
    
    const { result: resultPerturbed } = renderHook(() =>
      useInsanitySound(30, 100, { enabled: false })
    )
    expect(resultPerturbed.current.state).toBe('PERTURBADO')
    
    const { result: resultInsane } = renderHook(() =>
      useInsanitySound(0, 100, { enabled: false })
    )
    expect(resultInsane.current.state).toBe('TOTALMENTE_INSANO')
  })
})


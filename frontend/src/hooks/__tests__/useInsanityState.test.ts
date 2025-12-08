/**
 * Testes para o hook useInsanityState
 */
import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useInsanityState } from '../useInsanityState'

describe('useInsanityState', () => {
  it('deve retornar estado NORMAL quando SAN está alta', () => {
    const { result } = renderHook(() => useInsanityState(80, 100))
    
    expect(result.current.state).toBe('NORMAL')
    expect(result.current.severity).toBe(0)
    expect(result.current.percentage).toBe(80)
    expect(result.current.color).toBe('#22C55E') // Verde
    expect(result.current.intensity).toBe(0)
    expect(result.current.pulse).toBe(false)
  })

  it('deve retornar estado ABALADO_MENTAL quando SAN está entre 75-100%', () => {
    const { result } = renderHook(() => useInsanityState(80, 100))
    
    expect(result.current.state).toBe('NORMAL')
  })

  it('deve retornar estado ABALADO_MENTAL quando SAN está entre 50-75%', () => {
    const { result } = renderHook(() => useInsanityState(60, 100))
    
    expect(result.current.state).toBe('ABALADO_MENTAL')
    expect(result.current.severity).toBe(1)
    expect(result.current.percentage).toBe(60)
    expect(result.current.color).toBe('#3B82F6') // Azul
    expect(result.current.intensity).toBeGreaterThan(0)
    expect(result.current.intensity).toBeLessThanOrEqual(0.25)
  })

  it('deve retornar estado PERTURBADO quando SAN está entre 25-50%', () => {
    const { result } = renderHook(() => useInsanityState(30, 100))
    
    expect(result.current.state).toBe('PERTURBADO')
    expect(result.current.severity).toBe(2)
    expect(result.current.percentage).toBe(30)
    expect(result.current.color).toBe('#EAB308') // Amarelo
    expect(result.current.intensity).toBeGreaterThan(0.25)
    expect(result.current.intensity).toBeLessThanOrEqual(0.5)
  })

  it('deve retornar estado ENLOUQUECENDO quando SAN está entre 0-25%', () => {
    const { result } = renderHook(() => useInsanityState(10, 100))
    
    expect(result.current.state).toBe('ENLOUQUECENDO')
    expect(result.current.severity).toBe(3)
    expect(result.current.percentage).toBe(10)
    expect(result.current.color).toBe('#F97316') // Laranja
    expect(result.current.intensity).toBeGreaterThan(0.5)
    expect(result.current.intensity).toBeLessThanOrEqual(0.75)
    expect(result.current.pulse).toBe(true)
  })

  it('deve retornar estado TOTALMENTE_INSANO quando SAN é 0', () => {
    const { result } = renderHook(() => useInsanityState(0, 100))
    
    expect(result.current.state).toBe('TOTALMENTE_INSANO')
    expect(result.current.severity).toBe(4)
    expect(result.current.percentage).toBe(0)
    expect(result.current.color).toBe('#DC2626') // Vermelho
    expect(result.current.intensity).toBe(1.0)
    expect(result.current.pulse).toBe(true)
  })

  it('deve retornar estado NORMAL quando maxSAN é 0', () => {
    const { result } = renderHook(() => useInsanityState(0, 0))
    
    expect(result.current.state).toBe('NORMAL')
    expect(result.current.severity).toBe(0)
    expect(result.current.percentage).toBe(100)
  })

  it('deve calcular porcentagem corretamente', () => {
    const { result } = renderHook(() => useInsanityState(25, 50))
    
    expect(result.current.percentage).toBe(50)
  })

  it('deve atualizar estado quando valores mudam', () => {
    const { result, rerender } = renderHook(
      ({ current, max }) => useInsanityState(current, max),
      { initialProps: { current: 100, max: 100 } }
    )
    
    expect(result.current.state).toBe('NORMAL')
    
    rerender({ current: 20, max: 100 })
    expect(result.current.state).toBe('ENLOUQUECENDO') // 20% está entre 0-25%
    
    rerender({ current: 0, max: 100 })
    expect(result.current.state).toBe('TOTALMENTE_INSANO')
  })
})


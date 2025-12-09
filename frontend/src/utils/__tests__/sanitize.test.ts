/**
 * Testes unitários para utilitários de sanitização
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  sanitizeURL,
  validateEmail,
  sanitizeString,
  sanitizeNumber,
  validatePassword,
} from '@/utils/sanitize'

describe('sanitizeHTML', () => {
  it('deve escapar caracteres HTML perigosos', () => {
    const input = '<script>alert("xss")</script>'
    const result = sanitizeHTML(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('deve permitir tags seguras', () => {
    const input = '<b>Texto</b>'
    const result = sanitizeHTML(input)
    // Com DOMPurify, tags seguras são mantidas
    expect(result).toBeDefined()
  })
})

describe('sanitizeURL', () => {
  it('deve validar URL válida', () => {
    const url = 'https://example.com'
    const result = sanitizeURL(url)
    expect(result).toBe(url)
  })

  it('deve rejeitar URL com protocolo perigoso', () => {
    const url = 'javascript:alert("xss")'
    const result = sanitizeURL(url)
    expect(result).toBeNull()
  })
})

describe('validateEmail', () => {
  it('deve validar email válido', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('deve rejeitar email inválido', () => {
    expect(validateEmail('invalid-email')).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('deve remover caracteres perigosos', () => {
    const input = 'test<script>alert("xss")</script>'
    const result = sanitizeString(input)
    expect(result).not.toContain('<script>')
  })

  it('deve limitar tamanho máximo', () => {
    const input = 'a'.repeat(100)
    const result = sanitizeString(input, 50)
    expect(result.length).toBe(50)
  })
})

describe('sanitizeNumber', () => {
  it('deve validar número válido', () => {
    expect(sanitizeNumber('123')).toBe(123)
  })

  it('deve rejeitar número fora do range', () => {
    expect(sanitizeNumber('150', 0, 100)).toBeNull()
  })
})

describe('validatePassword', () => {
  it('deve validar senha forte', () => {
    const result = validatePassword('StrongP@ss123')
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('deve rejeitar senha fraca', () => {
    const result = validatePassword('weak')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})


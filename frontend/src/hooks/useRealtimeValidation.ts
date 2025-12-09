// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'

/**
 * Regra de validação
 */
export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  firstError?: string
}

/**
 * Hook para validação em tempo real
 */
export function useRealtimeValidation(
  value: string,
  rules: ValidationRule[],
  debounceMs: number = 300
) {
  const [errors, setErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [touched, setTouched] = useState(false)

  const validate = useCallback((val: string): ValidationResult => {
    const validationErrors: string[] = []

    for (const rule of rules) {
      if (!rule.test(val)) {
        validationErrors.push(rule.message)
      }
    }

    return {
      valid: validationErrors.length === 0,
      errors: validationErrors,
      firstError: validationErrors[0],
    }
  }, [rules])

  // Validar quando valor mudar (com debounce)
  useEffect(() => {
    if (!touched && value === '') {
      return
    }

    setIsValidating(true)
    const timer = setTimeout(() => {
      const result = validate(value)
      setErrors(result.errors)
      setIsValidating(false)
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      setIsValidating(false)
    }
  }, [value, touched, debounceMs, validate])

  const markAsTouched = useCallback(() => {
    setTouched(true)
  }, [])

  const reset = useCallback(() => {
    setErrors([])
    setTouched(false)
    setIsValidating(false)
  }, [])

  const result = validate(value)

  return {
    ...result,
    errors: touched ? errors : [],
    isValidating,
    touched,
    markAsTouched,
    reset,
  }
}

/**
 * Regras de validação comuns
 */
export const validationRules = {
  required: (message = 'Este campo é obrigatório'): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Mínimo de ${min} caracteres`,
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Máximo de ${max} caracteres`,
  }),
  
  email: (message = 'Email inválido'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  
  url: (message = 'URL inválida'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message,
  }),
  
  numeric: (message = 'Apenas números'): ValidationRule => ({
    test: (value) => /^\d+$/.test(value),
    message,
  }),
  
  alphanumeric: (message = 'Apenas letras e números'): ValidationRule => ({
    test: (value) => /^[a-zA-Z0-9]+$/.test(value),
    message,
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => regex.test(value),
    message,
  }),
  
  custom: (test: (value: string) => boolean, message: string): ValidationRule => ({
    test,
    message,
  }),
}


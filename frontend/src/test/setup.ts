/**
 * Configuração de setup para testes
 */
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Estender expect com matchers do jest-dom
expect.extend(matchers)

// Limpar após cada teste
afterEach(() => {
  cleanup()
})


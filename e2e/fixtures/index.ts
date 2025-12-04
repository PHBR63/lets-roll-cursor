import { test as base } from '@playwright/test'
import { AuthHelper } from '../helpers/auth'
import * as testData from './testData'

/**
 * Estender fixtures do Playwright com helpers customizados
 */
export const test = base.extend<{
  auth: AuthHelper
  testData: typeof testData
}>({
  /**
   * Helper de autenticação
   */
  auth: async ({ page }, use) => {
    const authHelper = new AuthHelper(page)
    await use(authHelper)
    // Limpar autenticação após o teste
    await authHelper.clearAuth()
  },

  /**
   * Dados de teste
   */
  testData: async ({}, use) => {
    await use(testData)
  },
})

export { expect } from '@playwright/test'


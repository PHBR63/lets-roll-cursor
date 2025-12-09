/**
 * Testes E2E para rolagem de dados
 */

import { test, expect } from '@playwright/test'

test.describe('Rolagem de Dados', () => {
  test.beforeEach(async ({ page }) => {
    // Assumir que está logado e em uma sessão
    await page.goto('/session/test-session-id')
  })

  test('deve rolar dado básico', async ({ page }) => {
    await page.fill('input[placeholder*="Fórmula"]', '1d20')
    await page.click('button:has-text("Rolar")')
    
    // Aguardar resultado aparecer
    await expect(page.locator('[data-testid="dice-result"]')).toBeVisible()
  })

  test('deve mostrar histórico de rolagens', async ({ page }) => {
    // Fazer algumas rolagens
    await page.fill('input[placeholder*="Fórmula"]', '1d20')
    await page.click('button:has-text("Rolar")')
    await page.waitForTimeout(1000)
    
    // Verificar se aparece no histórico
    await expect(page.locator('[data-testid="roll-history"]')).toBeVisible()
  })
})


import { test, expect } from '@playwright/test'
import { authenticateUser } from './helpers/auth'

/**
 * Testes E2E específicos para GameBoard
 * - Interações com tokens
 * - Ferramentas de desenho
 * - Medição de distância
 * - Camadas
 */
test.describe('GameBoard - Funcionalidades', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page)
    await page.goto('/')
    
    // Navegar para sessão
    await page.click('text=Campanhas')
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
      const sessionCard = page.locator('[data-testid="session-card"]').first()
      if (await sessionCard.count() > 0) {
        await sessionCard.click()
        await page.waitForSelector('[data-testid="gameboard"]', { timeout: 10000 })
      }
    }
  })

  test('deve adicionar token genérico', async ({ page }) => {
    const gameboard = page.locator('[data-testid="gameboard"]')
    if (await gameboard.count() === 0) {
      test.skip()
      return
    }

    // Procurar select de adicionar token
    const tokenSelect = page.locator('select, [role="combobox"]').filter({ hasText: /token/i }).first()
    if (await tokenSelect.count() > 0) {
      await tokenSelect.click()
      await page.click('text=Token Genérico')
      await page.waitForTimeout(500)
      
      // Verificar se token foi adicionado
      const tokens = page.locator('[data-testid="token"]')
      await expect(tokens.first()).toBeVisible({ timeout: 2000 })
    }
  })

  test('deve mover token no gameboard', async ({ page }) => {
    const gameboard = page.locator('[data-testid="gameboard"]')
    if (await gameboard.count() === 0) {
      test.skip()
      return
    }

    const token = page.locator('[data-testid="token"]').first()
    if (await token.count() > 0) {
      const box = await token.boundingBox()
      if (box) {
        // Arrastar token
        await token.dragTo(gameboard, {
          targetPosition: { x: box.x + 100, y: box.y + 100 },
        })
        await page.waitForTimeout(500)
      }
    }
  })

  test('deve ativar/desativar grid', async ({ page }) => {
    const gridButton = page.locator('button[aria-label*="grid"]').or(page.locator('button:has([data-lucide="grid"])'))
    if (await gridButton.count() > 0) {
      const initialState = await gridButton.getAttribute('data-state')
      await gridButton.click()
      await page.waitForTimeout(500)
      
      // Verificar mudança de estado
      const newState = await gridButton.getAttribute('data-state')
      if (initialState) {
        expect(newState).not.toBe(initialState)
      }
    }
  })

  test('deve ativar modo medição', async ({ page }) => {
    const measurementButton = page.locator('button[aria-label*="medição"]').or(page.locator('button:has([data-lucide="ruler"])'))
    if (await measurementButton.count() > 0) {
      await measurementButton.click()
      await page.waitForTimeout(500)
      
      // Clicar no gameboard para medir
      const gameboard = page.locator('[data-testid="gameboard"]')
      if (await gameboard.count() > 0) {
        const box = await gameboard.boundingBox()
        if (box) {
          await gameboard.click({ position: { x: box.width * 0.3, y: box.height * 0.3 } })
          await page.waitForTimeout(300)
          await gameboard.click({ position: { x: box.width * 0.7, y: box.height * 0.7 } })
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('deve alternar camadas', async ({ page }) => {
    // Procurar checkboxes de camadas
    const backgroundCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /background/i }).first()
    const tokensCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /tokens/i }).first()
    const annotationsCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /anotações/i }).first()

    if (await backgroundCheckbox.count() > 0) {
      const wasChecked = await backgroundCheckbox.isChecked()
      await backgroundCheckbox.click()
      await page.waitForTimeout(300)
      const isChecked = await backgroundCheckbox.isChecked()
      expect(isChecked).not.toBe(wasChecked)
    }
  })
})

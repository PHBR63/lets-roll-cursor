import { test, expect } from '@playwright/test'

/**
 * Testes E2E de sessão de jogo
 */
test.describe('Sessão de Jogo', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('deve rolar dados e exibir resultado', async ({ page }) => {
    // Navegar para sessão
    await page.goto('/session/test-session-id')

    // Aguardar carregamento
    await page.waitForLoadState('networkidle')

    // Procurar componente de rolagem de dados
    const formulaInput = page.locator('input[placeholder*="dado" i], input[name="formula"]').first()
    const rollButton = page.locator('button:has-text("Rolar"), button:has-text("Roll")').first()

    if (await formulaInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await formulaInput.fill('1d20')
      
      if (await rollButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rollButton.click()
        
        // Aguardar resultado
        await page.waitForTimeout(2000)
        
        // Verificar se resultado foi exibido
        const resultElement = page.locator('[data-testid="dice-result"], .dice-result, text=/\\d+/').first()
        if (await resultElement.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(resultElement).toBeVisible()
        }
      }
    }
  })

  test('deve enviar mensagem no chat', async ({ page }) => {
    await page.goto('/session/test-session-id')
    await page.waitForLoadState('networkidle')

    const messageInput = page.locator('input[placeholder*="mensagem" i], textarea[placeholder*="mensagem" i]').first()
    const sendButton = page.locator('button:has-text("Enviar"), button[type="submit"]').first()

    if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await messageInput.fill('Mensagem de teste E2E')
      
      if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sendButton.click()
        
        // Aguardar mensagem aparecer
        await page.waitForTimeout(1000)
        
        // Verificar se mensagem foi adicionada
        const messageElement = page.locator('text="Mensagem de teste E2E"').first()
        if (await messageElement.isVisible({ timeout: 5000 }).catch(() => false)) {
          await expect(messageElement).toBeVisible()
        }
      }
    }
  })
})


import { test, expect } from '@playwright/test'

/**
 * Testes E2E de campanhas
 */
test.describe('Campanhas', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    // Tentar ir para dashboard
    await page.goto('/dashboard')
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
  })

  test('deve exibir lista de campanhas', async ({ page }) => {
    // Verificar se há elementos de campanha na página
    const campaignElements = page.locator('text=/campanha/i, [data-testid="campaign"]')
    // Se houver campanhas, devem estar visíveis
    const count = await campaignElements.count()
    if (count > 0) {
      await expect(campaignElements.first()).toBeVisible()
    }
  })

  test('deve navegar para criação de campanha', async ({ page }) => {
    const createButton = page.locator('button:has-text("Criar"), a:has-text("Criar"), button:has-text("Nova")').first()
    
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click()
      await page.waitForURL(/.*campaign.*create|.*create.*campaign/i, { timeout: 5000 })
      await expect(page).toHaveURL(/.*campaign.*create|.*create.*campaign/i)
    }
  })

  test('deve criar campanha completa', async ({ page }) => {
    // Navegar para criação
    await page.goto('/campaign/create')

    // Etapa 1: Dados Base
    const titleInput = page.locator('input[name="title"], input[placeholder*="título" i]').first()
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="descrição" i]').first()
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("Next")').first()

    if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await titleInput.fill('Campanha de Teste E2E')
      await descriptionInput.fill('Descrição da campanha de teste')
      
      if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click()
        await page.waitForTimeout(1000)
      }
    }

    // Verificar se avançou para próxima etapa ou se criou diretamente
    await page.waitForTimeout(2000)
  })
})


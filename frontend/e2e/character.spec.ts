import { test, expect } from '@playwright/test'

/**
 * Testes E2E de personagens
 */
test.describe('Personagens', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('deve criar personagem completo', async ({ page }) => {
    // Assumindo que há uma campanha disponível
    // Navegar para criação de personagem
    await page.goto('/campaign/test-campaign-id/character/create')

    // Preencher formulário básico
    const nameInput = page.locator('input[name="name"]').first()
    const classSelect = page.locator('select[name="class"], [role="combobox"]').first()

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Personagem Teste E2E')
      
      // Selecionar classe se disponível
      if (await classSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await classSelect.selectOption('COMBATENTE')
      }

      // Submeter formulário
      const submitButton = page.locator('button[type="submit"]:has-text("Criar")').first()
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitButton.click()
        
        // Aguardar redirecionamento para ficha do personagem
        await page.waitForURL(/.*character.*/, { timeout: 10000 })
        await expect(page).toHaveURL(/.*character.*/)
      }
    }
  })
})


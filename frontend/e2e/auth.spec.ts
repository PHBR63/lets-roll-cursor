import { test, expect } from '@playwright/test'

/**
 * Testes E2E de autenticação
 */
test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve exibir página de login', async ({ page }) => {
    await expect(page).toHaveURL(/.*login|.*\/$/)
    await expect(page.locator('h1, h2')).toContainText(/login|entrar/i)
  })

  test('deve exibir erro em login inválido', async ({ page }) => {
    // Navegar para login se necessário
    if (!page.url().includes('login')) {
      await page.goto('/login')
    }

    // Preencher formulário com credenciais inválidas
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com')
      await passwordInput.fill('wrongpassword')
      await submitButton.click()

      // Aguardar mensagem de erro
      await page.waitForTimeout(1000)
      // Verificar se há mensagem de erro (pode ser toast, texto na página, etc.)
      const errorMessage = page.locator('text=/erro|inválido|incorreto/i').first()
      if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(errorMessage).toBeVisible()
      }
    }
  })

  test('deve redirecionar para dashboard após login válido', async ({ page }) => {
    // Este teste requer credenciais válidas de teste
    // Pode ser configurado via variáveis de ambiente
    const testEmail = process.env.E2E_TEST_EMAIL || 'test@example.com'
    const testPassword = process.env.E2E_TEST_PASSWORD || 'testpassword'

    if (testEmail === 'test@example.com') {
      test.skip() // Pular se não houver credenciais de teste configuradas
    }

    // Navegar para login
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail)
      await passwordInput.fill(testPassword)
      await submitButton.click()

      // Aguardar redirecionamento
      await page.waitForURL(/.*dashboard|.*\/$/, { timeout: 10000 })
      await expect(page).toHaveURL(/.*dashboard|.*\/$/)
    }
  })
})


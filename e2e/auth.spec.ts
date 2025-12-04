import { test, expect } from './fixtures'

/**
 * Testes E2E para autenticação
 */
test.describe('Autenticação', () => {
  test.beforeEach(async ({ page, auth }) => {
    // Limpar autenticação antes de cada teste
    await auth.clearAuth()
    // Navegar para a página inicial
    await page.goto('/')
  })

  test('deve exibir página de login', async ({ page }) => {
    // Verificar se está na página de login
    await expect(page).toHaveURL(/.*login/)
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('deve validar campos obrigatórios no login', async ({ page }) => {
    // Tentar fazer login sem preencher campos
    await page.getByRole('button', { name: /entrar/i }).click()

    // Verificar mensagens de erro
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible()
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible()
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    // Preencher formulário com credenciais inválidas
    await page.getByLabel(/email/i).fill('teste@invalido.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Verificar mensagem de erro
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible({ timeout: 5000 })
  })

  test('deve navegar para registro', async ({ page }) => {
    // Clicar no link de registro
    await page.getByRole('link', { name: /criar conta/i }).click()

    // Verificar se está na página de registro
    await expect(page).toHaveURL(/.*register/)
    await expect(page.getByRole('heading', { name: /registro/i })).toBeVisible()
  })

  test('deve validar formulário de registro', async ({ page }) => {
    // Navegar para registro
    await page.getByRole('link', { name: /criar conta/i }).click()

    // Tentar registrar sem preencher campos
    await page.getByRole('button', { name: /registrar/i }).click()

    // Verificar mensagens de erro
    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible()
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible()
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible()
  })
})


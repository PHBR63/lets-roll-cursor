import { test, expect } from './fixtures'

/**
 * Testes E2E para criação de campanha
 */
test.describe('Criação de Campanha', () => {
  test.beforeEach(async ({ page, auth, testData }) => {
    // Limpar autenticação
    await auth.clearAuth()
    
    // Fazer login como master
    await auth.login(testData.testUsers.master.email, testData.testUsers.master.password)
  })

  test('deve exibir lista de campanhas no dashboard', async ({ page }) => {
    // Navegar para dashboard (assumindo que está logado)
    await page.goto('/dashboard')

    // Verificar se há botão para criar campanha
    await expect(page.getByRole('button', { name: /nova campanha/i })).toBeVisible()
  })

  test('deve abrir modal de criação de campanha', async ({ page }) => {
    await page.goto('/dashboard')

    // Clicar no botão de nova campanha
    await page.getByRole('button', { name: /nova campanha/i }).click()

    // Verificar se o modal foi aberto
    await expect(page.getByRole('heading', { name: /criar campanha/i })).toBeVisible()
  })

  test('deve validar formulário de criação de campanha', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /nova campanha/i }).click()

    // Tentar criar sem preencher campos
    await page.getByRole('button', { name: /criar/i }).click()

    // Verificar mensagens de erro
    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible()
  })

  test('deve criar campanha com dados válidos', async ({ page, testData }) => {
    await page.goto('/dashboard')
    await page.getByRole('button', { name: /nova campanha/i }).click()

    // Preencher formulário com dados de teste
    const campaign = testData.testCampaigns.ordemParanormal
    await page.getByLabel(/nome/i).fill(campaign.name)
    await page.getByLabel(/descrição/i).fill(campaign.description)
    await page.getByLabel(/sistema/i).selectOption(campaign.system_rpg)

    // Criar campanha
    await page.getByRole('button', { name: /criar/i }).click()

    // Verificar se a campanha foi criada (redirecionamento ou mensagem de sucesso)
    await expect(page.getByText(/campanha criada com sucesso/i)).toBeVisible({ timeout: 10000 })
  })
})


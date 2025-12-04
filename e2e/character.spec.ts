import { test, expect } from './fixtures'

/**
 * Testes E2E para criação de personagem
 */
test.describe('Criação de Personagem', () => {
  test.beforeEach(async ({ page, auth, testData }) => {
    // Limpar autenticação
    await auth.clearAuth()
    
    // Fazer login como player
    await auth.login(testData.testUsers.player.email, testData.testUsers.player.password)
  })

  test('deve exibir lista de personagens na campanha', async ({ page }) => {
    // Navegar para detalhes da campanha (assumindo que existe)
    await page.goto('/campaign/test-campaign-id')

    // Verificar se há botão para criar personagem
    await expect(page.getByRole('button', { name: /novo personagem/i })).toBeVisible()
  })

  test('deve abrir formulário de criação de personagem', async ({ page }) => {
    await page.goto('/campaign/test-campaign-id')
    await page.getByRole('button', { name: /novo personagem/i }).click()

    // Verificar se o formulário foi aberto
    await expect(page.getByRole('heading', { name: /criar personagem/i })).toBeVisible()
  })

  test('deve validar formulário de criação de personagem', async ({ page }) => {
    await page.goto('/campaign/test-campaign-id')
    await page.getByRole('button', { name: /novo personagem/i }).click()

    // Tentar criar sem preencher campos obrigatórios
    await page.getByRole('button', { name: /criar/i }).click()

    // Verificar mensagens de erro
    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible()
  })

  test('deve criar personagem com dados válidos', async ({ page, testData }) => {
    await page.goto('/campaign/test-campaign-id')
    await page.getByRole('button', { name: /novo personagem/i }).click()

    // Preencher formulário com dados de teste
    const character = testData.testCharacters.combatente
    await page.getByLabel(/nome/i).fill(character.name)
    await page.getByLabel(/classe/i).selectOption(character.class)

    // Criar personagem
    await page.getByRole('button', { name: /criar/i }).click()

    // Verificar se o personagem foi criado
    await expect(page.getByText(/personagem criado com sucesso/i)).toBeVisible({ timeout: 10000 })
  })
})


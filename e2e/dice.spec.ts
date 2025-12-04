import { test, expect } from './fixtures'

/**
 * Testes E2E para rolagem de dados
 */
test.describe('Rolagem de Dados', () => {
  test.beforeEach(async ({ page, auth, testData }) => {
    // Limpar autenticação
    await auth.clearAuth()
    
    // Fazer login como player
    await auth.login(testData.testUsers.player.email, testData.testUsers.player.password)
  })

  test('deve exibir componente de rolagem de dados na sessão', async ({ page }) => {
    // Navegar para sessão de jogo (assumindo que existe)
    await page.goto('/session/test-session-id')

    // Verificar se o componente de rolagem está visível
    await expect(page.getByRole('button', { name: /rolar/i })).toBeVisible()
  })

  test('deve rolar dados básicos', async ({ page, testData }) => {
    await page.goto('/session/test-session-id')

    // Selecionar tipo de rolagem básica
    await page.getByRole('tab', { name: /básica/i }).click()

    // Preencher quantidade de dados com dados de teste
    const diceRoll = testData.testDiceRolls.basic
    await page.getByLabel(/quantidade/i).fill(diceRoll.quantity.toString())
    await page.getByLabel(/faces/i).selectOption(diceRoll.faces.toString())

    // Rolar dados
    await page.getByRole('button', { name: /rolar/i }).click()

    // Verificar se o resultado foi exibido
    await expect(page.getByText(/\d+/)).toBeVisible({ timeout: 5000 })
  })

  test('deve rolar teste de perícia', async ({ page }) => {
    await page.goto('/session/test-session-id')

    // Selecionar tipo de rolagem de perícia
    await page.getByRole('tab', { name: /perícia/i }).click()

    // Selecionar perícia
    await page.getByLabel(/perícia/i).selectOption('Luta')

    // Rolar teste
    await page.getByRole('button', { name: /rolar/i }).click()

    // Verificar se o resultado foi exibido
    await expect(page.getByText(/sucesso|falha/i)).toBeVisible({ timeout: 5000 })
  })

  test('deve exibir histórico de rolagens', async ({ page }) => {
    await page.goto('/session/test-session-id')

    // Fazer algumas rolagens
    await page.getByRole('button', { name: /rolar/i }).click()
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: /rolar/i }).click()

    // Verificar se o histórico está visível
    await expect(page.getByText(/histórico/i)).toBeVisible()
    // Verificar se há itens no histórico
    const historyItems = page.locator('[data-testid="roll-history-item"]')
    await expect(historyItems).toHaveCount(2)
  })
})


import { Page } from '@playwright/test'

/**
 * Helper para autenticação em testes E2E
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Faz login com credenciais fornecidas
   * @param email - Email do usuário
   * @param password - Senha do usuário
   */
  async login(email: string, password: string) {
    await this.page.goto('/login')

    // Preencher formulário de login
    await this.page.getByLabel(/e-mail/i).fill(email)
    await this.page.getByLabel(/senha/i).fill(password)

    // Submeter formulário
    await this.page.getByRole('button', { name: /entrar/i }).click()

    // Aguardar redirecionamento para dashboard
    await this.page.waitForURL(/.*dashboard/, { timeout: 10000 })
  }

  /**
   * Registra um novo usuário
   * @param userData - Dados do usuário
   */
  async register(userData: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) {
    await this.page.goto('/register')

    // Preencher formulário de registro
    await this.page.getByLabel(/usuário/i).fill(userData.username)
    await this.page.getByLabel(/e-mail/i).fill(userData.email)
    await this.page.getByLabel(/senha/i).fill(userData.password)
    await this.page.getByLabel(/confirmar senha/i).fill(userData.confirmPassword)

    // Submeter formulário
    await this.page.getByRole('button', { name: /registrar/i }).click()

    // Aguardar redirecionamento ou mensagem de sucesso
    await this.page.waitForTimeout(2000)
  }

  /**
   * Faz logout
   */
  async logout() {
    // Procurar botão de logout (pode estar em menu dropdown)
    const logoutButton = this.page.getByRole('button', { name: /sair|logout|sair da conta/i })
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    } else {
      // Tentar encontrar em menu dropdown
      const menuButton = this.page.locator('[data-testid="user-menu"]')
      if (await menuButton.isVisible()) {
        await menuButton.click()
        await this.page.getByRole('menuitem', { name: /sair/i }).click()
      }
    }

    // Aguardar redirecionamento para login
    await this.page.waitForURL(/.*login/, { timeout: 5000 })
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Verificar se há token de autenticação no localStorage
      const token = await this.page.evaluate(() => {
        return localStorage.getItem('supabase.auth.token')
      })
      return !!token
    } catch {
      return false
    }
  }

  /**
   * Limpa a autenticação (limpa localStorage e cookies)
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await this.page.context().clearCookies()
  }
}

/**
 * Função helper simplificada para autenticação rápida
 */
export async function authenticateUser(page: Page) {
  const helper = new AuthHelper(page)
  
  // Tentar usar credenciais de teste ou variáveis de ambiente
  const testEmail = process.env.E2E_TEST_EMAIL || 'test@example.com'
  const testPassword = process.env.E2E_TEST_PASSWORD || 'test123456'
  
  // Verificar se já está autenticado
  const isAuth = await helper.isAuthenticated()
  if (!isAuth) {
    try {
      await helper.login(testEmail, testPassword)
    } catch {
      // Se login falhar, tentar registrar
      await helper.register({
        username: 'testuser',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      })
    }
  }
}

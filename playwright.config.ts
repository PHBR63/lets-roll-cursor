import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Executar testes em arquivos em paralelo */
  fullyParallel: true,
  /* Falhar o build no CI se você deixar test.only no código */
  forbidOnly: !!process.env.CI,
  /* Retry no CI apenas */
  retries: process.env.CI ? 2 : 0,
  /* Limite de workers no CI, usar padrão localmente */
  workers: process.env.CI ? 1 : undefined,
  /* Configuração de reporter */
  reporter: 'html',
  /* Opções compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegação como `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    /* Coletar trace quando retentar o teste falhado. Ver https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configurar projetos para múltiplos navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Executar servidor de desenvolvimento local antes de iniciar os testes */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})


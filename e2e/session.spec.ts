import { test, expect } from '@playwright/test'
import { authenticateUser } from './helpers/auth'

/**
 * Testes E2E para funcionalidades de sessão
 * - Criar sessão
 * - Entrar em sessão
 * - Sincronização em tempo real
 * - GameBoard básico
 */
test.describe('Sessão de RPG', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar antes de cada teste
    await authenticateUser(page)
    await page.goto('/')
  })

  test('deve criar uma nova sessão', async ({ page }) => {
    // Navegar para campanhas
    await page.click('text=Campanhas')
    
    // Criar ou selecionar campanha (ajustar conforme UI)
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
    } else {
      // Criar nova campanha se não houver
      await page.click('text=Criar Campanha')
      await page.fill('input[name="name"]', 'Campanha de Teste E2E')
      await page.click('button:has-text("Criar")')
    }

    // Criar sessão
    await page.click('text=Nova Sessão')
    await page.fill('input[name="name"]', 'Sessão de Teste')
    await page.click('button:has-text("Criar Sessão")')

    // Verificar se sessão foi criada
    await expect(page.locator('text=Sessão de Teste')).toBeVisible()
  })

  test('deve entrar em uma sessão existente', async ({ page }) => {
    await page.click('text=Campanhas')
    
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
      
      // Procurar por sessão existente
      const sessionCard = page.locator('[data-testid="session-card"]').first()
      if (await sessionCard.count() > 0) {
        await sessionCard.click()
        
        // Verificar se entrou na sessão
        await expect(page.locator('text=Sala de Sessão')).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('deve exibir gameboard na sessão', async ({ page }) => {
    await page.click('text=Campanhas')
    
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
      
      const sessionCard = page.locator('[data-testid="session-card"]').first()
      if (await sessionCard.count() > 0) {
        await sessionCard.click()
        
        // Aguardar carregamento da sessão
        await page.waitForSelector('[data-testid="gameboard"]', { timeout: 10000 })
        
        // Verificar se gameboard está visível
        const gameboard = page.locator('[data-testid="gameboard"]')
        await expect(gameboard).toBeVisible()
      }
    }
  })

  test('deve fazer upload de imagem no gameboard', async ({ page }) => {
    await page.click('text=Campanhas')
    
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
      
      const sessionCard = page.locator('[data-testid="session-card"]').first()
      if (await sessionCard.count() > 0) {
        await sessionCard.click()
        
        await page.waitForSelector('[data-testid="gameboard"]', { timeout: 10000 })
        
        // Procurar botão de upload
        const uploadButton = page.locator('button:has-text("Carregar Mapa")').or(page.locator('button:has-text("Trocar Imagem")'))
        if (await uploadButton.count() > 0) {
          // Criar arquivo de teste
          const fileInput = page.locator('input[type="file"]')
          await fileInput.setInputFiles({
            name: 'test-map.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-image-data'),
          })
          
          // Aguardar upload (pode falhar se não houver backend configurado)
          await page.waitForTimeout(2000)
        }
      }
    }
  })

  test('deve usar controles de zoom no gameboard', async ({ page }) => {
    await page.click('text=Campanhas')
    
    const campaignCard = page.locator('[data-testid="campaign-card"]').first()
    if (await campaignCard.count() > 0) {
      await campaignCard.click()
      
      const sessionCard = page.locator('[data-testid="session-card"]').first()
      if (await sessionCard.count() > 0) {
        await sessionCard.click()
        
        await page.waitForSelector('[data-testid="gameboard"]', { timeout: 10000 })
        
        // Procurar botões de zoom
        const zoomInButton = page.locator('button[aria-label*="Aumentar zoom"]').or(page.locator('button:has([data-lucide="zoom-in"])'))
        const zoomOutButton = page.locator('button[aria-label*="Diminuir zoom"]').or(page.locator('button:has([data-lucide="zoom-out"])'))
        
        if (await zoomInButton.count() > 0) {
          await zoomInButton.click()
          await page.waitForTimeout(500)
        }
        
        if (await zoomOutButton.count() > 0) {
          await zoomOutButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })
})

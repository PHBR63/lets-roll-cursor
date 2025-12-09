/**
 * Testes E2E para autenticação
 */

import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible()
  })

  test('deve fazer logout', async ({ page }) => {
    // Assumir que está logado
    await page.goto('/dashboard')
    
    await page.click('button:has-text("Sair")')
    
    await expect(page).toHaveURL('/')
  })
})


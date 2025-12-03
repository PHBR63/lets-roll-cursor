# 📋 Plano Técnico - Tarefas de Curto Prazo

**Data:** Dezembro 2024  
**Prazo Estimado:** 1-2 meses  
**Status:** 🟡 Planejamento

---

## 🎯 Objetivo

Implementar melhorias críticas de qualidade, testes e documentação para elevar o projeto a um nível de produção profissional.

---

## 📊 Tarefa 1: Aumentar Cobertura de Testes para 80%+

### Status Atual
- `ordemParanormalService`: 66.99%
- `characterService`: 43.04%
- **Meta:** 80%+ em todos os serviços

### Plano Técnico

#### 1.1. Análise de Cobertura Atual

**Ferramentas:**
- Jest com `--coverage`
- Análise de relatórios HTML gerados

**Ações:**
1. Executar cobertura completa:
   ```bash
   cd backend && npm test -- --coverage
   ```
2. Analisar relatório em `backend/coverage/lcov-report/index.html`
3. Identificar arquivos com baixa cobertura
4. Listar funções/métodos não testados

**Arquivos a Analisar:**
- `backend/src/services/characterService.ts` (43.04% - PRIORIDADE ALTA)
- `backend/src/services/campaignService.ts`
- `backend/src/services/sessionService.ts`
- `backend/src/services/chatService.ts`
- `backend/src/services/creatureService.ts`
- `backend/src/services/itemService.ts`
- `backend/src/services/abilityService.ts`
- `backend/src/services/momentService.ts`

#### 1.2. Estratégia de Testes por Serviço

**characterService.ts (Meta: 80%+)**

**Casos de Teste a Adicionar:**
- [ ] `createCharacter` - Casos de borda (atributos inválidos, NEX extremos)
- [ ] `updateAttributes` - Validação de limites (-5 a 20)
- [ ] `updateSkills` - Validação de perícias "somente treinadas"
- [ ] `applyCondition` - Todas as transformações automáticas
- [ ] `removeCondition` - Remoção de condições inexistentes
- [ ] `updateNEX` - Recálculo completo de recursos
- [ ] `updatePV` - Estados críticos (machucado, morrendo)
- [ ] `updateSAN` - Estados críticos (perturbado, enlouquecendo)
- [ ] `updatePE` - Validação de limites
- [ ] `recoverPE` - Cálculo baseado em NEX
- [ ] `rollSkillTest` - Todas as combinações de perícia + condições
- [ ] `rollAttack` - Críticos, acertos, erros
- [ ] `applyDamage` - Dano físico e mental

**campaignService.ts**

**Casos de Teste a Adicionar:**
- [ ] `getUserCampaigns` - Filtros por role
- [ ] `getCampaignById` - Validação de acesso
- [ ] `createCampaign` - Upload de imagem
- [ ] `updateCampaign` - Validação de permissões
- [ ] `deleteCampaign` - Validação de permissões
- [ ] `invitePlayer` - Validação de email, permissões

**sessionService.ts**

**Casos de Teste a Adicionar:**
- [ ] `createSession` - Validação de campanha
- [ ] `getActiveSession` - Filtros e validações
- [ ] `updateSession` - Atualização de board_state
- [ ] `endSession` - Finalização correta

**chatService.ts**

**Casos de Teste a Adicionar:**
- [ ] `getMessages` - Filtros por sessão/campanha
- [ ] `createMessage` - Validação de conteúdo
- [ ] Tipos de mensagem (message, narration, ooc)

**creatureService.ts**

**Casos de Teste a Adicionar:**
- [ ] CRUD completo de criaturas
- [ ] Aplicação de dano/cura
- [ ] Aplicação de condições

#### 1.3. Configuração de Cobertura Mínima

**Arquivo:** `backend/jest.config.js`

```javascript
module.exports = {
  // ... configuração existente
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/ordemParanormalService.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/services/characterService.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

#### 1.4. Testes de Rotas (Novo)

**Arquivo:** `backend/src/routes/__tests__/characters.test.ts` (criar)

**Casos de Teste:**
- [ ] GET `/api/characters/:id` - Sucesso e erro 404
- [ ] POST `/api/characters` - Criação válida e inválida
- [ ] PUT `/api/characters/:id` - Atualização válida e inválida
- [ ] DELETE `/api/characters/:id` - Remoção e validação de permissões
- [ ] POST `/api/characters/:id/roll-skill` - Rolagem válida
- [ ] POST `/api/characters/:id/roll-attack` - Rolagem válida
- [ ] Autenticação e autorização em todas as rotas

**Ferramentas:**
- `supertest` para testes de API
- Mock de Supabase

#### 1.5. Testes de Middleware

**Arquivo:** `backend/src/middleware/__tests__/auth.test.ts` (criar)

**Casos de Teste:**
- [ ] `authenticateToken` - Token válido
- [ ] `authenticateToken` - Token inválido
- [ ] `authenticateToken` - Token expirado
- [ ] `authenticateToken` - Sem token

#### 1.6. Estimativa de Esforço

- **characterService:** 2-3 dias (20+ novos testes)
- **campaignService:** 1-2 dias (10+ novos testes)
- **sessionService:** 1 dia (8+ novos testes)
- **chatService:** 1 dia (6+ novos testes)
- **creatureService:** 1 dia (8+ novos testes)
- **Testes de rotas:** 2-3 dias (30+ novos testes)
- **Testes de middleware:** 0.5 dia (4+ novos testes)

**Total:** 8-11 dias úteis

---

## 🧪 Tarefa 2: Adicionar Testes E2E

### Objetivo
Testar fluxos completos do usuário do frontend ao backend.

### Plano Técnico

#### 2.1. Escolha de Ferramenta

**Opções:**
1. **Playwright** (Recomendado)
   - Suporte multi-browser
   - Excelente para React
   - Screenshots e vídeos automáticos
   - API moderna

2. **Cypress**
   - Popular no ecossistema React
   - Boa documentação
   - Time-travel debugging

**Decisão:** Playwright (melhor suporte para TypeScript e React)

#### 2.2. Instalação e Configuração

**Comandos:**
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**Arquivo:** `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 2.3. Setup de Testes E2E

**Arquivo:** `frontend/e2e/setup/auth.setup.ts`

```typescript
import { test as setup } from '@playwright/test'
import { supabase } from '../utils/supabase'

setup('autenticar', async ({ page }) => {
  // Criar usuário de teste ou fazer login
  // Salvar estado de autenticação
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
```

**Arquivo:** `frontend/e2e/utils/supabase.ts`

```typescript
// Helper para interagir com Supabase nos testes
export async function createTestUser() {
  // Criar usuário de teste
}

export async function cleanupTestUser() {
  // Limpar usuário de teste
}
```

#### 2.4. Cenários E2E a Implementar

**1. Fluxo de Autenticação**

**Arquivo:** `frontend/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('deve exibir erro em login inválido', async ({ page }) => {
    // ...
  })

  test('deve fazer registro com sucesso', async ({ page }) => {
    // ...
  })
})
```

**2. Fluxo de Criação de Campanha**

**Arquivo:** `frontend/e2e/campaign.spec.ts`

```typescript
test.describe('Campanhas', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('deve criar campanha completa', async ({ page }) => {
    await page.goto('/campaign/create')
    
    // Etapa 1: Dados Base
    await page.fill('input[name="title"]', 'Campanha de Teste')
    await page.fill('textarea[name="description"]', 'Descrição teste')
    await page.click('button:has-text("Próximo")')
    
    // Etapa 2: Personalidades
    await page.click('button:has-text("Próximo")')
    
    // Etapa 3: Adquiríveis
    await page.click('button:has-text("Criar Campanha")')
    
    await expect(page).toHaveURL(/\/campaign\/\w+/)
    await expect(page.locator('h1')).toContainText('Campanha de Teste')
  })
})
```

**3. Fluxo de Criação de Personagem**

**Arquivo:** `frontend/e2e/character.spec.ts`

```typescript
test.describe('Personagens', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('deve criar personagem completo', async ({ page }) => {
    await page.goto('/campaign/:id')
    await page.click('button:has-text("Criar Personagem")')
    
    // Preencher formulário
    await page.fill('input[name="name"]', 'Personagem Teste')
    await page.selectOption('select[name="class"]', 'COMBATENTE')
    // ... preencher atributos
    
    await page.click('button:has-text("Criar")')
    
    await expect(page).toHaveURL(/\/character\/\w+/)
  })
})
```

**4. Fluxo de Sessão de Jogo**

**Arquivo:** `frontend/e2e/session.spec.ts`

```typescript
test.describe('Sessão de Jogo', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('deve rolar dados e exibir resultado', async ({ page }) => {
    await page.goto('/session/:id')
    
    // Rolagem básica
    await page.fill('input[name="formula"]', '1d20')
    await page.click('button:has-text("Rolar")')
    
    await expect(page.locator('.dice-result')).toBeVisible()
  })

  test('deve enviar mensagem no chat', async ({ page }) => {
    await page.goto('/session/:id')
    
    await page.fill('input[name="message"]', 'Mensagem de teste')
    await page.click('button:has-text("Enviar")')
    
    await expect(page.locator('.chat-message')).toContainText('Mensagem de teste')
  })
})
```

**5. Fluxo do Painel do Mestre**

**Arquivo:** `frontend/e2e/master.spec.ts`

```typescript
test.describe('Painel do Mestre', () => {
  test.use({ storageState: 'e2e/.auth/master.json' })

  test('deve criar criatura', async ({ page }) => {
    await page.goto('/master/:campaignId')
    
    await page.click('button:has-text("Criar Criatura")')
    await page.fill('input[name="name"]', 'Criatura Teste')
    // ... preencher stats
    await page.click('button:has-text("Criar")')
    
    await expect(page.locator('.creature-card')).toContainText('Criatura Teste')
  })
})
```

#### 2.5. CI/CD Integration

**Arquivo:** `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

#### 2.6. Estimativa de Esforço

- **Setup e configuração:** 1 dia
- **Testes de autenticação:** 0.5 dia
- **Testes de campanha:** 1 dia
- **Testes de personagem:** 1 dia
- **Testes de sessão:** 1.5 dias
- **Testes do mestre:** 1 dia
- **CI/CD:** 0.5 dia

**Total:** 6.5 dias úteis

---

## 📚 Tarefa 3: Documentação de API

### Objetivo
Criar documentação completa e interativa da API REST.

### Plano Técnico

#### 3.1. Escolha de Ferramenta

**Opções:**
1. **Swagger/OpenAPI** (Recomendado)
   - Padrão da indústria
   - Geração automática de docs
   - Interface interativa
   - Suporte a TypeScript

2. **Postman Collections**
   - Fácil de compartilhar
   - Testes integrados

**Decisão:** Swagger/OpenAPI com `swagger-jsdoc` e `swagger-ui-express`

#### 3.2. Instalação e Configuração

**Comandos:**
```bash
cd backend
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

**Arquivo:** `backend/src/config/swagger.ts`

```typescript
import swaggerJsdoc from 'swagger-jsdoc'
import { SwaggerDefinition } from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Let\'s Roll API',
      version: '1.0.0',
      description: 'API REST para plataforma de RPG Let\'s Roll',
      contact: {
        name: 'Let\'s Roll Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.letsroll.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/services/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
```

**Arquivo:** `backend/src/routes/docs.ts`

```typescript
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from '../config/swagger'

const docsRouter = Router()

docsRouter.use('/api-docs', swaggerUi.serve)
docsRouter.get('/api-docs', swaggerUi.setup(swaggerSpec))

export default docsRouter
```

#### 3.3. Documentação de Rotas

**Exemplo:** `backend/src/routes/characters.ts`

```typescript
/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Lista personagens
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: ID da campanha
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de personagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 *       401:
 *         description: Não autenticado
 */

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     summary: Obtém personagem por ID
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do personagem
 *     responses:
 *       200:
 *         description: Personagem encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Personagem não encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       required:
 *         - name
 *         - class
 *         - attributes
 *         - stats
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do personagem
 *         name:
 *           type: string
 *           description: Nome do personagem
 *         class:
 *           type: string
 *           enum: [COMBATENTE, ESPECIALISTA, OCULTISTA]
 *           description: Classe do personagem
 *         attributes:
 *           type: object
 *           properties:
 *             agi:
 *               type: number
 *               minimum: -5
 *               maximum: 20
 *             for:
 *               type: number
 *               minimum: -5
 *               maximum: 20
 *             int:
 *               type: number
 *               minimum: -5
 *               maximum: 20
 *             pre:
 *               type: number
 *               minimum: -5
 *               maximum: 20
 *             vig:
 *               type: number
 *               minimum: -5
 *               maximum: 20
 *         stats:
 *           type: object
 *           properties:
 *             pv:
 *               type: object
 *               properties:
 *                 current:
 *                   type: number
 *                 max:
 *                   type: number
 *             san:
 *               type: object
 *               properties:
 *                 current:
 *                   type: number
 *                 max:
 *                   type: number
 *             pe:
 *               type: object
 *               properties:
 *                 current:
 *                   type: number
 *                 max:
 *                   type: number
 *             nex:
 *               type: number
 *               minimum: 0
 *               maximum: 99
 */

/**
 * @swagger
 * /api/characters/{id}/roll-skill:
 *   post:
 *     summary: Rola teste de perícia
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillName
 *               - difficulty
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: Luta
 *               difficulty:
 *                 type: number
 *                 example: 15
 *     responses:
 *       200:
 *         description: Resultado da rolagem
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: number
 *                 dice:
 *                   type: array
 *                   items:
 *                     type: number
 */
```

#### 3.4. Documentação de Schemas Comuns

**Arquivo:** `backend/src/config/swagger-schemas.ts`

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *     
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         # ... outros campos
 *     
 *     Session:
 *       type: object
 *       # ...
 */
```

#### 3.5. Geração Automática de Documentação

**Script:** `backend/scripts/generate-docs.ts`

```typescript
// Script para validar e gerar documentação
// Pode ser executado no CI/CD
```

#### 3.6. Estimativa de Esforço

- **Setup e configuração:** 0.5 dia
- **Documentação de rotas de personagens:** 1 dia
- **Documentação de rotas de campanhas:** 0.5 dia
- **Documentação de rotas de sessões:** 0.5 dia
- **Documentação de rotas de dados:** 0.5 dia
- **Documentação de rotas restantes:** 1 dia
- **Schemas e exemplos:** 0.5 dia

**Total:** 4.5 dias úteis

---

## ⚡ Tarefa 4: Melhorias de Performance

### Objetivo
Otimizar performance do frontend e backend.

### Plano Técnico

#### 4.1. Análise de Performance Atual

**Ferramentas:**
- Lighthouse (Chrome DevTools)
- React DevTools Profiler
- Webpack Bundle Analyzer
- Network tab (Chrome DevTools)

**Métricas a Medir:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Bundle Size
- Number of Requests
- API Response Times

#### 4.2. Otimizações de Frontend

**4.2.1. Code Splitting Mais Agressivo**

**Arquivo:** `frontend/src/App.tsx`

```typescript
// Já implementado, mas pode melhorar:
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))

// Adicionar preload:
const preloadRoute = (routeName: string) => {
  const route = routes.find(r => r.name === routeName)
  if (route) {
    route.component.preload()
  }
}

// Preload em hover:
<Link 
  to="/dashboard" 
  onMouseEnter={() => preloadRoute('Dashboard')}
>
  Dashboard
</Link>
```

**4.2.2. Bundle Analysis**

**Comandos:**
```bash
cd frontend
npm install -D webpack-bundle-analyzer
npm run build -- --analyze
```

**Arquivo:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-dialog', ...],
          'utils': ['./src/utils', './src/lib'],
        },
      },
    },
  },
})
```

**4.2.3. Image Optimization**

**Implementar:**
- Lazy loading de imagens
- WebP format com fallback
- Responsive images (srcset)
- Image compression

**Arquivo:** `frontend/src/components/common/OptimizedImage.tsx`

```typescript
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({ src, alt, className, loading = 'lazy' }: OptimizedImageProps) {
  const [error, setError] = useState(false)
  
  // Converter para WebP se suportado
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        onError={() => setError(true)}
      />
    </picture>
  )
}
```

**4.2.4. Memoização Avançada**

**Arquivo:** `frontend/src/components/character/SkillsGrid.tsx`

```typescript
// Já usa useMemo, mas pode melhorar:
import { useMemo, useCallback } from 'react'

// Memoizar callbacks
const handleSkillChange = useCallback((skillName: string, training: SkillTraining) => {
  // ...
}, [/* dependencies */])

// Memoizar componentes pesados
const MemoizedSkillItem = memo(SkillItem, (prev, next) => {
  return prev.skillName === next.skillName && 
         prev.currentSkill.training === next.currentSkill.training
})
```

**4.2.5. Virtual Scrolling em Listas Grandes**

**Arquivo:** `frontend/src/components/common/VirtualizedList.tsx`

```typescript
// Já implementado, mas pode expandir uso:
// - Lista de campanhas no Dashboard
// - Lista de personagens na campanha
// - Lista de criaturas no painel do mestre
```

**4.2.6. Service Worker para Cache**

**Arquivo:** `frontend/public/sw.js`

```javascript
const CACHE_NAME = 'letsroll-v1'
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  )
})
```

**Arquivo:** `frontend/src/main.tsx`

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

#### 4.3. Otimizações de Backend

**4.3.1. Database Query Optimization**

**Arquivo:** `backend/src/services/characterService.ts`

```typescript
// Adicionar índices no banco:
// CREATE INDEX idx_characters_campaign_id ON characters(campaign_id);
// CREATE INDEX idx_characters_user_id ON characters(user_id);

// Usar select específico ao invés de *
async getCharacterById(id: string) {
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, class, attributes, stats, skills, conditions')
    .eq('id', id)
    .single()
  // ...
}
```

**4.3.2. Caching de Queries Frequentes**

**Arquivo:** `backend/src/middleware/cache.ts` (criar)

```typescript
import { Request, Response, NextFunction } from 'express'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 300 }) // 5 minutos

export function cacheMiddleware(ttl: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl || req.url
    
    // Verificar cache
    const cached = cache.get(key)
    if (cached) {
      return res.json(cached)
    }
    
    // Interceptar resposta
    const originalJson = res.json.bind(res)
    res.json = function (data: any) {
      cache.set(key, data, ttl)
      return originalJson(data)
    }
    
    next()
  }
}
```

**4.3.3. Paginação em Listas**

**Arquivo:** `backend/src/services/characterService.ts`

```typescript
async getCharacters(filters: any, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('characters')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
  
  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}
```

**4.3.4. Compression Middleware**

**Arquivo:** `backend/src/index.ts`

```typescript
import compression from 'compression'

app.use(compression())
```

#### 4.4. Métricas e Monitoramento

**4.4.1. Performance Monitoring**

**Arquivo:** `frontend/src/utils/performance.ts`

```typescript
export function measurePerformance(name: string, fn: () => void) {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${name}-start`)
    fn()
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    const measure = performance.getEntriesByName(name)[0]
    console.log(`${name}: ${measure.duration}ms`)
  } else {
    fn()
  }
}
```

**4.4.2. API Response Time Tracking**

**Arquivo:** `backend/src/middleware/performance.ts`

```typescript
import { Request, Response, NextFunction } from 'express'

export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${duration}ms`)
    
    // Enviar para serviço de monitoramento (ex: DataDog, New Relic)
  })
  
  next()
}
```

#### 4.5. Estimativa de Esforço

- **Análise de performance:** 0.5 dia
- **Code splitting:** 1 dia
- **Bundle optimization:** 1 dia
- **Image optimization:** 1 dia
- **Service Worker:** 1 dia
- **Backend caching:** 1 dia
- **Database optimization:** 1 dia
- **Monitoring:** 0.5 dia

**Total:** 7 dias úteis

---

## 📅 Cronograma Consolidado

### Semana 1-2: Testes (Tarefas 1 e 2)
- **Dias 1-3:** Aumentar cobertura de testes (characterService)
- **Dias 4-5:** Aumentar cobertura de testes (outros serviços)
- **Dias 6-7:** Testes de rotas e middleware
- **Dias 8-9:** Setup de testes E2E
- **Dias 10-11:** Implementar testes E2E principais

### Semana 3: Documentação (Tarefa 3)
- **Dias 12-13:** Setup Swagger e documentação de personagens
- **Dias 14-15:** Documentação de campanhas e sessões
- **Dia 16:** Documentação restante e schemas

### Semana 4: Performance (Tarefa 4)
- **Dia 17:** Análise de performance
- **Dias 18-19:** Otimizações de frontend
- **Dias 20-21:** Otimizações de backend
- **Dia 22:** Monitoramento e métricas

**Total Estimado:** 22 dias úteis (4-5 semanas)

---

## ✅ Critérios de Sucesso

### Tarefa 1: Cobertura de Testes
- [ ] Cobertura global ≥ 80%
- [ ] characterService ≥ 80%
- [ ] Todos os serviços principais ≥ 80%
- [ ] Testes de rotas implementados
- [ ] CI/CD falha se cobertura < 80%

### Tarefa 2: Testes E2E
- [ ] 10+ cenários E2E implementados
- [ ] Testes passando em CI/CD
- [ ] Cobertura de fluxos críticos
- [ ] Screenshots em falhas

### Tarefa 3: Documentação de API
- [ ] Swagger UI acessível em `/api-docs`
- [ ] Todas as rotas documentadas
- [ ] Schemas completos
- [ ] Exemplos de requisições/respostas

### Tarefa 4: Performance
- [ ] Lighthouse score ≥ 90
- [ ] Bundle size reduzido em 20%+
- [ ] API response time < 200ms (p95)
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s

---

## 📝 Próximos Passos

1. **Revisar e aprovar plano técnico**
2. **Priorizar tarefas** (sugestão: Testes → Documentação → Performance)
3. **Alocar recursos** (desenvolvedores, tempo)
4. **Criar issues no GitHub** para cada tarefa
5. **Iniciar implementação** seguindo o cronograma

---

**Última Atualização:** Dezembro 2024  
**Versão:** 1.0.0


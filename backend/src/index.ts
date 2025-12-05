import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import helmet from 'helmet'
import { authRouter } from './routes/auth'
import { campaignsRouter } from './routes/campaigns'
import { charactersRouter } from './routes/characters'
import { creaturesRouter } from './routes/creatures'
import { itemsRouter } from './routes/items'
import { abilitiesRouter } from './routes/abilities'
import { sessionsRouter } from './routes/sessions'
import { diceRouter } from './routes/dice'
import { inventoryRouter } from './routes/inventory'
import { momentsRouter } from './routes/moments'
import { chatRouter } from './routes/chat'
import { errorHandler } from './middleware/errorHandler'
import { generalLimiter, authLimiter, createLimiter } from './middleware/rateLimit'
import { logger } from './utils/logger'
import { initRedis, closeRedis } from './config/redis'
import { setupSwagger } from './config/swagger'

// Carregar variáveis de ambiente
// Tenta múltiplos caminhos para garantir que encontra o .env
const envPaths = [
  path.join(process.cwd(), '.env'), // Se executado de dentro de backend/
  path.join(process.cwd(), 'backend', '.env'), // Se executado da raiz
]

let envLoaded = false
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath })
  if (!result.error && result.parsed) {
    envLoaded = true
    logger.info(`Environment variables loaded from: ${envPath}`)
    break
  }
}

// Se nenhum .env foi carregado, tenta sem caminho específico (padrão)
if (!envLoaded) {
  const result = dotenv.config()
  if (result.error) {
    logger.warn('Warning: Could not load .env file. Make sure backend/.env exists.')
  } else {
    logger.info('Environment variables loaded from default location')
  }
}

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware - Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

// Body parser
app.use(express.json())

// Rate limiting - aplicar geral em todas as rotas
app.use(generalLimiter)

// Rotas da API
// Autenticação com rate limiter específico
app.use('/api/auth', authLimiter, authRouter)
// Rotas de criação com rate limiter específico
app.use('/api/campaigns', createLimiter, campaignsRouter)
app.use('/api/characters', charactersRouter)
app.use('/api/creatures', createLimiter, creaturesRouter)
app.use('/api/items', createLimiter, itemsRouter)
app.use('/api/abilities', createLimiter, abilitiesRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/dice', diceRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/moments', createLimiter, momentsRouter)
app.use('/api/chat', chatRouter)

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app)
  logger.info('Swagger UI disponível em /api-docs')
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Nota: Em produção no Vercel, o frontend é servido separadamente
// Este código serve apenas para desenvolvimento local ou outros serviços

// Error handler
app.use(errorHandler)

/**
 * Inicia o servidor Express
 */
// Inicializar Redis antes de iniciar o servidor
initRedis()

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await closeRedis()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await closeRedis()
  process.exit(0)
})


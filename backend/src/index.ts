import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Obter diretório atual (CommonJS)
const __dirname = path.resolve()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Rotas da API
app.use('/api/auth', authRouter)
app.use('/api/campaigns', campaignsRouter)
app.use('/api/characters', charactersRouter)
app.use('/api/creatures', creaturesRouter)
app.use('/api/items', itemsRouter)
app.use('/api/abilities', abilitiesRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/dice', diceRouter)
app.use('/api/inventory', inventoryRouter)
app.use('/api/moments', momentsRouter)
app.use('/api/chat', chatRouter)

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


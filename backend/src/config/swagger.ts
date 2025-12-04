/**
 * Configuração do Swagger para documentação da API
 */
import swaggerJsdoc from 'swagger-jsdoc'
import { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Let\'s Roll API',
      version: '1.0.0',
      description: 'API para gerenciamento de campanhas de RPG',
      contact: {
        name: 'Let\'s Roll',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Servidor de desenvolvimento',
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
    tags: [
      { name: 'Auth', description: 'Autenticação' },
      { name: 'Campaigns', description: 'Campanhas' },
      { name: 'Characters', description: 'Personagens' },
      { name: 'Creatures', description: 'Criaturas' },
      { name: 'Items', description: 'Itens' },
      { name: 'Abilities', description: 'Habilidades' },
      { name: 'Sessions', description: 'Sessões de jogo' },
      { name: 'Dice', description: 'Rolagem de dados' },
      { name: 'Chat', description: 'Chat em tempo real' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // Caminhos para arquivos com anotações JSDoc
}

const swaggerSpec = swaggerJsdoc(options)

/**
 * Configura Swagger UI no Express
 */
export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Let\'s Roll API Documentation',
  }))
}

export { swaggerSpec }


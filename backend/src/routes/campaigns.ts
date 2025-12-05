import { Router, Request, Response } from 'express'
import multer from 'multer'
import { authenticateToken } from '../middleware/auth'
import { campaignService } from '../services/campaignService'
import { validate } from '../middleware/validation'
import { CreateCampaignSchema, UpdateCampaignSchema } from '../middleware/schemas/campaignSchemas'
import { AppError } from '../types/common'

/**
 * Rotas para CRUD de campanhas
 */
export const campaignsRouter = Router()

campaignsRouter.use(authenticateToken)

// Configurar multer para upload de imagens
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'))
    }
  },
})

// Listar campanhas do usuário
campaignsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const campaigns = await campaignService.getUserCampaigns(userId)
    res.json(campaigns)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

// Criar nova campanha (com upload de imagem)
campaignsRouter.post('/', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Tratar erros do multer antes de chegar ao handler
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. Tamanho máximo: 5MB' })
      }
      if (err.message?.includes('Apenas arquivos de imagem')) {
        return res.status(400).json({ error: 'Apenas arquivos de imagem são permitidos' })
      }
      return res.status(400).json({ error: 'Erro ao processar arquivo: ' + err.message })
    }
    next()
  })
}, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    
    // Parse do JSON de configuração com tratamento de erro
    let config = {}
    if (req.body.config) {
      try {
        config = typeof req.body.config === 'string' 
          ? JSON.parse(req.body.config) 
          : req.body.config
      } catch (parseError) {
        console.error('Erro ao fazer parse do config:', parseError)
        config = {}
      }
    }

    // Parse de tags com tratamento de erro
    let tags: string[] = []
    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string' 
          ? JSON.parse(req.body.tags) 
          : Array.isArray(req.body.tags) 
            ? req.body.tags 
            : []
      } catch (parseError) {
        console.error('Erro ao fazer parse das tags:', parseError)
        tags = []
      }
    }

    // Validação básica dos dados obrigatórios
    const campaignName = req.body.title || req.body.name
    if (!campaignName || campaignName.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da campanha é obrigatório' })
    }

    if (campaignName.length > 100) {
      return res.status(400).json({ error: 'Nome da campanha deve ter no máximo 100 caracteres' })
    }

    const campaignData = {
      name: campaignName.trim(),
      description: req.body.description || '',
      systemRpg: req.body.systemRpg || null,
      tags,
      image: req.file ? {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
      } : undefined,
      ...config,
    }

    const campaign = await campaignService.createCampaign(
      userId, 
      campaignData,
      req.user?.email,
      req.user?.username
    )
    res.status(201).json(campaign)
  } catch (error: unknown) {
    console.error('Erro ao criar campanha:', error)
    const err = error as AppError
    
    // Retornar erro 400 se for erro de validação do Supabase
    if (err.message?.includes('violates') || err.message?.includes('constraint') || err.message?.includes('invalid')) {
      return res.status(400).json({ error: err.message || 'Dados inválidos' })
    }
    
    res.status(500).json({ error: err.message || 'Erro desconhecido' })
  }
})

// Obter campanha por ID
campaignsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id)
    res.json(campaign)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

// Atualizar campanha (com upload de imagem opcional)
campaignsRouter.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const campaignId = req.params.id

    const updateData: Record<string, unknown> = {
      name: req.body.title || req.body.name,
      description: req.body.description,
      systemRpg: req.body.systemRpg,
      tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
    }

    if (req.file) {
      updateData.image = {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
      }
    }

    const campaign = await campaignService.updateCampaign(campaignId, userId, updateData)
    res.json(campaign)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

// Deletar campanha
campaignsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    await campaignService.deleteCampaign(req.params.id, userId)
    res.status(204).send()
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

// Convidar jogador
// Atualizar patente da campanha
campaignsRouter.put('/:id/rank', async (req: Request, res: Response) => {
  try {
    const { rank } = req.body
    if (!rank) {
      return res.status(400).json({ error: 'rank é obrigatório' })
    }
    
    const validRanks = ['RECRUTA', 'OPERADOR', 'AGENTE_ESPECIAL', 'OFICIAL_OPERACOES', 'ELITE']
    if (!validRanks.includes(rank)) {
      return res.status(400).json({ error: 'Patente inválida' })
    }

    const { rankService } = await import('../services/rankService')
    await rankService.updateCampaignRank(req.params.id, rank)
    
    res.json({ message: 'Patente atualizada com sucesso', rank })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

campaignsRouter.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const result = await campaignService.invitePlayer(req.params.id, userId, email)
    res.json(result)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
})

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
campaignsRouter.post('/', upload.single('image'), async (req: Request, res: Response) => {
  // Tratar erro de arquivo muito grande
  if (req.file === undefined && req.headers['content-type']?.includes('multipart/form-data')) {
    // Se não há arquivo mas o content-type é multipart, pode ser erro de tamanho
    // O multer já rejeitou, então vamos tratar no catch
  }
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

    const campaignData = {
      name: req.body.title || req.body.name,
      description: req.body.description || '',
      systemRpg: req.body.systemRpg || null,
      tags,
      image: req.file ? {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
      } : undefined,
      ...config,
    }

    const campaign = await campaignService.createCampaign(userId, campaignData)
    res.status(201).json(campaign)
  } catch (error: unknown) {
    console.error('Erro ao criar campanha:', error)
    const err = error as AppError
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

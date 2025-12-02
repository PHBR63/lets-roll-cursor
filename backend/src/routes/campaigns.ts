import { Router, Request, Response } from 'express'
import multer from 'multer'
import { authenticateToken } from '../middleware/auth'
import { campaignService } from '../services/campaignService'

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
})

// Listar campanhas do usuário
campaignsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const campaigns = await campaignService.getUserCampaigns(userId)
    res.json(campaigns)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Criar nova campanha (com upload de imagem)
campaignsRouter.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    // Parse do JSON de configuração
    let config = {}
    if (req.body.config) {
      config = JSON.parse(req.body.config)
    }

    const campaignData = {
      title: req.body.title,
      description: req.body.description,
      systemRpg: req.body.systemRpg || null,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      image: req.file ? {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
      } : null,
      ...config,
    }

    const campaign = await campaignService.createCampaign(userId, campaignData)
    res.status(201).json(campaign)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter campanha por ID
campaignsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id)
    res.json(campaign)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar campanha (com upload de imagem opcional)
campaignsRouter.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const campaignId = req.params.id

    const updateData: any = {
      title: req.body.title,
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
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Deletar campanha
campaignsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await campaignService.deleteCampaign(req.params.id, userId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Convidar jogador
campaignsRouter.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const result = await campaignService.invitePlayer(req.params.id, userId, email)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

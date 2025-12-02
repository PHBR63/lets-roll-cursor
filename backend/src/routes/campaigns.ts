import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { campaignService } from '../services/campaignService'

/**
 * Rotas para CRUD de campanhas
 */
export const campaignsRouter = Router()

campaignsRouter.use(authenticateToken)

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

// Criar nova campanha
campaignsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const campaign = await campaignService.createCampaign(userId, req.body)
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

// Atualizar campanha
campaignsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.updateCampaign(req.params.id, req.body)
    res.json(campaign)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Deletar campanha
campaignsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await campaignService.deleteCampaign(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


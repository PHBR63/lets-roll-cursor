import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { characterService } from '../services/characterService'
import { validate } from '../middleware/validation'
import { CharacterFilterSchema, CreateCharacterSchema, UpdateCharacterSchema } from '../middleware/schemas/characterSchemas'
import { AppError } from '../types/common'
import { supabase } from '../config/supabase'

/**
 * @swagger
 * tags:
 *   - name: Characters
 *     description: Operações relacionadas a personagens
 */

/**
 * Rotas para CRUD de personagens
 */
export const charactersRouter = Router()

charactersRouter.use(authenticateToken)

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
 *           format: uuid
 *         description: ID da campanha para filtrar
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário para filtrar
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Listar personagens
charactersRouter.get(
  '/',
  validate({ query: CharacterFilterSchema }),
  async (req: Request, res: Response) => {
    try {
      const characters = await characterService.getCharacters(req.query)
      res.json(characters)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

/**
 * @swagger
 * /api/characters:
 *   post:
 *     summary: Cria um novo personagem
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - campaignId
 *               - class
 *             properties:
 *               name:
 *                 type: string
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *               class:
 *                 type: string
 *                 enum: [COMBATENTE, ESPECIALISTA, OCULTISTA]
 *               origin:
 *                 type: string
 *               attributes:
 *                 type: object
 *               nex:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 99
 *     responses:
 *       201:
 *         description: Personagem criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
// Criar personagem
charactersRouter.post(
  '/',
  validate({ body: CreateCharacterSchema }),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }
      const character = await characterService.createCharacter(userId, req.body)
      res.status(201).json(character)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Rotas aninhadas específicas devem vir ANTES da rota genérica /:id
// Obter inventário do personagem
charactersRouter.get('/:id/inventory', async (req: Request, res: Response) => {
  try {
    const inventory = await characterService.getCharacterInventory(req.params.id)
    res.json(inventory)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter carga e capacidade máxima do personagem
charactersRouter.get('/:id/load', async (req: Request, res: Response) => {
  try {
    const { calculateLoad, getMaxLoad } = await import('../services/character/characterInventoryService')
    const currentLoad = await calculateLoad(req.params.id)
    const maxLoad = await getMaxLoad(req.params.id)
    const isOverloaded = currentLoad > maxLoad
    
    res.json({
      currentLoad,
      maxLoad,
      isOverloaded,
      remaining: Math.max(0, maxLoad - currentLoad),
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Adicionar item ao inventário
charactersRouter.post('/:id/inventory', async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body
    if (!itemId) {
      return res.status(400).json({ error: 'itemId é obrigatório' })
    }
    const item = await characterService.addItemToCharacter(
      req.params.id,
      itemId,
      quantity || 1
    )
    res.status(201).json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remover item do inventário
charactersRouter.delete('/:id/inventory/:itemId', async (req: Request, res: Response) => {
  try {
    await characterService.removeItemFromCharacter(req.params.id, req.params.itemId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Equipar/Desequipar item
charactersRouter.patch('/:id/inventory/:itemId/equip', async (req: Request, res: Response) => {
  try {
    const { equipped } = req.body
    const item = await characterService.equipItem(
      req.params.id,
      req.params.itemId,
      equipped !== undefined ? equipped : true
    )
    res.json(item)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Obter habilidades do personagem
charactersRouter.get('/:id/abilities', async (req: Request, res: Response) => {
  try {
    const abilities = await characterService.getCharacterAbilities(req.params.id)
    res.json(abilities)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Adicionar habilidade ao personagem
charactersRouter.post('/:id/abilities', async (req: Request, res: Response) => {
  try {
    const { abilityId } = req.body
    if (!abilityId) {
      return res.status(400).json({ error: 'abilityId é obrigatório' })
    }
    const ability = await characterService.addAbilityToCharacter(req.params.id, abilityId)
    res.status(201).json(ability)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remover habilidade do personagem
charactersRouter.delete('/:id/abilities/:abilityId', async (req: Request, res: Response) => {
  try {
    await characterService.removeAbilityFromCharacter(req.params.id, req.params.abilityId)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ============================================
// Rotas do Sistema Ordem Paranormal
// ============================================

// Rolar teste de perícia
charactersRouter.post('/:id/roll-skill', async (req: Request, res: Response) => {
  try {
    const { skillName, difficulty } = req.body
    if (!skillName) {
      return res.status(400).json({ error: 'skillName é obrigatório' })
    }
    const result = await characterService.rollSkillTest(
      req.params.id,
      skillName,
      difficulty || 15
    )
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Rolar ataque
charactersRouter.post('/:id/roll-attack', async (req: Request, res: Response) => {
  try {
    const { skillName, targetDefense } = req.body
    if (!skillName) {
      return res.status(400).json({ error: 'skillName é obrigatório' })
    }
    if (targetDefense === undefined) {
      return res.status(400).json({ error: 'targetDefense é obrigatório' })
    }
    const result = await characterService.rollAttack(
      req.params.id,
      skillName,
      targetDefense
    )
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Aplicar dano
charactersRouter.post('/:id/apply-damage', async (req: Request, res: Response) => {
  try {
    const { damage, type } = req.body
    if (damage === undefined || damage < 0) {
      return res.status(400).json({ error: 'damage é obrigatório e deve ser >= 0' })
    }
    if (type && type !== 'physical' && type !== 'mental') {
      return res.status(400).json({ error: 'type deve ser "physical" ou "mental"' })
    }
    const result = await characterService.applyDamage(
      req.params.id,
      damage,
      type || 'physical'
    )
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Aplicar condição
charactersRouter.post('/:id/apply-condition', async (req: Request, res: Response) => {
  try {
    const { condition } = req.body
    if (!condition) {
      return res.status(400).json({ error: 'condition é obrigatório' })
    }
    const result = await characterService.applyCondition(req.params.id, condition)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Remover condição
charactersRouter.delete('/:id/conditions/:condition', async (req: Request, res: Response) => {
  try {
    const character = await characterService.removeCondition(
      req.params.id,
      req.params.condition as any // Condition type
    )
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar atributos
charactersRouter.put('/:id/attributes', async (req: Request, res: Response) => {
  try {
    const { attributes } = req.body
    if (!attributes) {
      return res.status(400).json({ error: 'attributes é obrigatório' })
    }
    const character = await characterService.updateAttributes(req.params.id, attributes)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar perícias
charactersRouter.put('/:id/skills', async (req: Request, res: Response) => {
  try {
    const { skills } = req.body
    if (!skills) {
      return res.status(400).json({ error: 'skills é obrigatório' })
    }
    const character = await characterService.updateSkills(req.params.id, skills)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar NEX
charactersRouter.put('/:id/nex', async (req: Request, res: Response) => {
  try {
    const { nex } = req.body
    if (nex === undefined) {
      return res.status(400).json({ error: 'nex é obrigatório' })
    }
    if (nex < 0 || nex > 99) {
      return res.status(400).json({ error: 'nex deve estar entre 0 e 99' })
    }
    const character = await characterService.updateNEX(req.params.id, nex)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar PV
charactersRouter.put('/:id/pv', async (req: Request, res: Response) => {
  try {
    const { pv, isDelta } = req.body
    if (pv === undefined) {
      return res.status(400).json({ error: 'pv é obrigatório' })
    }
    const result = await characterService.updatePV(req.params.id, pv, isDelta || false)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar SAN
charactersRouter.put('/:id/san', async (req: Request, res: Response) => {
  try {
    const { san, isDelta } = req.body
    if (san === undefined) {
      return res.status(400).json({ error: 'san é obrigatório' })
    }
    const result = await characterService.updateSAN(req.params.id, san, isDelta || false)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar PE
charactersRouter.put('/:id/pe', async (req: Request, res: Response) => {
  try {
    const { pe, isDelta, validateTurnLimit, peSpentThisTurn } = req.body
    if (pe === undefined) {
      return res.status(400).json({ error: 'pe é obrigatório' })
    }
    const character = await characterService.updatePE(
      req.params.id,
      pe,
      isDelta || false,
      validateTurnLimit || false,
      peSpentThisTurn || 0
    )
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Gastar PE com validação de limite por turno
charactersRouter.post('/:id/spend-pe', async (req: Request, res: Response) => {
  try {
    const { peCost, peSpentThisTurn } = req.body
    if (peCost === undefined || peCost <= 0) {
      return res.status(400).json({ error: 'peCost deve ser maior que zero' })
    }
    const character = await characterService.spendPE(
      req.params.id,
      peCost,
      peSpentThisTurn || 0
    )
    res.json(character)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Aplicar dano com RD
charactersRouter.post('/:id/apply-damage', async (req: Request, res: Response) => {
  try {
    const { damage, type, damageType } = req.body
    if (damage === undefined || damage <= 0) {
      return res.status(400).json({ error: 'damage deve ser maior que zero' })
    }
    const result = await characterService.applyDamage(
      req.params.id,
      damage,
      type || 'physical',
      damageType || 'geral'
    )
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Atualizar resistências (RD)
charactersRouter.put('/:id/resistances', async (req: Request, res: Response) => {
  try {
    const { resistances } = req.body
    if (!resistances || typeof resistances !== 'object') {
      return res.status(400).json({ error: 'resistances deve ser um objeto' })
    }

    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (fetchError) throw fetchError

    const { data, error } = await supabase
      .from('characters')
      .update({
        resistances,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Invalidar cache
    const { deleteCache, getCharacterCacheKey } = await import('../services/cache')
    await deleteCache(getCharacterCacheKey({ characterId: req.params.id }))

    res.json(data)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Processar turno (aplicar condições automáticas)
charactersRouter.post('/:id/process-turn', async (req: Request, res: Response) => {
  try {
    const result = await characterService.processTurn(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Estancar sangramento (teste de Vigor DT 20)
charactersRouter.post('/:id/stop-bleeding', async (req: Request, res: Response) => {
  try {
    const result = await characterService.stopBleeding(req.params.id)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Recuperar PE (descanso)
charactersRouter.post('/:id/recover-pe', async (req: Request, res: Response) => {
  try {
    const character = await characterService.recoverPE(req.params.id)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Conjurar ritual com teste de custo
charactersRouter.post('/:id/conjure-ritual', async (req: Request, res: Response) => {
  try {
    const { ritualCost, peSpentThisTurn } = req.body
    if (ritualCost === undefined || ritualCost <= 0) {
      return res.status(400).json({ error: 'ritualCost deve ser maior que zero' })
    }

    const { ritualService } = await import('../services/ritualService')
    const result = await ritualService.conjureRitualWithCost(
      req.params.id,
      ritualCost,
      peSpentThisTurn || 0
    )
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Rotas genéricas devem vir DEPOIS das rotas aninhadas específicas
// Obter personagem por ID
charactersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const character = await characterService.getCharacterById(req.params.id)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Atualizar personagem
charactersRouter.put(
  '/:id',
  validate({ body: UpdateCharacterSchema }),
  async (req: Request, res: Response) => {
    try {
      const character = await characterService.updateCharacter(req.params.id, req.body)
      res.json(character)
    } catch (error: unknown) {
      const err = error as AppError
      res.status(500).json({ error: err.message || 'Erro desconhecido' })
    }
  }
)

// Deletar personagem
charactersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await characterService.deleteCharacter(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


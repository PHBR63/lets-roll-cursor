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
 *     description: Operações relacionadas a personagens de RPG
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
 *     summary: Lista personagens com filtros opcionais
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID da campanha
 *     responses:
 *       200:
 *         description: Lista de personagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
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
 *               - class
 *             properties:
 *               name:
 *                 type: string
 *               campaignId:
 *                 type: string
 *                 format: uuid
 *                 description: Opcional - permite criar personagem sem campanha para testes
 *               class:
 *                 type: string
 *                 enum: [COMBATENTE, ESPECIALISTA, OCULTISTA]
 *               origin:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personagem criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: Dados inválidos
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
      // Retornar 400 para erros de validação, 500 para erros internos
      const statusCode = err.message?.includes('inválid') || 
                        err.message?.includes('não encontrada') || 
                        err.message?.includes('não participa') ||
                        err.message?.includes('não pode')
                        ? 400 
                        : 500
      res.status(statusCode).json({ error: err.message || 'Erro desconhecido' })
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

// Verificar sobrecarga do inventário
charactersRouter.post('/:id/inventory/check-overload', async (req: Request, res: Response) => {
  try {
    const { characterInventoryService } = await import('../services/character/characterInventoryService')
    const result = await characterInventoryService.checkOverload(req.params.id)
    res.json(result)
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
    const { pe, isDelta, validateTurnLimit } = req.body
    if (pe === undefined) {
      return res.status(400).json({ error: 'pe é obrigatório' })
    }
    const { characterResourcesService } = await import('../services/character/characterResourcesService')
    const character = await characterResourcesService.updatePE(
      req.params.id,
      pe,
      isDelta || false,
      validateTurnLimit || false
    )
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Adicionar efeito permanente de insanidade
charactersRouter.post('/:id/permanent-effects', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { name, description, severity, turnsTriggered } = req.body
    if (!name || !description || !severity || !turnsTriggered) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, description, severity, turnsTriggered' })
    }

    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !character) {
      return res.status(404).json({ error: 'Personagem não encontrado' })
    }

    const permanentEffects = (character.permanentEffects as any[]) || []
    const newEffect = {
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      severity,
      turnsTriggered,
      createdAt: new Date().toISOString(),
    }

    permanentEffects.push(newEffect)

    const { data: updated, error: updateError } = await supabase
      .from('characters')
      .update({
        permanentEffects,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.json(updated)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro desconhecido' })
  }
})

// Remover efeito permanente de insanidade
charactersRouter.delete('/:id/permanent-effects/:effectId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .single()

    if (fetchError || !character) {
      return res.status(404).json({ error: 'Personagem não encontrado' })
    }

    const permanentEffects = ((character.permanentEffects as any[]) || []).filter(
      (effect: any) => effect.id !== req.params.effectId
    )

    const { data: updated, error: updateError } = await supabase
      .from('characters')
      .update({
        permanentEffects,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.json(updated)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro desconhecido' })
  }
})

// Gastar PE (com validação de limite por turno)
charactersRouter.post('/:id/spend-pe', async (req: Request, res: Response) => {
  try {
    const { peCost } = req.body
    if (peCost === undefined || peCost <= 0) {
      return res.status(400).json({ error: 'peCost deve ser um número positivo' })
    }
    const { characterResourcesService } = await import('../services/character/characterResourcesService')
    const character = await characterResourcesService.spendPE(req.params.id, peCost)
    res.json(character)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
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

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     summary: Obtém um personagem por ID
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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

/**
 * @swagger
 * /api/characters/{id}:
 *   put:
 *     summary: Atualiza um personagem
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               biography:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personagem atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 */
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

/**
 * @swagger
 * /api/characters/{id}:
 *   delete:
 *     summary: Deleta um personagem
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Personagem deletado
 *       404:
 *         description: Personagem não encontrado
 */
// Deletar personagem
charactersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await characterService.deleteCharacter(req.params.id)
    res.status(204).send()
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})


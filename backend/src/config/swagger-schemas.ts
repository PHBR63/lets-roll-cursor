/**
 * Schemas reutilizáveis para documentação Swagger
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Mensagem de erro
 *       example:
 *         error: "Erro ao processar requisição"
 *
 *     Character:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         class:
 *           type: string
 *           enum: [COMBATENTE, ESPECIALISTA, OCULTISTA]
 *         origin:
 *           type: string
 *         attributes:
 *           type: object
 *           properties:
 *             agi:
 *               type: number
 *             for:
 *               type: number
 *             int:
 *               type: number
 *             pre:
 *               type: number
 *             vig:
 *               type: number
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
 *         skills:
 *           type: object
 *         conditions:
 *           type: array
 *           items:
 *             type: string
 *         defense:
 *           type: number
 *
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         system_rpg:
 *           type: string
 *         image_url:
 *           type: string
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         started_at:
 *           type: string
 *           format: date-time
 *         ended_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *
 *     DiceRoll:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         session_id:
 *           type: string
 *           format: uuid
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         character_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         formula:
 *           type: string
 *         result:
 *           type: number
 *         details:
 *           type: object
 *         is_private:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         session_id:
 *           type: string
 *           format: uuid
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         character_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [message, narration, ooc]
 *         channel:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Moment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         session_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         created_by:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         image_url:
 *           type: string
 *           nullable: true
 *         dice_roll_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Origin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         trainedSkills:
 *           type: array
 *           items:
 *             type: string
 *         power:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           nullable: true
 *         weight:
 *           type: number
 *           nullable: true
 *         price:
 *           type: number
 *           nullable: true
 *         category:
 *           type: string
 *           enum: [I, II, III, IV]
 *           nullable: true
 *         modificationLevel:
 *           type: number
 *           nullable: true
 *         campaign_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_global:
 *           type: boolean
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Ability:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           nullable: true
 *         campaign_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_global:
 *           type: boolean
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     Creature:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           nullable: true
 *         campaign_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_global:
 *           type: boolean
 *         stats:
 *           type: object
 *           nullable: true
 *         attributes:
 *           type: object
 *           nullable: true
 *         skills:
 *           type: object
 *           nullable: true
 *         conditions:
 *           type: array
 *           items:
 *             type: string
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     ThreatTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         campaign_id:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         is_global:
 *           type: boolean
 *         template_data:
 *           type: object
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *
 *     CampaignParticipant:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         campaign_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [master, player, observer]
 *         joined_at:
 *           type: string
 *           format: date-time
 *
 *     InventoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         character_id:
 *           type: string
 *           format: uuid
 *         item_id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: number
 *         equipped:
 *           type: boolean
 *         item:
 *           $ref: '#/components/schemas/Item'
 *
 *     AmmunitionState:
 *       type: object
 *       properties:
 *         characterId:
 *           type: string
 *           format: uuid
 *         sessionId:
 *           type: string
 *           format: uuid
 *         current:
 *           type: number
 *         max:
 *           type: number
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Token JWT do Supabase
 */


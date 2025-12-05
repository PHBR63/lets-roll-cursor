/**
 * Serviço para gerenciamento de templates de ameaças
 * Permite criar criaturas rapidamente usando VD (Vida/Dificuldade)
 */
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AppError } from '../types/common'
import { ThreatTemplate, CreateThreatTemplateData, UpdateThreatTemplateData, CreateCreatureFromTemplateData } from '../types/threatTemplate'
import { CreateCreatureData } from '../types/creature'
import { ordemParanormalService } from './ordemParanormalService'

export const threatTemplateService = {
  /**
   * Obtém templates de ameaças
   * @param filters - Filtros (campaignId, isGlobal)
   * @returns Lista de templates
   */
  async getTemplates(filters: { campaignId?: string; isGlobal?: boolean } = {}) {
    try {
      let query = supabase
        .from('threat_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.isGlobal !== undefined) {
        query = query.eq('is_global', filters.isGlobal)
      }

      // Se não especificar, buscar templates globais e da campanha
      if (!filters.campaignId && filters.isGlobal === undefined) {
        query = query.or('is_global.eq.true,campaign_id.is.null')
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error fetching threat templates')
      throw new Error('Erro ao buscar templates de ameaças: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Obtém template por ID
   * @param id - ID do template
   * @returns Template
   */
  async getTemplateById(id: string): Promise<ThreatTemplate> {
    try {
      const { data, error } = await supabase
        .from('threat_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data as ThreatTemplate
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, templateId: id }, 'Error fetching threat template')
      throw new Error('Erro ao buscar template: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria um novo template
   * @param userId - ID do usuário criador
   * @param data - Dados do template
   * @returns Template criado
   */
  async createTemplate(userId: string, data: CreateThreatTemplateData): Promise<ThreatTemplate> {
    try {
      const { data: template, error } = await supabase
        .from('threat_templates')
        .insert({
          created_by: userId,
          name: data.name,
          description: data.description || null,
          type: data.type || null,
          base_attributes: data.baseAttributes || {},
          base_stats: data.baseStats || {},
          skills: data.skills || {},
          resistances: data.resistances || {},
          abilities: data.abilities || [],
          conditions: data.conditions || [],
          is_global: data.isGlobal || false,
          campaign_id: data.campaignId || null,
        })
        .select()
        .single()

      if (error) throw error

      return this.mapTemplateFromDb(template)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error }, 'Error creating threat template')
      throw new Error('Erro ao criar template: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Atualiza um template
   * @param id - ID do template
   * @param data - Dados atualizados
   * @returns Template atualizado
   */
  async updateTemplate(id: string, data: UpdateThreatTemplateData): Promise<ThreatTemplate> {
    try {
      const updateData: Record<string, unknown> = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.type !== undefined) updateData.type = data.type
      if (data.baseAttributes !== undefined) updateData.base_attributes = data.baseAttributes
      if (data.baseStats !== undefined) updateData.base_stats = data.baseStats
      if (data.skills !== undefined) updateData.skills = data.skills
      if (data.resistances !== undefined) updateData.resistances = data.resistances
      if (data.abilities !== undefined) updateData.abilities = data.abilities
      if (data.conditions !== undefined) updateData.conditions = data.conditions
      if (data.isGlobal !== undefined) updateData.is_global = data.isGlobal

      updateData.updated_at = new Date().toISOString()

      const { data: template, error } = await supabase
        .from('threat_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapTemplateFromDb(template)
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, templateId: id }, 'Error updating threat template')
      throw new Error('Erro ao atualizar template: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Deleta um template
   * @param id - ID do template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('threat_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, templateId: id }, 'Error deleting threat template')
      throw new Error('Erro ao deletar template: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Cria uma criatura a partir de template + VD
   * @param userId - ID do usuário criador
   * @param data - Dados (templateId, vd, name opcional, campaignId)
   * @returns Dados da criatura criada (pronta para usar em creatureService.createCreature)
   */
  async createCreatureFromTemplate(
    userId: string,
    data: CreateCreatureFromTemplateData
  ): Promise<CreateCreatureData> {
    try {
      const template = await this.getTemplateById(data.templateId)
      const vd = Math.max(1, Math.min(20, data.vd)) // Clamp entre 1 e 20

      // Calcular atributos (base + bônus por VD)
      const baseAttrs = template.baseAttributes || { agi: 0, for: 0, int: 0, pre: 0, vig: 0 }
      const vdBonus = Math.floor(vd / 2) // +1 a cada 2 VD

      const attributes = {
        agi: baseAttrs.agi + vdBonus,
        for: baseAttrs.for + vdBonus,
        int: baseAttrs.int + vdBonus,
        pre: baseAttrs.pre + vdBonus,
        vig: baseAttrs.vig + vdBonus,
      }

      // Calcular stats
      const baseStats = template.baseStats || {}
      const basePV = baseStats.pv || 10
      const pvMax = basePV * vd // PV = base * VD

      // Calcular defesa (10 + AGI + bônus base)
      const baseDefense = baseStats.defense || 0
      const defense = 10 + attributes.agi + baseDefense

      const stats = {
        vida: {
          current: pvMax,
          max: pvMax,
        },
        energia: {
          current: baseStats.pe || 10,
          max: baseStats.pe || 10,
        },
        saude: {
          current: baseStats.san || 10,
          max: baseStats.san || 10,
        },
        defense, // Adicionar defesa aos stats
      }

      // Converter skills para formato do creatureService
      const creatureSkills: Record<string, { value: number; trained: boolean }> = {}
      for (const [skillName, skillData] of Object.entries(template.skills || {})) {
        const trainingBonus = skillData.training === 'TRAINED' ? 5 :
                             skillData.training === 'COMPETENT' ? 10 :
                             skillData.training === 'EXPERT' ? 15 : 0
        creatureSkills[skillName] = {
          value: trainingBonus + (skillData.bonus || 0),
          trained: skillData.training !== 'UNTRAINED',
        }
      }

      // Criar dados da criatura
      const creatureData: CreateCreatureData = {
        name: data.name || `${template.name} (VD ${vd})`,
        type: template.type || 'Ameaça',
        description: template.description || undefined,
        attributes,
        stats,
        skills: creatureSkills,
        conditions: template.conditions || [],
        campaignId: data.campaignId || template.campaignId || undefined,
      }

      logger.info(
        { templateId: data.templateId, vd, creatureName: creatureData.name },
        'Creature created from template'
      )

      return creatureData
    } catch (error: unknown) {
      const err = error as AppError
      logger.error({ error, templateId: data.templateId, vd: data.vd }, 'Error creating creature from template')
      throw new Error('Erro ao criar criatura do template: ' + (err.message || 'Erro desconhecido'))
    }
  },

  /**
   * Mapeia template do banco para formato TypeScript
   */
  mapTemplateFromDb(dbTemplate: any): ThreatTemplate {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description,
      type: dbTemplate.type,
      baseAttributes: dbTemplate.base_attributes || {},
      baseStats: dbTemplate.base_stats || {},
      skills: dbTemplate.skills || {},
      resistances: dbTemplate.resistances || {},
      abilities: dbTemplate.abilities || [],
      conditions: dbTemplate.conditions || [],
      isGlobal: dbTemplate.is_global || false,
      campaignId: dbTemplate.campaign_id,
      createdBy: dbTemplate.created_by,
      createdAt: dbTemplate.created_at,
      updatedAt: dbTemplate.updated_at,
    }
  },
}


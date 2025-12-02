import { supabase } from '../config/supabase'
import { ordemParanormalService } from './ordemParanormalService'
import { CharacterClass, Condition } from '../types/ordemParanormal'

/**
 * Serviço para lógica de negócio de personagens
 */
export const characterService = {
  /**
   * Obtém personagens baseado em filtros
   * @param filters - Filtros de busca (campaignId, userId)
   * @returns Lista de personagens
   */
  async getCharacters(filters: any) {
    try {
      let query = supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )

      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId)
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching characters:', error)
      throw new Error('Erro ao buscar personagens: ' + error.message)
    }
  },

  /**
   * Cria um novo personagem
   * @param userId - ID do usuário criador
   * @param data - Dados do personagem
   * @returns Personagem criado
   */
  /**
   * Cria um novo personagem com cálculos automáticos do sistema Ordem Paranormal
   * @param userId - ID do usuário criador
   * @param data - Dados do personagem
   * @returns Personagem criado
   */
  async createCharacter(userId: string, data: any) {
    try {
      // Valores padrão para sistema Ordem Paranormal
      const attributes = data.attributes || {
        agi: 0,
        for: 0,
        int: 0,
        pre: 0,
        vig: 0,
      }

      const characterClass: CharacterClass = data.class || 'COMBATENTE'
      const nex = data.nex || 5 // NEX inicial padrão

      // Calcular recursos máximos baseado em classe e atributos
      const maxPV = ordemParanormalService.calculateMaxPV(
        characterClass,
        attributes.vig || 0,
        nex
      )
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(
        characterClass,
        attributes.pre || 0,
        nex
      )
      const defense = ordemParanormalService.calculateDefense(attributes.agi || 0)

      // Estrutura de stats no formato Ordem Paranormal
      const stats = data.stats || {
        pv: {
          current: maxPV,
          max: maxPV,
        },
        san: {
          current: maxSAN,
          max: maxSAN,
        },
        pe: {
          current: maxPE,
          max: maxPE,
        },
        nex: nex,
      }

      // Perícias iniciais (todas destreinadas por padrão)
      const skills = data.skills || {}

      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          campaign_id: data.campaignId,
          user_id: userId,
          name: data.name,
          avatar_url: data.avatarUrl || null,
          class: characterClass,
          path: data.path || null,
          affinity: data.affinity || null,
          attributes: attributes,
          stats: stats,
          skills: skills,
          conditions: data.conditions || [],
          defense: defense,
          level: 1, // Mantido para compatibilidade
          xp: 0, // Mantido para compatibilidade
        })
        .select()
        .single()

      if (error) throw error

      return character
    } catch (error: any) {
      console.error('Error creating character:', error)
      throw new Error('Erro ao criar personagem: ' + error.message)
    }
  },

  /**
   * Obtém personagem por ID com todos os relacionamentos
   * @param id - ID do personagem
   * @returns Personagem completo com inventário e habilidades
   */
  async getCharacterById(id: string) {
    try {
      // Buscar personagem
      const { data: character, error: characterError } = await supabase
        .from('characters')
        .select(
          `
          *,
          campaign:campaigns (
            id,
            name,
            system_rpg
          ),
          user:users (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('id', id)
        .single()

      if (characterError) throw characterError

      // Buscar inventário
      const { data: inventory, error: inventoryError } = await supabase
        .from('character_items')
        .select(
          `
          *,
          item:items (
            id,
            name,
            type,
            description,
            attributes,
            rarity
          )
        `
        )
        .eq('character_id', id)

      if (inventoryError) throw inventoryError

      // Buscar habilidades
      const { data: abilities, error: abilitiesError } = await supabase
        .from('character_abilities')
        .select(
          `
          *,
          ability:abilities (
            id,
            name,
            description,
            type,
            cost,
            attributes
          )
        `
        )
        .eq('character_id', id)

      if (abilitiesError) throw abilitiesError

      return {
        ...character,
        inventory: inventory || [],
        abilities: abilities || [],
      }
    } catch (error: any) {
      console.error('Error fetching character:', error)
      throw new Error('Erro ao buscar personagem: ' + error.message)
    }
  },

  /**
   * Atualiza um personagem com recálculo automático de recursos
   * @param id - ID do personagem
   * @param data - Dados para atualizar
   * @returns Personagem atualizado
   */
  async updateCharacter(id: string, data: any) {
    try {
      // Buscar personagem atual para cálculos
      const { data: currentCharacter, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Atualizar campos básicos
      if (data.name !== undefined) updateData.name = data.name
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
      if (data.class !== undefined) updateData.class = data.class
      if (data.path !== undefined) updateData.path = data.path
      if (data.affinity !== undefined) updateData.affinity = data.affinity
      if (data.conditions !== undefined) updateData.conditions = data.conditions

      // Atualizar atributos e recalcular recursos se necessário
      const attributes = data.attributes || currentCharacter.attributes
      const characterClass: CharacterClass = data.class || currentCharacter.class || 'COMBATENTE'
      const stats = data.stats || currentCharacter.stats
      const nex = stats?.nex || currentCharacter.stats?.nex || 5

      if (data.attributes !== undefined) {
        updateData.attributes = attributes

        // Recalcular recursos máximos se atributos mudaram
        if (attributes.vig !== undefined || data.class !== undefined) {
          const maxPV = ordemParanormalService.calculateMaxPV(
            characterClass,
            attributes.vig || 0,
            nex
          )
          if (!stats.pv) stats.pv = { current: maxPV, max: maxPV }
          stats.pv.max = maxPV
          // Ajustar current se exceder o máximo
          if (stats.pv.current > maxPV) stats.pv.current = maxPV
        }

        if (attributes.pre !== undefined || data.class !== undefined) {
          const maxPE = ordemParanormalService.calculateMaxPE(
            characterClass,
            attributes.pre || 0,
            nex
          )
          if (!stats.pe) stats.pe = { current: maxPE, max: maxPE }
          stats.pe.max = maxPE
          if (stats.pe.current > maxPE) stats.pe.current = maxPE
        }

        if (data.class !== undefined) {
          const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
          if (!stats.san) stats.san = { current: maxSAN, max: maxSAN }
          stats.san.max = maxSAN
          if (stats.san.current > maxSAN) stats.san.current = maxSAN
        }

        // Recalcular defesa se Agilidade mudou
        if (attributes.agi !== undefined) {
          updateData.defense = ordemParanormalService.calculateDefense(attributes.agi)
        }
      }

      // Atualizar stats
      if (data.stats !== undefined) {
        updateData.stats = stats
      } else if (data.attributes !== undefined) {
        // Se atributos mudaram, atualizar stats recalculados
        updateData.stats = stats
      }

      // Atualizar skills
      if (data.skills !== undefined) {
        updateData.skills = data.skills
      }

      // Atualizar level e xp (mantido para compatibilidade)
      if (data.level !== undefined) updateData.level = data.level
      if (data.xp !== undefined) updateData.xp = data.xp

      const { data: character, error } = await supabase
        .from('characters')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return character
    } catch (error: any) {
      console.error('Error updating character:', error)
      throw new Error('Erro ao atualizar personagem: ' + error.message)
    }
  },

  /**
   * Deleta um personagem
   * @param id - ID do personagem
   */
  async deleteCharacter(id: string) {
    try {
      const { error } = await supabase.from('characters').delete().eq('id', id)

      if (error) throw error
    } catch (error: any) {
      console.error('Error deleting character:', error)
      throw new Error('Erro ao deletar personagem: ' + error.message)
    }
  },

  /**
   * Obtém inventário do personagem
   * @param characterId - ID do personagem
   * @returns Lista de itens do inventário
   */
  async getCharacterInventory(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_items')
        .select(
          `
          *,
          item:items (
            id,
            name,
            type,
            description,
            attributes,
            rarity
          )
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      throw new Error('Erro ao buscar inventário: ' + error.message)
    }
  },

  /**
   * Adiciona item ao inventário do personagem
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param quantity - Quantidade (padrão: 1)
   * @returns Item adicionado ao inventário
   */
  async addItemToCharacter(characterId: string, itemId: string, quantity: number = 1) {
    try {
      // Verificar se item já existe no inventário
      // Destruturar tanto data quanto error para tratar erros de banco corretamente
      const { data: existing, error: queryError } = await supabase
        .from('character_items')
        .select('*')
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .single()

      // Verificar se houve erro na query
      if (queryError) {
        // PGRST116 é o código de erro quando .single() não encontra registro (caso normal)
        // Qualquer outro erro é um problema real de banco de dados e deve ser propagado
        if (queryError.code === 'PGRST116') {
          // Item não existe no inventário, criar novo registro
          const { data, error: insertError } = await supabase
            .from('character_items')
            .insert({
              character_id: characterId,
              item_id: itemId,
              quantity,
              equipped: false,
            })
            .select()
            .single()

          if (insertError) throw insertError
          return data
        } else {
          // Erro real de banco de dados (permissões, rede, etc.) - propagar erro
          throw queryError
        }
      }

      // Se não houve erro, o item existe no inventário - atualizar quantidade
      if (existing) {
        const { data, error: updateError } = await supabase
          .from('character_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError
        return data
      }

      // Caso inesperado: não houve erro mas existing é null
      // Criar novo registro como fallback
      const { data, error: insertError } = await supabase
        .from('character_items')
        .insert({
          character_id: characterId,
          item_id: itemId,
          quantity,
          equipped: false,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (error: any) {
      console.error('Error adding item to character:', error)
      throw new Error('Erro ao adicionar item: ' + error.message)
    }
  },

  /**
   * Remove item do inventário do personagem
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   */
  async removeItemFromCharacter(characterId: string, itemId: string) {
    try {
      const { error } = await supabase
        .from('character_items')
        .delete()
        .eq('character_id', characterId)
        .eq('item_id', itemId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error removing item from character:', error)
      throw new Error('Erro ao remover item: ' + error.message)
    }
  },

  /**
   * Equipa ou desequipa um item
   * @param characterId - ID do personagem
   * @param itemId - ID do item
   * @param equipped - Se o item está equipado
   * @returns Item atualizado
   */
  async equipItem(characterId: string, itemId: string, equipped: boolean = true) {
    try {
      const { data, error } = await supabase
        .from('character_items')
        .update({ equipped })
        .eq('character_id', characterId)
        .eq('item_id', itemId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error equipping item:', error)
      throw new Error('Erro ao equipar item: ' + error.message)
    }
  },

  /**
   * Obtém habilidades do personagem
   * @param characterId - ID do personagem
   * @returns Lista de habilidades
   */
  async getCharacterAbilities(characterId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .select(
          `
          *,
          ability:abilities (
            id,
            name,
            description,
            type,
            cost,
            attributes
          )
        `
        )
        .eq('character_id', characterId)

      if (error) throw error

      return data || []
    } catch (error: any) {
      console.error('Error fetching character abilities:', error)
      throw new Error('Erro ao buscar habilidades: ' + error.message)
    }
  },

  /**
   * Adiciona habilidade ao personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   * @returns Habilidade adicionada
   */
  async addAbilityToCharacter(characterId: string, abilityId: string) {
    try {
      const { data, error } = await supabase
        .from('character_abilities')
        .insert({
          character_id: characterId,
          ability_id: abilityId,
        })
        .select()
        .single()

      if (error) {
        // Se já existe (erro de chave duplicada 23505), buscar o existente
        if (error.code === '23505') {
          const { data: existing, error: existingError } = await supabase
            .from('character_abilities')
            .select('*')
            .eq('character_id', characterId)
            .eq('ability_id', abilityId)
            .single()

          // Verificar se a busca do existente também falhou
          if (existingError) {
            throw new Error('Erro ao buscar habilidade existente: ' + existingError.message)
          }

          // Verificar se existing é undefined
          if (!existing) {
            throw new Error('Habilidade não encontrada após erro de duplicação')
          }

          return existing
        }
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Error adding ability to character:', error)
      throw new Error('Erro ao adicionar habilidade: ' + error.message)
    }
  },

  /**
   * Remove habilidade do personagem
   * @param characterId - ID do personagem
   * @param abilityId - ID da habilidade
   */
  async removeAbilityFromCharacter(characterId: string, abilityId: string) {
    try {
      const { error } = await supabase
        .from('character_abilities')
        .delete()
        .eq('character_id', characterId)
        .eq('ability_id', abilityId)

      if (error) throw error
    } catch (error: any) {
      console.error('Error removing ability from character:', error)
      throw new Error('Erro ao remover habilidade: ' + error.message)
    }
  },

  /**
   * Atualiza atributos do personagem e recalcula recursos automaticamente
   * @param id - ID do personagem
   * @param attributes - Novos valores de atributos
   * @returns Personagem atualizado
   */
  async updateAttributes(id: string, attributes: any) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const characterClass: CharacterClass = character.class || 'COMBATENTE'
      const stats = character.stats || {}
      const nex = stats.nex || 5

      // Recalcular recursos máximos
      const maxPV = ordemParanormalService.calculateMaxPV(
        characterClass,
        attributes.vig || 0,
        nex
      )
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(
        characterClass,
        attributes.pre || 0,
        nex
      )
      const defense = ordemParanormalService.calculateDefense(attributes.agi || 0)

      // Atualizar stats mantendo valores atuais se não excederem máximo
      const updatedStats = {
        ...stats,
        pv: {
          current: Math.min(stats.pv?.current || maxPV, maxPV),
          max: maxPV,
        },
        san: {
          current: Math.min(stats.san?.current || maxSAN, maxSAN),
          max: maxSAN,
        },
        pe: {
          current: Math.min(stats.pe?.current || maxPE, maxPE),
          max: maxPE,
        },
        nex: nex,
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          attributes,
          stats: updatedStats,
          defense,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error updating attributes:', error)
      throw new Error('Erro ao atualizar atributos: ' + error.message)
    }
  },

  /**
   * Atualiza perícias do personagem
   * @param id - ID do personagem
   * @param skills - Objeto com perícias atualizadas
   * @returns Personagem atualizado
   */
  async updateSkills(id: string, skills: any) {
    try {
      // Recalcular bônus de todas as perícias
      const updatedSkills: any = {}
      for (const [skillName, skillData] of Object.entries(skills)) {
        const skill = skillData as any
        updatedSkills[skillName] = {
          ...skill,
          bonus: ordemParanormalService.calculateSkillBonus(skill.training),
        }
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          skills: updatedSkills,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error updating skills:', error)
      throw new Error('Erro ao atualizar perícias: ' + error.message)
    }
  },

  /**
   * Aplica uma condição ao personagem
   * @param id - ID do personagem
   * @param condition - Condição a ser aplicada
   * @returns Personagem atualizado com condições
   */
  async applyCondition(id: string, condition: Condition) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentConditions: Condition[] = character.conditions || []

      // Usar serviço para aplicar condição (inclui lógica de condições derivadas)
      const { newConditions, effects } = ordemParanormalService.applyCondition(
        condition,
        currentConditions
      )

      const { data, error } = await supabase
        .from('characters')
        .update({
          conditions: newConditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        character: data,
        effects,
      }
    } catch (error: any) {
      console.error('Error applying condition:', error)
      throw new Error('Erro ao aplicar condição: ' + error.message)
    }
  },

  /**
   * Remove uma condição do personagem
   * @param id - ID do personagem
   * @param condition - Condição a ser removida
   * @returns Personagem atualizado
   */
  async removeCondition(id: string, condition: Condition) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentConditions: Condition[] = character.conditions || []
      const newConditions = currentConditions.filter((c) => c !== condition)

      const { data, error } = await supabase
        .from('characters')
        .update({
          conditions: newConditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error removing condition:', error)
      throw new Error('Erro ao remover condição: ' + error.message)
    }
  },

  /**
   * Atualiza NEX e recalcula recursos máximos
   * @param id - ID do personagem
   * @param nex - Novo valor de NEX (0-99)
   * @returns Personagem atualizado
   */
  async updateNEX(id: string, nex: number) {
    try {
      if (nex < 0 || nex > 99) {
        throw new Error('NEX deve estar entre 0 e 99')
      }

      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const characterClass: CharacterClass = character.class || 'COMBATENTE'
      const attributes = character.attributes || {}
      const stats = character.stats || {}

      // Recalcular recursos máximos
      const maxPV = ordemParanormalService.calculateMaxPV(
        characterClass,
        attributes.vig || 0,
        nex
      )
      const maxSAN = ordemParanormalService.calculateMaxSAN(characterClass, nex)
      const maxPE = ordemParanormalService.calculateMaxPE(
        characterClass,
        attributes.pre || 0,
        nex
      )

      // Verificar se deve ganhar afinidade (50% NEX)
      let affinity = character.affinity
      if (nex >= 50 && !affinity) {
        // Afinidade será definida pelo usuário, não automática
        // Mas podemos notificar que está disponível
      }

      const updatedStats = {
        ...stats,
        pv: {
          current: Math.min(stats.pv?.current || maxPV, maxPV),
          max: maxPV,
        },
        san: {
          current: Math.min(stats.san?.current || maxSAN, maxSAN),
          max: maxSAN,
        },
        pe: {
          current: Math.min(stats.pe?.current || maxPE, maxPE),
          max: maxPE,
        },
        nex: nex,
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error updating NEX:', error)
      throw new Error('Erro ao atualizar NEX: ' + error.message)
    }
  },

  /**
   * Atualiza PV do personagem com validações
   * @param id - ID do personagem
   * @param pv - Novo valor de PV (ou delta)
   * @param isDelta - Se pv é um delta (true) ou valor absoluto (false)
   * @returns Personagem atualizado
   */
  async updatePV(id: string, pv: number, isDelta: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentPV = stats.pv?.current || 0
      const maxPV = stats.pv?.max || 0

      let newPV = isDelta ? currentPV + pv : pv
      newPV = Math.max(0, Math.min(newPV, maxPV)) // Clamp entre 0 e máximo

      // Verificar estados
      const isDying = ordemParanormalService.isDying(newPV)
      const isInjured = ordemParanormalService.isInjured(newPV, maxPV)

      // Aplicar condições automáticas
      let conditions: Condition[] = [...(character.conditions || [])]

      if (isDying && !conditions.includes('MORRENDO')) {
        const { newConditions } = ordemParanormalService.applyCondition('MORRENDO', conditions)
        conditions = newConditions
      } else if (!isDying && conditions.includes('MORRENDO')) {
        conditions = conditions.filter((c) => c !== 'MORRENDO' && c !== 'INCONSCIENTE')
      }

      const updatedStats = {
        ...stats,
        pv: {
          current: newPV,
          max: maxPV,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        character: data,
        isDying,
        isInjured,
      }
    } catch (error: any) {
      console.error('Error updating PV:', error)
      throw new Error('Erro ao atualizar PV: ' + error.message)
    }
  },

  /**
   * Atualiza SAN do personagem com validações
   * @param id - ID do personagem
   * @param san - Novo valor de SAN (ou delta)
   * @param isDelta - Se san é um delta (true) ou valor absoluto (false)
   * @returns Personagem atualizado
   */
  async updateSAN(id: string, san: number, isDelta: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentSAN = stats.san?.current || 0
      const maxSAN = stats.san?.max || 0

      let newSAN = isDelta ? currentSAN + san : san
      newSAN = Math.max(0, Math.min(newSAN, maxSAN)) // Clamp entre 0 e máximo

      // Verificar estados
      const isInsane = ordemParanormalService.isInsane(newSAN)
      const isLowSAN = newSAN <= maxSAN * 0.25 // 25% ou menos

      // Aplicar condições automáticas baseadas em SAN
      let conditions: Condition[] = [...(character.conditions || [])]

      if (isInsane && !conditions.includes('ENLOUQUECENDO')) {
        // Personagem perdeu completamente a sanidade
        conditions.push('ENLOUQUECENDO')
      } else if (isLowSAN && !conditions.includes('PERTURBADO') && !isInsane) {
        conditions.push('PERTURBADO')
      }

      const updatedStats = {
        ...stats,
        san: {
          current: newSAN,
          max: maxSAN,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        character: data,
        isInsane,
        isLowSAN,
      }
    } catch (error: any) {
      console.error('Error updating SAN:', error)
      throw new Error('Erro ao atualizar SAN: ' + error.message)
    }
  },

  /**
   * Atualiza PE do personagem
   * @param id - ID do personagem
   * @param pe - Novo valor de PE (ou delta)
   * @param isDelta - Se pe é um delta (true) ou valor absoluto (false)
   * @returns Personagem atualizado
   */
  async updatePE(id: string, pe: number, isDelta: boolean = false) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const currentPE = stats.pe?.current || 0
      const maxPE = stats.pe?.max || 0

      let newPE = isDelta ? currentPE + pe : pe
      newPE = Math.max(0, Math.min(newPE, maxPE)) // Clamp entre 0 e máximo

      const updatedStats = {
        ...stats,
        pe: {
          current: newPE,
          max: maxPE,
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error: any) {
      console.error('Error updating PE:', error)
      throw new Error('Erro ao atualizar PE: ' + error.message)
    }
  },

  /**
   * Rola teste de perícia para o personagem
   * @param id - ID do personagem
   * @param skillName - Nome da perícia
   * @param difficulty - Dificuldade do teste (DT)
   * @returns Resultado da rolagem
   */
  async rollSkillTest(id: string, skillName: string, difficulty: number = 15) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const attributes = character.attributes || {}
      const skills = character.skills || {}
      const conditions: Condition[] = character.conditions || []

      // Buscar perícia
      const skill = skills[skillName]
      if (!skill) {
        throw new Error(`Perícia ${skillName} não encontrada`)
      }

      // Obter valor do atributo base
      const attributeMap: { [key: string]: string } = {
        AGI: 'agi',
        FOR: 'for',
        INT: 'int',
        PRE: 'pre',
        VIG: 'vig',
      }

      const attributeKey = attributeMap[skill.attribute]
      if (!attributeKey) {
        throw new Error(`Atributo ${skill.attribute} não encontrado`)
      }
      const attributeValue = (attributes[attributeKey as keyof typeof attributes] as number) || 0

      // Calcular penalidades de condições
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)
      const skillPenalty = penalties.skillPenalties[skillName] || 0
      const attributePenalty = (penalties.attributePenalties[attributeKey as keyof typeof penalties.attributePenalties] as number) || 0

      // Aplicar penalidade em dados (se houver)
      // Nota: penalidades em dados afetam o número de dados rolados
      // Por enquanto, vamos aplicar como redução no atributo efetivo
      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar teste
      const rollResult = ordemParanormalService.rollAttributeTest(
        effectiveAttribute,
        skill.bonus + skillPenalty
      )

      const success = rollResult.total >= difficulty

      return {
        ...rollResult,
        skillName,
        skillBonus: skill.bonus,
        attributeValue,
        difficulty,
        success,
        penalties: {
          skillPenalty,
          attributePenalty,
        },
      }
    } catch (error: any) {
      console.error('Error rolling skill test:', error)
      throw new Error('Erro ao rolar teste de perícia: ' + error.message)
    }
  },

  /**
   * Rola ataque do personagem
   * @param id - ID do personagem
   * @param skillName - Nome da perícia de ataque (Luta ou Pontaria)
   * @param targetDefense - Defesa do alvo
   * @returns Resultado do ataque
   */
  async rollAttack(id: string, skillName: string, targetDefense: number) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const attributes = character.attributes || {}
      const skills = character.skills || {}
      const conditions: Condition[] = character.conditions || []

      // Buscar perícia
      const skill = skills[skillName]
      if (!skill) {
        throw new Error(`Perícia ${skillName} não encontrada`)
      }

      // Obter valor do atributo base
      const attributeMap: { [key: string]: string } = {
        AGI: 'agi',
        FOR: 'for',
        INT: 'int',
        PRE: 'pre',
        VIG: 'vig',
      }

      const attributeKey = attributeMap[skill.attribute]
      if (!attributeKey) {
        throw new Error(`Atributo ${skill.attribute} não encontrado`)
      }
      const attributeValue = (attributes[attributeKey as keyof typeof attributes] as number) || 0

      // Calcular penalidades de condições
      const penalties = ordemParanormalService.calculateConditionPenalties(conditions)
      const skillPenalty = penalties.skillPenalties[skillName] || 0
      const attributePenalty = (penalties.attributePenalties[attributeKey as keyof typeof penalties.attributePenalties] as number) || 0

      const effectiveAttribute = attributeValue + attributePenalty

      // Rolar ataque
      const attackResult = ordemParanormalService.rollAttack(
        effectiveAttribute,
        skill.bonus + skillPenalty,
        targetDefense
      )

      return {
        ...attackResult,
        skillName,
        skillBonus: skill.bonus,
        attributeValue,
        penalties: {
          skillPenalty,
          attributePenalty,
        },
      }
    } catch (error: any) {
      console.error('Error rolling attack:', error)
      throw new Error('Erro ao rolar ataque: ' + error.message)
    }
  },

  /**
   * Aplica dano ao personagem (físico ou mental)
   * @param id - ID do personagem
   * @param damage - Quantidade de dano
   * @param type - Tipo de dano ('physical' ou 'mental')
   * @returns Personagem atualizado
   */
  async applyDamage(id: string, damage: number, type: 'physical' | 'mental' = 'physical') {
    try {
      if (type === 'physical') {
        // Dano físico reduz PV
        return await this.updatePV(id, -damage, true)
      } else {
        // Dano mental reduz SAN
        return await this.updateSAN(id, -damage, true)
      }
    } catch (error: any) {
      console.error('Error applying damage:', error)
      throw new Error('Erro ao aplicar dano: ' + error.message)
    }
  },

  /**
   * Recupera PE do personagem (descanso)
   * @param id - ID do personagem
   * @returns Personagem atualizado
   */
  async recoverPE(id: string) {
    try {
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const stats = character.stats || {}
      const nex = stats.nex || 5

      // Calcular recuperação
      const recovery = ordemParanormalService.calculatePERecovery(nex)

      // Aplicar recuperação
      return await this.updatePE(id, recovery, true)
    } catch (error: any) {
      console.error('Error recovering PE:', error)
      throw new Error('Erro ao recuperar PE: ' + error.message)
    }
  },
}

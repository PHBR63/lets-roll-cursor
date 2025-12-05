import { originService } from '../originService'
import { Origin } from '../../types/origin'
import { Skills } from '../../types/ordemParanormal'

describe('originService', () => {
  describe('getAllOrigins', () => {
    it('deve retornar todas as origens disponíveis', () => {
      const origins = originService.getAllOrigins()

      expect(origins).toBeDefined()
      expect(Array.isArray(origins)).toBe(true)
      expect(origins.length).toBeGreaterThan(0)
      expect(origins[0]).toHaveProperty('id')
      expect(origins[0]).toHaveProperty('name')
      expect(origins[0]).toHaveProperty('description')
      expect(origins[0]).toHaveProperty('trainedSkills')
      expect(origins[0]).toHaveProperty('power')
    })

    it('deve retornar 26 origens', () => {
      const origins = originService.getAllOrigins()
      expect(origins.length).toBe(26)
    })
  })

  describe('getOriginConfig', () => {
    it('deve retornar configuração de origem específica', () => {
      const config = originService.getOriginConfig('ACADEMICO')

      expect(config).toBeDefined()
      expect(config.id).toBe('ACADEMICO')
      expect(config.name).toBe('Acadêmico')
      expect(config.trainedSkills).toContain('Investigação')
      expect(config.trainedSkills).toContain('Ocultismo')
      expect(config.power).toBeDefined()
      expect(config.power.name).toBe('Saber em Detalhes')
    })

    it('deve retornar undefined para origem inválida', () => {
      const config = originService.getOriginConfig('ORIGEM_INVALIDA' as Origin)
      expect(config).toBeUndefined()
    })
  })

  describe('applyOriginSkills', () => {
    it('deve adicionar perícias treinadas da origem', () => {
      const currentSkills: Skills = {}
      const result = originService.applyOriginSkills('ACADEMICO', currentSkills)

      expect(result['Investigação']).toBeDefined()
      expect(result['Investigação'].training).toBe('TRAINED')
      expect(result['Investigação'].bonus).toBe(5)
      expect(result['Ocultismo']).toBeDefined()
      expect(result['Ocultismo'].training).toBe('TRAINED')
      expect(result['Ocultismo'].bonus).toBe(5)
    })

    it('deve manter perícias existentes e adicionar novas', () => {
      const currentSkills: Skills = {
        Luta: {
          attribute: 'FOR',
          training: 'TRAINED',
          bonus: 5,
        },
      }

      const result = originService.applyOriginSkills('ACADEMICO', currentSkills)

      expect(result['Luta']).toBeDefined()
      expect(result['Investigação']).toBeDefined()
      expect(result['Ocultismo']).toBeDefined()
    })

    it('deve atualizar perícia para treinada se for menor', () => {
      const currentSkills: Skills = {
        Investigação: {
          attribute: 'INT',
          training: 'UNTRAINED',
          bonus: 0,
        },
      }

      const result = originService.applyOriginSkills('ACADEMICO', currentSkills)

      expect(result['Investigação'].training).toBe('TRAINED')
      expect(result['Investigação'].bonus).toBe(5)
    })

    it('deve não rebaixar perícia já treinada em nível maior', () => {
      const currentSkills: Skills = {
        Investigação: {
          attribute: 'INT',
          training: 'EXPERT',
          bonus: 15,
        },
      }

      const result = originService.applyOriginSkills('ACADEMICO', currentSkills)

      expect(result['Investigação'].training).toBe('EXPERT')
      expect(result['Investigação'].bonus).toBe(15)
    })

    it('deve funcionar com skills vazias', () => {
      const result = originService.applyOriginSkills('ATLETA', {})

      expect(result['Atletismo']).toBeDefined()
      expect(result['Acrobacia']).toBeDefined()
    })
  })

  describe('getOriginPower', () => {
    it('deve retornar poder da origem', () => {
      const power = originService.getOriginPower('ACADEMICO')

      expect(power).toBeDefined()
      expect(power.name).toBe('Saber em Detalhes')
      expect(power.description).toBeDefined()
    })

    it('deve retornar poder diferente para cada origem', () => {
      const power1 = originService.getOriginPower('ACADEMICO')
      const power2 = originService.getOriginPower('ATLETA')

      expect(power1.name).not.toBe(power2.name)
    })
  })

  describe('removeOriginSkills', () => {
    it('deve remover perícias treinadas da origem anterior', () => {
      const currentSkills: Skills = {
        Investigação: {
          attribute: 'INT',
          training: 'TRAINED',
          bonus: 5,
        },
        Ocultismo: {
          attribute: 'INT',
          training: 'TRAINED',
          bonus: 5,
        },
        Luta: {
          attribute: 'FOR',
          training: 'TRAINED',
          bonus: 5,
        },
      }

      const result = originService.removeOriginSkills('ACADEMICO', currentSkills)

      expect(result['Investigação'].training).toBe('UNTRAINED')
      expect(result['Investigação'].bonus).toBe(0)
      expect(result['Ocultismo'].training).toBe('UNTRAINED')
      expect(result['Ocultismo'].bonus).toBe(0)
      expect(result['Luta'].training).toBe('TRAINED') // Não foi afetada
      expect(result['Luta'].bonus).toBe(5)
    })

    it('deve retornar skills inalteradas se origem for null', () => {
      const currentSkills: Skills = {
        Luta: {
          attribute: 'FOR',
          training: 'TRAINED',
          bonus: 5,
        },
      }

      const result = originService.removeOriginSkills(null, currentSkills)

      expect(result).toEqual(currentSkills)
    })

    it('deve não remover perícias que não foram treinadas pela origem', () => {
      const currentSkills: Skills = {
        Investigação: {
          attribute: 'INT',
          training: 'COMPETENT', // Nível maior que TRAINED
          bonus: 10,
        },
      }

      const result = originService.removeOriginSkills('ACADEMICO', currentSkills)

      // Não deve remover porque não estava apenas como TRAINED
      expect(result['Investigação'].training).toBe('UNTRAINED')
    })
  })
})


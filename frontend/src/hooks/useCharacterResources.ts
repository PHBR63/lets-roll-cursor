import { useMemo } from 'react'
import { CharacterClass, Attributes, CharacterStats, CLASS_CONFIGS } from '@/types/ordemParanormal'

/**
 * Hook para calcular recursos do personagem automaticamente
 * Recalcula PV, SAN, PE e Defesa baseado em atributos, classe e NEX
 */
export function useCharacterResources(
  characterClass: CharacterClass | undefined,
  attributes: Attributes | undefined,
  nex: number | undefined,
  currentStats?: CharacterStats
) {
  const resources = useMemo(() => {
    if (!characterClass || !attributes || nex === undefined) {
      return {
        pvMax: 0,
        sanMax: 0,
        peMax: 0,
        defense: 10,
      }
    }

    const config = CLASS_CONFIGS[characterClass]

    // Calcular PV máximo: inicial + (NEX * incremento por NEX)
    const pvMax = config.pvInitial + Math.floor(nex / 5) * config.pvPerNex

    // Calcular SAN máximo: inicial + (NEX * incremento por NEX)
    const sanMax = config.sanInitial + Math.floor(nex / 5) * config.sanPerNex

    // Calcular PE máximo: inicial + (NEX * incremento por NEX)
    const peMax = config.peInitial + Math.floor(nex / 5) * config.pePerNex

    // Calcular Defesa: 10 + Agilidade
    const defense = 10 + (attributes.agi || 0)

    return {
      pvMax,
      sanMax,
      peMax,
      defense,
    }
  }, [characterClass, attributes, nex])

  /**
   * Valida se um valor não excede o máximo
   */
  const validateValue = (current: number, max: number): number => {
    return Math.min(Math.max(0, current), max)
  }

  /**
   * Valida e ajusta stats atuais para não excederem máximos
   */
  const validateStats = (stats: CharacterStats | undefined): CharacterStats => {
    if (!stats) {
      return {
        pv: { current: 0, max: resources.pvMax },
        san: { current: 0, max: resources.sanMax },
        pe: { current: 0, max: resources.peMax },
        nex: nex || 0,
      }
    }

    return {
      pv: {
        current: validateValue(stats.pv.current, resources.pvMax),
        max: resources.pvMax,
      },
      san: {
        current: validateValue(stats.san.current, resources.sanMax),
        max: resources.sanMax,
      },
      pe: {
        current: validateValue(stats.pe.current, resources.peMax),
        max: resources.peMax,
      },
      nex: stats.nex || nex || 0,
    }
  }

  return {
    ...resources,
    validateStats,
    validateValue,
  }
}


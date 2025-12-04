import { DiceRollResult as DiceRollResultType } from './types'

interface DiceRollResultProps {
  result: DiceRollResultType
}

/**
 * Componente para exibir resultado de rolagem
 */
export function DiceRollResult({ result }: DiceRollResultProps) {
  return (
    <div className="mt-4 p-3 bg-accent/20 border border-accent rounded-lg">
      {result.type === 'basic' && (
        <>
          <div className="text-white font-bold text-xl text-center">
            {result.result}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {result.formula}
            {result.details && (
              <span className="block text-xs mt-1">
                ({result.details.join(', ')})
              </span>
            )}
          </div>
        </>
      )}

      {result.type === 'skill' && (
        <>
          <div className="text-white font-bold text-xl text-center">
            {result.total} {result.success ? '✅' : '❌'}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {result.skillName} vs DT {result.difficulty}
          </div>
          <div className="text-xs text-text-secondary mt-2 text-center">
            Dados: [{result.dice?.join(', ')}] + Bônus: {result.skillBonus} = {result.total}
            {result.advantage && ' (Vantagem)'}
            {result.disadvantage && ' (Desvantagem)'}
          </div>
          <div className="text-xs text-center mt-2">
            {result.success ? (
              <span className="text-green-400">Sucesso!</span>
            ) : (
              <span className="text-red-400">Falha</span>
            )}
          </div>
        </>
      )}

      {result.type === 'attack' && (
        <>
          <div className="text-white font-bold text-xl text-center">
            {result.total} {result.hit ? '✅' : '❌'}
            {result.critical && ' 🎯'}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {result.skillName} vs Defesa {result.targetDefense}
          </div>
          <div className="text-xs text-text-secondary mt-2 text-center">
            Ataque: [{result.dice?.join(', ') || (Array.isArray(result.details) ? result.details.join(', ') : '')}] + {(result as any).bonus || result.skillBonus || 0} = {result.total}
            {result.critical && ' (CRÍTICO!)'}
          </div>
          {result.hit && result.damage && (
            <div className="text-xs text-center mt-2">
              <span className="text-red-400">
                Dano: {result.damage.total} ({result.damage.dice.join(', ')})
              </span>
            </div>
          )}
          <div className="text-xs text-center mt-2">
            {result.hit ? (
              <span className="text-green-400">Acertou!</span>
            ) : (
              <span className="text-red-400">Errou</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}


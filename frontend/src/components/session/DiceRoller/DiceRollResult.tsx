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
            Dados rolados: [{result.dice?.join(', ')}]
            <br />
            Dado escolhido: <span className="font-bold">{result.selectedDice || result.result}</span>
            <br />
            + Bônus de Perícia: {result.skillBonus} = <span className="font-bold">{result.total}</span>
            {result.advantage && ' (Vantagem - escolheu maior)'}
            {result.disadvantage && ' (Desvantagem - escolheu menor)'}
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
            {result.critical && ' 🎯 CRÍTICO!'}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {result.skillName} vs Defesa {result.targetDefense}
            {result.threatRange && ` (Crítico: ${result.threatRange}+)`}
          </div>
          <div className="text-xs text-text-secondary mt-2 text-center">
            Dados rolados: [{result.dice?.join(', ')}]
            <br />
            Dado escolhido: <span className="font-bold">{result.selectedDice || result.result}</span>
            {result.threatRange && result.selectedDice && result.selectedDice >= result.threatRange && (
              <span className="text-yellow-400 font-bold"> (≥ Margem de Ameaça!)</span>
            )}
            <br />
            + Bônus de Perícia: {result.bonus || result.skillBonus || 0} = <span className="font-bold">{result.total}</span>
          </div>
          {result.hit && result.damage && (
            <div className="text-xs text-center mt-2">
              <span className="text-red-400">
                Dano: {result.damage.total} ({result.damage.dice.join(', ')})
                {result.critical && ' (dados multiplicados!)'}
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

      {result.type === 'resistance' && (
        <>
          <div className="text-white font-bold text-xl text-center">
            {result.total} {result.success ? '✅' : '❌'}
          </div>
          <div className="text-text-secondary text-sm text-center mt-1">
            {result.resistanceType} vs DT {result.difficulty}
          </div>
          <div className="text-xs text-text-secondary mt-2 text-center">
            Dados rolados: [{result.dice?.join(', ')}]
            <br />
            Dado escolhido: <span className="font-bold">{result.selectedDice || result.result}</span>
            <br />
            Resultado: <span className="font-bold">{result.total}</span>
            {result.advantage && ' (Vantagem - escolheu maior)'}
            {result.disadvantage && ' (Desvantagem - escolheu menor)'}
          </div>
          <div className="text-xs text-center mt-2">
            {result.success ? (
              <span className="text-green-400">Resistiu!</span>
            ) : (
              <span className="text-red-400">Falhou</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}


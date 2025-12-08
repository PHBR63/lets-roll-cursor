// @ts-nocheck
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Calculadora de DT (Dificuldade de Teste)
 * Ajuda mestres e jogadores a calcular DT baseado em atributos e perícias
 */
export function DTCalculator() {
  const [attributeValue, setAttributeValue] = useState<number>(0)
  const [skillBonus, setSkillBonus] = useState<number>(0)
  const [baseDT, setBaseDT] = useState<number>(10)
  const [modifiers, setModifiers] = useState<number>(0)

  // Calcular DT final
  const calculatedDT = useMemo(() => {
    // DT base + modificadores
    return baseDT + modifiers
  }, [baseDT, modifiers])

  // Calcular chance de sucesso aproximada
  const successChance = useMemo(() => {
    if (calculatedDT <= 0) return 100
    if (calculatedDT >= 40) return 0

    // Aproximação: considerando 1d20 + atributo + perícia
    // Chance = (21 - DT + atributo + perícia) / 20 * 100
    const total = attributeValue + skillBonus
    const chance = Math.max(0, Math.min(100, ((21 - calculatedDT + total) / 20) * 100))
    return Math.round(chance)
  }, [calculatedDT, attributeValue, skillBonus])

  // Calcular resultado esperado
  const expectedResult = useMemo(() => {
    // Resultado esperado = 10.5 (média de 1d20) + atributo + perícia
    return 10.5 + attributeValue + skillBonus
  }, [attributeValue, skillBonus])

  const getDifficultyLabel = (dt: number): string => {
    if (dt <= 5) return 'Trivial'
    if (dt <= 10) return 'Fácil'
    if (dt <= 15) return 'Normal'
    if (dt <= 20) return 'Difícil'
    if (dt <= 25) return 'Muito Difícil'
    if (dt <= 30) return 'Extremo'
    return 'Quase Impossível'
  }

  const getSuccessColor = (chance: number): string => {
    if (chance >= 75) return 'text-green-500'
    if (chance >= 50) return 'text-yellow-500'
    if (chance >= 25) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <Card className="bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de DT
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-text-secondary cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                DT (Dificuldade de Teste) é o valor que o resultado da rolagem precisa igualar ou superar para ter sucesso.
                DT = Base (10) + Modificadores situacionais.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Atributo */}
        <div>
          <Label className="text-white text-sm">Valor do Atributo</Label>
          <Input
            type="number"
            value={attributeValue}
            onChange={(e) => setAttributeValue(parseInt(e.target.value) || 0)}
            className="mt-1"
            min={-5}
            max={20}
          />
        </div>

        {/* Bônus de Perícia */}
        <div>
          <Label className="text-white text-sm">Bônus de Perícia</Label>
          <Input
            type="number"
            value={skillBonus}
            onChange={(e) => setSkillBonus(parseInt(e.target.value) || 0)}
            className="mt-1"
            min={0}
            max={20}
          />
        </div>

        {/* DT Base */}
        <div>
          <Label className="text-white text-sm">DT Base</Label>
          <Input
            type="number"
            value={baseDT}
            onChange={(e) => setBaseDT(parseInt(e.target.value) || 10)}
            className="mt-1"
            min={1}
            max={50}
          />
        </div>

        {/* Modificadores */}
        <div>
          <Label className="text-white text-sm">Modificadores</Label>
          <Input
            type="number"
            value={modifiers}
            onChange={(e) => setModifiers(parseInt(e.target.value) || 0)}
            className="mt-1"
            placeholder="+/-"
          />
        </div>
      </div>

      {/* Resultado */}
      <div className="pt-4 border-t border-card-secondary space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-text-secondary text-sm">DT Final</Label>
          <span className="text-white text-2xl font-bold">{calculatedDT}</span>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-text-secondary text-sm">Dificuldade</Label>
          <span className="text-white font-semibold">{getDifficultyLabel(calculatedDT)}</span>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-text-secondary text-sm">Resultado Esperado</Label>
          <span className="text-white font-semibold">{expectedResult.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-text-secondary text-sm">Chance de Sucesso</Label>
          <span className={`font-bold text-lg ${getSuccessColor(successChance)}`}>
            {successChance}%
          </span>
        </div>

        {/* Barra de chance */}
        <div className="w-full bg-card-secondary rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              successChance >= 75
                ? 'bg-green-500'
                : successChance >= 50
                ? 'bg-yellow-500'
                : successChance >= 25
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${successChance}%` }}
          />
        </div>

        {/* Comparação */}
        <div className="text-xs text-text-secondary pt-2 border-t border-card-secondary">
          <p>
            Com {attributeValue >= 0 ? '+' : ''}{attributeValue} de atributo e +{skillBonus} de perícia,
            o resultado esperado é {expectedResult.toFixed(1)}.
          </p>
          <p className="mt-1">
            Para passar em DT {calculatedDT}, você precisa rolar{' '}
            <span className="text-white font-semibold">
              {Math.max(1, calculatedDT - attributeValue - skillBonus)} ou mais
            </span>{' '}
            no d20.
          </p>
        </div>
      </div>

      {/* Botões rápidos de DT */}
      <div className="pt-2 border-t border-card-secondary">
        <Label className="text-text-secondary text-xs mb-2 block">DTs Comuns</Label>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 15, 20, 25, 30].map((dt) => (
            <Button
              key={dt}
              size="sm"
              variant="outline"
              onClick={() => {
                setBaseDT(dt)
                setModifiers(0)
              }}
              className="text-xs"
            >
              DT {dt}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}


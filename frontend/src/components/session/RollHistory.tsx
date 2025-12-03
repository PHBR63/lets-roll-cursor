import { useRealtimeRolls } from '@/hooks/useRealtimeRolls'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

/**
 * Componente de histórico de rolagens
 * Exibe rolagens recentes em cards hexagonais
 */
interface RollHistoryProps {
  sessionId?: string
  campaignId?: string
  maxRolls?: number
}

export function RollHistory({
  sessionId,
  campaignId,
  maxRolls = 20,
}: RollHistoryProps) {
  const { rolls, loading } = useRealtimeRolls(sessionId, campaignId)

  /**
   * Exporta histórico de rolagens para CSV
   */
  const exportToCSV = () => {
    if (rolls.length === 0) {
      alert('Nenhuma rolagem para exportar')
      return
    }

    const headers = ['Data', 'Jogador', 'Personagem', 'Fórmula', 'Resultado', 'Detalhes']
    const rows = rolls.map((roll) => {
      const date = new Date(roll.created_at).toLocaleString('pt-BR')
      const userName = roll.user?.username || 'Desconhecido'
      const characterName = roll.character?.name || '-'
      const formula = roll.formula || '-'
      const result = roll.result || 0
      const details = roll.details?.rolls
        ? `[${roll.details.rolls.join(', ')}]`
        : '-'

      return [date, userName, characterName, formula, result.toString(), details]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rolagens_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Carregando rolagens...
      </div>
    )
  }

  if (rolls.length === 0) {
    return (
      <div className="text-text-secondary text-sm text-center py-4">
        Nenhuma rolagem ainda
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-card-secondary flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={exportToCSV}
          disabled={rolls.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-2">
        {rolls.slice(0, maxRolls).map((roll) => {
          const userName = roll.user?.username || 'Jogador'
          const characterName = roll.character?.name
          const displayName = characterName
            ? `${userName} (${characterName})`
            : userName

          return (
            <Card
              key={roll.id}
              className="bg-white/5 border-card-secondary hover:border-accent transition-colors p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-bold text-2xl text-center">
                    {roll.result}
                  </div>
                  <div className="text-text-secondary text-xs text-center mt-1">
                    {displayName}
                  </div>
                  <div className="text-text-secondary text-xs text-center mt-1">
                    {roll.formula}
                  </div>
                  {roll.details?.rolls && (
                    <div className="text-text-secondary text-xs text-center mt-1">
                      [{roll.details.rolls.join(', ')}]
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        </div>
      </ScrollArea>
    </div>
  )
}


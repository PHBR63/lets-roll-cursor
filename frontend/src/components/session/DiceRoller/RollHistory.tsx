import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, X, Copy, Check, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { DiceRollResult as DiceRollResultType } from '@/types/dice'

interface RollHistoryProps {
  sessionId?: string
  campaignId?: string
}

interface RollHistoryItem {
  id: string
  result: DiceRollResultType
  timestamp: Date
  copied?: boolean
}

/**
 * Componente de histórico de rolagens
 * Mostra as últimas rolagens da sessão
 */
export function RollHistory({ sessionId, campaignId }: RollHistoryProps) {
  const [history, setHistory] = useState<RollHistoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const toast = useToast()

  // Escutar rolagens em tempo real via Supabase Realtime
  useEffect(() => {
    if (!sessionId || !campaignId) return

    const channel = supabase
      .channel(`dice-rolls:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_rolls',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          const newRoll: RollHistoryItem = {
            id: payload.new.id,
            result: {
              type: payload.new.type || 'basic',
              result: payload.new.result,
              total: payload.new.result,
              formula: payload.new.formula || '',
              details: payload.new.details || {},
            },
            timestamp: new Date(payload.new.created_at),
          }
          setHistory((prev) => [newRoll, ...prev].slice(0, 50)) // Manter últimas 50
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, campaignId])

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setHistory((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, copied: true } : item))
      )
      setTimeout(() => {
        setHistory((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, copied: false } : item))
        )
      }, 2000)
      toast.toast({
        title: 'Copiado!',
        description: 'Resultado copiado para a área de transferência',
      })
    } catch (error) {
      toast.toast({
        title: 'Erro',
        description: 'Não foi possível copiar',
        variant: 'destructive',
      })
    }
  }

  const clearHistory = () => {
    setHistory([])
    toast.toast({
      title: 'Histórico limpo',
      description: 'Todas as rolagens foram removidas',
    })
  }

  const exportHistory = () => {
    if (history.length === 0) {
      toast.toast({
        title: 'Histórico vazio',
        description: 'Não há rolagens para exportar',
        variant: 'destructive',
      })
      return
    }

    const csv = [
      ['Data/Hora', 'Tipo', 'Fórmula', 'Resultado', 'Total'].join(','),
      ...history.map((item) =>
        [
          item.timestamp.toLocaleString(),
          item.result.type || 'basic',
          item.result.formula || '',
          item.result.result || item.result.total || 0,
          item.result.total || item.result.result || 0,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico-rolagens-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.toast({
      title: 'Histórico exportado',
      description: 'Arquivo CSV baixado com sucesso',
    })
  }

  const formatResult = (item: RollHistoryItem): string => {
    const { result } = item
    if (result.type === 'attack') {
      const hit = result.hit ?? (result.details as any)?.hit ?? false
      return `${result.formula || 'Ataque'}: ${result.total || result.result} (${hit ? 'Acertou' : 'Errou'})`
    }
    if (result.type === 'skill') {
      return `${result.formula || 'Perícia'}: ${result.total || result.result}`
    }
    return `${result.formula || 'Rolagem'}: ${result.total || result.result}`
  }

  const getResultColor = (item: RollHistoryItem): string => {
    const total = item.result.total || item.result.result || 0
    if (total >= 20) return 'text-green-500'
    if (total >= 15) return 'text-yellow-500'
    if (total >= 10) return 'text-white'
    return 'text-red-500'
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <History className="w-4 h-4 mr-2" />
        Histórico ({history.length})
      </Button>
    )
  }

  return (
    <Card className="bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <History className="w-4 h-4" />
          Histórico de Rolagens
        </h4>
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <Button onClick={exportHistory} size="sm" variant="ghost" title="Exportar CSV">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={clearHistory} size="sm" variant="ghost" title="Limpar histórico">
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button onClick={() => setIsOpen(false)} size="sm" variant="ghost" title="Fechar">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma rolagem ainda</p>
          <p className="text-xs mt-1">As rolagens aparecerão aqui em tempo real</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-card-secondary rounded-lg hover:bg-card-hover transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${getResultColor(item)}`}>
                      {item.result.total || item.result.result}
                    </span>
                    <span className="text-text-secondary text-sm">
                      {formatResult(item)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {item.result.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(String(item.result.total || item.result.result), item.id)}
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                >
                  {item.copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}


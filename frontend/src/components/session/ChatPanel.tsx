import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
// Temporariamente removido react-window devido a problemas de compatibilidade com v2
// import { List as FixedSizeList, type ListImperativeAPI, type RowComponentProps } from 'react-window'
import { useApiError } from '@/hooks/useApiError'
import { useToast } from '@/hooks/useToast'

/**
 * Painel de chat estilo Discord
 * Mensagens em tempo real via Supabase Realtime
 */
interface ChatPanelProps {
  sessionId?: string
  campaignId?: string
}

interface Message {
  id: string
  content: string
  user_id: string
  user?: {
    username?: string
    avatar_url?: string
  }
  character_id?: string
  character?: {
    name?: string
  }
  type: 'message' | 'narration' | 'ooc'
  created_at: string
}

/**
 * Item de mensagem memoizado
 */
const MessageItem = memo(({ message, style }: { message: Message; style: React.CSSProperties }) => (
  <div style={style}>
    <div className="flex gap-3 hover:bg-card-secondary/50 p-2 rounded transition-colors mx-2">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
        {message.user?.avatar_url ? (
          <img
            src={message.user.avatar_url}
            alt={message.user.username}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-white text-xs">
            {message.user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-white font-semibold text-sm">
            {message.character?.name || message.user?.username || 'Usuário'}
          </span>
          <span className="text-text-secondary text-xs">
            {new Date(message.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-text-secondary text-sm mt-1 whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  </div>
))

MessageItem.displayName = 'MessageItem'

export function ChatPanel({ sessionId, campaignId }: ChatPanelProps) {
  const { user } = useAuth()
  const { messages, loading: messagesLoading } = useRealtimeChat(sessionId, campaignId)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // const listRef = useRef<ListImperativeAPI | null>(null) // Temporariamente removido
  const { handleErrorWithToast, handleResponseError } = useApiError()
  const toast = useToast()

  // Memoizar mensagens para evitar re-renders desnecessários
  const memoizedMessages = useMemo(() => messages, [messages])

  useEffect(() => {
    scrollToBottom()
    // Scroll para o final quando novas mensagens chegarem
    // TODO: Implementar scroll com listRef quando a API do react-window v2 estiver correta
  }, [memoizedMessages])

  /**
   * Envia mensagem
   */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !campaignId || !user) return

    setSending(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) return

      // Buscar personagem do usuário
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      let characterId = null
      
      const charResponse = await fetch(
        `${apiUrl}/api/characters?userId=${user.id}&campaignId=${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      )

      if (charResponse.ok) {
        const chars = await charResponse.json()
        characterId = chars[0]?.id || null
      }

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({
          campaignId,
          sessionId: sessionId || null,
          characterId,
          content: newMessage,
          type: 'message',
        }),
      })

      if (response.ok) {
        setNewMessage('')
        toast.success('Mensagem enviada')
      } else {
        await handleResponseError(response, 'Erro ao enviar mensagem')
      }
    } catch (error) {
      handleErrorWithToast(error, 'Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  /**
   * Scroll para última mensagem
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-secondary">
        <h3 className="text-white font-semibold">Chat</h3>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-hidden">
        {memoizedMessages.length > 0 ? (
          // TODO: Reimplementar virtualização com react-window v2 quando API estiver correta
          // Por enquanto, renderização normal para todas as listas
          (
            // Renderização normal para listas pequenas
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {memoizedMessages.map((message) => (
                <MessageItem key={message.id} message={message} style={{}} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )
        ) : (
          <div className="text-text-secondary text-sm text-center py-8">
            Nenhuma mensagem ainda. Seja o primeiro a falar!
          </div>
        )}
      </div>

      {/* Input de Mensagem */}
      <form onSubmit={sendMessage} className="p-4 border-t border-card-secondary">
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-input border-white/20 flex-1"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </div>
  )
}


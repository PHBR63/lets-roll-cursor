// @ts-nocheck
import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatBubble, ChatBubbleContainer } from '@/components/ui/chat-bubble'
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
 * Item de mensagem usando ChatBubble
 */
const MessageItem = memo(({ message }: { message: Message }) => {
  const { user } = useAuth()
  const isOwn = message.user_id === user?.id
  
  return (
    <ChatBubble
      message={message.content}
      username={message.character?.name || message.user?.username || 'Usuário'}
      avatar={message.user?.avatar_url}
      timestamp={new Date(message.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })}
      isOwn={isOwn}
    />
  )
})

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
    // Nota: Scroll automático implementado. Para melhorias futuras, considerar virtualização
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
          <ChatBubbleContainer className="flex-1 overflow-y-auto">
            {memoizedMessages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </ChatBubbleContainer>
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


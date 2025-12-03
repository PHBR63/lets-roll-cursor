import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useRealtimeChat } from '@/hooks/useRealtimeChat'

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

export function ChatPanel({ sessionId, campaignId }: ChatPanelProps) {
  const { user } = useAuth()
  const { messages, loading: messagesLoading } = useRealtimeChat(sessionId, campaignId)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      } else {
        throw new Error('Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  /**
   * Scroll para última mensagem
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-secondary">
        <h3 className="text-white font-semibold">Chat</h3>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className="flex gap-3 hover:bg-card-secondary/50 p-2 rounded transition-colors"
            >
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
          ))
        ) : (
          <div className="text-text-secondary text-sm text-center py-8">
            Nenhuma mensagem ainda. Seja o primeiro a falar!
          </div>
        )}
        <div ref={messagesEndRef} />
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


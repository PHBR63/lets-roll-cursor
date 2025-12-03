# Configuração do Supabase Realtime

Este documento descreve como configurar o Supabase Realtime para o projeto Let's Roll.

## Visão Geral

O Supabase Realtime permite atualizações em tempo real através de subscriptions PostgreSQL. Utilizamos Realtime para:

- **Chat**: Mensagens aparecem instantaneamente para todos os jogadores
- **Rolagens de Dados**: Rolagens são sincronizadas em tempo real
- **Personagens**: Atualizações de stats aparecem imediatamente
- **Jogadores**: Status de participantes atualiza em tempo real
- **Sessões**: Mudanças no estado da sessão são propagadas

## Configuração no Supabase Dashboard

### 1. Habilitar Realtime nas Tabelas

No Supabase Dashboard, vá para **Database > Replication** e habilite Realtime para as seguintes tabelas:

- ✅ `chat_messages` - Para chat em tempo real
- ✅ `dice_rolls` - Para rolagens de dados
- ✅ `characters` - Para atualizações de personagens
- ✅ `campaign_participants` - Para status de jogadores
- ✅ `sessions` - Para atualizações de sessão
- ✅ `creatures` - Para atualizações de criaturas (Master Panel)

### 2. Políticas RLS (Row Level Security)

Certifique-se de que as políticas RLS estão configuradas corretamente para permitir leitura/escrita baseada em:

- **Campaign ID**: Usuários só veem dados de campanhas que participam
- **User ID**: Usuários só veem seus próprios dados privados
- **Role**: Mestres têm permissões adicionais

### 3. Configuração de Channels

Os hooks Realtime criam channels com os seguintes padrões:

- `chat:{campaignId}` - Chat da campanha
- `dice-rolls:{campaignId}` - Rolagens da campanha
- `characters:{campaignId}` - Personagens da campanha
- `players:{campaignId}` - Participantes da campanha
- `session:{sessionId}` - Sessão específica

## Hooks Implementados

### useRealtimeChat

```typescript
const { messages, loading, refresh } = useRealtimeChat(sessionId, campaignId)
```

- Subscribe para novas mensagens na tabela `chat_messages`
- Filtra por `campaign_id`
- Carrega dados de usuário e personagem automaticamente

### useRealtimeRolls

```typescript
const { rolls, loading, refresh } = useRealtimeRolls(sessionId, campaignId)
```

- Subscribe para novas rolagens na tabela `dice_rolls`
- Filtra por `campaign_id` e ignora rolagens privadas
- Carrega dados de usuário e personagem automaticamente

### useRealtimeCharacters

```typescript
const { characters, loading, refresh } = useRealtimeCharacters(campaignId)
```

- Subscribe para INSERT/UPDATE/DELETE na tabela `characters`
- Filtra por `campaign_id`
- Atualiza lista automaticamente quando personagens mudam

### useRealtimePlayers

```typescript
const { participants, loading, refresh } = useRealtimePlayers(campaignId)
```

- Subscribe para INSERT/UPDATE/DELETE na tabela `campaign_participants`
- Filtra por `campaign_id`
- Atualiza lista quando jogadores entram/saem

### useRealtimeSession

```typescript
const { session, loading, refresh } = useRealtimeSession(sessionId)
```

- Subscribe para UPDATE na tabela `sessions`
- Filtra por `session_id`
- Atualiza quando estado da sessão muda (board_state, etc)

## Troubleshooting

### Realtime não está funcionando

1. **Verificar se Realtime está habilitado**:
   - Dashboard > Database > Replication
   - Certifique-se de que a tabela está marcada

2. **Verificar políticas RLS**:
   - Dashboard > Authentication > Policies
   - Certifique-se de que há políticas SELECT para a tabela

3. **Verificar console do navegador**:
   - Abra DevTools > Console
   - Procure por erros de subscription

4. **Verificar conexão**:
   - Certifique-se de que o Supabase está acessível
   - Verifique se há bloqueadores de rede/firewall

### Performance

- **Limite de subscriptions**: Cada hook cria uma subscription. Evite criar muitos hooks simultaneamente.
- **Cleanup**: Os hooks fazem cleanup automático quando o componente desmonta.
- **Debounce**: Algumas operações (como salvamento de board_state) usam debounce para evitar muitas atualizações.

## Exemplo de Uso

```typescript
// Em um componente
import { useRealtimeChat } from '@/hooks/useRealtimeChat'
import { useRealtimeRolls } from '@/hooks/useRealtimeRolls'

function SessionRoom({ sessionId, campaignId }) {
  const { messages } = useRealtimeChat(sessionId, campaignId)
  const { rolls } = useRealtimeRolls(sessionId, campaignId)
  
  // Mensagens e rolagens são atualizados automaticamente
  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      {rolls.map(roll => <Roll key={roll.id} {...roll} />)}
    </div>
  )
}
```

## Próximos Passos

- [ ] Adicionar indicadores de status online/offline
- [ ] Implementar presence (quem está online)
- [ ] Adicionar notificações para eventos importantes
- [ ] Otimizar performance com paginação


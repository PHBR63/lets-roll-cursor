# Próximo Plano de Implementação - Let's Roll

## 📊 Status Atual

### ✅ Já Implementado
- **Fase 2.1:** Wizard de criação de campanha (COMPLETO)
- **Fase 2.2:** Detalhes da campanha (PARCIAL - falta ficha completa)
- **Fase 2.3:** Sala de sessão (ESTRUTURA - falta Realtime)
- **Backend:** Campaign, Session, Dice, Chat Services (COMPLETOS)

### ⚠️ Pendências Críticas
- **Backend:** Character, Creature, Moment Services (INCOMPLETOS)
- **Backend:** Item, Ability Services (NÃO EXISTEM)
- **Frontend:** Ficha de personagem completa (NÃO EXISTE)
- **Frontend:** Painel do mestre (NÃO EXISTE)
- **Integração:** Supabase Realtime (NÃO IMPLEMENTADO)

---

## 🎯 Próximos Passos - Ordem de Prioridade

### **FASE 2.6 - Completar Backend (PRIORIDADE ALTA)**

Esta fase é fundamental para que o frontend possa funcionar completamente. Sem os serviços do backend, muitas funcionalidades não terão dados reais.

#### 1. Character Service Completo
**Arquivo:** `backend/src/services/characterService.ts`

**Implementar:**
- ✅ `getCharacters(filters)` - Buscar personagens com filtros (campanha, usuário)
- ✅ `createCharacter(userId, data)` - Criar personagem completo
- ✅ `getCharacterById(id)` - Buscar ficha completa com relacionamentos
- ✅ `updateCharacter(id, data)` - Atualizar personagem
- ✅ `deleteCharacter(id)` - Deletar personagem
- ✅ `getCharacterInventory(id)` - Buscar inventário do personagem
- ✅ `addItemToCharacter(characterId, itemId, quantity)` - Adicionar item
- ✅ `removeItemFromCharacter(characterId, itemId)` - Remover item
- ✅ `equipItem(characterId, itemId)` - Equipar item
- ✅ `getCharacterAbilities(id)` - Buscar habilidades do personagem
- ✅ `addAbilityToCharacter(characterId, abilityId)` - Adicionar habilidade

**Queries Supabase necessárias:**
- JOIN com `campaigns`, `users`
- JOIN com `character_items` e `items`
- JOIN com `character_abilities` e `abilities`
- Filtros por `campaign_id`, `user_id`
- Validações de permissão (usuário pode editar apenas seus personagens)

#### 2. Creature Service Completo
**Arquivo:** `backend/src/services/creatureService.ts`

**Implementar:**
- ✅ `getCreatures(filters)` - Buscar criaturas (global + da campanha)
- ✅ `createCreature(data)` - Criar criatura/NPC
- ✅ `getCreatureById(id)` - Buscar criatura completa
- ✅ `updateCreature(id, data)` - Atualizar criatura
- ✅ `deleteCreature(id)` - Deletar criatura
- ✅ `getCampaignCreatures(campaignId)` - Listar criaturas da campanha

**Queries Supabase necessárias:**
- Filtros por `campaign_id` e `is_global`
- Validações de permissão (mestre pode criar/editar)

#### 3. Item Service (NOVO)
**Arquivo:** `backend/src/services/itemService.ts` (criar)

**Implementar:**
- ✅ `getItems(filters)` - Buscar itens (global + da campanha)
- ✅ `createItem(data)` - Criar item
- ✅ `getItemById(id)` - Buscar item completo
- ✅ `updateItem(id, data)` - Atualizar item
- ✅ `deleteItem(id)` - Deletar item
- ✅ `getCampaignItems(campaignId)` - Listar itens da campanha
- ✅ `distributeItem(campaignId, characterId, itemId, quantity)` - Distribuir item

**Queries Supabase necessárias:**
- Filtros por `campaign_id` e `is_global`
- Validações de permissão

#### 4. Ability Service (NOVO)
**Arquivo:** `backend/src/services/abilityService.ts` (criar)

**Implementar:**
- ✅ `getAbilities(filters)` - Buscar habilidades (global + da campanha)
- ✅ `createAbility(data)` - Criar habilidade
- ✅ `getAbilityById(id)` - Buscar habilidade completa
- ✅ `updateAbility(id, data)` - Atualizar habilidade
- ✅ `deleteAbility(id)` - Deletar habilidade
- ✅ `getCampaignAbilities(campaignId)` - Listar habilidades da campanha
- ✅ `assignAbilityToCharacter(characterId, abilityId)` - Atribuir habilidade

**Queries Supabase necessárias:**
- Filtros por `campaign_id` e `is_global`
- Validações de permissão

#### 5. Moment Service Completo
**Arquivo:** `backend/src/services/momentService.ts`

**Implementar:**
- ✅ `getCampaignMoments(campaignId)` - Buscar momentos ordenados por data
- ✅ `createMoment(data)` - Criar momento (stories)
- ✅ `getMomentById(id)` - Buscar momento completo
- ✅ `updateMoment(id, data)` - Atualizar momento
- ✅ `deleteMoment(id)` - Deletar momento
- ✅ `getSessionMoments(sessionId)` - Buscar momentos de uma sessão

**Queries Supabase necessárias:**
- JOIN com `sessions`, `users`, `dice_rolls`
- Ordenação por `created_at DESC`
- Filtros por `campaign_id`, `session_id`

#### 6. Atualizar Rotas do Backend
**Arquivos:** `backend/src/routes/characters.ts`, `creatures.ts`, `items.ts`, `abilities.ts`, `moments.ts`

**Implementar:**
- Rotas GET, POST, PUT, DELETE para cada serviço
- Validação de dados de entrada
- Tratamento de erros
- Middleware de autenticação

---

### **FASE 2.7 - Ficha de Personagem Completa (PRIORIDADE ALTA)**

A ficha de personagem é essencial para os jogadores gerenciarem seus personagens.

#### 1. Character Sheet Page
**Arquivo:** `frontend/src/pages/Character/CharacterSheet.tsx` (criar)

**Layout:**
- Header: Logo + "Ficha de Personagem" + botão "Voltar" roxo
- 2 colunas (esquerda/direita)
- Seções colapsáveis (Accordion)

**Funcionalidades:**
- Buscar dados do personagem via API
- Salvar alterações automaticamente (debounce)
- Validação de campos
- Loading states

#### 2. Vitals Panel
**Arquivo:** `frontend/src/components/character/VitalsPanel.tsx` (criar)

**Elementos:**
- Retrato circular do personagem
- Barras: Vida (vermelho), Energia (verde)
- Checkboxes: "Lesão grave", "Inconsciente", "Morrendo"
- Barra EXP (roxo)
- Campos: Movimento, Corpo, Tamanho, Dano Extra

#### 3. Attributes Grid
**Arquivo:** `frontend/src/components/character/AttributesGrid.tsx` (criar)

**Funcionalidades:**
- Grid de 8 hexágonos vermelhos (estilo d20)
- Atributos: Aparência, Constituição, Destreza, Educação, Força, Inteligência, Sorte, Movimento
- Cada hexágono: ícone + label + campo de valor
- SVG para hexágono ou CSS clip-path

#### 4. Personal Data
**Arquivo:** `frontend/src/components/character/PersonalData.tsx` (criar)

**Campos:**
- Nome, Jogador, Classe, Ocupação
- Sexo, Idade, Altura, Peso
- Loc. Origem, Loc. Atual

**Componente:** Usar Accordion do shadcn/ui

#### 5. Inventory Panel
**Arquivo:** `frontend/src/components/character/InventoryPanel.tsx` (criar)

**Funcionalidades:**
- Peso Total: `X/XX`
- Coin: `1300 C`
- Lista de itens com nome, valor (peso), ícone lixeira
- Botão para adicionar item
- Modal para adicionar item (selecionar da biblioteca)

#### 6. Combat Table
**Arquivo:** `frontend/src/components/character/CombatTable.tsx` (criar)

**Funcionalidades:**
- Tabela com colunas: Nome, Tipo, Dano, Mun. Atual, Mun. Máxima, Alcance, Defeito
- Botão para adicionar arma
- Ícone lixeira para remover

#### 7. Skills Grid
**Arquivo:** `frontend/src/components/character/SkillsGrid.tsx` (criar)

**Funcionalidades:**
- Similar ao AttributesGrid
- Grid de perícias com hexágonos
- Valores editáveis

#### 8. Seções Colapsáveis Adicionais
**Componentes:**
- `HabilitiesRecipes.tsx` - Habilidades/Receitas
- `ImportantPeople.tsx` - Pessoas Importantes
- `ImportantItems.tsx` - Itens Importantes
- `Diseases.tsx` - Doenças
- `CharacterPresentation.tsx` - Apresentação do Personagem (textarea)

#### 9. Rota no Frontend
**Arquivo:** `frontend/src/App.tsx`

**Adicionar:**
```typescript
<Route
  path="/character/:id"
  element={
    <ProtectedRoute>
      <CharacterSheet />
    </ProtectedRoute>
  }
/>
```

---

### **FASE 2.8 - Integração Supabase Realtime (PRIORIDADE ALTA)**

O Realtime é essencial para a experiência de jogo em tempo real.

#### 1. Realtime Hook
**Arquivo:** `frontend/src/hooks/useRealtime.ts` (criar)

**Funcionalidades:**
- `useRealtimeChat(sessionId)` - Hook para chat em tempo real
- `useRealtimeRolls(sessionId)` - Hook para rolagens em tempo real
- `useRealtimeSession(sessionId)` - Hook para atualizações de sessão
- `useRealtimeCharacters(campaignId)` - Hook para atualizações de personagens

**Implementação:**
```typescript
export function useRealtimeChat(sessionId: string) {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])
  
  return { messages }
}
```

#### 2. Atualizar ChatPanel
**Arquivo:** `frontend/src/components/session/ChatPanel.tsx`

**Implementar:**
- Usar `useRealtimeChat` hook
- Atualizar mensagens em tempo real
- Enviar mensagens via API
- Indicador de digitação (opcional)

#### 3. Atualizar DiceRoller
**Arquivo:** `frontend/src/components/session/DiceRoller.tsx`

**Implementar:**
- Usar `useRealtimeRolls` hook
- Exibir rolagens em tempo real
- Animações de rolagem

#### 4. Atualizar PlayerListSidebar
**Arquivo:** `frontend/src/components/session/PlayerListSidebar.tsx`

**Implementar:**
- Usar `useRealtimeCharacters` hook
- Atualizar stats em tempo real
- Indicador de status online/offline

#### 5. Atualizar SessionRoom
**Arquivo:** `frontend/src/pages/GameSession/SessionRoom.tsx`

**Implementar:**
- Integrar todos os hooks Realtime
- Gerenciar subscriptions
- Cleanup ao desmontar

---

### **FASE 2.9 - Painel do Mestre (PRIORIDADE MÉDIA)**

O painel do mestre permite controle total sobre a sessão.

#### 1. Master Dashboard Page
**Arquivo:** `frontend/src/pages/Master/Dashboard.tsx` (criar)

**Layout 3 colunas:**
- Coluna 1 (Dashboard): Roll History + Master Info
- Coluna 2 (Criaturas/NPCs): Cards de criaturas + Tabs
- Coluna 3 (Jogadores): Lista vertical de players

**Funcionalidades:**
- Verificar se usuário é mestre
- Buscar dados da sessão ativa
- Integração com todos os componentes

#### 2. Roll History
**Arquivo:** `frontend/src/components/master/RollHistory.tsx` (criar)

**Funcionalidades:**
- Cards hexagonais brancos/cinza
- Cada card mostra: número (resultado), "Jogador (Personagem)" abaixo
- Scroll vertical
- Ordenado por mais recente
- Integração com `useRealtimeRolls`

#### 3. Creatures Panel
**Arquivo:** `frontend/src/components/master/CreaturesPanel.tsx` (criar)

**Funcionalidades:**
- Header: Título "Criaturas" + Dropdown "+ Novo" / "Lista Completa"
- Grid de cards de criaturas
- Cada card: Nome, "Char" placeholder, Barras (Vida, EXP, Energia, Saúde)
- Clique para editar/detalhar
- Integração com API de criaturas

#### 4. NPCs Panel (Mesma área, via Tabs)
**Tabs roxas:**
- Equipamentos
- Itens
- Habilidades
- Magias

**Cada tab mostra:**
- Lista de itens/habilidades relacionadas
- Botão "+ Novo"
- Cards clicáveis para editar

#### 5. Players Panel
**Arquivo:** `frontend/src/components/master/PlayersPanel.tsx` (criar)

**Funcionalidades:**
- Lista vertical de cards "Player Name"
- Cada card tem mesmo padrão de barras das criaturas
- Mestre pode editar stats diretamente
- Botão para abrir ficha
- Integração com Realtime

#### 6. Rota no Frontend
**Arquivo:** `frontend/src/App.tsx`

**Adicionar:**
```typescript
<Route
  path="/master/:campaignId"
  element={
    <ProtectedRoute>
      <MasterDashboard />
    </ProtectedRoute>
  }
/>
```

---

### **FASE 2.10 - Melhorias e Polimento (PRIORIDADE BAIXA)**

#### 1. Validações Frontend
- Formulários com react-hook-form + zod
- Mensagens de erro amigáveis
- Loading states em todos os componentes
- Validação de campos obrigatórios

#### 2. Error Handling
- Toast notifications para erros (usar shadcn/ui toast)
- Fallbacks para dados não encontrados
- Retry logic para requisições falhas
- Error boundaries no React

#### 3. Performance
- Lazy loading de componentes pesados
- Paginação em listas grandes
- Debounce em buscas
- Memoização de componentes pesados

#### 4. Responsividade
- Mobile-first adjustments
- Breakpoints para tablet/desktop
- Sidebar colapsável em mobile
- Menu hambúrguer no mobile

#### 5. Modal de Equipamentos
**Arquivo:** `frontend/src/components/items/EquipmentModal.tsx` (criar)

**Funcionalidades:**
- Modal roxo escuro grande
- Header: Título "Equipamentos" + Barra de busca + Botão "+ Novo"
- Lista 2 colunas de cards cinza
- Cada card: Título, Chevron para expandir
- Expandido mostra: Nome, Raridade, Descrição, Ícone lixeira

---

## 📋 Checklist de Implementação

### Fase 2.6 - Backend Completo
- [ ] Character Service completo
- [ ] Creature Service completo
- [ ] Item Service (criar e implementar)
- [ ] Ability Service (criar e implementar)
- [ ] Moment Service completo
- [ ] Atualizar rotas do backend
- [ ] Testar todas as rotas

### Fase 2.7 - Ficha de Personagem
- [ ] CharacterSheet page
- [ ] VitalsPanel component
- [ ] AttributesGrid component
- [ ] PersonalData component
- [ ] InventoryPanel component
- [ ] CombatTable component
- [ ] SkillsGrid component
- [ ] Seções colapsáveis adicionais
- [ ] Rota no frontend
- [ ] Integração com API

### Fase 2.8 - Realtime
- [ ] useRealtime hook
- [ ] useRealtimeChat hook
- [ ] useRealtimeRolls hook
- [ ] useRealtimeSession hook
- [ ] useRealtimeCharacters hook
- [ ] Atualizar ChatPanel
- [ ] Atualizar DiceRoller
- [ ] Atualizar PlayerListSidebar
- [ ] Atualizar SessionRoom

### Fase 2.9 - Painel do Mestre
- [ ] Master Dashboard page
- [ ] RollHistory component
- [ ] CreaturesPanel component
- [ ] NPCs Panel com Tabs
- [ ] PlayersPanel component
- [ ] Rota no frontend
- [ ] Integração com API

### Fase 2.10 - Polimento
- [ ] Validações frontend
- [ ] Error handling
- [ ] Performance optimizations
- [ ] Responsividade
- [ ] EquipmentModal component

---

## 🎯 Ordem Recomendada de Implementação

1. **Fase 2.6** - Completar Backend (CRÍTICO - sem isso, frontend não funciona)
2. **Fase 2.7** - Ficha de Personagem (ALTA - funcionalidade essencial)
3. **Fase 2.8** - Realtime (ALTA - experiência de jogo)
4. **Fase 2.9** - Painel do Mestre (MÉDIA - controle do mestre)
5. **Fase 2.10** - Polimento (BAIXA - melhorias)

---

## 📝 Notas Importantes

### Antes de Começar

1. **Configurar Supabase Storage:**
   - Criar bucket `campaign-images` no Supabase
   - Configurar políticas de acesso

2. **Configurar Realtime:**
   - Habilitar Realtime nas tabelas: `chat_messages`, `dice_rolls`, `sessions`, `characters`
   - Configurar políticas de publicação

3. **Variáveis de Ambiente:**
   - Verificar se todas as variáveis estão configuradas
   - Criar arquivo `.env.example` para documentação

### Durante a Implementação

1. **Testar cada serviço individualmente** antes de integrar no frontend
2. **Comentar todas as funções** conforme regra do projeto
3. **Fazer commits frequentes** após cada funcionalidade
4. **Validar dados** em todas as rotas
5. **Tratar erros** adequadamente

### Após Implementação

1. **Testar fluxo completo** de criação de campanha até sessão de jogo
2. **Verificar performance** com múltiplos usuários
3. **Documentar APIs** (opcional: Swagger/OpenAPI)
4. **Adicionar testes** (futuro)

---

**Data de Criação:** Dezembro 2024
**Última Atualização:** Dezembro 2024


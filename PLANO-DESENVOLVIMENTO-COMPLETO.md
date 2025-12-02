# Plano de Desenvolvimento Completo - Let's Roll com Sistema Ordem Paranormal

## 📋 Visão Geral

Este documento detalha o plano completo de desenvolvimento do projeto Let's Roll, integrando as regras do sistema Ordem Paranormal RPG com todas as funcionalidades visuais identificadas nas telas do projeto.

---

## 🎯 Fase 3 - Sistema Ordem Paranormal (PRIORIDADE ALTA)

### 3.1. Atualização do Schema do Banco de Dados

**Arquivo:** `supabase/migrations/20241203000000_add_ordem_paranormal_fields.sql` (já criado)

**Status:** ✅ Migration criada, precisa ser executada

**Campos Adicionados:**
- `class`: TEXT (COMBATENTE, ESPECIALISTA, OCULTISTA)
- `path`: TEXT (trilha do personagem)
- `affinity`: TEXT (SANGUE, MORTE, ENERGIA, CONHECIMENTO, MEDO)
- `conditions`: TEXT[] (array de condições ativas)
- `defense`: INTEGER (defesa calculada)
- `skills`: JSONB (perícias do personagem)

**Estrutura JSONB Atualizada:**
- `attributes`: { agi, for, int, pre, vig }
- `stats`: { pv: {current, max}, san: {current, max}, pe: {current, max}, nex }

### 3.2. Serviços de Cálculo do Sistema

**Arquivo:** `backend/src/services/ordemParanormalService.ts` (já criado)

**Status:** ✅ Implementado

**Funcionalidades:**
- ✅ `calculateMaxPV()` - Calcula PV baseado em classe, VIG e NEX
- ✅ `calculateMaxSAN()` - Calcula SAN baseado em classe e NEX
- ✅ `calculateMaxPE()` - Calcula PE baseado em classe, PRE e NEX
- ✅ `calculateDefense()` - Calcula defesa (10 + AGI + bônus)
- ✅ `calculateSkillBonus()` - Calcula bônus de perícia
- ✅ `rollAttributeTest()` - Rolagem de teste de atributo
- ✅ `rollAttack()` - Rolagem de ataque
- ✅ `calculateDamage()` - Cálculo de dano

**Pendências:**
- [ ] Adicionar método `calculateNEXLevel()` - Converte NEX % para nível
- [ ] Adicionar método `calculateRecoveryPE()` - Recuperação de PE por descanso
- [ ] Adicionar método `applyCondition()` - Aplicar condições com efeitos
- [ ] Adicionar método `calculateConditionPenalties()` - Calcular penalidades de condições

### 3.3. Integração no Character Service

**Arquivo:** `backend/src/services/characterService.ts`

**Status:** ⚠️ Parcialmente implementado

**Pendências:**
- [ ] Método `updateAttributes()` - Atualizar atributos e recalcular recursos
- [ ] Método `updateSkills()` - Atualizar perícias
- [ ] Método `applyCondition()` - Aplicar condição ao personagem
- [ ] Método `removeCondition()` - Remover condição
- [ ] Método `updateNEX()` - Atualizar NEX e recalcular recursos
- [ ] Método `updatePV()` - Atualizar PV com validações (machucado, morrendo)
- [ ] Método `updateSAN()` - Atualizar SAN com validações (perturbado, enlouquecido)
- [ ] Método `updatePE()` - Atualizar PE
- [ ] Método `rollSkillTest()` - Rolar teste de perícia
- [ ] Método `rollAttack()` - Rolar ataque
- [ ] Método `applyDamage()` - Aplicar dano (físico ou mental)

### 3.4. Rotas de Sistema Ordem Paranormal

**Arquivo:** `backend/src/routes/characters.ts`

**Novas Rotas Necessárias:**
- [ ] `POST /api/characters/:id/roll-skill` - Rolar teste de perícia
- [ ] `POST /api/characters/:id/roll-attack` - Rolar ataque
- [ ] `POST /api/characters/:id/apply-damage` - Aplicar dano
- [ ] `POST /api/characters/:id/apply-condition` - Aplicar condição
- [ ] `DELETE /api/characters/:id/conditions/:condition` - Remover condição
- [ ] `PUT /api/characters/:id/attributes` - Atualizar atributos
- [ ] `PUT /api/characters/:id/skills` - Atualizar perícias
- [ ] `PUT /api/characters/:id/nex` - Atualizar NEX
- [ ] `PUT /api/characters/:id/pv` - Atualizar PV
- [ ] `PUT /api/characters/:id/san` - Atualizar SAN
- [ ] `PUT /api/characters/:id/pe` - Atualizar PE
- [ ] `POST /api/characters/:id/recover-pe` - Recuperar PE (descanso)

---

## 🎨 Fase 4 - Frontend: Ficha de Personagem Completa (PRIORIDADE ALTA)

### 4.1. Character Sheet Page

**Arquivo:** `frontend/src/pages/Character/CharacterSheet.tsx` (criar)

**Layout Baseado na Tela:**
- Header: Logo + "Ficha de Personagem" + notificações + perfil + botão "Voltar" roxo
- 2 colunas (esquerda/direita)
- Seções colapsáveis (Accordion)

**Funcionalidades:**
- Buscar dados do personagem via API
- Salvar alterações automaticamente (debounce)
- Validação de campos
- Loading states
- Cálculos automáticos de recursos (PV, SAN, PE, Defesa)

### 4.2. Vitals Panel (Coluna Esquerda - Topo)

**Arquivo:** `frontend/src/components/character/VitalsPanel.tsx` (criar)

**Elementos (conforme tela):**
- Retrato circular do personagem (avatar)
- **Vida (PV)**: Barra vermelha `current/max` (ex: 20/20)
- Checkboxes: "Lesão grave", "Inconsciente", "Morrendo"
- **Energia (PE)**: Barra verde `current/max` (ex: 20/20)
- **EXP**: Barra roxa com percentual (ex: 10%)
- Campos menores: Movimento, Corpo, Tamanho, Dano Extra

**Funcionalidades:**
- Atualização em tempo real
- Validação de valores (não pode exceder máximo)
- Cálculo automático de estado (Machucado se ≤ 50% PV)
- Aplicação automática de condições baseado em PV/SAN

### 4.3. Attributes Grid (Coluna Esquerda)

**Arquivo:** `frontend/src/components/character/AttributesGrid.tsx` (criar)

**Elementos (conforme tela):**
- Grid de 8 hexágonos vermelhos (estilo d20)
- Atributos do sistema Ordem Paranormal:
  - Agilidade (AGI)
  - Força (FOR)
  - Intelecto (INT)
  - Presença (PRE)
  - Vigor (VIG)
  - (3 atributos adicionais podem ser customizados ou removidos)

**Funcionalidades:**
- Edição de valores de atributos
- Validação de limites (-1 a +20)
- Recalcular recursos automaticamente ao alterar VIG ou PRE
- Recalcular defesa automaticamente ao alterar AGI
- Indicador visual de vantagem/desvantagem nos dados

**Design:**
- Hexágonos vermelhos com ícone d20 no centro
- Campo de input abaixo de cada hexágono
- Tooltip explicando efeito do atributo nos dados

### 4.4. Personal Data (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/PersonalData.tsx` (criar)

**Campos (conforme tela):**
- Nome
- Jogador
- Classe (dropdown: Combatente, Especialista, Ocultista)
- Ocupação
- Sexo
- Idade
- Altura
- Peso
- Loc. Origem
- Loc. Atual

**Componente:** Usar Accordion do shadcn/ui

**Funcionalidades:**
- Auto-save (debounce)
- Validação de campos obrigatórios
- Dropdown de classe com recálculo automático de recursos

### 4.5. Inventory Panel (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/InventoryPanel.tsx` (criar)

**Elementos (conforme tela):**
- **Peso Total**: `X/XX` (calculado automaticamente)
- **Coin**: `1300 C` (moeda do jogo)
- Lista de itens:
  - Cada item: nome, valor (peso), ícone lixeira
  - Botão para adicionar item
- Modal para adicionar item (selecionar da biblioteca)

**Funcionalidades:**
- Cálculo automático de peso total
- Validação de capacidade
- Integração com API de itens
- Drag and drop para reorganizar (opcional)

### 4.6. Biography (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/Biography.tsx` (criar)

**Funcionalidades:**
- Textarea grande para biografia
- Auto-save (debounce)
- Contador de caracteres (opcional)

### 4.7. Combat Table (Coluna Direita - Topo)

**Arquivo:** `frontend/src/components/character/CombatTable.tsx` (criar)

**Tabela (conforme tela):**
- Colunas: Nome, Tipo, Dano, Mun. Atual, Mun. Máxima, Alcance, Defeito
- Botão para adicionar arma
- Ícone lixeira para remover

**Funcionalidades:**
- Adicionar/editar/remover armas
- Cálculo automático de dano com atributo (FOR para corpo-a-corpo)
- Validação de fórmulas de dano (ex: "1d8", "2d6")
- Integração com sistema de rolagem

### 4.8. Skills Grid (Coluna Direita)

**Arquivo:** `frontend/src/components/character/SkillsGrid.tsx` (criar)

**Elementos (conforme tela):**
- Grid de perícias com hexágonos (similar ao AttributesGrid)
- Perícias do sistema Ordem Paranormal:
  - Todas as 30+ perícias listadas no sistema
- Cada perícia mostra:
  - Nome
  - Atributo base (AGI, FOR, INT, PRE, VIG)
  - Nível de treinamento (Destreinado, Treinado, Competente, Expert)
  - Bônus calculado automaticamente

**Funcionalidades:**
- Edição de nível de treinamento
- Cálculo automático de bônus
- Validação de perícias "somente treinadas"
- Indicador visual de perícias que requerem treinamento
- Filtro por atributo base
- Busca de perícias

### 4.9. Seções Colapsáveis Adicionais (Coluna Direita)

**Componentes:**
- [ ] `HabilitiesRecipes.tsx` - Habilidades/Receitas
- [ ] `ImportantPeople.tsx` - Pessoas Importantes
- [ ] `ImportantItems.tsx` - Itens Importantes
- [ ] `Diseases.tsx` - Doenças
- [ ] `CharacterPresentation.tsx` - Apresentação do Personagem (textarea)

**Funcionalidades:**
- Todas com auto-save
- Validação de dados
- Integração com API

### 4.10. Rota no Frontend

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

## 🎮 Fase 5 - Sala de Sessão Completa (PRIORIDADE ALTA)

### 5.1. Session Room Page

**Arquivo:** `frontend/src/pages/GameSession/SessionRoom.tsx` (estrutura básica existe)

**Layout (conforme tela):**
- Header: Logo + título campanha + notificações + perfil
- Área principal: GameBoard (esquerda, 70%)
- Sidebar: PlayerListSidebar (direita, 30%)
- Chat panel (overlay ou aba)
- DiceRoller (flutuante ou integrado)

**Funcionalidades:**
- Buscar sessão ativa da campanha
- Criar sessão se não existir (mestre)
- Integração com Supabase Realtime
- Gerenciamento de estado da sessão

### 5.2. Game Board

**Arquivo:** `frontend/src/components/session/GameBoard.tsx` (estrutura básica existe)

**Funcionalidades Atuais:**
- ✅ Área grande cinza com placeholder "Cenário do RPG"

**Melhorias Necessárias:**
- [ ] Upload de mapas/imagens
- [ ] Zoom in/out
- [ ] Drag para mover
- [ ] Ferramentas de desenho (linhas, formas)
- [ ] Tokens de personagens/criaturas
- [ ] Grid opcional
- [ ] Medição de distância
- [ ] Camadas (background, tokens, annotations)

### 5.3. Player List Sidebar

**Arquivo:** `frontend/src/components/session/PlayerListSidebar.tsx` (estrutura básica existe)

**Layout (conforme tela):**
- Botão "Abrir Gerenciador" roxo (topo, só mestre)
- Grid 2x3 de cards de jogadores

**Card de Jogador (conforme tela):**
- Parte superior: Avatar do jogador (persona com fones)
- Parte inferior sobreposta: Avatar do personagem (anime style)
- Nome do personagem (ex: "Ryu")
- Stats:
  - `19/20` (vermelho - Vida/PV)
  - `21/25` (azul - outro recurso, possivelmente PE)
- Indicador de voz ativa (ícones microfone/fone)

**Funcionalidades:**
- [ ] Atualização em tempo real via Supabase Realtime
- [ ] Clique para ver ficha rápida
- [ ] Mestre pode editar stats diretamente
- [ ] Indicador de status online/offline
- [ ] Controles de áudio (mute/unmute)

### 5.4. Dice Roller

**Arquivo:** `frontend/src/components/session/DiceRoller.tsx` (estrutura básica existe)

**Funcionalidades (conforme sistema Ordem Paranormal):**
- [ ] Botões rápidos: d4, d6, d8, d10, d12, d20, d100
- [ ] Campo para fórmula customizada (ex: "2d6+3")
- [ ] **Rolagem de Atributo**: Selecionar atributo (AGI, FOR, etc.) e perícia
  - Calcula automaticamente número de dados baseado no atributo
  - Aplica bônus de perícia
  - Mostra vantagem/desvantagem visualmente
- [ ] **Rolagem de Ataque**: Selecionar arma, calcular dano
- [ ] Checkbox "Rolagem Privada"
- [ ] Botão "Rolar"
- [ ] Exibe resultado com animação
- [ ] Envia para chat/histórico automaticamente
- [ ] Histórico de rolagens recentes

**Integração:**
- Chama API `/api/dice/roll` ou `/api/characters/:id/roll-skill`
- Recebe resultado e publica via Realtime
- Atualiza histórico em tempo real

### 5.5. Chat Panel

**Arquivo:** `frontend/src/components/session/ChatPanel.tsx` (estrutura básica existe)

**Funcionalidades (conforme tela):**
- [ ] Lista de mensagens com scroll
- [ ] Campo de input
- [ ] Botão enviar
- [ ] Integração com Supabase Realtime
- [ ] Tipos de mensagem:
  - Mensagem normal
  - Narração (mestre)
  - OOC (out of character)
  - Rolagem de dados (automática)
- [ ] Canais (futuro):
  - Geral
  - Roleplay
  - Off-topic
  - Mestre (privado)

**Melhorias:**
- [ ] Emojis/reactions
- [ ] Formatação de texto (negrito, itálico)
- [ ] Menções (@player)
- [ ] Busca no histórico

---

## 🎯 Fase 6 - Painel do Mestre Completo (PRIORIDADE MÉDIA)

### 6.1. Master Dashboard Page

**Arquivo:** `frontend/src/pages/Master/Dashboard.tsx` (criar)

**Layout (conforme tela - 3 colunas):**
- Coluna 1 (Dashboard): Roll History + Master Info
- Coluna 2 (Criaturas/NPCs): Cards de criaturas + Tabs
- Coluna 3 (Jogadores): Lista vertical de players

**Funcionalidades:**
- Verificar se usuário é mestre
- Buscar dados da sessão ativa
- Integração com todos os componentes
- Atualização em tempo real

### 6.2. Roll History

**Arquivo:** `frontend/src/components/master/RollHistory.tsx` (criar)

**Layout (conforme tela):**
- Cards hexagonais brancos/cinza
- Cada card mostra:
  - Número (resultado da rolagem) grande
  - "Jogador (Personagem)" abaixo
  - Fórmula rolada (ex: "3d20+5")
- Scroll vertical
- Ordenado por mais recente

**Funcionalidades:**
- [ ] Integração com `useRealtimeRolls`
- [ ] Filtro por jogador
- [ ] Filtro por tipo (ataque, perícia, dano)
- [ ] Clique para ver detalhes

### 6.3. Creatures Panel

**Arquivo:** `frontend/src/components/master/CreaturesPanel.tsx` (criar)

**Layout (conforme tela):**
- Header: Título "Criaturas" + Dropdown "+ Novo" / "Lista Completa"
- Grid de cards de criaturas

**Card de Criatura (conforme tela):**
- Nome
- "Char" placeholder (avatar)
- Barras:
  - Vida (vermelho): `5/1` `30%`
  - EXP (cinza): `30%`
  - Energia (verde): `10/20`
  - Saúde (amarelo): `10/20`

**Funcionalidades:**
- [ ] Clique para editar/detalhar
- [ ] Criar nova criatura
- [ ] Editar stats diretamente
- [ ] Aplicar condições
- [ ] Integração com API de criaturas

### 6.4. NPCs Panel (Mesma área, via Tabs)

**Tabs roxas (conforme tela):**
- Equipamentos
- Itens
- Habilidades
- Magias

**Cada tab mostra:**
- Lista de itens/habilidades relacionadas
- Botão "+ Novo"
- Cards clicáveis para editar

**Funcionalidades:**
- [ ] CRUD completo de itens/habilidades
- [ ] Busca e filtros
- [ ] Distribuição para personagens

### 6.5. Players Panel

**Arquivo:** `frontend/src/components/master/PlayersPanel.tsx` (criar)

**Layout (conforme tela):**
- Lista vertical de cards "Player Name"
- Cada card tem mesmo padrão de barras das criaturas

**Funcionalidades:**
- [ ] Mestre pode editar stats diretamente
- [ ] Botão para abrir ficha
- [ ] Aplicar condições
- [ ] Aplicar dano/cura
- [ ] Integração com Realtime

### 6.6. Rota no Frontend

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

## 🎨 Fase 7 - Detalhes da Campanha Completa (PRIORIDADE MÉDIA)

### 7.1. Campaign Detail Page

**Arquivo:** `frontend/src/pages/Campaign/CampaignDetail.tsx` (estrutura básica existe)

**Layout (conforme tela):**
- Breadcrumbs: "Hem > Nome do RPG"
- Header: Logo + título da campanha centralizado
- Seção principal:
  - Imagem da campanha (esquerda)
  - Descrição (direita)
  - Botão "Entrar na Sessão" roxo
- Seção "Ações":
  - Botão "Convidar Jogadores" roxo
- Seção "Status":
  - Grid de cards de personagens
- Sidebar direita:
  - Lista de jogadores com status

**Melhorias Necessárias:**
- [ ] Integração completa com API
- [ ] Listar personagens da campanha
- [ ] Listar participantes
- [ ] Sistema de convites funcional
- [ ] Edição de campanha (mestre)
- [ ] Upload/troca de imagem

### 7.2. Character Status Card

**Arquivo:** `frontend/src/components/character/CharacterStatusCard.tsx` (estrutura básica existe)

**Layout (conforme tela):**
- Card cinza escuro
- Placeholder "Char" (avatar)
- Nome do personagem
- 4 barras de progresso:
  - Vida (vermelho): `10/20`
  - XP (roxo): `30%`
  - Energia (verde): `20/20`
  - Saúde (amarelo): `15/20`
- Link para ficha completa

**Melhorias:**
- [ ] Usar dados reais do sistema Ordem Paranormal
- [ ] Mostrar PV, SAN, PE, NEX corretamente
- [ ] Indicador de condições ativas
- [ ] Clique para abrir ficha

### 7.3. Players Sidebar

**Arquivo:** `frontend/src/components/campaign/PlayersSidebar.tsx` (estrutura básica existe)

**Layout (conforme tela):**
- Lista vertical de jogadores
- Cada item mostra:
  - Avatar placeholder "Perfil"
  - Nome do jogador
  - Status: bolinha verde (Conectado) / vermelha (Desconectado)
  - Role destacado "(mestre)" se for mestre

**Melhorias:**
- [ ] Atualização em tempo real (futuro)
- [ ] Avatar real do usuário
- [ ] Ações rápidas (remover, promover)

### 7.4. Invite Players Component

**Arquivo:** `frontend/src/components/campaign/InvitePlayers.tsx` (estrutura básica existe)

**Funcionalidades:**
- [ ] Modal com formulário
- [ ] Campo de e-mail
- [ ] Botão "Enviar Convite"
- [ ] Integração com API
- [ ] Validação de e-mail
- [ ] Feedback de sucesso/erro

---

## 🔄 Fase 8 - Integração Supabase Realtime (PRIORIDADE ALTA)

### 8.1. Realtime Hook

**Arquivo:** `frontend/src/hooks/useRealtime.ts` (criar)

**Hooks Necessários:**
- [ ] `useRealtimeChat(sessionId)` - Hook para chat em tempo real
- [ ] `useRealtimeRolls(sessionId)` - Hook para rolagens em tempo real
- [ ] `useRealtimeSession(sessionId)` - Hook para atualizações de sessão
- [ ] `useRealtimeCharacters(campaignId)` - Hook para atualizações de personagens
- [ ] `useRealtimePlayers(campaignId)` - Hook para status de jogadores

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

### 8.2. Atualizar Componentes com Realtime

**Componentes a Atualizar:**
- [ ] `ChatPanel` - Usar `useRealtimeChat`
- [ ] `DiceRoller` - Usar `useRealtimeRolls`
- [ ] `PlayerListSidebar` - Usar `useRealtimePlayers`
- [ ] `SessionRoom` - Integrar todos os hooks
- [ ] `RollHistory` - Usar `useRealtimeRolls`
- [ ] `PlayersPanel` - Usar `useRealtimePlayers`

### 8.3. Configuração Supabase Realtime

**Necessário:**
- [ ] Habilitar Realtime nas tabelas:
  - `chat_messages`
  - `dice_rolls`
  - `sessions`
  - `characters`
  - `campaign_participants`
- [ ] Configurar políticas de publicação
- [ ] Testar subscriptions

---

## 🛠️ Fase 9 - Melhorias e Funcionalidades Avançadas

### 9.1. Sistema de Rolagem Avançado

**Arquivo:** `frontend/src/components/session/AdvancedDiceRoller.tsx` (criar)

**Funcionalidades:**
- [ ] Rolagem de Atributo com Perícia
  - Selecionar atributo (AGI, FOR, etc.)
  - Selecionar perícia
  - Calcular dados automaticamente
  - Aplicar bônus de treinamento
  - Mostrar vantagem/desvantagem
- [ ] Rolagem de Ataque
  - Selecionar arma
  - Calcular ataque (Luta/Pontaria + atributo)
  - Comparar com Defesa do alvo
  - Calcular dano se acertar
  - Detectar crítico (20 natural)
- [ ] Rolagem de Dano
  - Fórmula da arma
  - Adicionar atributo (FOR para corpo-a-corpo)
  - Multiplicador de crítico
- [ ] Histórico de Rolagens
  - Lista de últimas rolagens
  - Filtros
  - Exportar (opcional)

### 9.2. Sistema de Condições

**Arquivo:** `frontend/src/components/character/ConditionsPanel.tsx` (criar)

**Funcionalidades:**
- [ ] Lista de condições ativas
- [ ] Aplicar condição (dropdown com todas as condições)
- [ ] Remover condição
- [ ] Mostrar efeitos da condição
- [ ] Aplicar penalidades automaticamente
- [ ] Timer para condições temporárias (opcional)

### 9.3. Calculadora de Recursos

**Arquivo:** `frontend/src/hooks/useCharacterResources.ts` (criar)

**Funcionalidades:**
- [ ] Cálculo automático de PV máximo
- [ ] Cálculo automático de SAN máximo
- [ ] Cálculo automático de PE máximo
- [ ] Cálculo de Defesa
- [ ] Recalcular ao alterar atributos/classe/NEX
- [ ] Validação de valores (não exceder máximo)

### 9.4. Sistema de Rituais Paranormais

**Arquivo:** `frontend/src/components/character/RitualsPanel.tsx` (criar)

**Funcionalidades:**
- [ ] Lista de rituais conhecidos
- [ ] Adicionar/remover ritual
- [ ] Mostrar círculo do ritual
- [ ] Mostrar custo em PE
- [ ] Mostrar custo em SAN (se houver)
- [ ] Conjurar ritual (gastar PE/SAN)
- [ ] Rituais com Afinidade (50% NEX) - sem ingredientes

### 9.5. Sistema de Poderes Paranormais

**Arquivo:** `frontend/src/components/character/ParanormalPowersPanel.tsx` (criar)

**Funcionalidades:**
- [ ] Lista de poderes adquiridos
- [ ] Adquirir poder (gastar SAN máxima)
- [ ] Aprimorar poder (gastar SAN máxima novamente)
- [ ] Mostrar custo em SAN máxima
- [ ] Validação (requer Afinidade para aprimorar)

---

## 📱 Fase 10 - Responsividade e Mobile (PRIORIDADE BAIXA)

### 10.1. Ajustes Mobile

**Componentes a Ajustar:**
- [ ] Navbar - Menu hambúrguer em mobile
- [ ] Dashboard - Grid responsivo
- [ ] Character Sheet - Colunas empilhadas em mobile
- [ ] Session Room - Sidebar colapsável
- [ ] Master Dashboard - Layout adaptativo

### 10.2. Touch Interactions

**Funcionalidades:**
- [ ] Swipe para navegar
- [ ] Pinch to zoom no GameBoard
- [ ] Touch-friendly buttons
- [ ] Gestos para ações rápidas

---

## 🎨 Fase 11 - Polimento e UX (PRIORIDADE BAIXA)

### 11.1. Validações Frontend

**Implementar:**
- [ ] Formulários com react-hook-form + zod
- [ ] Mensagens de erro amigáveis
- [ ] Loading states em todos os componentes
- [ ] Validação de campos obrigatórios
- [ ] Validação de fórmulas de dados
- [ ] Validação de limites de atributos

### 11.2. Error Handling

**Implementar:**
- [ ] Toast notifications para erros (usar shadcn/ui toast)
- [ ] Fallbacks para dados não encontrados
- [ ] Retry logic para requisições falhas
- [ ] Error boundaries no React
- [ ] Mensagens de erro contextuais

### 11.3. Performance

**Otimizações:**
- [ ] Lazy loading de componentes pesados
- [ ] Paginação em listas grandes
- [ ] Debounce em buscas
- [ ] Memoização de componentes pesados
- [ ] Virtualização de listas longas
- [ ] Cache de dados frequentes

### 11.4. Animações

**Adicionar:**
- [ ] Animação de rolagem de dados
- [ ] Transições suaves entre páginas
- [ ] Feedback visual em ações
- [ ] Loading spinners
- [ ] Animações de progresso

---

## 📊 Fase 12 - Testes e Qualidade (PRIORIDADE BAIXA)

### 12.1. Testes Unitários

**Arquivos para Testar:**
- [ ] `ordemParanormalService` - Todos os cálculos
- [ ] `diceService` - Parser de fórmulas
- [ ] `characterService` - CRUD e cálculos
- [ ] Funções de rolagem

### 12.2. Testes de Integração

**Cenários:**
- [ ] Criação de personagem completa
- [ ] Atualização de atributos e recálculo
- [ ] Rolagem de dados e histórico
- [ ] Chat em tempo real
- [ ] Sessão de jogo completa

### 12.3. Validação de Regras

**Verificar:**
- [ ] Cálculos de recursos corretos
- [ ] Rolagens seguem regras do sistema
- [ ] Condições aplicam penalidades corretas
- [ ] Limites de atributos respeitados
- [ ] Perícias "somente treinadas" validadas

---

## 📋 Checklist de Implementação por Fase

### Fase 3 - Sistema Ordem Paranormal (Backend)
- [x] Migration criada
- [x] Tipos TypeScript criados
- [x] ordemParanormalService implementado
- [ ] Métodos adicionais no ordemParanormalService
- [ ] Integração completa no characterService
- [ ] Rotas de sistema adicionadas
- [ ] Testes de cálculos

### Fase 4 - Ficha de Personagem (Frontend)
- [ ] CharacterSheet page
- [ ] VitalsPanel component
- [ ] AttributesGrid component (sistema Ordem Paranormal)
- [ ] PersonalData component
- [ ] InventoryPanel component
- [ ] Biography component
- [ ] CombatTable component
- [ ] SkillsGrid component (todas as perícias)
- [ ] Seções colapsáveis adicionais
- [ ] Rota no frontend
- [ ] Integração com API
- [ ] Cálculos automáticos

### Fase 5 - Sala de Sessão (Frontend)
- [x] SessionRoom page (estrutura)
- [x] GameBoard component (estrutura)
- [x] PlayerListSidebar component (estrutura)
- [x] DiceRoller component (estrutura)
- [x] ChatPanel component (estrutura)
- [ ] Melhorias no GameBoard (mapas, zoom, tokens)
- [ ] DiceRoller com sistema Ordem Paranormal
- [ ] Integração Realtime completa
- [ ] Controles de áudio

### Fase 6 - Painel do Mestre (Frontend)
- [ ] Master Dashboard page
- [ ] RollHistory component
- [ ] CreaturesPanel component
- [ ] NPCs Panel com Tabs
- [ ] PlayersPanel component
- [ ] Rota no frontend
- [ ] Integração com API
- [ ] Controles de mestre

### Fase 7 - Detalhes da Campanha (Frontend)
- [x] CampaignDetail page (estrutura)
- [x] CharacterStatusCard component (estrutura)
- [x] PlayersSidebar component (estrutura)
- [x] InvitePlayers component (estrutura)
- [ ] Integração completa com API
- [ ] Sistema de convites funcional
- [ ] Edição de campanha

### Fase 8 - Realtime
- [ ] useRealtime hook
- [ ] useRealtimeChat hook
- [ ] useRealtimeRolls hook
- [ ] useRealtimeSession hook
- [ ] useRealtimeCharacters hook
- [ ] useRealtimePlayers hook
- [ ] Atualizar todos os componentes
- [ ] Configurar Supabase Realtime

### Fase 9 - Funcionalidades Avançadas
- [ ] AdvancedDiceRoller
- [ ] ConditionsPanel
- [ ] useCharacterResources hook
- [ ] RitualsPanel
- [ ] ParanormalPowersPanel

### Fase 10 - Responsividade
- [ ] Ajustes mobile
- [ ] Touch interactions
- [ ] Layout adaptativo

### Fase 11 - Polimento
- [ ] Validações frontend
- [ ] Error handling
- [ ] Performance optimizations
- [ ] Animações

### Fase 12 - Testes
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Validação de regras

---

## 🎯 Ordem Recomendada de Implementação

### Sprint 1 - Base do Sistema Ordem Paranormal
1. Executar migration do banco
2. Completar ordemParanormalService
3. Integrar cálculos no characterService
4. Criar rotas de sistema
5. Testar cálculos

### Sprint 2 - Ficha de Personagem Básica
1. CharacterSheet page
2. VitalsPanel (PV, SAN, PE, NEX)
3. AttributesGrid (5 atributos)
4. PersonalData
5. Integração com API

### Sprint 3 - Ficha de Personagem Completa
1. SkillsGrid (todas as perícias)
2. CombatTable
3. InventoryPanel
4. Biography
5. Seções colapsáveis

### Sprint 4 - Sistema de Rolagem
1. DiceRoller com sistema Ordem Paranormal
2. Rolagem de atributo + perícia
3. Rolagem de ataque
4. Cálculo de dano
5. Histórico de rolagens

### Sprint 5 - Realtime
1. Hooks de Realtime
2. Integração no ChatPanel
3. Integração no DiceRoller
4. Integração no PlayerListSidebar
5. Testes de sincronização

### Sprint 6 - Painel do Mestre
1. Master Dashboard
2. RollHistory
3. CreaturesPanel
4. PlayersPanel
5. NPCs Panel

### Sprint 7 - Melhorias e Polimento
1. Sistema de condições
2. Rituais e Poderes
3. Validações e error handling
4. Performance
5. Responsividade

---

## 📝 Notas de Implementação

### Cálculos Automáticos

Todos os cálculos devem ser feitos automaticamente:
- **PV máximo**: Recalcula ao alterar classe, VIG ou NEX
- **SAN máxima**: Recalcula ao alterar classe ou NEX
- **PE máximo**: Recalcula ao alterar classe, PRE ou NEX
- **Defesa**: Recalcula ao alterar AGI ou equipamentos
- **Bônus de perícia**: Recalcula ao alterar nível de treinamento

### Validações Importantes

- **Atributos**: -1 a +20 (limite inicial +2 na criação)
- **NEX**: 0 a 99
- **PV/SAN/PE**: Não podem exceder máximo
- **Perícias "somente treinadas"**: Não podem ser usadas sem treinamento
- **Fórmulas de dados**: Validar formato (ex: "1d8", "2d6+3")

### Estados e Condições

- **Machucado**: PV ≤ 50% máximo
- **Morrendo**: PV = 0
- **Perturbado**: SAN muito baixa
- **Enlouquecido**: SAN crítica
- **Insano**: SAN = 0 (personagem perdido)

### Realtime

Priorizar sincronização em tempo real de:
- Chat
- Rolagens de dados
- Stats de personagens
- Status de jogadores
- Sessão ativa

---

**Data de Criação**: Dezembro 2024
**Última Atualização**: Dezembro 2024


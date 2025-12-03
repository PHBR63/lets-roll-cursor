# Plano de Desenvolvimento Completo - Let's Roll com Sistema Ordem Paranormal

## 📋 Visão Geral

Este documento detalha o plano completo de desenvolvimento do projeto Let's Roll, integrando as regras do sistema Ordem Paranormal RPG com todas as funcionalidades visuais identificadas nas telas do projeto.

---

## 🎯 Fase 3 - Sistema Ordem Paranormal (PRIORIDADE ALTA) ✅ **CONCLUÍDA**

### 3.1. Atualização do Schema do Banco de Dados

**Arquivo:** `supabase/migrations/20241203000000_add_ordem_paranormal_fields.sql`

**Status:** ✅ **CONCLUÍDO** - Migration criada e pronta para execução

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

**Arquivo:** `backend/src/services/ordemParanormalService.ts`

**Status:** ✅ **CONCLUÍDO** - Implementação completa

**Funcionalidades Implementadas:**
- ✅ `calculateMaxPV()` - Calcula PV baseado em classe, VIG e NEX
- ✅ `calculateMaxSAN()` - Calcula SAN baseado em classe e NEX
- ✅ `calculateMaxPE()` - Calcula PE baseado em classe, PRE e NEX
- ✅ `calculateDefense()` - Calcula defesa (10 + AGI + bônus)
- ✅ `calculateSkillBonus()` - Calcula bônus de perícia
- ✅ `rollAttributeTest()` - Rolagem de teste de atributo (vantagem/desvantagem)
- ✅ `rollAttack()` - Rolagem de ataque com crítico
- ✅ `calculateDamage()` - Cálculo de dano (físico/mental, crítico)
- ✅ `calculateNEXLevel()` - Converte NEX % para nível
- ✅ `calculatePERecovery()` - Recuperação de PE por descanso
- ✅ `applyCondition()` - Aplicar condições com efeitos derivados
- ✅ `calculateConditionPenalties()` - Calcular penalidades combinadas de condições
- ✅ `isInjured()`, `isDying()`, `isInsane()` - Validações de estado

### 3.3. Integração no Character Service

**Arquivo:** `backend/src/services/characterService.ts`

**Status:** ✅ **CONCLUÍDO** - Integração completa

**Métodos Implementados:**
- ✅ `updateAttributes()` - Atualizar atributos e recalcular recursos automaticamente
- ✅ `updateSkills()` - Atualizar perícias com cálculo de bônus
- ✅ `applyCondition()` - Aplicar condição ao personagem (com condições derivadas)
- ✅ `removeCondition()` - Remover condição
- ✅ `updateNEX()` - Atualizar NEX e recalcular todos os recursos (PV, SAN, PE)
- ✅ `updatePV()` - Atualizar PV com validações (aplica MORRENDO se PV <= 0)
- ✅ `updateSAN()` - Atualizar SAN com validações (aplica PERTURBADO/ENLOUQUECENDO)
- ✅ `updatePE()` - Atualizar PE com validação de limites
- ✅ `recoverPE()` - Recuperar PE baseado em NEX
- ✅ `rollSkillTest()` - Rolar teste de perícia com penalidades de condições
- ✅ `rollAttack()` - Rolar ataque com penalidades e cálculo de acerto
- ✅ `applyDamage()` - Aplicar dano físico (PV) ou mental (SAN)

### 3.4. Rotas de Sistema Ordem Paranormal

**Arquivo:** `backend/src/routes/characters.ts`

**Status:** ✅ **CONCLUÍDO** - Todas as rotas implementadas

**Rotas Implementadas:**
- ✅ `POST /api/characters/:id/roll-skill` - Rolar teste de perícia
- ✅ `POST /api/characters/:id/roll-attack` - Rolar ataque
- ✅ `POST /api/characters/:id/apply-damage` - Aplicar dano (físico/mental)
- ✅ `POST /api/characters/:id/apply-condition` - Aplicar condição
- ✅ `DELETE /api/characters/:id/conditions/:condition` - Remover condição
- ✅ `PUT /api/characters/:id/attributes` - Atualizar atributos (recalcula recursos)
- ✅ `PUT /api/characters/:id/skills` - Atualizar perícias
- ✅ `PUT /api/characters/:id/nex` - Atualizar NEX (recalcula todos os recursos)
- ✅ `PUT /api/characters/:id/pv` - Atualizar PV (com validações)
- ✅ `PUT /api/characters/:id/san` - Atualizar SAN (com validações)
- ✅ `PUT /api/characters/:id/pe` - Atualizar PE
- ✅ `POST /api/characters/:id/recover-pe` - Recuperar PE (descanso)

**Testes:**
- ✅ 75 testes unitários implementados
- ✅ Cobertura: ordemParanormalService (66.99%), characterService (43.04%)

---

## 🎨 Fase 4 - Frontend: Ficha de Personagem Completa (PRIORIDADE ALTA) ✅ **CONCLUÍDA**

### 4.1. Character Sheet Page

**Arquivo:** `frontend/src/pages/Character/CharacterSheet.tsx`

**Status:** ✅ **CONCLUÍDO**

**Layout Implementado:**
- ✅ Header: Logo + "Ficha de Personagem" + botão "Voltar" roxo
- ✅ Layout 2 colunas (esquerda/direita) responsivo
- ✅ Seções colapsáveis (Accordion)

**Funcionalidades Implementadas:**
- ✅ Buscar dados do personagem via API
- ✅ Salvar alterações automaticamente (debounce)
- ✅ Validação de campos
- ✅ Loading states
- ✅ Cálculos automáticos de recursos (PV, SAN, PE, Defesa)
- ✅ Recalcular defesa ao alterar atributos
- ✅ Validações de limites (PV/SAN/PE não podem exceder máximo)

### 4.2. Vitals Panel (Coluna Esquerda - Topo)

**Arquivo:** `frontend/src/components/character/VitalsPanel.tsx`

**Status:** ✅ **CONCLUÍDO**

**Elementos Implementados:**
- ✅ **Pontos de Vida (PV)**: Barra vermelha `current/max` com controles +/- e input direto
- ✅ **Sanidade (SAN)**: Barra azul `current/max` com controles +/- e input direto
- ✅ **Pontos de Esforço (PE)**: Barra verde `current/max` com controles +/- e input direto
- ✅ **NEX**: Exibição de percentual
- ✅ **Defesa**: Exibição do valor calculado

**Funcionalidades Implementadas:**
- ✅ Atualização via API em tempo real
- ✅ Validação de valores (não pode exceder máximo ou ser negativo)
- ✅ Controles incremento/decremento
- ✅ Animações suaves nas barras de progresso
- ✅ Feedback visual de salvamento

### 4.3. Attributes Grid (Coluna Esquerda)

**Arquivo:** `frontend/src/components/character/AttributesGrid.tsx`

**Status:** ✅ **CONCLUÍDO**

**Elementos Implementados:**
- ✅ Grid responsivo de 5 atributos do sistema Ordem Paranormal:
  - Agilidade (AGI)
  - Força (FOR)
  - Intelecto (INT)
  - Presença (PRE)
  - Vigor (VIG)
- ✅ Inputs editáveis para cada atributo
- ✅ Explicação de efeito nos dados (vantagem/desvantagem)

**Funcionalidades Implementadas:**
- ✅ Edição de valores de atributos
- ✅ Validação de limites (-5 a +20)
- ✅ Recalcular recursos automaticamente ao alterar VIG ou PRE
- ✅ Recalcular defesa automaticamente ao alterar AGI
- ✅ Indicador visual de vantagem/desvantagem nos dados
- ✅ Exibição de defesa calculada em tempo real
- ✅ Botão de salvar com feedback visual

**Design:**
- Hexágonos vermelhos com ícone d20 no centro
- Campo de input abaixo de cada hexágono
- Tooltip explicando efeito do atributo nos dados

### 4.4. Personal Data (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/PersonalData.tsx`

**Status:** ✅ **CONCLUÍDO**

**Campos Implementados:**
- ✅ Nome
- ✅ Classe (read-only, exibido)
- ✅ Origem
- ✅ Idade
- ✅ Altura
- ✅ Peso

**Funcionalidades Implementadas:**
- ✅ Accordion do shadcn/ui
- ✅ Auto-save com botão de salvar
- ✅ Validação de campos
- ✅ Feedback visual de alterações

### 4.5. Inventory Panel (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/InventoryPanel.tsx`

**Status:** ✅ **CONCLUÍDO**

**Elementos Implementados:**
- ✅ **Peso Total**: `X/XX` (calculado automaticamente)
- ✅ **Moedas**: Exibição de moedas do personagem
- ✅ Lista de itens com nome, quantidade e peso
- ✅ Botão para adicionar item
- ✅ **Modal para adicionar item** (`AddItemModal.tsx`) - Selecionar da biblioteca da campanha
- ✅ Remoção de itens com confirmação

**Funcionalidades Implementadas:**
- ✅ Cálculo automático de peso total
- ✅ Integração com API de itens
- ✅ Carregamento de inventário do personagem
- ✅ Atualização em tempo real após adicionar/remover

### 4.6. Biography (Coluna Esquerda - Colapsável)

**Arquivo:** `frontend/src/components/character/Biography.tsx`

**Status:** ✅ **CONCLUÍDO**

**Funcionalidades Implementadas:**
- ✅ Textarea grande para biografia
- ✅ Auto-save com debounce (2 segundos)
- ✅ Indicador visual de salvamento
- ✅ Hook `useDebounce` customizado

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

**Arquivo:** `frontend/src/components/character/SkillsGrid.tsx`

**Status:** ✅ **CONCLUÍDO**

**Elementos Implementados:**
- ✅ Grid de perícias agrupadas por atributo base
- ✅ Todas as 30+ perícias do sistema Ordem Paranormal
- ✅ Cada perícia mostra:
  - Nome
  - Atributo base (AGI, FOR, INT, PRE, VIG)
  - Nível de treinamento (Destreinado, Treinado, Competente, Expert)
  - Bônus calculado automaticamente (+0, +5, +10, +15)

**Funcionalidades Implementadas:**
- ✅ Edição de nível de treinamento via Select
- ✅ Cálculo automático de bônus
- ✅ Indicador visual de perícias que requerem treinamento (*)
- ✅ Agrupamento por atributo base
- ✅ Botão de salvar com feedback visual

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

**Status:** ✅ **CONCLUÍDO**

**Rota Implementada:**
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

### 4.11. Melhorias e Funcionalidades Extras ✅ **CONCLUÍDAS**

**Modais Implementados:**
- ✅ `AddConditionModal.tsx` - Modal para adicionar condições ao personagem
- ✅ `AddItemModal.tsx` - Modal para adicionar itens ao inventário

**Validações Implementadas:**
- ✅ Validação de limites PV/SAN/PE (não podem exceder máximo)
- ✅ Validação de valores negativos
- ✅ Feedback visual de erros

**Cálculos Automáticos:**
- ✅ Defesa recalculada automaticamente ao alterar AGI
- ✅ Recursos recalculados ao alterar atributos, classe ou NEX

**Melhorias Visuais:**
- ✅ Animações suaves (fade-in) nos componentes
- ✅ Transições nas barras de progresso
- ✅ Feedback visual de salvamento
- ✅ Loading states

---

## 🎮 Fase 5 - Sala de Sessão Completa (PRIORIDADE ALTA) ✅ **CONCLUÍDA**

### 5.1. Session Room Page

**Arquivo:** `frontend/src/pages/GameSession/SessionRoom.tsx`

**Status:** ✅ **CONCLUÍDO**

**Layout Implementado:**
- ✅ Header: Logo + título campanha + notificações + perfil
- ✅ Área principal: GameBoard (esquerda, 70%)
- ✅ Sidebar: PlayerListSidebar (direita, 30%)
- ✅ Chat panel (área inferior)
- ✅ DiceRoller (área inferior com tabs)

**Funcionalidades Implementadas:**
- ✅ Buscar sessão ativa da campanha
- ✅ Criar sessão se não existir (mestre)
- ✅ Gerenciamento de estado da sessão
- ⚠️ Integração com Supabase Realtime (parcial - ChatPanel já tem)

### 5.2. Game Board

**Arquivo:** `frontend/src/components/session/GameBoard.tsx`

**Status:** ✅ **MELHORADO** - Funcionalidades básicas implementadas

**Funcionalidades Implementadas:**
- ✅ Upload de mapas/imagens (Supabase Storage ou URL local)
- ✅ Zoom in/out (0.5x a 3x)
- ✅ Drag para mover imagem
- ✅ Reset de zoom e posição
- ✅ Remover imagem
- ✅ Controles visuais (botões de zoom, reset, remover)

**Pendências (Futuro):**
- [ ] Ferramentas de desenho (linhas, formas)
- [ ] Tokens de personagens/criaturas
- [ ] Grid opcional
- [ ] Medição de distância
- [ ] Camadas (background, tokens, annotations)
- [ ] Salvar posição/zoom no banco de dados

### 5.3. Player List Sidebar

**Arquivo:** `frontend/src/components/session/PlayerListSidebar.tsx`

**Status:** ✅ **MELHORADO** - Integrado com sistema Ordem Paranormal

**Layout Implementado:**
- ✅ Botão "Abrir Gerenciador" roxo (topo, só mestre)
- ✅ Grid 2x3 de cards de jogadores

**Card de Jogador Implementado:**
- ✅ Parte superior: Avatar do jogador
- ✅ Parte inferior sobreposta: Avatar do personagem
- ✅ Nome do personagem
- ✅ Stats do sistema Ordem Paranormal:
  - `PV: X/Y` (vermelho - Pontos de Vida)
  - `SAN: X/Y` (azul - Sanidade)
  - `PE: X/Y` (verde - Pontos de Esforço)
- ✅ Indicador de voz ativa (ícones microfone/fone)

**Funcionalidades Implementadas:**
- ✅ Carregamento de jogadores da campanha
- ✅ Exibição de personagens e stats
- ✅ Integração com dados do sistema Ordem Paranormal

**Pendências:**
- [ ] Atualização em tempo real via Supabase Realtime
- [ ] Clique para ver ficha rápida
- [ ] Mestre pode editar stats diretamente
- [ ] Indicador de status online/offline
- [ ] Controles de áudio (mute/unmute)

### 5.4. Dice Roller

**Arquivo:** `frontend/src/components/session/DiceRoller.tsx`

**Status:** ✅ **CONCLUÍDO** - Sistema Ordem Paranormal completo

**Funcionalidades Implementadas:**
- ✅ Botões rápidos: d4, d6, d8, d10, d12, d20, d100
- ✅ Campo para fórmula customizada (ex: "2d6+3")
- ✅ **Sistema de Tabs**: Básica, Perícia, Ataque
- ✅ **Rolagem de Perícia**: Selecionar perícia e DT
  - Calcula automaticamente número de dados baseado no atributo
  - Aplica bônus de perícia
  - Mostra vantagem/desvantagem visualmente
  - Exibe sucesso/falha baseado na DT
- ✅ **Rolagem de Ataque**: Selecionar perícia (Luta/Pontaria), defesa do alvo, dado de dano
  - Calcula acerto vs defesa
  - Detecta crítico (20 natural)
  - Calcula dano (com Força para corpo-a-corpo)
  - Exibe resultado detalhado
- ✅ Checkbox "Rolagem Privada"
- ✅ Exibe resultado detalhado com animação
- ✅ Integração com API do backend

**Integração:**
- ✅ Chama API `/api/dice/roll` para rolagens básicas
- ✅ Chama API `/api/characters/:id/roll-skill` para testes de perícia
- ✅ Chama API `/api/characters/:id/roll-attack` para ataques
- ✅ Carrega personagem do usuário automaticamente

**Pendências:**
- [ ] Envia para chat/histórico automaticamente
- [ ] Histórico de rolagens recentes
- [ ] Integração com Realtime para sincronização

### 5.5. Chat Panel

**Arquivo:** `frontend/src/components/session/ChatPanel.tsx`

**Status:** ✅ **IMPLEMENTADO** - Funcionalidades básicas completas

**Funcionalidades Implementadas:**
- ✅ Lista de mensagens com scroll automático
- ✅ Campo de input
- ✅ Botão enviar
- ✅ Integração com Supabase Realtime (subscription ativa)
- ✅ Carregamento de mensagens iniciais
- ✅ Exibição de avatar e nome do usuário/personagem
- ✅ Timestamp das mensagens
- ✅ Auto-scroll para última mensagem

**Pendências:**
- [ ] Tipos de mensagem (narração, OOC)
- [ ] Rolagem de dados automática no chat
- [ ] Canais (Geral, Roleplay, Off-topic, Mestre)
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

### Fase 3 - Sistema Ordem Paranormal (Backend) ✅ **CONCLUÍDA**
- [x] Migration criada
- [x] Tipos TypeScript criados
- [x] ordemParanormalService implementado COMPLETO
- [x] Métodos adicionais no ordemParanormalService (todos implementados)
- [x] Integração completa no characterService
- [x] Rotas de sistema adicionadas (12 rotas)
- [x] Testes de cálculos (75 testes unitários, 66.99% cobertura)

### Fase 4 - Ficha de Personagem (Frontend) ✅ **CONCLUÍDA**
- [x] CharacterSheet page
- [x] VitalsPanel component (PV, SAN, PE, NEX, Defesa)
- [x] AttributesGrid component (5 atributos Ordem Paranormal)
- [x] PersonalData component
- [x] InventoryPanel component (com modal de adicionar item)
- [x] Biography component (com auto-save)
- [x] SkillsGrid component (todas as perícias)
- [x] ConditionsPanel component (com modal de adicionar condição)
- [x] Rota no frontend (`/character/:id`)
- [x] Integração completa com API
- [x] Cálculos automáticos (defesa, recursos)
- [x] Validações de limites (PV/SAN/PE)
- [x] Modais para adicionar condições e itens
- [x] Melhorias visuais e animações

### Fase 5 - Sala de Sessão (Frontend) ✅ **CONCLUÍDA**
- [x] SessionRoom page (completo)
- [x] GameBoard component (upload, zoom, drag)
- [x] PlayerListSidebar component (dados Ordem Paranormal)
- [x] DiceRoller component (sistema Ordem Paranormal completo)
- [x] ChatPanel component (Realtime básico)
- [x] Melhorias no GameBoard (upload de imagem, zoom, drag)
- [x] DiceRoller com sistema Ordem Paranormal (tabs: básica, perícia, ataque)
- [ ] Integração Realtime completa (parcial - ChatPanel tem)
- [ ] Controles de áudio
- [ ] Tokens e ferramentas avançadas no GameBoard

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

### Fase 12 - Testes ✅ **PARCIALMENTE CONCLUÍDA**
- [x] Testes unitários (75 testes para Fase 3)
- [x] Cobertura de código (ordemParanormalService: 66.99%, characterService: 43.04%)
- [ ] Testes de integração
- [ ] Validação de regras (parcial - testes unitários cobrem cálculos)

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

---

## 📊 Status Geral do Projeto

### ✅ Fases Concluídas

1. **Fase 3 - Sistema Ordem Paranormal (Backend)** ✅ **100% CONCLUÍDA**
   - Migration do banco de dados
   - Serviços de cálculo completos
   - Integração no Character Service
   - 12 rotas de API implementadas
   - 75 testes unitários (66.99% cobertura)

2. **Fase 4 - Ficha de Personagem (Frontend)** ✅ **100% CONCLUÍDA**
   - Página CharacterSheet completa
   - 8 componentes principais implementados
   - 2 modais (condições e itens)
   - Validações e cálculos automáticos
   - Melhorias visuais e animações

### 🚧 Fases em Andamento

Nenhuma no momento.

### 📋 Próximas Fases Prioritárias

1. **Fase 5 - Sala de Sessão Completa** (PRIORIDADE ALTA)
   - Melhorias no GameBoard (mapas, zoom, tokens)
   - DiceRoller com sistema Ordem Paranormal
   - Integração Realtime completa

2. **Fase 8 - Integração Supabase Realtime** (PRIORIDADE ALTA)
   - Hooks de Realtime
   - Sincronização em tempo real
   - Atualização de componentes

3. **Fase 6 - Painel do Mestre** (PRIORIDADE MÉDIA)
   - Master Dashboard
   - RollHistory
   - CreaturesPanel
   - PlayersPanel

---

**Data de Criação**: Dezembro 2024
**Última Atualização**: Dezembro 2024



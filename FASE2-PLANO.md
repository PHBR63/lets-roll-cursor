# Fase 2 - Plano de Implementação Let's Roll

## Visão Geral

Esta fase foca nas funcionalidades principais do jogo: criação de campanhas, gestão de personagens, sessões de jogo e painel do mestre.

## Prioridades

1. **Wizard de Criação de Campanha** (Prioridade Alta)
2. **Backend - Lógica Completa** (Prioridade Alta)
3. **Detalhes da Campanha** (Prioridade Média)
4. **Ficha de Personagem** (Prioridade Média)
5. **Sala de Sessão** (Prioridade Alta)
6. **Painel do Mestre** (Prioridade Média)
7. **Modal de Equipamentos** (Prioridade Baixa)

---

## 1. Wizard de Criação de Campanha

### 1.1. Step Indicator Component
**Arquivo:** `frontend/src/components/layout/StepIndicator.tsx`

**Funcionalidades:**
- Componente visual que mostra as 3 etapas do wizard
- Ícones: engrenagem (Base do RPG), poção (Adquiríveis), pessoa (Personalidades)
- Indicação visual da etapa atual (roxo ativo, cinza inativo)
- Setas separadoras entre etapas

**Estados:**
- `currentStep: 1 | 2 | 3`
- Cada step pode estar: `active`, `completed`, `pending`

### 1.2. Create Campaign Page
**Arquivo:** `frontend/src/pages/Campaign/CreateCampaign.tsx`

**Funcionalidades:**
- Gerencia o estado do wizard (etapa atual, dados coletados)
- Navegação entre etapas (Prosseguir, Voltar)
- Validação antes de avançar
- Integração com API para salvar campanha
- Redirecionamento para detalhes da campanha após conclusão

**Estado:**
```typescript
interface WizardState {
  step: 1 | 2 | 3
  baseData: {
    image?: File
    systemRpg?: string
    title: string
    description: string
  }
  acquirables: Acquirable[]
  personalities: Personality[]
}
```

### 1.3. Base RPG Step
**Arquivo:** `frontend/src/components/wizard/BaseRPGStep.tsx`

**Funcionalidades:**
- Upload de imagem (área grande cinza com placeholder)
- Seleção de sistema RPG (4 cards horizontais clicáveis)
- Campo de título (input branco)
- Campo de descrição (textarea branca)
- Validação: título obrigatório
- Botão "Prosseguir" roxo

**Componentes visuais:**
- Card de upload: `bg-card` grande, ícone de câmera, texto "Imagem"
- Cards de sistema: `bg-card` pequenos, hover roxo, selecionado com borda roxa
- Inputs seguindo design system

### 1.4. Acquirables Step
**Arquivo:** `frontend/src/components/wizard/AcquirablesStep.tsx`

**Funcionalidades:**
- Cards dinâmicos de adquiríveis (mínimo 1)
- Cada card contém:
  - Campo "Nome:" (input)
  - Seção "Propriedades:" (lista de campos)
  - Botão "+" para adicionar propriedade
  - Botão "X" no canto superior direito para remover card
- Botão "+" grande centralizado para adicionar novo adquirível
- Botão "Prosseguir" roxo

**Estrutura de dados:**
```typescript
interface Acquirable {
  id: string
  name: string
  properties: string[]
}
```

### 1.5. Personalities Step
**Arquivo:** `frontend/src/components/wizard/PersonalitiesStep.tsx`

**Funcionalidades:**
- Cards dinâmicos de personalidades (NPCs/Criaturas)
- Cada card contém:
  - Campo "Nome:" (input)
  - Seção "Barras:" (lista de barras configuráveis)
    - Cada barra: Título (input), Tipo (dropdown: Percentual/Numérico)
    - Botão "+" para adicionar barra
  - Seção "Propriedades:" (lista de campos)
  - Botão "X" para remover card
- Botão "+" grande centralizado
- Botão "Prosseguir" roxo (finaliza wizard)

**Estrutura de dados:**
```typescript
interface Personality {
  id: string
  name: string
  bars: {
    title: string
    type: 'percentual' | 'numerico'
  }[]
  properties: string[]
}
```

### 1.6. Backend - Create Campaign Endpoint
**Arquivo:** `backend/src/services/campaignService.ts`

**Implementar:**
- `createCampaign()`: Cria campanha no Supabase
- Upload de imagem para Supabase Storage
- Cria registro em `campaigns`
- Cria registro em `campaign_participants` (mestre)
- Salva configurações customizadas (adquiríveis, personalidades) em JSONB

---

## 2. Backend - Implementação Completa dos Serviços

### 2.1. Campaign Service
**Arquivo:** `backend/src/services/campaignService.ts`

**Implementar:**
- `getUserCampaigns(userId)`: Busca campanhas onde usuário é participante
- `getCampaignById(id)`: Busca campanha com participantes
- `updateCampaign(id, data)`: Atualiza campanha (apenas mestre)
- `deleteCampaign(id)`: Deleta campanha (apenas mestre)
- `invitePlayer(campaignId, email)`: Envia convite

**Queries Supabase:**
- JOIN com `campaign_participants` para obter lista de participantes
- Filtros por role e status

### 2.2. Character Service
**Arquivo:** `backend/src/services/characterService.ts`

**Implementar:**
- `getCharacters(filters)`: Lista personagens (por campanha, por usuário)
- `createCharacter(userId, data)`: Cria personagem
- `getCharacterById(id)`: Busca ficha completa
- `updateCharacter(id, data)`: Atualiza ficha
- `deleteCharacter(id)`: Deleta personagem

**Estrutura de dados:**
- Atributos em JSONB
- Stats (Vida, Energia, Saúde) em JSONB
- Relacionamento com itens e habilidades

### 2.3. Creature Service
**Arquivo:** `backend/src/services/creatureService.ts`

**Implementar:**
- `getCreatures(filters)`: Lista criaturas (global + da campanha)
- `createCreature(data)`: Cria criatura
- `updateCreature(id, data)`: Atualiza criatura
- `deleteCreature(id)`: Deleta criatura

### 2.4. Item Service
**Arquivo:** `backend/src/services/itemService.ts` (criar)

**Implementar:**
- CRUD completo de itens
- Distribuição de itens para personagens
- Gerenciamento de inventário

### 2.5. Ability Service
**Arquivo:** `backend/src/services/abilityService.ts` (criar)

**Implementar:**
- CRUD completo de habilidades
- Associação com personagens

### 2.6. Session Service
**Arquivo:** `backend/src/services/sessionService.ts` (criar)

**Implementar:**
- `createSession(campaignId, data)`: Inicia nova sessão
- `getActiveSession(campaignId)`: Busca sessão ativa
- `updateSession(id, data)`: Atualiza sessão
- `endSession(id)`: Finaliza sessão

### 2.7. Dice Service
**Arquivo:** `backend/src/services/diceService.ts` (criar)

**Implementar:**
- `rollDice(formula)`: Parse e executa fórmula (ex: "2d6+3")
- `saveRoll(data)`: Salva rolagem no histórico
- `getRollHistory(sessionId)`: Busca histórico

**Parser de fórmula:**
- Suportar: `XdY`, `+Z`, `-Z`, `XdY+Z`
- Validar fórmula
- Retornar: resultado, detalhes (cada dado), fórmula

### 2.8. Moment Service
**Arquivo:** `backend/src/services/momentService.ts`

**Implementar:**
- `getCampaignMoments(campaignId)`: Busca momentos ordenados por data
- `createMoment(data)`: Cria momento (stories)
- `deleteMoment(id)`: Deleta momento

---

## 3. Detalhes da Campanha

### 3.1. Campaign Detail Page
**Arquivo:** `frontend/src/pages/Campaign/CampaignDetail.tsx`

**Funcionalidades:**
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

**Integrações:**
- Buscar dados da campanha via API
- Listar personagens da campanha
- Listar participantes

### 3.2. Character Status Card
**Arquivo:** `frontend/src/components/character/CharacterStatusCard.tsx`

**Funcionalidades:**
- Card cinza escuro
- Placeholder "Char" (avatar)
- Nome do personagem
- 4 barras de progresso:
  - Vida (vermelho): `10/20`
  - XP (roxo): `30%`
  - Energia (verde): `20/20`
  - Saúde (amarelo): `15/20`
- Link para ficha completa

### 3.3. Players Sidebar
**Arquivo:** `frontend/src/components/campaign/PlayersSidebar.tsx`

**Funcionalidades:**
- Lista vertical de jogadores
- Cada item mostra:
  - Avatar placeholder "Perfil"
  - Nome do jogador
  - Status: bolinha verde (Conectado) / vermelha (Desconectado)
  - Role destacado "(mestre)" se for mestre
- Atualização em tempo real (futuro)

### 3.4. Invite Players Component
**Arquivo:** `frontend/src/components/campaign/InvitePlayers.tsx`

**Funcionalidades:**
- Modal com formulário
- Campo de e-mail
- Botão "Enviar Convite"
- Integração com API

---

## 4. Ficha de Personagem Completa

### 4.1. Character Sheet Page
**Arquivo:** `frontend/src/pages/Character/CharacterSheet.tsx`

**Layout:**
- Header: Logo + "Ficha de Personagem" + botão "Voltar" roxo
- 2 colunas (esquerda/direita)
- Seções colapsáveis (Accordion)

### 4.2. Vitals Panel (Coluna Esquerda - Topo)
**Arquivo:** `frontend/src/components/character/VitalsPanel.tsx`

**Elementos:**
- Retrato circular do personagem
- Barras:
  - Vida (vermelho): `20/20`
  - Energia (verde): `20/20`
- Checkboxes:
  - "Lesão grave"
  - "Inconsciente"
  - "Morrendo"
- Barra EXP (roxo): `10%`
- Campos menores:
  - Movimento
  - Corpo
  - Tamanho
  - Dano Extra

### 4.3. Attributes Grid (Coluna Esquerda)
**Arquivo:** `frontend/src/components/character/AttributesGrid.tsx`

**Funcionalidades:**
- Grid de 8 hexágonos vermelhos (estilo d20)
- Atributos:
  - Aparência
  - Constituição
  - Destreza
  - Educação
  - Força
  - Inteligência
  - Sorte
  - Movimento
- Cada hexágono: ícone + label + campo de valor
- SVG para hexágono ou CSS clip-path

### 4.4. Personal Data (Coluna Esquerda - Colapsável)
**Arquivo:** `frontend/src/components/character/PersonalData.tsx`

**Campos:**
- Nome
- Jogador
- Classe
- Ocupação
- Sexo
- Idade
- Altura
- Peso
- Loc. Origem
- Loc. Atual

**Componente:** Usar Accordion do shadcn/ui

### 4.5. Inventory Panel (Coluna Esquerda - Colapsável)
**Arquivo:** `frontend/src/components/character/InventoryPanel.tsx`

**Funcionalidades:**
- Peso Total: `X/XX`
- Coin: `1300 C`
- Lista de itens:
  - Cada item: nome, valor (peso), ícone lixeira
  - Botão para adicionar item
- Modal para adicionar item (selecionar da biblioteca)

### 4.6. Biography (Coluna Esquerda - Colapsável)
**Arquivo:** `frontend/src/components/character/Biography.tsx`

**Funcionalidades:**
- Textarea grande para biografia
- Auto-save (debounce)

### 4.7. Combat Table (Coluna Direita - Topo)
**Arquivo:** `frontend/src/components/character/CombatTable.tsx`

**Funcionalidades:**
- Tabela com colunas:
  - Nome (arma/ataque)
  - Tipo (Briga, Arremesso, etc.)
  - Dano (1D3, 2D6, etc.)
  - Mun. Atual
  - Mun. Máxima
  - Alcance
  - Defeito
- Botão para adicionar arma
- Ícone lixeira para remover

### 4.8. Skills Grid (Coluna Direita)
**Arquivo:** `frontend/src/components/character/SkillsGrid.tsx`

**Funcionalidades:**
- Similar ao AttributesGrid
- Grid de perícias com hexágonos
- Valores editáveis

### 4.9. Seções Colapsáveis Adicionais (Coluna Direita)
**Componentes:**
- `HabilitiesRecipes.tsx` - Habilidades/Receitas
- `ImportantPeople.tsx` - Pessoas Importantes
- `ImportantItems.tsx` - Itens Importantes
- `Diseases.tsx` - Doenças
- `CharacterPresentation.tsx` - Apresentação do Personagem (textarea)

### 4.10. Backend - Character CRUD Completo
**Atualizar:** `backend/src/services/characterService.ts`

**Implementar:**
- Validação de dados
- Relacionamentos com itens e habilidades
- Auto-save de campos editáveis
- Histórico de mudanças (opcional)

---

## 5. Sala de Sessão de Jogo

### 5.1. Session Room Page
**Arquivo:** `frontend/src/pages/GameSession/SessionRoom.tsx`

**Layout:**
- Header: Logo + título campanha + notificações + perfil
- Área principal: GameBoard (esquerda, 70%)
- Sidebar: PlayerListSidebar (direita, 30%)
- Chat panel (futuro - pode ser overlay ou aba)

**Funcionalidades:**
- Buscar sessão ativa da campanha
- Criar sessão se não existir (mestre)
- Integração com Supabase Realtime para atualizações

### 5.2. Game Board
**Arquivo:** `frontend/src/components/session/GameBoard.tsx`

**Funcionalidades:**
- Área grande cinza com placeholder "Cenário do RPG"
- (Futuro: upload de mapas, ferramentas de desenho)
- Zoom in/out
- Drag para mover

### 5.3. Player List Sidebar
**Arquivo:** `frontend/src/components/session/PlayerListSidebar.tsx`

**Layout:**
- Botão "Abrir Gerenciador" roxo (topo, só mestre)
- Grid 2x3 de cards de jogadores

**Card de Jogador:**
- Parte superior: Avatar do jogador (persona com fones)
- Parte inferior sobreposta: Avatar do personagem (anime style)
- Nome do personagem (ex: "Ryu")
- Stats:
  - `19/20` (vermelho - Vida)
  - `21/25` (azul - outro recurso)
- Indicador de voz ativa (ícones microfone/fone)

**Funcionalidades:**
- Atualização em tempo real via Supabase Realtime
- Clique para ver ficha rápida
- Mestre pode editar stats

### 5.4. Dice Roller
**Arquivo:** `frontend/src/components/session/DiceRoller.tsx`

**Funcionalidades:**
- Botões rápidos: d4, d6, d8, d10, d12, d20, d100
- Campo para fórmula customizada (ex: "2d6+3")
- Checkbox "Rolagem Privada"
- Botão "Rolar"
- Exibe resultado
- Envia para chat/histórico automaticamente

**Integração:**
- Chama API `/api/dice/roll`
- Recebe resultado e publica via Realtime

### 5.5. Chat Panel (Estrutura Básica)
**Arquivo:** `frontend/src/components/session/ChatPanel.tsx`

**Funcionalidades iniciais:**
- Lista de mensagens
- Campo de input
- Botão enviar
- Integração com Supabase Realtime

**Canais (futuro):**
- Geral
- Roleplay
- Off-topic
- Mestre (privado)

---

## 6. Painel do Mestre

### 6.1. Master Dashboard Page
**Arquivo:** `frontend/src/pages/Master/Dashboard.tsx`

**Layout 3 colunas:**
- Coluna 1 (Dashboard): Roll History + Master Info
- Coluna 2 (Criaturas/NPCs): Cards de criaturas + Tabs
- Coluna 3 (Jogadores): Lista vertical de players

### 6.2. Roll History
**Arquivo:** `frontend/src/components/master/RollHistory.tsx`

**Funcionalidades:**
- Cards hexagonais brancos/cinza
- Cada card mostra:
  - Número (resultado da rolagem)
  - "Jogador (Personagem)" abaixo
- Scroll vertical
- Ordenado por mais recente

### 6.3. Creatures Panel
**Arquivo:** `frontend/src/components/master/CreaturesPanel.tsx`

**Funcionalidades:**
- Header: Título "Criaturas" + Dropdown "+ Novo" / "Lista Completa"
- Grid de cards de criaturas
- Cada card:
  - Nome
  - "Char" placeholder
  - Barras:
    - Vida (vermelho): `5/1` `30%`
    - EXP (cinza)
    - Energia (verde): `10/20`
    - Saúde (amarelo): `10/20`
- Clique para editar/detalhar

### 6.4. NPCs Panel (Mesma área, via Tabs)
**Tabs roxas:**
- Equipamentos
- Itens
- Habilidades
- Magias

**Cada tab mostra:**
- Lista de itens/habilidades relacionadas
- Botão "+ Novo"
- Cards clicáveis para editar

### 6.5. Players Panel
**Arquivo:** `frontend/src/components/master/PlayersPanel.tsx`

**Funcionalidades:**
- Lista vertical de cards "Player Name"
- Cada card tem mesmo padrão de barras das criaturas
- Mestre pode editar stats diretamente
- Botão para abrir ficha

---

## 7. Modal de Equipamentos

### 7.1. Equipment Modal
**Arquivo:** `frontend/src/components/items/EquipmentModal.tsx`

**Funcionalidades:**
- Modal roxo escuro grande
- Header:
  - Título "Equipamentos"
  - Barra de busca (ícone lupa)
  - Botão "+ Novo" roxo
- Conteúdo:
  - Lista 2 colunas de cards cinza
  - Cada card:
    - Título "objeto exemplo"
    - Chevron para expandir
  - Expandido mostra:
    - Nome
    - Raridade (badge azul "Unica")
    - Descrição
    - Ícone lixeira

**Integrações:**
- Buscar itens da campanha
- Criar novo item
- Editar item
- Deletar item

---

## 8. Integração Supabase Realtime

### 8.1. Realtime Subscriptions
**Arquivos:** `frontend/src/hooks/useRealtime.ts` (criar)

**Funcionalidades:**
- Hook customizado para gerenciar subscriptions
- Subscriptions para:
  - `chat_messages` (session_id)
  - `dice_rolls` (session_id)
  - `sessions` (status, players)

**Uso:**
```typescript
const { messages } = useRealtimeChat(sessionId)
const { rolls } = useRealtimeRolls(sessionId)
```

---

## 9. Melhorias e Ajustes

### 9.1. Validações Frontend
- Formulários com react-hook-form + zod
- Mensagens de erro amigáveis
- Loading states

### 9.2. Error Handling
- Toast notifications para erros
- Fallbacks para dados não encontrados
- Retry logic para requisições falhas

### 9.3. Performance
- Lazy loading de componentes pesados
- Paginação em listas grandes
- Debounce em buscas

### 9.4. Responsividade
- Mobile-first adjustments
- Breakpoints para tablet/desktop
- Sidebar colapsável em mobile

---

## 10. Testes e Qualidade

### 10.1. Testes Básicos
- Testes de componentes críticos (futuro)
- Validação de fórmulas de dados
- Testes de integração API (futuro)

---

## Ordem de Implementação Recomendada

1. **StepIndicator + Wizard (1.1-1.5)** - Base para criar campanhas
2. **Backend - Campaign Service completo (2.1)** - Integração real
3. **Campaign Detail (3.1-3.4)** - Visualizar campanhas criadas
4. **Backend - Character/Creature/Item/Ability Services (2.2-2.5)** - Dados necessários
5. **Character Sheet (4.1-4.9)** - Fichas completas
6. **Session Room + Dice Roller (5.1-5.4)** - Jogar!
7. **Master Dashboard (6.1-6.5)** - Controles do mestre
8. **Realtime (8.1)** - Sincronização em tempo real
9. **Equipment Modal (7.1)** - Gerenciamento de itens
10. **Ajustes finais (9.1-9.4)**

---

## Checklist de Implementação

### Fase 2.1 - Wizard e Backend Base
- [ ] StepIndicator component
- [ ] CreateCampaign page
- [ ] BaseRPGStep component
- [ ] AcquirablesStep component
- [ ] PersonalitiesStep component
- [ ] Backend: Campaign Service completo
- [ ] Backend: Upload de imagens

### Fase 2.2 - Detalhes e Fichas
- [ ] CampaignDetail page
- [ ] CharacterStatusCard component
- [ ] PlayersSidebar component
- [ ] CharacterSheet page
- [ ] VitalsPanel component
- [ ] AttributesGrid component
- [ ] PersonalData component
- [ ] InventoryPanel component
- [ ] CombatTable component
- [ ] SkillsGrid component
- [ ] Backend: Character Service completo

### Fase 2.3 - Sessão de Jogo
- [ ] SessionRoom page
- [ ] GameBoard component
- [ ] PlayerListSidebar component
- [ ] DiceRoller component
- [ ] ChatPanel component (básico)
- [ ] Backend: Session Service
- [ ] Backend: Dice Service

### Fase 2.4 - Painel do Mestre
- [ ] Master Dashboard page
- [ ] RollHistory component
- [ ] CreaturesPanel component
- [ ] PlayersPanel component
- [ ] EquipmentModal component
- [ ] Backend: Services completos restantes

### Fase 2.5 - Realtime e Polimento
- [ ] Realtime hooks
- [ ] Integração Realtime nas páginas
- [ ] Validações e error handling
- [ ] Responsividade
- [ ] Ajustes finais de UI/UX


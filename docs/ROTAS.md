# 🗺️ Documentação de Rotas - Let's Roll

Este documento mapeia todas as rotas da aplicação, seus redirecionamentos e fluxos de navegação.

## 📋 Rotas Definidas

### Rotas Públicas
- `/` - Landing page (página inicial)
- `/login` - Página de login
- `/register` - Página de registro

### Rotas Protegidas (requerem autenticação)

#### Dashboard e Navegação
- `/dashboard` - Dashboard principal do usuário
  - Exibe campanhas (mestrando e participando)
  - Exibe personagens do usuário
  - Botão "Criar Personagem" abre modal de seleção de campanha

#### Campanhas
- `/campaign/create` - Criar nova campanha
- `/campaign/:id` - Detalhes da campanha
  - Botão "Criar Personagem" (apenas para jogadores sem personagem)
  - Redireciona para `/campaign/:id/character/create`

#### Personagens
- `/characters` - Lista todos os personagens do usuário
  - Botão "Criar Personagem" abre modal de seleção de campanha
- `/character/:id` - Ficha completa do personagem
- `/campaign/:campaignId/character/create` - Criar novo personagem
  - **Requer:** `campaignId` válido na URL
  - **Validação:** Verifica acesso à campanha antes de permitir criação
  - **Redireciona:** Para `/character/:id` após criação bem-sucedida

#### Sessões de Jogo
- `/session/:id` - Sala de sessão de jogo
  - GameBoard, Chat, Dice Roller, Histórico de rolagens

#### Mestre
- `/master/:campaignId` - Dashboard do mestre
  - Gerenciamento de NPCs, criaturas, itens, habilidades

#### Outros
- `/rituals` - Guia de rituais do sistema
- `/settings` - Configurações do usuário

## 🔄 Fluxos de Navegação

### Criar Personagem

**Fluxo Principal:**
1. Usuário clica em "Criar Personagem" (Dashboard ou CharactersList)
2. Modal abre mostrando campanhas disponíveis (onde usuário é player)
3. Usuário seleciona campanha
4. Navega para `/campaign/:campaignId/character/create`
5. Preenche formulário de criação
6. Após sucesso, redireciona para `/character/:id`

**Validações:**
- Se não houver campanhas disponíveis, modal oferece opção de criar campanha
- Rota de criação valida se `campaignId` existe e se usuário tem acesso
- Se validação falhar, redireciona para `/dashboard` com mensagem de erro

### Acesso a Personagem

**Fluxos:**
- Dashboard → Card de personagem → `/character/:id`
- CharactersList → Card de personagem → `/character/:id`
- CampaignDetail → Card de personagem → `/character/:id`

## 🚫 Rotas Removidas

As seguintes rotas foram removidas do Navbar por não estarem implementadas:
- `/profile` - Meu perfil (removido)
- `/history` - Histórico (removido)
- `/friends` - Amigos (removido)

## 🛠️ Componentes Compartilhados

### Hook: `useCreateCharacterModal`
Localização: `frontend/src/hooks/useCreateCharacterModal.tsx`

Gerencia o estado do modal de seleção de campanha para criação de personagem.

**Uso:**
```typescript
const createCharacterModal = useCreateCharacterModal(campaigns)

// Abrir modal
createCharacterModal.openModal()

// Verificar se há campanhas disponíveis
if (createCharacterModal.hasAvailableCampaigns) {
  // Mostrar botão de criar
}
```

### Componente: `CreateCharacterModal`
Localização: `frontend/src/components/character/CreateCharacterModal.tsx`

Modal reutilizável para seleção de campanha ao criar personagem.

**Props:**
- `open: boolean` - Controla visibilidade do modal
- `onOpenChange: (open: boolean) => void` - Callback para fechar modal
- `availableCampaigns: Campaign[]` - Lista de campanhas disponíveis
- `onSelectCampaign: (campaignId: string) => void` - Callback ao selecionar campanha
- `onCreateCampaign: () => void` - Callback para criar nova campanha

## ✅ Melhorias Implementadas

1. **Hook Compartilhado:** Lógica de modal centralizada em `useCreateCharacterModal`
2. **Componente Reutilizável:** `CreateCharacterModal` usado em Dashboard e CharactersList
3. **Validação de Rota:** CreateCharacter valida acesso à campanha antes de permitir criação
4. **Limpeza de Rotas:** Removidas rotas inexistentes do Navbar
5. **Fluxo Consistente:** Todos os botões "Criar Personagem" usam o mesmo fluxo

## 📝 Notas Importantes

- **Campanha Obrigatória:** Personagens só podem ser criados dentro de uma campanha
- **Validação de Acesso:** Sistema valida se usuário tem permissão para criar personagem na campanha
- **Feedback Visual:** Mensagens de erro claras quando validações falham
- **Navegação Segura:** Redirecionamentos automáticos quando rotas são acessadas incorretamente


# 📚 Progresso da Documentação Swagger - Let's Roll API

## ✅ Concluído

### Schemas Adicionados
- ✅ Error
- ✅ Character
- ✅ Campaign
- ✅ Session
- ✅ DiceRoll
- ✅ ChatMessage
- ✅ Moment
- ✅ Origin
- ✅ **Item** (novo)
- ✅ **Ability** (novo)
- ✅ **Creature** (novo)
- ✅ **ThreatTemplate** (novo)
- ✅ **CampaignParticipant** (novo)
- ✅ **InventoryItem** (novo)
- ✅ **AmmunitionState** (novo)

### Tags Adicionadas
- ✅ Auth
- ✅ Campaigns
- ✅ Characters
- ✅ Creatures
- ✅ Items
- ✅ Abilities
- ✅ Sessions
- ✅ Dice
- ✅ Chat
- ✅ **Moments** (novo)
- ✅ **Origins** (novo)
- ✅ **ThreatTemplates** (novo)
- ✅ **Inventory** (novo)

### Rotas Documentadas

#### Campaigns (✅ Completo)
- ✅ GET `/api/campaigns` - Listar campanhas do usuário
- ✅ POST `/api/campaigns` - Criar campanha
- ✅ GET `/api/campaigns/:id` - Obter campanha por ID
- ✅ PUT `/api/campaigns/:id` - Atualizar campanha
- ✅ DELETE `/api/campaigns/:id` - Deletar campanha
- ✅ PUT `/api/campaigns/:id/rank` - Atualizar patente
- ✅ POST `/api/campaigns/:id/invite` - Convidar jogador

#### Characters (✅ Parcial - Principais)
- ✅ GET `/api/characters` - Listar personagens
- ✅ POST `/api/characters` - Criar personagem
- ✅ GET `/api/characters/:id` - Obter personagem
- ✅ PUT `/api/characters/:id` - Atualizar personagem
- ✅ DELETE `/api/characters/:id` - Deletar personagem
- ⏳ Rotas aninhadas (inventory, abilities, etc.) - **Pendente**

#### Sessions (⏳ Parcial)
- ⏳ Rotas básicas documentadas, mas precisa expandir

#### Dice (⏳ Parcial)
- ⏳ Tag definida, precisa documentar rotas

#### Chat (⏳ Parcial)
- ⏳ Tag definida, precisa documentar rotas

#### Moments (⏳ Parcial)
- ⏳ Algumas rotas documentadas

#### Origins (⏳ Parcial)
- ⏳ Algumas rotas documentadas

## ⏳ Pendente

### Rotas que Precisam de Documentação Completa

#### Characters (Rotas Aninhadas)
- ⏳ GET `/api/characters/:id/inventory`
- ⏳ POST `/api/characters/:id/inventory`
- ⏳ DELETE `/api/characters/:id/inventory/:itemId`
- ⏳ POST `/api/characters/:id/inventory/check-overload`
- ⏳ PATCH `/api/characters/:id/inventory/:itemId/equip`
- ⏳ GET `/api/characters/:id/abilities`
- ⏳ POST `/api/characters/:id/abilities`
- ⏳ DELETE `/api/characters/:id/abilities/:abilityId`
- ⏳ POST `/api/characters/:id/roll-skill`
- ⏳ POST `/api/characters/:id/roll-attack`
- ⏳ POST `/api/characters/:id/apply-damage`
- ⏳ POST `/api/characters/:id/apply-condition`
- ⏳ DELETE `/api/characters/:id/conditions/:condition`
- ⏳ PUT `/api/characters/:id/attributes`
- ⏳ PUT `/api/characters/:id/skills`
- ⏳ PUT `/api/characters/:id/nex`
- ⏳ PUT `/api/characters/:id/pv`
- ⏳ PUT `/api/characters/:id/san`
- ⏳ PUT `/api/characters/:id/pe`
- ⏳ POST `/api/characters/:id/permanent-effects`
- ⏳ DELETE `/api/characters/:id/permanent-effects/:effectId`
- ⏳ POST `/api/characters/:id/spend-pe`
- ⏳ POST `/api/characters/:id/recover-pe`

#### Items
- ⏳ GET `/api/items`
- ⏳ POST `/api/items`
- ⏳ GET `/api/items/campaign/:campaignId`
- ⏳ POST `/api/items/distribute`
- ⏳ GET `/api/items/:id`
- ⏳ PUT `/api/items/:id`
- ⏳ DELETE `/api/items/:id`

#### Abilities
- ⏳ GET `/api/abilities`
- ⏳ POST `/api/abilities`
- ⏳ GET `/api/abilities/:id`
- ⏳ PUT `/api/abilities/:id`
- ⏳ DELETE `/api/abilities/:id`

#### Creatures
- ⏳ GET `/api/creatures`
- ⏳ POST `/api/creatures`
- ⏳ GET `/api/creatures/campaign/:campaignId`
- ⏳ GET `/api/creatures/:id`
- ⏳ PUT `/api/creatures/:id`
- ⏳ DELETE `/api/creatures/:id`

#### Sessions (Expandir)
- ⏳ GET `/api/sessions`
- ⏳ POST `/api/sessions`
- ⏳ GET `/api/sessions/:id`
- ⏳ PUT `/api/sessions/:id`
- ⏳ PUT `/api/sessions/:id/board-state`
- ⏳ POST `/api/sessions/:id/end`
- ⏳ GET `/api/sessions/:sessionId/ammunition/:characterId`
- ⏳ POST `/api/sessions/:sessionId/ammunition/:characterId/spend`
- ⏳ POST `/api/sessions/:sessionId/ammunition/:characterId/reload`
- ⏳ PUT `/api/sessions/:sessionId/ammunition/:characterId`
- ⏳ POST `/api/sessions/:sessionId/ammunition/reset`

#### Dice (Completar)
- ⏳ POST `/api/dice/roll`
- ⏳ GET `/api/dice/history`

#### Chat (Completar)
- ⏳ GET `/api/chat`
- ⏳ POST `/api/chat`

#### Moments (Completar)
- ⏳ GET `/api/moments/campaign/:campaignId`
- ⏳ GET `/api/moments/session/:sessionId`
- ⏳ GET `/api/moments/:id`
- ⏳ POST `/api/moments`
- ⏳ PUT `/api/moments/:id`
- ⏳ DELETE `/api/moments/:id`

#### Origins (Completar)
- ✅ GET `/api/origins`
- ⏳ GET `/api/origins/:id`
- ⏳ GET `/api/origins/:id/power`

#### ThreatTemplates
- ⏳ GET `/api/threat-templates`
- ⏳ POST `/api/threat-templates`
- ⏳ GET `/api/threat-templates/:id`
- ⏳ PUT `/api/threat-templates/:id`
- ⏳ DELETE `/api/threat-templates/:id`
- ⏳ POST `/api/threat-templates/:id/create-creature`

#### Inventory
- ⏳ GET `/api/inventory/character/:characterId`
- ⏳ POST `/api/inventory/add`
- ⏳ DELETE `/api/inventory/remove/:itemId`

## 📊 Estatísticas

- **Total de Rotas Identificadas:** ~70+
- **Rotas Documentadas:** ~15
- **Progresso:** ~21%
- **Schemas:** 14/14 (100%)
- **Tags:** 13/13 (100%)

## 🎯 Próximos Passos

1. Completar documentação de rotas de Characters (aninhadas)
2. Documentar todas as rotas de Items
3. Documentar todas as rotas de Abilities
4. Documentar todas as rotas de Creatures
5. Completar documentação de Sessions
6. Completar documentação de Dice
7. Completar documentação de Chat
8. Completar documentação de Moments
9. Completar documentação de Origins
10. Documentar ThreatTemplates
11. Documentar Inventory

## 📝 Notas

- Swagger UI disponível em `/api-docs` (apenas em desenvolvimento)
- Todas as rotas requerem autenticação Bearer Token
- Schemas estão centralizados em `swagger-schemas.ts`
- Documentação usa OpenAPI 3.0.0


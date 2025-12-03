# Sistema Ordem Paranormal RPG - Especificação Técnica

## 📋 Visão Geral

Este documento detalha a implementação do sistema Ordem Paranormal RPG no projeto Let's Roll, incluindo estrutura de dados, cálculos e mecânicas.

---

## 🎯 Atributos Básicos

### Estrutura de Atributos

O sistema utiliza **5 atributos básicos**:

1. **Agilidade (AGI)** - Coordenação motora, reflexos, precisão
2. **Força (FOR)** - Potência muscular e proeza atlética
3. **Intelecto (INT)** - Capacidade de raciocínio, memória e conhecimento
4. **Presença (PRE)** - Força de personalidade, resiliência mental e carisma
5. **Vigor (VIG)** - Saúde e resistência física

### Valores e Mecânica

- **Valor inicial**: Todos começam em 0 (médio humano)
- **Distribuição inicial**: 2 pontos para distribuir na criação
- **Limite inicial**: +2 é o máximo na criação
- **Limite absoluto**: 20 (valor muito acima do humano comum)
- **Valores negativos**: Permitidos (podem reduzir um atributo para -1 para ganhar ponto extra)

### Efeitos nos Dados

- **Atributo positivo**: Rola com vantagem
  - Ex: Força +2 = rola 3d20 (1 básico + 2 extras), usa o maior
- **Atributo zero**: Rolada básica (1d20 normal)
  - Se for 0 exato, aplica desvantagem mínima: rola 2d20 e usa o menor
- **Atributo negativo**: Rola com desvantagem
  - Ex: Força -1 = rola 3d20 e usa o pior (1 básico + 2 extras pela desvantagem)
  - A cada ponto negativo, aumenta um dado de desvantagem

---

## 📚 Perícias

### Estrutura de Perícias

Cada perícia está associada a um atributo base e possui níveis de treinamento:

- **Destreinado**: +0 (padrão)
- **Treinado**: +5
- **Competente**: +10 (sistema completo)
- **Expert**: +15 (sistema completo)

### Lista Completa de Perícias

#### Baseadas em Agilidade (AGI)
- **Atletismo** (FOR) - correr, saltar, escalar, nadar (penalidade se sobrecarregado)
- **Acrobacia** (AGI) - manobras de equilíbrio, rolamentos (penalidade se sobrecarregado)
- **Furtividade** (AGI) - furtar-se aos sentidos, camuflagem (penalidade de carga)
- **Reflexos** (AGI) - esquivas e reações rápidas (penalidade de carga)
- **Pilotagem** (AGI) - conduzir veículos (requer treinamento)
- **Iniciativa** (AGI) - velocidade de reação em combate
- **Crime** (AGI) - habilidades criminosas práticas (requer treinamento, penalidade de carga)
- **Prestidigitação** (AGI) - truques de mão (requer treinamento)

#### Baseadas em Força (FOR)
- **Luta** (FOR) - combate desarmado ou com armas brancas

#### Baseadas em Vigor (VIG)
- **Fortitude** (VIG) - vigor físico para resistir a venenos, doenças, fadiga

#### Baseadas em Presença (PRE)
- **Intuição** (PRE) - sexto sentido, perceber intenções
- **Percepção** (PRE) - notar detalhes, escutar, observar
- **Diplomacia** (PRE) - negociar, convencer
- **Intimidação** (PRE) - coagir ou amedrontar
- **Enganação** (PRE) - blefar, disfarçar intenções
- **Vontade** (PRE) - resistência mental e emocional
- **Religião** (PRE) - conhecimento de religiões e cultos (requer treinamento)
- **Artes** (PRE) - talento artístico (requer treinamento)
- **Adestramento** (PRE) - lidar com animais (requer treinamento)

#### Baseadas em Intelecto (INT)
- **Ocultismo** (INT) - conhecimento do paranormal (requer treinamento)
- **Ciências** (INT) - conhecimento científico (requer treinamento)
- **Tecnologia** (INT) - conhecimento técnico/moderno (requer treinamento)
- **Medicina** (INT) - primeiros socorros, tratamento médico (requer treinamento)
- **Investigação** (INT) - investigar cenas, buscar pistas
- **Atualidades** (INT) - conhecimentos gerais, cultura
- **Tática** (INT) - estratégia de combate (requer treinamento)
- **Sobrevivência** (INT) - técnicas de sobrevivência
- **Profissão** (INT) - ofício especializado (requer treinamento, especificar área)

### Mecânica de Testes de Perícia

1. **Declaração da Ação**: Jogador descreve o que tenta fazer
2. **Escolha da Perícia**: Mestre decide perícia, atributo e DT
3. **Modificadores**: Aplica bônus/penalidades
4. **Rolagem**: 
   - Número de d20 = 1 + valor do atributo base
   - Se positivo: usa maior resultado
   - Se negativo: usa menor resultado
5. **Bônus de Perícia**: Adiciona modificador de treinamento (+0, +5, +10, +15)
6. **Comparação**: Total (dado + bônus) vs DT

### Perícias "Somente Treinadas"

Algumas perícias exigem treinamento para uso:
- Sem treinamento = não pode tentar o teste
- Marcadas com (*) na lista acima

### Penalidade de Carga

Perícias marcadas com (⛧) sofrem penalidade se personagem estiver sobrecarregado:
- Aplica-se penalidade de carga ao resultado do teste

---

## 💪 Recursos do Personagem

### Pontos de Vida (PV)

**Representam**: Saúde física e vitalidade

**Cálculo por Classe**:
- **Combatente**: 
  - Inicial: 20 + VIG
  - Por NEX: +4 PV + VIG
- **Especialista**: 
  - Inicial: 16 + VIG
  - Por NEX: +3 PV + VIG
- **Ocultista**: 
  - Inicial: 12 + VIG
  - Por NEX: +2 PV + VIG

**Estados**:
- **Machucado**: ≤ 50% dos PV totais (alerta narrativo)
- **Morrendo**: 0 PV
  - Fica inconsciente e sangrando
  - 3 rodadas para receber socorro (primeira vez)
  - Cada queda adicional reduz tempo: 2ª vez = 2 rodadas, 3ª vez = 1 rodada, 4ª vez = morte instantânea
  - Teste de Fortitude DT 15 a cada turno para estabilizar

### Sanidade (SAN)

**Representam**: Estabilidade mental e resistência a traumas

**Valores Iniciais por Classe**:
- **Combatente**: ~12
- **Especialista**: 16
- **Ocultista**: 20

**Mecânica de Perda**:
- Teste de Sanidade (geralmente Vontade/Presença)
- Falha = perde SAN conforme gravidade do trauma
- Casos leves: perda direta pequena
- Casos severos: perda grande + efeitos de perturbação

**Estados de Insanidade**:
1. **Perturbado**: Abalado mentalmente, efeitos temporários até fim da cena
2. **Enlouquecido**: Efeitos duram até fim da missão, age irracionalmente
3. **Insano (0 SAN)**: Perda permanente do personagem (controlado pelo Mestre)

### Pontos de Esforço (PE)

**Representam**: Energia para habilidades especiais, poderes e rituais

**Cálculo por Classe**:
- **Combatente**: 
  - Inicial: 2 + PRE
  - Por NEX: +2 PE + PRE
- **Especialista**: 
  - Inicial: 3 + PRE
  - Por NEX: +3 PE + PRE
- **Ocultista**: 
  - Inicial: 4 + PRE
  - Por NEX: +4 PE + PRE

**Recuperação**:
- Descanso prolongado: 1 PE por ponto de NEX
- Ex: NEX 10% = recupera ~10 PE

### Nível de Exposição (NEX)

**Representa**: Experiência e progresso do agente

**Escala**: 5% (inicial) até 99% (máximo)

**Ganhos por NEX**:
- **Atributos**: Pontos extras para aumentar atributos
- **Recursos**: Aumentam PV, SAN e PE máximos conforme classe
- **Habilidades**: Desbloqueia habilidades de Classe/Trilha em marcos (5%, 10%, 15%, etc.)
- **Afinidade Paranormal (50%)**: 
  - Conexão com Entidade do Outro Lado
  - Afinidade a um Elemento paranormal
  - Pode realizar Rituais do elemento sem ingredientes
  - Gasta menos ações para conjurar
  - Pode desenvolver Poder Paranormal

---

## ⚔️ Combate

### Estrutura de Turnos

- **1 Ação Padrão**: ataque, ritual, usar item
- **1 Ação de Movimento**: deslocar-se, interação simples
- **Ações Livres**: falar, soltar objeto (não gastam ação)
- **Reações (1 por rodada)**: ações fora do turno (esquivar, aparar)

**Permissões**:
- Trocar ação padrão por segunda ação de movimento (corrida)

### Teste de Ataque

**Mecânica**:
- Usa perícia apropriada: Luta (corpo-a-corpo) ou Pontaria (distância)
- Rola d20 + dados extras conforme atributo base
- Adiciona bônus de perícia de ataque
- Compara com Defesa do alvo

**Defesa**:
- Base: 10 + Agilidade
- + bônus de equipamentos ou cobertura

**Esquiva e Bloqueio**:
- **Esquivar**: Reação que soma bônus de Reflexos à Defesa contra aquele ataque
- **Bloquear/Parar**: Reação que reduz dano recebido em valor igual ao bônus de Luta

**Acertos Críticos**:
- 20 natural = acerto crítico
- Armas têm margem de ameaça e multiplicador (ex: 19-20/x3)
- Dano aumentado conforme multiplicador

### Dano

**Cálculo**:
- Dado base da arma (ex: pistola 1d10, faca 1d6)
- **Corpo-a-corpo**: + Força do atacante
- **Distância (armas de fogo)**: Sem atributo no dano
- **Arremessos**: Mestre pode tratar como corpo-a-corpo (+ Força)

**Crítico no Dano**:
- Multiplica dados base (ex: x2 = rola 2x e soma)
- Bônus fixos (como +Força) geralmente não multiplicam
- Ex: 1d8+3 crítico x2 = 2d8+3

**Tipos de Dano**:
- **Físico**: Reduz PV
- **Mental**: Reduz SAN
- **Energia/Elemental**: Reduz PV ou SAN conforme caso

---

## 🎭 Condições e Estados

### Lista de Condições

1. **Caído**: No chão
   - Ataques corpo-a-corpo: Defesa -5
   - Ataques à distância: Atirador -5
   - Levantar: ação de movimento ou teste Atletismo DT 20

2. **Desprevenido**: Surpresa ou guarda baixa
   - Não pode reagir
   - Defesa base 10 apenas (sem Agilidade)
   - -5 Defesa e -2D em Reflexos

3. **Atordoado**: Paralisado de choque
   - Não pode realizar ações ou reações
   - Considerado Desprevenido
   - Dura 1 rodada ou até ser ajudado

4. **Inconsciente**: Apagado, sem sentidos
   - Indefeso - ataques acertam automaticamente
   - Pode ser golpe de misericórdia
   - Não pode agir até voltar à consciência

5. **Morrendo**: 0 PV
   - Inconsciente e sangrando
   - 3 rodadas para socorro (primeira vez)
   - Teste Fortitude DT 15 por turno para estabilizar

6. **Abalado**: Mentalmente abalado
   - -1 dado em todos os testes
   - Se ficar Abalado de novo → Apavorado

7. **Apavorado**: Medo intenso
   - -2 dados em todos os testes
   - Não pode se aproximar da fonte do medo
   - Deve fugir se possível

8. **Perturbado/Enlouquecendo**: Sanidade baixa
   - Efeito de insanidade temporária (tabela aleatória)
   - Perturbado: até fim da cena
   - Enlouquecido: até fim da missão
   - Penalidades em testes (ex: -2D em Intelecto/Presença)

9. **Lento**: Velocidade reduzida pela metade
   - Não pode correr nem fazer investida

10. **Imóvel/Paralisado**: Não pode se mover
    - Paralisado completo = imóvel e indefeso
    - Apenas ações mentais possíveis

11. **Agarrado/Enredado**: Segurado ou enroscado
    - Imobilizado em movimentação
    - -1D em ataques
    - Ação padrão + teste oposto (Luta/Acrobacia) para se soltar
    - 50% chance de ataque atingir quem agarra

12. **Cego**: Não consegue ver
    - -2D em testes de visão (Percepção)
    - -2D em testes baseados em AGI/FOR
    - Camuflagem total contra ele em corpo-a-corpo

13. **Surdo**: Não consegue ouvir
    - Penaliza Percepção para ouvir
    - -2D em Iniciativa
    - Conjurar rituais: +5 DT

14. **Enjoado/Náusea**: Doente ou nojo extremo
    - Apenas 1 ação por turno (padrão OU movimento)
    - Pode impor -1D em alguns testes

15. **Doente/Envenenado**: Aflição contínua
    - Dano recorrente por rodada (ex: -1d12 PV)
    - Outras condições (fraco, enjoado)
    - Dura pelo tempo especificado

16. **Fraco/Debilitado**: Redução de força física
    - Fraco: -1D em testes de AGI/FOR/VIG
    - Debilitado: -2D em testes físicos
    - Se ficar Debilitado de novo → Inconsciente

17. **Esmorecido/Frustrado**: Redução mental
    - Frustrado: -1D em testes de INT/PRE
    - Esmorecido: -2D em testes mentais

18. **Exausto/Fadigado**: Cansaço extremo
    - Fatigado: fraco e vulnerável, não pode correr
    - Exausto: Debilitado + Lento

19. **Sangrando**: Ferimento sério
    - Perde PV por turno (ex: 1d6)
    - Teste Fortitude DT 15 por turno para estancar
    - Falhar = perde PV e continua sangrando

20. **Em Chamas**: Em fogo
    - 1d6 dano de fogo por turno
    - Ação padrão para apagar (rolar no chão, água)

21. **Fascinado**: Atenção presa
    - Não pode realizar ações além de observar
    - -2D em Percepção contra outras coisas
    - Termina se sofrer ataque ou empurrão

22. **Indefeso**: Inconsciente + Paralisado
    - Falha automaticamente em Reflexos
    - Não pode reagir
    - Alvo de golpe de misericórdia

---

## 🔮 Rituais Paranormais

### Estrutura

**Aprendizado**:
- Limitado principalmente por Intelecto
- Ocultista começa com 2-3 rituais do círculo 1
- Pode aprender mais conforme INT e NEX sobem

**Círculos**:
- **1º Círculo**: Básicos, rápidos, baixo custo
- **2º Círculo**: ~3 PE
- **3º Círculo**: ~6 PE
- **4º Círculo**: ~10 PE

**Custo**:
- **PE**: Consome conforme círculo
- **SAN**: Alguns rituais macabros ou Poderes Paranormais podem custar SAN
- **Poderes Paranormais**: Custo único em SAN Máxima permanente

**Tempo de Conjuração**:
- Normalmente: Ação Padrão
- Rituais complexos: Ação completa ou vários turnos
- Com Afinidade (50% NEX): Menos ações para rituais do elemento

**Concentração**:
- Efeitos contínuos exigem concentração
- Dano ou distração pode forçar teste de Vontade
- Falhar = ritual interrompido

**Ingredientes**:
- Muitos rituais exigem ingredientes materiais
- Com Afinidade (50% NEX): Pode conjurar rituais do elemento sem ingredientes

**Teste de Ritual**:
- Geralmente não exige teste (custo de PE e tempo já são o custo)
- Teste de Ocultismo em condições estressantes
- Testes opostos: Ocultismo do conjurador vs Vontade do alvo

### Poderes Paranormais

**Adquirir**:
- Transcender certos limites de NEX
- Custo: Sanidade Máxima permanente
- Ex: -2 SAN máxima para Telepatia

**Aprimorar**:
- Gastar novamente SAN para aumentar efeito
- Requer afinidade com elemento do poder
- Obter o poder de novo

---

## 📊 Estrutura de Dados

### Schema do Banco de Dados

```sql
-- Atributos do personagem
attributes JSONB {
  agi: number,  -- Agilidade
  for: number,  -- Força
  int: number,  -- Intelecto
  pre: number,  -- Presença
  vig: number   -- Vigor
}

-- Recursos do personagem
stats JSONB {
  pv: {
    current: number,
    max: number
  },
  san: {
    current: number,
    max: number
  },
  pe: {
    current: number,
    max: number
  },
  nex: number  -- Nível de Exposição (0-99)
}

-- Perícias do personagem
skills JSONB {
  [skillName]: {
    attribute: 'AGI' | 'FOR' | 'INT' | 'PRE' | 'VIG',
    training: 'UNTRAINED' | 'TRAINED' | 'COMPETENT' | 'EXPERT',
    bonus: number  -- Calculado: training level * 5
  }
}

-- Condições ativas
conditions JSONB string[]  -- Array de nomes de condições

-- Classe e Trilha
class: 'COMBATENTE' | 'ESPECIALISTA' | 'OCULTISTA'
path: string  -- Nome da trilha

-- Afinidade Paranormal (50% NEX)
affinity: string | null  -- Elemento: 'SANGUE' | 'MORTE' | 'ENERGIA' | 'CONHECIMENTO' | 'MEDO'
```

---

## 🎲 Sistema de Rolagem

### Função de Rolagem de Atributo

```typescript
function rollAttributeTest(attribute: number, skillBonus: number): {
  dice: number[],      // Valores rolados
  result: number,     // Resultado final (maior/menor + bônus)
  total: number       // Total para comparação com DT
}
```

**Lógica**:
- Se `attribute > 0`: Rola `1 + attribute` d20, usa o maior
- Se `attribute === 0`: Rola 2d20, usa o menor (desvantagem mínima)
- Se `attribute < 0`: Rola `1 + Math.abs(attribute)` d20, usa o menor
- Adiciona `skillBonus` ao resultado
- Retorna total para comparação com DT

### Função de Rolagem de Ataque

```typescript
function rollAttack(attribute: number, skillBonus: number, targetDefense: number): {
  dice: number[],
  result: number,
  hit: boolean,
  critical: boolean
}
```

**Lógica**:
- Similar à rolagem de atributo
- Compara com Defesa do alvo
- Verifica se 20 natural (crítico)
- Retorna se acertou e se foi crítico

### Função de Cálculo de Dano

```typescript
function calculateDamage(weaponDice: string, attribute: number, isMelee: boolean, isCritical: boolean, multiplier: number): {
  dice: number[],
  total: number
}
```

**Lógica**:
- Rola dados da arma
- Se corpo-a-corpo: adiciona Força
- Se crítico: multiplica dados base (não bônus fixos)
- Retorna total de dano

---

## 📝 Próximos Passos de Implementação

1. **Atualizar Schema do Banco**
   - Adicionar campos para atributos, recursos, perícias, condições
   - Criar tabela de perícias (se necessário)
   - Criar tabela de rituais (se necessário)

2. **Criar Serviços de Cálculo**
   - `calculatePV()` - Calcula PV baseado em classe, VIG e NEX
   - `calculateSAN()` - Calcula SAN baseado em classe e NEX
   - `calculatePE()` - Calcula PE baseado em classe, PRE e NEX
   - `rollAttributeTest()` - Rolagem de teste de atributo
   - `rollAttack()` - Rolagem de ataque
   - `calculateDamage()` - Cálculo de dano

3. **Atualizar Character Service**
   - Métodos para atualizar atributos
   - Métodos para atualizar perícias
   - Métodos para aplicar/remover condições
   - Métodos para calcular recursos

4. **Criar Componentes Frontend**
   - AttributesGrid - Grid de atributos editáveis
   - SkillsGrid - Grid de perícias com treinamento
   - ResourcesPanel - PV, SAN, PE, NEX
   - ConditionsPanel - Lista de condições ativas
   - DiceRoller - Rolador de dados com lógica do sistema

5. **Criar Página de Ficha Completa**
   - CharacterSheet com todas as seções
   - Cálculos automáticos
   - Rolagens integradas

---

**Data de Criação**: Dezembro 2024


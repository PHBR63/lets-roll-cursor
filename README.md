# Let's Roll - Plataforma de RPG de Mesa

Plataforma web completa para jogar RPG de mesa online, onde mestres têm controle total sobre rolagens, criaturas, itens e habilidades.

## 🎮 Características

- Múltiplas campanhas simultâneas
- Controle total do mestre sobre todos os aspectos do jogo
- Interface moderna e minimalista com tema dark game
- Sistema de rolagem de dados integrado
- Chat em tempo real
- Fichas de personagem completas
- Bestiário e gerenciamento de itens/habilidades

## 🚀 Tecnologias

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Banco de Dados:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Setup

1. Clone o repositório

2. Instale as dependências:

```bash
# Instalar tudo de uma vez
npm run install:all

# Ou individualmente
cd frontend && npm install
cd ../backend && npm install
```

3. Configure as variáveis de ambiente:

**Frontend (letsroll/frontend/.env):**
```
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_API_URL=http://localhost:3001
```

**Backend (letsroll/backend/.env):**
```
SUPABASE_URL=sua_url_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

4. Execute as migrations do Supabase:
   - Acesse o dashboard do Supabase
   - Vá em SQL Editor
   - Execute os arquivos na seguinte ordem:
     1. `supabase/migrations/20241201000000_initial_schema.sql`
     2. `supabase/migrations/20241202000000_add_updated_at_to_campaign_moments.sql`
     3. `supabase/migrations/20241203000000_add_ordem_paranormal_fields.sql`
   - Para mais detalhes, consulte `supabase/migrations/README.md`

5. Inicie os servidores:

```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou individualmente:
npm run dev:frontend  # Frontend na porta 5173
npm run dev:backend   # Backend na porta 3001
```

## 📁 Estrutura do Projeto

```
letsroll/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── context/     # Contextos React
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilitários
│   │   └── styles/      # Estilos globais
│   └── ...
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Lógica de negócio
│   │   ├── middleware/  # Middlewares
│   │   └── config/      # Configurações
│   └── ...
├── supabase/          # Migrations do Supabase
│   └── migrations/
└── shared/            # Código compartilhado (futuro)
```

## 🎨 Design System

O projeto segue uma paleta de cores dark game:
- Background: `#1A0033` (roxo escuro)
- Cards: `#2A2A3A` (cinza escuro)
- Acentos: `#8000FF` (roxo vibrante)
- Barras: Vermelho (Vida), Verde (Energia), Amarelo (Saúde), Roxo (XP)

## 📝 Funcionalidades Implementadas

### ✅ Frontend
- [x] Estrutura inicial com Vite + React + TypeScript
- [x] Tailwind CSS com tema dark customizado
- [x] Componentes UI base (shadcn/ui)
- [x] Sistema de autenticação
- [x] Landing page
- [x] Páginas de Login/Registro
- [x] Dashboard com lista de campanhas
- [x] Navbar e Footer
- [x] Cards de campanha

### ✅ Backend
- [x] Estrutura inicial com Express + TypeScript
- [x] Configuração do Supabase
- [x] Middleware de autenticação
- [x] Rotas para CRUD (campanhas, personagens, criaturas, itens, habilidades, sessões, dados, inventário, momentos)
- [x] Serviços de negócio (estrutura básica)

### ✅ Banco de Dados
- [x] Schema completo no Supabase
- [x] Migrations criadas
- [x] Row Level Security (RLS) básico

### 🚧 Em Desenvolvimento
- [ ] Wizard de criação de campanha (3 etapas)
- [ ] Detalhes da campanha
- [ ] Sala de sessão de jogo
- [ ] Painel do mestre
- [ ] Ficha de personagem completa
- [ ] Sistema de rolagem de dados
- [ ] Chat em tempo real
- [ ] Modal de equipamentos
- [ ] Momentos da campanha (stories)

## 🔐 Autenticação

A autenticação é gerenciada pelo Supabase Auth. Os tokens JWT são enviados nas requisições ao backend através do header `Authorization: Bearer <token>`.

## 📚 Documentação Adicional

Consulte o arquivo `cria-o-projeto-let-s-roll.plan.md` (se disponível) para detalhes completos da arquitetura e funcionalidades planejadas.

## 🤝 Contribuindo

Este projeto está em desenvolvimento ativo. Sinta-se livre para contribuir!

## 📄 Licença

[MIT]

# 🔄 Reorganização para Deploy no Vercel

Este documento descreve a reorganização da estrutura de pastas para otimizar o deploy no Vercel.

## 📁 Estrutura Atual vs Recomendada

### Estrutura Atual
```
letsroll/
├── frontend/          # Projeto React/Vite
│   ├── src/
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.ts
├── backend/          # Projeto Express
│   ├── src/
│   └── package.json
├── supabase/         # Migrations
├── vercel.json       # Config raiz (pode conflitar)
└── package.json      # Workspace root
```

### Estrutura Recomendada para Vercel
```
letsroll/
├── frontend/          # Projeto React/Vite (deploy no Vercel)
│   ├── src/
│   ├── package.json
│   ├── vercel.json   # Config específica do frontend
│   └── vite.config.ts
├── backend/          # Projeto Express (deploy separado)
│   ├── src/
│   └── package.json
├── supabase/         # Migrations
└── package.json      # Workspace root
```

## 🎯 Mudanças Necessárias

### 1. Remover `vercel.json` da Raiz

O `vercel.json` na raiz pode conflitar com o do frontend. O Vercel detecta automaticamente projetos Vite quando o `vercel.json` está na pasta do projeto.

### 2. Ajustar `frontend/vercel.json`

O `vercel.json` do frontend deve estar otimizado para o Vercel detectar automaticamente.

### 3. Garantir que Caminhos Relativos Funcionem

Todos os imports usam `@/` que já está configurado corretamente no `vite.config.ts` e `tsconfig.json`.

## ✅ Checklist de Reorganização

- [x] Estrutura de pastas já está adequada
- [ ] Remover `vercel.json` da raiz (se conflitar)
- [ ] Ajustar `frontend/vercel.json` para detecção automática
- [ ] Verificar que todos os caminhos estão corretos
- [ ] Atualizar documentação

## 📝 Notas

- O Vercel detecta automaticamente projetos Vite quando encontra `vite.config.ts`
- O `vercel.json` no frontend é opcional, mas ajuda a configurar
- O backend será deployado separadamente (Railway/Render)


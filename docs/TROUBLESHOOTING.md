# 🔧 Troubleshooting - Let's Roll

## Erros Comuns e Soluções

### 1. Erro: `module is not defined` em arquivos vendor

**Sintoma:**
```
Uncaught ReferenceError: module is not defined
    at ui-vendor-*.js:1
```

**Causa:**
Algumas dependências estão usando CommonJS (`require`, `module.exports`) em um contexto de ES modules.

**Solução:**
✅ **Corrigido** - Atualizamos:
- `tailwind.config.ts` para usar `import` ao invés de `require`
- `vite.config.ts` para incluir `tailwindcss-animate` no `commonjsOptions` e `optimizeDeps`

**Se o erro persistir:**
1. Limpe o cache do Vite:
   ```bash
   rm -rf frontend/node_modules/.vite
   rm -rf frontend/dist
   ```
2. Reinstale as dependências:
   ```bash
   cd frontend
   npm install
   ```
3. Rebuild o projeto:
   ```bash
   npm run build
   ```

---

### 2. Erro: `MediaSession: 'enterpictureinpicture' is not a valid enum value`

**Sintoma:**
```
Uncaught TypeError: Failed to execute 'setActionHandler' on 'MediaSession': 
The provided value 'enterpictureinpicture' is not a valid enum value of type MediaSessionAction.
    at autoPip.js:33:24
```

**Causa:**
Este erro **NÃO é do nosso código**. É causado por:
- Extensões do navegador (ex: extensões de Picture-in-Picture)
- Bibliotecas de terceiros que tentam usar APIs experimentais do navegador
- O valor `'enterpictureinpicture'` não é um valor válido da API MediaSession

**Solução:**
Este erro pode ser ignorado com segurança, pois não afeta o funcionamento da aplicação. Se quiser suprimir o erro:

1. **Opção 1: Ignorar no console** (recomendado)
   - O erro não afeta a funcionalidade
   - É causado por extensões do navegador ou bibliotecas externas

2. **Opção 2: Adicionar tratamento de erro global** (se necessário)
   ```typescript
   // frontend/src/main.tsx
   window.addEventListener('error', (event) => {
     // Suprimir erros de MediaSession relacionados a autoPip
     if (event.message?.includes('MediaSession') && event.message?.includes('enterpictureinpicture')) {
       event.preventDefault()
       return false
     }
   })
   ```

**Nota:** Este erro geralmente aparece quando há extensões do navegador instaladas que tentam usar APIs experimentais.

---

### 3. Problemas de Build com CommonJS/ES Modules

**Sintoma:**
- Erros de `require is not defined`
- Erros de `module.exports is not defined`
- Erros de `__dirname is not defined`

**Solução:**
1. Verifique se todos os arquivos `.ts`/`.tsx` usam `import`/`export` ao invés de `require`/`module.exports`
2. Certifique-se de que `package.json` tem `"type": "module"`
3. Atualize o `vite.config.ts` para incluir dependências problemáticas em `commonjsOptions`

---

### 4. Problemas com react-window

**Sintoma:**
- Erros de compatibilidade com react-window v2
- Componentes de virtualização não funcionam

**Status Atual:**
⚠️ **Temporariamente desabilitado** - A virtualização foi removida temporariamente devido a problemas de compatibilidade com react-window v2.

**Solução Temporária:**
Os componentes (`ChatPanel`, `RollHistory`) usam renderização normal ao invés de virtualização. Isso funciona bem para listas pequenas/médias.

**Solução Futura:**
Quando a API do react-window v2 estiver estável, reimplementar a virtualização.

---

### 5. Problemas de Cache do Vite

**Sintoma:**
- Mudanças não aparecem após rebuild
- Erros estranhos que desaparecem após limpar cache

**Solução:**
```bash
# Limpar cache do Vite
rm -rf frontend/node_modules/.vite
rm -rf frontend/dist

# Reinstalar dependências (se necessário)
cd frontend
rm -rf node_modules
npm install

# Rebuild
npm run build
```

---

### 6. Problemas com Workspace (Monorepo)

**Sintoma:**
- Erros de resolução de módulos
- Versões conflitantes do React

**Solução:**
1. Instale dependências na raiz:
   ```bash
   npm install
   ```
2. Instale dependências em cada workspace:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Verifique se o `vite.config.ts` tem as configurações corretas de `dedupe` e `alias`

---

## Comandos Úteis

### Limpar tudo e reinstalar
```bash
# Na raiz do projeto
rm -rf node_modules frontend/node_modules backend/node_modules
rm -rf frontend/dist frontend/node_modules/.vite
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Verificar problemas de build
```bash
cd frontend
npm run build
# Verificar se há erros no console
```

### Analisar bundle
```bash
cd frontend
npm run build:analyze
# Abrir dist/stats.html no navegador
```

---

## Contato

Se os problemas persistirem, verifique:
1. Versões do Node.js (recomendado: 18+)
2. Versões do npm (recomendado: 9+)
3. Logs do console do navegador
4. Logs do servidor de desenvolvimento

---

**Última Atualização:** Dezembro 2024

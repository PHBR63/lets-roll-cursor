# Testes E2E com Playwright

Este diretório contém os testes end-to-end (E2E) do projeto Let's Roll usando Playwright.

## Configuração

Os testes E2E estão configurados no arquivo `playwright.config.ts` na raiz do projeto.

## Executando os Testes

### Executar todos os testes
```bash
npm run test:e2e
```

### Executar com interface gráfica
```bash
npm run test:e2e:ui
```

### Executar em modo headed (com navegador visível)
```bash
npm run test:e2e:headed
```

### Executar em modo debug
```bash
npm run test:e2e:debug
```

## Estrutura dos Testes

- `auth.spec.ts` - Testes de autenticação (login, registro, validações)
- `campaign.spec.ts` - Testes de criação e gerenciamento de campanhas
- `character.spec.ts` - Testes de criação e gerenciamento de personagens
- `dice.spec.ts` - Testes de rolagem de dados

## Notas Importantes

⚠️ **Os testes atualmente requerem:**
- Servidor de desenvolvimento rodando (`npm run dev`)
- Banco de dados configurado
- Autenticação manual (ou implementar helpers de autenticação)

## Próximos Passos

1. Implementar helpers de autenticação para testes
2. Criar fixtures para dados de teste
3. Adicionar testes de integração com backend
4. Configurar CI/CD para executar testes automaticamente


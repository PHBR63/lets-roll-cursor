# Guia de Contribuição

Obrigado por considerar contribuir com o Let's Roll! 🎲

## Como Contribuir

### Reportando Bugs

- Use o template de [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- Inclua passos para reproduzir
- Adicione screenshots se possível

### Sugerindo Funcionalidades

- Use o template de [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- Explique o problema que resolve
- Descreva a solução proposta

### Pull Requests

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFuncionalidade'`)
4. Push para a branch (`git push origin feature/MinhaFuncionalidade`)
5. Abra um Pull Request

## Padrões de Código

### TypeScript

- Use TypeScript estrito
- Evite `any` - use tipos específicos
- Comente funções complexas em PT-BR

### Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### Estrutura de Arquivos

```
frontend/src/
  components/  # Componentes React
  pages/       # Páginas
  hooks/       # Custom hooks
  types/       # Tipos TypeScript
  utils/       # Utilitários
```

## Processo de Review

1. PRs precisam de pelo menos 1 aprovação
2. Todos os checks devem passar
3. Código deve seguir os padrões
4. Testes devem estar atualizados

## Dúvidas?

Abra uma issue ou entre em contato!


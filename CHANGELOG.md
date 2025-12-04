# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Sistema de habilidades de classe automáticas por NEX
- Cache Redis para melhor performance
- Documentação Swagger da API
- Testes E2E com Playwright
- Testes unitários para serviços refatorados
- CI/CD com GitHub Actions
- CodeQL para análise de segurança
- Dependabot para atualizações automáticas

### Melhorado
- Refatoração do characterService em módulos menores
- Refatoração do DiceRoller em componentes menores
- Refatoração do GameBoard em módulos
- Remoção de tipos `any` (type safety)
- Otimizações React (memo, useMemo, useCallback)
- Melhorias estéticas (cores, padrão de icosaedros)

## [1.0.0] - 2024-12-05

### Adicionado
- Sistema de autenticação com Supabase
- Criação e gerenciamento de campanhas
- Sistema de personagens completo
- Mesa de jogo com board interativo
- Chat em tempo real
- Sistema de rolagem de dados
- Painel do mestre
- Histórico de rolagens
- Lista de jogadores com presença
- Sistema de condições e recursos (PV, SAN, PE, NEX)
- Suporte ao sistema Ordem Paranormal RPG

[Unreleased]: https://github.com/PHBR63/lets-roll-cursor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/PHBR63/lets-roll-cursor/releases/tag/v1.0.0


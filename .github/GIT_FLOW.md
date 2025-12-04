# Git Flow

## Branches

- `main` - Produção (protegida)
- `develop` - Desenvolvimento
- `feature/*` - Novas funcionalidades
- `bugfix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes

## Workflow

### Nova Funcionalidade

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-funcionalidade

# Desenvolver...
git commit -m "feat: Adiciona funcionalidade X"
git push origin feature/nome-da-funcionalidade

# Criar PR para develop
```

### Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-hotfix

# Corrigir...
git commit -m "fix: Corrige problema crítico"
git push origin hotfix/nome-do-hotfix

# Criar PR para main E develop
```

## Tags

Versões seguem [Semantic Versioning](https://semver.org/):

- `v1.0.0` - Major.Minor.Patch


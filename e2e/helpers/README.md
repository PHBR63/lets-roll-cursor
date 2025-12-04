# Helpers de Testes E2E

Este diretório contém helpers reutilizáveis para testes E2E.

## AuthHelper

Helper para gerenciar autenticação em testes.

### Uso

```typescript
import { test } from '../fixtures'

test('exemplo com autenticação', async ({ auth, testData }) => {
  // Fazer login
  await auth.login(testData.testUsers.master.email, testData.testUsers.master.password)
  
  // Verificar se está autenticado
  const isAuth = await auth.isAuthenticated()
  
  // Fazer logout
  await auth.logout()
  
  // Limpar autenticação
  await auth.clearAuth()
})
```

### Métodos

- `login(email, password)` - Faz login com credenciais
- `register(userData)` - Registra novo usuário
- `logout()` - Faz logout
- `isAuthenticated()` - Verifica se está autenticado
- `clearAuth()` - Limpa autenticação (localStorage e cookies)


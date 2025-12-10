# Serviços de API

## Serviço Centralizado (`api.ts`)

O serviço `api.ts` fornece uma interface centralizada para fazer requisições à API com tratamento robusto de erros e retry automático.

### Características

- ✅ Retry automático com backoff exponencial
- ✅ Tratamento específico de rate limiting (429)
- ✅ Headers de autenticação automáticos
- ✅ Tratamento robusto de erros de rede
- ✅ Respeita headers `Retry-After` do servidor

### Uso Básico

```typescript
import { api } from '@/services/api'

// GET
const campaigns = await api.get<Campaign[]>('/api/campaigns')

// POST
const newCampaign = await api.post<Campaign>('/api/campaigns', {
  name: 'Nova Campanha',
  description: 'Descrição...'
})

// PUT
const updated = await api.put<Campaign>(`/api/campaigns/${id}`, {
  name: 'Nome Atualizado'
})

// DELETE
await api.delete(`/api/campaigns/${id}`)
```

### Opções de Retry

```typescript
// Customizar retry
const data = await api.get<Campaign[]>('/api/campaigns', {
  retry: {
    maxRetries: 5,        // Máximo de 5 tentativas
    baseDelay: 2000,      // Delay base de 2 segundos
    maxDelay: 60000,      // Delay máximo de 60 segundos
    exponentialBackoff: true // Usar backoff exponencial
  }
})
```

### Tratamento de Erros

```typescript
import { api, ApiError } from '@/services/api'

try {
  const campaigns = await api.get<Campaign[]>('/api/campaigns')
  // Usar campaigns.data
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status)
    console.error('Mensagem:', error.message)
    
    if (error.status === 429) {
      console.log('Retry após:', error.retryAfter, 'segundos')
    }
  }
}
```

### Integração com Hooks

```typescript
import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { useApiError } from '@/hooks/useApiError'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { handleErrorWithToast } = useApiError()

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const response = await api.get('/api/campaigns')
        setData(response.data)
      } catch (error) {
        handleErrorWithToast(error, 'Erro ao carregar campanhas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ...
}
```

## Hooks de Erro e Retry

### `useApiError`

Hook para tratamento centralizado de erros da API.

```typescript
import { useApiError } from '@/hooks/useApiError'

const { handleErrorWithToast, handleResponseError } = useApiError()

// Tratar erro genérico
handleErrorWithToast(error, 'Erro ao carregar dados')

// Tratar erro de resposta HTTP
await handleResponseError(response, 'Erro ao criar recurso')
```

### `useRetry`

Hook para retry automático com backoff exponencial.

```typescript
import { useRetry } from '@/hooks/useRetry'

const loadData = async () => {
  const response = await fetch('/api/campaigns')
  if (!response.ok) throw new Error('Failed')
  return response.json()
}

const { execute, loading, error, retryCount, nextRetryDelay } = useRetry(loadData, {
  maxRetries: 3,
  baseDelay: 1000,
  exponentialBackoff: true,
  retryableStatuses: [429, 500, 502, 503, 504]
})

// Executar
await execute()
```

## Migração de Código Existente

### Antes (fetch direto)

```typescript
const response = await fetch(`${apiUrl}/api/campaigns`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
if (!response.ok) {
  throw new Error('Failed')
}
const data = await response.json()
```

### Depois (serviço api)

```typescript
const response = await api.get<Campaign[]>('/api/campaigns')
const data = response.data
```

### Benefícios

- ✅ Menos código boilerplate
- ✅ Retry automático em caso de falha
- ✅ Tratamento robusto de rate limiting
- ✅ Headers de autenticação automáticos
- ✅ Logs detalhados no backend


# Scripts de Utilidade

## check-database.ts

Script completo para checagem do banco de dados Supabase.

### O que verifica:

1. **Conexão**: Testa se a conexão com o Supabase está funcionando
2. **Tabelas**: Verifica se todas as tabelas necessárias existem
3. **Estrutura**: Verifica a estrutura das tabelas principais
4. **Storage**: Verifica se o bucket `campaign-images` existe e está configurado
5. **Dados**: Conta registros nas tabelas principais
6. **RLS**: Verifica se Row Level Security está configurado
7. **Índices**: Testa performance de queries
8. **Integridade**: Verifica integridade referencial básica

### Como usar:

```bash
# Com variáveis de ambiente do .env
npm run check-db

# Ou diretamente com tsx
tsx scripts/check-database.ts

# Com variáveis de ambiente inline
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run check-db
```

### Requisitos:

- Variáveis de ambiente configuradas:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Saída:

O script gera um relatório completo com:
- ✅ Sucessos (verde)
- ⚠️ Avisos (amarelo)
- ❌ Erros (vermelho)

### Exemplo de saída:

```
🔍 Iniciando checagem do banco de dados...

✅ Conexão com Supabase: Conexão estabelecida com sucesso
✅ Tabela: campaigns: Tabela existe e está acessível
✅ Tabela: characters: Tabela existe e está acessível
✅ Storage: Bucket campaign-images: Bucket existe
✅ Dados: campaigns: 5 registro(s) encontrado(s)

============================================================
RELATÓRIO FINAL
============================================================

✅ Sucessos: 15
⚠️  Avisos: 2
❌ Erros: 0
```


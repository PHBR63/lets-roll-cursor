/**
 * Script de checagem completa do banco de dados Supabase
 * Verifica conexão, tabelas, políticas RLS, storage, etc.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
]

let envLoaded = false
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath })
  if (!result.error && result.parsed) {
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  dotenv.config()
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
  console.error('\n📝 Como configurar:')
  console.error('1. Crie um arquivo .env na pasta backend/')
  console.error('2. Adicione as variáveis:')
  console.error('   SUPABASE_URL=https://seu-projeto.supabase.co')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key')
  console.error('\n💡 Dica: Use o arquivo .env.example como referência')
  console.error('   cp .env.example .env')
  console.error('\n🔍 Onde encontrar as chaves:')
  console.error('   - Acesse: https://supabase.com/dashboard')
  console.error('   - Vá em: Project Settings > API')
  console.error('   - Copie: URL e service_role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: unknown
}

const results: CheckResult[] = []

/**
 * Adiciona resultado da checagem
 */
function addResult(name: string, status: 'ok' | 'warning' | 'error', message: string, details?: unknown) {
  results.push({ name, status, message, details })
  const icon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '❌'
  console.log(`${icon} ${name}: ${message}`)
  if (details) {
    console.log(`   Detalhes:`, JSON.stringify(details, null, 2))
  }
}

/**
 * Verifica conexão com Supabase
 */
async function checkConnection() {
  try {
    const { data, error } = await supabase.from('campaigns').select('count').limit(0)
    if (error && error.code !== 'PGRST116') {
      // PGRST116 é "relation does not exist", que é esperado se a tabela não existe
      throw error
    }
    addResult('Conexão com Supabase', 'ok', 'Conexão estabelecida com sucesso')
  } catch (error) {
    addResult('Conexão com Supabase', 'error', 'Erro ao conectar: ' + (error as Error).message)
  }
}

/**
 * Verifica se as tabelas principais existem
 */
async function checkTables() {
  const requiredTables = [
    'campaigns',
    'campaign_participants',
    'characters',
    'sessions',
    'creatures',
    'items',
    'abilities',
    'dice_rolls',
    'chat_messages',
    'character_inventory',
    'character_abilities',
    'character_conditions',
    'character_resources',
    'character_attributes',
    'campaign_moments',
  ]

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          addResult(`Tabela: ${table}`, 'error', 'Tabela não existe')
        } else {
          addResult(`Tabela: ${table}`, 'warning', 'Erro ao acessar: ' + error.message)
        }
      } else {
        addResult(`Tabela: ${table}`, 'ok', 'Tabela existe e está acessível')
      }
    } catch (error) {
      addResult(`Tabela: ${table}`, 'error', 'Erro: ' + (error as Error).message)
    }
  }
}

/**
 * Verifica estrutura de algumas tabelas principais
 */
async function checkTableStructure() {
  const tablesToCheck = ['campaigns', 'characters', 'sessions']

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        addResult(`Estrutura: ${table}`, 'warning', 'Erro ao verificar estrutura: ' + error.message)
        continue
      }

      if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        addResult(`Estrutura: ${table}`, 'ok', `Tabela possui ${columns.length} colunas`, { columns })
      } else {
        addResult(`Estrutura: ${table}`, 'ok', 'Tabela existe mas está vazia')
      }
    } catch (error) {
      addResult(`Estrutura: ${table}`, 'error', 'Erro: ' + (error as Error).message)
    }
  }
}

/**
 * Verifica buckets de storage
 */
async function checkStorage() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      addResult('Storage: Listagem de buckets', 'error', 'Erro ao listar buckets: ' + error.message)
      return
    }

    const requiredBucket = 'campaign-images'
    const bucketExists = buckets?.some((b) => b.name === requiredBucket)

    if (bucketExists) {
      const bucket = buckets?.find((b) => b.name === requiredBucket)
      addResult('Storage: Bucket campaign-images', 'ok', 'Bucket existe', {
        public: bucket?.public,
        createdAt: bucket?.created_at,
      })

      // Verificar políticas do bucket
      try {
        const { data: files } = await supabase.storage.from(requiredBucket).list('', { limit: 1 })
        addResult('Storage: Acesso ao bucket', 'ok', 'Bucket está acessível')
      } catch (error) {
        addResult('Storage: Acesso ao bucket', 'warning', 'Erro ao acessar bucket: ' + (error as Error).message)
      }
    } else {
      addResult('Storage: Bucket campaign-images', 'warning', 'Bucket não encontrado. Configure no Supabase Dashboard.')
    }

    if (buckets && buckets.length > 0) {
      addResult('Storage: Total de buckets', 'ok', `${buckets.length} bucket(s) encontrado(s)`, {
        buckets: buckets.map((b) => ({ name: b.name, public: b.public })),
      })
    }
  } catch (error) {
    addResult('Storage', 'error', 'Erro ao verificar storage: ' + (error as Error).message)
  }
}

/**
 * Verifica se há dados nas tabelas principais
 */
async function checkData() {
  const tablesToCheck = ['campaigns', 'characters', 'sessions', 'users']

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })

      if (error) {
        if (error.code === 'PGRST116') {
          addResult(`Dados: ${table}`, 'warning', 'Tabela não existe')
        } else {
          addResult(`Dados: ${table}`, 'warning', 'Erro ao contar: ' + error.message)
        }
      } else {
        addResult(`Dados: ${table}`, 'ok', `${count || 0} registro(s) encontrado(s)`)
      }
    } catch (error) {
      addResult(`Dados: ${table}`, 'error', 'Erro: ' + (error as Error).message)
    }
  }
}

/**
 * Verifica políticas RLS (Row Level Security)
 */
async function checkRLS() {
  try {
    // Verificar se RLS está habilitado nas tabelas principais
    const tablesToCheck = ['campaigns', 'characters', 'sessions']

    for (const table of tablesToCheck) {
      try {
        // Tentar fazer uma query sem autenticação para verificar RLS
        const { error } = await supabase.from(table).select('*').limit(1)

        if (error) {
          if (error.message.includes('permission denied') || error.message.includes('RLS')) {
            addResult(`RLS: ${table}`, 'ok', 'RLS está habilitado e funcionando')
          } else {
            addResult(`RLS: ${table}`, 'warning', 'Erro ao verificar RLS: ' + error.message)
          }
        } else {
          addResult(`RLS: ${table}`, 'warning', 'RLS pode não estar configurado corretamente (query sem auth funcionou)')
        }
      } catch (error) {
        addResult(`RLS: ${table}`, 'error', 'Erro: ' + (error as Error).message)
      }
    }
  } catch (error) {
    addResult('RLS', 'error', 'Erro ao verificar RLS: ' + (error as Error).message)
  }
}

/**
 * Verifica índices (através de performance de queries)
 */
async function checkIndexes() {
  try {
    // Verificar performance de queries comuns
    const startTime = Date.now()
    const { error } = await supabase.from('campaigns').select('id, name').limit(10)
    const queryTime = Date.now() - startTime

    if (error) {
      addResult('Índices: Performance', 'warning', 'Erro ao testar performance: ' + error.message)
    } else {
      if (queryTime < 100) {
        addResult('Índices: Performance', 'ok', `Query executada em ${queryTime}ms (boa performance)`)
      } else {
        addResult('Índices: Performance', 'warning', `Query executada em ${queryTime}ms (pode precisar de índices)`)
      }
    }
  } catch (error) {
    addResult('Índices', 'error', 'Erro: ' + (error as Error).message)
  }
}

/**
 * Verifica integridade referencial básica
 */
async function checkReferentialIntegrity() {
  try {
    // Verificar se há campanhas sem participantes
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .limit(10)

    if (campaignsError) {
      addResult('Integridade: Campanhas', 'warning', 'Erro ao verificar campanhas: ' + campaignsError.message)
      return
    }

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map((c) => c.id)
      const { data: participants, error: participantsError } = await supabase
        .from('campaign_participants')
        .select('campaign_id')
        .in('campaign_id', campaignIds)

      if (participantsError) {
        addResult('Integridade: Participantes', 'warning', 'Erro ao verificar participantes: ' + participantsError.message)
      } else {
        const campaignsWithParticipants = new Set(participants?.map((p) => p.campaign_id) || [])
        const orphanedCampaigns = campaignIds.filter((id) => !campaignsWithParticipants.has(id))

        if (orphanedCampaigns.length > 0) {
          addResult('Integridade: Campanhas órfãs', 'warning', `${orphanedCampaigns.length} campanha(s) sem participantes`)
        } else {
          addResult('Integridade: Campanhas', 'ok', 'Todas as campanhas verificadas têm participantes')
        }
      }
    } else {
      addResult('Integridade: Campanhas', 'ok', 'Nenhuma campanha para verificar')
    }
  } catch (error) {
    addResult('Integridade Referencial', 'error', 'Erro: ' + (error as Error).message)
  }
}

/**
 * Gera relatório final
 */
function generateReport() {
  console.log('\n' + '='.repeat(60))
  console.log('RELATÓRIO FINAL')
  console.log('='.repeat(60))

  const okCount = results.filter((r) => r.status === 'ok').length
  const warningCount = results.filter((r) => r.status === 'warning').length
  const errorCount = results.filter((r) => r.status === 'error').length

  console.log(`\n✅ Sucessos: ${okCount}`)
  console.log(`⚠️  Avisos: ${warningCount}`)
  console.log(`❌ Erros: ${errorCount}`)

  if (errorCount > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:')
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.message}`)
      })
  }

  if (warningCount > 0) {
    console.log('\n⚠️  AVISOS:')
    results
      .filter((r) => r.status === 'warning')
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.message}`)
      })
  }

  console.log('\n' + '='.repeat(60))
}

/**
 * Executa todas as checagens
 */
async function runAllChecks() {
  console.log('🔍 Iniciando checagem do banco de dados...\n')

  await checkConnection()
  await checkTables()
  await checkTableStructure()
  await checkStorage()
  await checkData()
  await checkRLS()
  await checkIndexes()
  await checkReferentialIntegrity()

  generateReport()

  // Retornar código de saída baseado nos resultados
  const hasErrors = results.some((r) => r.status === 'error')
  process.exit(hasErrors ? 1 : 0)
}

// Executar checagens
runAllChecks().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})


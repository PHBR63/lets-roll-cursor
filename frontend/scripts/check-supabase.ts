/**
 * Script de verificação do Supabase para o frontend
 * Verifica conexão, autenticação, e inicialização do cliente
 * 
 * Uso:
 *   npm run check:supabase
 *   ou
 *   tsx scripts/check-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  const envPath = join(process.cwd(), '.env')
  const envLocalPath = join(process.cwd(), '.env.local')
  
  let envVars: Record<string, string> = {}
  
  // Tentar carregar .env.local primeiro (tem prioridade)
  try {
    const envLocal = readFileSync(envLocalPath, 'utf-8')
    envLocal.split('\n').forEach(line => {
      const match = line.match(/^VITE_SUPABASE_(URL|ANON_KEY)=(.*)$/)
      if (match) {
        envVars[`VITE_SUPABASE_${match[1]}`] = match[2].trim()
      }
    })
  } catch (e) {
    // .env.local não existe, continuar
  }
  
  // Tentar carregar .env
  try {
    const env = readFileSync(envPath, 'utf-8')
    env.split('\n').forEach(line => {
      const match = line.match(/^VITE_SUPABASE_(URL|ANON_KEY)=(.*)$/)
      if (match && !envVars[`VITE_SUPABASE_${match[1]}`]) {
        envVars[`VITE_SUPABASE_${match[1]}`] = match[2].trim()
      }
    })
  } catch (e) {
    // .env não existe
  }
  
  // Também verificar variáveis de ambiente do sistema
  return {
    VITE_SUPABASE_URL: envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  }
}

async function checkSupabase(): Promise<void> {
  console.log('🔍 Verificando configuração do Supabase...\n')
  
  // 1. Verificar variáveis de ambiente
  console.log('1️⃣ Verificando variáveis de ambiente...')
  const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = loadEnv()
  
  if (!VITE_SUPABASE_URL) {
    console.error('❌ VITE_SUPABASE_URL não encontrada')
    console.error('   Configure no arquivo .env ou .env.local:')
    console.error('   VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
    process.exit(1)
  }
  
  if (!VITE_SUPABASE_ANON_KEY) {
    console.error('❌ VITE_SUPABASE_ANON_KEY não encontrada')
    console.error('   Configure no arquivo .env ou .env.local:')
    console.error('   VITE_SUPABASE_ANON_KEY=sua_anon_key')
    process.exit(1)
  }
  
  console.log('✅ Variáveis de ambiente encontradas')
  console.log(`   URL: ${VITE_SUPABASE_URL.substring(0, 30)}...`)
  console.log(`   Key: ${VITE_SUPABASE_ANON_KEY.substring(0, 20)}...\n`)
  
  // 2. Verificar se não está usando service_role key
  console.log('2️⃣ Verificando tipo de chave...')
  if (VITE_SUPABASE_ANON_KEY.includes('service_role')) {
    console.error('❌ ERRO CRÍTICO: Você está usando SERVICE_ROLE_KEY no frontend!')
    console.error('   Use apenas a ANON_KEY no frontend.')
    console.error('   A SERVICE_ROLE_KEY deve ser usada apenas no backend.')
    process.exit(1)
  }
  
  // Verificar tamanho da chave (service_role geralmente é mais longa)
  if (VITE_SUPABASE_ANON_KEY.length > 500) {
    console.warn('⚠️  Aviso: A chave parece muito longa para ser ANON_KEY')
    console.warn('   Verifique se está usando a chave correta.')
  }
  
  // Tentar decodificar JWT para verificar role
  try {
    const parts = VITE_SUPABASE_ANON_KEY.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      )
      if (payload.role && payload.role !== 'anon') {
        console.error(`❌ ERRO: A chave tem role '${payload.role}', mas deveria ser 'anon'`)
        process.exit(1)
      }
      console.log('✅ Chave é uma ANON_KEY válida (role: anon)')
    }
  } catch (e) {
    console.warn('⚠️  Não foi possível validar o JWT da chave')
  }
  console.log()
  
  // 3. Criar cliente e verificar conexão
  console.log('3️⃣ Criando cliente Supabase...')
  let supabase
  try {
    supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    console.log('✅ Cliente criado com sucesso\n')
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error)
    process.exit(1)
  }
  
  // 4. Verificar conexão com o servidor
  console.log('4️⃣ Verificando conexão com o servidor...')
  try {
    // Fazer uma query simples para verificar conexão
    const { data, error } = await supabase.from('campaigns').select('count').limit(0)
    
    if (error) {
      // PGRST116 = relation does not exist (esperado se tabela não existe)
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela "campaigns" não encontrada (pode ser normal)')
        console.log('   Mas a conexão com o servidor está funcionando!')
      } else {
        console.error('❌ Erro ao conectar:', error.message)
        console.error('   Código:', error.code)
        process.exit(1)
      }
    } else {
      console.log('✅ Conexão com servidor estabelecida com sucesso')
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar conexão:', error.message)
    if (error.message.includes('fetch')) {
      console.error('   Verifique se a URL do Supabase está correta')
      console.error('   Verifique sua conexão com a internet')
    }
    process.exit(1)
  }
  console.log()
  
  // 5. Verificar autenticação
  console.log('5️⃣ Verificando autenticação...')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('⚠️  Erro ao verificar sessão:', error.message)
    } else if (session) {
      console.log('✅ Sessão ativa encontrada')
      console.log(`   User ID: ${session.user.id}`)
      console.log(`   Email: ${session.user.email}`)
    } else {
      console.log('ℹ️  Nenhuma sessão ativa (normal se não estiver logado)')
    }
  } catch (error: any) {
    console.warn('⚠️  Erro ao verificar autenticação:', error.message)
  }
  console.log()
  
  // 6. Verificar storage
  console.log('6️⃣ Verificando storage...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.warn('⚠️  Erro ao listar buckets:', error.message)
    } else {
      console.log(`✅ Storage acessível (${buckets?.length || 0} buckets encontrados)`)
      if (buckets && buckets.length > 0) {
        console.log('   Buckets:')
        buckets.forEach(bucket => {
          console.log(`     - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
        })
      }
    }
  } catch (error: any) {
    console.warn('⚠️  Erro ao verificar storage:', error.message)
  }
  console.log()
  
  // 7. Verificar realtime
  console.log('7️⃣ Verificando Realtime...')
  try {
    // Criar um canal de teste
    const channel = supabase.channel('test-connection')
    const status = await new Promise<string>((resolve) => {
      channel
        .on('system', {}, (payload) => {
          if (payload.status === 'SUBSCRIBED') {
            resolve('SUBSCRIBED')
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve('SUBSCRIBED')
          } else if (status === 'CHANNEL_ERROR') {
            resolve('ERROR')
          }
        })
      
      // Timeout após 5 segundos
      setTimeout(() => resolve('TIMEOUT'), 5000)
    })
    
    await channel.unsubscribe()
    
    if (status === 'SUBSCRIBED') {
      console.log('✅ Realtime funcionando corretamente')
    } else if (status === 'TIMEOUT') {
      console.warn('⚠️  Realtime não respondeu (pode ser normal se não estiver configurado)')
    } else {
      console.warn('⚠️  Erro ao conectar ao Realtime')
    }
  } catch (error: any) {
    console.warn('⚠️  Erro ao verificar Realtime:', error.message)
  }
  console.log()
  
  console.log('✅ Verificação completa!')
  console.log('\n💡 Dicas:')
  console.log('   - Se houver erros, verifique as variáveis de ambiente')
  console.log('   - Certifique-se de estar usando VITE_SUPABASE_ANON_KEY (não service_role)')
  console.log('   - Verifique se o projeto Supabase está ativo no dashboard')
}

// Executar verificação
checkSupabase().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})


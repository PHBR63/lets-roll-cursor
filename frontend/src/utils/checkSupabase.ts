/**
 * Utilitário para verificar o Supabase no navegador
 * 
 * Uso no console do navegador:
 *   import { checkSupabase } from './utils/checkSupabase'
 *   checkSupabase()
 * 
 * Ou adicione ao window para uso direto:
 *   window.checkSupabase()
 */

import { supabase } from '../integrations/supabase/client'

export async function checkSupabase(): Promise<void> {
  console.log('%c🔍 Verificando Supabase...', 'font-size: 16px; font-weight: bold; color: #8000FF')
  console.log('')
  
  const results: Array<{ name: string; success: boolean; message: string; details?: any }> = []
  
  // 1. Verificar se o cliente existe
  console.log('1️⃣ Verificando cliente...')
  try {
    if (!supabase) {
      throw new Error('Cliente Supabase não encontrado')
    }
    console.log('✅ Cliente Supabase encontrado')
    results.push({ name: 'Cliente', success: true, message: 'Cliente encontrado' })
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    results.push({ name: 'Cliente', success: false, message: error.message })
    return
  }
  
  // 2. Verificar conexão
  console.log('\n2️⃣ Verificando conexão...')
  try {
    const { data, error } = await supabase.from('campaigns').select('count').limit(0)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela não encontrada (pode ser normal)')
        results.push({ name: 'Conexão', success: true, message: 'Conexão OK, tabela não existe' })
      } else {
        throw error
      }
    } else {
      console.log('✅ Conexão estabelecida')
      results.push({ name: 'Conexão', success: true, message: 'Conexão OK' })
    }
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    results.push({ name: 'Conexão', success: false, message: error.message, details: error })
  }
  
  // 3. Verificar autenticação
  console.log('\n3️⃣ Verificando autenticação...')
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    if (session) {
      console.log('✅ Sessão ativa')
      console.log(`   User: ${session.user.email || session.user.id}`)
      results.push({ 
        name: 'Autenticação', 
        success: true, 
        message: 'Sessão ativa', 
        details: { userId: session.user.id, email: session.user.email } 
      })
    } else {
      console.log('ℹ️  Nenhuma sessão ativa')
      results.push({ name: 'Autenticação', success: true, message: 'Nenhuma sessão (normal)' })
    }
  } catch (error: any) {
    console.error('❌ Erro:', error.message)
    results.push({ name: 'Autenticação', success: false, message: error.message })
  }
  
  // 4. Verificar storage
  console.log('\n4️⃣ Verificando storage...')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Storage acessível (${buckets?.length || 0} buckets)`)
    results.push({ 
      name: 'Storage', 
      success: true, 
      message: `${buckets?.length || 0} buckets encontrados`,
      details: buckets 
    })
  } catch (error: any) {
    console.warn('⚠️  Erro:', error.message)
    results.push({ name: 'Storage', success: false, message: error.message })
  }
  
  // Resumo
  console.log('\n' + '='.repeat(50))
  console.log('%c📊 Resumo da Verificação', 'font-size: 14px; font-weight: bold')
  console.log('='.repeat(50))
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌'
    const style = result.success 
      ? 'color: green; font-weight: bold' 
      : 'color: red; font-weight: bold'
    console.log(`%c${icon} ${result.name}: ${result.message}`, style)
    if (result.details) {
      console.log('   Detalhes:', result.details)
    }
  })
  
  const allSuccess = results.every(r => r.success)
  if (allSuccess) {
    console.log('\n%c✅ Todas as verificações passaram!', 'color: green; font-size: 14px; font-weight: bold')
  } else {
    console.log('\n%c⚠️  Algumas verificações falharam', 'color: orange; font-size: 14px; font-weight: bold')
  }
  
  return results as any
}

// Adicionar ao window para uso direto no console
if (typeof window !== 'undefined') {
  ;(window as any).checkSupabase = checkSupabase
  console.log('💡 Dica: Use window.checkSupabase() no console para verificar o Supabase')
}


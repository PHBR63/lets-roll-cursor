#!/usr/bin/env node

/**
 * Script para analisar bundle size
 * Executa build e analisa tamanhos de chunks
 */
const { execSync } = require('child_process')
const { readdirSync, statSync, existsSync } = require('fs')
const { join } = require('path')

const FRONTEND_DIR = join(process.cwd(), 'frontend')
const DIST_DIR = join(FRONTEND_DIR, 'dist')
const STATS_FILE = join(DIST_DIR, 'stats.html')

console.log('📦 Analisando bundle size...\n')

// 1. Executar build
console.log('1️⃣ Executando build...')
try {
  execSync('npm run build', { 
    cwd: FRONTEND_DIR, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  })
  console.log('✅ Build concluído\n')
} catch (error) {
  console.error('❌ Erro ao executar build:', error.message)
  process.exit(1)
}

// 2. Verificar se stats.html foi gerado
if (existsSync(STATS_FILE)) {
  console.log('2️⃣ Relatório de análise gerado em:', STATS_FILE)
  console.log('   Abra este arquivo no navegador para visualizar o bundle\n')
} else {
  console.log('⚠️  stats.html não encontrado. Execute: npm run build:analyze\n')
}

// 3. Analisar tamanhos de arquivos
console.log('3️⃣ Analisando tamanhos de arquivos...\n')

try {
  const assetsDir = join(DIST_DIR, 'assets')
  
  if (existsSync(assetsDir)) {
    const jsFiles = readdirSync(join(assetsDir, 'js')).filter((f) => f.endsWith('.js'))
    const cssFiles = readdirSync(join(assetsDir, 'css')).filter((f) => f.endsWith('.css'))
    
    console.log('📊 Tamanhos de Chunks JS:')
    jsFiles.forEach((file) => {
      const filePath = join(assetsDir, 'js', file)
      const stats = statSync(filePath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
      console.log(`   ${file}: ${sizeKB} KB (${sizeMB} MB)`)
    })
    
    console.log('\n📊 Tamanhos de CSS:')
    cssFiles.forEach((file) => {
      const filePath = join(assetsDir, 'css', file)
      const stats = statSync(filePath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      console.log(`   ${file}: ${sizeKB} KB`)
    })
    
    // Calcular total
    const totalJS = jsFiles.reduce((sum, file) => {
      const filePath = join(assetsDir, 'js', file)
      return sum + statSync(filePath).size
    }, 0)
    
    const totalCSS = cssFiles.reduce((sum, file) => {
      const filePath = join(assetsDir, 'css', file)
      return sum + statSync(filePath).size
    }, 0)
    
    console.log(`\n📈 Total JS: ${(totalJS / 1024).toFixed(2)} KB (${(totalJS / (1024 * 1024)).toFixed(2)} MB)`)
    console.log(`📈 Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`)
    console.log(`📈 Total Geral: ${((totalJS + totalCSS) / 1024).toFixed(2)} KB (${((totalJS + totalCSS) / (1024 * 1024)).toFixed(2)} MB)`)
    
    // Avisos
    console.log('\n⚠️  Recomendações:')
    if (totalJS > 500 * 1024) {
      console.log('   ⚠️  Bundle JS maior que 500KB - considere code splitting')
    }
    if (totalCSS > 100 * 1024) {
      console.log('   ⚠️  CSS maior que 100KB - considere purgar CSS não utilizado')
    }
  }
} catch (error) {
  console.error('❌ Erro ao analisar arquivos:', error.message)
}

console.log('\n✅ Análise concluída!')

# Script de Setup Local - Let's Roll
# Execute: .\setup-local.ps1

Write-Host "`n🚀 Setup Local - Let's Roll" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Node.js $nodeVersion instalado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js não encontrado. Instale Node.js 18+" -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "`n2. Instalando dependências..." -ForegroundColor Yellow
Write-Host "   Frontend..." -ForegroundColor Gray
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "   ✅ Dependências do frontend já instaladas" -ForegroundColor Green
}
Set-Location ..

Write-Host "   Backend..." -ForegroundColor Gray
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "   ✅ Dependências do backend já instaladas" -ForegroundColor Green
}
Set-Location ..

# Verificar arquivos .env
Write-Host "`n3. Verificando arquivos .env..." -ForegroundColor Yellow

if (-not (Test-Path "frontend/.env")) {
    Write-Host "   ⚠️  frontend/.env não encontrado" -ForegroundColor Yellow
    Write-Host "   📝 Crie frontend/.env com:" -ForegroundColor Gray
    Write-Host "      VITE_SUPABASE_URL=sua_url_supabase" -ForegroundColor DarkGray
    Write-Host "      VITE_SUPABASE_ANON_KEY=sua_chave_anon" -ForegroundColor DarkGray
    Write-Host "      VITE_API_URL=http://localhost:3001" -ForegroundColor DarkGray
} else {
    Write-Host "   ✅ frontend/.env existe" -ForegroundColor Green
}

if (-not (Test-Path "backend/.env")) {
    Write-Host "   ⚠️  backend/.env não encontrado" -ForegroundColor Yellow
    Write-Host "   📝 Crie backend/.env com:" -ForegroundColor Gray
    Write-Host "      SUPABASE_URL=sua_url_supabase" -ForegroundColor DarkGray
    Write-Host "      SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role" -ForegroundColor DarkGray
    Write-Host "      PORT=3001" -ForegroundColor DarkGray
    Write-Host "      CORS_ORIGIN=http://localhost:5173" -ForegroundColor DarkGray
    Write-Host "      NODE_ENV=development" -ForegroundColor DarkGray
} else {
    Write-Host "   ✅ backend/.env existe" -ForegroundColor Green
}

# Resumo
Write-Host "`n✅ Setup concluído!" -ForegroundColor Green
Write-Host "`n📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure os arquivos .env com suas credenciais do Supabase" -ForegroundColor White
Write-Host "   2. Execute as migrations no Supabase (veja docs/guides/DATABASE-SETUP.md)" -ForegroundColor White
Write-Host "   3. Inicie o projeto: npm run dev" -ForegroundColor Cyan
Write-Host "`n📚 Documentação: docs/guides/LOCAL-SETUP.md`n" -ForegroundColor Magenta


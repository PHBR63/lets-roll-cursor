import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'

/**
 * Página inicial (Landing Page)
 * Fundo roxo com icosaedros, logo central, texto lateral e botão "Conecte-se"
 * Conforme design de referência
 * Redireciona usuários autenticados para o dashboard
 */
export function Landing() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  // Se usuário estiver autenticado, não renderizar nada (será redirecionado)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Botão Conecte-se no canto superior direito */}
      <div className="absolute top-4 right-4 z-20">
        <Link to="/login">
          <Button variant="outline" className="bg-card text-white border-white/20 hover:bg-accent hover:text-white flex items-center gap-2">
            <User className="w-4 h-4" />
            Conecte-se
          </Button>
        </Link>
      </div>

      {/* Layout principal: texto lateral esquerdo, conteúdo central, texto lateral direito */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center relative z-10">
        {/* Texto lateral esquerdo */}
        <div className="hidden md:block text-text-secondary text-sm md:text-base leading-relaxed">
          <p className="mb-4">
            Mussum Ipsum, cacilds vidis litr magna. Aenean aliquam molesti interessantis. Paisis, filhis, espiri
          </p>
        </div>

        {/* Conteúdo central */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
          <div className="bg-card p-8 md:p-12 rounded-lg border border-card-secondary w-full max-w-xs">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Logo</h1>
          </div>

          <div className="max-w-2xl space-y-4 text-text-secondary hidden md:block">
            <p className="text-base md:text-lg">
              Mussum Ipsum, cacilds vidis litro abertis. Aenean aliquam molestie leo, vitae iaculis nisl.
              Pais, filhos e cachorros. Pais, filhos e cachorros. Mais interessantis.
            </p>
            <p className="text-base md:text-lg">
              Aenean aliquam molestie leo, vitae iaculis nisl. Pais, filhos e cachorros.
              Pais, filhos e cachorros. Mais interessantis.
            </p>
          </div>
        </div>

        {/* Texto lateral direito */}
        <div className="hidden md:block text-text-secondary text-sm md:text-base leading-relaxed">
          <p>
            de bebadis, arcu quam euismod vadiss deixa as pessoas mais interessantis.
          </p>
        </div>
      </div>

      {/* Logo Muu Walkers no canto inferior esquerdo */}
      <div className="absolute bottom-4 left-4 text-text-secondary z-10">
        <p className="text-sm mb-2">Desenvolvido por:</p>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-xl">
            🐄
          </div>
          <div className="flex flex-col">
            <span className="text-accent-light font-semibold text-lg leading-tight">Muu</span>
            <span className="text-accent font-bold text-lg leading-tight">WALKERS</span>
          </div>
        </div>
      </div>

      {/* Barra roxa no rodapé */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-light z-10" />
    </div>
  )
}


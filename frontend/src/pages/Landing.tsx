import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/**
 * Página inicial (Landing Page)
 * Fundo roxo com icosaedros, logo central e botão "Conecte-se"
 */
export function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <Link to="/login">
          <Button variant="outline" className="bg-card text-white border-white/20 hover:bg-accent hover:text-white">
            Conecte-se
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-8 px-4 z-10">
        <div className="bg-card p-8 rounded-lg border border-card-secondary">
          <h1 className="text-4xl font-bold text-white mb-4">Logo</h1>
        </div>

        <div className="max-w-2xl space-y-4 text-text-secondary">
          <p className="text-lg">
            Mussum Ipsum, cacilds vidis litro abertis. Aenean aliquam molestie leo, vitae iaculis nisl.
            Pais, filhos e cachorros. Pais, filhos e cachorros. Mais interessantis.
          </p>
          <p className="text-lg">
            Aenean aliquam molestie leo, vitae iaculis nisl. Pais, filhos e cachorros.
            Pais, filhos e cachorros. Mais interessantis.
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-text-secondary z-10">
        <p className="text-sm">Desenvolvido por:</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            🐄
          </div>
          <span className="text-accent-light font-semibold">Muu Walkers</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-light z-10" />
    </div>
  )
}


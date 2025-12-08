// @ts-nocheck
import { Link } from 'react-router-dom'

/**
 * Footer completo com links úteis e informações
 * Conforme proposta da landing page
 */
export function Footer() {
  return (
    <footer className="border-t border-[#8000FF]/20 bg-[#1A0033] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo */}
          <div>
            <div className="bg-[#2A2A3A] px-4 py-2 rounded-lg border border-[#8000FF]/20 inline-block mb-4">
              <span className="text-white font-bold text-lg">Let's Roll</span>
            </div>
            <p className="text-[#A0A0A0] text-sm">
              Sua plataforma definitiva para RPG de mesa online.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-white font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Discord
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Termos
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A0A0A0] hover:text-[#8000FF] transition-colors text-sm">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-[#8000FF]/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#A0A0A0] text-sm">
              © 2024 Let's Roll • Desenvolvido por Muu Walkers
            </p>
            <div className="flex items-center gap-2 text-[#A0A0A0]">
              <div className="w-6 h-6 bg-[#8000FF] rounded-full flex items-center justify-center text-xs">
                🐄
              </div>
              <span className="text-[#8000FF] font-semibold">Muu Walkers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


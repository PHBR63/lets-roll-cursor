import { Link } from 'react-router-dom'
import { Bell, User, Menu, X, Sparkles, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/common/Logo'

/**
 * Navbar principal
 * Logo à esquerda, notificações e dropdown de perfil à direita
 * Botão "+ Nova Mesa" roxo proeminente
 */
export function Navbar() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-[#8000FF]/20 bg-[#2A2A3A]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#2A2A3A]/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo size="md" link={true} />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/campaign/create">
            <Button className="bg-accent hover:bg-accent/90">
              + Nova Mesa
            </Button>
          </Link>

          <Link to="/rituals">
            <Button variant="ghost" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-white">Rituais</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5 text-white" />
                <span className="text-white hidden lg:inline">
                  {user?.email || 'theDevloope'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-accent">
              <DropdownMenuItem>
                <Link to="/profile">Meu perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/history">Histórico</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/friends">Amigos</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-card-secondary w-80">
            <div className="flex flex-col gap-4 mt-8">
              <Link
                to="/campaign/create"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button className="bg-accent hover:bg-accent/90 w-full">
                  + Nova Mesa
                </Button>
              </Link>

              <div className="border-t border-card-secondary pt-4">
                <Link
                  to="/rituals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-white hover:text-accent"
                >
                  <Sparkles className="h-5 w-5" />
                  Rituais
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-white hover:text-accent"
                >
                  Meu perfil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-white hover:text-accent"
                >
                  <Settings className="h-5 w-5" />
                  Configurações
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-white hover:text-accent"
                >
                  Histórico
                </Link>
                <Link
                  to="/friends"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-white hover:text-accent"
                >
                  Amigos
                </Link>
              </div>

              <div className="border-t border-card-secondary pt-4">
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block py-2 text-white hover:text-accent w-full text-left"
                >
                  Sair
                </button>
              </div>

              <div className="border-t border-card-secondary pt-4">
                <div className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user?.email || 'theDevloope'}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}


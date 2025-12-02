import { Link } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'

/**
 * Navbar principal
 * Logo à esquerda, notificações e dropdown de perfil à direita
 * Botão "+ Nova Mesa" roxo proeminente
 */
export function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="border-b border-card-secondary bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center">
          <div className="bg-card p-3 rounded-lg border border-card-secondary">
            <span className="text-white font-bold">Logo</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Button className="bg-accent hover:bg-accent/90">
            + Nova Mesa
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-white" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5 text-white" />
                <span className="text-white">{user?.email || 'theDevloope'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-accent">
              <DropdownMenuItem>
                <Link to="/profile">Meu perfil</Link>
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
      </div>
    </nav>
  )
}


// @ts-nocheck
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import { Bell, ChevronDown, User, LogOut, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CharacterSheetTopbarProps {
    title?: string
    onBack?: () => void
}

export function CharacterSheetTopbar({ title = 'Ficha de Personagem', onBack }: CharacterSheetTopbarProps) {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate(-1)
        }
    }

    return (
        <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold tracking-widest text-white/70">
                    LOGO
                </div>
            </div>

            {/* Center Title */}
            <h1 className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl font-semibold text-white hidden md:block">
                {title}
            </h1>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                    <Bell className="w-5 h-5" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/10 rounded-full h-auto py-1">
                            <Avatar className="w-8 h-8 border border-white/20">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-purple-900 text-purple-100">
                                    {user?.email?.slice(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:flex flex-col items-start text-xs text-left">
                                <span className="font-medium text-white max-w-[100px] truncate">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 border-zinc-800 text-zinc-100 backdrop-blur-xl">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <User className="mr-2 w-4 h-4" />
                            <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-400 focus:bg-red-950/30 focus:text-red-300">
                            <LogOut className="mr-2 w-4 h-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Back Button (Floating or Integrated) */}
                <Button
                    onClick={handleBack}
                    className="ml-2 bg-purple-700 hover:bg-purple-600 text-white border-0 shadow-lg shadow-purple-900/20"
                >
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Voltar</span>
                </Button>
            </div>

            {/* Mobile Title (shown below if needed, or just small) */}
            <h1 className="md:hidden absolute left-14 text-sm font-semibold text-white truncate max-w-[120px]">
                {title}
            </h1>
        </div>
    )
}

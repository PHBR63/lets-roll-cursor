import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Character } from '@/types/character'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
    character: Character
    className?: string
}

export function ProfileCard({ character, className }: ProfileCardProps) {
    const AvatarAny = Avatar as any
    const AvatarImageAny = AvatarImage as any
    const AvatarFallbackAny = AvatarFallback as any

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
            <div className="relative mb-4 group">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-500" />
                <AvatarAny className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white/10 shadow-2xl relative z-10">
                    <AvatarImageAny src={character.avatar_url || ''} className="object-cover" />
                    <AvatarFallbackAny className="bg-zinc-900 text-3xl font-bold text-zinc-500">
                        {character.name.charAt(0).toUpperCase()}
                    </AvatarFallbackAny>
                </AvatarAny>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{character.name}</h2>
            {character.class && (
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-purple-200 text-sm font-medium">
                    {character.class}
                </div>
            )}

            {/* Optional: Add Level/NEX if available in the future */}
            {/* <p className="text-zinc-400 text-sm mt-2">NEX 50%</p> */}
        </div>
    )
}

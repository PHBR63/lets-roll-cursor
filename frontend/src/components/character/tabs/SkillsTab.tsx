
import { useState, useMemo } from 'react'
import { Character, CharacterUpdateData } from '@/types/character'
import { ALL_SKILLS, SkillTraining, TRAINING_BONUS } from '@/types/ordemParanormal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Filter, Dices, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApiError } from '@/hooks/useApiError'
import { useAuth } from '@/context/AuthContext'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { useToast } from '@/hooks/useToast'

interface SkillsTabProps {
    character: Character
    onUpdate: (updates: CharacterUpdateData) => void
}

const TRAINED_ONLY_SKILLS = [
    'Pilotagem', 'Crime', 'Prestidigitação', 'Religião', 'Artes', 'Adestramento',
    'Ocultismo', 'Ciências', 'Tecnologia', 'Medicina', 'Tática', 'Profissão'
]

export function SkillsTab({ character, onUpdate: _onUpdate }: SkillsTabProps) {
    const [search, setSearch] = useState('')
    const [filterAttribute, setFilterAttribute] = useState<string | null>(null)
    const [showOnlyTrained, setShowOnlyTrained] = useState(false)
    const [rolling, setRolling] = useState<string | null>(null)

    const { user } = useAuth()
    const { handleErrorWithToast } = useApiError()
    const toast = useToast()

    const skills = useMemo(() => character.skills || {}, [character.skills])
    const attributes = useMemo(() => character.attributes, [character.attributes])

    // Transform skills into array
    const skillsList = useMemo(() => {
        return Object.entries(ALL_SKILLS).map(([name, meta]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const charSkill = skills[name] as any || {}
            const training = (charSkill.training as SkillTraining) || 'UNTRAINED'
            const bonus = charSkill.bonus || 0 // Bônus numérico extra (itens/poderes)
            const attrValue = attributes[meta.attribute.toLowerCase() as keyof typeof attributes] || 0

            const trainingBonus = TRAINING_BONUS[training] || 0
            const totalBonus = trainingBonus + bonus

            const isTrainedOnly = TRAINED_ONLY_SKILLS.includes(name)
            const canRoll = !isTrainedOnly || training !== 'UNTRAINED'

            return {
                name,
                meta,
                training,
                trainingBonus,
                bonus,
                totalBonus,
                attrValue,
                canRoll,
                isTrainedOnly
            }
        })
    }, [skills, attributes])

    // Filter skills
    const filteredSkills = useMemo(() => {
        return skillsList.filter(skill => {
            const matchesSearch = skill.name.toLowerCase().includes(search.toLowerCase())
            const matchesAttr = filterAttribute ? skill.meta.attribute === filterAttribute : true
            const matchesTrained = showOnlyTrained ? skill.training !== 'UNTRAINED' : true
            return matchesSearch && matchesAttr && matchesTrained
        }).sort((a, b) => a.name.localeCompare(b.name))
    }, [skillsList, search, filterAttribute, showOnlyTrained])

    const handleRoll = async (skill: typeof skillsList[0]) => {
        if (!skill.canRoll || !user) return

        setRolling(skill.name)
        try {
            const { data: session } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())
            if (!session.session) return

            const apiUrl = getApiBaseUrl()
            const response = await fetch(`${apiUrl}/api/dice/roll/skill`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.session.access_token}`,
                },
                body: JSON.stringify({
                    skillName: skill.name,
                    attributeValue: skill.attrValue,
                    training: skill.training,
                    flatBonus: skill.bonus, // Extra bonuses
                    diceMod: 0,
                    campaignId: character.campaign_id,
                    characterId: character.id,
                }),
            })

            if (!response.ok) {
                throw new Error('Falha na rolagem')
            }

            const result = await response.json()

            // Mostrar resultado (Toast ou Modal - usando Toast por enquanto com breakdown)
            toast.success(`Resultado: ${result.result}`, {
                description: result.details.breakdown,
                duration: 5000,
            })

        } catch (error) {
            handleErrorWithToast(error, 'Erro ao rolar perícia')
        } finally {
            setRolling(null)
        }
    }

    const getTrainingBadge = (training: SkillTraining) => {
        switch (training) {
            default: return <span className="text-zinc-600 text-xs text-center w-6">-</span>
            case 'TRAINED': return <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">T</Badge>
            // @ts-expect-error - ReactNode type mismatch
            case 'COMPETENT': return <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">V</Badge>
            // @ts-expect-error - ReactNode type mismatch
            case 'EXPERT': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">E</Badge>
        }
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[140px]">
                    {/* @ts-expect-error - ReactNode type mismatch */}
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    {/* @ts-expect-error - ReactNode type mismatch */}
                    <Input
                        placeholder="Buscar perícia..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 bg-zinc-900/50 border-white/10"
                    />
                </div>
                <div className="flex gap-1">
                    {['AGI', 'FOR', 'INT', 'PRE', 'VIG'].map(attr => (
                        <Button
                            key={attr}
                            variant={filterAttribute === attr ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterAttribute(filterAttribute === attr ? null : attr)}
                            className={cn("h-8 px-2 text-xs font-bold", filterAttribute === attr && "bg-purple-500/20 text-purple-300")}
                        >
                            {attr}
                        </Button>
                    ))}
                </div>
                <Button
                    variant={showOnlyTrained ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowOnlyTrained(!showOnlyTrained)}
                    className="h-9 px-3"
                >
                    {/* @ts-expect-error - ReactNode type mismatch */}
                    <Filter className="w-4 h-4 mr-2" />
                    Treinadas
                </Button>
            </div>

            {/* List */}
            {/* @ts-expect-error - ReactNode type mismatch */}
            <ScrollArea className="flex-1 pr-4 -mr-4 h-[500px] w-full bg-black/20 rounded-md border border-white/5 p-2">
                <div className="flex flex-col gap-1">
                    {filteredSkills.map(skill => (
                        <div
                            key={skill.name}
                            className={cn(
                                "flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group border border-transparent",
                                !skill.canRoll && "opacity-50 grayscale"
                            )}
                        >
                            {/* Name & Attr */}
                            <div className="flex items-center gap-3 flex-1">
                                {/* @ts-expect-error - ReactNode type mismatch */}
                                <Badge variant="outline" className="w-10 justify-center border-white/10 text-zinc-400">
                                    {skill.meta.attribute}
                                </Badge>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-200">{skill.name}</span>
                                    {skill.isTrainedOnly && skill.training === 'UNTRAINED' && (
                                        <span className="text-[10px] text-red-400 flex items-center gap-1">
                                            {/* @ts-expect-error - ReactNode type mismatch */}
                                            <Lock className="w-3 h-3" /> Requer treinar
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Training & Values */}
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end min-w-[60px]">
                                    {getTrainingBadge(skill.training)}
                                </div>

                                <div className="flex flex-col items-end w-12">
                                    <span className={cn("text-lg font-bold", skill.totalBonus > 0 ? "text-purple-300" : "text-zinc-500")}>
                                        +{skill.totalBonus}
                                    </span>
                                </div>

                                {/* Roll Button */}
                                {/* @ts-expect-error - ReactNode type mismatch */}
                                <TooltipProvider>
                                    {/* @ts-expect-error - ReactNode type mismatch */}
                                    <Tooltip>
                                        {/* @ts-expect-error - ReactNode type mismatch */}
                                        <TooltipTrigger asChild>
                                            {/* @ts-expect-error - ReactNode type mismatch */}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                disabled={!skill.canRoll || rolling === skill.name}
                                                onClick={() => handleRoll(skill)}
                                                className={cn(
                                                    "h-8 w-8 p-0 rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition-all",
                                                    rolling === skill.name && "animate-spin"
                                                )}
                                            >
                                                {skill.canRoll ?
                                                    /* @ts-expect-error - ReactNode type mismatch */
                                                    <Dices className="w-4 h-4" /> :
                                                    /* @ts-expect-error - ReactNode type mismatch */
                                                    <Lock className="w-4 h-4 text-zinc-600" />
                                                }
                                            </Button>
                                        </TooltipTrigger>
                                        {/* @ts-expect-error - ReactNode type mismatch */}
                                        <TooltipContent>
                                            {skill.canRoll ? 'Rolar Perícia' : 'Requer Treinamento'}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    ))}

                    {filteredSkills.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 text-sm">
                            Nenhuma perícia encontrada.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

// @ts-nocheck
import { useState, useEffect } from 'react'
import {
    Book,
    Flame,
    Zap,
    Brain,
    Ghost,
    Check,
    X,
    Activity,
    AlertTriangle
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getApiBaseUrl } from '@/utils/apiUrl'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import { CharacterRitual, Ritual, RitualExecution, RitualRange, RitualElement, RitualCircle } from '@/types/ordemParanormal'
import { cn } from '@/lib/utils'

interface GrimoireProps {
    characterId: string
    characterNex: number
}

type CastingMode = 'NORMAL' | 'DISCIPLE' | 'TRUE'

interface CastingResult {
    success: boolean
    ritual: Ritual
    cost: number
    roll: {
        rollResult: number
        dt: number
        criticalFailure: boolean
        dice: number[]
    }
    sanLoss: number
    sanMaxLoss: number
    message: string
}

export function Grimoire({ characterId, characterNex }: GrimoireProps) {
    const { user } = useAuth()
    const toast = useToast()
    const [rituals, setRituals] = useState<CharacterRitual[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRitual, setSelectedRitual] = useState<CharacterRitual | null>(null)

    // Casting State
    const [castingMode, setCastingMode] = useState<CastingMode>('NORMAL')
    const [isCasting, setIsCasting] = useState(false)
    const [castingResult, setCastingResult] = useState<CastingResult | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        if (characterId) {
            loadGrimoire()
        }
    }, [characterId])

    const loadGrimoire = async () => {
        if (!user) return
        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token
            const response = await fetch(`${getApiBaseUrl()}/api/characters/${characterId}/rituals`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) throw new Error('Falha ao carregar grimório')

            const data = await response.json()
            setRituals(data)
        } catch (error) {
            console.error(error)
            toast.error('Erro ao carregar rituais', { description: 'Não foi possível buscar seu grimório.' })
        } finally {
            setLoading(false)
        }
    }

    const handleCast = async () => {
        if (!selectedRitual || !user) return

        setIsCasting(true)
        setCastingResult(null)

        try {
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const response = await fetch(`${getApiBaseUrl()}/api/characters/${characterId}/rituals/${selectedRitual.ritual_id}/conjure`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ mode: castingMode })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao conjurar ritual')
            }

            setCastingResult(data)
            if (data.success) {
                toast.success('Ritual Conjurado!', { description: data.message })
            } else {
                toast.error('Falha na Conjuração', { description: data.message })
            }
        } catch (error: any) {
            toast.error('Erro', { description: error.message })
        } finally {
            setIsCasting(false)
        }
    }

    const getElementIcon = (element: RitualElement) => {
        switch (element) {
            case 'SANGUE': return <Activity className="text-red-600" />
            case 'MORTE': return <AlertTriangle className="text-gray-900 dark:text-gray-400" />
            case 'ENERGIA': return <Zap className="text-purple-500" />
            case 'CONHECIMENTO': return <Brain className="text-yellow-500" />
            case 'MEDO': return <Ghost className="text-white" />
            default: return <Book />
        }
    }

    const getElementColor = (element: RitualElement) => {
        switch (element) {
            case 'SANGUE': return 'border-red-900/50 bg-red-950/20 text-red-200'
            case 'MORTE': return 'border-gray-800/50 bg-gray-950/20 text-gray-300'
            case 'ENERGIA': return 'border-purple-900/50 bg-purple-950/20 text-purple-200'
            case 'CONHECIMENTO': return 'border-yellow-900/50 bg-yellow-950/20 text-yellow-200'
            case 'MEDO': return 'border-white/20 bg-black/40 text-white'
            default: return 'border-white/10 bg-card'
        }
    }

    const calculateCost = (ritual: Ritual | undefined, mode: CastingMode) => {
        if (!ritual) return 0
        let cost = ritual.cost.basePe
        if (mode === 'DISCIPLE') cost += (ritual.cost.discipleExtraPe || 0)
        if (mode === 'TRUE') cost += (ritual.cost.trueExtraPe || 0)
        return cost
    }

    // Verificar requisitos para UI
    const canCastMode = (ritual: Ritual, mode: CastingMode) => {
        const requiredNex = [0, 0, 25, 55, 85] // Indexado por círculo
        if (characterNex < requiredNex[ritual.circle]) return false
        // Adicionar logica de afinidade se tiver info de afinidade nas props
        return true
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Book className="w-6 h-6 text-primary" />
                    Grimório
                </h2>
                <Button variant="outline" size="sm" onClick={loadGrimoire} disabled={loading}>
                    Atualizar
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
            ) : rituals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    Nenhum ritual aprendido. Use a aba "Aprender" para adicionar rituais.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rituals.map((charRitual) => {
                        const r = charRitual.ritual
                        if (!r) return null

                        return (
                            <div
                                key={charRitual.ritual_id}
                                className={cn(
                                    "relative group overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02]",
                                    "glass-panel cursor-pointer",
                                    getElementColor(r.element)
                                )}
                                onClick={() => {
                                    setSelectedRitual(charRitual)
                                    setCastingMode('NORMAL')
                                    setCastingResult(null)
                                    setDialogOpen(true)
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-lg leading-tight">{r.name}</div>
                                    <div className="opacity-80 scale-75 origin-top-right">{getElementIcon(r.element)}</div>
                                </div>

                                <div className="space-y-1 text-sm opacity-80">
                                    <div className="flex justify-between">
                                        <span>Círculo:</span>
                                        <span className="font-semibold">{r.circle}º</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Execução:</span>
                                        <span>{r.execution.toLowerCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Alcance:</span>
                                        <span>{r.range.toLowerCase()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Custo Base:</span>
                                        <Badge variant="outline" className="border-white/20">{r.cost.basePe} PE</Badge>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Dialog de Conjuração */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md glass-panel border-white/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {selectedRitual?.ritual?.element && getElementIcon(selectedRitual.ritual.element)}
                            Conjurar {selectedRitual?.ritual?.name}
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Configure os parâmetros da conjuração.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRitual?.ritual && (
                        <div className="space-y-4 py-4">
                            <ScrollArea className="h-24 rounded-md border border-white/10 bg-black/20 p-2 text-sm text-white/80">
                                {selectedRitual.ritual.description}
                            </ScrollArea>

                            <div className="space-y-2">
                                <Label>Modo de Conjuração</Label>
                                <Select
                                    value={castingMode}
                                    onValueChange={(v) => setCastingMode(v as CastingMode)}
                                >
                                    <SelectTrigger className="w-full bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal ({selectedRitual.ritual.cost.basePe} PE)</SelectItem>
                                        <SelectItem value="DISCIPLE" disabled={!canCastMode(selectedRitual.ritual, 'DISCIPLE')}>
                                            Discente (+{selectedRitual.ritual.cost.discipleExtraPe || 0} PE)
                                        </SelectItem>
                                        <SelectItem value="TRUE" disabled={!canCastMode(selectedRitual.ritual, 'TRUE')}>
                                            Verdadeiro (+{selectedRitual.ritual.cost.trueExtraPe || 0} PE)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-sm font-medium">Custo Total</span>
                                <Badge className="text-lg px-3 bg-purple-600 hover:bg-purple-700">
                                    {calculateCost(selectedRitual.ritual, castingMode)} PE
                                </Badge>
                            </div>

                            {castingResult && (
                                <div className={cn(
                                    "p-4 rounded-lg border animate-in fade-in zoom-in-95",
                                    castingResult.success
                                        ? "bg-green-500/10 border-green-500/30 text-green-200"
                                        : "bg-red-500/10 border-red-500/30 text-red-200"
                                )}>
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        {castingResult.success ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        {castingResult.success ? "Sucesso!" : "Falha!"}
                                    </div>
                                    <p className="text-sm mb-2">{castingResult.message}</p>

                                    <div className="grid grid-cols-2 gap-2 text-xs opacity-80">
                                        <div>Teste Ocultismo: {castingResult.roll.rollResult}</div>
                                        <div>DT Necessária: {castingResult.roll.dt}</div>
                                        {castingResult.sanLoss > 0 && (
                                            <div className="col-span-2 text-red-300 font-semibold">
                                                Perda de Sanidade: -{castingResult.sanLoss}
                                                {castingResult.sanMaxLoss > 0 && ` (-${castingResult.sanMaxLoss} Máxima)`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {!castingResult ? (
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                onClick={handleCast}
                                disabled={isCasting}
                            >
                                {isCasting ? <Flame className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
                                Confirmar Conjuração
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setDialogOpen(false)}
                            >
                                Fechar
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

import { supabase } from '@/integrations/supabase/client'

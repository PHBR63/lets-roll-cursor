import { Character } from '@/types/character'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Sword, Crosshair, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ElementType } from 'react'

interface CombatPanelProps {
    character: Character
}

export function CombatPanel({ character }: CombatPanelProps) {
    // Cast icons
    const SwordIcon = Sword as ElementType
    // const CrosshairIcon = Crosshair as ElementType // Unused for now
    // const ShieldAlertIcon = ShieldAlert as ElementType // Unused for now

    // Mock data mostly, assuming structure. Ideally this comes from inventory items categorized as weapons
    const weapons = [
        { id: 1, name: 'Soco', type: 'Briga', damage: '1d4', critical: 'x2', range: 'Toque', special: '' },
    ]

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-4 px-2">
                <h3 className="text-base font-semibold text-white uppercase tracking-wider">Combate</h3>
                <div className="h-px bg-white/10 flex-1" />
            </div>

            <div className="panel overflow-hidden">
                {/* Mobile View: Cards */}
                <div className="block sm:hidden divide-y divide-white/10">
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    <SwordIcon className="w-4 h-4 text-purple-400" />
                                    Soco
                                </div>
                                <div className="text-xs text-zinc-400">Briga</div>
                            </div>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">1D3</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-zinc-400 mt-2">
                            <div className="bg-zinc-900/40 p-1 rounded text-center">
                                <span className="block text-[10px] uppercase">Crítico</span>
                                x2
                            </div>
                            <div className="bg-zinc-900/40 p-1 rounded text-center">
                                <span className="block text-[10px] uppercase">Alcance</span>
                                Toque
                            </div>
                            <div className="bg-zinc-900/40 p-1 rounded text-center">
                                <span className="block text-[10px] uppercase">Munição</span>
                                -
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white/5 hover:bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-zinc-300 font-semibold w-[200px]">Nome</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Tipo</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Dano</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Crítico</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Alcance</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Munição</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-white/10 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white flex items-center gap-2">
                                    <SwordIcon className="w-4 h-4 text-purple-400" />
                                    Soco
                                </TableCell>
                                <TableCell className="text-zinc-300">Briga</TableCell>
                                <TableCell className="text-red-300 font-bold">1d3</TableCell>
                                <TableCell className="text-zinc-300">x2</TableCell>
                                <TableCell className="text-zinc-300">Toque</TableCell>
                                <TableCell className="text-zinc-300">-</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

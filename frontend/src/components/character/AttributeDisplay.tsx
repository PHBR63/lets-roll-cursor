
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Cast Loader2 to any to avoid "cannot be used as a JSX component" error
const Loader2Icon = Loader2 as any

interface AttributeDisplayProps {
    label: string
    shortLabel: string
    value: number
    onChange: (value: number) => void
    onRoll?: () => void
    isRolling?: boolean
    canRoll?: boolean
}

export function AttributeDisplay({
    label,
    shortLabel,
    value,
    onChange,
    onRoll,
    isRolling,
    canRoll,
}: AttributeDisplayProps) {
    return (
        <div className="flex flex-col items-center gap-1 group">
            <div className="relative d20-container">
                {/* Ícone D20 */}
                <div className="d20-icon transition-transform group-hover:scale-105">
                    {/* Valor centralizado */}
                    <div className="w-12 text-center z-10">
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                onChange(val)
                            }}
                            className="bg-transparent border-none text-center text-xl font-bold text-white h-10 w-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min={-5}
                            max={20}
                        />
                    </div>
                </div>

                {/* Botão de rolagem (opcional, pairando) */}
                {canRoll && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onRoll}
                        disabled={isRolling}
                        className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0 bg-accent/20 hover:bg-accent/40 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title={`Rolar ${label}`}
                    >
                        {isRolling ? <Loader2Icon className="w-3 h-3 animate-spin" /> : '🎲'}
                    </Button>
                )}
            </div>

            {/* Label abaixo */}
            <label className="text-white font-semibold text-sm tracking-wide uppercase text-center mt-2 block">
                {label}
            </label>

            {/* Dados extras (info) */}
            <div className="text-[10px] text-white/50 text-center uppercase tracking-wider">
                {value > 0 ? `+${value} Dados` : value < 0 ? `${Math.abs(value)} Dados` : '1 Dado'}
            </div>
        </div>
    )
}

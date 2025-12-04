import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { useGameBoardContext } from './GameBoardContext'

/**
 * Componente para seleção e gerenciamento de tokens
 */
export function GameBoardTokenSelector() {
  const { state, characters, creatures, handleAddToken, handleAddCharacterToken, handleAddCreatureToken, handleRemoveToken } = useGameBoardContext()

  return (
    <div className="hidden lg:block bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-card-secondary">
      <Select
        onValueChange={(value) => {
          if (value === 'generic') {
            handleAddToken()
          } else if (value.startsWith('char-')) {
            const charId = value.replace('char-', '')
            const char = characters.find((c) => c.id === charId)
            if (char) handleAddCharacterToken(char)
          } else if (value.startsWith('creature-')) {
            const creatureId = value.replace('creature-', '')
            const creature = creatures.find((c) => c.id === creatureId)
            if (creature) handleAddCreatureToken(creature)
          }
        }}
      >
        <SelectTrigger className="w-full bg-input border-white/20 text-white text-xs h-8">
          <SelectValue placeholder="Adicionar Token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="generic">Token Genérico</SelectItem>
          {characters.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-text-secondary">Personagens</div>
              {characters.map((char) => (
                <SelectItem key={char.id} value={`char-${char.id}`}>
                  {char.name}
                </SelectItem>
              ))}
            </>
          )}
          {creatures.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-text-secondary">Criaturas</div>
              {creatures.map((creature) => (
                <SelectItem key={creature.id} value={`creature-${creature.id}`}>
                  {creature.name}
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      {state.selectedToken && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRemoveToken}
          className="w-full mt-2 text-white hover:bg-destructive touch-manipulation"
          title="Remover Token"
        >
          <X className="w-4 h-4 mr-2" />
          Remover Token
        </Button>
      )}
    </div>
  )
}


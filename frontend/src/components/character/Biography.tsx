import { useState, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Character, CharacterUpdateData } from '@/types/character'

interface BiographyProps {
  character: Character
  onUpdate: (updates: CharacterUpdateData) => void
}

/**
 * Componente para biografia do personagem com auto-save
 */
export function Biography({ character, onUpdate }: BiographyProps) {
  const [biography, setBiography] = useState(character.biography || '')
  const [saving, setSaving] = useState(false)
  const debouncedBiography = useDebounce(biography, 2000)

  /**
   * Auto-save quando biografia muda (após debounce)
   */
  useEffect(() => {
    if (debouncedBiography !== (character.biography || '')) {
      setSaving(true)
      onUpdate({ biography: debouncedBiography })
      setTimeout(() => setSaving(false), 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBiography, character.biography])

  return (
    <div className="space-y-2">
      <Textarea
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        placeholder="Escreva a biografia do seu personagem aqui..."
        className="min-h-[200px]"
      />
      {saving && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Save className="w-4 h-4" />
          Salvando...
        </div>
      )}
    </div>
  )
}


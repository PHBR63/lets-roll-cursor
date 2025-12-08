/**
 * Componente de Configurações de Acessibilidade
 * Permite ao usuário desabilitar efeitos visuais e sonoros
 */
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAccessibility, updateAccessibilityPreferences } from '@/hooks/useAccessibility'
import { Settings, Eye, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface AccessibilitySettingsProps {
  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Componente de Configurações de Acessibilidade
 */
export function AccessibilitySettings({ className }: AccessibilitySettingsProps) {
  const { disableVisualEffects, disableSounds } = useAccessibility()
  const [localDisableVisual, setLocalDisableVisual] = useState(disableVisualEffects)
  const [localDisableSounds, setLocalDisableSounds] = useState(disableSounds)
  const toast = useToast()

  useEffect(() => {
    setLocalDisableVisual(disableVisualEffects)
    setLocalDisableSounds(disableSounds)
  }, [disableVisualEffects, disableSounds])

  const handleVisualEffectsChange = (enabled: boolean) => {
    setLocalDisableVisual(!enabled)
    updateAccessibilityPreferences({ disableVisualEffects: !enabled })
    toast.toast({
      title: enabled ? 'Efeitos visuais habilitados' : 'Efeitos visuais desabilitados',
      description: 'As mudanças serão aplicadas imediatamente.',
    })
  }

  const handleSoundsChange = (enabled: boolean) => {
    setLocalDisableSounds(!enabled)
    updateAccessibilityPreferences({ disableSounds: !enabled })
    toast.toast({
      title: enabled ? 'Sons habilitados' : 'Sons desabilitados',
      description: 'As mudanças serão aplicadas imediatamente.',
    })
  }

  return (
    <Card className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-white" />
        <h3 className="text-white font-semibold text-lg">Acessibilidade</h3>
      </div>

      <div className="space-y-4">
        {/* Efeitos Visuais */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-white" />
            <div>
              <Label htmlFor="visual-effects" className="text-white cursor-pointer">
                Efeitos Visuais de Insanidade
              </Label>
              <p className="text-sm text-gray-400">
                Desabilita auras e animações de insanidade
              </p>
            </div>
          </div>
          <Switch
            id="visual-effects"
            checked={!localDisableVisual}
            onCheckedChange={handleVisualEffectsChange}
          />
        </div>

        {/* Sons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {localDisableSounds ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
            <div>
              <Label htmlFor="sounds" className="text-white cursor-pointer">
                Efeitos Sonoros de Insanidade
              </Label>
              <p className="text-sm text-gray-400">
                Desabilita sons quando SAN está baixa
              </p>
            </div>
          </div>
          <Switch
            id="sounds"
            checked={!localDisableSounds}
            onCheckedChange={handleSoundsChange}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Nota:</strong> O sistema respeita automaticamente a preferência{' '}
          <code className="text-xs bg-blue-900/30 px-1 rounded">prefers-reduced-motion</code>{' '}
          do seu navegador para reduzir animações.
        </p>
      </div>
    </Card>
  )
}


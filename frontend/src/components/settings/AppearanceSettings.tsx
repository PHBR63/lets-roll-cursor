// @ts-nocheck
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme, Theme, CustomTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'
import { transitions } from '@/utils/animations'

/**
 * Componente de configurações de aparência
 */
export function AppearanceSettings() {
  const { theme, customTheme, setTheme, setCustomTheme, resetTheme } = useTheme()
  const [customColors, setCustomColors] = useState<CustomTheme['colors']>(
    customTheme?.colors || {
      primary: '#8000FF',
      background: '#1A0033',
      card: '#2A2A3A',
      text: '#FFFFFF',
      accent: '#8000FF',
    }
  )

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const handleCustomColorChange = (colorKey: keyof CustomTheme['colors'], value: string) => {
    const newColors = { ...customColors, [colorKey]: value }
    setCustomColors(newColors)
    setCustomTheme({
      name: 'Custom',
      colors: newColors,
    })
  }

  const handleSaveCustom = () => {
    setCustomTheme({
      name: 'Custom',
      colors: customColors,
    })
    setTheme('custom')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Escolha o tema visual da aplicação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema Atual</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark-purple">Roxo Escuro (Padrão)</SelectItem>
                <SelectItem value="light-purple">Roxo Claro</SelectItem>
                <SelectItem value="dark-blue">Azul Escuro</SelectItem>
                <SelectItem value="dark-green">Verde Escuro</SelectItem>
                <SelectItem value="high-contrast">Alto Contraste</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {theme === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={transitions.normal}
              className="space-y-4 pt-4 border-t border-card-secondary"
            >
              <Label>Cores Personalizadas</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Card</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColors.card}
                      onChange={(e) => handleCustomColorChange('card', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={customColors.card}
                      onChange={(e) => handleCustomColorChange('card', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Accent</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveCustom} className="w-full">
                Salvar Tema Personalizado
              </Button>
            </motion.div>
          )}

          <div className="pt-4 border-t border-card-secondary">
            <Button variant="outline" onClick={resetTheme} className="w-full">
              Redefinir para Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


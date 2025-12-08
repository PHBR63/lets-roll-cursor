/**
 * Página de Configurações
 * Centraliza todas as configurações do usuário
 */
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AccessibilitySettings } from '@/components/settings/AccessibilitySettings'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, User, Bell, Palette } from 'lucide-react'

/**
 * Página de Configurações
 */
export function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
          </div>

          {/* Tabs de Configurações */}
          <Tabs defaultValue="accessibility" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Acessibilidade
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </TabsTrigger>
            </TabsList>

            {/* Acessibilidade */}
            <TabsContent value="accessibility" className="mt-6">
              <AccessibilitySettings />
            </TabsContent>

            {/* Notificações */}
            <TabsContent value="notifications" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold text-lg">Notificações</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Configurações de notificações em breve...
                </p>
              </Card>
            </TabsContent>

            {/* Perfil */}
            <TabsContent value="profile" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold text-lg">Perfil</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Configurações de perfil em breve...
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}


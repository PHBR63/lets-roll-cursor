import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

/**
 * Componente para prompt de instalação PWA
 * Mostra banner quando a aplicação pode ser instalada
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Verificar se já foi instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) {
      return
    }

    // Escutar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Verificar se usuário já rejeitou antes
      const hasRejected = localStorage.getItem('pwa-install-rejected')
      if (!hasRejected) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso')
    } else {
      localStorage.setItem('pwa-install-rejected', 'true')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-rejected', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-card-secondary rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Instalar Let's Roll</h3>
          <p className="text-text-secondary text-sm">
            Instale o app para acesso rápido e experiência offline melhorada.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 text-text-secondary hover:text-white"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          onClick={handleInstall}
          className="flex-1 bg-accent hover:bg-accent/90"
        >
          Instalar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDismiss}
          className="flex-1"
        >
          Agora não
        </Button>
      </div>
    </div>
  )
}

// @ts-nocheck
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Hook para gerenciar PWA (instalação, atualizações, offline)
 */
export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Detectar se app está instalado
  useEffect(() => {
    // Verificar se está rodando como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://')
    
    setIsInstalled(isStandalone)
  }, [])

  // Detectar prompt de instalação
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Registrar Service Worker e detectar atualizações
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg)

          // Detectar atualizações
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Novo Service Worker disponível
                  setUpdateAvailable(true)
                }
              })
            }
          })

          // Verificar atualizações periodicamente
          setInterval(() => {
            reg.update()
          }, 60000) // A cada minuto
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error)
        })
    }
  }, [])

  // Instalar PWA
  const install = async (): Promise<boolean> => {
    if (!installPrompt) {
      return false
    }

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao instalar PWA:', error)
      return false
    }
  }

  // Atualizar Service Worker
  const update = async () => {
    if (!registration) {
      return
    }

    try {
      await registration.update()
      
      // Aguardar novo worker estar pronto
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error)
    }
  }

  // Solicitar permissão para push notifications
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Enviar push notification (para testes)
  const sendTestNotification = async (title: string, body: string) => {
    if (!registration) {
      return
    }

    const permission = await requestNotificationPermission()
    
    if (permission === 'granted') {
      await registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test',
      })
    }
  }

  return {
    installPrompt,
    isInstalled,
    isOnline,
    updateAvailable,
    install,
    update,
    requestNotificationPermission,
    sendTestNotification,
  }
}


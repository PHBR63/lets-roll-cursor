/**
 * Handler global de erros para evitar que erros de extensões do navegador
 * ou bibliotecas externas quebrem a aplicação
 * 
 * IMPORTANTE: Este script deve ser carregado ANTES de qualquer outro script
 * para interceptar erros de extensões do navegador (como autoPip.js)
 */
(function() {
  'use strict';

  // Tratar erro de MediaSession (pode ser de extensão do navegador como autoPip.js)
  // Aplicar o wrapper ANTES de qualquer outro script tentar usar MediaSession
  // Interceptar na criação do objeto navigator.mediaSession se possível
  if (typeof navigator !== 'undefined') {
    // Lista completa de ações válidas do MediaSession API
    const supportedActions = [
      'play', 
      'pause', 
      'seekbackward', 
      'seekforward', 
      'previoustrack', 
      'nexttrack', 
      'seekto', 
      'stop'
    ];
    
    // Função para aplicar o wrapper no setActionHandler
    const wrapMediaSession = () => {
      if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
        const original = navigator.mediaSession.setActionHandler;
        try {
          Object.defineProperty(navigator.mediaSession, 'setActionHandler', {
            value: function(action, handler) {
              if (!supportedActions.includes(action)) {
                return undefined;
              }
              try {
                return original.call(navigator.mediaSession, action, handler);
              } catch (e) {
                return undefined;
              }
            },
            writable: true,
            configurable: true
          });
        } catch (e) {
          // Fallback: substituição direta
          navigator.mediaSession.setActionHandler = function(action, handler) {
            if (!supportedActions.includes(action)) return undefined;
            try {
              return original.call(navigator.mediaSession, action, handler);
            } catch (e) {
              return undefined;
            }
          };
        }
      }
    };
    
    // Tentar interceptar imediatamente
    wrapMediaSession();
    
    // Tentar novamente após um pequeno delay (caso mediaSession ainda não exista)
    setTimeout(wrapMediaSession, 0);
    
    // Interceptar quando mediaSession for criado
    if (!navigator.mediaSession) {
      let mediaSessionProxy = null;
      Object.defineProperty(navigator, 'mediaSession', {
        get: function() {
          if (!mediaSessionProxy && this._mediaSession) {
            mediaSessionProxy = this._mediaSession;
            wrapMediaSession();
          }
          return mediaSessionProxy || this._mediaSession;
        },
        set: function(value) {
          this._mediaSession = value;
          wrapMediaSession();
        },
        configurable: true
      });
    }
  }

  // Handler global de erros não capturados
  // Usar capture phase para interceptar antes de outros handlers
  window.addEventListener('error', function(event) {
    // Captura erros de extensões do navegador
    const isExtensionError = event.filename && (
      event.filename.includes('chrome-extension://') ||
      event.filename.includes('moz-extension://') ||
      event.filename.includes('safari-extension://') ||
      event.filename.includes('autoPip.js') ||
      event.filename.includes('content.ts') ||
      event.filename.includes('snippets.js') ||
      event.filename.includes('extension://')
    );
    
    // Ignorar erros de MediaSession (incluindo enterpictureinpicture)
    const isMediaSessionError = event.message && (
      event.message.includes('MediaSession') || 
      event.message.includes('enterpictureinpicture') ||
      event.message.includes('setActionHandler') ||
      event.message.includes('MediaSessionAction')
    );
    
    // Captura erros de fetch de extensões
    const isExtensionFetchError = event.message && (
      event.message.includes('Failed to fetch dynamically imported module') ||
      event.message.includes('Failed to fetch') ||
      (event.filename && (
        event.filename.includes('chrome-extension://') ||
        event.filename.includes('content.ts') ||
        event.filename.includes('snippets.js')
      ))
    );
    
    if (isExtensionError || isMediaSessionError || isExtensionFetchError) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    
    // Tratar erro de inicialização do Supabase (pode ser problema de ordem de carregamento)
    if (event.message && (
      event.message.includes('Cannot access') && 
      event.message.includes('before initialization') &&
      (event.filename && event.filename.includes('supabase'))
    )) {
      // Este erro pode ser causado por ordem de carregamento ou minificação
      // Tentar recarregar a página após um delay curto
      console.warn('[App] Erro de inicialização do Supabase detectado, tentando recuperar...');
      event.preventDefault();
      event.stopPropagation();
      // Tentar recarregar apenas uma vez
      if (!window.__supabaseReloadAttempted) {
        window.__supabaseReloadAttempted = true;
        setTimeout(() => {
          if (document.readyState === 'complete') {
            window.location.reload();
          }
        }, 1000);
      }
      return false;
    }
    
    // Tratar erro de 'module is not defined' (código CommonJS não transformado)
    if (event.message && event.message.includes('module is not defined')) {
      // Verificar se é de um arquivo vendor (nossa responsabilidade)
      const isVendorFile = event.filename && (
        event.filename.includes('vendor') || 
        event.filename.includes('chunk') ||
        event.filename.includes('assets/js')
      );
      
      if (isVendorFile) {
        // Erro em arquivo vendor - problema de build, prevenir e logar detalhes
        console.error('CommonJS não transformado detectado no bundle:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        });
        // Prevenir o erro para não quebrar a aplicação
        event.preventDefault();
        event.stopPropagation();
        return false;
      } else {
        // Pode ser de extensão do navegador - apenas logar
        console.warn('Module error (possivelmente de extensão do navegador):', {
          filename: event.filename,
        });
      }
    }
  }, true); // true = usar capture phase para interceptar primeiro

  // Handler de rejeições de promises não tratadas
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const reasonMessage = reason?.message || String(reason || '');
    const reasonStack = reason?.stack || '';
    
    // Captura erros de extensões do navegador
    const isExtensionError = reasonStack && (
      reasonStack.includes('chrome-extension://') ||
      reasonStack.includes('moz-extension://') ||
      reasonStack.includes('safari-extension://') ||
      reasonStack.includes('autoPip.js') ||
      reasonStack.includes('content.ts') ||
      reasonStack.includes('snippets.js')
    );
    
    // Ignorar rejeições relacionadas a MediaSession
    const isMediaSessionError = reasonMessage && reasonMessage.includes('MediaSession');
    
    // Captura erros de fetch de extensões
    const isExtensionFetchError = reasonMessage && (
      reasonMessage.includes('Failed to fetch dynamically imported module') ||
      reasonMessage.includes('Failed to fetch') ||
      reasonStack.includes('chrome-extension://') ||
      reasonStack.includes('content.ts') ||
      reasonStack.includes('snippets.js')
    );
    
    if (isExtensionError || isMediaSessionError || isExtensionFetchError) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
})();


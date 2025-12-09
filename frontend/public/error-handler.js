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
    
    // Função segura para setActionHandler
    const safeSetActionHandler = (action, handler) => {
      if (!supportedActions.includes(action)) {
        return undefined;
      }
      try {
        if ('mediaSession' in navigator && 'setActionHandler' in navigator.mediaSession) {
          return navigator.mediaSession.setActionHandler(action, handler);
        }
      } catch (error) {
        return undefined;
      }
      return undefined;
    };
    
    // ESTRATÉGIA: Interceptar diretamente o setActionHandler sem usar Proxy
    // (Proxy causa problemas com propriedades read-only)
    // Aplicar wrapper diretamente no objeto mediaSession quando disponível
    // NÃO usar Proxy - apenas wrapper direto
    
    // Função para aplicar o wrapper no setActionHandler
    const wrapMediaSession = () => {
      if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
        const original = navigator.mediaSession.setActionHandler;
        try {
          Object.defineProperty(navigator.mediaSession, 'setActionHandler', {
            value: function(action, handler) {
              return safeSetActionHandler(action, handler);
            },
            writable: false,
            configurable: false
          });
        } catch (e) {
          try {
            navigator.mediaSession.setActionHandler = function(action, handler) {
              return safeSetActionHandler(action, handler);
            };
          } catch (e2) {
            // Ignorar
          }
        }
      }
    };
    
    // Interceptar DIRETAMENTE o setActionHandler se já existir
    if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
      try {
        const original = navigator.mediaSession.setActionHandler;
        try {
          Object.defineProperty(navigator.mediaSession, 'setActionHandler', {
            value: function(action, handler) {
              return safeSetActionHandler(action, handler);
            },
            writable: false,
            configurable: false
          });
        } catch (e) {
          navigator.mediaSession.setActionHandler = function(action, handler) {
            return safeSetActionHandler(action, handler);
          };
        }
      } catch (e) {
        // Ignorar
      }
    }
    
    // Aplicar múltiplas vezes para garantir interceptação
    wrapMediaSession();
    setTimeout(wrapMediaSession, 0);
    setTimeout(wrapMediaSession, 1);
    setTimeout(wrapMediaSession, 2);
    setTimeout(wrapMediaSession, 5);
    setTimeout(wrapMediaSession, 10);
    setTimeout(wrapMediaSession, 20);
    setTimeout(wrapMediaSession, 50);
    setTimeout(wrapMediaSession, 100);
    setTimeout(wrapMediaSession, 200);
    setTimeout(wrapMediaSession, 500);
  }

  // Handler global de erros não capturados
  // Usar capture phase para interceptar antes de outros handlers
  // Este handler deve interceptar TODOS os erros relacionados ao MediaSession
  // IMPORTANTE: Não suprimir erros críticos da aplicação
  window.addEventListener('error', function(event) {
    // Verificar se é um erro crítico da aplicação (não de extensão)
    const isAppError = event.filename && (
      event.filename.includes('/src/') ||
      event.filename.includes('/assets/') ||
      event.filename.includes('main.tsx') ||
      event.filename.includes('App.tsx') ||
      (!event.filename.includes('chrome-extension://') &&
       !event.filename.includes('moz-extension://') &&
       !event.filename.includes('safari-extension://') &&
       !event.filename.includes('extension://'))
    );
    
    // Se for erro crítico da aplicação, NÃO suprimir
    if (isAppError && event.error) {
      const errorDetails = {
        message: event.message || 'Erro sem mensagem',
        filename: event.filename || 'Arquivo desconhecido',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        errorName: event.error?.name || 'Unknown',
        errorMessage: event.error?.message || String(event.error || 'Erro desconhecido'),
        errorStack: event.error?.stack || 'Sem stack trace'
      };
      console.error('[App] Erro crítico detectado:', errorDetails);
      console.error('[App] Stack completo:', event.error?.stack);
      // Permitir que o erro seja propagado para o error boundary
      return true;
    }
    
    // Captura erros de extensões do navegador
    const isExtensionError = event.filename && (
      event.filename.includes('chrome-extension://') ||
      event.filename.includes('moz-extension://') ||
      event.filename.includes('safari-extension://') ||
      event.filename.includes('autoPip.js') ||
      event.filename.includes('auto-pip') ||
      event.filename.includes('content.ts') ||
      event.filename.includes('snippets.js') ||
      event.filename.includes('extension://')
    );
    
    // Ignorar erros de MediaSession (incluindo enterpictureinpicture)
    // Verificar tanto a mensagem quanto o filename para garantir interceptação completa
    const isMediaSessionError = (
      (event.message && (
        event.message.includes('MediaSession') || 
        event.message.includes('enterpictureinpicture') ||
        event.message.includes('exitpictureinpicture') ||
        event.message.includes('setActionHandler') ||
        event.message.includes('MediaSessionAction') ||
        event.message.includes('not a valid enum value')
      )) ||
      (event.filename && (
        event.filename.includes('autoPip') ||
        event.filename.includes('auto-pip')
      ))
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
    
    // Captura erros de "message channel closed" (extensões do navegador)
    const isMessageChannelError = event.message && (
      event.message.includes('message channel closed') ||
      event.message.includes('listener indicated an asynchronous response')
    );
    
    // Apenas suprimir erros de extensões, não erros da aplicação
    if (isExtensionError || isMediaSessionError || isExtensionFetchError || isMessageChannelError) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    
    // Captura adicional: qualquer erro que contenha 'autoPip' no filename (case-insensitive)
    if (event.filename && (
      event.filename.toLowerCase().includes('autopip') ||
      event.filename.toLowerCase().includes('auto-pip')
    )) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    
    // Permitir que outros erros sejam propagados
    return true;
    
    // Tratar erro de inicialização do Supabase (pode ser problema de ordem de carregamento)
    // NOTA: Este erro geralmente se resolve sozinho, mas vamos logar para debug
    if (event.message && (
      event.message.includes('Cannot access') && 
      event.message.includes('before initialization') &&
      (event.filename && event.filename.includes('supabase'))
    )) {
      // Este erro pode ser causado por ordem de carregamento ou minificação
      // Logar apenas uma vez para debug, mas não quebrar a aplicação
      if (!window._supabaseInitErrorLogged) {
        console.warn('[Supabase] Erro de inicialização detectado (geralmente se resolve sozinho):', {
          message: event.message,
          filename: event.filename,
          stack: event.error?.stack
        });
        window._supabaseInitErrorLogged = true;
      }
      // Prevenir o erro para não quebrar a aplicação
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
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
    
    // Verificar se é uma rejeição crítica da aplicação
    const isAppRejection = reasonStack && (
      reasonStack.includes('/src/') ||
      reasonStack.includes('/assets/') ||
      reasonStack.includes('main.tsx') ||
      reasonStack.includes('App.tsx') ||
      (!reasonStack.includes('chrome-extension://') &&
       !reasonStack.includes('moz-extension://') &&
       !reasonStack.includes('safari-extension://'))
    );
    
    // Se for rejeição crítica da aplicação, NÃO suprimir
    if (isAppRejection) {
      console.error('[App] Promise rejeitada crítica detectada:', {
        message: reasonMessage,
        stack: reasonStack,
        reason: reason
      });
      // Permitir que a rejeição seja propagada
      return true;
    }
    
    // Captura erros de extensões do navegador
    const isExtensionError = reasonStack && (
      reasonStack.includes('chrome-extension://') ||
      reasonStack.includes('moz-extension://') ||
      reasonStack.includes('safari-extension://') ||
      reasonStack.includes('autoPip.js') ||
      reasonStack.includes('auto-pip') ||
      reasonStack.includes('content.ts') ||
      reasonStack.includes('snippets.js')
    );
    
    // Ignorar rejeições relacionadas a MediaSession
    // Verificar tanto a mensagem quanto o stack para garantir interceptação completa
    const isMediaSessionError = (
      (reasonMessage && (
        reasonMessage.includes('MediaSession') ||
        reasonMessage.includes('setActionHandler') ||
        reasonMessage.includes('enterpictureinpicture') ||
        reasonMessage.includes('exitpictureinpicture') ||
        reasonMessage.includes('MediaSessionAction') ||
        reasonMessage.includes('not a valid enum value')
      )) ||
      (reasonStack && (
        reasonStack.includes('autoPip') ||
        reasonStack.includes('auto-pip')
      ))
    );
    
    // Captura erros de fetch de extensões
    const isExtensionFetchError = reasonMessage && (
      reasonMessage.includes('Failed to fetch dynamically imported module') ||
      reasonMessage.includes('Failed to fetch') ||
      reasonStack.includes('chrome-extension://') ||
      reasonStack.includes('content.ts') ||
      reasonStack.includes('snippets.js')
    );
    
    // Apenas suprimir rejeições de extensões, não da aplicação
    if (isExtensionError || isMediaSessionError || isExtensionFetchError) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    // Permitir que outras rejeições sejam propagadas
    return true;
  });
})();


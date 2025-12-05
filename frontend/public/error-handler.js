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
    
    // Interceptar antes que qualquer extensão possa usar
    // Usar Object.defineProperty para garantir que seja aplicado primeiro
    if (navigator.mediaSession) {
      // Salvar o método original ANTES de substituir
      const originalSetActionHandler = navigator.mediaSession.setActionHandler;
      
      // Substituir setActionHandler com wrapper que valida ações
      try {
        Object.defineProperty(navigator.mediaSession, 'setActionHandler', {
          value: function(action, handler) {
            // Se a ação não é suportada, simplesmente retornar sem erro
            if (!supportedActions.includes(action)) {
              // Ação não suportada (como 'enterpictureinpicture' de extensões)
              // Retornar undefined silenciosamente para evitar erro
              return undefined;
            }
            
            // Se temos o método original, usar ele
            if (originalSetActionHandler) {
              try {
                return originalSetActionHandler.call(navigator.mediaSession, action, handler);
              } catch (e) {
                // Se ainda assim der erro, ignorar silenciosamente
                return undefined;
              }
            }
            
            // Se não temos o original, retornar undefined (não podemos fazer nada)
            return undefined;
          },
          writable: true,
          configurable: true
        });
      } catch (e) {
        // Se não conseguir usar defineProperty, tentar substituição direta
        navigator.mediaSession.setActionHandler = function(action, handler) {
          if (!supportedActions.includes(action)) {
            return undefined;
          }
          if (originalSetActionHandler) {
            try {
              return originalSetActionHandler.call(navigator.mediaSession, action, handler);
            } catch (e) {
              return undefined;
            }
          }
          return undefined;
        };
      }
    } else {
      // Se mediaSession ainda não existe, interceptar quando for criado
      let mediaSessionCreated = false;
      const originalDefineProperty = Object.defineProperty;
      Object.defineProperty(navigator, 'mediaSession', {
        get: function() {
          if (!mediaSessionCreated && this._mediaSession) {
            mediaSessionCreated = true;
            // Aplicar wrapper quando mediaSession for acessado pela primeira vez
            const original = this._mediaSession.setActionHandler;
            this._mediaSession.setActionHandler = function(action, handler) {
              if (!supportedActions.includes(action)) {
                return undefined;
              }
              if (original) {
                try {
                  return original.call(this, action, handler);
                } catch (e) {
                  return undefined;
                }
              }
              return undefined;
            };
          }
          return this._mediaSession;
        },
        set: function(value) {
          this._mediaSession = value;
        },
        configurable: true
      });
    }
  }

  // Handler global de erros não capturados
  // Usar capture phase para interceptar antes de outros handlers
  window.addEventListener('error', function(event) {
    // Ignorar erros de MediaSession (incluindo enterpictureinpicture)
    if (event.message && (
      event.message.includes('MediaSession') || 
      event.message.includes('enterpictureinpicture') ||
      event.message.includes('setActionHandler') ||
      (event.filename && event.filename.includes('autoPip.js'))
    )) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    
    // Tratar erro de inicialização do Supabase (pode ser problema de ordem de carregamento)
    if (event.message && (
      event.message.includes('Cannot access') && 
      event.message.includes('before initialization') &&
      event.filename && event.filename.includes('supabase-vendor')
    )) {
      // Este erro pode ser causado por ordem de carregamento
      // Tentar recarregar a página após um delay se for crítico
      console.warn('Supabase initialization error detected, may need page reload');
      // Não prevenir o erro, mas logar para debug
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
    // Ignorar rejeições relacionadas a MediaSession
    if (event.reason && event.reason.message && event.reason.message.includes('MediaSession')) {
      event.preventDefault();
      return false;
    }
  });
})();


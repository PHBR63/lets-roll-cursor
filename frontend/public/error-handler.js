/**
 * Handler global de erros para evitar que erros de extensões do navegador
 * ou bibliotecas externas quebrem a aplicação
 */
(function() {
  'use strict';

  // Tratar erro de MediaSession (pode ser de extensão do navegador)
  if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
    const originalSetActionHandler = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    
    navigator.mediaSession.setActionHandler = function(action, handler) {
      try {
        // Verificar se a ação é suportada
        const supportedActions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'seekto', 'stop'];
        if (supportedActions.includes(action)) {
          return originalSetActionHandler(action, handler);
        }
      } catch (e) {
        // Ignorar erros de ações não suportadas
        console.warn('MediaSession action not supported:', action, e);
      }
    };
  }

  // Handler global de erros não capturados
  window.addEventListener('error', function(event) {
    // Ignorar erros de MediaSession
    if (event.message && event.message.includes('MediaSession')) {
      event.preventDefault();
      return false;
    }
    
    // Log de erros de 'module is not defined' para debug (não prevenir, apenas logar)
    if (event.message && event.message.includes('module is not defined')) {
      console.warn('Module error detected (may be from extension or untransformed code):', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
      // Não prevenir o erro, apenas logar para debug
    }
  });

  // Handler de rejeições de promises não tratadas
  window.addEventListener('unhandledrejection', function(event) {
    // Ignorar rejeições relacionadas a MediaSession
    if (event.reason && event.reason.message && event.reason.message.includes('MediaSession')) {
      event.preventDefault();
      return false;
    }
  });
})();


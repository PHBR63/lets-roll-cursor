/**
 * Handler global de erros para evitar que erros de extensões do navegador
 * ou bibliotecas externas quebrem a aplicação
 */
(function() {
  'use strict';

  // Tratar erro de MediaSession (pode ser de extensão do navegador como autoPip.js)
  if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
    const originalSetActionHandler = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
    
    navigator.mediaSession.setActionHandler = function(action, handler) {
      try {
        // Verificar se a ação é suportada (lista completa de ações válidas)
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
        
        // Se a ação não é suportada, simplesmente ignorar (não chamar original)
        if (!supportedActions.includes(action)) {
          // Ação não suportada (como 'enterpictureinpicture' de extensões)
          return;
        }
        
        return originalSetActionHandler(action, handler);
      } catch (e) {
        // Ignorar erros de ações não suportadas
        // Não logar para evitar poluição do console
      }
    };
  }

  // Handler global de erros não capturados
  window.addEventListener('error', function(event) {
    // Ignorar erros de MediaSession (incluindo enterpictureinpicture)
    if (event.message && (
      event.message.includes('MediaSession') || 
      event.message.includes('enterpictureinpicture') ||
      event.filename && event.filename.includes('autoPip.js')
    )) {
      event.preventDefault();
      event.stopPropagation();
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


// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível
              if (confirm('Nova versão disponível! Recarregar para atualizar?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(error => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}

// Detectar modo offline
window.addEventListener('offline', () => {
  document.dispatchEvent(new CustomEvent('offlineStatus', { detail: false }));
});

window.addEventListener('online', () => {
  document.dispatchEvent(new CustomEvent('offlineStatus', { detail: true }));
});

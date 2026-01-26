// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              const updateEvent = new CustomEvent('pwaUpdateAvailable');
              window.dispatchEvent(updateEvent);
            }
          });
        });
      })
      .catch(error => {
        console.log('Falha ao registrar Service Worker:', error);
      });
  });
}

// Detect offline/online
window.addEventListener('offline', () => {
  document.dispatchEvent(new CustomEvent('networkStatus', { detail: false }));
});

window.addEventListener('online', () => {
  document.dispatchEvent(new CustomEvent('networkStatus', { detail: true }));
});

// PWA install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  const installEvent = new CustomEvent('pwaInstallAvailable', { detail: e });
  window.dispatchEvent(installEvent);
});

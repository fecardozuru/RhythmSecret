// /src/hooks/usePWA.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciamento de PWA
 * Lida com instalação, atualização e recursos offline
 */
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serviceWorker, setServiceWorker] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  // Detecta se o app está rodando em modo standalone (PWA instalado)
  useEffect(() => {
    const checkDisplayMode = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');
      setIsStandalone(isStandalone);
    };

    checkDisplayMode();
    window.addEventListener('appinstalled', checkDisplayMode);

    return () => {
      window.removeEventListener('appinstalled', checkDisplayMode);
    };
  }, []);

  // Monitora conexão de rede
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registra Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          setRegistration(reg);
          setServiceWorker(reg.installing || reg.waiting || reg.active);

          // Monitora atualizações do Service Worker
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            setServiceWorker(newWorker);

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });

          // Verifica se há atualização imediatamente
          if (reg.waiting) {
            setUpdateAvailable(true);
          }

          // Escuta mensagens do Service Worker
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      };

      // Aguarda o app carregar antes de registrar o Service Worker
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }
  }, []);

  // Captura evento de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Previne que o prompt padrão apareça
      e.preventDefault();
      // Guarda o evento para usar depois
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Função para instalar o PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Mostra o prompt de instalação
      deferredPrompt.prompt();
      
      // Aguarda a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      // Limpa o prompt guardado
      setDeferredPrompt(null);
      
      console.log(`User response to the install prompt: ${outcome}`);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Função para verificar atualizações
  const checkForUpdates = useCallback(async () => {
    if (!registration) return false;

    try {
      await registration.update();
      return true;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }, [registration]);

  // Função para aplicar atualização
  const applyUpdate = useCallback(() => {
    if (!serviceWorker || serviceWorker.state !== 'installed') {
      return false;
    }

    // Envia mensagem para o Service Worker para pular a espera
    serviceWorker.postMessage({ type: 'SKIP_WAITING' });
    setUpdateAvailable(false);
    
    return true;
  }, [serviceWorker]);

  // Função para cachear assets adicionais
  const cacheAssets = useCallback(async (assets) => {
    if (!serviceWorker) return false;

    try {
      serviceWorker.postMessage({
        type: 'CACHE_ASSETS',
        assets
      });
      return true;
    } catch (error) {
      console.error('Error caching assets:', error);
      return false;
    }
  }, [serviceWorker]);

  // Função para sincronizar em background
  const syncInBackground = useCallback(async (tag = 'sync-presets') => {
    if (!('sync' in registration)) {
      console.log('Background Sync not supported');
      return false;
    }

    try {
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background Sync registration failed:', error);
      return false;
    }
  }, [registration]);

  // Função para enviar notificação
  const sendNotification = useCallback(async (title, options) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('Notifications not supported or permission not granted');
      return false;
    }

    try {
      if (serviceWorker) {
        serviceWorker.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [serviceWorker]);

  // Solicita permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, []);

  // Monitora storage do app
  const [storageEstimate, setStorageEstimate] = useState(null);
  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageEstimate(estimate);
      });
    }
  }, []);

  // Solicita persistência de storage
  const persistStorage = useCallback(async () => {
    if (!navigator.storage || !navigator.storage.persist) {
      return false;
    }

    try {
      const persisted = await navigator.storage.persist();
      console.log(`Storage persisted: ${persisted}`);
      return persisted;
    } catch (error) {
      console.error('Error persisting storage:', error);
      return false;
    }
  }, []);

  return {
    // Estado
    canInstall: !!deferredPrompt,
    isStandalone,
    isOnline,
    updateAvailable,
    serviceWorkerReady: !!serviceWorker && serviceWorker.state === 'activated',
    storageEstimate,
    
    // Ações
    installPWA,
    checkForUpdates,
    applyUpdate,
    cacheAssets,
    syncInBackground,
    sendNotification,
    requestNotificationPermission,
    persistStorage,
    
    // Informações
    supportsPWA: 'serviceWorker' in navigator && 'PushManager' in window,
    supportsInstall: 'beforeinstallprompt' in window,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'SyncManager' in window,
    supportsNotifications: 'Notification' in window,
    supportsStorage: 'storage' in navigator,
  };
}

export default usePWA;

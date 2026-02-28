import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Firebase initialization removida — login desativado.
// O Firebase é inicializado pelo src/services/firebase.js quando necessário.
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// Theme initialization
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('rhythm-trainer-theme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Add theme class to body
  const themeClasses = {
    default: 'bg-gray-950 text-white',
    instagram: 'bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 text-white',
    tiktok: 'bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white',
    pro: 'bg-gradient-to-br from-amber-950 via-gray-900 to-amber-950 text-amber-50'
  };
  
  document.body.className = themeClasses[savedTheme] || themeClasses.default;
};

// Initialize theme
initializeTheme();

// Performance monitoring
if (import.meta.env.DEV) {
  console.log('🔧 Modo desenvolvimento ativo');
  
  // Log performance
  const startTime = performance.now();
  
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`🚀 App carregado em ${loadTime.toFixed(2)}ms`);
  });
}

// Error boundary for the entire app
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro no aplicativo:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 backdrop-blur-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold mb-3">Oops! Algo deu errado</h1>
              <p className="text-gray-400 mb-6">
                O Rhythm Trainer encontrou um erro. Tente recarregar a página.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:scale-105 transition-transform"
                >
                  Recarregar Aplicação
                </button>
                
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold hover:scale-105 transition-transform border border-gray-700"
                >
                  Limpar Cache e Recarregar
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root and render
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);

// Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              const updateEvent = new CustomEvent('appUpdateAvailable');
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

// Handle offline/online events
window.addEventListener('offline', () => {
  document.dispatchEvent(new CustomEvent('connectionStatus', { 
    detail: { online: false } 
  }));
  console.log('🔌 Você está offline');
});

window.addEventListener('online', () => {
  document.dispatchEvent(new CustomEvent('connectionStatus', { 
    detail: { online: true } 
  }));
  console.log('🔌 Conexão restaurada');
});

// Expose app version for debugging
window.RHYTHM_TRAINER_VERSION = '1.0.0';

// Register beforeinstallprompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button
  const installBtn = document.getElementById('install-pwa-btn');
  if (installBtn) {
    installBtn.style.display = 'flex';
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Usuário ${outcome} a instalação`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }
});

// Detect if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  document.body.classList.add('pwa-installed');
  console.log('📱 Executando como PWA');
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log('Firebase inicializado com sucesso!');
  
  // Make available globally for debugging (optional)
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDb = db;
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

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
    
    // Report error to analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 backdrop-blur-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.464 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-500 mb-2">Detalhes do erro:</p>
                <pre className="text-xs bg-black/30 p-3 rounded-lg overflow-auto max-h-32">
                  {this.state.error?.toString()}
                </pre>
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
              if (confirm('📱 Nova versão disponível! Recarregar para atualizar?')) {
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

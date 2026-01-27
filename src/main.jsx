// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Verificar se o Firebase está configurado
if (import.meta.env.PROD) {
  console.log('RhythmSecret - Production Mode');
} else {
  console.log('RhythmSecret - Development Mode');
}

// Inicializar React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar aplicação
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Error Boundary global
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// /src/components/pwa/OfflineIndicator.jsx

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';

/**
 * Componente que mostra o status de conexão do usuário
 * Funciona como um Progressive Web App com feedback visual
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitora mudanças no status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      
      // Auto-esconde a notificação após 3 segundos
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      // Simula uma sincronização
      if (lastSync) {
        simulateSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    // Atualiza o timestamp da última sincronização
    const updateLastSync = () => {
      setLastSync(new Date());
    };

    // Event listeners nativos do navegador
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listeners personalizados para sincronização
    window.addEventListener('presetSaved', updateLastSync);
    window.addEventListener('presetLoaded', updateLastSync);

    // Verificação inicial
    if (navigator.onLine) {
      updateLastSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('presetSaved', updateLastSync);
      window.removeEventListener('presetLoaded', updateLastSync);
    };
  }, [lastSync]);

  // Simula o processo de sincronização
  const simulateSync = () => {
    setIsSyncing(true);
    
    // Simula um delay de rede
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date());
      
      // Dispara evento personalizado
      window.dispatchEvent(new CustomEvent('syncComplete'));
    }, 1500);
  };

  // Tenta reconectar manualmente
  const handleRetryConnection = () => {
    if (!isOnline) {
      setIsSyncing(true);
      
      // Simula tentativa de reconexão
      setTimeout(() => {
        if (navigator.onLine) {
          setIsOnline(true);
          setShowNotification(true);
          simulateSync();
        }
        setIsSyncing(false);
      }, 1000);
    }
  };

  // Formata o tempo desde a última sincronização
  const formatLastSync = () => {
    if (!lastSync) return 'Nunca sincronizado';
    
    const now = new Date();
    const diffMs = now - lastSync;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} h atrás`;
    return `${diffDays} dias atrás`;
  };

  // Status detalhado para tooltip/expand
  const getStatusDetails = () => {
    if (isOnline) {
      return {
        title: 'Conectado',
        description: 'Sua conexão está ativa e estável',
        icon: <Wifi className="w-4 h-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20'
      };
    } else {
      return {
        title: 'Modo Offline',
        description: 'Algumas funcionalidades podem estar limitadas',
        icon: <WifiOff className="w-4 h-4" />,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20'
      };
    }
  };

  const status = getStatusDetails();

  return (
    <div className="relative">
      {/* Indicador principal - sempre visível */}
      <div className="relative">
        <button
          onClick={() => setShowNotification(!showNotification)}
          className={`
            flex items-center justify-center
            w-8 h-8 rounded-full
            transition-all duration-300
            hover:scale-110 active:scale-95
            ${status.bgColor} ${status.borderColor}
            border backdrop-blur-sm
            ${isSyncing ? 'animate-pulse' : ''}
          `}
          title={isOnline ? 'Conectado' : 'Offline'}
        >
          <div className={`${status.color}`}>
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
          </div>
          
          {/* Ping animado para status online */}
          {isOnline && !isSyncing && (
            <span className="absolute inset-0">
              <span className="absolute inset-0 animate-ping bg-green-500/20 rounded-full"></span>
            </span>
          )}
        </button>
      </div>

      {/* Notificação expandida */}
      {showNotification && (
        <div className={`
          absolute top-full right-0 mt-2
          w-64 p-4 rounded-xl
          backdrop-blur-xl
          border shadow-2xl
          animate-in slide-in-from-top-2
          duration-300 z-50
          ${status.bgColor} ${status.borderColor}
          border
        `}>
          <div className="space-y-3">
            {/* Cabeçalho do status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${status.bgColor}`}>
                  {status.icon}
                </div>
                <div>
                  <h3 className={`font-semibold ${status.color}`}>
                    {status.title}
                  </h3>
                  <p className="text-xs opacity-75">
                    {status.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowNotification(false)}
                className="text-xs opacity-50 hover:opacity-100 transition"
              >
                Fechar
              </button>
            </div>

            {/* Detalhes da conexão */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-75">Última sincronização:</span>
                <span className="font-medium">
                  {formatLastSync()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-75">Presets offline:</span>
                <span className="font-medium">
                  {isOnline ? '3 disponíveis' : 'Apenas locais'}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-3">
              {!isOnline ? (
                <button
                  onClick={handleRetryConnection}
                  disabled={isSyncing}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-1.5 text-xs rounded-lg
                    transition-all duration-200
                    ${isSyncing 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                    }
                    disabled:opacity-50
                  `}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Tentar reconectar
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={simulateSync}
                  disabled={isSyncing}
                  className={`
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-1.5 text-xs rounded-lg
                    transition-all duration-200
                    ${isSyncing 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                    }
                    disabled:opacity-50
                  `}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3 h-3" />
                      Sincronizar agora
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => {
                  // Dispara evento para mostrar gerenciador de presets
                  window.dispatchEvent(new CustomEvent('showPresetManager'));
                  setShowNotification(false);
                }}
                className={`
                  flex items-center justify-center
                  px-3 py-1.5 text-xs rounded-lg
                  bg-white/10 hover:bg-white/20
                  transition-colors duration-200
                `}
              >
                <CloudOff className="w-3 h-3 mr-1" />
                Presets
              </button>
            </div>

            {/* Dica para usuários offline */}
            {!isOnline && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-start gap-1.5 text-xs opacity-75">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <p>
                    Você pode continuar usando o Rhythm Trainer offline. 
                    Seus presets locais estão disponíveis.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Seta do tooltip */}
          <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 border-l border-t backdrop-blur-xl"></div>
        </div>
      )}

      {/* Overlay para fechar ao clicar fora */}
      {showNotification && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

// Propriedades do componente PWA
OfflineIndicator.pwaConfig = {
  offlineSupport: true,
  syncInterval: 30000, // 30 segundos
  cacheStrategy: 'NetworkFirst',
  version: '1.0.0'
};

export default OfflineIndicator;

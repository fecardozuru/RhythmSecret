// /src/components/pwa/OfflineIndicator.jsx

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

/**
 * OfflineIndicator - Mostra status de conexão e recursos offline
 */
const OfflineIndicator = ({
  theme = 'default',
  showAlways = false,
  position = 'top-right',
  className = '',
}) => {
  const { isOnline, checkForUpdates } = usePWA();
  const [isVisible, setIsVisible] = useState(!isOnline);
  const [isChecking, setIsChecking] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [offlineSince, setOfflineSince] = useState(null);

  // Monitora mudanças de conexão
  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
      setOfflineSince(new Date());
    } else {
      // Esconde após 3 segundos quando voltar online
      const timer = setTimeout(() => {
        if (!showAlways) setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, showAlways]);

  // Atualiza último sync
  useEffect(() => {
    if (isOnline) {
      setLastSync(new Date());
    }
  }, [isOnline]);

  // Posições
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  // Temas
  const themeColors = {
    default: {
      online: 'bg-green-500/20 border-green-500/30 text-green-400',
      offline: 'bg-red-500/20 border-red-500/30 text-red-400',
      checking: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    },
    'pro-gold': {
      online: 'bg-green-500/20 border-green-500/30 text-green-400',
      offline: 'bg-red-500/20 border-red-500/30 text-red-400',
      checking: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    },
  };

  const colors = themeColors[theme] || themeColors.default;
  const statusColor = isChecking ? colors.checking : isOnline ? colors.online : colors.offline;

  // Calcula tempo offline
  const getOfflineDuration = () => {
    if (!offlineSince || isOnline) return null;
    
    const diff = new Date() - offlineSince;
    const minutes = Math.floor(diff /

// /src/components/ui/StatusBar.jsx

import React, { useState, useEffect } from 'react';
import {
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  Cpu,
  Thermometer,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts';
import { formatTime, formatBatteryLevel } from '../../utils/formatters';

/**
 * Barra de status com informações do sistema
 * Mostra bateria, conexão, performance e outras métricas
 */
const StatusBar = ({
  isPlaying = false,
  bpm = 120,
  cpuUsage = 0.3,
  memoryUsage = 0.5,
  temperature = 36.5,
  showAudioStats = true,
  showSystemStats = false,
  compact = false,
  onToggleSystemStats,
  onToggleAudioStats
}) => {
  const { currentTheme, themeClasses } = useTheme();
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioLatency, setAudioLatency] = useState(25);
  const [audioBufferSize, setAudioBufferSize] = useState(2048);
  const [isPeakClipping, setIsPeakClipping] = useState(false);

  // Atualiza hora atual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Monitora bateria
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const updateBatteryInfo = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };
        
        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
        
        return () => {
          battery.removeEventListener('levelchange', updateBatteryInfo);
          battery.removeEventListener('chargingchange', updateBatteryInfo);
        };
      });
    }
  }, []);

  // Monitora conexão
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

  // Simula métricas de áudio
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      // Simula variação de latência
      setAudioLatency(prev => {
        const variation = Math.random() * 5 - 2.5;
        const newLatency = prev + variation;
        return Math.max(15, Math.min(50, newLatency));
      });
      
      // Simula clipping ocasional
      if (Math.random() < 0.1) {
        setIsPeakClipping(true);
        setTimeout(() => setIsPeakClipping(false), 500);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Cor da bateria baseada no nível
  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-500';
    if (batteryLevel > 20) return 'text-amber-500';
    return 'text-red-500';
  };

  // Cor da latência
  const getLatencyColor = () => {
    if (audioLatency < 20) return 'text-green-500';
    if (audioLatency < 35) return 'text-amber-500';
    return 'text-red-500';
  };

  // Ícone da bateria
  const getBatteryIcon = () => {
    if (isCharging) {
      return <BatteryCharging className="w-4 h-4" />;
    }
    
    if (batteryLevel > 75) {
      return <Battery className="w-4 h-4" />;
    }
    
    return <Battery className="w-4 h-4" />;
  };

  if (compact) {
    return (
      <div className={`
        px-3 py-2 rounded-xl
        ${themeClasses.surface}
        ${themeClasses.border}
        backdrop-blur-sm
        flex items-center justify-between
        transition-all duration-300
      `}>
        {/* Esquerda: Status de áudio */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${getLatencyColor()}`}>
            <Volume2 className="w-3 h-3" />
            <span className="text-xs font-mono">{audioLatency.toFixed(0)}ms</span>
          </div>
          
          {isPeakClipping && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">CLIP</span>
            </div>
          )}
        </div>

        {/* Centro: Tempo atual */}
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 opacity-50" />
          <span className="text-xs font-mono">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Direita: Sistema */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-green-500" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-500" />
            )}
          </div>
          
          <div className={`flex items-center gap-1 ${getBatteryColor()}`}>
            {getBatteryIcon()}
            <span className="text-xs">{batteryLevel}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      p-4 rounded-2xl
      ${themeClasses.surface}
      ${themeClasses.border}
      backdrop-blur-sm
      transition-all duration-300
    `}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          Status do Sistema
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAudioStats}
            className={`
              px-3 py-1 rounded-lg text-sm
              ${showAudioStats ? themeClasses.primary : themeClasses.surface}
              transition-colors duration-200
            `}
          >
            Áudio
          </button>
          <button
            onClick={onToggleSystemStats}
            className={`
              px-3 py-1 rounded-lg text-sm
              ${showSystemStats ? themeClasses.primary : themeClasses.surface}
              transition-colors duration-200
            `}
          >
            Sistema
          </button>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bateria */}
        <div className={`
          p-3 rounded-xl
          ${themeClasses.secondary}
          ${isCharging ? 'border-2 border-green-500/50' : ''}
          transition-all duration-300
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${getBatteryColor()} bg-opacity-20`}>
                {getBatteryIcon()}
              </div>
              <span className="text-sm font-medium">Bateria</span>
            </div>
            <span className={`text-lg font-bold ${getBatteryColor()}`}>
              {batteryLevel}%
            </span>
          </div>
          
          {/* Barra de progresso da bateria */}
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                batteryLevel > 50 ? 'bg-green-500' : 
                batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
          
          <div className="text-xs opacity-75 mt-2">
            {isCharging ? 'Carregando...' : formatBatteryLevel(batteryLevel)}
          </div>
        </div>

        {/* Conexão */}
        <div className={`
          p-3 rounded-xl
          ${themeClasses.secondary}
          ${isOnline ? 'border-2 border-green-500/50' : 'border-2 border-amber-500/50'}
          transition-all duration-300
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${
                isOnline ? 'text-green-500 bg-green-500/20' : 'text-amber-500 bg-amber-500/20'
              }`}>
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">Conexão</span>
            </div>
            <span className={`text-lg font-bold ${
              isOnline ? 'text-green-500' : 'text-amber-500'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="opacity-75">Rede:</span>
              <span>{isOnline ? 'Estável' : 'Sem conexão'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Firebase:</span>
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Conectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span>Local</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Performance de Áudio */}
        {showAudioStats && (
          <div className={`
            p-3 rounded-xl
            ${themeClasses.secondary}
            ${isPeakClipping ? 'border-2 border-red-500/50 animate-pulse' : ''}
            transition-all duration-300
          `}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${
                  isPeakClipping ? 'text-red-500 bg-red-500/20' : 
                  audioLatency < 20 ? 'text-green-500 bg-green-500/20' :
                  'text-amber-500 bg-amber-500/20'
                }`}>
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Áudio</span>
              </div>
              <span className={`text-lg font-bold ${getLatencyColor()}`}>
                {audioLatency.toFixed(0)}ms
              </span>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="opacity-75">Latência:</span>
                <span className={getLatencyColor()}>
                  {audioLatency.toFixed(1)}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Buffer:</span>
                <span>{audioBufferSize} samples</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Clipping:</span>
                <span className={isPeakClipping ? 'text-red-500' : 'text-green-500'}>
                  {isPeakClipping ? 'DETECTADO' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Performance do Sistema */}
        {showSystemStats && (
          <div className={`
            p-3 rounded-xl
            ${themeClasses.secondary}
            transition-all duration-300
          `}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${
                  cpuUsage > 0.7 ? 'text-red-500 bg-red-500/20' :
                  cpuUsage > 0.4 ? 'text-amber-500 bg-amber-500/20' :
                  'text-green-500 bg-green-500/20'
                }`}>
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">CPU</span>
              </div>
              <span className={`text-lg font-bold ${
                cpuUsage > 0.7 ? 'text-red-500' :
                cpuUsage > 0.4 ? 'text-amber-500' : 'text-green-500'
              }`}>
                {(cpuUsage * 100).toFixed(0)}%
              </span>
            </div>
            
            {/* Barra de CPU */}
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cpuUsage > 0.7 ? 'bg-red-500' :
                  cpuUsage > 0.4 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${cpuUsage * 100}%` }}
              />
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="opacity-75">Memória:</span>
                <span>{(memoryUsage * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-75">Temperatura:</span>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  {temperature}°C
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hora e BPM */}
        <div className={`
          p-3 rounded-xl
          ${themeClasses.secondary}
          transition-all duration-300
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-500/20 text-blue-500">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Tempo</span>
            </div>
            <span className="text-lg font-bold">
              {formatTime(currentTime)}
            </span>
          </div>
          
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="opacity-75">BPM Atual:</span>
              <span className={`font-bold ${
                bpm < 60 ? 'text-blue-400' :
                bpm < 120 ? 'text-green-400' :
                bpm < 180 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {bpm}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Status:</span>
              <span className={`flex items-center gap-1 ${
                isPlaying ? 'text-green-500' : 'text-gray-400'
              }`}>
                {isPlaying ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Playing</span>
                  </>
                ) : (
                  'Paused'
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Uptime:</span>
              <span>{(currentTime.getHours() + currentTime.getMinutes()/60).toFixed(1)}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status geral */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 ${
              isOnline ? 'text-green-500' : 'text-amber-500'
            }`}>
              {isOnline ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>Sistema {isOnline ? 'Operacional' : 'Offline'}</span>
            </div>
            
            <div className={`flex items-center gap-1 ${
              audioLatency < 35 ? 'text-green-500' : 'text-amber-500'
            }`}>
              <Volume2 className="w-4 h-4" />
              <span>Áudio {audioLatency < 35 ? 'Estável' : 'Instável'}</span>
            </div>
          </div>
          
          <div className="text-xs opacity-75">
            Atualizado {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Adiciona função de formatação de bateria se não existir
const defaultFormatBatteryLevel = (level) => {
  if (level > 80) return 'Excelente';
  if (level > 50) return 'Boa';
  if (level > 20) return 'Baixa';
  return 'Crítica';
};

// Propriedades padrão
StatusBar.defaultProps = {
  isPlaying: false,
  bpm: 120,
  cpuUsage: 0.3,
  memoryUsage: 0.5,
  temperature: 36.5,
  showAudioStats: true,
  showSystemStats: false,
  compact: false,
  onToggleSystemStats: () => {},
  onToggleAudioStats: () => {}
};

export default StatusBar;

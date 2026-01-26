// /src/components/ui/PlayModeToggle.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Hand, 
  ChevronUp, 
  ChevronDown, 
  Zap,
  SkipForward,
  SkipBack,
  RotateCcw,
  Clock,
  Timer
} from 'lucide-react';
import { formatPlayMode } from '../../utils/formatters';

/**
 * PlayModeToggle - Controles de modo de reprodução
 * Alterna entre Manual, Auto↑ (aumenta), Auto↓ (diminui) com controles de transporte
 */
const PlayModeToggle = ({
  playMode = 'manual',
  isPlaying = false,
  bpm = 120,
  onPlayModeChange,
  onPlayPause,
  onNext,
  onPrevious,
  onReset,
  showTransport = true,
  showBpm = true,
  compact = false,
  theme = 'default',
  className = '',
}) => {
  const [localPlayMode, setLocalPlayMode] = useState(playMode);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  // Atualiza estado local quando props mudam
  useEffect(() => {
    setLocalPlayMode(playMode);
  }, [playMode]);
  
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);
  
  // Efeito de animação de pulso quando está tocando
  useEffect(() => {
    if (!localIsPlaying) {
      setPulseAnimation(false);
      return;
    }
    
    setPulseAnimation(true);
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 60000 / bpm); // Sincronizado com o BPM
    
    return () => clearInterval(interval);
  }, [localIsPlaying, bpm]);
  
  // Opções de modo de reprodução
  const playModeOptions = [
    {
      id: 'manual',
      label: 'Manual',
      icon: Hand,
      description: 'Controle manual das subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-green-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-green-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-green-500/50',
    },
    {
      id: 'auto-up',
      label: 'Auto ↑',
      icon: ChevronUp,
      description: 'Aumenta automaticamente as subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-blue-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-blue-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-blue-500/50',
    },
    {
      id: 'auto-down',
      label: 'Auto ↓',
      icon: ChevronDown,
      description: 'Diminui automaticamente as subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-amber-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-amber-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-amber-500/50',
    },
  ];
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      button: 'bg-gray-800 hover:bg-gray-700',
      active: 'bg-blue-500',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-pink-900/30 to-purple-900/30',
      text: 'text-white',
      border: 'border-pink-500/30',
      button: 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 hover:opacity-90',
      active: 'bg-gradient-to-r from-pink-500 to-purple-500',
    },
    tiktok: {
      bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
      text: 'text-white',
      border: 'border-cyan-500/30',
      button: 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:opacity-90',
      active: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      button: 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30 hover:opacity-90',
      active: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Obtém informações do modo atual
  const currentModeInfo = playModeOptions.find(mode => mode.id === localPlayMode) || playModeOptions[0];
  const CurrentIcon = currentModeInfo.icon;
  const formattedMode = formatPlayMode(localPlayMode);
  
  // Manipulador de mudança de modo
  const handleModeChange = useCallback((newMode) => {
    setLocalPlayMode(newMode);
    
    if (onPlayModeChange) {
      onPlayModeChange(newMode);
    }
  }, [onPlayModeChange]);
  
  // Manipulador de play/pause
  const handlePlayPause = useCallback(() => {
    const newPlayingState = !localIsPlaying;
    setLocalIsPlaying(newPlayingState);
    
    if (onPlayPause) {
      onPlayPause(newPlayingState);
    }
  }, [localIsPlaying, onPlayPause]);
  
  // Manipulador de próximo passo
  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);
  
  // Manipulador de passo anterior
  const handlePrevious = useCallback(() => {
    if (onPrevious) {
      onPrevious();
    }
  }, [onPrevious]);
  
  // Manipulador de reset
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Renderiza botões de modo
  const renderModeButtons = () => {
    if (compact) {
      return (
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {playModeOptions.map((mode) => {
            const ModeIcon = mode.icon;
            const isActive = mode.id === localPlayMode;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`
                  flex-1 flex items-center justify-center p-3
                  transition-all duration-200
                  ${isActive ? mode.activeBgColor : 'bg-gray-800'}
                  ${isActive ? mode.activeBorderColor : 'border-transparent'}
                  hover:bg-gray-700 active:scale-95
                `}
                aria-label={`Modo ${mode.label}: ${mode.description}`}
                aria-pressed={isActive}
              >
                <ModeIcon 
                  size={18} 
                  className={isActive ? mode.activeColor : mode.color}
                />
              </button>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-3">
        {playModeOptions.map((mode) => {
          const ModeIcon = mode.icon;
          const isActive = mode.id === localPlayMode;
          const isManual = mode.id === 'manual';
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                flex flex-col items-center p-4 rounded-xl
                transition-all duration-200
                ${isActive ? mode.activeBgColor : mode.bgColor}
                border ${isActive ? mode.activeBorderColor : mode.borderColor}
                hover:scale-105 active:scale-95
                ${localIsPlaying && isActive ? 'shadow-lg' : 'shadow-md'}
              `}
              aria-label={`Modo ${mode.label}: ${mode.description}`}
              aria-pressed={isActive}
            >
              <div className={`p-3 rounded-full mb-3 ${isActive ? mode.activeBgColor : 'bg-gray-200 dark:bg-gray-700'}`}>
                <ModeIcon 
                  size={24} 
                  className={isActive ? mode.activeColor : mode.color}
                />
              </div>
              
              <div className="font-semibold text-center">
                <div className={isActive ? mode.activeColor : mode.color}>
                  {mode.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isManual ? 'Você controla' : 'Automático'}
                </div>
              </div>
              
              {/* Indicador de modo ativo */}
              {isActive && (
                <div className="mt-3">
                  <div className={`w-2 h-2 rounded-full ${mode.activeColor}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };
  
  // Renderiza controles de transporte
  const renderTransportControls = () => {
    if (!showTransport) return null;
    
    if (compact) {
      return (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={handleReset}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Reiniciar"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={handlePrevious}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Passo anterior"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`
              p-3 rounded-full transition-all duration-200
              ${localIsPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              text-white shadow-lg hover:shadow-xl active:scale-95
              ${pulseAnimation ? 'animate-pulse' : ''}
            `}
            aria-label={localIsPlaying ? "Pausar" : "Reproduzir"}
          >
            {localIsPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={handleNext}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Próximo passo"
          >
            <SkipForward size={20} />
          </button>
        </div>
      );
    }
    
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white">Controles de Transporte</h4>
            <p className="text-sm text-gray-400">Controle a reprodução da sequência</p>
          </div>
          
          {/* Status de reprodução */}
          <div className="text-right">
            <div className="text-xs text-gray-400">Status</div>
            <div className={`text-sm font-semibold ${localIsPlaying ? 'text-green-500' : 'text-gray-400'}`}>
              {localIsPlaying ? 'Reproduzindo' : 'Pausado'}
            </div>
          </div>
        </div>
        
        {/* Controles principais */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handleReset}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Reiniciar sequência"
          >
            <RotateCcw size={20} />
            <span className="text-xs mt-1">Reset</span>
          </button>
          
          <button
            onClick={handlePrevious}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Passo anterior"
          >
            <SkipBack size={24} />
            <span className="text-xs mt-1">Anterior</span>
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`
              flex flex-col items-center p-4 rounded-full
              transition-all duration-200
              ${localIsPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              text-white shadow-lg hover:shadow-xl active:scale-95
              ${pulseAnimation ? 'animate-pulse' : ''}
            `}
            aria-label={localIsPlaying ? "Pausar reprodução" : "Iniciar reprodução"}
          >
            {localIsPlaying ? <Pause size={28} /> : <Play size={28} />}
            <span className="text-xs mt-1">{localIsPlaying ? 'Pausar' : 'Play'}</span>
          </button>
          
          <button
            onClick={handleNext}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Próximo passo"
          >
            <SkipForward size={24} />
            <span className="text-xs mt-1">Próximo</span>
          </button>
        </div>
        
        {/* Indicador visual de timing */}
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${currentModeInfo.activeColor.replace('text-', 'bg-')} transition-all duration-300`}
            style={{
              width: pulseAnimation ? '100%' : '0%',
              transition: `width ${60000 / bpm}ms linear`,
            }}
          />
          <div className="absolute inset-0 flex">
            {[0, 25, 50, 75, 100].map((position) => (
              <div
                key={position}
                className="absolute h-full w-0.5 bg-white/20"
                style={{ left: `${position}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza informações de BPM
  const renderBpmInfo = () => {
    if (!showBpm) return null;
    
    return (
      <div className={`mt-4 p-3 rounded-lg ${colors.button}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Tempo</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{bpm} BPM</div>
            <div className="text-xs text-gray-400">
              {bpm < 80 ? 'Lento' : bpm < 120 ? 'Moderado' : bpm < 160 ? 'Rápido' : 'Muito rápido'}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza descrição do modo atual
  const renderModeDescription = () => {
    if (compact) return null;
    
    return (
      <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${currentModeInfo.activeBgColor}`}>
            <CurrentIcon size={20} className={currentModeInfo.activeColor} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Modo {formattedMode.label}</h4>
            <p className="text-sm text-gray-300">{formattedMode.description}</p>
          </div>
        </div>
        
        {/* Dicas específicas do modo */}
        <div className="text-xs text-gray-400">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} />
            {localPlayMode === 'manual' && (
              <span>Clique nas subdivisões ou use as setas do teclado para avançar</span>
            )}
            {localPlayMode === 'auto-up' && (
              <span>O sistema aumentará gradualmente a complexidade das subdivisões</span>
            )}
            {localPlayMode === 'auto-down' && (
              <span>Ótimo para exercícios de desaceleração controlada</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={12} />
            {localPlayMode === 'manual' && (
              <span>Ideal para prática focada e exercícios específicos</span>
            )}
            {localPlayMode === 'auto-up' && (
              <span>Recomendado para desenvolvimento progressivo de velocidade</span>
            )}
            {localPlayMode === 'auto-down' && (
              <span>Perfeito para aprimorar precisão em tempos mais lentos</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Modo de Reprodução</h2>
            <p className="text-sm text-gray-400">Controle como a sequência é executada</p>
          </div>
          
          {/* Indicador visual de estado */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${localIsPlaying ? 'animate-pulse bg-green-500' : 'bg-gray-500'}`} />
            <div className="text-xs text-gray-400">
              {localIsPlaying ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>
        
        {/* Botões de modo */}
        {renderModeButtons()}
        
        {/* Informações de BPM */}
        {renderBpmInfo()}
        
        {/* Controles de transporte */}
        {renderTransportControls()}
        
        {/* Descrição do modo */}
        {renderModeDescription()}
        
        {/* Atalhos de teclado */}
        {!compact && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Atalhos de teclado:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">Espaço</kbd>
                <span className="text-gray-400">Play/Pause</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">←</kbd>
                <span className="text-gray-400">Anterior</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">→</kbd>
                <span className="text-gray-400">Próximo</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1s ease-in-out infinite;
        }
        
        @keyframes slide-timing {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slide-timing {
          animation: slide-timing ${60000 / bpm}ms linear infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
PlayModeToggle.defaultProps = {
  playMode: 'manual',
  isPlaying: false,
  bpm: 120,
  showTransport: true,
  showBpm: true,
  compact: false,
  theme: 'default',
  className: '',
};

export default React.memo(PlayModeToggle);// /src/components/ui/PlayModeToggle.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Hand, 
  ChevronUp, 
  ChevronDown, 
  Zap,
  SkipForward,
  SkipBack,
  RotateCcw,
  Clock,
  Timer
} from 'lucide-react';
import { formatPlayMode } from '../../utils/formatters';

/**
 * PlayModeToggle - Controles de modo de reprodução
 * Alterna entre Manual, Auto↑ (aumenta), Auto↓ (diminui) com controles de transporte
 */
const PlayModeToggle = ({
  playMode = 'manual',
  isPlaying = false,
  bpm = 120,
  onPlayModeChange,
  onPlayPause,
  onNext,
  onPrevious,
  onReset,
  showTransport = true,
  showBpm = true,
  compact = false,
  theme = 'default',
  className = '',
}) => {
  const [localPlayMode, setLocalPlayMode] = useState(playMode);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  // Atualiza estado local quando props mudam
  useEffect(() => {
    setLocalPlayMode(playMode);
  }, [playMode]);
  
  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);
  
  // Efeito de animação de pulso quando está tocando
  useEffect(() => {
    if (!localIsPlaying) {
      setPulseAnimation(false);
      return;
    }
    
    setPulseAnimation(true);
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 60000 / bpm); // Sincronizado com o BPM
    
    return () => clearInterval(interval);
  }, [localIsPlaying, bpm]);
  
  // Opções de modo de reprodução
  const playModeOptions = [
    {
      id: 'manual',
      label: 'Manual',
      icon: Hand,
      description: 'Controle manual das subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-green-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-green-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-green-500/50',
    },
    {
      id: 'auto-up',
      label: 'Auto ↑',
      icon: ChevronUp,
      description: 'Aumenta automaticamente as subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-blue-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-blue-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-blue-500/50',
    },
    {
      id: 'auto-down',
      label: 'Auto ↓',
      icon: ChevronDown,
      description: 'Diminui automaticamente as subdivisões',
      color: 'text-gray-600 dark:text-gray-400',
      activeColor: 'text-amber-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      activeBgColor: 'bg-amber-500/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      activeBorderColor: 'border-amber-500/50',
    },
  ];
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      button: 'bg-gray-800 hover:bg-gray-700',
      active: 'bg-blue-500',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-pink-900/30 to-purple-900/30',
      text: 'text-white',
      border: 'border-pink-500/30',
      button: 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 hover:opacity-90',
      active: 'bg-gradient-to-r from-pink-500 to-purple-500',
    },
    tiktok: {
      bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
      text: 'text-white',
      border: 'border-cyan-500/30',
      button: 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:opacity-90',
      active: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      button: 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30 hover:opacity-90',
      active: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Obtém informações do modo atual
  const currentModeInfo = playModeOptions.find(mode => mode.id === localPlayMode) || playModeOptions[0];
  const CurrentIcon = currentModeInfo.icon;
  const formattedMode = formatPlayMode(localPlayMode);
  
  // Manipulador de mudança de modo
  const handleModeChange = useCallback((newMode) => {
    setLocalPlayMode(newMode);
    
    if (onPlayModeChange) {
      onPlayModeChange(newMode);
    }
  }, [onPlayModeChange]);
  
  // Manipulador de play/pause
  const handlePlayPause = useCallback(() => {
    const newPlayingState = !localIsPlaying;
    setLocalIsPlaying(newPlayingState);
    
    if (onPlayPause) {
      onPlayPause(newPlayingState);
    }
  }, [localIsPlaying, onPlayPause]);
  
  // Manipulador de próximo passo
  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);
  
  // Manipulador de passo anterior
  const handlePrevious = useCallback(() => {
    if (onPrevious) {
      onPrevious();
    }
  }, [onPrevious]);
  
  // Manipulador de reset
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  // Renderiza botões de modo
  const renderModeButtons = () => {
    if (compact) {
      return (
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {playModeOptions.map((mode) => {
            const ModeIcon = mode.icon;
            const isActive = mode.id === localPlayMode;
            
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`
                  flex-1 flex items-center justify-center p-3
                  transition-all duration-200
                  ${isActive ? mode.activeBgColor : 'bg-gray-800'}
                  ${isActive ? mode.activeBorderColor : 'border-transparent'}
                  hover:bg-gray-700 active:scale-95
                `}
                aria-label={`Modo ${mode.label}: ${mode.description}`}
                aria-pressed={isActive}
              >
                <ModeIcon 
                  size={18} 
                  className={isActive ? mode.activeColor : mode.color}
                />
              </button>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-3">
        {playModeOptions.map((mode) => {
          const ModeIcon = mode.icon;
          const isActive = mode.id === localPlayMode;
          const isManual = mode.id === 'manual';
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`
                flex flex-col items-center p-4 rounded-xl
                transition-all duration-200
                ${isActive ? mode.activeBgColor : mode.bgColor}
                border ${isActive ? mode.activeBorderColor : mode.borderColor}
                hover:scale-105 active:scale-95
                ${localIsPlaying && isActive ? 'shadow-lg' : 'shadow-md'}
              `}
              aria-label={`Modo ${mode.label}: ${mode.description}`}
              aria-pressed={isActive}
            >
              <div className={`p-3 rounded-full mb-3 ${isActive ? mode.activeBgColor : 'bg-gray-200 dark:bg-gray-700'}`}>
                <ModeIcon 
                  size={24} 
                  className={isActive ? mode.activeColor : mode.color}
                />
              </div>
              
              <div className="font-semibold text-center">
                <div className={isActive ? mode.activeColor : mode.color}>
                  {mode.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isManual ? 'Você controla' : 'Automático'}
                </div>
              </div>
              
              {/* Indicador de modo ativo */}
              {isActive && (
                <div className="mt-3">
                  <div className={`w-2 h-2 rounded-full ${mode.activeColor}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };
  
  // Renderiza controles de transporte
  const renderTransportControls = () => {
    if (!showTransport) return null;
    
    if (compact) {
      return (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={handleReset}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Reiniciar"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={handlePrevious}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Passo anterior"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`
              p-3 rounded-full transition-all duration-200
              ${localIsPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              text-white shadow-lg hover:shadow-xl active:scale-95
              ${pulseAnimation ? 'animate-pulse' : ''}
            `}
            aria-label={localIsPlaying ? "Pausar" : "Reproduzir"}
          >
            {localIsPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button
            onClick={handleNext}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Próximo passo"
          >
            <SkipForward size={20} />
          </button>
        </div>
      );
    }
    
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white">Controles de Transporte</h4>
            <p className="text-sm text-gray-400">Controle a reprodução da sequência</p>
          </div>
          
          {/* Status de reprodução */}
          <div className="text-right">
            <div className="text-xs text-gray-400">Status</div>
            <div className={`text-sm font-semibold ${localIsPlaying ? 'text-green-500' : 'text-gray-400'}`}>
              {localIsPlaying ? 'Reproduzindo' : 'Pausado'}
            </div>
          </div>
        </div>
        
        {/* Controles principais */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={handleReset}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Reiniciar sequência"
          >
            <RotateCcw size={20} />
            <span className="text-xs mt-1">Reset</span>
          </button>
          
          <button
            onClick={handlePrevious}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Passo anterior"
          >
            <SkipBack size={24} />
            <span className="text-xs mt-1">Anterior</span>
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`
              flex flex-col items-center p-4 rounded-full
              transition-all duration-200
              ${localIsPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              text-white shadow-lg hover:shadow-xl active:scale-95
              ${pulseAnimation ? 'animate-pulse' : ''}
            `}
            aria-label={localIsPlaying ? "Pausar reprodução" : "Iniciar reprodução"}
          >
            {localIsPlaying ? <Pause size={28} /> : <Play size={28} />}
            <span className="text-xs mt-1">{localIsPlaying ? 'Pausar' : 'Play'}</span>
          </button>
          
          <button
            onClick={handleNext}
            className={`
              flex flex-col items-center p-3 rounded-xl
              transition-all duration-200
              ${colors.button} text-gray-400
              hover:text-white hover:scale-110 active:scale-95
            `}
            aria-label="Próximo passo"
          >
            <SkipForward size={24} />
            <span className="text-xs mt-1">Próximo</span>
          </button>
        </div>
        
        {/* Indicador visual de timing */}
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${currentModeInfo.activeColor.replace('text-', 'bg-')} transition-all duration-300`}
            style={{
              width: pulseAnimation ? '100%' : '0%',
              transition: `width ${60000 / bpm}ms linear`,
            }}
          />
          <div className="absolute inset-0 flex">
            {[0, 25, 50, 75, 100].map((position) => (
              <div
                key={position}
                className="absolute h-full w-0.5 bg-white/20"
                style={{ left: `${position}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza informações de BPM
  const renderBpmInfo = () => {
    if (!showBpm) return null;
    
    return (
      <div className={`mt-4 p-3 rounded-lg ${colors.button}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Tempo</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{bpm} BPM</div>
            <div className="text-xs text-gray-400">
              {bpm < 80 ? 'Lento' : bpm < 120 ? 'Moderado' : bpm < 160 ? 'Rápido' : 'Muito rápido'}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza descrição do modo atual
  const renderModeDescription = () => {
    if (compact) return null;
    
    return (
      <div className="mt-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${currentModeInfo.activeBgColor}`}>
            <CurrentIcon size={20} className={currentModeInfo.activeColor} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Modo {formattedMode.label}</h4>
            <p className="text-sm text-gray-300">{formattedMode.description}</p>
          </div>
        </div>
        
        {/* Dicas específicas do modo */}
        <div className="text-xs text-gray-400">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} />
            {localPlayMode === 'manual' && (
              <span>Clique nas subdivisões ou use as setas do teclado para avançar</span>
            )}
            {localPlayMode === 'auto-up' && (
              <span>O sistema aumentará gradualmente a complexidade das subdivisões</span>
            )}
            {localPlayMode === 'auto-down' && (
              <span>Ótimo para exercícios de desaceleração controlada</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={12} />
            {localPlayMode === 'manual' && (
              <span>Ideal para prática focada e exercícios específicos</span>
            )}
            {localPlayMode === 'auto-up' && (
              <span>Recomendado para desenvolvimento progressivo de velocidade</span>
            )}
            {localPlayMode === 'auto-down' && (
              <span>Perfeito para aprimorar precisão em tempos mais lentos</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Modo de Reprodução</h2>
            <p className="text-sm text-gray-400">Controle como a sequência é executada</p>
          </div>
          
          {/* Indicador visual de estado */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${localIsPlaying ? 'animate-pulse bg-green-500' : 'bg-gray-500'}`} />
            <div className="text-xs text-gray-400">
              {localIsPlaying ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>
        
        {/* Botões de modo */}
        {renderModeButtons()}
        
        {/* Informações de BPM */}
        {renderBpmInfo()}
        
        {/* Controles de transporte */}
        {renderTransportControls()}
        
        {/* Descrição do modo */}
        {renderModeDescription()}
        
        {/* Atalhos de teclado */}
        {!compact && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Atalhos de teclado:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">Espaço</kbd>
                <span className="text-gray-400">Play/Pause</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">←</kbd>
                <span className="text-gray-400">Anterior</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-800 rounded">→</kbd>
                <span className="text-gray-400">Próximo</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1s ease-in-out infinite;
        }
        
        @keyframes slide-timing {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slide-timing {
          animation: slide-timing ${60000 / bpm}ms linear infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
PlayModeToggle.defaultProps = {
  playMode: 'manual',
  isPlaying: false,
  bpm: 120,
  showTransport: true,
  showBpm: true,
  compact: false,
  theme: 'default',
  className: '',
};

export default React.memo(PlayModeToggle);

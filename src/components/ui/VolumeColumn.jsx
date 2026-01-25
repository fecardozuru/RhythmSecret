// /src/components/ui/VolumeColumn.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { Volume2, Volume1, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { formatVolume } from '../../utils/formatters';

/**
 * VolumeColumn - Componente de coluna para grade de volumes
 * Cada coluna representa uma subdivisão com 3 barras de volume + indicador
 */
const VolumeColumn = ({
  index,
  volume = 0.5,
  isActive = true,
  isCurrent = false,
  isAccent = false,
  isGhost = false,
  onClick,
  onVolumeChange,
  showLabel = true,
  columnHeight = 120,
  theme = 'default',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localVolume, setLocalVolume] = useState(volume);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  
  // Atualiza volume local quando prop muda
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);
  
  // Cores baseadas no tema
  const themeColors = {
    default: {
      active: 'bg-blue-500',
      inactive: 'bg-gray-300',
      accent: 'bg-amber-500',
      ghost: 'bg-gray-400 opacity-60',
      current: 'ring-2 ring-blue-400 ring-offset-1',
      text: 'text-gray-800',
      bg: 'bg-white',
    },
    instagram: {
      active: 'bg-gradient-to-b from-pink-500 to-purple-500',
      inactive: 'bg-gradient-to-b from-gray-300 to-gray-400',
      accent: 'bg-gradient-to-b from-orange-500 to-yellow-500',
      ghost: 'bg-gradient-to-b from-gray-400 to-gray-500 opacity-70',
      current: 'ring-2 ring-pink-400 ring-offset-1',
      text: 'text-gray-800',
      bg: 'bg-white',
    },
    tiktok: {
      active: 'bg-gradient-to-b from-cyan-400 to-blue-500',
      inactive: 'bg-gradient-to-b from-gray-300 to-gray-400',
      accent: 'bg-gradient-to-b from-pink-500 to-red-500',
      ghost: 'bg-gradient-to-b from-gray-400 to-gray-500 opacity-70',
      current: 'ring-2 ring-cyan-400 ring-offset-1',
      text: 'text-gray-800',
      bg: 'bg-gray-900',
    },
    'pro-gold': {
      active: 'bg-gradient-to-b from-amber-400 to-yellow-600',
      inactive: 'bg-gradient-to-b from-gray-700 to-gray-800',
      accent: 'bg-gradient-to-b from-amber-600 to-orange-600',
      ghost: 'bg-gradient-to-b from-gray-600 to-gray-700 opacity-70',
      current: 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-900',
      text: 'text-amber-100',
      bg: 'bg-gray-900',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Determina a classe de cor baseada no estado
  const getColorClass = () => {
    if (!isActive) return colors.inactive;
    if (isAccent) return colors.accent;
    if (isGhost) return colors.ghost;
    return colors.active;
  };
  
  // Calcula alturas das barras (3 barras dividindo o volume total)
  const barHeights = [
    Math.min(1, localVolume * 3) * (columnHeight / 3), // Barra superior
    Math.min(1, Math.max(0, localVolume * 3 - 1)) * (columnHeight / 3), // Barra do meio
    Math.min(1, Math.max(0, localVolume * 3 - 2)) * (columnHeight / 3), // Barra inferior
  ];
  
  // Manipulador de clique na coluna
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick(index);
    }
    
    // Alterna popup de volume se segurar Shift
    if (e.shiftKey) {
      setShowVolumePopup(!showVolumePopup);
    }
  }, [index, onClick, showVolumePopup]);
  
  // Manipulador de início de drag
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    const startY = e.clientY;
    const startVolume = localVolume;
    
    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const sensitivity = 0.005;
      const newVolume = Math.max(0, Math.min(1, startVolume + deltaY * sensitivity));
      
      setLocalVolume(newVolume);
      
      if (onVolumeChange) {
        onVolumeChange(index, newVolume);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [index, localVolume, onVolumeChange]);
  
  // Manipulador para toque em dispositivos móveis
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    const startY = e.touches[0].clientY;
    const startVolume = localVolume;
    
    const handleTouchMove = (moveEvent) => {
      const deltaY = startY - moveEvent.touches[0].clientY;
      const sensitivity = 0.01;
      const newVolume = Math.max(0, Math.min(1, startVolume + deltaY * sensitivity));
      
      setLocalVolume(newVolume);
      
      if (onVolumeChange) {
        onVolumeChange(index, newVolume);
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [index, localVolume, onVolumeChange]);
  
  // Manipulador para incremento/decremento rápido
  const handleVolumeAdjust = useCallback((direction) => {
    const step = 0.1;
    const newVolume = direction === 'up' 
      ? Math.min(1, localVolume + step)
      : Math.max(0, localVolume - step);
    
    setLocalVolume(newVolume);
    
    if (onVolumeChange) {
      onVolumeChange(index, newVolume);
    }
  }, [index, localVolume, onVolumeChange]);
  
  // Ícone de volume baseado no nível
  const getVolumeIcon = () => {
    if (localVolume === 0) return <VolumeX size={14} />;
    if (localVolume < 0.3) return <Volume1 size={14} />;
    return <Volume2 size={14} />;
  };
  
  // Classe para indicador de passo atual
  const currentIndicatorClass = isCurrent 
    ? `${colors.current} ${isActive ? 'opacity-100' : 'opacity-60'}`
    : 'opacity-0';
  
  // Classe para estado de dragging
  const draggingClass = isDragging ? 'scale-95 brightness-110' : '';
  
  return (
    <div className="flex flex-col items-center relative group">
      {/* Container principal da coluna */}
      <div
        className={`
          relative w-12 md:w-14 rounded-lg cursor-pointer
          transition-all duration-150 ease-out
          hover:scale-105 hover:shadow-lg
          active:scale-95
          ${draggingClass}
          ${isActive ? 'shadow-md' : 'shadow-sm opacity-80'}
          ${colors.bg}
        `}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label={`Subdivisão ${index + 1}, volume ${formatVolume(localVolume, 'percent')}`}
        aria-valuenow={localVolume * 100}
        aria-valuemin="0"
        aria-valuemax="100"
        tabIndex="0"
      >
        {/* Indicador de passo atual (animações) */}
        <div
          className={`
            absolute -top-2 left-1/2 transform -translate-x-1/2
            w-3 h-3 rounded-full transition-all duration-300
            ${currentIndicatorClass}
          `}
        >
          {/* Animação de pulso quando é o passo atual */}
          {isCurrent && isActive && (
            <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-40" />
          )}
        </div>
        
        {/* Barras de volume (3 barras verticais) */}
        <div className="relative h-full p-1">
          <div className="flex flex-col h-full justify-end space-y-1">
            {barHeights.map((height, barIndex) => (
              <div
                key={barIndex}
                className={`
                  w-full rounded-sm transition-all duration-200
                  ${getColorClass()}
                  ${barIndex === 0 ? 'rounded-t-md' : ''}
                  ${barIndex === 2 ? 'rounded-b-md' : ''}
                `}
                style={{ height: `${height}px` }}
              >
                {/* Efeito de brilho nas barras */}
                {isActive && height > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Indicador de arrastar */}
        <div
          className={`
            absolute -bottom-2 left-1/2 transform -translate-x-1/2
            w-6 h-1 rounded-full transition-opacity duration-200
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}
            ${getColorClass()}
          `}
        />
        
        {/* Overlay de dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/10 rounded-lg" />
        )}
      </div>
      
      {/* Label da subdivisão */}
      {showLabel && (
        <div className="mt-2 flex flex-col items-center">
          <span className={`
            text-xs font-semibold transition-colors duration-200
            ${isActive ? colors.text : 'text-gray-400'}
            ${isCurrent ? 'scale-110 font-bold' : ''}
          `}>
            {index + 1}
          </span>
          
          {/* Indicador visual de volume */}
          <div className="flex items-center gap-1 mt-1">
            {getVolumeIcon()}
            <span className="text-xs text-gray-500">
              {formatVolume(localVolume, 'percent')}
            </span>
          </div>
        </div>
      )}
      
      {/* Controles de ajuste rápido (aparecem no hover) */}
      <div className={`
        absolute -top-10 left-1/2 transform -translate-x-1/2
        flex flex-col items-center opacity-0 group-hover:opacity-100
        transition-opacity duration-200 pointer-events-none
      `}>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVolumeAdjust('up');
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={`Aumentar volume da subdivisão ${index + 1}`}
          >
            <ChevronUp size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="w-12 text-center">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {formatVolume(localVolume, 'percent')}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVolumeAdjust('down');
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={`Diminuir volume da subdivisão ${index + 1}`}
          >
            <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Seta para baixo */}
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
      </div>
      
      {/* Popup de volume detalhado */}
      {showVolumePopup && (
        <div
          className="
            absolute -top-24 left-1/2 transform -translate-x-1/2
            bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3
            z-50 min-w-[140px]
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-2">
            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
              Subdivisão {index + 1}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ajuste preciso de volume
            </p>
          </div>
          
          {/* Slider de volume preciso */}
          <input
            type="range"
            min="0"
            max="100"
            value={localVolume * 100}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value) / 100;
              setLocalVolume(newVolume);
              if (onVolumeChange) {
                onVolumeChange(index, newVolume);
              }
            }}
            className="
              w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg
              appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500 dark:[&::-webkit-slider-thumb]:bg-blue-400
              [&::-webkit-slider-thumb]:cursor-pointer
            "
            aria-label={`Volume preciso da subdivisão ${index + 1}`}
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>0%</span>
            <span className="font-semibold">{formatVolume(localVolume, 'percent')}</span>
            <span>100%</span>
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-between mt-3">
            <button
              onClick={() => {
                setLocalVolume(0);
                if (onVolumeChange) onVolumeChange(index, 0);
              }}
              className="
                text-xs px-2 py-1 rounded
                bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600
                transition-colors
              "
            >
              Silenciar
            </button>
            
            <button
              onClick={() => {
                setLocalVolume(1);
                if (onVolumeChange) onVolumeChange(index, 1);
              }}
              className="
                text-xs px-2 py-1 rounded
                bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600
                transition-colors
              "
            >
              Máximo
            </button>
          </div>
        </div>
      )}
      
      {/* Tooltip informativo */}
      <div className={`
        absolute -bottom-12 left-1/2 transform -translate-x-1/2
        bg-gray-900 text-white text-xs rounded py-1 px-2
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none whitespace-nowrap z-10
      `}>
        <div className="flex items-center gap-1">
          <span>Subdivisão {index + 1}</span>
          {isAccent && (
            <span className="text-amber-300">● Acento</span>
          )}
          {isGhost && (
            <span className="text-gray-300">○ Fantasma</span>
          )}
        </div>
        <div className="text-gray-300">
          {formatVolume(localVolume, 'percent')} • {formatVolume(localVolume, 'db')}
        </div>
        <div className="text-gray-400 text-[10px] mt-1">
          Clique: alternar • Arraste: ajustar • Shift+Clique: menu
        </div>
      </div>
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
VolumeColumn.defaultProps = {
  index: 0,
  volume: 0.5,
  isActive: true,
  isCurrent: false,
  isAccent: false,
  isGhost: false,
  showLabel: true,
  columnHeight: 120,
  theme: 'default',
};

export default React.memo(VolumeColumn);

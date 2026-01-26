// /src/components/ui/VolumeColumn.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Volume2, 
  Volume1, 
  Volume, 
  VolumeX,
  Zap,
  Target,
  Sparkles,
  Star
} from 'lucide-react';

/**
 * VolumeColumn - Coluna individual de volume com controles interativos
 * Suporta padrões especiais para tercinas e outras subdivisões
 */

const VolumeColumn = ({
  index = 0,
  volume = 0.8,
  isActive = true,
  isCurrent = false,
  isAccent = false,
  isGhost = false,
  isTriplet = false,
  tripletPosition = 0, // 0, 1, ou 2 para posição na tercina
  onClick,
  onVolumeChange,
  theme = 'default',
  columnHeight = 160,
  showLabel = true,
  showControls = true,
  interactive = true,
  className = '',
}) => {
  const [localVolume, setLocalVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const [showPeak, setShowPeak] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  // Efeito para sincronizar com props
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);
  
  // Efeito para animação de pulso quando está atual
  useEffect(() => {
    if (isCurrent && isActive) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCurrent, isActive]);
  
  // Efeito para peak meter
  useEffect(() => {
    if (isActive && volume > 0) {
      setShowPeak(true);
      const timer = setTimeout(() => setShowPeak(false), 100);
      return () => clearTimeout(timer);
    }
  }, [volume, isActive]);
  
  // Calcula altura das barras baseado no volume
  const calculateBarHeights = useCallback(() => {
    const heights = [];
    const maxBars = 4; // Número máximo de barras visíveis
    
    // Para volume 0, todas as barras estão em 0
    if (localVolume <= 0 || !isActive) {
      return Array(maxBars).fill(0);
    }
    
    // Distribui o volume entre as barras
    const volumePerBar = localVolume / maxBars;
    
    for (let i = 0; i < maxBars; i++) {
      const barVolume = Math.min(1, volumePerBar * (maxBars - i));
      heights.push(barVolume);
    }
    
    return heights;
  }, [localVolume, isActive]);
  
  // Determina classe de cor baseado no estado e tema
  const getColorClasses = useCallback(() => {
    // Cores base para diferentes estados
    const baseColors = {
      default: {
        active: 'bg-blue-500',
        accent: 'bg-amber-500',
        ghost: 'bg-gray-500',
        inactive: 'bg-gray-800',
        current: 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      },
      'pro-gold': {
        active: 'bg-gradient-to-t from-amber-500 to-yellow-400',
        accent: 'bg-gradient-to-t from-orange-500 to-amber-400',
        ghost: 'bg-gradient-to-t from-gray-600 to-gray-500',
        inactive: 'bg-gradient-to-t from-gray-900 to-gray-800',
        current: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-950',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      },
      'instagram': {
        active: 'bg-gradient-to-t from-[#E1306C] to-[#F77737]',
        accent: 'bg-gradient-to-t from-[#833AB4] to-[#FD1D1D]',
        ghost: 'bg-gradient-to-t from-gray-600 to-gray-500',
        inactive: 'bg-gradient-to-t from-gray-900 to-gray-800',
        current: 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900',
        glow: 'shadow-[0_0_15px_rgba(225,48,108,0.5)]',
      }
    };
    
    const colors = baseColors[theme] || baseColors.default;
    
    // Determina qual classe usar
    if (!isActive) {
      return {
        bar: colors.inactive,
        current: '',
        glow: '',
        icon: 'text-gray-600',
      };
    }
    
    if (isGhost) {
      return {
        bar: colors.ghost,
        current: isCurrent ? colors.current : '',
        glow: isCurrent ? colors.glow : '',
        icon: 'text-gray-400',
      };
    }
    
    if (isAccent) {
      return {
        bar: colors.accent,
        current: isCurrent ? colors.current : '',
        glow: isCurrent ? colors.glow : '',
        icon: 'text-amber-400',
      };
    }
    
    return {
      bar: colors.active,
      current: isCurrent ? colors.current : '',
      glow: isCurrent ? colors.glow : '',
      icon: 'text-blue-400',
    };
  }, [theme, isActive, isAccent, isGhost, isCurrent]);
  
  // Determina ícone baseado no volume
  const getVolumeIcon = useCallback(() => {
    if (!isActive || localVolume <= 0) {
      return VolumeX;
    }
    
    if (localVolume <= 0.3) {
      return Volume1;
    }
    
    if (localVolume <= 0.7) {
      return Volume2;
    }
    
    return Volume;
  }, [localVolume, isActive]);
  
  // Manipulador de clique na coluna
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    
    if (!interactive) return;
    
    // Alterna entre ativo/inativo se for clique simples
    if (onClick) {
      onClick(index);
    }
  }, [index, onClick, interactive]);
  
  // Manipulador de clique direito para resetar volume
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!interactive) return;
    
    // Reset para volume padrão
    const newVolume = 0.8;
    setLocalVolume(newVolume);
    
    if (onVolumeChange) {
      onVolumeChange(index, newVolume);
    }
  }, [index, onVolumeChange, interactive]);
  
  // Manipulador de arrastar para ajustar volume
  const handleMouseDown = useCallback((e) => {
    if (!interactive || !isActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    const startY = e.clientY;
    const startVolume = localVolume;
    const columnHeight = e.currentTarget.clientHeight;
    
    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const volumeDelta = deltaY / columnHeight;
      let newVolume = startVolume + volumeDelta;
      
      // Limita entre 0 e 1
      newVolume = Math.max(0, Math.min(1, newVolume));
      
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
  }, [index, localVolume, isActive, interactive, onVolumeChange]);
  
  // Manipulador de toque para mobile
  const handleTouchStart = useCallback((e) => {
    if (!interactive || !isActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startVolume = localVolume;
    const columnHeight = e.currentTarget.clientHeight;
    
    const handleTouchMove = (moveEvent) => {
      const touch = moveEvent.touches[0];
      const deltaY = startY - touch.clientY;
      const volumeDelta = deltaY / columnHeight;
      let newVolume = startVolume + volumeDelta;
      
      // Limita entre 0 e 1
      newVolume = Math.max(0, Math.min(1, newVolume));
      
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
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [index, localVolume, isActive, interactive, onVolumeChange]);
  
  // Efeito visual para posição na tercina
  const getTripletIndicator = useCallback(() => {
    if (!isTriplet) return null;
    
    const positions = [
      { label: '1ª', color: 'bg-amber-500', symbol: '❶' },
      { label: '2ª', color: 'bg-amber-400', symbol: '❷' },
      { label: '3ª', color: 'bg-amber-300', symbol: '❸' },
    ];
    
    const position = positions[tripletPosition] || positions[0];
    
    return (
      <div className={`
        absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center
        ${position.color} text-[10px] font-black text-black shadow-lg
        animate-pulse
      `}>
        {position.symbol}
      </div>
    );
  }, [isTriplet, tripletPosition]);
  
  // Barra de peak meter
  const renderPeakMeter = () => {
    if (!showPeak || !isActive) return null;
    
    return (
      <div className="absolute top-0 left-0 right-0">
        <div 
          className={`
            h-1 rounded-t-lg transition-all duration-100
            ${isAccent ? 'bg-amber-400' : 'bg-blue-400'}
            ${pulseAnimation ? 'opacity-100' : 'opacity-80'}
          `}
          style={{
            width: `${localVolume * 100}%`,
          }}
        />
      </div>
    );
  };
  
  // Indicador visual de arrastar
  const renderDragIndicator = () => {
    if (!isDragging) return null;
    
    return (
      <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
    );
  };
  
  // Ícone de volume
  const VolumeIcon = getVolumeIcon();
  const colorClasses = getColorClasses();
  const barHeights = calculateBarHeights();
  
  return (
    <div 
      className={`
        relative flex flex-col items-center justify-end
        min-w-[50px] max-w-[80px] rounded-lg
        transition-all duration-200 select-none
        ${interactive && isActive ? 'cursor-pointer' : 'cursor-default'}
        ${isCurrent ? 'scale-105 -translate-y-1 z-10' : 'hover:scale-[1.02]'}
        ${pulseAnimation ? 'animate-pulse' : ''}
        ${colorClasses.current}
        ${colorClasses.glow}
        ${isDragging ? 'brightness-125' : ''}
        ${className}
      `}
      style={{ height: columnHeight }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label={`Coluna ${index + 1}, volume ${Math.round(localVolume * 100)}%`}
      aria-valuenow={localVolume * 100}
      aria-valuemin="0"
      aria-valuemax="100"
      tabIndex={interactive ? 0 : -1}
    >
      {/* Indicador de posição na tercina */}
      {getTripletIndicator()}
      
      {/* Peak meter */}
      {renderPeakMeter()}
      
      {/* Indicador de arrastar */}
      {renderDragIndicator()}
      
      {/* Barras de volume */}
      <div className="w-full flex-1 flex flex-col justify-end gap-1 p-2">
        {barHeights.map((height, barIndex) => (
          <div
            key={`bar-${barIndex}`}
            className={`
              w-full rounded-sm transition-all duration-300
              ${colorClasses.bar}
              ${barIndex === 0 && isAccent ? 'shadow-lg' : ''}
            `}
            style={{
              height: `${height * 60}%`,
              minHeight: '4px',
              opacity: height > 0 ? 0.8 + (height * 0.2) : 0.3,
              transform: isCurrent ? 'scaleX(1.05)' : 'scaleX(1)',
              transition: 'height 0.3s ease-out, opacity 0.3s ease-out',
            }}
          />
        ))}
      </div>
      
      {/* Controles e informações */}
      <div className="w-full p-2 pt-1">
        {/* Indicador visual para acentos */}
        {isAccent && (
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={`sparkle-${i}`}
                  className={`
                    w-1 h-1 rounded-full animate-pulse
                    ${theme === 'pro-gold' ? 'bg-amber-400' : 'bg-yellow-400'}
                  `}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.6 + (i * 0.1),
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Número/ícone da coluna */}
        <div className={`
          flex items-center justify-center gap-1
          text-xs font-bold transition-colors
          ${isActive ? colorClasses.icon : 'text-gray-600'}
          ${isCurrent ? 'scale-110' : ''}
        `}>
          {showControls && isActive ? (
            <VolumeIcon size={showLabel ? 12 : 14} />
          ) : (
            <div className="w-2 h-2 rounded-full bg-current" />
          )}
          
          {showLabel && (
            <span className={isGhost ? 'opacity-60' : ''}>
              {index + 1}
            </span>
          )}
        </div>
        
        {/* Indicador visual de volume */}
        <div className="mt-1 flex justify-center">
          <div className="flex items-center gap-0.5">
            {[...Array(4)].map((_, i) => {
              const isLit = i < Math.ceil(localVolume * 4);
              
              return (
                <div
                  key={`dot-${i}`}
                  className={`
                    w-1 h-1 rounded-full transition-all duration-200
                    ${isLit 
                      ? (isAccent ? 'bg-amber-400' : 'bg-blue-400') 
                      : 'bg-gray-700'
                    }
                  `}
                />
              );
            })}
          </div>
        </div>
        
        {/* Indicador visual para notas fantasmas */}
        {isGhost && isActive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-0.5">
              {[...Array(2)].map((_, i) => (
                <div
                  key={`ghost-${i}`}
                  className="w-1 h-1 rounded-full bg-gray-500/60 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Tooltip visual para arrastar */}
        {interactive && isActive && (
          <div className={`
            absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2
            px-2 py-1 rounded text-xs font-medium whitespace-nowrap
            bg-gray-900 border border-gray-700 shadow-lg opacity-0
            group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
            ${isDragging ? 'opacity-100' : ''}
          `}>
            <div className="flex items-center gap-1">
              <span>Volume:</span>
              <span className="font-bold">{Math.round(localVolume * 100)}%</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {isDragging ? 'Solte para confirmar' : 'Arraste para ajustar'}
            </div>
          </div>
        )}
      </div>
      
      {/* Efeito de brilho para coluna atual */}
      {isCurrent && (
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      )}
      
      {/* Efeito de destaque para acentos */}
      {isAccent && (
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-transparent via-amber-500/10 to-transparent pointer-events-none animate-pulse" />
      )}
      
      {/* Estilos de animação específicos */}
      <style jsx>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor; }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
VolumeColumn.defaultProps = {
  index: 0,
  volume: 0.8,
  isActive: true,
  isCurrent: false,
  isAccent: false,
  isGhost: false,
  isTriplet: false,
  tripletPosition: 0,
  theme: 'default',
  columnHeight: 160,
  showLabel: true,
  showControls: true,
  interactive: true,
  className: '',
};

export default React.memo(VolumeColumn);

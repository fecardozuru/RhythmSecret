// /src/components/ui/TimeSigPicker.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Music, 
  Clock, 
  Hash, 
  Divide, 
  Check, 
  Zap,
  TrendingUp,
  Compass
} from 'lucide-react';
import { formatTimeSignature } from '../../utils/formatters';
import { useMenuManagement } from '../../hooks/useMenuManagement';
import { TIME_SIGNATURES, COMMON_TIME_SIGNATURES } from '../../constants/musicalConfig';

/**
 * TimeSigPicker - Seletor de compasso musical
 * Permite escolher entre diferentes compassos (4/4, 3/4, 6/8, etc.)
 */
const TimeSigPicker = ({
  currentTimeSig = TIME_SIGNATURES['4/4'],
  onChange,
  showDescription = true,
  compact = false,
  theme = 'default',
  className = '',
}) => {
  const [localTimeSig, setLocalTimeSig] = useState(currentTimeSig);
  
  // Usa hook de gerenciamento de menu
  const { 
    isOpen, 
    toggleMenu, 
    closeMenu, 
    menuRef, 
    triggerRef, 
    zIndex 
  } = useMenuManagement('time-signature-picker', {
    closeOnClickOutside: true,
    closeOnEsc: true,
    autoZIndex: true,
  });
  
  // Agrupa compassos por tipo
  const timeSigGroups = useMemo(() => [
    {
      name: 'Comuns',
      description: 'Compassos mais utilizados',
      timeSigs: COMMON_TIME_SIGNATURES.map(key => TIME_SIGNATURES[key]),
    },
    {
      name: 'Simples',
      description: 'Divisão binária',
      timeSigs: Object.values(TIME_SIGNATURES).filter(ts => 
        ts.denominator === 4 && ts.numerator <= 7
      ),
    },
    {
      name: 'Compostos',
      description: 'Divisão ternária',
      timeSigs: Object.values(TIME_SIGNATURES).filter(ts => 
        ts.denominator === 8 && ts.numerator % 3 === 0
      ),
    },
    {
      name: 'Complexos',
      description: 'Compassos irregulares',
      timeSigs: Object.values(TIME_SIGNATURES).filter(ts => 
        ts.denominator === 8 && ts.numerator % 3 !== 0
      ),
    },
  ], []);
  
  // Obtém informações do compasso atual
  const currentTimeSigInfo = useMemo(() => {
    const ts = localTimeSig;
    const isCompound = ts.denominator === 8;
    const isComplex = ts.denominator === 8 && ts.numerator % 3 !== 0;
    const grouping = isCompound ? ts.numerator / 3 : ts.numerator;
    
    let type = 'Simples';
    let description = `${ts.numerator} tempos por compasso`;
    
    if (isCompound) {
      type = 'Composto';
      description = `${grouping} grupos de 3 colcheias`;
    }
    
    if (isComplex) {
      type = 'Complexo';
      description = 'Padrão irregular';
    }
    
    return {
      formatted: formatTimeSignature(ts),
      type,
      description,
      grouping,
      isCompound,
      isComplex,
    };
  }, [localTimeSig]);
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      hover: 'hover:bg-gray-800',
      text: 'text-white',
      border: 'border-gray-700',
      active: 'bg-blue-500/20',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-pink-900/30 to-purple-900/30',
      hover: 'hover:from-pink-800/40 hover:to-purple-800/40',
      text: 'text-white',
      border: 'border-pink-500/30',
      active: 'bg-pink-500/20',
    },
    tiktok: {
      bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
      hover: 'hover:from-cyan-800/40 hover:to-blue-800/40',
      text: 'text-white',
      border: 'border-cyan-500/30',
      active: 'bg-cyan-500/20',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20',
      hover: 'hover:from-amber-800/30 hover:to-yellow-800/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      active: 'bg-amber-500/20',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Manipulador de mudança de compasso
  const handleTimeSigChange = useCallback((newTimeSig) => {
    setLocalTimeSig(newTimeSig);
    
    if (onChange) {
      onChange(newTimeSig);
    }
    
    closeMenu();
  }, [onChange, closeMenu]);
  
  // Renderiza o botão principal
  const renderButton = () => {
    if (compact) {
      return (
        <button
          ref={triggerRef}
          onClick={toggleMenu}
          className={`
            flex items-center justify-center p-3 rounded-xl
            transition-all duration-200
            ${colors.bg} ${colors.border} border
            ${colors.text} shadow-lg
            hover:shadow-xl active:scale-95
            ${isOpen ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
          `}
          aria-label={`Compasso atual: ${currentTimeSigInfo.formatted}. Clique para alterar.`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{localTimeSig.numerator}</span>
            <div className="w-6 h-0.5 bg-current" />
            <span className="text-xl font-bold">{localTimeSig.denominator}</span>
          </div>
        </button>
      );
    }
    
    return (
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-200
          ${colors.bg} ${colors.hover} ${colors.border} border
          ${colors.text} shadow-lg
          hover:shadow-xl active:scale-95
          ${isOpen ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
        `}
        aria-label={`Compasso atual: ${currentTimeSigInfo.formatted} (${currentTimeSigInfo.type}). Clique para alterar.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="p-2 rounded-lg bg-gray-800/50">
          <Music size={20} className="text-blue-400" />
        </div>
        
        <div className="text-left">
          <div className="font-semibold">Compasso</div>
          <div className="text-xs text-gray-400">{currentTimeSigInfo.type}</div>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          {/* Display do compasso */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{localTimeSig.numerator}</span>
            <div className="w-8 h-0.5 bg-current" />
            <span className="text-2xl font-bold">{localTimeSig.denominator}</span>
          </div>
          
          {/* Seta do dropdown */}
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>
    );
  };
  
  // Renderiza a representação visual de um compasso
  const renderTimeSigVisualization = useCallback((timeSig) => {
    const isCompound = timeSig.denominator === 8;
    const isComplex = timeSig.denominator === 8 && timeSig.numerator % 3 !== 0;
    const grouping = isCompound ? timeSig.numerator / 3 : timeSig.numerator;
    
    return (
      <div className="relative h-12 w-full">
        {/* Linha de base */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700" />
        
        {/* Notas/divisões */}
        <div className="absolute inset-0 flex items-center justify-around px-2">
          {Array.from({ length: timeSig.numerator }).map((_, i) => {
            const isStrongBeat = i === 0;
            const isMediumBeat = isCompound ? i % 3 === 0 : i % 2 === 0;
            const isWeakBeat = !isStrongBeat && !isMediumBeat;
            
            let height = 8;
            let color = 'bg-gray-500';
            
            if (isStrongBeat) {
              height = 16;
              color = isCompound ? 'bg-purple-500' : 'bg-blue-500';
            } else if (isMediumBeat) {
              height = 12;
              color = isCompound ? 'bg-purple-400' : 'bg-blue-400';
            } else {
              height = 8;
              color = 'bg-gray-500';
            }
            
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{ width: `${100 / timeSig.numerator}%` }}
              >
                <div
                  className={`w-3 rounded-t-lg ${color} transition-all duration-300`}
                  style={{ height: `${height}px` }}
                />
                {/* Linha de ligação para compassos compostos */}
                {isCompound && i % 3 === 0 && i + 2 < timeSig.numerator && (
                  <div className="absolute h-0.5 w-1/3 bg-gray-600/50 top-1/2" 
                    style={{ 
                      left: `${(i / timeSig.numerator) * 100 + (100 / timeSig.numerator)}%`,
                      width: `${(200 / timeSig.numerator)}%`
                    }} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, []);
  
  // Renderiza o dropdown de compassos
  const renderDropdown = () => {
    if (!isOpen) return null;
    
    return (
      <div
        ref={menuRef}
        className={`
          absolute ${compact ? 'left-0' : 'left-0'} mt-2 w-96 rounded-xl shadow-2xl
          overflow-hidden z-50
          animate-in fade-in slide-in-from-top-2 duration-200
        `}
        style={{ zIndex }}
      >
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">
          {/* Cabeçalho do dropdown */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Compass size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Selecionar Compasso</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Escolha a estrutura rítmica da prática
                </p>
              </div>
            </div>
          </div>
          
          {/* Lista de compassos agrupados */}
          <div className="p-3 max-h-96 overflow-y-auto">
            {timeSigGroups.map((group, groupIndex) => (
              <div key={group.name} className={groupIndex > 0 ? 'mt-4' : ''}>
                {/* Cabeçalho do grupo */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{group.name}</h4>
                    <p className="text-xs text-gray-400">{group.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {group.timeSigs.length} opções
                  </div>
                </div>
                
                {/* Grid de compassos */}
                <div className="grid grid-cols-3 gap-2">
                  {group.timeSigs.map((timeSig) => {
                    const isCurrent = 
                      timeSig.numerator === localTimeSig.numerator && 
                      timeSig.denominator === localTimeSig.denominator;
                    
                    return (
                      <div
                        key={`${timeSig.numerator}/${timeSig.denominator}`}
                        onClick={() => handleTimeSigChange(timeSig)}
                        className={`
                          relative p-3 rounded-lg cursor-pointer
                          transition-all duration-200
                          ${isCurrent ? colors.active : 'hover:bg-gray-800/50'}
                          border ${isCurrent ? 'border-blue-500/50' : 'border-gray-700'}
                        `}
                        aria-label={`Compasso ${formatTimeSignature(timeSig)}`}
                        role="option"
                        aria-selected={isCurrent}
                      >
                        {/* Indicador de seleção atual */}
                        {isCurrent && (
                          <div className="absolute -top-1 -right-1">
                            <div className="p-1 rounded-full bg-green-500">
                              <Check size={10} className="text-white" />
                            </div>
                          </div>
                        )}
                        
                        {/* Display do compasso */}
                        <div className="flex flex-col items-center mb-2">
                          <div className="text-2xl font-bold text-white">
                            {timeSig.numerator}
                          </div>
                          <div className="w-8 h-0.5 bg-gray-600" />
                          <div className="text-2xl font-bold text-white">
                            {timeSig.denominator}
                          </div>
                        </div>
                        
                        {/* Visualização rítmica */}
                        <div className="mb-2">
                          {renderTimeSigVisualization(timeSig)}
                        </div>
                        
                        {/* Informações adicionais */}
                        <div className="text-center">
                          <div className="text-xs text-gray-400">
                            {timeSig.numerator}/{timeSig.denominator}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {timeSig.denominator === 4 ? 'Simples' : 
                             timeSig.denominator === 8 && timeSig.numerator % 3 === 0 ? 'Composto' : 
                             'Complexo'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Preview do compasso selecionado */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">Compasso Selecionado</div>
                <div className="text-xs text-gray-400">{currentTimeSigInfo.description}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentTimeSigInfo.formatted}</div>
                <div className="text-xs text-gray-400">{currentTimeSigInfo.type}</div>
              </div>
            </div>
            
            {/* Visualização detalhada */}
            <div className="mb-3">
              {renderTimeSigVisualization(localTimeSig)}
            </div>
            
            {/* Explicação do compasso */}
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Zap size={12} />
              <span>
                {currentTimeSigInfo.isCompound ? 
                  `Agrupado em ${currentTimeSigInfo.grouping} grupos de 3` :
                  currentTimeSigInfo.isComplex ?
                  'Padrão irregular - desafio avançado' :
                  `${localTimeSig.numerator} tempos por compasso`
                }
              </span>
            </div>
          </div>
          
          {/* Rodapé com dica */}
          <div className="p-3 border-t border-gray-800 bg-gray-900/80">
            <div className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
              <TrendingUp size={12} />
              <span>Compassos compostos desenvolvem fluência em subdivisões ternárias</span>
            </div>
          </div>
        </div>
        
        {/* Seta do dropdown */}
        <div className={`absolute -top-2 ${compact ? 'left-4' : 'left-6'} w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900`} />
      </div>
    );
  };
  
  // Renderiza informações detalhadas do compasso atual (apenas para compact=false)
  const renderTimeSigDetails = () => {
    if (compact || !showDescription) return null;
    
    const timeSig = localTimeSig;
    const noteValue = timeSig.denominator === 4 ? 'semínima' :
                     timeSig.denominator === 8 ? 'colcheia' :
                     timeSig.denominator === 2 ? 'mínima' : 'nota';
    
    return (
      <div className="mt-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-800/50">
              {currentTimeSigInfo.isCompound ? (
                <Clock size={20} className="text-purple-400" />
              ) : currentTimeSigInfo.isComplex ? (
                <Hash size={20} className="text-red-400" />
              ) : (
                <Divide size={20} className="text-blue-400" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white">Compasso {currentTimeSigInfo.formatted}</h4>
              <p className="text-sm text-gray-300">{currentTimeSigInfo.type}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">Valor da nota</div>
            <div className="font-semibold text-white">{noteValue}</div>
          </div>
        </div>
        
        {/* Explicação detalhada */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Tempos</div>
            <div className="text-lg font-bold text-white">{timeSig.numerator}</div>
            <div className="text-xs text-gray-400">por compasso</div>
          </div>
          
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Unidade</div>
            <div className="text-lg font-bold text-white">1/{timeSig.denominator}</div>
            <div className="text-xs text-gray-400">da nota</div>
          </div>
        </div>
        
        {/* Dica de prática */}
        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Zap size={12} />
            <span>
              {currentTimeSigInfo.isCompound ? 
                'Foque no "swing" natural dos grupos de 3' :
                currentTimeSigInfo.isComplex ?
                'Conte em voz alta para manter o tempo irregular' :
                'Use um metrônomo para desenvolver consistência nos tempos fortes'
              }
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {renderButton()}
        {renderDropdown()}
      </div>
      
      {renderTimeSigDetails()}
      
      {/* Overlay para fechar menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        />
      )}
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.2s ease-out forwards;
        }
        
        .slide-in-from-top-2 {
          transform: translateY(-10px);
          animation: slideInFromTop 0.2s ease-out forwards;
        }
        
        @keyframes slideInFromTop {
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .animate-pulse-beat {
          animation: pulse-beat 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
TimeSigPicker.defaultProps = {
  currentTimeSig: TIME_SIGNATURES['4/4'],
  showDescription: true,
  compact: false,
  theme: 'default',
  className: '',
};

export default React.memo(TimeSigPicker);

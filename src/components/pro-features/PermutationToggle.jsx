// /src/components/pro-features/PermutationToggle.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Shuffle, 
  Grid3x3, 
  Zap, 
  Lock, 
  Unlock,
  Play,
  Pause,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { formatProFeature } from '../../utils/formatters';

/**
 * PermutationToggle - Botão de permutação para modo PRO
 * Controla o ciclo automático por todas combinações de subdivisões
 */
const PermutationToggle = ({
  enabled = false,
  isPlaying = false,
  currentPermutation = 1,
  totalPermutations = 9,
  permutationStart = 1,
  permutationEnd = 9,
  currentCombination = { rows: 1, cols: 1 },
  onToggle,
  onStartChange,
  onEndChange,
  onPlayPause,
  onNext,
  onPrevious,
  onReset,
  showAdvanced = true,
  compact = false,
  theme = 'pro-gold',
  className = '',
}) => {
  const [localEnabled, setLocalEnabled] = useState(enabled);
  const [localPlaying, setLocalPlaying] = useState(isPlaying);
  const [localStart, setLocalStart] = useState(permutationStart);
  const [localEnd, setLocalEnd] = useState(permutationEnd);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Atualiza estados locais quando props mudam
  useEffect(() => {
    setLocalEnabled(enabled);
  }, [enabled]);
  
  useEffect(() => {
    setLocalPlaying(isPlaying);
  }, [isPlaying]);
  
  useEffect(() => {
    setLocalStart(permutationStart);
  }, [permutationStart]);
  
  useEffect(() => {
    setLocalEnd(permutationEnd);
  }, [permutationEnd]);
  
  // Calcula progresso da permutação
  useEffect(() => {
    if (!localEnabled || totalPermutations === 0) {
      setProgress(0);
      return;
    }
    
    const currentIndex = currentPermutation - 1;
    const progressValue = (currentIndex / (totalPermutations - 1)) * 100;
    setProgress(Math.min(100, Math.max(0, progressValue)));
  }, [currentPermutation, totalPermutations, localEnabled]);
  
  // Formata informações da feature
  const featureInfo = formatProFeature(localEnabled, 'permutation');
  
  // Calcula todas combinações possíveis
  const calculateAllCombinations = useCallback(() => {
    const combinations = [];
    for (let rows = localStart; rows <= localEnd; rows++) {
      for (let cols = localStart; cols <= localEnd; cols++) {
        combinations.push({ rows, cols });
      }
    }
    return combinations;
  }, [localStart, localEnd]);
  
  const allCombinations = calculateAllCombinations();
  const totalCombinations = allCombinations.length;
  
  // Temas de cores específicos para features PRO
  const themeColors = {
    'pro-gold': {
      bg: 'bg-gradient-to-br from-gray-950 to-amber-950/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      active: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      enabled: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      disabled: 'bg-gray-800',
      accent: 'text-amber-400',
      highlight: 'bg-amber-500/10',
    },
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      active: 'bg-blue-500/20',
      enabled: 'bg-blue-500',
      disabled: 'bg-gray-800',
      accent: 'text-blue-400',
      highlight: 'bg-blue-500/10',
    },
  };
  
  const colors = themeColors[theme] || themeColors['pro-gold'];
  
  // Manipuladores de eventos
  const handleToggle = useCallback(() => {
    const newState = !localEnabled;
    setLocalEnabled(newState);
    
    if (onToggle) {
      onToggle(newState);
    }
  }, [localEnabled, onToggle]);
  
  const handlePlayPause = useCallback(() => {
    const newState = !localPlaying;
    setLocalPlaying(newState);
    
    if (onPlayPause) {
      onPlayPause(newState);
    }
  }, [localPlaying, onPlayPause]);
  
  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    }
  }, [onNext]);
  
  const handlePrevious = useCallback(() => {
    if (onPrevious) {
      onPrevious();
    }
  }, [onPrevious]);
  
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
  const handleStartChange = useCallback((newStart) => {
    const clamped = Math.max(1, Math.min(newStart, 9));
    setLocalStart(clamped);
    
    if (onStartChange) {
      onStartChange(clamped);
    }
  }, [onStartChange]);
  
  const handleEndChange = useCallback((newEnd) => {
    const clamped = Math.max(1, Math.min(newEnd, 9));
    setLocalEnd(clamped);
    
    if (onEndChange) {
      onEndChange(clamped);
    }
  }, [onEndChange]);
  
  // Renderiza botão principal
  const renderMainButton = () => {
    return (
      <button
        onClick={handleToggle}
        className={`
          flex items-center justify-between w-full p-4 rounded-xl
          transition-all duration-200
          ${localEnabled ? colors.active : colors.disabled}
          border ${colors.border}
          ${colors.text} shadow-lg
          hover:scale-105 active:scale-95
          ${!compact ? 'mb-4' : ''}
        `}
        aria-label={localEnabled ? "Desativar permutação" : "Ativar permutação"}
        aria-pressed={localEnabled}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${localEnabled ? 'bg-amber-500/20' : 'bg-gray-700'}`}>
            {localEnabled ? (
              <Shuffle size={20} className="text-amber-400" />
            ) : (
              <Grid3x3 size={20} className="text-gray-400" />
            )}
          </div>
          
          <div className="text-left">
            <div className="font-semibold">{featureInfo.label}</div>
            <div className="text-xs text-gray-400">{featureInfo.description}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Badge de status */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${localEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
            {localEnabled ? 'ATIVO' : 'INATIVO'}
          </div>
          
          {/* Ícone de expandir/recolher (apenas se não for compact) */}
          {!compact && (
            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </button>
    );
  };
  
  // Renderiza controles de permutação
  const renderPermutationControls = () => {
    if (!localEnabled || (!isExpanded && !compact)) return null;
    
    return (
      <div className={`space-y-4 ${compact ? 'mt-3' : 'mt-4'}`}>
        {/* Controles de reprodução */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">Permutação:</div>
            <div className="font-bold text-white">
              {currentPermutation}/{totalPermutations}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Resetar permutação"
            >
              <RotateCw size={16} className="text-gray-400" />
            </button>
            
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Permutação anterior"
            >
              <ChevronLeft size={16} className="text-gray-400" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className={`
                p-2 rounded-full transition-all duration-200
                ${localPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                text-white
              `}
              aria-label={localPlaying ? "Pausar permutação" : "Iniciar permutação"}
            >
              {localPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              aria-label="Próxima permutação"
            >
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso: {Math.round(progress)}%</span>
            <span>{currentPermutation} de {totalPermutations}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Grid de combinações atual */}
        {!compact && (
          <div className="p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Combinação atual:</div>
              <div className="font-bold text-amber-400">
                {currentCombination.rows} × {currentCombination.cols}
              </div>
            </div>
            
            {/* Visualização do grid */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: currentCombination.rows * currentCombination.cols }).map((_, index) => {
                const row = Math.floor(index / currentCombination.cols);
                const col = index % currentCombination.cols;
                const isActive = row < currentCombination.rows && col < currentCombination.cols;
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded flex items-center justify-center
                      transition-all duration-200
                      ${isActive ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-700/50 border border-gray-600'}
                      ${index === 0 ? 'ring-2 ring-amber-400' : ''}
                    `}
                  >
                    {isActive && (
                      <div className="text-xs text-amber-300">
                        {row + 1}:{col + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Controles de intervalo (apenas modo avançado) */}
        {showAdvanced && !compact && (
          <div className="p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Intervalo de subdivisões:</div>
              <div className="font-bold text-white">
                {localStart} → {localEnd}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Controle de início */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Mínimo</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartChange(localStart - 1)}
                    disabled={localStart <= 1}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
                    aria-label="Diminuir mínimo"
                  >
                    <Minimize2 size={14} />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-white">{localStart}</div>
                  </div>
                  
                  <button
                    onClick={() => handleStartChange(localStart + 1)}
                    disabled={localStart >= localEnd}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
                    aria-label="Aumentar mínimo"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Controle de fim */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Máximo</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEndChange(localEnd - 1)}
                    disabled={localEnd <= localStart}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
                    aria-label="Diminuir máximo"
                  >
                    <Minimize2 size={14} />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-white">{localEnd}</div>
                  </div>
                  
                  <button
                    onClick={() => handleEndChange(localEnd + 1)}
                    disabled={localEnd >= 9}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
                    aria-label="Aumentar máximo"
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Estatísticas */}
        {!compact && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-lg font-bold text-amber-400">{totalCombinations}</div>
              <div className="text-xs text-gray-500">combinações</div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Atual</div>
              <div className="text-lg font-bold text-white">{currentPermutation}</div>
              <div className="text-xs text-gray-500">posição</div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Restantes</div>
              <div className="text-lg font-bold text-white">{totalCombinations - currentPermutation}</div>
              <div className="text-xs text-gray-500">para completar</div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza versão compacta
  const renderCompactView = () => {
    if (!compact) return null;
    
    return (
      <div className="space-y-3">
        {renderMainButton()}
        {localEnabled && renderPermutationControls()}
      </div>
    );
  };
  
  // Renderiza versão expandida
  const renderExpandedView = () => {
    if (compact) return null;
    
    return (
      <>
        {renderMainButton()}
        
        {/* Botão para expandir/recolher */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1"
          aria-label={isExpanded ? "Recolher controles" : "Expandir controles"}
        >
          {isExpanded ? 'Mostrar menos' : 'Mostrar controles'}
          <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
        
        {isExpanded && renderPermutationControls()}
      </>
    );
  };
  
  // Renderiza informações educacionais
  const renderEducationalInfo = () => {
    if (compact || !isExpanded) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-amber-400" />
          <div className="text-sm font-semibold text-white">Benefícios da Permutação</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Zap size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Desenvolve fluência em diferentes densidades rítmicas</span>
          </div>
          <div className="flex items-start gap-2">
            <BarChart3 size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Treina transições suaves entre padrões complexos</span>
          </div>
          <div className="flex items-start gap-2">
            <Grid3x3 size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Expande o vocabulário rítmico sistematicamente</span>
          </div>
          <div className="flex items-start gap-2">
            <Shuffle size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Prepara para situações musicais imprevisíveis</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <strong>Dica PRO:</strong> Comece com intervalo pequeno (ex: 3-5) e aumente gradualmente.
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        {/* Cabeçalho com badge PRO */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500">
              <Shuffle size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Permutação PRO</h3>
              <p className="text-xs text-gray-400">Feature exclusiva modo PRO</p>
            </div>
          </div>
          
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-900/30 to-yellow-900/30 text-amber-400 text-xs font-semibold">
            PRO FEATURE
          </div>
        </div>
        
        {compact ? renderCompactView() : renderExpandedView()}
        
        {renderEducationalInfo()}
        
        {/* Efeito visual de destaque */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-3xl blur-xl -z-10" />
      </div>
    </div>
  );
};

// Propriedades padrão
PermutationToggle.defaultProps = {
  enabled: false,
  isPlaying: false,
  currentPermutation: 1,
  totalPermutations: 9,
  permutationStart: 1,
  permutationEnd: 9,
  currentCombination: { rows: 1, cols: 1 },
  showAdvanced: true,
  compact: false,
  theme: 'pro-gold',
  className: '',
};

export default React.memo(PermutationToggle);

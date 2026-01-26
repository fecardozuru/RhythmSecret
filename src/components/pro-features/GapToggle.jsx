// /src/components/pro-features/GapToggle.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Pause, 
  Play, 
  Timer, 
  Clock,
  Zap,
  RotateCw,
  VolumeX,
  Volume2,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Music,
  AlertCircle
} from 'lucide-react';
import { formatProFeature, formatDuration } from '../../utils/formatters';

/**
 * GapToggle - Botão de gap entre ciclos para modo PRO
 * Adiciona silêncio controlado entre repetições de padrões
 */
const GapToggle = ({
  enabled = false,
  gapDuration = 500,
  gapPosition = 'after',
  isInGap = false,
  currentCycle = 1,
  totalCycles = 0,
  onToggle,
  onDurationChange,
  onPositionChange,
  onSkipGap,
  onReset,
  showAdvanced = true,
  compact = false,
  theme = 'pro-gold',
  className = '',
}) => {
  const [localEnabled, setLocalEnabled] = useState(enabled);
  const [localGapDuration, setLocalGapDuration] = useState(gapDuration);
  const [localGapPosition, setLocalGapPosition] = useState(gapPosition);
  const [localIsInGap, setLocalIsInGap] = useState(isInGap);
  const [gapProgress, setGapProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Atualiza estados locais quando props mudam
  useEffect(() => {
    setLocalEnabled(enabled);
  }, [enabled]);
  
  useEffect(() => {
    setLocalGapDuration(gapDuration);
  }, [gapDuration]);
  
  useEffect(() => {
    setLocalGapPosition(gapPosition);
  }, [gapPosition]);
  
  useEffect(() => {
    setLocalIsInGap(isInGap);
  }, [isInGap]);
  
  // Animação de progresso do gap
  useEffect(() => {
    if (!localIsInGap || !localEnabled) {
      setGapProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setGapProgress(prev => {
        const increment = 100 / (localGapDuration / 100); // Atualiza a cada 100ms
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [localIsInGap, localEnabled, localGapDuration]);
  
  // Formata informações da feature
  const featureInfo = formatProFeature(localEnabled, 'gap');
  const formattedDuration = formatDuration(localGapDuration, true);
  
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
      gapActive: 'bg-purple-500/20',
      gapInactive: 'bg-gray-800/50',
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
      gapActive: 'bg-purple-500/20',
      gapInactive: 'bg-gray-800/50',
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
  
  const handleDurationChange = useCallback((newDuration) => {
    const clamped = Math.max(100, Math.min(newDuration, 5000));
    setLocalGapDuration(clamped);
    
    if (onDurationChange) {
      onDurationChange(clamped);
    }
  }, [onDurationChange]);
  
  const handlePositionChange = useCallback((newPosition) => {
    setLocalGapPosition(newPosition);
    
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  }, [onPositionChange]);
  
  const handleSkipGap = useCallback(() => {
    if (onSkipGap) {
      onSkipGap();
    }
  }, [onSkipGap]);
  
  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    }
  }, [onReset]);
  
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
          ${localIsInGap ? 'animate-pulse-gap' : ''}
        `}
        aria-label={localEnabled ? "Desativar gap entre ciclos" : "Ativar gap entre ciclos"}
        aria-pressed={localEnabled}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${localEnabled ? 'bg-amber-500/20' : 'bg-gray-700'} ${localIsInGap ? 'animate-pulse' : ''}`}>
            {localIsInGap ? (
              <VolumeX size={20} className="text-purple-400" />
            ) : localEnabled ? (
              <Pause size={20} className="text-amber-400" />
            ) : (
              <Play size={20} className="text-gray-400" />
            )}
          </div>
          
          <div className="text-left">
            <div className="font-semibold">{featureInfo.label}</div>
            <div className="text-xs text-gray-400">
              {localEnabled 
                ? `Silêncio de ${formattedDuration} entre ciclos` 
                : featureInfo.description}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de estado do gap */}
          {localIsInGap && (
            <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold animate-pulse">
              EM GAP
            </div>
          )}
          
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
  
  // Renderiza indicador visual do gap
  const renderGapVisualization = () => {
    if (!localEnabled || (!isExpanded && !compact)) return null;
    
    return (
      <div className={`space-y-4 ${compact ? 'mt-3' : 'mt-4'}`}>
        {/* Visualização do ciclo com gap */}
        <div className="relative h-16 rounded-lg overflow-hidden bg-gray-800/30">
          {/* Ciclo normal */}
          <div className={`absolute inset-y-0 left-0 ${localGapPosition === 'before' ? 'w-3/4' : 'w-1/4'}`}>
            <div className="h-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400">Ciclo</div>
                <div className="text-lg font-bold text-white">{currentCycle}</div>
              </div>
            </div>
          </div>
          
          {/* Gap */}
          <div className={`absolute inset-y-0 ${localGapPosition === 'before' ? 'left-3/4 right-1/4' : 'left-1/4 right-3/4'}`}>
            <div className={`h-full ${localIsInGap ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/30' : 'bg-gradient-to-r from-gray-700 to-gray-800'} flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-xs text-gray-400">Gap</div>
                <div className="text-lg font-bold text-white">{formattedDuration}</div>
              </div>
            </div>
            
            {/* Progresso do gap atual */}
            {localIsInGap && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
                style={{
                  left: `${gapProgress}%`,
                  width: '20%',
                  transform: 'translateX(-50%)',
                }}
              />
            )}
          </div>
          
          {/* Ciclo normal (após o gap) */}
          {localGapPosition === 'before' && (
            <div className="absolute inset-y-0 right-0 w-1/4">
              <div className="h-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Próximo</div>
                  <div className="text-lg font-bold text-white">{currentCycle + 1}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Ciclo normal (antes do gap) */}
          {localGapPosition === 'after' && (
            <div className="absolute inset-y-0 right-0 w-3/4">
              <div className="h-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Ciclo</div>
                  <div className="text-lg font-bold text-white">{currentCycle}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Marcadores */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-3">
            <div className="text-xs text-blue-400">Música</div>
            <div className="text-xs text-purple-400">Silêncio</div>
            <div className="text-xs text-cyan-400">Música</div>
          </div>
        </div>
        
        {/* Controles de duração do gap */}
        {showAdvanced && !compact && (
          <div className="p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Duração do Gap:</div>
              <div className="font-bold text-white">{formattedDuration}</div>
            </div>
            
            <div className="space-y-3">
              {/* Slider de duração */}
              <div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={localGapDuration}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                  aria-label="Duração do gap em milissegundos"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1s</span>
                  <span>1s</span>
                  <span>2s</span>
                  <span>3s</span>
                  <span>5s</span>
                </div>
              </div>
              
              {/* Botões rápidos de duração */}
              <div className="flex flex-wrap gap-2">
                {[250, 500, 1000, 2000].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => handleDurationChange(duration)}
                    className={`
                      px-3 py-2 rounded-lg text-sm transition-all duration-200
                      ${localGapDuration === duration ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                    `}
                    aria-label={`Definir gap para ${formatDuration(duration, true)}`}
                  >
                    {formatDuration(duration, true)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Controles de posição do gap */}
        {!compact && (
          <div className="p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Posição do Gap:</div>
              <div className="font-bold text-white capitalize">{localGapPosition}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePositionChange('before')}
                className={`
                  p-3 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200
                  ${localGapPosition === 'before' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-700 hover:bg-gray-600'}
                `}
                aria-label="Gap antes do ciclo"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Pause size={16} className={localGapPosition === 'before' ? 'text-amber-400' : 'text-gray-400'} />
                  <Play size={16} className={localGapPosition === 'before' ? 'text-blue-400' : 'text-gray-400'} />
                </div>
                <div className="text-sm font-semibold">Antes</div>
                <div className="text-xs text-gray-400">Gap → Ciclo</div>
              </button>
              
              <button
                onClick={() => handlePositionChange('after')}
                className={`
                  p-3 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200
                  ${localGapPosition === 'after' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-700 hover:bg-gray-600'}
                `}
                aria-label="Gap após o ciclo"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Play size={16} className={localGapPosition === 'after' ? 'text-blue-400' : 'text-gray-400'} />
                  <Pause size={16} className={localGapPosition === 'after' ? 'text-amber-400' : 'text-gray-400'} />
                </div>
                <div className="text-sm font-semibold">Após</div>
                <div className="text-xs text-gray-400">Ciclo → Gap</div>
              </button>
            </div>
          </div>
        )}
        
        {/* Controles de ação durante o gap */}
        {localIsInGap && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-purple-400" />
                <div className="text-sm font-semibold text-white">Gap Ativo</div>
              </div>
              <div className="text-xs text-purple-400">
                {Math.round(gapProgress)}% completo
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSkipGap}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                aria-label="Pular gap"
              >
                <SkipForward size={16} />
                <span className="text-sm">Pular</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                aria-label="Resetar gap"
              >
                <RotateCw size={16} />
                <span className="text-sm">Resetar</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Informações do ciclo */}
        {!compact && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Ciclo Atual</div>
              <div className="text-lg font-bold text-white">{currentCycle}</div>
              <div className="text-xs text-gray-500">posição</div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Duração Total</div>
              <div className="text-lg font-bold text-white">{formattedDuration}</div>
              <div className="text-xs text-gray-500">por gap</div>
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
        {localEnabled && renderGapVisualization()}
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
        
        {isExpanded && renderGapVisualization()}
      </>
    );
  };
  
  // Renderiza informações educacionais
  const renderEducationalInfo = () => {
    if (compact || !isExpanded) return null;
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-amber-400" />
          <div className="text-sm font-semibold text-white">Benefícios do Gap</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Timer size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Treina a reação após pausas inesperadas</span>
          </div>
          <div className="flex items-start gap-2">
            <Music size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Desenvolve o senso de tempo interno</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Prepara para entradas precisas em ensemble</span>
          </div>
          <div className="flex items-start gap-2">
            <Zap size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Aumenta a concentração e foco durante a performance</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <strong>Dica PRO:</strong> Use gaps curtos (250-500ms) para desenvolvimento técnico, e gaps mais longos (1-2s) para treino mental.
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
              <Pause size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Gap entre Ciclos</h3>
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
GapToggle.defaultProps = {
  enabled: false,
  gapDuration: 500,
  gapPosition: 'after',
  isInGap: false,
  currentCycle: 1,
  totalCycles: 0,
  showAdvanced: true,
  compact: false,
  theme: 'pro-gold',
  className: '',
};

export default React.memo(GapToggle);

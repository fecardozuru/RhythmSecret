// /src/components/pro-features/GhostModeToggle.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Ghost, 
  Zap, 
  Music, 
  Volume2, 
  VolumeX,
  Shuffle,
  RotateCw,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause
} from 'lucide-react';
import { formatProFeature, formatVolume } from '../../utils/formatters';

/**
 * GhostModeToggle - Botão de ghost notes aleatórias para modo PRO
 * Adiciona notas fantasmas (volume baixo) aleatórias para treino auditivo
 */
const GhostModeToggle = ({
  enabled = false,
  ghostProbability = 0.3,
  ghostVolume = 0.15,
  isActive = false,
  currentGhostNotes = 0,
  totalNotes = 0,
  onToggle,
  onProbabilityChange,
  onVolumeChange,
  onShuffle,
  onReset,
  showAdvanced = true,
  compact = false,
  theme = 'pro-gold',
  className = '',
}) => {
  const [localEnabled, setLocalEnabled] = useState(enabled);
  const [localProbability, setLocalProbability] = useState(ghostProbability);
  const [localGhostVolume, setLocalGhostVolume] = useState(ghostVolume);
  const [localIsActive, setLocalIsActive] = useState(isActive);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ghostAnimation, setGhostAnimation] = useState(false);
  
  // Atualiza estados locais quando props mudam
  useEffect(() => {
    setLocalEnabled(enabled);
  }, [enabled]);
  
  useEffect(() => {
    setLocalProbability(ghostProbability);
  }, [ghostProbability]);
  
  useEffect(() => {
    setLocalGhostVolume(ghostVolume);
  }, [ghostVolume]);
  
  useEffect(() => {
    setLocalIsActive(isActive);
  }, [isActive]);
  
  // Animação do fantasma
  useEffect(() => {
    if (!localEnabled || !localIsActive) {
      setGhostAnimation(false);
      return;
    }
    
    const interval = setInterval(() => {
      setGhostAnimation(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [localEnabled, localIsActive]);
  
  // Formata informações da feature
  const featureInfo = formatProFeature(localEnabled, 'ghost');
  
  // Calcula estatísticas
  const ghostPercentage = Math.round(localProbability * 100);
  const estimatedGhostNotes = Math.round(totalNotes * localProbability);
  const currentPercentage = totalNotes > 0 
    ? Math.round((currentGhostNotes / totalNotes) * 100) 
    : 0;
  
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
      ghostActive: 'bg-purple-500/20',
      ghostInactive: 'bg-gray-800/50',
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
      ghostActive: 'bg-purple-500/20',
      ghostInactive: 'bg-gray-800/50',
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
  
  const handleProbabilityChange = useCallback((newProbability) => {
    const clamped = Math.max(0, Math.min(1, newProbability));
    setLocalProbability(clamped);
    
    if (onProbabilityChange) {
      onProbabilityChange(clamped);
    }
  }, [onProbabilityChange]);
  
  const handleVolumeChange = useCallback((newVolume) => {
    const clamped = Math.max(0.05, Math.min(0.3, newVolume));
    setLocalGhostVolume(clamped);
    
    if (onVolumeChange) {
      onVolumeChange(clamped);
    }
  }, [onVolumeChange]);
  
  const handleShuffle = useCallback(() => {
    if (onShuffle) {
      onShuffle();
    }
  }, [onShuffle]);
  
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
          ${ghostAnimation ? 'animate-ghost-pulse' : ''}
        `}
        aria-label={localEnabled ? "Desativar ghost notes" : "Ativar ghost notes"}
        aria-pressed={localEnabled}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${localEnabled ? 'bg-amber-500/20' : 'bg-gray-700'} ${ghostAnimation ? 'animate-float' : ''}`}>
            <Ghost 
              size={20} 
              className={localEnabled ? "text-amber-400" : "text-gray-400"}
            />
          </div>
          
          <div className="text-left">
            <div className="font-semibold">{featureInfo.label}</div>
            <div className="text-xs text-gray-400">
              {localEnabled 
                ? `${ghostPercentage}% de notas fantasmas` 
                : featureInfo.description}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de ghost notes ativas */}
          {localIsActive && localEnabled && (
            <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold animate-pulse">
              {currentGhostNotes} GHOSTS
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
  
  // Renderiza visualização das ghost notes
  const renderGhostVisualization = () => {
    if (!localEnabled || (!isExpanded && !compact)) return null;
    
    // Simula uma sequência de notas com/sem ghosts
    const sequenceLength = compact ? 8 : 12;
    const ghostSequence = Array.from({ length: sequenceLength }).map((_, index) => {
      const isGhost = Math.random() < localProbability;
      const isCurrent = index === Math.floor(sequenceLength / 2);
      
      return {
        index,
        isGhost,
        isCurrent,
        volume: isGhost ? localGhostVolume : 0.7,
      };
    });
    
    return (
      <div className={`space-y-4 ${compact ? 'mt-3' : 'mt-4'}`}>
        {/* Visualização da sequência */}
        <div className="p-3 rounded-lg bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">Sequência de Exemplo</div>
            <div className="text-xs text-gray-500">
              {ghostPercentage}% probabilidade
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1 mb-2">
            {ghostSequence.map((note, index) => (
              <div
                key={index}
                className={`
                  w-8 h-12 rounded-lg flex flex-col items-center justify-end
                  transition-all duration-300
                  ${note.isGhost 
                    ? 'bg-gradient-to-b from-purple-500/30 to-purple-600/30 border border-purple-500/50' 
                    : 'bg-gradient-to-b from-blue-500/30 to-cyan-500/30 border border-blue-500/50'}
                  ${note.isCurrent ? 'ring-2 ring-amber-400 scale-110' : ''}
                `}
              >
                {/* Volume bar */}
                <div
                  className={`
                    w-3/4 rounded-t-lg mb-1
                    ${note.isGhost ? 'bg-purple-400' : 'bg-blue-400'}
                  `}
                  style={{ height: `${note.volume * 100}%` }}
                />
                
                {/* Note indicator */}
                <div className="text-xs mb-1">
                  {note.isGhost ? (
                    <Ghost size={10} className="text-purple-300" />
                  ) : (
                    <Music size={10} className="text-blue-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
              <span className="text-gray-400">Nota normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/50" />
              <span className="text-gray-400">Ghost note</span>
            </div>
          </div>
        </div>
        
        {/* Controles de probabilidade e volume */}
        {showAdvanced && !compact && (
          <>
            {/* Controle de probabilidade */}
            <div className="p-3 rounded-lg bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400">Probabilidade de Ghost Notes:</div>
                <div className="font-bold text-white">{ghostPercentage}%</div>
              </div>
              
              <div className="space-y-3">
                {/* Slider de probabilidade */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={ghostPercentage}
                    onChange={(e) => handleProbabilityChange(parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                    aria-label="Probabilidade de ghost notes"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Botões rápidos de probabilidade */}
                <div className="flex flex-wrap gap-2">
                  {[0.1, 0.25, 0.5, 0.75].map((prob) => (
                    <button
                      key={prob}
                      onClick={() => handleProbabilityChange(prob)}
                      className={`
                        px-3 py-2 rounded-lg text-sm transition-all duration-200
                        ${localProbability === prob ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                      `}
                      aria-label={`${Math.round(prob * 100)}% de ghost notes`}
                    >
                      {Math.round(prob * 100)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Controle de volume */}
            <div className="p-3 rounded-lg bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400">Volume das Ghost Notes:</div>
                <div className="font-bold text-white">{formatVolume(localGhostVolume, 'percent')}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <VolumeX size={16} className="text-gray-400" />
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={localGhostVolume * 100}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                    aria-label="Volume das ghost notes"
                  />
                  <Volume2 size={16} className="text-gray-400" />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sutil</span>
                  <span>Médio</span>
                  <span>Audível</span>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Controles de ação */}
        {!compact && (
          <div className="p-3 rounded-lg bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400">Controles</div>
              <div className="text-xs text-gray-500">
                {currentGhostNotes} ghost notes ativas
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                aria-label="Embaralhar ghost notes"
              >
                <Shuffle size={16} />
                <span className="text-sm">Embaralhar</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                aria-label="Resetar ghost notes"
              >
                <RotateCw size={16} />
                <span className="text-sm">Resetar</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Estatísticas */}
        {!compact && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Probabilidade</div>
              <div className="text-lg font-bold text-purple-400">{ghostPercentage}%</div>
              <div className="text-xs text-gray-500">de ocorrência</div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Volume</div>
              <div className="text-lg font-bold text-amber-400">{formatVolume(localGhostVolume, 'percent')}</div>
              <div className="text-xs text-gray-500">das ghosts</div>
            </div>
            
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-400">Estimado</div>
              <div className="text-lg font-bold text-white">{estimatedGhostNotes}</div>
              <div className="text-xs text-gray-500">por sequência</div>
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
        {localEnabled && renderGhostVisualization()}
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
        
        {isExpanded && renderGhostVisualization()}
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
          <div className="text-sm font-semibold text-white">Benefícios das Ghost Notes</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <BarChart3 size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Desenvolve ouvido para nuances sutis</span>
          </div>
          <div className="flex items-start gap-2">
            <Music size={12} className="text-amber-400 mt=0.5" />
            <span className="text-gray-400">Treina a percepção de densidade rítmica</span>
          </div>
          <div className="flex items-start gap-2">
            <Zap size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Aumenta a atenção auditiva durante a performance</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle size={12} className="text-amber-400 mt-0.5" />
            <span className="text-gray-400">Prepara para situações com instrumentação complexa</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <strong>Dica PRO:</strong> Comece com probabilidade baixa (10-25%) e aumente gradualmente. 
          Use volume muito baixo (5-10%) para desafios auditivos avançados.
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
              <Ghost size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Ghost Notes</h3>
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
GhostModeToggle.defaultProps = {
  enabled: false,
  ghostProbability: 0.3,
  ghostVolume: 0.15,
  isActive: false,
  currentGhostNotes: 0,
  totalNotes: 0,
  showAdvanced: true,
  compact: false,
  theme: 'pro-gold',
  className: '',
};

export default React.memo(GhostModeToggle);

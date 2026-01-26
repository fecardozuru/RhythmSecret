// /src/components/ui/LoopControl.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Repeat, 
  Repeat1, 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause,
  RotateCcw,
  Zap,
  Clock,
  Timer,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { calculateLoopDuration } from '../../utils/timingUtils';

/**
 * LoopControl - Controles de loop com passos e auto-loop
 * Gerencia repetição de sequências com controles avançados
 */
const LoopControl = ({
  isLooping = false,
  isAutoLoop = false,
  loopStart = 0,
  loopEnd = 0,
  totalSteps = 0,
  currentStep = 0,
  bpm = 120,
  timeSignature = { numerator: 4, denominator: 4 },
  measuresPerLoop = 1,
  onLoopToggle,
  onAutoLoopToggle,
  onLoopStartChange,
  onLoopEndChange,
  onMeasuresChange,
  onJumpToStart,
  onJumpToEnd,
  onResetLoop,
  showAdvanced = true,
  compact = false,
  theme = 'default',
  className = '',
}) => {
  const [localIsLooping, setLocalIsLooping] = useState(isLooping);
  const [localIsAutoLoop, setLocalIsAutoLoop] = useState(isAutoLoop);
  const [localLoopStart, setLocalLoopStart] = useState(loopStart);
  const [localLoopEnd, setLocalLoopEnd] = useState(loopEnd);
  const [localMeasures, setLocalMeasures] = useState(measuresPerLoop);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [loopProgress, setLoopProgress] = useState(0);
  
  // Atualiza estados locais quando props mudam
  useEffect(() => {
    setLocalIsLooping(isLooping);
  }, [isLooping]);
  
  useEffect(() => {
    setLocalIsAutoLoop(isAutoLoop);
  }, [isAutoLoop]);
  
  useEffect(() => {
    setLocalLoopStart(loopStart);
  }, [loopStart]);
  
  useEffect(() => {
    setLocalLoopEnd(loopEnd);
  }, [loopEnd]);
  
  useEffect(() => {
    setLocalMeasures(measuresPerLoop);
  }, [measuresPerLoop]);
  
  // Calcula progresso do loop
  useEffect(() => {
    if (!localIsLooping || totalSteps === 0) {
      setLoopProgress(0);
      return;
    }
    
    const loopLength = localLoopEnd - localLoopStart;
    if (loopLength <= 0) {
      setLoopProgress(0);
      return;
    }
    
    const positionInLoop = (currentStep - localLoopStart) % loopLength;
    const progress = (positionInLoop / loopLength) * 100;
    setLoopProgress(Math.min(100, Math.max(0, progress)));
  }, [currentStep, localLoopStart, localLoopEnd, localIsLooping, totalSteps]);
  
  // Calcula duração do loop em milissegundos
  const loopDuration = calculateLoopDuration(bpm, timeSignature, localMeasures);
  const formattedDuration = formatDuration(loopDuration);
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      active: 'bg-blue-500',
      loopActive: 'bg-green-500/20',
      loopInactive: 'bg-gray-800',
      sliderTrack: 'bg-gray-700',
      sliderProgress: 'bg-blue-500',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-pink-900/30 to-purple-900/30',
      text: 'text-white',
      border: 'border-pink-500/30',
      active: 'bg-gradient-to-r from-pink-500 to-purple-500',
      loopActive: 'bg-pink-500/20',
      loopInactive: 'bg-gray-800',
      sliderTrack: 'bg-gray-700',
      sliderProgress: 'bg-gradient-to-r from-pink-500 to-purple-500',
    },
    tiktok: {
      bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
      text: 'text-white',
      border: 'border-cyan-500/30',
      active: 'bg-gradient-to-r from-cyan-400 to-blue-500',
      loopActive: 'bg-cyan-500/20',
      loopInactive: 'bg-gray-800',
      sliderTrack: 'bg-gray-700',
      sliderProgress: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      active: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      loopActive: 'bg-amber-500/20',
      loopInactive: 'bg-gray-800',
      sliderTrack: 'bg-gray-700',
      sliderProgress: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Manipuladores de eventos
  const handleLoopToggle = useCallback(() => {
    const newState = !localIsLooping;
    setLocalIsLooping(newState);
    
    if (onLoopToggle) {
      onLoopToggle(newState);
    }
  }, [localIsLooping, onLoopToggle]);
  
  const handleAutoLoopToggle = useCallback(() => {
    const newState = !localIsAutoLoop;
    setLocalIsAutoLoop(newState);
    
    if (onAutoLoopToggle) {
      onAutoLoopToggle(newState);
    }
  }, [localIsAutoLoop, onAutoLoopToggle]);
  
  const handleStartChange = useCallback((newStart) => {
    const clampedStart = Math.max(0, Math.min(newStart, totalSteps - 1));
    setLocalLoopStart(clampedStart);
    
    if (onLoopStartChange) {
      onLoopStartChange(clampedStart);
    }
  }, [totalSteps, onLoopStartChange]);
  
  const handleEndChange = useCallback((newEnd) => {
    const clampedEnd = Math.max(1, Math.min(newEnd, totalSteps));
    setLocalLoopEnd(clampedEnd);
    
    if (onLoopEndChange) {
      onLoopEndChange(clampedEnd);
    }
  }, [totalSteps, onLoopEndChange]);
  
  const handleMeasuresChange = useCallback((newMeasures) => {
    const clampedMeasures = Math.max(1, Math.min(newMeasures, 16));
    setLocalMeasures(clampedMeasures);
    
    if (onMeasuresChange) {
      onMeasuresChange(clampedMeasures);
    }
  }, [onMeasuresChange]);
  
  const handleJumpToStart = useCallback(() => {
    if (onJumpToStart) {
      onJumpToStart(localLoopStart);
    }
  }, [localLoopStart, onJumpToStart]);
  
  const handleJumpToEnd = useCallback(() => {
    if (onJumpToEnd) {
      onJumpToEnd(localLoopEnd - 1);
    }
  }, [localLoopEnd, onJumpToEnd]);
  
  const handleResetLoop = useCallback(() => {
    const defaultStart = 0;
    const defaultEnd = totalSteps;
    
    setLocalLoopStart(defaultStart);
    setLocalLoopEnd(defaultEnd);
    
    if (onResetLoop) {
      onResetLoop(defaultStart, defaultEnd);
    }
  }, [totalSteps, onResetLoop]);
  
  // Configura loop para compassos completos
  const setLoopToMeasures = useCallback((measures) => {
    const stepsPerMeasure = timeSignature.numerator; // Assumindo 1 subdivisão por batida
    const newStart = 0;
    const newEnd = Math.min(totalSteps, measures * stepsPerMeasure);
    
    handleStartChange(newStart);
    handleEndChange(newEnd);
    handleMeasuresChange(measures);
  }, [timeSignature, totalSteps, handleStartChange, handleEndChange, handleMeasuresChange]);
  
  // Renderiza controles de loop básicos
  const renderBasicControls = () => {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Botão de loop */}
          <button
            onClick={handleLoopToggle}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl
              transition-all duration-200
              ${localIsLooping ? colors.loopActive : colors.loopInactive}
              border ${localIsLooping ? 'border-green-500/50' : colors.border}
              ${colors.text} shadow-lg
              hover:scale-105 active:scale-95
            `}
            aria-label={localIsLooping ? "Desativar loop" : "Ativar loop"}
            aria-pressed={localIsLooping}
          >
            {localIsLooping ? (
              <Repeat1 size={20} className="text-green-500" />
            ) : (
              <Repeat size={20} className="text-gray-400" />
            )}
            <span className="font-semibold">
              {localIsLooping ? 'Loop ON' : 'Loop OFF'}
            </span>
          </button>
          
          {/* Botão de auto-loop */}
          <button
            onClick={handleAutoLoopToggle}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl
              transition-all duration-200
              ${localIsAutoLoop ? colors.loopActive : colors.loopInactive}
              border ${localIsAutoLoop ? 'border-blue-500/50' : colors.border}
              ${colors.text} shadow-lg
              hover:scale-105 active:scale-95
              ${!localIsLooping ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={!localIsLooping}
            aria-label={localIsAutoLoop ? "Desativar auto-loop" : "Ativar auto-loop"}
            aria-pressed={localIsAutoLoop}
            aria-disabled={!localIsLooping}
          >
            <Zap size={20} className={localIsAutoLoop ? "text-blue-500" : "text-gray-400"} />
            <span className="font-semibold">
              {localIsAutoLoop ? 'Auto ON' : 'Auto OFF'}
            </span>
          </button>
        </div>
        
        {/* Informações do loop */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Duração do loop</div>
          <div className="text-lg font-bold text-white">{formattedDuration}</div>
          <div className="text-xs text-gray-500">
            {localMeasures} compasso{localMeasures !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza barra de progresso do loop
  const renderLoopProgressBar = () => {
    if (!localIsLooping || totalSteps === 0) return null;
    
    const loopLength = localLoopEnd - localLoopStart;
    const loopSteps = Array.from({ length: loopLength }, (_, i) => localLoopStart + i);
    
    return (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Início: {localLoopStart + 1}</span>
          <span>Progresso: {Math.round(loopProgress)}%</span>
          <span>Fim: {localLoopEnd}</span>
        </div>
        
        <div className="relative h-8">
          {/* Track de fundo */}
          <div className={`absolute inset-0 rounded-full ${colors.sliderTrack}`} />
          
          {/* Progresso atual */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${colors.sliderProgress} transition-all duration-300`}
            style={{ width: `${loopProgress}%` }}
          />
          
          {/* Marcadores de passos */}
          <div className="absolute inset-0 flex items-center px-2">
            {loopSteps.map((step, index) => {
              const position = (index / (loopLength - 1)) * 100;
              const isCurrent = step === currentStep;
              
              return (
                <div
                  key={step}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div
                    className={`
                      w-2 h-2 rounded-full
                      ${isCurrent ? 'bg-white ring-2 ring-white ring-offset-1 ring-offset-gray-900' : 'bg-gray-600'}
                      transition-all duration-200
                      ${isCurrent ? 'scale-150' : ''}
                    `}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Marcadores de início e fim */}
          <div className="absolute -top-1 left-0 transform -translate-x-1/2">
            <div className="text-xs text-blue-400 font-semibold">INÍCIO</div>
            <div className="w-0 h-3 border-l-2 border-blue-400 border-dashed mx-auto" />
          </div>
          
          <div className="absolute -top-1 right-0 transform translate-x-1/2">
            <div className="text-xs text-red-400 font-semibold">FIM</div>
            <div className="w-0 h-3 border-l-2 border-red-400 border-dashed mx-auto" />
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza controles avançados de loop
  const renderAdvancedControls = () => {
    if (!showAdvanced) return null;
    
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-white">Controles Avançados</h4>
          <button
            onClick={handleResetLoop}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            aria-label="Resetar loop para padrão"
          >
            <RotateCcw size={12} />
            <span>Resetar</span>
          </button>
        </div>
        
        {/* Controles de início e fim */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Controle de início */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Início do Loop</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartChange(localLoopStart - 1)}
                disabled={localLoopStart <= 0}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Mover início para esquerda"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-white">{localLoopStart + 1}</div>
                <div className="text-xs text-gray-400">passo</div>
              </div>
              
              <button
                onClick={() => handleStartChange(localLoopStart + 1)}
                disabled={localLoopStart >= localLoopEnd - 1}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Mover início para direita"
              >
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={handleJumpToStart}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                aria-label="Pular para início do loop"
              >
                <SkipBack size={16} />
              </button>
            </div>
          </div>
          
          {/* Controle de fim */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Fim do Loop</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEndChange(localLoopEnd - 1)}
                disabled={localLoopEnd <= localLoopStart + 1}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Mover fim para esquerda"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-white">{localLoopEnd}</div>
                <div className="text-xs text-gray-400">passo</div>
              </div>
              
              <button
                onClick={() => handleEndChange(localLoopEnd + 1)}
                disabled={localLoopEnd >= totalSteps}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Mover fim para direita"
              >
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={handleJumpToEnd}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                aria-label="Pular para fim do loop"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Controle de compassos */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            Compassos por Loop: {localMeasures}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMeasuresChange(localMeasures - 1)}
              disabled={localMeasures <= 1}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30"
              aria-label="Reduzir número de compassos"
            >
              <Minimize2 size={16} />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="16"
                value={localMeasures}
                onChange={(e) => handleMeasuresChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                aria-label="Número de compassos por loop"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 compasso</span>
                <span>4 compassos</span>
                <span>8 compassos</span>
                <span>16 compassos</span>
              </div>
            </div>
            
            <button
              onClick={() => handleMeasuresChange(localMeasures + 1)}
              disabled={localMeasures >= 16}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30"
              aria-label="Aumentar número de compassos"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
        
        {/* Botões rápidos de compassos */}
        <div className="mt-4">
          <div className="text-xs text-gray-400 mb-2">Loop rápido:</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 4, 8].map((measures) => (
              <button
                key={measures}
                onClick={() => setLoopToMeasures(measures)}
                className={`
                  px-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${localMeasures === measures ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                `}
                aria-label={`Definir loop para ${measures} compasso${measures !== 1 ? 's' : ''}`}
              >
                {measures} compasso{measures !== 1 ? 's' : ''}
              </button>
            ))}
            <button
              onClick={() => setLoopToMeasures(totalSteps / timeSignature.numerator)}
              className="px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
              aria-label="Loop completo"
            >
              Completo
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza informações do loop
  const renderLoopInfo = () => {
    if (compact) return null;
    
    const loopLength = localLoopEnd - localLoopStart;
    const loopBeats = loopLength; // Assumindo 1 subdivisão por batida
    const loopMeasures = Math.ceil(loopBeats / timeSignature.numerator);
    
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-800/30 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400">Passos</div>
          <div className="text-lg font-bold text-white">{loopLength}</div>
          <div className="text-xs text-gray-500">
            {localLoopStart + 1} → {localLoopEnd}
          </div>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400">Batidas</div>
          <div className="text-lg font-bold text-white">{loopBeats}</div>
          <div className="text-xs text-gray-500">
            {timeSignature.numerator}/{timeSignature.denominator}
          </div>
        </div>
        
        <div className="bg-gray-800/30 p-3 rounded-lg text-center">
          <div className="text-xs text-gray-400">Duração</div>
          <div className="text-lg font-bold text-white">{formattedDuration}</div>
          <div className="text-xs text-gray-500">
            {loopMeasures} compasso{loopMeasures !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza versão compacta
  const renderCompactView = () => {
    if (!compact) return null;
    
    return (
      <div className="flex flex-col gap-3">
        {/* Controles básicos */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLoopToggle}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              ${localIsLooping ? colors.loopActive : colors.loopInactive}
              ${colors.text}
              hover:scale-105 active:scale-95
            `}
            aria-label={localIsLooping ? "Desativar loop" : "Ativar loop"}
          >
            {localIsLooping ? (
              <Repeat1 size={16} className="text-green-500" />
            ) : (
              <Repeat size={16} className="text-gray-400" />
            )}
            <span className="text-sm">Loop</span>
          </button>
          
          <button
            onClick={handleAutoLoopToggle}
            disabled={!localIsLooping}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg
              transition-all duration-200
              ${localIsAutoLoop ? colors.loopActive : colors.loopInactive}
              ${colors.text}
              hover:scale-105 active:scale-95
              ${!localIsLooping ? 'opacity-30' : ''}
            `}
            aria-label={localIsAutoLoop ? "Desativar auto-loop" : "Ativar auto-loop"}
          >
            <Zap size={16} className={localIsAutoLoop ? "text-blue-500" : "text-gray-400"} />
            <span className="text-sm">Auto</span>
          </button>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">Duração</div>
            <div className="text-sm font-bold">{formattedDuration}</div>
          </div>
        </div>
        
        {/* Barra de progresso simplificada */}
        {localIsLooping && (
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 ${colors.sliderProgress} transition-all duration-300`}
              style={{ width: `${loopProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza versão normal
  const renderNormalView = () => {
    if (compact) return null;
    
    return (
      <>
        {renderBasicControls()}
        {renderLoopProgressBar()}
        {renderLoopInfo()}
        {renderAdvancedControls()}
      </>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Controle de Loop</h2>
            <p className="text-sm text-gray-400">
              {localIsLooping ? 'Loop ativo' : 'Loop inativo'} • {localIsAutoLoop ? 'Auto-loop ON' : 'Auto-loop OFF'}
            </p>
          </div>
          
          {/* Status visual */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${localIsLooping ? 'animate-pulse bg-green-500' : 'bg-gray-500'}`} />
            <div className="text-xs text-gray-400">
              {localIsLooping ? 'Repetindo' : 'Uma vez'}
            </div>
          </div>
        </div>
        
        {compact ? renderCompactView() : renderNormalView()}
        
        {/* Dicas e informações */}
        {!compact && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Como usar:</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Repeat size={12} className="text-green-500 mt-0.5" />
                <span className="text-gray-400">Loop: repete a seção selecionada continuamente</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap size={12} className="text-blue-500 mt-0.5" />
                <span className="text-gray-400">Auto-loop: alterna automaticamente entre diferentes seções</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={12} className="text-amber-500 mt-0.5" />
                <span className="text-gray-400">Use loops curtos para praticar passagens difíceis</span>
              </div>
              <div className="flex items-start gap-2">
                <Timer size={12} className="text-purple-500 mt-0.5" />
                <span className="text-gray-400">Loops longos desenvolvem resistência e consistência</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes pulse-loop {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse-loop {
          animation: pulse-loop 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
LoopControl.defaultProps = {
  isLooping: false,
  isAutoLoop: false,
  loopStart: 0,
  loopEnd: 0,
  totalSteps: 0,
  currentStep: 0,
  bpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  measuresPerLoop: 1,
  showAdvanced: true,
  compact: false,
  theme: 'default',
  className: '',
};

export default React.memo(LoopControl);

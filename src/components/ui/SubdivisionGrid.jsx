// /src/components/ui/SubdivisionGrid.jsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import VolumeColumn from './VolumeColumn';
import { formatRhythmSequence } from '../../utils/formatters';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

/**
 * SubdivisionGrid - Grade completa de subdivisões com efeitos visuais
 * Gerencia e exibe todas as colunas de volume com controles de reprodução
 */
const SubdivisionGrid = ({
  sequence = [],
  currentStep = 0,
  isPlaying = false,
  bpm = 120,
  timeSignature = { numerator: 4, denominator: 4 },
  onStepClick,
  onVolumeChange,
  onPlayPause,
  onPrevious,
  onNext,
  onReset,
  theme = 'default',
  maxColumns = 9,
  showControls = true,
  showVisualizer = true,
  showSequenceDisplay = true,
  className = '',
}) => {
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [beatHighlight, setBeatHighlight] = useState(null);
  const [measureCount, setMeasureCount] = useState(1);
  const [beatCount, setBeatCount] = useState(1);
  
  // Calcula informações da sequência
  const sequenceInfo = useMemo(() => {
    if (!sequence || sequence.length === 0) {
      return {
        totalSteps: 0,
        activeSteps: 0,
        averageVolume: 0,
        accents: 0,
        ghosts: 0,
        formattedSequence: '',
      };
    }
    
    const activeSteps = sequence.filter(step => step.active).length;
    const totalVolume = sequence.reduce((sum, step) => sum + (step.active ? step.volume : 0), 0);
    const accents = sequence.filter(step => step.accent).length;
    const ghosts = sequence.filter(step => step.volume < 0.3 && step.active).length;
    
    return {
      totalSteps: sequence.length,
      activeSteps,
      averageVolume: activeSteps > 0 ? totalVolume / activeSteps : 0,
      accents,
      ghosts,
      formattedSequence: formatRhythmSequence(sequence, { maxLength: 16 }),
    };
  }, [sequence]);
  
  // Efeito para highlight de batida
  useEffect(() => {
    if (!isPlaying || sequence.length === 0) {
      setBeatHighlight(null);
      return;
    }
    
    const beatDuration = 60000 / bpm;
    const subdivisionDuration = beatDuration / timeSignature.numerator;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const stepIndex = Math.floor(now % (sequence.length * subdivisionDuration) / subdivisionDuration);
      
      // Calcula batida atual
      const beatIndex = Math.floor(stepIndex / timeSignature.numerator);
      setBeatCount((beatIndex % timeSignature.numerator) + 1);
      
      // Atualiza contador de compasso
      if (beatIndex > 0 && beatIndex % timeSignature.numerator === 0) {
        setMeasureCount(prev => prev + 1);
      }
      
      // Ativa highlight visual
      setBeatHighlight(beatIndex);
      
      // Desativa highlight após um curto período
      setTimeout(() => {
        setBeatHighlight(null);
      }, 100);
    }, subdivisionDuration);
    
    return () => clearInterval(interval);
  }, [isPlaying, bpm, timeSignature, sequence.length]);
  
  // Efeito para animação do visualizer
  useEffect(() => {
    if (!showVisualizer || !isPlaying) {
      setVisualizerActive(false);
      return;
    }
    
    setVisualizerActive(true);
    const timer = setTimeout(() => setVisualizerActive(false), 300);
    
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, showVisualizer]);
  
  // Manipulador de clique em uma coluna
  const handleColumnClick = useCallback((index) => {
    if (onStepClick) {
      onStepClick(index);
    }
  }, [onStepClick]);
  
  // Manipulador de mudança de volume
  const handleVolumeChange = useCallback((index, volume) => {
    if (onVolumeChange) {
      onVolumeChange(index, volume);
    }
  }, [onVolumeChange]);
  
  // Renderiza colunas de volume
  const renderColumns = () => {
    if (!sequence || sequence.length === 0) {
      return (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">Nenhuma sequência definida</p>
        </div>
      );
    }
    
    // Limita ao máximo de colunas
    const columnsToShow = sequence.slice(0, maxColumns);
    
    return columnsToShow.map((step, index) => {
      // Determina se é acento (volume alto ou flag específica)
      const isAccent = step.accent || step.volume > 0.7;
      
      // Determina se é fantasma (volume muito baixo)
      const isGhost = step.volume > 0 && step.volume < 0.3;
      
      // Determina se está ativo
      const isActive = step.active && step.volume > 0;
      
      return (
        <VolumeColumn
          key={`step-${index}`}
          index={index}
          volume={step.volume}
          isActive={isActive}
          isCurrent={index === currentStep}
          isAccent={isAccent}
          isGhost={isGhost}
          onClick={handleColumnClick}
          onVolumeChange={handleVolumeChange}
          theme={theme}
          columnHeight={160}
          showLabel={columnsToShow.length <= 9}
        />
      );
    });
  };
  
  // Renderiza visualizer de onda
  const renderWaveVisualizer = () => {
    if (!showVisualizer || sequence.length === 0) return null;
    
    return (
      <div className="relative h-12 mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-gray-900/20 to-gray-900/10">
        {/* Onda de fundo */}
        <div className="absolute inset-0 flex items-center">
          <svg className="w-full h-6" viewBox="0 0 100 10">
            <path
              d="M0,5 Q25,2 50,5 T100,5"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-700"
            />
          </svg>
        </div>
        
        {/* Onda ativa sincronizada com a sequência */}
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full h-full">
            {sequence.slice(0, 16).map((step, index) => {
              const isActive = step.active && index === currentStep;
              const amplitude = step.volume * 0.8;
              
              return (
                <div
                  key={`wave-${index}`}
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{
                    left: `${(index / Math.min(16, sequence.length)) * 100}%`,
                    width: `${100 / Math.min(16, sequence.length)}%`,
                  }}
                >
                  <div
                    className={`
                      mx-auto transition-all duration-300 ease-out
                      ${visualizerActive && isActive ? 'opacity-100' : 'opacity-40'}
                      ${step.accent ? 'bg-gradient-to-t from-amber-500 to-yellow-500' : 
                        step.volume > 0.5 ? 'bg-gradient-to-t from-blue-500 to-cyan-400' :
                        'bg-gradient-to-t from-gray-600 to-gray-500'}
                    `}
                    style={{
                      height: `${amplitude * 24}px`,
                      width: '70%',
                      borderRadius: '2px',
                      transition: 'height 0.2s ease-out, opacity 0.3s ease-out',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Marcador de posição atual */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/50 shadow-lg transition-all duration-100"
          style={{
            left: `${(currentStep / Math.min(16, sequence.length)) * 100}%`,
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-white shadow" />
        </div>
        
        {/* Grid de tempo */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: timeSignature.numerator + 1 }).map((_, i) => (
            <div
              key={`beat-marker-${i}`}
              className="h-full border-r border-white/20"
              style={{
                width: `${100 / timeSignature.numerator}%`,
              }}
            >
              {i < timeSignature.numerator && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/60">
                  {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderiza display de sequência textual
  const renderSequenceDisplay = () => {
    if (!showSequenceDisplay || !sequenceInfo.formattedSequence) return null;
    
    return (
      <div className="mb-4 p-3 bg-gray-900/30 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Sequência</h3>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
              {sequenceInfo.activeSteps} ativas
            </span>
            {sequenceInfo.accents > 0 && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded">
                {sequenceInfo.accents} acentos
              </span>
            )}
          </div>
        </div>
        
        <div className="font-mono text-lg tracking-wider text-center text-gray-100">
          {sequenceInfo.formattedSequence.split('').map((char, index) => {
            const isCurrent = index === currentStep % sequenceInfo.formattedSequence.length;
            
            let charClass = 'text-gray-400';
            if (char === '●') charClass = 'text-blue-400';
            if (char === '▲') charClass = 'text-amber-400';
            if (char === '○') charClass = 'text-gray-500';
            if (char === '×') charClass = 'text-red-400';
            
            return (
              <span
                key={`seq-char-${index}`}
                className={`
                  inline-block transition-all duration-200
                  ${charClass}
                  ${isCurrent ? 'scale-125 font-bold text-white' : ''}
                `}
              >
                {char}
              </span>
            );
          })}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          <span>● Nota cheia</span>
          <span className="mx-2">▲ Acento</span>
          <span className="mx-2">○ Fantasma</span>
          <span className="mx-2">× Pausa</span>
          <span className="mx-2">· Silêncio</span>
        </div>
      </div>
    );
  };
  
  // Renderiza controles de reprodução
  const renderControls = () => {
    if (!showControls) return null;
    
    return (
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={onReset}
          className={`
            p-3 rounded-full transition-all duration-200
            hover:bg-gray-700 active:scale-95
            ${theme === 'pro-gold' ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-gray-300'}
          `}
          aria-label="Reiniciar sequência"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={onPrevious}
          className={`
            p-3 rounded-full transition-all duration-200
            hover:bg-gray-700 active:scale-95
            ${theme === 'pro-gold' ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-gray-300'}
          `}
          aria-label="Passo anterior"
        >
          <SkipBack size={24} />
        </button>
        
        <button
          onClick={onPlayPause}
          className={`
            p-4 rounded-full transition-all duration-200
            ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            text-white shadow-lg hover:shadow-xl active:scale-95
          `}
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        
        <button
          onClick={onNext}
          className={`
            p-3 rounded-full transition-all duration-200
            hover:bg-gray-700 active:scale-95
            ${theme === 'pro-gold' ? 'text-amber-400 hover:text-amber-300' : 'text-gray-400 hover:text-gray-300'}
          `}
          aria-label="Próximo passo"
        >
          <SkipForward size={24} />
        </button>
      </div>
    );
  };
  
  // Renderiza informações do compasso atual
  const renderMeasureInfo = () => {
    return (
      <div className="flex items-center justify-between mb-6 p-3 bg-gray-900/30 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-400">Compasso</div>
          <div className="text-2xl font-bold">
            {measureCount}
            <span className="text-lg text-gray-400">.{beatCount}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-400">Subdivisão</div>
          <div className="text-2xl font-bold">
            {currentStep + 1}<span className="text-lg text-gray-400">/{sequence.length}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-400">BPM</div>
          <div className="text-2xl font-bold">{Math.round(bpm)}</div>
        </div>
      </div>
    );
  };
  
  // Renderiza highlight de batida atual
  const renderBeatHighlight = () => {
    if (beatHighlight === null || sequence.length === 0) return null;
    
    const beatWidth = 100 / timeSignature.numerator;
    const currentBeat = beatHighlight % timeSignature.numerator;
    
    return (
      <div
        className="absolute top-0 bottom-0 pointer-events-none transition-all duration-100"
        style={{
          left: `${currentBeat * beatWidth}%`,
          width: `${beatWidth}%`,
          background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)',
        }}
      />
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Container principal */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl p-6 shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Grade Rítmica</h2>
            <p className="text-sm text-gray-400">
              {sequence.length} subdivisões • {timeSignature.numerator}/{timeSignature.denominator}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-gray-800 rounded-full text-sm">
              <span className="text-gray-400">Ativas: </span>
              <span className="font-semibold text-white">{sequenceInfo.activeSteps}</span>
            </div>
            
            {sequenceInfo.accents > 0 && (
              <div className="px-3 py-1 bg-amber-900/30 rounded-full text-sm">
                <span className="text-amber-400 font-semibold">▲{sequenceInfo.accents}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Visualizer de onda */}
        {renderWaveVisualizer()}
        
        {/* Display de sequência */}
        {renderSequenceDisplay()}
        
        {/* Informações do compasso */}
        {renderMeasureInfo()}
        
        {/* Controles de reprodução */}
        {renderControls()}
        
        {/* Grade de colunas */}
        <div className="relative mb-8">
          {/* Highlight de batida atual */}
          {renderBeatHighlight()}
          
          {/* Grid de colunas */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4 justify-center">
            {renderColumns()}
          </div>
          
          {/* Indicador de overflow */}
          {sequence.length > maxColumns && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-400">
                <span>+{sequence.length - maxColumns} subdivisões ocultas</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Legenda */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Ativa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Acento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Fantasma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <span>Inativa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900" />
            <span>Atual</span>
          </div>
        </div>
      </div>
      
      {/* Efeitos visuais */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl -z-10" />
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        .animate-slide-right {
          animation: slide-right 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Propriedades padrão
SubdivisionGrid.defaultProps = {
  sequence: [],
  currentStep: 0,
  isPlaying: false,
  bpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  maxColumns: 9,
  showControls: true,
  showVisualizer: true,
  showSequenceDisplay: true,
  theme: 'default',
  className: '',
};

export default React.memo(SubdivisionGrid);

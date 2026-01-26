// /src/components/ui/MetronomeDisplay.jsx

import React, { useEffect, useState } from 'react';
import { 
  Music, 
  Volume2, 
  Zap, 
  ChevronRight,
  Pause,
  Play,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { useTheme } from '../../constants/themes';

/**
 * Display visual do metrônomo com contador de compassos e feedback em tempo real
 */
const MetronomeDisplay = ({ 
  isPlaying = false,
  currentBeat = 1,
  currentSubdivision = 1,
  totalBeats = 4,
  currentSubdivisionTotal = 4,
  bpm = 120,
  accentBeats = [1],
  onPlayPause,
  onNext,
  onPrevious
}) => {
  const { currentTheme, themeClasses } = useTheme();
  const [pulse, setPulse] = useState(false);
  const [subdivisionPulse, setSubdivisionPulse] = useState(false);

  // Efeito de pulso para a batida principal
  useEffect(() => {
    if (isPlaying) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 100);
      return () => clearTimeout(timer);
    }
  }, [currentBeat, isPlaying]);

  // Efeito de pulso para subdivisões
  useEffect(() => {
    if (isPlaying && currentSubdivision > 1) {
      setSubdivisionPulse(true);
      const timer = setTimeout(() => setSubdivisionPulse(false), 50);
      return () => clearTimeout(timer);
    }
  }, [currentSubdivision, isPlaying]);

  // Cores baseadas no tipo de batida
  const getBeatColor = (beatIndex) => {
    const isAccent = accentBeats.includes(beatIndex);
    const isCurrent = beatIndex === currentBeat;
    
    if (isCurrent && isAccent) {
      return {
        bg: themeClasses.accent,
        text: 'text-white',
        glow: 'shadow-lg shadow-orange-500/30'
      };
    }
    
    if (isCurrent) {
      return {
        bg: themeClasses.primary,
        text: 'text-white',
        glow: 'shadow-lg shadow-blue-500/30'
      };
    }
    
    if (isAccent) {
      return {
        bg: themeClasses.accent + ' opacity-30',
        text: themeClasses.accentText,
        glow: ''
      };
    }
    
    return {
      bg: themeClasses.surface + ' opacity-50',
      text: themeClasses.text + ' opacity-70',
      glow: ''
    };
  };

  // Ícone baseado no estado
  const getPlayIcon = () => {
    if (pulse) {
      return <Zap className="w-6 h-6" />;
    }
    return isPlaying ? 
      <Pause className="w-6 h-6" /> : 
      <Play className="w-6 h-6" />;
  };

  // Texto da subdivisão atual
  const getSubdivisionText = () => {
    const subdivisions = [
      '⌀', // 0 (não usado)
      '1', 'e', '&', 'a',
      '1', 'e', '&', 'a', 'da',
      '1', 'e', '&', 'a', 'da', 'di'
    ];
    
    if (currentSubdivisionTotal <= 4) {
      const base = ['1', 'e', '&', 'a'];
      return base[(currentSubdivision - 1) % 4] || '1';
    }
    
    if (currentSubdivisionTotal <= 5) {
      const base = ['1', 'e', '&', 'a', 'da'];
      return base[(currentSubdivision - 1) % 5] || '1';
    }
    
    return subdivisions[currentSubdivision] || currentSubdivision.toString();
  };

  return (
    <div className={`
      p-6 rounded-2xl
      ${themeClasses.surface}
      ${themeClasses.border}
      backdrop-blur-sm
      transition-all duration-300
    `}>
      {/* Cabeçalho com título e BPM */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl
            flex items-center justify-center
            ${themeClasses.primary}
            ${pulse ? 'scale-110' : ''}
            transition-all duration-200
          `}>
            <Music className="w-6 h-6" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Metrônomo
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${isPlaying ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}
                transition-colors duration-300
              `}>
                {isPlaying ? 'PLAYING' : 'PAUSED'}
              </span>
            </h2>
            <p className="text-sm opacity-75">
              Visualização em tempo real
            </p>
          </div>
        </div>
        
        {/* Display de BPM grande */}
        <div className={`
          px-4 py-3 rounded-xl
          ${themeClasses.secondary}
          text-center min-w-[120px]
          transition-all duration-300
        `}>
          <div className="text-xs opacity-75 mb-1">BPM</div>
          <div className="text-3xl font-bold tracking-tight">
            {bpm}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {bpm < 60 ? 'Lento' : bpm < 120 ? 'Moderado' : bpm < 180 ? 'Rápido' : 'Extremo'}
          </div>
        </div>
      </div>

      {/* Grade de compasso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            Compasso Ativo
            <span className="text-sm font-normal opacity-75">
              {totalBeats}/{currentSubdivisionTotal}
            </span>
          </h3>
          
          {/* Indicador de subdivisão */}
          <div className={`
            px-3 py-1.5 rounded-lg
            ${subdivisionPulse ? themeClasses.highlight : themeClasses.surface}
            flex items-center gap-2
            transition-all duration-200
          `}>
            <Volume2 className="w-4 h-4" />
            <span className="font-mono">
              Sub: {getSubdivisionText()}
            </span>
          </div>
        </div>
        
        {/* Visualização das batidas do compasso */}
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {Array.from({ length: Math.max(totalBeats, 8) }).map((_, index) => {
            const beatNum = index + 1;
            const beatColor = getBeatColor(beatNum);
            const isActiveBeat = beatNum <= totalBeats;
            
            return (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg
                  flex flex-col items-center justify-center
                  transition-all duration-300
                  ${isActiveBeat ? beatColor.bg : themeClasses.surface + ' opacity-20'}
                  ${beatColor.glow}
                  ${pulse && beatNum === currentBeat ? 'scale-105' : ''}
                  ${!isActiveBeat ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={`Batida ${beatNum}${accentBeats.includes(beatNum) ? ' (Acento)' : ''}`}
              >
                {/* Número da batida */}
                <span className={`
                  text-lg font-bold
                  ${isActiveBeat ? beatColor.text : 'opacity-30'}
                `}>
                  {beatNum}
                </span>
                
                {/* Indicador de acento */}
                {accentBeats.includes(beatNum) && isActiveBeat && (
                  <div className={`
                    w-2 h-2 rounded-full mt-1
                    ${beatNum === currentBeat ? 'bg-white' : themeClasses.accent}
                  `} />
                )}
                
                {/* Indicador de batida atual */}
                {beatNum === currentBeat && isPlaying && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legendas */}
        <div className="flex items-center justify-between mt-4 text-xs opacity-75">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Batida Atual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500/30" />
              <span>Acento</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-500/20" />
              <span>Inativo</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-mono">
              Beat: {currentBeat}/{totalBeats}
            </div>
            <div className="opacity-60">
              Sub: {currentSubdivision}/{currentSubdivisionTotal}
            </div>
          </div>
        </div>
      </div>

      {/* Controles de transporte */}
      <div className={`
        p-4 rounded-xl
        ${themeClasses.secondary}
        flex items-center justify-between
      `}>
        <div className="flex items-center gap-2">
          {/* Botão Previous */}
          <button
            onClick={onPrevious}
            className={`
              p-3 rounded-xl
              ${themeClasses.surface}
              hover:${themeClasses.primary}
              transition-all duration-200
              hover:scale-105 active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
            disabled={!isPlaying}
            title="Beat anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          {/* Botão Play/Pause principal */}
          <button
            onClick={onPlayPause}
            className={`
              p-4 rounded-xl
              ${themeClasses.primary}
              hover:${themeClasses.accent}
              transition-all duration-200
              hover:scale-105 active:scale-95
              ${pulse ? 'animate-pulse' : ''}
              min-w-[100px]
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {getPlayIcon()}
              <span className="font-semibold">
                {isPlaying ? 'PAUSAR' : 'PLAY'}
              </span>
            </div>
          </button>
          
          {/* Botão Next */}
          <button
            onClick={onNext}
            className={`
              p-3 rounded-xl
              ${themeClasses.surface}
              hover:${themeClasses.primary}
              transition-all duration-200
              hover:scale-105 active:scale-95
              disabled:opacity-30 disabled:cursor-not-allowed
            `}
            disabled={!isPlaying}
            title="Próximo beat"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        {/* Indicador de tempo */}
        <div className="text-right">
          <div className="text-2xl font-mono font-bold">
            {currentBeat.toString().padStart(2, '0')}:
            {currentSubdivision.toString().padStart(2, '0')}
          </div>
          <div className="text-xs opacity-75">
            Tempo ativo
          </div>
        </div>
      </div>

      {/* Barra de progresso do compasso */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Progresso do compasso</span>
          <span>
            {Math.round((currentBeat / totalBeats) * 100)}%
          </span>
        </div>
        
        <div className={`
          h-2 rounded-full overflow-hidden
          ${themeClasses.surface}
        `}>
          <div
            className={`
              h-full rounded-full
              ${themeClasses.primary}
              transition-all duration-300
            `}
            style={{
              width: `${(currentBeat / totalBeats) * 100}%`
            }}
          />
        </div>
        
        {/* Marcadores de subdivisão */}
        <div className="flex justify-between mt-2 px-1">
          {Array.from({ length: totalBeats }).map((_, index) => (
            <div
              key={index}
              className={`
                w-1 h-3 rounded-full
                ${index + 1 <= currentBeat ? themeClasses.accent : themeClasses.surface}
                transition-colors duration-300
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Propriedades padrão
MetronomeDisplay.defaultProps = {
  isPlaying: false,
  currentBeat: 1,
  currentSubdivision: 1,
  totalBeats: 4,
  currentSubdivisionTotal: 4,
  bpm: 120,
  accentBeats: [1],
  onPlayPause: () => {},
  onNext: () => {},
  onPrevious: () => {}
};

export default MetronomeDisplay;

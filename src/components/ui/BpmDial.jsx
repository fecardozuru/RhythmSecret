// /src/components/ui/BpmDial.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Minus, Music, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { formatBpm, getBpmZone } from '../../utils/formatters';
import { calculateBpmAngle, angleToBpm } from '../../utils/timingUtils';
import { BPM_STEP_OPTIONS, COMMON_BPMS } from '../../constants/bpmSteps';

/**
 * BpmDial - Controle circular de BPM com ponteiro animado
 * Interface interativa para ajuste preciso de tempo
 */
const BpmDial = ({
  bpm = 120,
  minBpm = 40,
  maxBpm = 300,
  step = 5,
  onChange,
  onStepChange,
  theme = 'default',
  showPresets = true,
  showStepSelector = true,
  animated = true,
  size = 'lg',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentStep, setCurrentStep] = useState(step);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showStepMenu, setShowStepMenu] = useState(false);
  
  const dialRef = useRef(null);
  const dragStartAngle = useRef(0);
  const dragStartRotation = useRef(0);
  
  // Configurações baseadas no tamanho
  const sizeConfig = {
    sm: { diameter: 160, strokeWidth: 8, fontSize: 'text-lg', iconSize: 16 },
    md: { diameter: 200, strokeWidth: 10, fontSize: 'text-xl', iconSize: 20 },
    lg: { diameter: 240, strokeWidth: 12, fontSize: 'text-2xl', iconSize: 24 },
    xl: { diameter: 300, strokeWidth: 14, fontSize: 'text-3xl', iconSize: 28 },
  };
  
  const config = sizeConfig[size] || sizeConfig.lg;
  const radius = config.diameter / 2;
  const center = radius;
  const trackRadius = radius - config.strokeWidth;
  
  // Temas de cores
  const themeColors = {
    default: {
      track: 'text-gray-800',
      progress: 'text-blue-500',
      pointer: 'text-blue-400',
      text: 'text-white',
      bg: 'bg-gray-900',
      button: 'bg-gray-800 hover:bg-gray-700',
    },
    instagram: {
      track: 'text-gray-800',
      progress: 'text-gradient-to-r from-pink-500 to-purple-500',
      pointer: 'text-pink-400',
      text: 'text-white',
      bg: 'bg-gray-900',
      button: 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 hover:opacity-90',
    },
    tiktok: {
      track: 'text-gray-800',
      progress: 'text-gradient-to-r from-cyan-400 to-blue-500',
      pointer: 'text-cyan-300',
      text: 'text-white',
      bg: 'bg-gray-900',
      button: 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 hover:opacity-90',
    },
    'pro-gold': {
      track: 'text-gray-800',
      progress: 'text-gradient-to-r from-amber-400 to-yellow-500',
      pointer: 'text-amber-300',
      text: 'text-amber-50',
      bg: 'bg-gray-950',
      button: 'bg-gradient-to-r from-amber-900/30 to-yellow-900/30 hover:opacity-90',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Atualiza rotação quando BPM muda
  useEffect(() => {
    const newRotation = calculateBpmAngle(bpm, minBpm, maxBpm);
    setRotation(newRotation);
  }, [bpm, minBpm, maxBpm]);
  
  // Obtém informações da zona de BPM atual
  const bpmZone = getBpmZone(bpm);
  
  // Manipulador de início do drag
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    
    // Calcula ângulo inicial
    dragStartAngle.current = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
    dragStartRotation.current = rotation;
    
    // Adiciona listeners
    const handleMove = (moveEvent) => {
      const clientX = moveEvent.clientX || moveEvent.touches[0].clientX;
      const clientY = moveEvent.clientY || moveEvent.touches[0].clientY;
      
      const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - dragStartAngle.current;
      
      let newRotation = dragStartRotation.current + angleDiff;
      
      // Mantém entre 135° e 405° (270° de rotação)
      if (newRotation < 135) newRotation = 135;
      if (newRotation > 405) newRotation = 405;
      
      setRotation(newRotation);
      
      // Calcula novo BPM
      const newBpm = angleToBpm(newRotation, minBpm, maxBpm);
      
      if (onChange && Math.round(newBpm) !== bpm) {
        onChange(Math.round(newBpm));
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [radius, rotation, bpm, minBpm, maxBpm, onChange]);
  
  // Incrementa BPM
  const incrementBpm = useCallback(() => {
    const newBpm = Math.min(maxBpm, bpm + currentStep);
    if (onChange) onChange(newBpm);
  }, [bpm, maxBpm, currentStep, onChange]);
  
  // Decrementa BPM
  const decrementBpm = useCallback(() => {
    const newBpm = Math.max(minBpm, bpm - currentStep);
    if (onChange) onChange(newBpm);
  }, [bpm, minBpm, currentStep, onChange]);
  
  // Aplica um preset de BPM
  const applyBpmPreset = useCallback((presetBpm) => {
    if (onChange) onChange(presetBpm);
    setShowPresetsMenu(false);
  }, [onChange]);
  
  // Altera o passo de incremento
  const changeStep = useCallback((newStep) => {
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep);
    setShowStepMenu(false);
  }, [onStepChange]);
  
  // Renderiza o círculo do dial
  const renderDialCircle = () => {
    const startAngle = 135;
    const endAngle = 405;
    const currentAngle = rotation;
    
    // Converte ângulos para radianos
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    const currentRad = (currentAngle - 90) * Math.PI / 180;
    
    // Calcula pontos do arco
    const startX = center + trackRadius * Math.cos(startRad);
    const startY = center + trackRadius * Math.sin(startRad);
    const endX = center + trackRadius * Math.cos(endRad);
    const endY = center + trackRadius * Math.sin(endRad);
    const currentX = center + trackRadius * Math.cos(currentRad);
    const currentY = center + trackRadius * Math.sin(currentRad);
    
    // Cria caminho do arco de progresso
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return (
      <svg
        width={config.diameter}
        height={config.diameter}
        className="absolute inset-0"
      >
        {/* Fundo do track */}
        <circle
          cx={center}
          cy={center}
          r={trackRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className={`${colors.track} opacity-30`}
        />
        
        {/* Arco de progresso */}
        <path
          d={`
            M ${startX} ${startY}
            A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${currentX} ${currentY}
          `}
          fill="none"
          stroke="url(#gradient-progress)"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
        
        {/* Gradiente para o progresso */}
        <defs>
          <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" className={colors.progress.includes('gradient') ? 'text-pink-500' : colors.progress} />
            <stop offset="100%" stopColor="currentColor" className={colors.progress.includes('gradient') ? 'text-purple-500' : colors.progress} />
          </linearGradient>
        </defs>
        
        {/* Marcadores de BPM */}
        {[40, 80, 120, 160, 200, 240, 280].map((markBpm) => {
          if (markBpm < minBpm || markBpm > maxBpm) return null;
          
          const markerAngle = calculateBpmAngle(markBpm, minBpm, maxBpm);
          const markerRad = (markerAngle - 90) * Math.PI / 180;
          const markerLength = markBpm % 40 === 0 ? 12 : 6;
          const markerX1 = center + (trackRadius - markerLength) * Math.cos(markerRad);
          const markerY1 = center + (trackRadius - markerLength) * Math.sin(markerRad);
          const markerX2 = center + (trackRadius + 4) * Math.cos(markerRad);
          const markerY2 = center + (trackRadius + 4) * Math.sin(markerRad);
          
          return (
            <g key={`marker-${markBpm}`}>
              <line
                x1={markerX1}
                y1={markerY1}
                x2={markerX2}
                y2={markerY2}
                stroke="currentColor"
                strokeWidth={markBpm % 40 === 0 ? 2 : 1}
                className={colors.text}
                opacity={0.6}
              />
              
              {/* Labels para marcas principais */}
              {markBpm % 40 === 0 && (
                <text
                  x={center + (trackRadius + 20) * Math.cos(markerRad)}
                  y={center + (trackRadius + 20) * Math.sin(markerRad)}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className={`text-xs fill-current ${colors.text} opacity-80`}
                >
                  {markBpm}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Ponteiro */}
        <g transform={`rotate(${rotation} ${center} ${center})`}>
          {/* Base do ponteiro */}
          <circle
            cx={center}
            cy={center}
            r={config.strokeWidth}
            fill="currentColor"
            className={`${colors.pointer} ${animated ? 'animate-pulse-subtle' : ''}`}
          />
          
          {/* Haste do ponteiro */}
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - trackRadius + 10}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={colors.pointer}
          />
          
          {/* Cabeça do ponteiro */}
          <circle
            cx={center}
            cy={center - trackRadius + 10}
            r="6"
            fill="currentColor"
            className={colors.pointer}
          >
            {animated && (
              <animate
                attributeName="r"
                values="6;8;6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
        
        {/* Centro do dial */}
        <circle
          cx={center}
          cy={center}
          r={config.strokeWidth * 1.5}
          fill="currentColor"
          className={`${colors.bg} ${isDragging ? 'scale-110' : ''} transition-transform duration-200`}
        />
      </svg>
    );
  };
  
  // Renderiza menu de presets de BPM
  const renderPresetsMenu = () => {
    if (!showPresetsMenu) return null;
    
    return (
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50">
        <div className={`rounded-lg shadow-2xl p-3 min-w-[200px] ${colors.bg} border border-gray-800`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-300">BPMs Comuns</h3>
            <button
              onClick={() => setShowPresetsMenu(false)}
              className="text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {COMMON_BPMS.map((preset) => (
              <button
                key={preset.bpm}
                onClick={() => applyBpmPreset(preset.bpm)}
                className={`
                  text-left p-2 rounded transition-all duration-200
                  ${preset.bpm === bpm ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-gray-800 text-gray-300'}
                `}
              >
                <div className="font-semibold">{preset.label}</div>
                <div className="text-xs text-gray-400">{preset.description}</div>
              </button>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-2">Zona atual:</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{bpmZone.emoji}</span>
              <div>
                <div className="font-semibold text-gray-200">{bpmZone.label}</div>
                <div className="text-xs text-gray-400">{bpmZone.description}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seta */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    );
  };
  
  // Renderiza menu de seleção de passo
  const renderStepMenu = () => {
    if (!showStepMenu) return null;
    
    return (
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full z-50">
        <div className={`rounded-lg shadow-2xl p-3 min-w-[180px] ${colors.bg} border border-gray-800`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Incremento</h3>
            <button
              onClick={() => setShowStepMenu(false)}
              className="text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-1">
            {BPM_STEP_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => changeStep(option.value)}
                className={`
                  w-full flex items-center justify-between p-2 rounded transition-all duration-200
                  ${option.value === currentStep ? 'bg-blue-500/20 text-blue-300' : 'hover:bg-gray-800 text-gray-300'}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${option.bgColor}`} />
                  <span>{option.label}</span>
                </div>
                <span className="text-xs text-gray-400">{option.precision}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Seta */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
      </div>
    );
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} shadow-2xl`}>
        <div className="flex flex-col items-center">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between w-full mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Controle de BPM</h2>
              <p className="text-sm text-gray-400">Ajuste preciso do tempo</p>
            </div>
            
            {/* Zona de BPM atual */}
            <div className="text-right">
              <div className="text-xs text-gray-400">Zona</div>
              <div className={`font-semibold ${bpmZone.color}`}>
                {bpmZone.label} {bpmZone.emoji}
              </div>
            </div>
          </div>
          
          {/* Dial principal */}
          <div className="relative mb-8">
            <div
              ref={dialRef}
              className="relative cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              {renderDialCircle()}
              
              {/* Display central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`font-bold ${config.fontSize} ${colors.text} mb-1`}>
                  {formatBpm(bpm)}
                </div>
                <div className="text-xs text-gray-400">
                  {bpmZone.description}
                </div>
              </div>
            </div>
            
            {/* Overlay de dragging */}
            {isDragging && (
              <div className="absolute inset-0 rounded-full bg-black/20 pointer-events-none" />
            )}
          </div>
          
          {/* Controles de incremento/decremento */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={decrementBpm}
              className={`
                p-3 rounded-full transition-all duration-200
                ${colors.button} text-white
                hover:scale-110 active:scale-95
                ${isDragging ? 'opacity-50' : ''}
              `}
              disabled={isDragging}
              aria-label={`Diminuir ${currentStep} BPM`}
            >
              <Minus size={config.iconSize} />
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-400">Incremento</div>
              <button
                onClick={() => setShowStepMenu(!showStepMenu)}
                className={`
                  px-4 py-2 rounded-lg transition-all duration-200
                  ${colors.button} text-white font-semibold
                  hover:scale-105 active:scale-95
                `}
              >
                {currentStep} BPM
              </button>
            </div>
            
            <button
              onClick={incrementBpm}
              className={`
                p-3 rounded-full transition-all duration-200
                ${colors.button} text-white
                hover:scale-110 active:scale-95
                ${isDragging ? 'opacity-50' : ''}
              `}
              disabled={isDragging}
              aria-label={`Aumentar ${currentStep} BPM`}
            >
              <Plus size={config.iconSize} />
            </button>
          </div>
          
          {/* Controles adicionais */}
          <div className="flex items-center justify-center gap-4">
            {showPresets && (
              <button
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${colors.button} text-white
                  hover:scale-105 active:scale-95
                `}
              >
                <Music size={16} />
                <span>Presets</span>
              </button>
            )}
            
            <button
              onClick={() => applyBpmPreset(120)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                transition-all duration-200
                ${colors.button} text-white
                hover:scale-105 active:scale-95
              `}
            >
              <Zap size={16} />
              <span>Padrão (120)</span>
            </button>
          </div>
          
          {/* Indicador visual de velocidade */}
          <div className="mt-6 w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Lento</span>
              <span>Moderado</span>
              <span>Rápido</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 transition-all duration-500"
                style={{
                  width: `${((bpm - minBpm) / (maxBpm - minBpm)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{minBpm} BPM</span>
              <span>{(minBpm + maxBpm) / 2} BPM</span>
              <span>{maxBpm} BPM</span>
            </div>
          </div>
        </div>
        
        {/* Efeitos de fundo */}
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl blur-xl -z-10" />
      </div>
      
      {/* Menus dropdown */}
      {renderPresetsMenu()}
      {renderStepMenu()}
      
      {/* Overlay para fechar menus */}
      {(showPresetsMenu || showStepMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowPresetsMenu(false);
            setShowStepMenu(false);
          }}
        />
      )}
      
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
BpmDial.defaultProps = {
  bpm: 120,
  minBpm: 40,
  maxBpm: 300,
  step: 5,
  theme: 'default',
  showPresets: true,
  showStepSelector: true,
  animated: true,
  size: 'lg',
  className: '',
};

export default React.memo(BpmDial);

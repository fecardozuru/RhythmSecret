// /src/components/ui/BpmDial.jsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Minus, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  Zap,
  Turtle,
  Rabbit,
  Gauge,
  Target,
  Clock,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Music
} from 'lucide-react';

/**
 * BpmDial - Controle avançado de BPM com visualização circular e controles precisos
 * Suporta ajuste fino, marcadores de andamento e modos de velocidade
 */

// Marcadores de andamento musical
const TEMPO_MARKINGS = [
  { min: 20, max: 40, label: 'Larghissimo', description: 'Extremamente lento', color: 'text-blue-300', icon: Turtle },
  { min: 41, max: 60, label: 'Largo', description: 'Muito lento, largo', color: 'text-blue-400', icon: Turtle },
  { min: 61, max: 66, label: 'Larghetto', description: 'Um pouco menos lento', color: 'text-blue-500', icon: Clock },
  { min: 67, max: 76, label: 'Adagio', description: 'Lento e gracioso', color: 'text-indigo-400', icon: Clock },
  { min: 77, max: 108, label: 'Andante', description: 'Passo de caminhada', color: 'text-green-400', icon: Music },
  { min: 109, max: 120, label: 'Moderato', description: 'Moderado', color: 'text-yellow-400', icon: Music },
  { min: 121, max: 168, label: 'Allegro', description: 'Rápido, alegre', color: 'text-orange-400', icon: Rabbit },
  { min: 169, max: 200, label: 'Vivace', description: 'Vivo e rápido', color: 'text-red-400', icon: Rabbit },
  { min: 201, max: 240, label: 'Presto', description: 'Muito rápido', color: 'text-red-500', icon: Zap },
  { min: 241, max: 300, label: 'Prestissimo', description: 'O mais rápido possível', color: 'text-purple-400', icon: Zap }
];

// Passos de ajuste de BPM
const BPM_STEPS = [
  { value: 1, label: 'Fino', description: 'Ajuste de 1 BPM' },
  { value: 5, label: 'Padrão', description: 'Ajuste de 5 BPM' },
  { value: 10, label: 'Rápido', description: 'Ajuste de 10 BPM' },
  { value: 15, label: 'Ágil', description: 'Ajuste de 15 BPM' },
  { value: 20, label: 'Largo', description: 'Ajuste de 20 BPM' },
  { value: 25, label: 'Grande', description: 'Ajuste de 25 BPM' },
  { value: 30, label: 'Salto', description: 'Ajuste de 30 BPM' }
];

// Presets de BPM comuns
const BPM_PRESETS = [
  { value: 40, label: 'Ext. Lento', category: 'Lento' },
  { value: 60, label: 'Lento', category: 'Lento' },
  { value: 80, label: 'Calmo', category: 'Moderado' },
  { value: 100, label: 'Andante', category: 'Moderado' },
  { value: 120, label: 'Marcha', category: 'Moderado' },
  { value: 140, label: 'Pop', category: 'Rápido' },
  { value: 160, label: 'Rock', category: 'Rápido' },
  { value: 180, label: 'Dance', category: 'Rápido' },
  { value: 200, label: 'Hardcore', category: 'Ext. Rápido' },
  { value: 240, label: 'Speed', category: 'Ext. Rápido' }
];

const BpmDial = ({
  bpm = 120,
  onChange,
  minBpm = 20,
  maxBpm = 300,
  step = 5,
  theme = 'default',
  showTempoMarkings = true,
  showPresets = true,
  showStepSelector = true,
  compact = false,
  disabled = false,
  isPlaying = false,
  className = ''
}) => {
  const [localBpm, setLocalBpm] = useState(bpm);
  const [currentStep, setCurrentStep] = useState(step);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showStepMenu, setShowStepMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const dialRef = useRef(null);
  const containerRef = useRef(null);
  
  // Sincroniza com prop bpm
  useEffect(() => {
    setLocalBpm(bpm);
    // Calcula rotação baseada no BPM (0° a 270°)
    const percentage = (bpm - minBpm) / (maxBpm - minBpm);
    setRotation(percentage * 270);
  }, [bpm, minBpm, maxBpm]);
  
  // Encontra o marcador de andamento atual
  const getCurrentTempoMarking = useCallback(() => {
    return TEMPO_MARKINGS.find(marking => 
      localBpm >= marking.min && localBpm <= marking.max
    ) || TEMPO_MARKINGS[TEMPO_MARKINGS.length - 1];
  }, [localBpm]);
  
  // Ajusta BPM com limites
  const adjustBpm = useCallback((delta) => {
    if (disabled) return;
    
    const newBpm = Math.max(minBpm, Math.min(maxBpm, localBpm + delta));
    
    setLocalBpm(newBpm);
    
    if (onChange) {
      onChange(newBpm);
    }
  }, [localBpm, minBpm, maxBpm, onChange, disabled]);
  
  // Define BPM específico
  const setBpm = useCallback((value) => {
    if (disabled) return;
    
    const newBpm = Math.max(minBpm, Math.min(maxBpm, value));
    
    setLocalBpm(newBpm);
    setInputMode(false);
    
    if (onChange) {
      onChange(newBpm);
    }
  }, [minBpm, maxBpm, onChange, disabled]);
  
  // Manipulador de clique no dial
  const handleDialClick = useCallback((e) => {
    if (disabled || inputMode) return;
    
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    // Converte ângulo para 0-270 graus
    let normalizedAngle = angle + 90;
    if (normalizedAngle < 0) normalizedAngle += 360;
    normalizedAngle = Math.max(0, Math.min(270, normalizedAngle));
    
    // Converte para BPM
    const percentage = normalizedAngle / 270;
    const newBpm = minBpm + percentage * (maxBpm - minBpm);
    const roundedBpm = Math.round(newBpm / currentStep) * currentStep;
    
    setBpm(roundedBpm);
  }, [minBpm, maxBpm, currentStep, setBpm, disabled, inputMode]);
  
  // Manipulador de arrastar no dial
  const handleDialDrag = useCallback((e) => {
    if (disabled || inputMode) return;
    
    setIsDragging(true);
    
    const handleMouseMove = (moveEvent) => {
      const rect = dialRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
      
      // Converte ângulo para 0-270 graus
      let normalizedAngle = angle + 90;
      if (normalizedAngle < 0) normalizedAngle += 360;
      normalizedAngle = Math.max(0, Math.min(270, normalizedAngle));
      
      // Converte para BPM
      const percentage = normalizedAngle / 270;
      const newBpm = minBpm + percentage * (maxBpm - minBpm);
      const roundedBpm = Math.round(newBpm / currentStep) * currentStep;
      
      setLocalBpm(roundedBpm);
      setRotation(normalizedAngle);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onChange) {
        onChange(localBpm);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [minBpm, maxBpm, currentStep, onChange, localBpm, disabled, inputMode]);
  
  // Manipulador de entrada manual
  const handleInputSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setInputMode(false);
      return;
    }
    
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      setBpm(value);
    }
    
    setInputValue('');
    setInputMode(false);
  }, [inputValue, setBpm]);
  
  // Calcula cor baseada no BPM
  const getBpmColor = useCallback(() => {
    const percentage = (localBpm - minBpm) / (maxBpm - minBpm);
    
    if (percentage < 0.3) {
      return theme === 'pro-gold' 
        ? 'from-blue-400 to-cyan-400' 
        : 'from-blue-500 to-cyan-500';
    } else if (percentage < 0.6) {
      return theme === 'pro-gold'
        ? 'from-green-400 to-emerald-400'
        : 'from-green-500 to-emerald-500';
    } else if (percentage < 0.8) {
      return theme === 'pro-gold'
        ? 'from-amber-400 to-yellow-400'
        : 'from-orange-500 to-yellow-500';
    } else {
      return theme === 'pro-gold'
        ? 'from-red-400 to-pink-400'
        : 'from-red-500 to-pink-500';
    }
  }, [localBpm, minBpm, maxBpm, theme]);
  
  // Renderiza o dial circular
  const renderDial = () => {
    const tempoMarking = getCurrentTempoMarking();
    const TempoIcon = tempoMarking.icon;
    const bpmColor = getBpmColor();
    
    return (
      <div className="relative" ref={containerRef}>
        {/* Anel externo com gradiente */}
        <div className={`
          absolute inset-0 rounded-full border-4
          ${theme === 'pro-gold' 
            ? 'border-gray-800/50' 
            : 'border-gray-900/50'
          }
        `} />
        
        {/* Track do dial */}
        <svg 
          className="absolute inset-0 w-full h-full rotate-[-135deg]"
          viewBox="0 0 100 100"
        >
          {/* Track de fundo */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-gray-800/30"
          />
          
          {/* Track ativa */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="url(#bpm-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="283"
            strokeDashoffset={283 - (rotation / 270 * 283)}
            style={{ transition: isDragging ? 'none' : 'stroke-dashoffset 0.2s ease-out' }}
          />
          
          {/* Gradiente */}
          <defs>
            <linearGradient id="bpm-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`${bpmColor.split(' ')[0]}`} />
              <stop offset="100%" className={`${bpmColor.split(' ')[1]}`} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Marcadores no dial */}
        <div className="absolute inset-0">
          {[...Array(9)].map((_, i) => {
            const angle = (i * 30) - 135; // -135° a 135°
            const rad = angle * (Math.PI / 180);
            const x = 50 + 40 * Math.cos(rad);
            const y = 50 + 40 * Math.sin(rad);
            const value = Math.round(minBpm + (i / 8) * (maxBpm - minBpm));
            
            return (
              <div
                key={`marker-${i}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className={`
                  w-2 h-2 rounded-full
                  ${value <= localBpm 
                    ? (theme === 'pro-gold' ? 'bg-amber-400' : 'bg-blue-500')
                    : 'bg-gray-700'
                  }
                `} />
              </div>
            );
          })}
        </div>
        
        {/* Ponteiro do dial */}
        <div
          className={`
            absolute top-1/2 left-1/2 w-1 h-12 origin-bottom
            ${isDragging ? 'scale-110' : ''}
            transition-transform duration-150
          `}
          style={{
            transform: `
              translate(-50%, -100%) 
              rotate(${rotation}deg)
            `,
          }}
        >
          <div className={`
            absolute inset-0 rounded-full
            ${theme === 'pro-gold'
              ? 'bg-gradient-to-t from-amber-400 to-yellow-400'
              : 'bg-gradient-to-t from-blue-500 to-cyan-500'
            }
            shadow-lg
          `} />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-lg" />
        </div>
        
        {/* Área clicável do dial */}
        <div
          ref={dialRef}
          className={`
            absolute inset-8 rounded-full cursor-pointer
            ${disabled ? 'cursor-not-allowed' : ''}
            ${isDragging ? 'scale-105' : ''}
            transition-transform duration-200
          `}
          onClick={handleDialClick}
          onMouseDown={handleDialDrag}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDialDrag(e.touches[0]);
          }}
        />
        
        {/* Display central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {inputMode ? (
            <form onSubmit={handleInputSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                className={`
                  w-24 bg-transparent border-none text-3xl font-black text-center
                  outline-none focus:outline-none
                  ${theme === 'pro-gold' ? 'text-amber-300' : 'text-white'}
                `}
                autoFocus
                maxLength={3}
                placeholder={localBpm.toString()}
              />
              <div className="text-xs text-gray-400 mt-1">
                Pressione Enter para confirmar
              </div>
            </form>
          ) : (
            <>
              <div 
                className={`
                  text-5xl font-black tabular-nums leading-none mb-1
                  ${disabled ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}
                  ${theme === 'pro-gold' ? 'text-amber-300' : 'text-white'}
                  transition-opacity duration-200
                `}
                onClick={() => !disabled && setInputMode(true)}
              >
                {Math.round(localBpm)}
              </div>
              <div className="text-xs text-gray-400 mb-1">BPM</div>
              
              {/* Andamento atual */}
              {showTempoMarkings && (
                <div className="flex items-center gap-2 mt-2">
                  <TempoIcon size={14} className={tempoMarking.color} />
                  <div className={`text-sm font-medium ${tempoMarking.color}`}>
                    {tempoMarking.label}
                  </div>
                </div>
              )}
              
              {/* Descrição do andamento */}
              {showTempoMarkings && !compact && (
                <div className="text-xs text-gray-400 mt-1 max-w-[120px] text-center">
                  {tempoMarking.description}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Indicador de reprodução */}
        {isPlaying && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center
              ${theme === 'pro-gold' 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              }
              shadow-lg animate-pulse
            `}>
              <Music size={12} />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza controles de ajuste fino
  const renderFineControls = () => {
    if (compact) return null;
    
    return (
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Botão de decremento grande */}
        <button
          onClick={() => adjustBpm(-currentStep)}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
              : 'hover:scale-110 active:scale-95 hover:bg-gray-800'
            }
            ${theme === 'pro-gold' 
              ? 'border border-amber-700/30' 
              : 'border border-gray-700'
            }
          `}
          aria-label={`Diminuir ${currentStep} BPM`}
        >
          <Minus size={24} className={disabled ? 'text-gray-500' : 'text-white'} />
        </button>
        
        {/* Display do passo atual */}
        <div className="relative">
          <button
            onClick={() => !disabled && setShowStepMenu(!showStepMenu)}
            disabled={disabled}
            className={`
              px-3 py-1.5 rounded-lg flex items-center gap-2
              transition-colors duration-200
              ${disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
                : 'hover:bg-gray-800'
              }
              ${theme === 'pro-gold' 
                ? 'border border-amber-700/30' 
                : 'border border-gray-700'
              }
            `}
            aria-label="Alterar passo de ajuste"
          >
            <span className="text-sm font-medium text-gray-300">Passo:</span>
            <span className="font-bold text-white">{currentStep}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          
          {/* Menu de seleção de passo */}
          {showStepMenu && !disabled && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10">
              <div className="p-2">
                <div className="text-xs text-gray-400 mb-2 px-2">Tamanho do passo</div>
                {BPM_STEPS.map(stepOption => (
                  <button
                    key={stepOption.value}
                    onClick={() => {
                      setCurrentStep(stepOption.value);
                      setShowStepMenu(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded-md mb-1 last:mb-0
                      transition-colors duration-150
                      ${currentStep === stepOption.value 
                        ? `${theme === 'pro-gold' ? 'bg-amber-900/30 text-amber-300' : 'bg-gray-800 text-white'}` 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stepOption.label}</span>
                      <span className="text-sm opacity-70">{stepOption.value} BPM</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {stepOption.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Botão de incremento grande */}
        <button
          onClick={() => adjustBpm(currentStep)}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
              : 'hover:scale-110 active:scale-95 hover:bg-gray-800'
            }
            ${theme === 'pro-gold' 
              ? 'border border-amber-700/30' 
              : 'border border-gray-700'
            }
          `}
          aria-label={`Aumentar ${currentStep} BPM`}
        >
          <Plus size={24} className={disabled ? 'text-gray-500' : 'text-white'} />
        </button>
      </div>
    );
  };
  
  // Renderiza presets de BPM
  const renderPresets = () => {
    if (!showPresets || compact) return null;
    
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-300">Presets de Velocidade</div>
          <button
            onClick={() => !disabled && setShowPresetsMenu(!showPresetsMenu)}
            disabled={disabled}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {showPresetsMenu ? 'Ocultar' : 'Mostrar todos'}
          </button>
        </div>
        
        {/* Grid de presets principais */}
        <div className="grid grid-cols-5 gap-2">
          {BPM_PRESETS.slice(0, 5).map(preset => (
            <button
              key={preset.value}
              onClick={() => setBpm(preset.value)}
              disabled={disabled}
              className={`
                py-2 rounded-lg text-xs font-medium
                transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                ${localBpm === preset.value
                  ? `${theme === 'pro-gold' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }`
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }
              `}
              aria-label={`Definir BPM para ${preset.label} (${preset.value})`}
            >
              {preset.value}
            </button>
          ))}
        </div>
        
        {/* Presets expandidos */}
        {showPresetsMenu && !disabled && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {['Lento', 'Moderado', 'Rápido', 'Ext. Rápido'].map(category => (
                <div key={category} className="text-xs text-gray-400">
                  {category}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {BPM_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setBpm(preset.value);
                    setShowPresetsMenu(false);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-md
                    transition-colors duration-150
                    ${localBpm === preset.value
                      ? `${theme === 'pro-gold' 
                          ? 'bg-amber-900/30 text-amber-300' 
                          : 'bg-gray-800 text-white'
                        }`
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-xs text-gray-500">{preset.category}</div>
                  </div>
                  <div className={`text-lg font-bold ${localBpm === preset.value ? 'text-current' : 'text-gray-600'}`}>
                    {preset.value}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza controles compactos
  const renderCompactControls = () => {
    if (!compact) return null;
    
    return (
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          onClick={() => adjustBpm(-currentStep)}
          disabled={disabled}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
              : 'hover:scale-110 active:scale-95 hover:bg-gray-800'
            }
            ${theme === 'pro-gold' 
              ? 'border border-amber-700/30' 
              : 'border border-gray-700'
            }
          `}
          aria-label={`Diminuir ${currentStep} BPM`}
        >
          <Minus size={16} className={disabled ? 'text-gray-500' : 'text-white'} />
        </button>
        
        <button
          onClick={() => !disabled && setShowStepMenu(!showStepMenu)}
          disabled={disabled}
          className={`
            px-2 py-1 rounded text-xs font-medium
            transition-colors duration-200
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
              : 'hover:bg-gray-800'
            }
            ${theme === 'pro-gold' 
              ? 'border border-amber-700/30' 
              : 'border border-gray-700'
            }
          `}
        >
          {currentStep} BPM
        </button>
        
        <button
          onClick={() => adjustBpm(currentStep)}
          disabled={disabled}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-200
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-gray-800/30' 
              : 'hover:scale-110 active:scale-95 hover:bg-gray-800'
            }
            ${theme === 'pro-gold' 
              ? 'border border-amber-700/30' 
              : 'border border-gray-700'
            }
          `}
          aria-label={`Aumentar ${currentStep} BPM`}
        >
          <Plus size={16} className={disabled ? 'text-gray-500' : 'text-white'} />
        </button>
      </div>
    );
  };
  
  // Renderiza informações de velocidade
  const renderSpeedInfo = () => {
    if (compact) return null;
    
    const percentage = (localBpm - minBpm) / (maxBpm - minBpm);
    const msPerBeat = 60000 / localBpm;
    const msPerMeasure = msPerBeat * 4; // Assumindo 4/4
    
    return (
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-gray-900/30">
          <div className="text-xs text-gray-400 mb-1">Velocidade</div>
          <div className="text-lg font-bold text-white">
            {percentage < 0.3 ? '🐌 Lenta' : 
             percentage < 0.6 ? '🚶 Moderada' : 
             percentage < 0.8 ? '🏃 Rápida' : 
             '⚡ Extrema'}
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-gray-900/30">
          <div className="text-xs text-gray-400 mb-1">Tempo/Batida</div>
          <div className="text-lg font-bold text-white">
            {msPerBeat.toFixed(0)}ms
          </div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-gray-900/30">
          <div className="text-xs text-gray-400 mb-1">Compasso (4/4)</div>
          <div className="text-lg font-bold text-white">
            {msPerMeasure.toFixed(0)}ms
          </div>
        </div>
      </div>
    );
  };
  
  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowStepMenu(false);
        setShowPresetsMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className={`relative ${className}`}>
      <div className={`
        rounded-2xl p-4
        ${theme === 'pro-gold' 
          ? 'bg-gradient-to-br from-gray-900/80 to-gray-950/60 border border-amber-700/20' 
          : 'bg-gray-900/50 border border-gray-800'
        }
      `}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Gauge size={18} className={theme === 'pro-gold' ? 'text-amber-400' : 'text-blue-400'} />
              <h3 className="font-bold text-white">Controle de BPM</h3>
            </div>
            <div className="text-xs text-gray-400">
              Ajuste preciso do andamento
            </div>
          </div>
          
          {/* Botão de reset */}
          <button
            onClick={() => setBpm(120)}
            disabled={disabled}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-110 active:scale-95 hover:bg-gray-800'
              }
            `}
            aria-label="Resetar para 120 BPM"
          >
            <RotateCcw size={16} className={disabled ? 'text-gray-500' : 'text-gray-400'} />
          </button>
        </div>
        
        {/* Dial principal */}
        <div className="relative aspect-square max-w-md mx-auto">
          {renderDial()}
        </div>
        
        {/* Controles de ajuste */}
        {renderFineControls()}
        {renderCompactControls()}
        
        {/* Presets de BPM */}
        {renderPresets()}
        
        {/* Informações de velocidade */}
        {renderSpeedInfo()}
        
        {/* Indicador de arrastando */}
        {isDragging && (
          <div className="absolute inset-0 bg-black/10 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="px-4 py-2 bg-black/70 rounded-lg backdrop-blur-sm">
              <div className="text-white text-sm font-medium">
                Arrastando: {Math.round(localBpm)} BPM
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay para menus */}
      {(showStepMenu || showPresetsMenu) && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStepMenu(false);
            setShowPresetsMenu(false);
          }}
        />
      )}
    </div>
  );
};

// Helper para obter informações de tempo
export const getTempoInfo = (bpm) => {
  const marking = TEMPO_MARKINGS.find(m => bpm >= m.min && bpm <= m.max) || 
                  TEMPO_MARKINGS[TEMPO_MARKINGS.length - 1];
  
  const msPerBeat = 60000 / bpm;
  const beatsPerSecond = bpm / 60;
  
  return {
    marking,
    msPerBeat,
    beatsPerSecond,
    humanReadable: `${bpm} BPM (${marking.label})`,
    isExtreme: bpm < 50 || bpm > 200,
    category: bpm < 80 ? 'slow' : bpm < 140 ? 'medium' : 'fast'
  };
};

// Helper para ajuste relativo
export const adjustBpmRelative = (currentBpm, percentage, min = 20, max = 300) => {
  const delta = (max - min) * (percentage / 100);
  const newBpm = currentBpm + delta;
  return Math.max(min, Math.min(max, newBpm));
};

// Helper para snap para valores comuns
export const snapToCommonBpm = (bpm, tolerance = 5) => {
  const commonBpms = BPM_PRESETS.map(p => p.value);
  const exactMatch = commonBpms.find(cb => Math.abs(cb - bpm) < tolerance);
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Snap para múltiplos de 5
  return Math.round(bpm / 5) * 5;
};

export default React.memo(BpmDial);

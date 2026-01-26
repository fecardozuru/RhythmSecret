// /src/components/ui/ModeSelector.jsx

import React, { useState, useCallback } from 'react';
import { 
  User, 
  Users, 
  Crown, 
  ChevronDown, 
  Check, 
  Zap, 
  Lock, 
  Unlock,
  Sparkles,
  Target
} from 'lucide-react';
import { formatAppMode } from '../../utils/formatters';
import { useMenuManagement } from '../../hooks/useMenuManagement';

/**
 * ModeSelector - Seletor de modo de aplicativo (Iniciante/Avançado/PRO)
 * Botão dropdown com descrições e bloqueio de features
 */
const ModeSelector = ({
  currentMode = 'beginner',
  onChange,
  theme = 'default',
  showLockedFeatures = true,
  compact = false,
  className = '',
}) => {
  const [localMode, setLocalMode] = useState(currentMode);
  
  // Usa hook de gerenciamento de menu
  const { 
    isOpen, 
    toggleMenu, 
    closeMenu, 
    menuRef, 
    triggerRef, 
    zIndex 
  } = useMenuManagement('mode-selector', {
    closeOnClickOutside: true,
    closeOnEsc: true,
    autoZIndex: true,
  });
  
  // Opções de modo disponíveis
  const modeOptions = [
    {
      id: 'beginner',
      label: 'Iniciante',
      icon: User,
      description: 'Modo simplificado para aprendizado',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      features: [
        { label: 'Subdivisões básicas (1-4)', enabled: true },
        { label: 'Controle manual', enabled: true },
        { label: 'Perfis de volume pré-definidos', enabled: true },
        { label: 'Permutação automática', enabled: false },
        { label: 'Ghost notes', enabled: false },
        { label: 'Grooves avançados', enabled: false },
      ],
      unlocked: true,
    },
    {
      id: 'advanced',
      label: 'Avançado',
      icon: Users,
      description: 'Recursos avançados para prática',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      features: [
        { label: 'Subdivisões estendidas (1-9)', enabled: true },
        { label: 'Controle automático ↑↓', enabled: true },
        { label: 'Ajuste fino de volumes', enabled: true },
        { label: 'Permutação básica', enabled: true },
        { label: 'Ghost notes limitadas', enabled: true },
        { label: 'Grooves simples', enabled: true },
      ],
      unlocked: true,
    },
    {
      id: 'pro',
      label: 'PRO',
      icon: Crown,
      description: 'Recursos profissionais completos',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      features: [
        { label: 'Permutação completa (1-9 × 1-9)', enabled: true },
        { label: 'Auto-loop inteligente', enabled: true },
        { label: 'Ghost notes avançadas', enabled: true },
        { label: 'Gap entre ciclos', enabled: true },
        { label: 'Grooves complexos', enabled: true },
        { label: 'Presets ilimitados', enabled: true },
      ],
      unlocked: true, // Em produção, isso poderia ser baseado em assinatura
    },
  ];
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      hover: 'hover:bg-gray-800',
      text: 'text-white',
      border: 'border-gray-700',
    },
    instagram: {
      bg: 'bg-gradient-to-r from-pink-900/30 to-purple-900/30',
      hover: 'hover:from-pink-800/40 hover:to-purple-800/40',
      text: 'text-white',
      border: 'border-pink-500/30',
    },
    tiktok: {
      bg: 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30',
      hover: 'hover:from-cyan-800/40 hover:to-blue-800/40',
      text: 'text-white',
      border: 'border-cyan-500/30',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20',
      hover: 'hover:from-amber-800/30 hover:to-yellow-800/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Obtém o modo atual
  const currentModeInfo = modeOptions.find(mode => mode.id === localMode) || modeOptions[0];
  const CurrentIcon = currentModeInfo.icon;
  
  // Manipulador de mudança de modo
  const handleModeChange = useCallback((newMode) => {
    const mode = modeOptions.find(m => m.id === newMode);
    
    if (!mode || !mode.unlocked) {
      // Em produção, aqui mostraria um modal de upgrade
      console.log(`Modo ${mode?.label} bloqueado - requer upgrade`);
      return;
    }
    
    setLocalMode(newMode);
    
    if (onChange) {
      onChange(newMode);
    }
    
    closeMenu();
  }, [modeOptions, onChange, closeMenu]);
  
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
            ${colors.bg} ${colors.hover} ${colors.border} border
            ${colors.text} shadow-lg
            hover:shadow-xl active:scale-95
            ${isOpen ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
          `}
          aria-label={`Modo atual: ${currentModeInfo.label}. Clique para alterar.`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <CurrentIcon size={20} className={currentModeInfo.color} />
          <ChevronDown 
            size={16} 
            className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
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
        aria-label={`Modo atual: ${currentModeInfo.label}. Clique para alterar.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={`p-2 rounded-lg ${currentModeInfo.bgColor}`}>
          <CurrentIcon size={20} className={currentModeInfo.color} />
        </div>
        
        <div className="text-left">
          <div className="font-semibold">{currentModeInfo.label}</div>
          <div className="text-xs text-gray-400">{currentModeInfo.description}</div>
        </div>
        
        <ChevronDown 
          size={16} 
          className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    );
  };
  
  // Renderiza o dropdown de modos
  const renderDropdown = () => {
    if (!isOpen) return null;
    
    return (
      <div
        ref={menuRef}
        className={`
          absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl
          overflow-hidden z-50
          animate-in fade-in slide-in-from-top-2 duration-200
        `}
        style={{ zIndex }}
      >
        <div className={`${colors.bg} border ${colors.border} overflow-hidden`}>
          {/* Cabeçalho do dropdown */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-lg text-white">Selecionar Modo</h3>
            <p className="text-sm text-gray-400 mt-1">
              Escolha o nível de complexidade do treinador
            </p>
          </div>
          
          {/* Lista de modos */}
          <div className="p-2 max-h-96 overflow-y-auto">
            {modeOptions.map((mode) => {
              const ModeIcon = mode.icon;
              const isCurrent = mode.id === localMode;
              const isLocked = !mode.unlocked;
              
              return (
                <div
                  key={mode.id}
                  onClick={() => !isLocked && handleModeChange(mode.id)}
                  className={`
                    relative p-3 rounded-lg mb-2 cursor-pointer
                    transition-all duration-200
                    ${isCurrent ? mode.bgColor : 'hover:bg-gray-800/50'}
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                    ${isCurrent ? 'ring-1 ' + mode.borderColor : ''}
                  `}
                  aria-label={`${mode.label}${isLocked ? ' (bloqueado)' : ''}`}
                  aria-disabled={isLocked}
                  role="option"
                  aria-selected={isCurrent}
                >
                  {/* Indicador de modo atual */}
                  {isCurrent && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                      <div className={`w-1 h-6 rounded-full ${mode.color}`} />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${mode.bgColor}`}>
                        <ModeIcon size={18} className={mode.color} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{mode.label}</span>
                          {isLocked && <Lock size={12} className="text-gray-500" />}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
                      </div>
                    </div>
                    
                    {/* Checkbox ou ícone de bloqueado */}
                    <div>
                      {isLocked ? (
                        <Lock size={16} className="text-gray-500" />
                      ) : isCurrent ? (
                        <Check size={16} className={mode.color} />
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Lista de features */}
                  {showLockedFeatures && (
                    <div className="mt-3 pl-11">
                      <div className="text-xs text-gray-500 mb-1">Recursos:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {mode.features.slice(0, 4).map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-xs"
                          >
                            {feature.enabled ? (
                              <Check size={10} className="text-green-500" />
                            ) : (
                              <div className="w-2 h-0.5 bg-gray-700" />
                            )}
                            <span className={feature.enabled ? 'text-gray-300' : 'text-gray-600'}>
                              {feature.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Badge de modo atual */}
                  {isCurrent && (
                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded text-xs font-semibold ${mode.bgColor} ${mode.color}`}>
                      Atual
                    </div>
                  )}
                  
                  {/* Overlay de bloqueado */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center">
                      <div className="text-center p-2">
                        <Lock size={20} className="text-gray-500 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">Upgrade necessário</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Rodapé com informações adicionais */}
          <div className="p-3 border-t border-gray-800 bg-gray-900/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Sparkles size={12} />
                <span>Recursos desbloqueados progressivamente</span>
              </div>
              <Target size={12} />
            </div>
          </div>
        </div>
        
        {/* Seta do dropdown */}
        <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
      </div>
    );
  };
  
  // Renderiza informações detalhadas do modo atual (apenas para compact=false)
  const renderModeDetails = () => {
    if (compact) return null;
    
    return (
      <div className={`mt-3 p-4 rounded-xl ${currentModeInfo.bgColor} ${currentModeInfo.borderColor} border`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${currentModeInfo.bgColor} bg-opacity-50`}>
            <CurrentIcon size={20} className={currentModeInfo.color} />
          </div>
          <div>
            <h4 className="font-semibold text-white">Modo {currentModeInfo.label}</h4>
            <p className="text-sm text-gray-300">{currentModeInfo.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {currentModeInfo.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`p-1 rounded ${feature.enabled ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                {feature.enabled ? (
                  <Check size={12} className="text-green-400" />
                ) : (
                  <Lock size={12} className="text-gray-500" />
                )}
              </div>
              <span className={feature.enabled ? 'text-gray-300' : 'text-gray-600'}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Dica baseada no modo */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Zap size={12} />
            {localMode === 'beginner' && (
              <span>Foque em dominar subdivisões básicas antes de avançar</span>
            )}
            {localMode === 'advanced' && (
              <span>Experimente diferentes grooves para desenvolver seu timing</span>
            )}
            {localMode === 'pro' && (
              <span>Use permutação completa para desafios rítmicos avançados</span>
            )}
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
      
      {!compact && renderModeDetails()}
      
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
      `}</style>
    </div>
  );
};

// Propriedades padrão
ModeSelector.defaultProps = {
  currentMode: 'beginner',
  theme: 'default',
  showLockedFeatures: true,
  compact: false,
  className: '',
};

export default React.memo(ModeSelector);

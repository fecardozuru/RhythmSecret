// /src/components/ui/ModeSelector.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  GraduationCap, 
  Zap, 
  Crown, 
  Settings,
  ChevronDown,
  Lock,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Target,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';

/**
 * ModeSelector - Seletor avançado de modos de aplicação
 * Gerencia modos Iniciante, Intermediário e PRO com transições suaves
 */

// Definição completa dos modos disponíveis
const APP_MODES = {
  BEGINNER: {
    id: 'BEGINNER',
    label: 'Iniciante',
    description: 'Interface simplificada, foco no básico',
    icon: GraduationCap,
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    glowColor: 'from-blue-500/20 to-blue-600/10',
    features: [
      'Interface simplificada',
      'Subdivisões básicas (1, 2, 4)',
      'Modo manual apenas',
      'Padrões rítmicos simples',
      'Feedback visual básico',
      'Sem features avançadas'
    ],
    restrictions: [
      'Apenas compassos 4/4 e 3/4',
      'Sem permutações',
      'Sem modo fantasma',
      'Sem gaps',
      'Sem auto-loop',
      'Volume fixo'
    ],
    maxBpm: 180,
    minBpm: 40,
    allowedSubdivisions: [1, 2, 4],
    allowedTimeSignatures: ['4/4', '3/4'],
    difficulty: 1,
    requiresUnlock: false,
    unlockMessage: null
  },
  INTERMEDIATE: {
    id: 'INTERMEDIATE',
    label: 'Intermediário',
    description: 'Mais controle, recursos avançados básicos',
    icon: Zap,
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    glowColor: 'from-purple-500/20 to-purple-600/15',
    features: [
      'Controles avançados',
      'Todas subdivisões (1-9)',
      'Modos manual e automático',
      'Padrões complexos',
      'Feedback visual avançado',
      'Groove básico'
    ],
    restrictions: [
      'Sem permutações PRO',
      'Ghost mode limitado',
      'Gap cycles básicos',
      'Auto-loop simples',
      'Volume limitado'
    ],
    maxBpm: 240,
    minBpm: 30,
    allowedSubdivisions: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    allowedTimeSignatures: ['4/4', '3/4', '2/4', '6/8', '2/2'],
    difficulty: 2,
    requiresUnlock: false,
    unlockMessage: null
  },
  PRO: {
    id: 'PRO',
    label: 'PRO Maestro',
    description: 'Controle total, todos os recursos desbloqueados',
    icon: Crown,
    color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/50',
    glowColor: 'from-amber-500/30 to-yellow-500/20',
    features: [
      'Controle total avançado',
      'Todas subdivisões + tercinas',
      'Todos os modos de reprodução',
      'Permutações complexas',
      'Ghost mode completo',
      'Groove avançado',
      'Gap cycles inteligentes',
      'Auto-loop adaptativo',
      'Mixagem profissional',
      'Exportação de presets'
    ],
    restrictions: [],
    maxBpm: 300,
    minBpm: 20,
    allowedSubdivisions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16],
    allowedTimeSignatures: ['4/4', '3/4', '2/4', '6/8', '2/2', '5/4', '7/8', '9/8', '12/8', '3/8'],
    difficulty: 3,
    requiresUnlock: false,
    unlockMessage: 'Desbloqueie todos os recursos avançados'
  },
  CUSTOM: {
    id: 'CUSTOM',
    label: 'Personalizado',
    description: 'Configure seu próprio modo',
    icon: Settings,
    color: 'bg-gradient-to-r from-gray-600 to-gray-700',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-600/40',
    glowColor: 'from-gray-600/20 to-gray-700/15',
    features: [
      'Mix de features',
      'Controle granular',
      'Configurações personalizadas',
      'Salvar perfis',
      'Exportar configurações'
    ],
    restrictions: [
      'Requer configuração manual'
    ],
    maxBpm: 300,
    minBpm: 20,
    allowedSubdivisions: 'Todas',
    allowedTimeSignatures: 'Todas',
    difficulty: 4,
    requiresUnlock: true,
    unlockMessage: 'Configure manualmente'
  }
};

// Níveis de dificuldade para transição
const DIFFICULTY_LEVELS = [
  { level: 1, label: 'Iniciante', icon: GraduationCap },
  { level: 2, label: 'Intermediário', icon: Zap },
  { level: 3, label: 'Avançado', icon: TrendingUp },
  { level: 4, label: 'PRO', icon: Crown },
  { level: 5, label: 'Mestre', icon: Award }
];

const ModeSelector = ({
  currentMode = 'BEGINNER',
  onChange,
  theme = 'default',
  compact = false,
  showUnlockAnimation = true,
  allowModeLock = true,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [unlockAnimation, setUnlockAnimation] = useState(false);
  const [lockedModes, setLockedModes] = useState([]);
  
  // Encontra definição do modo atual
  const currentModeDef = APP_MODES[currentMode] || APP_MODES.BEGINNER;
  const CurrentIcon = currentModeDef.icon;
  
  // Efeito para animação de desbloqueio
  useEffect(() => {
    if (showUnlockAnimation && currentMode === 'PRO') {
      setUnlockAnimation(true);
      const timer = setTimeout(() => setUnlockAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentMode, showUnlockAnimation]);
  
  // Verifica se um modo está bloqueado
  const isModeLocked = useCallback((modeId) => {
    if (!allowModeLock) return false;
    
    // Lógica de bloqueio baseada em progresso
    const modeDef = APP_MODES[modeId];
    if (!modeDef) return false;
    
    // Modo PRO pode exigir desbloqueio
    if (modeId === 'PRO' && modeDef.requiresUnlock) {
      return lockedModes.includes('PRO');
    }
    
    // Modo CUSTOM sempre bloqueado inicialmente
    if (modeId === 'CUSTOM') {
      return lockedModes.includes('CUSTOM') || currentMode !== 'PRO';
    }
    
    return false;
  }, [lockedModes, allowModeLock, currentMode]);
  
  // Manipulador de mudança de modo
  const handleModeChange = useCallback((modeId) => {
    const modeDef = APP_MODES[modeId];
    
    if (!modeDef) {
      console.error(`Modo ${modeId} não encontrado`);
      return;
    }
    
    // Verifica se está bloqueado
    if (isModeLocked(modeId)) {
      setPendingMode(modeId);
      setShowConfirmation(true);
      return;
    }
    
    // Verifica se é uma transição válida
    const currentLevel = currentModeDef.difficulty;
    const newLevel = modeDef.difficulty;
    
    // Transição de nível muito alto requer confirmação
    if (newLevel - currentLevel >= 2) {
      setPendingMode(modeId);
      setShowConfirmation(true);
      return;
    }
    
    // Aplica mudança diretamente
    onChange(modeId);
    setIsOpen(false);
  }, [onChange, isModeLocked, currentModeDef]);
  
  // Confirma mudança de modo
  const confirmModeChange = useCallback(() => {
    if (pendingMode) {
      onChange(pendingMode);
      
      // Desbloqueia o modo se estava bloqueado
      if (lockedModes.includes(pendingMode)) {
        setLockedModes(prev => prev.filter(m => m !== pendingMode));
      }
      
      setShowConfirmation(false);
      setPendingMode(null);
      setIsOpen(false);
    }
  }, [pendingMode, onChange, lockedModes]);
  
  // Cancela mudança de modo
  const cancelModeChange = useCallback(() => {
    setShowConfirmation(false);
    setPendingMode(null);
  }, []);
  
  // Renderiza o trigger principal
  const renderTrigger = () => {
    const isLocked = isModeLocked(currentMode);
    
    return (
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-200 group
          ${compact ? 'py-2 px-3 text-sm' : ''}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-700' 
            : 'hover:scale-[1.02] active:scale-[0.98]'
          }
          ${unlockAnimation ? 'animate-pulse' : ''}
          ${theme === 'pro-gold' 
            ? 'bg-gradient-to-r from-gray-900/80 to-gray-950/60 border border-amber-700/30 hover:border-amber-500/50' 
            : 'bg-gray-900/50 border border-gray-700 hover:border-gray-600'
          }
          ${className}
        `}
        aria-label={`Modo atual: ${currentModeDef.label}`}
      >
        {/* Ícone do modo */}
        <div className={`
          relative p-2 rounded-lg
          ${currentModeDef.color.replace('bg-', 'bg-')}/20
          ${unlockAnimation ? 'animate-spin-slow' : ''}
        `}>
          <CurrentIcon 
            size={compact ? 16 : 20} 
            className={currentModeDef.textColor}
          />
          
          {/* Indicador de nível PRO */}
          {currentMode === 'PRO' && (
            <div className="absolute -top-1 -right-1 w-4 h-4">
              <Sparkles size={12} className="text-amber-400" />
            </div>
          )}
        </div>
        
        {/* Informações do modo */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-bold ${compact ? 'text-sm' : 'text-base'} truncate`}>
              {currentModeDef.label}
            </div>
            
            {/* Badge de nível */}
            <div className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${currentModeDef.color} ${currentMode === 'PRO' ? 'text-black' : 'text-white'}
            `}>
              Nível {currentModeDef.difficulty}
            </div>
          </div>
          
          {!compact && (
            <div className="text-xs text-gray-400 truncate">
              {currentModeDef.description}
            </div>
          )}
        </div>
        
        {/* Indicadores adicionais */}
        <div className="flex items-center gap-2">
          {/* Indicador de bloqueio */}
          {isLocked && (
            <div className="p-1 rounded bg-red-900/30">
              <Lock size={12} className="text-red-400" />
            </div>
          )}
          
          {/* Indicador de dropdown */}
          <ChevronDown 
            size={16} 
            className={`
              transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
              ${theme === 'pro-gold' ? 'text-amber-400' : 'text-gray-400'}
            `}
          />
        </div>
      </button>
    );
  };
  
  // Renderiza uma opção de modo
  const renderModeOption = (modeDef) => {
    const ModeIcon = modeDef.icon;
    const isSelected = modeDef.id === currentMode;
    const isLocked = isModeLocked(modeDef.id);
    
    return (
      <button
        key={modeDef.id}
        onClick={() => handleModeChange(modeDef.id)}
        disabled={isLocked}
        className={`
          flex items-start gap-3 p-3 rounded-xl text-left
          transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]
          ${isSelected 
            ? `${theme === 'pro-gold' ? 'bg-amber-900/20 border border-amber-700/40' : 'bg-gray-800/50 border border-gray-600'}` 
            : 'hover:bg-gray-800/30'
          }
          ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
          relative overflow-hidden
        `}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${modeDef.glowColor} opacity-10`} />
        
        {/* Ícone e status */}
        <div className={`
          relative p-2 rounded-lg z-10
          ${modeDef.color.replace('bg-', 'bg-')}/20
          ${isLocked ? 'grayscale-50' : ''}
        `}>
          <ModeIcon 
            size={20} 
            className={isLocked ? 'text-gray-500' : modeDef.textColor}
          />
          
          {/* Indicador de bloqueio */}
          {isLocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4">
              <Lock size={10} className="text-red-400" />
            </div>
          )}
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className={`font-bold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
              {modeDef.label}
            </div>
            
            {/* Badge de nível */}
            <div className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${isLocked ? 'bg-gray-800 text-gray-500' : `${modeDef.color} ${modeDef.id === 'PRO' ? 'text-black' : 'text-white'}`}
            `}>
              Nível {modeDef.difficulty}
            </div>
            
            {/* Indicador selecionado */}
            {isSelected && (
              <div className="ml-auto">
                <CheckCircle size={16} className="text-green-400" />
              </div>
            )}
          </div>
          
          <div className={`text-sm ${isLocked ? 'text-gray-500' : 'text-gray-400'}`}>
            {modeDef.description}
          </div>
          
          {/* Features principais */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Recursos principais:</div>
            <div className="flex flex-wrap gap-1">
              {modeDef.features.slice(0, 3).map((feature, idx) => (
                <div
                  key={`feature-${idx}`}
                  className={`
                    px-2 py-0.5 rounded text-xs
                    ${isLocked ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-800/30 text-gray-300'}
                  `}
                >
                  {feature}
                </div>
              ))}
              {modeDef.features.length > 3 && (
                <div className="px-2 py-0.5 rounded text-xs bg-gray-800/30 text-gray-400">
                  +{modeDef.features.length - 3} mais
                </div>
              )}
            </div>
          </div>
          
          {/* Mensagem de bloqueio */}
          {isLocked && modeDef.unlockMessage && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-400/80">
              <AlertCircle size={12} />
              <span>{modeDef.unlockMessage}</span>
            </div>
          )}
        </div>
      </button>
    );
  };
  
  // Renderiza confirmação de mudança
  const renderConfirmation = () => {
    if (!showConfirmation || !pendingMode) return null;
    
    const pendingModeDef = APP_MODES[pendingMode];
    const isUpgrade = pendingModeDef.difficulty > currentModeDef.difficulty;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className={`
          max-w-md w-full rounded-2xl p-6
          ${theme === 'pro-gold' 
            ? 'bg-gradient-to-br from-gray-900 to-gray-950 border border-amber-700/30' 
            : 'bg-gray-900 border border-gray-700'
          }
        `}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${pendingModeDef.color.replace('bg-', 'bg-')}/20`}>
              <pendingModeDef.icon size={24} className={pendingModeDef.textColor} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isUpgrade ? '🔓 Desbloquear Modo' : '⚠️ Mudar Modo'}
              </h3>
              <p className="text-sm text-gray-400">{pendingModeDef.label}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">
                {isUpgrade 
                  ? 'Você está prestes a desbloquear um modo mais avançado. Isso irá:'
                  : 'Você está prestes a mudar para um modo diferente. Isso irá:'
                }
              </div>
              
              <div className="space-y-2">
                {isUpgrade ? (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={12} className="text-green-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        Desbloquear <span className="font-bold">{pendingModeDef.features.length}</span> novos recursos
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={12} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        Aumentar complexidade para nível {pendingModeDef.difficulty}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Target size={12} className="text-amber-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        {pendingModeDef.restrictions.length > 0 
                          ? `Remover ${pendingModeDef.restrictions.length} restrições`
                          : 'Remover todas as restrições'
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={12} className="text-yellow-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        Alterar interface e controles disponíveis
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Settings size={12} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-gray-300">
                        Resetar algumas configurações atuais
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {isUpgrade && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-amber-700/30">
                <div className="text-sm text-amber-300 mb-1">🎵 Recomendação</div>
                <div className="text-xs text-amber-400/80">
                  Certifique-se de estar confortável com o modo atual antes de prosseguir.
                  Modos avançados exigem maior habilidade rítmica.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={cancelModeChange}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmModeChange}
              className={`
                flex-1 px-4 py-2 rounded-lg transition-colors
                ${isUpgrade 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              {isUpgrade ? 'Desbloquear Modo' : 'Confirmar Mudança'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza barra de progresso de dificuldade
  const renderDifficultyProgress = () => {
    const currentLevel = currentModeDef.difficulty;
    const maxLevel = 5;
    
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-300">Progresso de Dificuldade</div>
          <div className="text-xs text-gray-500">Nível {currentLevel} de {maxLevel}</div>
        </div>
        
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`
              h-full rounded-full transition-all duration-500
              ${currentMode === 'PRO' 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                : currentMode === 'INTERMEDIATE'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }
            `}
            style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          {DIFFICULTY_LEVELS.map(level => {
            const isActive = level.level <= currentLevel;
            const LevelIcon = level.icon;
            
            return (
              <div
                key={level.level}
                className="flex flex-col items-center"
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center mb-1
                  ${isActive 
                    ? level.level === 5
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
                      : level.level === 4
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : level.level === 3
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300'
                    : 'bg-gray-800 text-gray-500'
                  }
                `}>
                  <LevelIcon size={14} />
                </div>
                <div className={`
                  text-xs ${isActive ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {level.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="relative">
      {/* Trigger principal */}
      {renderTrigger()}
      
      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className={`
          absolute top-full mt-2 left-0 right-0
          bg-gray-950 border border-gray-800 rounded-2xl
          shadow-2xl z-40 max-h-[80vh] overflow-y-auto
          ${compact ? 'w-80' : 'w-96'}
        `}>
          {/* Cabeçalho */}
          <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">Selecionar Modo</h3>
                <p className="text-xs text-gray-400">Escolha o nível de dificuldade</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded"
                aria-label="Fechar"
              >
                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>
            
            {/* Barra de progresso */}
            {!compact && renderDifficultyProgress()}
          </div>
          
          {/* Conteúdo */}
          <div className="p-4 space-y-3">
            {/* Modos principais */}
            {Object.values(APP_MODES).map(modeDef => (
              <div key={modeDef.id}>
                {renderModeOption(modeDef)}
              </div>
            ))}
            
            {/* Dica de uso */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-400" />
                <div className="text-sm font-medium text-amber-300">Dica de uso</div>
              </div>
              <div className="text-xs text-gray-400">
                Comece no modo Iniciante e progrida gradualmente. 
                Cada modo desbloqueia novos recursos e aumenta a complexidade.
              </div>
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="sticky bottom-0 bg-gray-950/95 backdrop-blur-sm p-3 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Modo atual: <span className="text-white">{currentModeDef.label}</span></span>
                <span>Nível: <span className="text-white">{currentModeDef.difficulty}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Modal de confirmação */}
      {renderConfirmation()}
      
      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes unlock-glow {
          0%, 100% { box-shadow: 0 0 20px transparent; }
          50% { box-shadow: 0 0 40px var(--glow-color, #f59e0b); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-unlock-glow {
          animation: unlock-glow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Helper para obter informações de modo
export const getModeInfo = (modeId) => {
  return APP_MODES[modeId] || APP_MODES.BEGINNER;
};

// Helper para verificar se um recurso está disponível no modo atual
export const isFeatureAvailable = (modeId, feature) => {
  const mode = APP_MODES[modeId];
  if (!mode) return false;
  
  // Lógica de verificação de features
  const featureChecks = {
    'permutations': modeId === 'PRO' || modeId === 'INTERMEDIATE',
    'ghostMode': modeId === 'PRO',
    'gapCycles': modeId === 'PRO',
    'autoLoop': modeId === 'PRO' || modeId === 'INTERMEDIATE',
    'groove': modeId === 'PRO' || modeId === 'INTERMEDIATE',
    'ternary': modeId === 'PRO' || modeId === 'INTERMEDIATE',
    'irregular': modeId === 'PRO',
    'polyrhythm': modeId === 'PRO',
    'export': modeId === 'PRO',
    'customThemes': modeId === 'PRO',
  };
  
  return featureChecks[feature] || false;
};

// Helper para obter próximos modos disponíveis
export const getAvailableModes = (currentModeId, unlockedModes = []) => {
  const currentMode = APP_MODES[currentModeId];
  if (!currentMode) return [];
  
  return Object.values(APP_MODES).filter(mode => {
    // Não mostrar o modo atual
    if (mode.id === currentModeId) return false;
    
    // Verificar se está desbloqueado
    if (mode.requiresUnlock && !unlockedModes.includes(mode.id)) {
      return false;
    }
    
    // Para modos bloqueados, apenas mostrar se o usuário tem nível suficiente
    return mode.difficulty <= currentMode.difficulty + 1;
  });
};

export default React.memo(ModeSelector);

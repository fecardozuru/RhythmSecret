// /src/components/ui/ThemePicker.jsx

import React, { useState, useCallback } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Moon, 
  Sun, 
  Instagram, 
  Music,
  Zap,
  Crown
} from 'lucide-react';
import { formatThemeGradient } from '../../utils/formatters';
import { useMenuManagement } from '../../hooks/useMenuManagement';
import { THEMES } from '../../constants/themes';

/**
 * ThemePicker - Menu de seleção de temas visuais
 * Permite ao usuário escolher entre diferentes esquemas de cores
 */
const ThemePicker = ({
  currentTheme = 'default',
  onChange,
  showPreview = true,
  compact = false,
  className = '',
}) => {
  const [localTheme, setLocalTheme] = useState(currentTheme);
  
  // Usa hook de gerenciamento de menu
  const { 
    isOpen, 
    toggleMenu, 
    closeMenu, 
    menuRef, 
    triggerRef, 
    zIndex 
  } = useMenuManagement('theme-picker', {
    closeOnClickOutside: true,
    closeOnEsc: true,
    autoZIndex: true,
  });
  
  // Temas disponíveis
  const themeOptions = [
    {
      id: 'default',
      name: 'Padrão',
      description: 'Tema limpo e profissional',
      icon: Palette,
      colors: {
        primary: '#3B82F6', // blue-500
        secondary: '#8B5CF6', // purple-500
        accent: '#EC4899', // pink-500
        bg: 'bg-gray-900',
        text: 'text-white',
      },
      gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)',
      unlocked: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Cores vibrantes do Instagram',
      icon: Instagram,
      colors: {
        primary: '#E1306C', // instagram pink
        secondary: '#833AB4', // instagram purple
        accent: '#F77737', // instagram orange
        bg: 'bg-gradient-to-br from-gray-900 to-purple-950',
        text: 'text-white',
      },
      gradient: 'linear-gradient(45deg, #833AB4, #E1306C, #FCAF45)',
      unlocked: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Estilo moderno do TikTok',
      icon: Music,
      colors: {
        primary: '#25F4EE', // tiktok cyan
        secondary: '#FE2C55', // tiktok red
        accent: '#FFFFFF', // white
        bg: 'bg-gradient-to-br from-gray-900 to-gray-950',
        text: 'text-white',
      },
      gradient: 'linear-gradient(45deg, #25F4EE, #FE2C55)',
      unlocked: true,
    },
    {
      id: 'pro-gold',
      name: 'PRO Gold',
      description: 'Tema premium dourado',
      icon: Crown,
      colors: {
        primary: '#D4AF37', // gold
        secondary: '#FFD700', // yellow
        accent: '#FFF8DC', // cornsilk
        bg: 'bg-gradient-to-br from-gray-950 to-amber-950/30',
        text: 'text-amber-50',
      },
      gradient: 'linear-gradient(135deg, #D4AF37, #FFD700, #FFF8DC)',
      unlocked: true, // Em produção, poderia ser apenas para usuários PRO
    },
    {
      id: 'dark',
      name: 'Escuro',
      description: 'Tema escuro minimalista',
      icon: Moon,
      colors: {
        primary: '#60A5FA', // blue-400
        secondary: '#A78BFA', // purple-400
        accent: '#F472B6', // pink-400
        bg: 'bg-gray-950',
        text: 'text-gray-100',
      },
      gradient: 'linear-gradient(135deg, #1F2937, #111827)',
      unlocked: true,
    },
    {
      id: 'light',
      name: 'Claro',
      description: 'Tema claro para ambientes claros',
      icon: Sun,
      colors: {
        primary: '#2563EB', // blue-600
        secondary: '#7C3AED', // purple-600
        accent: '#DB2777', // pink-600
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
        text: 'text-gray-900',
      },
      gradient: 'linear-gradient(135deg, #E5E7EB, #F3F4F6)',
      unlocked: true,
    },
  ];
  
  // Obtém o tema atual
  const currentThemeInfo = themeOptions.find(theme => theme.id === localTheme) || themeOptions[0];
  const CurrentIcon = currentThemeInfo.icon;
  
  // Manipulador de mudança de tema
  const handleThemeChange = useCallback((newTheme) => {
    const theme = themeOptions.find(t => t.id === newTheme);
    
    if (!theme || !theme.unlocked) {
      // Em produção, aqui mostraria um modal de upgrade
      console.log(`Tema ${theme?.name} bloqueado`);
      return;
    }
    
    setLocalTheme(newTheme);
    
    if (onChange) {
      onChange(newTheme);
    }
    
    closeMenu();
  }, [themeOptions, onChange, closeMenu]);
  
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
            ${currentThemeInfo.colors.bg}
            border border-gray-700
            ${currentThemeInfo.colors.text} shadow-lg
            hover:shadow-xl active:scale-95
            ${isOpen ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
          `}
          aria-label={`Tema atual: ${currentThemeInfo.name}. Clique para alterar.`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <CurrentIcon size={20} style={{ color: currentThemeInfo.colors.primary }} />
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
          ${currentThemeInfo.colors.bg}
          border border-gray-700
          ${currentThemeInfo.colors.text} shadow-lg
          hover:shadow-xl active:scale-95
          ${isOpen ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' : ''}
        `}
        style={{
          background: currentThemeInfo.gradient,
          backgroundSize: '200% 200%',
          animation: isOpen ? 'gradientShift 3s ease infinite' : 'none',
        }}
        aria-label={`Tema atual: ${currentThemeInfo.name}. Clique para alterar.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div 
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm"
          style={{ border: `1px solid ${currentThemeInfo.colors.primary}40` }}
        >
          <CurrentIcon size={20} style={{ color: currentThemeInfo.colors.primary }} />
        </div>
        
        <div className="text-left">
          <div className="font-semibold">Tema</div>
          <div className="text-xs text-gray-300">{currentThemeInfo.name}</div>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {/* Mini preview das cores */}
          <div className="flex">
            {[currentThemeInfo.colors.primary, currentThemeInfo.colors.secondary, currentThemeInfo.colors.accent]
              .map((color, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full -ml-1 first:ml-0 border border-white/30"
                  style={{ backgroundColor: color }}
                />
              ))}
          </div>
          
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </button>
    );
  };
  
  // Renderiza o dropdown de temas
  const renderDropdown = () => {
    if (!isOpen) return null;
    
    return (
      <div
        ref={menuRef}
        className={`
          absolute ${compact ? 'left-0' : 'left-0'} mt-2 w-80 rounded-xl shadow-2xl
          overflow-hidden z-50
          animate-in fade-in slide-in-from-top-2 duration-200
        `}
        style={{ zIndex }}
      >
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">
          {/* Cabeçalho do dropdown */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <Palette size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Selecionar Tema</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Personalize a aparência do aplicativo
                </p>
              </div>
            </div>
          </div>
          
          {/* Lista de temas */}
          <div className="p-3 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((theme) => {
                const ThemeIcon = theme.icon;
                const isCurrent = theme.id === localTheme;
                const isLocked = !theme.unlocked;
                
                return (
                  <div
                    key={theme.id}
                    onClick={() => !isLocked && handleThemeChange(theme.id)}
                    className={`
                      relative group cursor-pointer rounded-xl overflow-hidden
                      transition-all duration-200
                      ${isCurrent ? 'ring-2 ring-blue-400' : 'hover:ring-1 hover:ring-gray-700'}
                      ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    aria-label={`Tema ${theme.name}${isLocked ? ' (bloqueado)' : ''}`}
                    aria-disabled={isLocked}
                    role="option"
                    aria-selected={isCurrent}
                  >
                    {/* Preview do tema */}
                    <div
                      className="h-32 relative"
                      style={{ background: theme.gradient }}
                    >
                      {/* Overlay de gradiente escuro para melhor contraste do texto */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Conteúdo do preview */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                            <ThemeIcon size={14} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{theme.name}</div>
                            <div className="text-xs text-gray-300">{theme.description}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de tema atual */}
                      {isCurrent && (
                        <div className="absolute top-2 right-2">
                          <div className="p-1.5 rounded-full bg-green-500">
                            <Check size={12} className="text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Indicador de bloqueado */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="text-center">
                            <Crown size={20} className="text-amber-400 mx-auto mb-1" />
                            <div className="text-xs text-white font-semibold">PRO</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Paleta de cores */}
                    <div className="p-3 bg-gray-800/50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-xs text-gray-400">Paleta:</div>
                        {isLocked && (
                          <div className="text-xs text-amber-400 flex items-center gap-1">
                            <Crown size={10} />
                            <span>PRO</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {[theme.colors.primary, theme.colors.secondary, theme.colors.accent]
                          .map((color, index) => (
                            <div
                              key={index}
                              className="flex-1 h-2 rounded-full border border-white/10"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                      </div>
                    </div>
                    
                    {/* Efeito de hover */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Preview do tema selecionado (se habilitado) */}
          {showPreview && (
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-white">Pré-visualização</div>
                <div className="text-xs text-gray-400">Tema atual</div>
              </div>
              
              <div
                className="h-20 rounded-lg relative overflow-hidden"
                style={{ background: currentThemeInfo.gradient }}
              >
                {/* Elementos de preview */}
                <div className="absolute inset-0 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Zap size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="h-2 w-24 rounded-full bg-white/30 mb-1" />
                      <div className="h-2 w-16 rounded-full bg-white/20" />
                    </div>
                  </div>
                  
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-1 rounded-full"
                        style={{ 
                          backgroundColor: i === 1 ? currentThemeInfo.colors.primary :
                                         i === 2 ? currentThemeInfo.colors.secondary :
                                         currentThemeInfo.colors.accent,
                          opacity: 0.8
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                <Sparkles size={12} />
                <span>As cores afetam todos os componentes do aplicativo</span>
              </div>
            </div>
          )}
          
          {/* Rodapé */}
          <div className="p-3 border-t border-gray-800 bg-gray-900/80">
            <div className="text-xs text-gray-400 text-center">
              Os temas PRO são desbloqueados com assinatura premium
            </div>
          </div>
        </div>
        
        {/* Seta do dropdown */}
        <div className={`absolute -top-2 ${compact ? 'left-4' : 'left-6'} w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900`} />
      </div>
    );
  };
  
  // Renderiza informações do tema atual (apenas para compact=false)
  const renderThemeDetails = () => {
    if (compact) return null;
    
    return (
      <div className="mt-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ 
                background: currentThemeInfo.gradient,
                border: `1px solid ${currentThemeInfo.colors.primary}40`
              }}
            >
              <CurrentIcon size={20} style={{ color: currentThemeInfo.colors.primary }} />
            </div>
            <div>
              <h4 className="font-semibold text-white">Tema {currentThemeInfo.name}</h4>
              <p className="text-sm text-gray-300">{currentThemeInfo.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">Código</div>
            <div className="font-mono text-sm" style={{ color: currentThemeInfo.colors.primary }}>
              {currentThemeInfo.id}
            </div>
          </div>
        </div>
        
        {/* Paleta de cores detalhada */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">Paleta de cores:</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Primária', color: currentThemeInfo.colors.primary, value: currentThemeInfo.colors.primary },
              { name: 'Secundária', color: currentThemeInfo.colors.secondary, value: currentThemeInfo.colors.secondary },
              { name: 'Acento', color: currentThemeInfo.colors.accent, value: currentThemeInfo.colors.accent },
            ].map((colorInfo, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden border border-gray-700"
              >
                <div
                  className="h-10"
                  style={{ backgroundColor: colorInfo.color }}
                />
                <div className="p-2 bg-gray-900">
                  <div className="text-xs font-semibold text-white">{colorInfo.name}</div>
                  <div className="text-xs text-gray-400 font-mono truncate" title={colorInfo.value}>
                    {colorInfo.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dica de uso */}
        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Sparkles size={12} />
            <span>
              {currentThemeInfo.id === 'pro-gold' && 'Tema premium com contraste otimizado para longas sessões'}
              {currentThemeInfo.id === 'instagram' && 'Cores vibrantes inspiradas no Instagram'}
              {currentThemeInfo.id === 'tiktok' && 'Estilo moderno e dinâmico do TikTok'}
              {currentThemeInfo.id === 'dark' && 'Tema escuro para reduzir fadiga visual'}
              {currentThemeInfo.id === 'light' && 'Tema claro ideal para ambientes claros'}
              {currentThemeInfo.id === 'default' && 'Tema balanceado para uso geral'}
            </span>
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
      
      {!compact && renderThemeDetails()}
      
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
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
ThemePicker.defaultProps = {
  currentTheme: 'default',
  showPreview: true,
  compact: false,
  className: '',
};

export default React.memo(ThemePicker);

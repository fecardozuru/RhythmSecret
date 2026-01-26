// /src/components/pwa/PWAInstallPrompt.jsx

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Home,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

/**
 * PWAInstallPrompt - Componente para promover instalação do PWA
 */
const PWAInstallPrompt = ({
  theme = 'default',
  autoShow = true,
  delay = 5000,
  onInstall,
  onDismiss,
  className = '',
}) => {
  const { canInstall, installPWA, isStandalone } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const [platform, setPlatform] = useState('unknown');

  // Detecta plataforma
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else if (/windows phone/i.test(userAgent)) {
      setPlatform('windows');
    } else if (/macintosh/i.test(userAgent)) {
      setPlatform('mac');
    } else if (/windows/i.test(userAgent)) {
      setPlatform('windows');
    } else if (/linux/i.test(userAgent)) {
      setPlatform('linux');
    } else {
      setPlatform('desktop');
    }
  }, []);

  // Controla visibilidade do prompt
  useEffect(() => {
    if (dismissed || isStandalone || !canInstall || !autoShow) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [canInstall, isStandalone, dismissed, autoShow, delay]);

  // Manipula instalação
  const handleInstall = async () => {
    try {
      const installed = await installPWA();
      if (installed) {
        setIsVisible(false);
        if (onInstall) onInstall();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  // Manipula fechamento
  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    if (onDismiss) onDismiss();
    
    // Salva no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  // Verifica se deve mostrar baseado no localStorage
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwaPromptDismissed');
    if (dismissedTime) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) { // Não mostrar por 7 dias
        setDismissed(true);
      }
    }
  }, []);

  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      accent: 'bg-blue-500',
      accentText: 'text-blue-400',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-br from-gray-950 to-amber-950/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      accent: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      accentText: 'text-amber-400',
    },
  };

  const colors = themeColors[theme] || themeColors.default;

  // Renderiza instruções específicas por plataforma
  const renderPlatformInstructions = () => {
    switch (platform) {
      case 'android':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xs">1</span>
              </div>
              <span className="text-sm">Toque em "Adicionar à tela inicial"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xs">2</span>
              </div>
              <span className="text-sm">Toque em "Adicionar" no prompt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <span className="text-sm">O app será instalado como nativo</span>
            </div>
          </div>
        );

      case 'ios':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs">1</span>
              </div>
              <span className="text-sm">Toque no ícone de compartilhar (□↑)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs">2</span>
              </div>
              <span className="text-sm">Role e selecione "Adicionar à tela inicial"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <span className="text-sm">Toque em "Adicionar" no canto superior direito</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs">1</span>
              </div>
              <span className="text-sm">Clique no botão "Instalar" abaixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs">2</span>
              </div>
              <span className="text-sm">Siga as instruções do seu navegador</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs">3</span>
              </div>
              <span className="text-sm">Acesse o app pelo seu menu iniciar/dock</span>
            </div>
          </div>
        );
    }
  };

  // Renderiza benefícios do PWA
  const renderBenefits = () => {
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-green-500/20">
            <Home size={12} className="text-green-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Acesso Rápido</div>
            <div className="text-xs text-gray-400">Direto da tela inicial</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-500/20">
            <Smartphone size={12} className="text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Modo Offline</div>
            <div className="text-xs text-gray-400">Funciona sem internet</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/20">
            <Check size={12} className="text-purple-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Atualizações</div>
            <div className="text-xs text-gray-400">Automáticas</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/20">
            <ExternalLink size={12} className="text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Experiência Nativa</div>
            <div className="text-xs text-gray-400">Sem barra de navegação</div>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className={`relative rounded-2xl p-6 max-w-md w-full ${colors.bg} ${colors.border} border shadow-2xl`}>
        {/* Botão de fechar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} className="text-gray-400" />
        </button>
        
        {/* Conteúdo */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            <Download size={24} className="text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Instalar Rhythm Trainer
          </h3>
          
          <p className="text-gray-400 mb-6">
            Instale como app nativo para acesso rápido, modo offline e notificações
          </p>
        </div>
        
        {/* Instruções */}
        <div className="mb-6 p-4 rounded-xl bg-gray-800/30">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className={colors.accentText} />
            <h4 className="text-sm font-semibold text-white">Como instalar:</h4>
          </div>
          {renderPlatformInstructions()}
        </div>
        
        {/* Benefícios */}
        {renderBenefits()}
        
        {/* Botões de ação */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Agora não
          </button>
          
          <button
            onClick={handleInstall}
            className={`flex-1 px-4 py-3 rounded-xl ${colors.accent} text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
          >
            <Download size={20} />
            <span>Instalar App</span>
          </button>
        </div>
        
        {/* Rodapé */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            O app ocupa menos de 5MB e funciona completamente offline
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

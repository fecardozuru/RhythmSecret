// /src/App.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Music, 
  Zap, 
  Crown, 
  Settings, 
  Menu, 
  X,
  GitHub,
  HelpCircle,
  Share2,
  Volume2,
  Clock
} from 'lucide-react';

// Importação de componentes
import SubdivisionGrid from './components/ui/SubdivisionGrid';
import BpmDial from './components/ui/BpmDial';
import ModeSelector from './components/ui/ModeSelector';
import ThemePicker from './components/ui/ThemePicker';
import TimeSigPicker from './components/ui/TimeSigPicker';
import PlayModeToggle from './components/ui/PlayModeToggle';
import LoopControl from './components/ui/LoopControl';

// Importação de features PRO
import PermutationToggle from './components/pro-features/PermutationToggle';
import GapToggle from './components/pro-features/GapToggle';
import GhostModeToggle from './components/pro-features/GhostModeToggle';
import PresetManager from './components/pro-features/PresetManager';
import AudioEngine from './components/audio/AudioEngine';

// Importação de hooks
import { useMetronomeEngine } from './hooks/useMetronomeEngine';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useMenuManagement } from './hooks/useMenuManagement';

// Importação de utils e constants
import { formatAppMode } from './utils/formatters';
import { TIME_SIGNATURES } from './constants/musicalConfig';
import { THEMES } from './constants/themes';
import { VOLUME_PROFILES } from './constants/audioConfig';

/**
 * App - Componente principal do Rhythm Trainer
 * Integra todos os componentes e gerencia o estado global
 */
const App = () => {
  // Estado do aplicativo
  const [appMode, setAppMode] = useState('beginner');
  const [theme, setTheme] = useState('default');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProFeatures, setShowProFeatures] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'presets', 'settings'
  
  // Hook de gerenciamento do metrônomo
  const metronomeEngine = useMetronomeEngine({
    appMode,
    timeSignature: TIME_SIGNATURES['4/4'],
    volumes: VOLUME_PROFILES.BEGINNER.volumes,
  });
  
  // Hook de sincronização com Firebase
  const firebaseSync = useFirebaseSync();
  
  // Hook de gerenciamento de menu móvel
  const mobileMenu = useMenuManagement('mobile-menu', {
    closeOnClickOutside: true,
    closeOnEsc: true,
  });
  
  // Efeito para ajustar UI baseado no modo
  useEffect(() => {
    // Ativa features PRO quando no modo PRO
    if (appMode === 'pro') {
      setShowProFeatures(true);
    } else if (appMode === 'advanced') {
      setShowProFeatures(true);
    } else {
      setShowProFeatures(false);
    }
    
    // Ajusta layout para mobile
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [appMode]);
  
  // Manipuladores de eventos
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    // Aplicar tema ao documento
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);
  
  const handleSavePreset = useCallback(async (slot) => {
    const presetData = {
      name: `Preset ${slot} - ${new Date().toLocaleTimeString()}`,
      bpm: metronomeEngine.bpm,
      timeSignature: metronomeEngine.timeSignature,
      subdivision: metronomeEngine.subdivision,
      volumes: metronomeEngine.volumes,
      sequence: metronomeEngine.sequence,
      appMode,
      playMode: metronomeEngine.playMode,
      proFeatures: {
        permutationEnabled: metronomeEngine.permutationEnabled,
        gapEnabled: metronomeEngine.gapEnabled,
        ghostModeEnabled: metronomeEngine.ghostModeEnabled,
        autoLoopEnabled: metronomeEngine.autoLoopEnabled,
      },
    };
    
    await firebaseSync.savePreset(slot, presetData);
  }, [metronomeEngine, appMode, firebaseSync]);
  
  const handleLoadPreset = useCallback(async (slot) => {
    const preset = await firebaseSync.loadPreset(slot);
    if (preset) {
      // Aplicar preset carregado
      metronomeEngine.setBpm(preset.bpm);
      metronomeEngine.setTimeSignature(preset.timeSignature);
      metronomeEngine.setSubdivision(preset.subdivision);
      metronomeEngine.setVolumes(preset.volumes);
      metronomeEngine.updateSequence(preset.sequence);
      
      if (preset.appMode) setAppMode(preset.appMode);
      if (preset.playMode) metronomeEngine.setPlayMode(preset.playMode);
      
      // Aplicar features PRO
      if (preset.proFeatures) {
        metronomeEngine.setPermutationEnabled(preset.proFeatures.permutationEnabled);
        metronomeEngine.setGapEnabled(preset.proFeatures.gapEnabled);
        metronomeEngine.setGhostModeEnabled(preset.proFeatures.ghostModeEnabled);
        metronomeEngine.setAutoLoopEnabled(preset.proFeatures.autoLoopEnabled);
      }
    }
  }, [metronomeEngine, firebaseSync]);
  
  const handleShare = useCallback(() => {
    // Compartilhar configuração atual
    const config = metronomeEngine.exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    if (navigator.share) {
      navigator.share({
        title: 'Rhythm Trainer Configuration',
        text: 'Check out my rhythm training configuration!',
        url: url,
      });
    } else {
      // Fallback para copiar para clipboard
      navigator.clipboard.writeText(config);
      alert('Configuration copied to clipboard!');
    }
  }, [metronomeEngine]);
  
  // Renderiza sidebar
  const renderSidebar = () => {
    if (!showSidebar) return null;
    
    return (
      <div className="w-80 lg:w-96 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 p-6 overflow-y-auto">
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Music size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rhythm Trainer</h1>
              <p className="text-xs text-gray-400">Treinador rítmico profissional</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSidebar(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
            aria-label="Fechar sidebar"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        {/* Seletor de modo */}
        <div className="mb-6">
          <ModeSelector
            currentMode={appMode}
            onChange={setAppMode}
            theme={theme}
          />
        </div>
        
        {/* Seletor de tema */}
        <div className="mb-6">
          <ThemePicker
            currentTheme={theme}
            onChange={handleThemeChange}
            theme={theme}
          />
        </div>
        
        {/* Seletor de compasso */}
        <div className="mb-6">
          <TimeSigPicker
            currentTimeSig={metronomeEngine.timeSignature}
            onChange={metronomeEngine.setTimeSignature}
            theme={theme}
          />
        </div>
        
        {/* Controles de loop */}
        <div className="mb-6">
          <LoopControl
            isLooping={metronomeEngine.permutationEnabled}
            isAutoLoop={metronomeEngine.autoLoopEnabled}
            currentStep={metronomeEngine.currentStep}
            totalSteps={metronomeEngine.sequence.length}
            bpm={metronomeEngine.bpm}
            timeSignature={metronomeEngine.timeSignature}
            onLoopToggle={metronomeEngine.setPermutationEnabled}
            onAutoLoopToggle={metronomeEngine.setAutoLoopEnabled}
            theme={theme}
          />
        </div>
        
        {/* Features PRO */}
        {showProFeatures && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Features PRO</h3>
            </div>
            
            <PermutationToggle
              enabled={metronomeEngine.permutationEnabled}
              isPlaying={metronomeEngine.isPlaying}
              currentPermutation={metronomeEngine.currentPermutationIndex + 1}
              totalPermutations={metronomeEngine.permutationSequences.length}
              permutationStart={metronomeEngine.permutationStart}
              permutationEnd={metronomeEngine.permutationEnd}
              onToggle={metronomeEngine.setPermutationEnabled}
              onStartChange={metronomeEngine.setPermutationStart}
              onEndChange={metronomeEngine.setPermutationEnd}
              compact
              theme={theme}
            />
            
            <GapToggle
              enabled={metronomeEngine.gapEnabled}
              isInGap={metronomeEngine.isInGap}
              currentCycle={metronomeEngine.measureCount}
              onToggle={metronomeEngine.setGapEnabled}
              compact
              theme={theme}
            />
            
            <GhostModeToggle
              enabled={metronomeEngine.ghostModeEnabled}
              onToggle={metronomeEngine.setGhostModeEnabled}
              compact
              theme={theme}
            />
          </div>
        )}
        
        {/* Gerenciador de presets */}
        <div className="mb-6">
          <PresetManager
            slots={firebaseSync.presets}
            currentSlot={1}
            user={firebaseSync.user}
            isSyncing={firebaseSync.isSyncing}
            onSave={handleSavePreset}
            onLoad={handleLoadPreset}
            compact
            theme={theme}
          />
        </div>
        
        {/* Motor de áudio */}
        <div className="mb-6">
          <AudioEngine
            bpm={metronomeEngine.bpm}
            sequence={metronomeEngine.sequence}
            currentStep={metronomeEngine.currentStep}
            isPlaying={metronomeEngine.isPlaying}
            masterVolume={0.8}
            compact
            theme={theme}
          />
        </div>
        
        {/* Rodapé da sidebar */}
        <div className="pt-6 border-t border-gray-800">
          <div className="text-xs text-gray-500">
            <p className="mb-2">Rhythm Trainer v1.0.0</p>
            <p>Desenvolvido para músicos de todos os níveis</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza conteúdo principal
  const renderMainContent = () => {
    return (
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {/* Header móvel */}
        <div className="lg:hidden flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <button
            onClick={mobileMenu.toggleMenu}
            className="p-2 rounded-lg hover:bg-gray-800"
            aria-label="Abrir menu"
            ref={mobileMenu.triggerRef}
          >
            <Menu size={24} className="text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <Music size={20} className="text-blue-400" />
            <h1 className="text-lg font-bold text-white">Rhythm Trainer</h1>
          </div>
          
          <button
            onClick={() => setShowAudioSettings(!showAudioSettings)}
            className="p-2 rounded-lg hover:bg-gray-800"
            aria-label="Configurações de áudio"
          >
            <Volume2 size={20} className="text-gray-400" />
          </button>
        </div>
        
        {/* Menu móvel */}
        {mobileMenu.isOpen && (
          <div
            ref={mobileMenu.menuRef}
            className="lg:hidden fixed inset-y-0 left-0 w-80 bg-gray-900 z-50 shadow-2xl p-6 overflow-y-auto"
            style={{ zIndex: mobileMenu.zIndex }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                onClick={mobileMenu.closeMenu}
                className="p-2 rounded-lg hover:bg-gray-800"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-6">
              <ModeSelector
                currentMode={appMode}
                onChange={setAppMode}
                compact
                theme={theme}
              />
              
              <ThemePicker
                currentTheme={theme}
                onChange={handleThemeChange}
                compact
                theme={theme}
              />
              
              <TimeSigPicker
                currentTimeSig={metronomeEngine.timeSignature}
                onChange={metronomeEngine.setTimeSignature}
                compact
                theme={theme}
              />
            </div>
          </div>
        )}
        
        {/* Overlay para menu móvel */}
        {mobileMenu.isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/70 z-40"
            onClick={mobileMenu.closeMenu}
          />
        )}
        
        {/* Configurações de áudio móvel */}
        {showAudioSettings && (
          <div className="lg:hidden mb-6">
            <AudioEngine
              bpm={metronomeEngine.bpm}
              sequence={metronomeEngine.sequence}
              currentStep={metronomeEngine.currentStep}
              isPlaying={metronomeEngine.isPlaying}
              compact={false}
              theme={theme}
            />
          </div>
        )}
        
        {/* Grade principal */}
        <div className="mb-8">
          <SubdivisionGrid
            sequence={metronomeEngine.sequence}
            currentStep={metronomeEngine.currentStep}
            isPlaying={metronomeEngine.isPlaying}
            bpm={metronomeEngine.bpm}
            timeSignature={metronomeEngine.timeSignature}
            onStepClick={metronomeEngine.toggleStepActive}
            onVolumeChange={metronomeEngine.updateStepVolume}
            onPlayPause={metronomeEngine.startPlayback}
            onPrevious={metronomeEngine.advanceManual}
            onNext={metronomeEngine.advanceStep}
            onReset={metronomeEngine.resetToDefault}
            theme={theme}
          />
        </div>
        
        {/* Controles de BPM e reprodução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <BpmDial
              bpm={metronomeEngine.bpm}
              onChange={metronomeEngine.setBpm}
              theme={theme}
            />
          </div>
          
          <div>
            <PlayModeToggle
              playMode={metronomeEngine.playMode}
              isPlaying={metronomeEngine.isPlaying}
              bpm={metronomeEngine.bpm}
              onPlayModeChange={metronomeEngine.setPlayMode}
              onPlayPause={metronomeEngine.startPlayback}
              onNext={metronomeEngine.advanceStep}
              onPrevious={metronomeEngine.advanceManual}
              onReset={metronomeEngine.resetToDefault}
              theme={theme}
            />
          </div>
        </div>
        
        {/* Features PRO expandidas (para desktop) */}
        {showProFeatures && !showSidebar && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <PermutationToggle
              enabled={metronomeEngine.permutationEnabled}
              isPlaying={metronomeEngine.isPlaying}
              currentPermutation={metronomeEngine.currentPermutationIndex + 1}
              totalPermutations={metronomeEngine.permutationSequences.length}
              permutationStart={metronomeEngine.permutationStart}
              permutationEnd={metronomeEngine.permutationEnd}
              currentCombination={{
                rows: metronomeEngine.subdivision,
                cols: metronomeEngine.subdivision,
              }}
              onToggle={metronomeEngine.setPermutationEnabled}
              onStartChange={metronomeEngine.setPermutationStart}
              onEndChange={metronomeEngine.setPermutationEnd}
              onPlayPause={() => {}}
              onNext={metronomeEngine.advancePermutation}
              onPrevious={() => {}}
              onReset={() => {}}
              theme={theme}
            />
            
            <GapToggle
              enabled={metronomeEngine.gapEnabled}
              gapDuration={500}
              gapPosition="after"
              isInGap={metronomeEngine.isInGap}
              currentCycle={metronomeEngine.measureCount}
              totalCycles={0}
              onToggle={metronomeEngine.setGapEnabled}
              onDurationChange={() => {}}
              onPositionChange={() => {}}
              onSkipGap={() => {}}
              onReset={() => {}}
              theme={theme}
            />
            
            <GhostModeToggle
              enabled={metronomeEngine.ghostModeEnabled}
              ghostProbability={0.3}
              ghostVolume={0.15}
              isActive={metronomeEngine.ghostModeEnabled}
              currentGhostNotes={metronomeEngine.sequence.filter(s => s.volume < 0.3).length}
              totalNotes={metronomeEngine.sequence.length}
              onToggle={metronomeEngine.setGhostModeEnabled}
              onProbabilityChange={() => {}}
              onVolumeChange={() => {}}
              onShuffle={() => {}}
              onReset={() => {}}
              theme={theme}
            />
          </div>
        )}
        
        {/* Gerenciador de presets expandido */}
        {!showSidebar && (
          <div className="mb-8">
            <PresetManager
              slots={firebaseSync.presets}
              currentSlot={1}
              user={firebaseSync.user}
              isSyncing={firebaseSync.isSyncing}
              onSave={handleSavePreset}
              onLoad={handleLoadPreset}
              onDelete={firebaseSync.deletePreset}
              onRename={firebaseSync.renamePreset}
              onExport={firebaseSync.exportPresets}
              onImport={firebaseSync.importPresets}
              onSync={firebaseSync.initializeAuth}
              theme={theme}
            />
          </div>
        )}
        
        {/* Motor de áudio expandido */}
        {!showSidebar && (
          <div className="mb-8">
            <AudioEngine
              bpm={metronomeEngine.bpm}
              sequence={metronomeEngine.sequence}
              currentStep={metronomeEngine.currentStep}
              isPlaying={metronomeEngine.isPlaying}
              masterVolume={0.8}
              latencyCompensation={25}
              onLatencyChange={() => {}}
              onVolumeChange={() => {}}
              showAdvanced
              theme={theme}
            />
          </div>
        )}
        
        {/* Barra de ferramentas inferior */}
        <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 flex gap-2 z-30">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 shadow-lg hover:scale-110 transition-transform"
            aria-label={showSidebar ? "Ocultar sidebar" : "Mostrar sidebar"}
          >
            <Settings size={20} className="text-white" />
          </button>
          
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-110 transition-transform"
            aria-label="Compartilhar configuração"
          >
            <Share2 size={20} className="text-white" />
          </button>
          
          <a
            href="https://github.com/seu-usuario/rhythm-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 shadow-lg hover:scale-110 transition-transform"
            aria-label="Ver código no GitHub"
          >
            <GitHub size={20} className="text-white" />
          </a>
        </div>
        
        {/* Indicador de modo atual */}
        <div className="fixed bottom-4 left-4 lg:bottom-8 lg:left-8">
          <div className={`px-4 py-2 rounded-full shadow-lg ${formatAppMode(appMode).bgColor} backdrop-blur-sm`}>
            <div className="flex items-center gap-2">
              {formatAppMode(appMode).icon === 'crown' ? (
                <Crown size={16} className={formatAppMode(appMode).color} />
              ) : formatAppMode(appMode).icon === 'users' ? (
                <Zap size={16} className={formatAppMode(appMode).color} />
              ) : (
                <Music size={16} className={formatAppMode(appMode).color} />
              )}
              <span className={`text-sm font-semibold ${formatAppMode(appMode).color}`}>
                {formatAppMode(appMode).label}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza overlay de loading
  const renderLoadingOverlay = () => {
    if (firebaseSync.isLoading) {
      return (
        <div className="fixed inset-0 bg-gray-900/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-white font-semibold">Carregando Rhythm Trainer...</div>
            <div className="text-gray-400 text-sm mt-2">Sincronizando presets</div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Aplica tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = THEMES[theme]?.body || 'bg-gray-950 text-white';
  }, [theme]);
  
  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {renderLoadingOverlay()}
      
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Conteúdo principal */}
      {renderMainContent()}
      
      {/* Estilos globais */}
      <style jsx global>{`
        :root {
          --theme-primary: ${THEMES[theme]?.primary || '#3B82F6'};
          --theme-secondary: ${THEMES[theme]?.secondary || '#8B5CF6'};
          --theme-accent: ${THEMES[theme]?.accent || '#EC4899'};
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          ${THEMES[theme]?.body || 'background: #0f172a; color: #ffffff;'}
          overflow: hidden;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--theme-primary);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--theme-accent);
        }
        
        /* Animações */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        /* Transições suaves */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default App;

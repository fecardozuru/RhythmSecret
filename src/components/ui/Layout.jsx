// /src/components/ui/Layout.jsx

import React from 'react';
import { useTheme } from '../../contexts';
import OfflineIndicator from '../pwa/OfflineIndicator';

/**
 * Layout principal do Rhythm Trainer
 * Organiza todos os componentes na tela com responsividade
 */
const Layout = ({ children }) => {
  const { currentTheme, themeClasses } = useTheme();

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-500`}>
      {/* Cabeçalho */}
      <header className={`
        fixed top-0 left-0 right-0 z-40
        px-4 py-3
        border-b backdrop-blur-xl
        ${themeClasses.header}
        transition-all duration-300
      `}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo e título */}
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl
              flex items-center justify-center
              ${themeClasses.primary}
              ${themeClasses.glow}
              transition-all duration-300
            `}>
              <span className="text-lg font-bold">
                ♪
              </span>
            </div>
            
            <div>
              <h1 className="text-xl font-bold">
                Rhythm Trainer
              </h1>
              <p className="text-xs opacity-75">
                Metrônomo inteligente para músicos
              </p>
            </div>
          </div>

          {/* Controles do cabeçalho */}
          <div className="flex items-center gap-4">
            {/* Indicador de conexão PWA */}
            <OfflineIndicator />
            
            {/* Indicador de modo PRO (se ativo) */}
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${themeClasses.secondary}
              transition-all duration-300
            `}>
              PRO Mode
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Grade de controles superiores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Coluna 1: BPM e modos */}
            <section className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full
                  ${themeClasses.primary}
                  animate-pulse
                `} />
                Tempo & Modo
              </h2>
              <div className="space-y-6">
                {/* Componentes serão injetados aqui */}
                {React.Children.toArray(children).find(child => 
                  child.props?.slot === 'bpm-controls'
                )}
              </div>
            </section>

            {/* Coluna 2: Compasso e subdivisões */}
            <section className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full
                  ${themeClasses.accent}
                  animate-pulse
                `} />
                Ritmo & Subdivisões
              </h2>
              <div className="space-y-6">
                {/* Componentes serão injetados aqui */}
                {React.Children.toArray(children).find(child => 
                  child.props?.slot === 'rhythm-controls'
                )}
              </div>
            </section>

            {/* Coluna 3: Temas e configurações */}
            <section className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full
                  ${themeClasses.highlight}
                  animate-pulse
                `} />
                Aparência & Configurações
              </h2>
              <div className="space-y-6">
                {/* Componentes serão injetados aqui */}
                {React.Children.toArray(children).find(child => 
                  child.props?.slot === 'theme-controls'
                )}
              </div>
            </section>
          </div>

          {/* Grade principal de volumes */}
          <div className="mb-8">
            <div className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className={`
                    w-2 h-2 rounded-full
                    ${themeClasses.primary}
                    animate-pulse
                  `} />
                  Grade de Volumes
                  <span className="text-xs font-normal opacity-75 ml-2">
                    Clique e arraste para ajustar
                  </span>
                </h2>
                
                {/* Controles da grade */}
                <div className="flex items-center gap-3">
                  {React.Children.toArray(children).find(child => 
                    child.props?.slot === 'grid-controls'
                  )}
                </div>
              </div>
              
              {/* Grade será injetada aqui */}
              {React.Children.toArray(children).find(child => 
                child.props?.slot === 'volume-grid'
              )}
            </div>
          </div>

          {/* Controles PRO e Loop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna PRO Features */}
            <section className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full
                  ${themeClasses.pro}
                  animate-pulse
                `} />
                Recursos PRO
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 ml-2">
                  EXCLUSIVO
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Componentes PRO serão injetados aqui */}
                {React.Children.toArray(children).find(child => 
                  child.props?.slot === 'pro-features'
                )}
              </div>
            </section>

            {/* Coluna Loop e Presets */}
            <section className={`
              p-6 rounded-2xl
              ${themeClasses.surface}
              ${themeClasses.border}
              backdrop-blur-sm
              transition-all duration-300
            `}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full
                  ${themeClasses.highlight}
                  animate-pulse
                `} />
                Loop & Presets
              </h2>
              <div className="space-y-6">
                {/* Componentes serão injetados aqui */}
                {React.Children.toArray(children).find(child => 
                  child.props?.slot === 'loop-presets'
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className={`
        px-4 py-6
        border-t backdrop-blur-xl
        ${themeClasses.footer}
        transition-all duration-300
      `}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm opacity-75">
              © 2024 Rhythm Trainer • Feito para músicos por músicos
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <button className="opacity-75 hover:opacity-100 transition-opacity">
                Tutorial
              </button>
              <button className="opacity-75 hover:opacity-100 transition-opacity">
                Sobre
              </button>
              <button className="opacity-75 hover:opacity-100 transition-opacity">
                Suporte
              </button>
              <div className="flex items-center gap-2">
                <span className="opacity-75">Versão:</span>
                <span className="px-2 py-1 rounded text-xs bg-white/10">
                  1.0.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Indicador de compasso ativo (flutuante) */}
      <div className={`
        fixed bottom-6 right-6
        w-16 h-16 rounded-full
        flex items-center justify-center
        ${themeClasses.primary}
        ${themeClasses.glow}
        shadow-2xl
        transition-all duration-300
        animate-pulse
      `}>
        <span className="text-lg font-bold">
          4/4
        </span>
      </div>
    </div>
  );
};

// Slots disponíveis para organização dos componentes
Layout.Slot = ({ slot, children }) => {
  return React.cloneElement(children, { slot });
};

export default Layout;

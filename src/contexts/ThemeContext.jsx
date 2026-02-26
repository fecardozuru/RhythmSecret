import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../constants/themes';

/**
 * ThemeContext — gerencia o tema visual ativo da aplicação.
  *
   * Persiste a escolha no localStorage e aplica atributos CSS ao <html>.
    * Separado do AppContext para evitar re-renders desnecessários nos
     * componentes que apenas consomem BPM / estado de áudio.
      */

      const ThemeContext = createContext(null);

      const STORAGE_KEY = 'rhythmsecret-theme';
      const DEFAULT_THEME = 'INSTAGRAM';

      export function ThemeProvider({ children }) {
        const [themeName, setThemeName] = useState(() => {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
              });

                // Aplica o tema no elemento <html> como atributo data-theme
                  useEffect(() => {
                      document.documentElement.setAttribute('data-theme', themeName);
                          localStorage.setItem(STORAGE_KEY, themeName);
                            }, [themeName]);

                              const currentTheme = THEMES?.[themeName] ?? THEMES[DEFAULT_THEME];

                              const themeClasses = {
                                background: currentTheme?.colors?.bg ?? 'bg-black',
                                text: currentTheme?.colors?.text ?? 'text-white',
                                primary: currentTheme?.colors?.barFilled ?? 'bg-pink-500',
                                accent: currentTheme?.colors?.accent ?? 'text-pink-400',
                                highlight: currentTheme?.colors?.barActive ?? 'bg-pink-500',
                                secondary: currentTheme?.colors?.container ?? 'bg-white/10',
                                surface: currentTheme?.colors?.container ?? 'bg-white/5',
                                border: 'border border-white/10',
                                header: 'bg-black/20 border-white/10',
                                footer: 'bg-black/20 border-white/10',
                                glow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
                                pro: 'bg-amber-500'
                              };

                                const value = { themeName, setThemeName, currentTheme, themeClasses, themes: THEMES };

                                  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
                                  }

                                  export function useTheme() {
                                    const ctx = useContext(ThemeContext);
                                      if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
                                        return ctx;
                                        }

                                        export default ThemeContext;
                                        

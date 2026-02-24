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
      const DEFAULT_THEME = 'dark';

      export function ThemeProvider({ children }) {
        const [themeName, setThemeName] = useState(() => {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
              });

                // Aplica o tema no elemento <html> como atributo data-theme
                  useEffect(() => {
                      document.documentElement.setAttribute('data-theme', themeName);
                          localStorage.setItem(STORAGE_KEY, themeName);
                            }, [themeName]);

                              const currentTheme = THEMES?.[themeName] ?? {};

                                const value = { themeName, setThemeName, currentTheme, themes: THEMES };

                                  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
                                  }

                                  export function useTheme() {
                                    const ctx = useContext(ThemeContext);
                                      if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
                                        return ctx;
                                        }

                                        export default ThemeContext;
                                        
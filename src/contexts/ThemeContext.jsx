import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { THEMES } from '../constants/themes';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'rhythmsecret-theme';
const DEFAULT_THEME = 'TIKTOK';

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEMES[saved] ? saved : DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(STORAGE_KEY, themeName);
  }, [themeName]);

  const currentTheme = THEMES?.[themeName] ?? THEMES[DEFAULT_THEME];

  const themeClasses = useMemo(() => {
    const colors = currentTheme?.colors ?? {};

    return {
      background: colors.bg ?? 'bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000]',
      text: colors.text ?? 'text-white',
      accent: colors.accent ?? 'text-[#00f2ea]',
      accentText: colors.accent ?? 'text-[#00f2ea]',
      primary: colors.barFilled ?? 'bg-[#00f2ea]',
      highlight: colors.barActive ?? 'bg-[#00f2ea] shadow-[0_0_20px_rgba(0,242,234,0.8)]',
      secondary: 'bg-white/10 border border-white/10',
      surface: 'bg-black/30',
      border: 'border border-white/10',
      header: 'bg-black/40 border-white/10',
      footer: 'bg-black/30 border-white/10',
      glow: 'shadow-[0_0_15px_rgba(255,255,255,0.25)]',
      pro: 'bg-yellow-500',
    };
  }, [currentTheme]);

  const value = useMemo(
    () => ({ themeName, setThemeName, currentTheme, themeClasses, themes: THEMES }),
    [themeName, currentTheme, themeClasses]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

export default ThemeContext;

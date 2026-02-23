/* ================================================================================
🎨 TAILWIND CONFIGURATION - V2026.56
================================================================================
CHANGELOG:
1. Configuração personalizada de cores e animações
2. Otimizado para performance com PurgeCSS
3. Temas customizados para o Rhythm Secret
================================================================================ */

/** @type {import('tailwindcss').Config} */
export default {
  // Arquivos que serão processados pelo Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html"
  ],
  
  theme: {
    extend: {
      // Cores personalizadas do app
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          500: '#ec4899',
          600: '#db2777',
        },
        // Cores dos temas específicos
        instagram: '#E1306C',
        facebook: '#1877F2',
        tiktok: '#00f2ea',
        gold: '#ffd700'
      },
      
      // Animações personalizadas
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      
      // Keyframes para animações personalizadas
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255,215,0,0.2)',
            opacity: 1
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255,215,0,0.6)',
            opacity: 0.8
          },
        }
      },
      
      // Efeitos de desfoque
      backdropBlur: {
        xs: '2px',
      },
      
      // Fontes personalizadas
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      
      // Transições personalizadas
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  
  plugins: [],
  
  // Otimizações para produção
  future: {
    hoverOnlyWhenSupported: true,
  },
  
  // Modo escuro baseado em classe (para temas customizados)
  darkMode: 'class',
}

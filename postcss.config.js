/* ================================================================================
📦 POSTCSS CONFIGURATION - V2026.56
================================================================================
CHANGELOG:
1. Configuração padrão para Tailwind CSS
2. Autoprefixer para compatibilidade cross-browser
3. Otimizado para produção
================================================================================ */

export default {
  plugins: {
    // Tailwind CSS para estilização utilitária
    tailwindcss: {},
    
    // Autoprefixer adiciona vendor prefixes automaticamente
    autoprefixer: {},
    
    // Em produção, podemos adicionar cssnano para minificação
    ...(process.env.NODE_ENV === 'production' 
      ? { cssnano: { preset: 'default' } } 
      : {})
  },
}

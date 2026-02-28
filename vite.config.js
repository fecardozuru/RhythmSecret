/* ================================================================================
⚙️ VITE CONFIGURATION - V2026.56
================================================================================
CHANGELOG:
1. Configuração otimizada para build de produção
2. Aliases para imports mais limpos (@/components, @/services, etc)
3. Suporte a PWA e variáveis de ambiente
4. Fix: switched minify from 'terser' to 'esbuild' (Vite built-in)
================================================================================ */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    // Base URL para assets em produção (relativo para funcionar em subpastas)
                              base: './',

    // Plugins do Vite
    plugins: [
          react({
                  // Otimizações para React
                      include: '**/*.{jsx,tsx}',
                  babel: {
                            plugins: [
                                        ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
                                      ]
                  }
          })
        ],

    // Configuração de resolução de módulos
    resolve: {
          alias: {
                  // Aliases para imports mais limpos
            '@': path.resolve(__dirname, './src'),
                  '@components': path.resolve(__dirname, './src/components'),
                  '@hooks': path.resolve(__dirname, './src/hooks'),
                  '@utils': path.resolve(__dirname, './src/utils'),
                  '@services': path.resolve(__dirname, './src/services')
          },
          extensions: ['.js', '.jsx', '.json']
    },

    // Configuração de build para produção
    build: {
          outDir: 'dist', // Pasta de saída
          sourcemap: false, // Desativa sourcemaps em produção
          minify: 'esbuild', // Minificação com esbuild (built-in do Vite, não requer dependência extra)
          rollupOptions: {
                  input: {
                            main: path.resolve(__dirname, 'index.html')
                  },
                  output: {
                            // Separa código de vendor para melhor cache
                    manualChunks: {
                                vendor: ['react', 'react-dom'],
                                firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
                    }
                  }
          }
    },

    // Servidor de desenvolvimento
    server: {
          port: 3000, // Porta padrão
          host: true, // Permite acesso pela rede local
          open: true // Abre browser automaticamente
    },

    // Configuração CSS
    css: {
          postcss: './postcss.config.js' // Configuração do PostCSS (Tailwind)
    },

    // Otimização de dependências
    optimizeDeps: {
          include: ['react', 'react-dom', 'lucide-react', 'firebase/app']
    }
});

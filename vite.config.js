import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Diretório base para a aplicação
  base: './',
  
  // Configurações do servidor de desenvolvimento
  server: {
    port: 3000,
    host: true,
    open: true,
    hmr: {
      overlay: true
    }
  },
  
  // Configurações do preview
  preview: {
    port: 4173,
    host: true
  },
  
  // Plugins
  plugins: [
    // Plugin React
    react({
      // Configurações do React Refresh
      include: '**/*.{jsx,tsx,js,ts}',
      
      // Fast Refresh
      fastRefresh: true,
      
      // Babel configuration for JSX
      babel: {
        presets: ['@babel/preset-react'],
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    
    // Plugin PWA
    VitePWA({
      // Configurações básicas
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // Manifest
      manifest: {
        name: 'RhythmSecret',
        short_name: 'RhythmSecret',
        description: 'Advanced Rhythm Training Metronome',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        id: '/',
        
        icons: [
          {
            src: 'icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        
        // Screenshots for app stores
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop Interface'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile Interface'
          }
        ],
        
        // Features
        categories: ['music', 'education', 'productivity'],
        
        // Shortcuts
        shortcuts: [
          {
            name: 'Start Metronome',
            short_name: 'Start',
            description: 'Start the metronome',
            url: '/?start=true',
            icons: [{ src: 'icon-start.png', sizes: '96x96' }]
          },
          {
            name: 'Practice Mode',
            short_name: 'Practice',
            description: 'Enter practice mode',
            url: '/?mode=practice',
            icons: [{ src: 'icon-practice.png', sizes: '96x96' }]
          }
        ]
      },
      
      // Workbox configuration
      workbox: {
        // Cache strategies
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/apis\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-apis-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        
        // Skip waiting for service worker
        skipWaiting: true,
        clientsClaim: true,
        
        // Maximum file size to cache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        
        // Cleanup outdated caches
        cleanupOutdatedCaches: true,
        
        // Source map support
        sourcemap: false
      },
      
      // Dev options
      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: false,
        type: 'module'
      },
      
      // Strategies for different file types
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'robots.txt'
      ],
      
      // PWA features
      includeManifestIcons: true,
      disable: false,
      
      // PWA mode
      mode: 'production'
    })
  ],
  
  // Resolução
  resolve: {
    // Aliases para importações
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets')
    },
    
    // Extensões suportadas
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  
  // Configurações de build
  build: {
    // Diretório de saída
    outDir: 'dist',
    
    // Configurações do rollup
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      
      output: {
        // Hashing para cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
        
        // Tree shaking
        manualChunks(id) {
          // Separa vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide')) {
              return 'vendor-icons';
            }
            return 'vendor-other';
          }
        }
      }
    },
    
    // Minificação
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    },
    
    // Sourcemaps (desativados em produção para melhor performance)
    sourcemap: false,
    
    // Configurações de assets
    assetsInlineLimit: 4096, // 4KB
    
    // Report de bundle size
    reportCompressedSize: true,
    
    // Chunk size warning
    chunkSizeWarningLimit: 1000, // 1MB
    
    // Configurações CSS
    cssCodeSplit: true,
    cssMinify: true,
    
    // Configurações de target
    target: 'es2020',
    
    // Polyfills
    polyfillModulePreload: false,
    
    // Module preload
    modulePreload: {
      polyfill: false
    }
  },
  
  // Configurações de CSS
  css: {
    // PostCSS configuration
    postcss: './postcss.config.js',
    
    // CSS modules
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
      localsConvention: 'camelCase'
    },
    
    // Preprocessors
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`
      }
    },
    
    // Dev sourcemap
    devSourcemap: true
  },
  
  // Configurações de preview
  preview: {
    port: 4173,
    host: true,
    open: true,
    
    // CORS
    cors: true,
    
    // Headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  
  // Configurações de ambiente
  envDir: './',
  
  // Configurações de logging
  logLevel: 'info',
  
  // Configurações de cache
  cacheDir: './node_modules/.vite',
  
  // Configurações de esbuild
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
    jsxImportSource: 'react',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    target: 'es2020'
  },
  
  // Configurações de workers
  worker: {
    format: 'es',
    plugins: []
  },
  
  // Configurações de depoptimizer
  optimizeDeps: {
    // Entradas a serem otimizadas
    entries: [
      'src/main.jsx',
      'src/App.jsx'
    ],
    
    // Incluir dependências
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ],
    
    // Excluir dependências
    exclude: [],
    
    // Force pre-bundling
    force: false,
    
    // Disable dedupe
    dedupe: [],
    
    // Esbuild options
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
});

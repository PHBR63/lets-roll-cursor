import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Evitar referências a 'module' e 'exports' do CommonJS
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  plugins: [
    react(),
    // Visualizador de bundle (apenas em build)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Forçar resolução do React do node_modules da raiz (workspace)
      'react': path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
      // Forçar resolução do react-window do node_modules da raiz
      'react-window': path.resolve(__dirname, '../node_modules/react-window/dist/react-window.js'),
    },
    // Garantir versão única do React para evitar problemas de resolução
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
  build: {
    // Otimizações de build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    commonjsOptions: {
      // Incluir dependências específicas que podem ter CommonJS
      include: [
        /react-window/,
        /react/,
        /react-dom/,
        /react-router/,
        /@supabase/,
        /@radix-ui/,
      ],
      transformMixedEsModules: true,
      // Forçar transformação de CommonJS para ESM
      strictRequires: true,
      // Converter require para import
      requireReturnsDefault: 'auto',
      // Garantir que module.exports seja transformado
      defaultIsModuleExports: true,
    },
    rollupOptions: {
      external: [],
      output: {
        // Garantir formato ESM
        format: 'es',
        // Evitar uso de 'module' e 'exports'
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
        // Garantir que não use CommonJS
        interop: 'auto',
        // Garantir que exports seja tratado corretamente
        exports: 'named',
        // Code splitting manual para melhor cache
        // NOTA: React e React-DOM não devem ser separados em chunks para evitar problemas de resolução
        // NOTA: Radix UI mantido junto para evitar problemas de transformação CommonJS
        manualChunks: (id) => {
          // Separar apenas bibliotecas grandes e bem testadas que são ESM puro
          if (id.includes('node_modules')) {
            // Separar apenas bibliotecas que sabemos que são ESM puro
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            // Manter todas as outras dependências (incluindo Radix UI) em um único chunk vendor
            // Isso garante que o CommonJS seja transformado corretamente antes da separação
            // e evita o erro "module is not defined"
            return 'vendor'
          }
        },
        // Nomes de arquivos mais legíveis
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Limites de tamanho (warnings)
    chunkSizeWarningLimit: 1000,
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime', // Importante para SWC
      'react-router-dom',
      '@supabase/supabase-js',
      'react-window',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    // Forçar ESM para dependências
    esbuildOptions: {
      format: 'esm',
    },
  },
})

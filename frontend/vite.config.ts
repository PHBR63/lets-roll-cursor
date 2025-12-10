import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
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
      // Transforma require em import para todas as dependências
      transformMixedEsModules: true,
      include: [/node_modules/], // Garante que olhe para todas dependências
      esmExternals: true,
    },
    rollupOptions: {
      external: [],
      output: {
        // Code splitting manual para melhor cache
        // NOTA: React e React-DOM não devem ser separados em chunks para evitar problemas de resolução
        manualChunks: (id) => {
          // Vendor chunks (sem React para evitar problemas de resolução)
          if (id.includes('node_modules')) {
            // IMPORTANTE: NÃO separar Supabase em chunk isolado
            // Isso causa problemas de ordem de carregamento (ReferenceError: Cannot access 'oe' before initialization)
            // O Supabase deve ficar junto com outros vendors para garantir ordem correta
            
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor'
            }
            // Animation library
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            // Utilities
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils-vendor'
            }
            // Todos os outros node_modules (incluindo Supabase) vão para 'vendor'
            // Isso garante ordem correta de carregamento e evita erros de inicialização
            return 'vendor'
          }
        },
        // Nomes de arquivos mais legíveis
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Formato ES modules para melhor tree-shaking e compatibilidade
        format: 'es',
      },
    },
    // Limites de tamanho (warnings) - reduzido para forçar otimização
    chunkSizeWarningLimit: 500,
    // Tree shaking otimizado
    treeshake: {
      moduleSideEffects: false,
    },
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
      'tailwindcss-animate',
      '@emotion/is-prop-valid', // Força a pré-conversão dessa lib
      'scheduler', // Força a pré-conversão dessa lib
    ],
    esbuildOptions: {
      // Garantir que CommonJS seja convertido para ES modules
      target: 'esnext',
    },
  },
})

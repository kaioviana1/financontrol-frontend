import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    /* ── Path aliases ──────────────────────────────── */
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    /* ── Dev server ────────────────────────────────── */
    server: {
      port: 5173,
      strictPort: false,
      open: false,
      proxy: {
        // Proxy /api to the backend in dev — avoids CORS issues
        '/api': {
          target: (env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, ''),
          changeOrigin: true,
          secure: false,
        },
      },
    },

    /* ── Preview server ────────────────────────────── */
    preview: {
      port: 4173,
      strictPort: false,
    },

    /* ── Build ─────────────────────────────────────── */
    build: {
      outDir: 'dist',
      sourcemap: false,          // Never expose source maps in production
      chunkSizeWarningLimit: 700,

      rollupOptions: {
        output: {
          // Split chunks by vendor for better long-term caching
          manualChunks(id) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('recharts'))      return 'vendor-charts';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('zustand'))       return 'vendor-state';
            if (id.includes('react-icons'))   return 'vendor-icons';
            if (id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-http';
            if (id.includes('node_modules'))  return 'vendor';
          },
          // Organised output folders
          chunkFileNames:  'assets/js/[name]-[hash].js',
          entryFileNames:  'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|svg|gif|webp|ico)$/i.test(name ?? '')) return 'assets/img/[name]-[hash].[ext]';
            if (/\.(woff2?|ttf|eot)$/i.test(name ?? ''))              return 'assets/fonts/[name]-[hash].[ext]';
            if (/\.css$/i.test(name ?? ''))                           return 'assets/css/[name]-[hash].[ext]';
            return 'assets/[ext]/[name]-[hash].[ext]';
          },
        },
      },
    },

    /* ── Dependency pre-bundling ───────────────────── */
    optimizeDeps: {
      include: [
        'react', 'react-dom', 'react-router-dom',
        'axios', 'zustand', 'clsx', 'tailwind-merge',
      ],
    },

    /* ── Define global constants ───────────────────── */
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
    },
  };
});

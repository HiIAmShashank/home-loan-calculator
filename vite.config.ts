import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Must precede the React plugin for autoCodeSplitting to transform route files.
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // Charting stack (recharts + its d3/victory/decimal deps) is the heaviest
          // dependency and is only used on charted routes — keep it out of the entry chunk.
          if (
            /[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|decimal\.js-light)[\\/]/.test(
              id,
            )
          ) {
            return 'charts'
          }
          if (id.includes('@tanstack')) return 'router'
          if (id.includes('react-icons')) return 'icons'
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          ) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
})

import { defineConfig } from 'vitest/config'
import path from 'path'

// Pure calculation modules only — no DOM environment needed.
// The `@/` alias mirrors vite.config.ts so tests can import via `@/lib/...`.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})

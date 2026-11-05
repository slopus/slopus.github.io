import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  // The Grain Gradient's worker (src/grainGradientWorker.ts) is a module, as it is started.
  worker: { format: 'es' },
  build: {
    // scripts/generate-static-routes.mjs reads it to preload each page's chunk and styles.
    manifest: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/testSetup.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
}))

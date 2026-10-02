import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    rollupOptions: {
      // The prerender build (src/prerender.tsx) leaves dependencies external, so it has nothing to split.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              markdown: ['react-markdown', 'remark-gfm'],
            },
          },
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
}))

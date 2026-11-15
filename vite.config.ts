import { readdirSync, readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { webpSize } from './src/webpSize'

const DOC_CAPTURES = 'virtual:doc-captures'
const DOC_CAPTURES_DIR = 'public/img/docs'

/** The pixel size of every docs capture, so a page shows each at half of it (DESIGN.md, Screenshots), and of the clips' stills. */
function docCaptures(): Plugin {
  return {
    name: 'doc-captures',
    resolveId: (id) => id === DOC_CAPTURES ? `\0${DOC_CAPTURES}` : undefined,
    load(id) {
      if (id !== `\0${DOC_CAPTURES}`) return
      // The docs captures, and the stills beside the docs' clips (/video/<name>/still.webp, poster.webp).
      const files = [
        ...readdirSync(DOC_CAPTURES_DIR).map((file) => `${DOC_CAPTURES_DIR}/${file}`),
        ...readdirSync('public/video', { recursive: true, encoding: 'utf8' }).map((file) => `public/video/${file}`),
      ].filter((file) => file.endsWith('.webp'))
      const sizes = Object.fromEntries(files.map((file) => [file.slice('public'.length), webpSize(readFileSync(file))]))
      return `export default ${JSON.stringify(sizes)}`
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), docCaptures()],
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

import { readdirSync, readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { imageSize } from './src/imageSize'

const DOC_CAPTURES = 'virtual:doc-captures'
const DOC_CAPTURES_DIR = 'public/img/docs'

/** The pixel size of every docs capture, so a page shows each at half of it (DESIGN.md, Screenshots). */
function docCaptures(): Plugin {
  return {
    name: 'doc-captures',
    resolveId: (id) => id === DOC_CAPTURES ? `\0${DOC_CAPTURES}` : undefined,
    load(id) {
      if (id !== `\0${DOC_CAPTURES}`) return
      // The docs captures (WebP), and in tests the stills from the capture script too (AVIF), which
      // pages size from their manifest (src/DocStill.tsx) and src/docImages.test.ts checks against it.
      const files = readdirSync(DOC_CAPTURES_DIR).map((file) => `${DOC_CAPTURES_DIR}/${file}`)
        .filter((file) => (process.env.VITEST ? /\.(webp|avif)$/ : /\.webp$/).test(file))
      const sizes = Object.fromEntries(files.map((file) => [file.slice('public'.length), imageSize(readFileSync(file))]))
      return `export default ${JSON.stringify(sizes)}`
    },
  }
}

// What the site reads of the capture script's manifests (src/DocStill.tsx, src/DocClip.tsx); the
// rest (sizes in bytes and pixels, placement the tests check, the phone cut's alt) stays for tests.
const CUT_FIELDS = ['files', 'alt', 'displayWidth', 'displayHeight', 'crop', 'real', 'divider', 'fade', 'edge', 'needsWidth', 'chrome', 'scale', 'minDisplayWidth', 'fadeCss']

/** Ships src/docStills.json and src/docClips.json with only the fields the pages read. */
function docManifests(): Plugin {
  return {
    name: 'doc-manifests',
    enforce: 'pre',
    transform(code, id) {
      if (process.env.VITEST || !/\/src\/doc(Stills|Clips)\.json$/.test(id)) return
      const pick = (cut: Record<string, unknown> | null | undefined, alt: boolean) => cut && Object.fromEntries(CUT_FIELDS
        .filter((field) => field in cut && (alt || field !== 'alt')).map((field) => [field, cut[field]]))
      const manifest = JSON.parse(code) as Record<string, { desktop: Record<string, unknown>; phone?: Record<string, unknown> | null }>
      // A page shows the desktop cut's alt on either cut.
      // The presets (`_presets`) are for the tests.
      return JSON.stringify(Object.fromEntries(Object.entries(manifest).filter(([name]) => !name.startsWith('_')).map(([name, { desktop, phone }]) =>
        [name, { desktop: pick(desktop, true), ...(phone !== undefined && { phone: pick(phone, false) }) }])))
    },
  }
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), docCaptures(), docManifests()],
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

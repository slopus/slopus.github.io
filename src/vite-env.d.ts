/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project key, set by .github/workflows/deploy-pages.yml; unset locally. */
  readonly VITE_POSTHOG_KEY?: string
}

declare module 'virtual:doc-captures' {
  /** Pixel width and height of every capture in public/img/docs/ and every still under public/video/, read at build time (vite.config.ts). */
  const sizes: Record<string, [number, number]>
  export default sizes
}

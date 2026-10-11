/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project key, set by .github/workflows/deploy-pages.yml; unset locally. */
  readonly VITE_POSTHOG_KEY?: string
}

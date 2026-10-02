import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Router } from './Router'
import './style.css'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Could not find the app root.')
}

const app = (
  <StrictMode>
    <Router />
  </StrictMode>
)

// Prerendered routes (see src/prerender.tsx) ship their markup; adopt it instead of rendering twice.
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}

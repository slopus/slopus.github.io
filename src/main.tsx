import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Router } from './Router'
import './style.css'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Could not find the app root.')
}

createRoot(root).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
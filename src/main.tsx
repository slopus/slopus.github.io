import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Could not find the app root.')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
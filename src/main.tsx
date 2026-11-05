import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { preparePath, Router } from './Router'
import { startAnalytics } from './analytics'
import './style.css'
import './site-theme.css'

const root = document.querySelector<HTMLDivElement>('#app')

if (!root) {
  throw new Error('Could not find the app root.')
}

const app = (
  <StrictMode>
    <Router />
  </StrictMode>
)

// Browser translators replace the page's text nodes with their own (Google Translate wraps
// them in <font>). React still holds the originals, so removing one or inserting next to one
// throws NotFoundError and unmounts the whole page. Remove a moved node from wherever it is,
// and append when the node to insert before was moved. src/Router.tsx loads the next page from
// the server on a translated page, so this only has to keep the current one alive.
// https://github.com/facebook/react/issues/11538
const removeChild = Node.prototype.removeChild
Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
  if (child.parentNode !== this) {
    child.parentNode?.removeChild(child)
    return child
  }
  return removeChild.call(this, child) as T
}
const insertBefore = Node.prototype.insertBefore
Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, before: Node | null): T {
  if (before && before.parentNode !== this) return insertBefore.call(this, node, null) as T
  return insertBefore.call(this, node, before) as T
}

// Prerendered routes (see src/prerender.tsx) ship their markup; adopt it instead of rendering twice.
// Every page but the homepage first loads its chunk (src/sitePages.ts), which its served HTML
// already preloads.
void preparePath(window.location.pathname).then(() => {
  if (root.hasChildNodes()) {
    hydrateRoot(root, app)
  } else {
    createRoot(root).render(app)
  }
})

startAnalytics()

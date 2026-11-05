import { setDocumentSources } from './documents'

/**
 * Every docs and legal page's text, bundled with the pages that show it (src/sitePages.ts), not
 * with the homepage. Loading this module registers it with src/documents.ts.
 */
setDocumentSources({
  documents: import.meta.glob(['/content/docs/**/*.mdx', '/content/desktop/**/*.mdx'], {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  legal: import.meta.glob('/content/legal/**/*.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>,
  thesis: Object.values(import.meta.glob('/content/thesis.md', {
    eager: true,
    import: 'default',
    query: '?raw',
  }) as Record<string, string>)[0] ?? '',
})

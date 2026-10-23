interface RecipeManifest {
  repository: string
  revision: string
  files: Array<{ route: string; source: string; target: string; sha256: string }>
}

export const recipeSources = Object.values(import.meta.glob('/content/desktop/recepies/sources.json', {
  eager: true,
  import: 'default',
}))[0] as RecipeManifest

/** The happy-agent file a recipe page is copied from, at the pinned revision. */
export function recipeSource(route: string) {
  const recipe = recipeSources.files.find((file) => file.route === route)
  if (!recipe) return undefined
  return {
    path: recipe.source,
    revision: recipeSources.revision.slice(0, 9),
    href: `${recipeSources.repository}/blob/${recipeSources.revision}/${recipe.source}`,
  }
}

/** Resolve source-relative links without rewriting the quoted recipe's Markdown. */
export function recipeHref(route: string, href: string | undefined) {
  if (!href || href.startsWith('#') || href.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href
  const recipe = recipeSources.files.find((file) => file.route === route)
  if (!recipe) return href
  const base = `${recipeSources.repository}/blob/${recipeSources.revision}/`
  const target = new URL(href, `${base}${recipe.source}`)
  const linkedRecipe = recipeSources.files.find((file) => `${base}${file.source}` === `${target.origin}${target.pathname}`)
  return linkedRecipe ? `/${linkedRecipe.route}/${target.search}${target.hash}` : target.href
}
import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'

export async function getPosts() {
  const { directories } = normalizePages({
    list: await getPageMap('/blog'),
    route: '/blog'
  })

  return directories
    .filter(post => post.name !== 'page')
    .sort((a, b) => {
      const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0
      const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0
      return dateB - dateA
    })
}

export async function getTags() {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter?.tags || [])
  return tags
}

import { normalizePages } from 'nextra/normalize-pages'
import { getPageMap } from 'nextra/page-map'
import type { RawBlogPost, BlogPost } from '../../types/blog'

export async function getPosts(): Promise<BlogPost[]> {
  const { directories } = normalizePages({
    list: await getPageMap('/blog'),
    route: '/blog'
  })

  return directories
    .filter(post => post.name !== 'page')
    .map(post => ({
      ...post,
      frontMatter: post.frontMatter || {}
    }))
    .sort((a, b) => {
      const dateA = a.frontMatter?.date ? new Date(a.frontMatter.date).getTime() : 0
      const dateB = b.frontMatter?.date ? new Date(b.frontMatter.date).getTime() : 0
      return dateB - dateA
    })
}

export async function getTags(): Promise<string[]> {
  const posts = await getPosts()
  const tags = posts.flatMap(post => post.frontMatter?.tags || [])
  return tags
}

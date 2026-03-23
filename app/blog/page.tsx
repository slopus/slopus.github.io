import type { Metadata } from 'next'
import Link from 'next/link'
import { PostCard } from 'nextra-theme-blog'
import { getPosts, getTags } from './get-posts'
import type { TagCount, PostCardData } from '../../types/blog'

const BLOG_TITLE = 'Blog'

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: 'Articles about Happy, Claude Code workflows, distribution, and practical engineering.',
  alternates: {
    canonical: '/blog/',
  },
  openGraph: {
    url: '/blog/',
  },
}

export default async function BlogIndexPage() {
  const tags = await getTags()
  const posts = await getPosts()
  const allTags: TagCount = {}

  for (const tag of tags) {
    allTags[tag] = (allTags[tag] ?? 0) + 1
  }

  return (
    <div data-pagefind-ignore="all">
      <h1>{BLOG_TITLE}</h1>
      {Object.keys(allTags).length > 0 && (
        <div
          className="not-prose"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '2rem' }}
        >
          {Object.entries(allTags).map(([tag, count]) => (
            <Link
              key={tag}
              href={`/blog/tags/${tag}`}
              className="nextra-tag"
            >
              {tag} ({count})
            </Link>
          ))}
        </div>
      )}
      {posts.map(post => {
        // Transform blog post data to match PostCard component expectations
        // PostCard from nextra-theme-blog expects frontMatter to be BlogMetadata
        // (only title and description), not our extended frontMatter with date, tags, etc.
        const postCardData: PostCardData = {
          ...post,
          frontMatter: {
            title: post.frontMatter.title || post.name,
            description: post.frontMatter.description
          }
        }
        return (
          <PostCard 
            key={post.route} 
            post={postCardData} 
          />
        )
      })}
    </div>
  )
}

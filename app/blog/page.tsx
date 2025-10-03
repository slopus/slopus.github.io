import Link from 'next/link'
import { PostCard } from 'nextra-theme-blog'
import { getPosts, getTags } from './get-posts'

export const metadata = {
  title: 'Blog'
}

export default async function BlogIndexPage() {
  const tags = await getTags()
  const posts = await getPosts()
  const allTags = Object.create(null)

  for (const tag of tags) {
    allTags[tag] ??= 0
    allTags[tag] += 1
  }

  return (
    <div data-pagefind-ignore="all">
      <h1>{metadata.title}</h1>
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
      {posts.map(post => (
        <PostCard key={post.route} post={post} />
      ))}
    </div>
  )
}

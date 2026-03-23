import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from './get-posts'

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
  const posts = await getPosts()

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {BLOG_TITLE}
        </h1>
        <p className="mt-3 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Articles about Happy, Claude Code workflows, distribution, and practical engineering.
        </p>
      </header>

      <div className="space-y-6" data-pagefind-ignore="all">
        {posts
          .filter(post => post.route !== '/blog')
          .map(post => {
            const title = post.frontMatter.title || post.name
            const description = post.frontMatter.description || ''
            const date = post.frontMatter.date
              ? new Intl.DateTimeFormat('en', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(post.frontMatter.date))
              : null

            return (
              <article
                key={post.route}
                className="rounded-2xl border border-slate-200 p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              >
                {date && (
                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    {date}
                  </p>
                )}
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  <Link href={`${post.route}/`} className="hover:text-slate-700 dark:hover:text-slate-300">
                    {title}
                  </Link>
                </h2>
                {description && (
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                )}
                <div className="mt-5">
                  <Link
                    href={`${post.route}/`}
                    className="text-sm font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            )
          })}
      </div>
    </main>
  )
}

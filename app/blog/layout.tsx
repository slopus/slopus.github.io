import { Layout } from 'nextra-theme-blog'
import 'nextra-theme-blog/style.css'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

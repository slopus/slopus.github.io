import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css' // Required!

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  //console.log(getPageMap())
  const pageMap = await getPageMap('/docs')
  
  return (
    <Layout
      //banner={<Banner storageKey="docs-banner">Your banner content</Banner>}
      navbar={
        <Navbar 
          logo={<b>Your Logo</b>}
          projectLink="https://github.com/slopus/happy"
        />
      }
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/slopus/slopus.github.io/tree/main"
      editLink="Edit this page"
      footer={<Footer>© 2025 Slopus</Footer>}
    >
      {children}
    </Layout>
  )
}
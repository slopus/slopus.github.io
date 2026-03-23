import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../../mdx-components'
import { Metadata } from 'next'

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const mdxPath = params.mdxPath ?? []
  const { metadata } = await importPage(mdxPath)
  const canonicalPath = mdxPath.length > 0
    ? `/docs/${mdxPath.join('/')}/`
    : '/docs/'

  return {
    ...metadata,
    alternates: {
      ...metadata?.alternates,
      canonical: canonicalPath,
    },
    openGraph: {
      ...metadata?.openGraph,
      url: canonicalPath,
    },
  }
}

const Wrapper = getMDXComponents().wrapper

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>
}) {
  const params = await props.params
  const mdxPath = params.mdxPath ?? []
  const result = await importPage(mdxPath)
  const { default: MDXContent, toc, metadata } = result
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}

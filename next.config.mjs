import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  search: {
    codeblocks: true
  },
  staticImage: true,
  contentDirBasePath: '/docs',
})


/** @type {import('next').NextConfig} */
const nextConfig = withNextra({
  output: 'export',
  // It seems that trailingSlash is required for github pages to work
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
});

export default nextConfig 
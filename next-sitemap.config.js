/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://happy.engineering',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './out',
  // Exclude paths that shouldn't be indexed
  exclude: [
    '/404',
    '/500',
    '/_app',
    '/_document',
    '/_error',
    '/api/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      // Add any additional sitemaps if needed in the future
    ],
  },
  // Transform function to customize URLs if needed
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
  // Additional options
  changefreq: 'weekly',
  priority: 0.7,
  autoLastmod: true,
}
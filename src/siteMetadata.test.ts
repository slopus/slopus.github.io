import { describe, expect, it } from 'vitest'
import { documents } from './documents'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
import { metadataForPath } from './Router'
import { applyPageMetadata, defaultSocialImage, SOCIAL_IMAGE_VERSION } from './siteMetadata'

describe('link previews', () => {
  it('gives every desktop doc its own card, named after its path', () => {
    for (const document of documents.filter((entry) => entry.product === 'desktop')) {
      const image = metadataForPath(documentHref(HAPPY_DESKTOP, document.path)).socialImage
      expect(image?.path).toBe(`/og/${document.path.replace(/\//g, '-')}.png`)
      // A post with a video has a frame of it as the card, at the video's aspect ratio.
      const height = document.video ? Math.round((1200 * document.video.height) / document.video.width) : 630
      expect([image?.width, image?.height]).toEqual([1200, height])
    }
    expect(metadataForPath('/desktop/docs/tailcat/').socialImage?.path).toBe('/og/tailcat.png')
    expect(metadataForPath('/team-sign-in-workos/').socialImage?.path).toBe('/og/workos.png')
  })

  it('keeps the homepage card on the homepage and the original CLI docs', () => {
    expect(metadataForPath('/').socialImage).toBeUndefined()
    for (const document of documents.filter((entry) => entry.product === 'happy')) {
      expect(metadataForPath(documentHref(HAPPY, document.path)).socialImage).toBeUndefined()
    }
  })

  it('sets the card in the head on the client, as the served HTML has it', () => {
    document.head.innerHTML = [
      '<meta property="og:image" content="" />', '<meta property="og:url" content="" />',
      '<meta name="twitter:image" content="" />', '<meta property="og:title" content="" />',
    ].join('')
    const read = (selector: string) => document.querySelector(selector)?.getAttribute('content')

    applyPageMetadata(metadataForPath('/multiplayer/'))
    const card = `https://happy.engineering/og/multiplayer.png?v=${SOCIAL_IMAGE_VERSION}`
    expect(read('meta[property="og:image"]')).toBe(card)
    expect(read('meta[name="twitter:image"]')).toBe(card)
    expect(read('meta[property="og:url"]')).toBe('https://happy.engineering/multiplayer/')

    applyPageMetadata(metadataForPath('/docs/quick-start/'))
    expect(read('meta[property="og:image"]')).toBe(`https://happy.engineering${defaultSocialImage.path}?v=${SOCIAL_IMAGE_VERSION}`)
  })

  it('plays the stem cell video in previews, and drops it on the next page', () => {
    document.head.innerHTML = [
      '<meta property="og:type" content="website" />', '<meta property="og:image" content="" />',
      '<meta property="og:image:alt" content="" />', '<meta name="twitter:card" content="summary_large_image" />',
    ].join('')
    const read = (selector: string) => document.querySelector(selector)?.getAttribute('content')
    const properties = () => [...document.head.querySelectorAll('meta[property]')].map((tag) => tag.getAttribute('property'))

    applyPageMetadata(metadataForPath('/stem-cell/'))
    expect(read('meta[property="og:type"]')).toBe('video.other')
    expect(read('meta[property="og:video"]')).toBe('https://happy.engineering/video/stem-cell.mp4')
    expect(read('meta[property="og:video:secure_url"]')).toBe('https://happy.engineering/video/stem-cell.mp4')
    expect(read('meta[property="og:video:type"]')).toBe('video/mp4')
    expect([read('meta[property="og:video:width"]'), read('meta[property="og:video:height"]')]).toEqual(['1280', '720'])
    expect(read('meta[property="og:image"]')).toBe(`https://happy.engineering/og/stem-cell.png?v=${SOCIAL_IMAGE_VERSION}`)
    expect(properties()).toEqual([
      'og:type', 'og:image', 'og:image:alt',
      'og:video', 'og:video:secure_url', 'og:video:type', 'og:video:width', 'og:video:height',
    ])

    applyPageMetadata(metadataForPath('/multiplayer/'))
    expect(read('meta[property="og:type"]')).toBe('website')
    expect(properties()).toEqual(['og:type', 'og:image', 'og:image:alt'])
  })
})

import { describe, expect, it } from 'vitest'
import { documents } from './documents'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
import { metadataForPath } from './Router'
import { applyPageMetadata, defaultSocialImage } from './siteMetadata'

describe('link previews', () => {
  it('gives every desktop doc its own card, named after its path', () => {
    for (const document of documents.filter((entry) => entry.product === 'desktop')) {
      const image = metadataForPath(documentHref(HAPPY_DESKTOP, document.path)).socialImage
      expect(image?.path).toBe(`/og/${document.path.replace(/\//g, '-')}.png`)
      expect([image?.width, image?.height]).toEqual([1200, 630])
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
    expect(read('meta[property="og:image"]')).toBe('https://happy.engineering/og/multiplayer.png')
    expect(read('meta[name="twitter:image"]')).toBe('https://happy.engineering/og/multiplayer.png')
    expect(read('meta[property="og:url"]')).toBe('https://happy.engineering/multiplayer/')

    applyPageMetadata(metadataForPath('/docs/quick-start/'))
    expect(read('meta[property="og:image"]')).toBe(`https://happy.engineering${defaultSocialImage.path}`)
  })
})

export interface QuotedPost {
  name: string
  handle: string
  /** As X's own embed code writes it, in UTC. */
  date: string
  text: string
  /** Hide the post's link-preview photo so a long post stays short beside the text. */
  hideCards?: boolean
}

/**
 * The X posts quoted in content/thesis.md, keyed by the bare URL on its own line
 * there. The text is copied exactly so the quote reads the same before X's
 * widget replaces it, or if the widget never loads.
 */
export const thesisPosts: Record<string, QuotedPost> = {
  'https://x.com/maria_rcks/status/2106620125923393849': {
    name: 'maria',
    handle: 'maria_rcks',
    date: 'October 4, 2026',
    text: "is this where we're going",
  },
  'https://x.com/nikitabier/status/2107157904168239416': {
    name: 'Nikita Bier',
    handle: 'nikitabier',
    date: 'October 5, 2026',
    text: [
      'The most important technology problem of the next 5 years:',
      'Creating a broadly accepted standard for agents to identify themselves to service providers, so that providers can adjust the way they interface with clients (as compared to human-based traffic).',
      'In the interim (i.e., for the next 6 months), there will be a cat-and-mouse game that agents will play -- to circumvent detection and maintain their product\'s utility during this growth phase.',
      'However, this will only be a stopgap and it will not be the terminal state of the world.',
    ].join('\n\n'),
  },
}

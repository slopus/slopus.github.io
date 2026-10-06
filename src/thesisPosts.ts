export interface QuotedPost {
  name: string
  handle: string
  /** As X's own embed code writes it, in UTC. */
  date: string
  text: string
}

/**
 * The X posts quoted in content/thesis.md, keyed by the bare URL on its own line
 * there. The text is copied exactly so the quote reads the same before X's
 * widget replaces it, or if the widget never loads.
 */
export const thesisPosts: Record<string, QuotedPost> = {
  'https://x.com/jayair/status/2105834279557341382': {
    name: 'Jay',
    handle: 'jayair',
    date: 'October 2, 2026',
    text: 'The fact that Muse Spark, a non-SOTA model is good enough for Muse the agent is a sign of things to come',
  },
  'https://x.com/maria_rcks/status/2106620125923393849': {
    name: 'maria',
    handle: 'maria_rcks',
    date: 'October 4, 2026',
    text: "is this where we're going",
  },
  'https://x.com/poteto/status/2107244768917172618': {
    name: 'lauren',
    handle: 'poteto',
    date: 'October 5, 2026',
    text: "love t3code! Projects in cursor are just too good though. you don't need to see threads cluttering up your sidebar if you have a smart coordinator managing them for you. it's entirely changed how i use agents. you'll find that threads and side chats just become busy work for you to manage - when an agent could do it for you",
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

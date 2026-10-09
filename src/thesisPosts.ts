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
export const thesisPosts: Record<string, QuotedPost> = {}

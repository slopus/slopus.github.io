// Raw post data from nextra
export interface RawBlogPost {
  name: string
  route: string
  frontMatter?: {
    title?: string
    date?: string
    tags?: string[]
    description?: string
    [key: string]: any
  }
  [key: string]: any
}

// Processed blog post for internal use
export interface BlogPost {
  name: string
  route: string
  frontMatter: {
    title?: string
    date?: string
    tags?: string[]
    description?: string
    [key: string]: any
  }
  [key: string]: any
}

// Type that PostCard component expects (matches BlogMetadata)
// Note: PostCard from nextra-theme-blog only needs title and description
// in frontMatter, not our extended frontMatter with date, tags, etc.
export interface PostCardData {
  route: string
  frontMatter: BlogMetadata
  [key: string]: any
}

export interface TagCount {
  [tag: string]: number
}

export interface BlogMetadata {
  title: string
  description?: string
}

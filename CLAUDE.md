# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation website for **Happy** - an open-source mobile client for Claude Code. Built with Next.js 15 + Nextra, deployed to GitHub Pages via static export.

## Development Commands

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build (outputs to .next)
npm run export       # Full static export with search index & sitemap
npm run preview      # Build and serve on port 3001 for testing
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Note**: `npm run export` is the canonical build command for production. It runs `next build`, generates the Pagefind search index, and creates the sitemap.

## Architecture

### Tech Stack
- **Next.js 15.4.5** with App Router
- **Nextra 4.6** - Documentation framework with blog support
- **Tailwind CSS v4** - Styling
- **TypeScript** - Strict mode enabled
- **Turbopack** - Development server
- **Pagefind** - Static site search
- **GitHub Pages** - Deployment target

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `/app` | Next.js App Router pages |
| `/content` | MDX documentation files (processed by Nextra) |
| `/components` | React components (marketing, UI, terminal demos) |
| `/public` | Static assets (images, videos, icons) |
| `/types` | TypeScript type definitions |

### Routing Structure

```
/                           # Landing page (app/page.tsx)
/docs/[[...mdxPath]]/      # Documentation routes from /content
/blog/                      # Blog index
/blog/[slug]/               # Blog posts from /app/blog/*/page.mdx
/tools/[[...kind]]/         # Tools pages
/privacy, /terms            # Legal pages
```

**Important**: Documentation content in `/content` maps to `/docs/*` URLs (configured via `contentDirBasePath: '/docs'` in next.config.mjs).

### Content Workflow

The project uses a three-file system for content creation:

1. **`*.notes.txt`** - Draft content with no reading level restrictions
   - Write detailed technical explanations
   - Brainstorm and organize ideas
   - No simplification required

2. **`*.talk.txt`** - Collaboration context
   - Goals, audience, editorial feedback
   - Metacommentary about the writing process

3. **`*.mdx`** - Final published content
   - Target: **10th grade reading level**
   - Simplified but complete information
   - Processed by Nextra and displayed on the website

**Build Configuration**: Both `*.notes.txt` and `*.talk.txt` files are excluded from the build via webpack IgnorePlugin and Turbopack rules in next.config.mjs.

### Nextra Configuration

- **Themes**: `nextra-theme-docs` for docs, `nextra-theme-blog` for blog
- **Search**: Pagefind integration (codeblocks indexed)
- **Copy Code**: Enabled by default
- **Static Images**: Optimized automatically
- **Sidebar**: Default menu collapse level = 1

### TypeScript Path Aliases

```json
{
  "@/*": ["./*"]
}
```

Use `@/components/...` to import from project root.

## Writing Guidelines for Content Contributors

### Reading Level Requirements

All `.mdx` files in the ./content/ directory should target a **10th grade reading level**. This means using simple, clear language that's accessible to most readers while maintaining the depth and accuracy of information.

### Core Principles

#### 1. Simplicity Without Sacrificing Depth

We don't want to "dumb down" content or skip over important nuance. Instead, we want to include ALL the information that someone reading at a post-graduate level would expect to find, but present it using:

- Simple vocabulary (avoid rare or overly technical words when common alternatives exist)
- Clear sentence structures (shorter sentences, active voice when possible)
- Plain English explanations of complex concepts
- Step-by-step breakdowns of complicated processes

#### 2. Complete Information Coverage

Every reader should be able to find the detailed information and answers they're looking for, regardless of their background knowledge. This means:

- Including comprehensive explanations
- Providing context for technical concepts
- Adding examples and analogies when helpful
- Covering edge cases and important details

### Claude's Writing Workflow

When users ask you to write a new article or edit an existing article in the content/ directory, follow this specific process:

#### Step 1: Start with Notes, Not Final Content

**Always begin by creating a `*.notes.txt` file first.** Do not jump straight to writing the final `.mdx` content. This notes file is your workspace for:
- Brainstorming and organizing ideas
- Writing detailed technical explanations
- Iterating on structure and content
- **No reading level restrictions** - write naturally and technically

#### Step 2: Capture User Goals and Feedback

If users provide goals, target audience specifications, editorial feedback, or metacommentary about the writing process, **put all of this in a corresponding `*.talk.txt` file.** This keeps collaboration context separate from content development.

#### Step 3: Iterate in the Notes File

Work with the user to refine the content in the `*.notes.txt` file until they're satisfied with:
- The completeness of information
- The logical flow and structure
- The coverage of important topics
- The technical accuracy

#### Step 4: Translate to Final Format

**Only after the user is happy with the notes version** should you create the final `.mdx` file by translating the content to 10th grade reading level following the guidelines below.

### Practical Writing Tips

**Instead of rare words, use common ones:**
- "utilize" → "use"
- "implement" → "set up" or "put in place"
- "subsequently" → "then" or "after that"
- "facilitate" → "help" or "make easier"

**Break up complex sentences:**
- **Complex**: "The implementation of this feature, which requires careful consideration of multiple interdependent factors, can significantly enhance user experience."
- **Simple**: "This feature can greatly improve user experience. Setting it up requires thinking about several connected factors."

**Use active voice when possible:**
- **Passive**: "The configuration should be modified by the administrator."
- **Active**: "The administrator should modify the configuration."

**Add context for technical terms:**
- **Technical**: "Configure the API endpoint."
- **With context**: "Configure the API endpoint (the web address where your app sends requests)."

### Quality Checklist

Before finalizing any `.mdx` content, ask yourself:
1. Would a high school sophomore understand this explanation?
2. Have I included all the important details an expert would need?
3. Are there any unnecessarily complex words I could replace?
4. Do my examples help clarify the concepts?
5. Would Richard Feynman approve of this explanation?

Remember: Our goal is to make complex information accessible to everyone, not to make it simplistic.

---

> "If you can't explain it simply, you don't understand it well enough." — Richard Feynman

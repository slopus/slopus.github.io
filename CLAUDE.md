# Writing Guidelines for Content Contributors

## Reading Level Requirements

All `.mdx` files in the ./content/ directory should target a **10th grade reading level**. This means using simple, clear language that's accessible to most readers while maintaining the depth and accuracy of information.

## Core Principles

### 1. Simplicity Without Sacrificing Depth

We don't want to "dumb down" content or skip over important nuance. Instead, we want to include ALL the information that someone reading at a post-graduate level would expect to find, but present it using:

- Simple vocabulary (avoid rare or overly technical words when common alternatives exist)
- Clear sentence structures (shorter sentences, active voice when possible)
- Plain English explanations of complex concepts
- Step-by-step breakdowns of complicated processes

### 2. Complete Information Coverage

Every reader should be able to find the detailed information and answers they're looking for, regardless of their background knowledge. This means:

- Including comprehensive explanations
- Providing context for technical concepts
- Adding examples and analogies when helpful
- Covering edge cases and important details

## Writing Process and File Organization

### Draft Files: `*.notes.txt`

When preparing content for an `.mdx` file, start by creating a corresponding `*.notes.txt` file (e.g., `how-it-works.notes.txt`). This file should contain:

- **All detailed information** you want to include
- Technical explanations in their natural form
- Complex concepts before simplification
- Research notes and references
- **No reading level restrictions** - write as technically as needed

### Communication Files: `*.talk.txt`

Create `*.talk.txt` files to communicate with other contributors about:

- The goals and purpose of each page
- Target audience considerations
- Key concepts that must be covered
- Specific communication objectives
- **No reading level restrictions** - use whatever language is clearest for collaboration

### Final Content: `*.mdx`

The final `.mdx` files should be the 10th-grade reading level versions that transform your detailed notes into accessible content.

## File Extensions and Nextra

- `.mdx` files → Processed by Nextra and displayed on the website
- `.notes.txt` files → Ignored by Nextra, treated as Markdown in VS Code
- `.talk.txt` files → Ignored by Nextra, treated as Markdown in VS Code

This setup lets you keep all your detailed work alongside the final content without cluttering the published documentation.

## Why Simple Language for Technical Audiences?

You might be thinking: *"This is a highly technical product only meant for software engineers. Why can't I expect them to be fully versed in all the jargon and terminology I know? Why can't we raise the bar a little?"*

Here's why simple language is better, even for technical audiences:

**Just because you CAN use complicated language doesn't mean you SHOULD.**

Richard Feynman, Nobel Prize-winning physicist, put it perfectly:

> "If you can't explain it simply, you don't understand it well enough."

## The Real Benefits of Simple Language

When you truly understand something, you should be able to:

- **Be direct** - Get to the point without unnecessary complexity
- **Paint a clear picture** - Help readers visualize concepts immediately  
- **Eliminate confusion** - Prevent readers from having to reread sections
- **Reduce cognitive load** - Let readers focus on the concepts, not decoding your language

Even brilliant developers appreciate clear explanations. Complex jargon often
just gets in the way of communication.

## Practical Tips

### Instead of rare words, use common ones:
- "utilize" → "use"
- "implement" → "set up" or "put in place"
- "subsequently" → "then" or "after that"
- "facilitate" → "help" or "make easier"

### Break up complex sentences:
- **Complex**: "The implementation of this feature, which requires careful consideration of multiple interdependent factors, can significantly enhance user experience."
- **Simple**: "This feature can greatly improve user experience. Setting it up requires thinking about several connected factors."

### Use active voice when possible:
- **Passive**: "The configuration should be modified by the administrator."
- **Active**: "The administrator should modify the configuration."

### Add context for technical terms:
- **Technical**: "Configure the API endpoint."
- **With context**: "Configure the API endpoint (the web address where your app sends requests)."

## Quality Check

Before finalizing any `.mdx` content, ask yourself:

1. Would a high school sophomore understand this explanation?
2. Have I included all the important details an expert would need?
3. Are there any unnecessarily complex words I could replace?
4. Do my examples help clarify the concepts?
5. Would Richard Feynman approve of this explanation?

Remember: Our goal is to make complex information accessible to everyone, not to make it simplistic.

------------------------------------

## Claude's Writing Workflow

When users ask you to write a new article or edit an exiting article in the content/ directory, follow this specific process:

### Step 1: Start with Notes, Not Final Content

**Always begin by creating a `*.notes.txt` file first.** Do not jump straight to writing the final `.mdx` content. This notes file is your workspace for:

- Brainstorming and organizing ideas
- Writing detailed technical explanations
- Iterating on structure and content
- **No reading level restrictions** - write naturally and technically

### Step 2: Capture User Goals and Feedback

If users provide:
- Goals for the article
- Target audience specifications  
- Editorial feedback or suggestions
- Metacommentary about the writing process

**Put all of this in a corresponding `*.talk.txt` file.** This keeps the collaboration context separate from the content development.

### Step 3: Iterate in the Notes File

Work with the user to refine the content in the `*.notes.txt` file until they're satisfied with:
- The completeness of information
- The logical flow and structure
- The coverage of important topics
- The technical accuracy

### Step 4: Translate to Final Format

**Only after the user is happy with the notes version** should you create the final `.mdx` file by translating the content to 10th grade reading level following the guidelines below.

This process ensures we capture all the important information first, then make it accessible without losing crucial details.
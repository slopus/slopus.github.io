# Agent notes

## Happy Desktop link preview

The `/desktop/` page (the Happy Harness page, formerly reviewed unlisted at
`/tmp/happy-one/`) has a screenshot-based social image. Before regenerating it,
follow **Regenerating the social preview** in `docs/happy-one-demo.md`. Use the
current recorded model-selection frame and the page's explicit screenshot mode;
do not substitute an illustrated mockup. Keep the existing preview title and
description unless the user asks to change them. The screenshot-only
GitHub/stars line must stay absent from the normal hero. Maintain regeneration
instructions, not a dedicated screenshot script.

## Products and docs

The site has two products in one header switch: **Terminal + Mobile** (`/`,
`/docs`) and **Desktop + Mobile** (`/desktop/`, `/desktop/docs`). Desktop docs
live in `content/desktop/` and are registered in `src/documents.ts`. The earlier
`npx happy2` workspace product is superseded; `/happy2/*` redirects to
`/desktop/*` and must keep resolving. The Buzz comparison stays reachable at
`/desktop/docs/comparisons/buzz/` but is unlisted (`hidden: true`).

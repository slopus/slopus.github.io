---
name: model-benchmarks-refresh
description: Refresh Happy's /model-benchmarks page, its reviewed X evidence, exact-model tier ordering, and bundled recommendation data without unnecessary source or order churn.
---

# Refresh the model benchmarks page

Use this skill for any refresh of `/model-benchmarks`, its source posts, model notes, or tiers. This is a curated decision-support page, not an automatic leaderboard. Read this entire file before starting. Announce that you are using it.

## Read the current state first

Read `AGENTS.md`, `src/model-benchmarks.json`, `src/modelBenchmarks.ts`, `src/ModelBenchmarksPage.tsx`, and their tests. Check the Git diff and preserve unrelated work. The JSON is the versioned source of truth for this page. Do not fetch recommendations, rank models, shuffle sources, or discover providers at page load or runtime startup.

The canonical URL is `https://happy.engineering/model-benchmarks`. The Happy picker footer says **Latest benchmarks**. The “trust me bro” title identifies this as an editorial synthesis, not an independently reproduced lab benchmark. Keep methodology in this pipeline, not a long page preamble.

The checked-in [source data and model ordering](../../../src/model-benchmarks.json) contain the full claims, limitations, verification provenance and rationale. The [selection logic](../../../src/modelBenchmarks.ts) and [page component](../../../src/ModelBenchmarksPage.tsx) consume this fixed JSON.

## Research through Grok X search

1. Prefer a Grok research subagent using an available funded provider. Ask for original X post URLs, exact quotations, dates, versions, tasks, effort, harness, limitations, and conflicting results. Read its findings yourself; discovery is not verification.
2. If the configured API-key provider is not yet available to subagents, report that limitation. A directly authorized xAI `/responses` call with `tools: [{"type":"x_search"}]` is an acceptable explicit fallback. Do not restart the daemon while work is running or repeatedly retry an exhausted provider.
3. Never print keys, put them in arguments, log request headers, commit credentials, or include them in research snapshots. Use the configured provider credential privately. Save public raw answers and citations only in gitignored `.context/research/`.
4. Use only original X posts as ranking evidence. General web search can help locate a post, but snippets, blogs, release documentation, videos, and provider model listings do not establish a ranking. Official documentation may disambiguate identifiers, not supply ranking claims.

## Editorial gate

Prioritize, in order:

1. Official provider release threads with substantive benchmark detail. Always record these as `kind: "provider-reported"` in the JSON, including developer accounts.
2. Established evaluators with a meaningful audience and substantive firsthand evaluation, including Theo when relevant.
3. Serious original benchmark/comparison researchers, even with a smaller audience, when their methodology is credible.

Popularity is an eligibility signal, never proof or a vote weight. Exclude random unsupported comments, engagement bait, vague praise, recycled announcements, search summaries, stale or misidentified versions, and unsupported tier inference. Do not fill a quota with weak material.

Independently open each proposed post using X's oEmbed endpoint and/or the original X page. Verify the author, post ID, publication date, and every specific claim used. oEmbed may truncate long posts: inspect the original full post before using text beyond the truncation. A link's existence is not enough. Store the verification method and limitations in the source record.

If a chart image carries the evidence, inspect the actual image, transcribe its exact version labels and values, and review them. OCR/Grok interpretation alone is not verification. Never infer an intra-tier order from left-to-right chart placement unless the author explicitly specifies one.

## Exact identities and claims

- Map every claim to an exact catalog model ID. Do not use family selectors or transfer a predecessor's reputation to the current family head.
- Preserve task, effort, harness, benchmark revision, date, limitations, and conflicts. A mixed-model fallback is not a clean single-model result.
- A source can support several models only when it explicitly covers each one. Its `modelIds` must match the models actually citing it.
- `comparisonModelIds` means an actual head-to-head among those exact models, not separate mentions, a family comparison, or a comparison against an unspecified model.
- Compare like-for-like before interpreting scores. Do not pool incompatible benchmark versions or resolve contradictions by averaging them away.
- Separate task quality from price, token usage, vendor availability, and general intelligence metrics. Prices mentioned by sources are contextual claims, not current pricing data or tier weights.
- Model hover/focus notes contain two or three concise, supported strengths/core points and caveats. A placement rationale cites the reviewed source set; it is our judgment, not an influencer's claimed tier unless explicitly stated.
- Thin evidence means **Unranked**, never D. Empty tiers are allowed. Do not invent a complete ladder.

## Four-post cap and stable refreshes

- Hard maximum: **four selected posts per exact model**. Prefer one meaningful official post plus up to three strong independent evaluations, but fewer is fine.
- Every selected post in a thread counts. A thread is not unlimited embeds. A shared post counts against every model it supports and renders once in the union when multiple models are selected.
- Keep reviewed incumbent sources unless a replacement materially improves exact-version relevance, methodology, coverage, verification, or recency. A newer date alone is not enough.
- Research candidates separately from the selected public source list. Do not replace all posts on each refresh. For each replacement, record the old/new URL and concrete reason in the review handoff.
- Preserve existing model and source array order when conclusions have not changed. Place new sources deliberately. Do not sort by live dates, popularity, API arrival order, or search ranking.
- Preserve same-tier order absent a supported editorial change. Explain any tier or order change. Stable order is a deterministic presentation choice, not an invented numeric quality difference.
- A no-material-change review produces **no catalog diff and no new revision**. Do not bump the public updated date just because you ran a search. Verification logs belong in scratch.
- On a material change, increment `revision`, set honest UTC `updatedAt`/`evidenceCutoff`, and retain each original `publishedAt`. Source age below the embed refers to publication, never last verification. Keep the absolute date accessible.

## Deleted posts, privacy, and shared policy

Embed failure alone does not prove deletion. Confirm availability separately. Remove confirmed private/deleted reproduced content from the next reviewed revision as appropriate; explain the removal and reevaluate dependent placements. Keep links and clearly labeled fallback summaries only when appropriate. Never secretly rerank an already published revision because X is unavailable.

The user explicitly chose automatic official X embeds. Load the shared widget automatically, render posts as they approach the viewport, and use `dnt: true`, `conversation: 'none'`, with media retained. This contacts X; do not claim the page is third-party-request-free. Never inject untrusted oEmbed HTML or weaken CSP broadly. Keep a readable author/summary/source-link card only as the blocked/timeout fallback.

## Keep the page minimal

The visible page is a centered title with the tiny updated date and GitHub **pipeline ↗** link side by side beneath it, a compact centered tier table, **Clear selection** only while models are selected, and original embedded posts. Clicking models is the only filter. The post count is screen-reader only. No head-to-head toggle, provider-reported label, consent gate, “How we curate” section, curator essays, “Happy’s read”, source-scope panels, or ceremonial preamble. Empty tiers show an em dash. Hover/focus notes are two or three terse bullets.

Use a responsive two/three-column desktop grid of approximately 300–350px embeds and one column on mobile. Under each embed show only its subtle publication age; the post itself says which models it covers. Source `kind`, `comparisonModelIds`, caveats, scope and editorial rationales stay as provenance in the JSON linked from this pipeline; the page does not render them.

The executable provider catalog remains separate. Future runtime consumption should bundle a pinned, reviewed exact-model recommendation policy, not fetch it at startup. Do not change model IDs, capabilities, provider availability, user ordering, selected models, active sessions, or hide low-tier models as a side effect of an editorial refresh. Coordinate any runtime policy update separately and preserve local overrides.

## Validation and handoff

Run `pnpm test` and `pnpm build`. Tests must enforce unique IDs, valid X URLs, reciprocal model/source references, no more than four posts per model, exact comparison membership, supported notes, stable filtering, automatic widget loading, and useful blocked-widget fallback. Check `/model-benchmarks` and `/model-benchmarks/`, static canonical/social metadata, and existing redirects.

Visually inspect screenshots in `.context/blueprints/`: default with real loaded embeds, hover/keyboard notes, one model, two models, blocked-widget fallback, and mobile. Remove stale captures when the design changes. The current site is light-only; do not invent a dark theme. Clearly distinguish real embed screenshots from mocked failure/success test fixtures.

Hand off the tier table, every selected post with author/date/support/category, rejected or replaced candidates and reasons, exact verification results, screenshots, and remaining uncertainty. Do not push or publish without explicit approval; a push to `main` deploys the public site.
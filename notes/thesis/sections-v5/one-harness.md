# One harness

We're betting on one harness, Happy Agent, under every agent. Each provider gets its vendor's own prompts and tools, verbatim, close enough to the native request that prompt caching keeps working. Everything around the model is shared: one session, one permission model, one set of tools.

That's what lets you switch from Claude to GPT to Grok mid-session, from your laptop or your phone, and keep the transcript. Subagents pick their own model too, so one task can plan on one provider and review on another. Happy uses the Claude Code, Codex and Grok CLI sign-ins already on your machine, so there's no key to paste. You get each model at its best: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use.

![Happy's model picker: switch provider mid-session](/thesis/model-picker.png)

One harness also makes deeper integrations possible that a pile of separate CLIs can't do: controlling every terminal session from one hypervisor, updating the harness itself, spreading agents across runners on a busy team server, and later, finer control over permissions.

A busy team server brings us to the hardest part.

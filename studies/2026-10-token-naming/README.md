# Token Naming Instinct

A blind, multi-agent benchmark for studying the design-token names that language models produce from their learned conventions.

## Scope (executed)

- 125 independent runs on 25 frozen prompts
- 25 runs each: Claude Opus 5.5, GPT-5.6 Sol, Claude Fable 5.1, Grok 4.7, Muse Spark 1.3
- Cursor subagents as the execution backend, one fresh agent per run
- Neutral design briefs with no Delta Theme repository access
- A reproducible dataset and the five-model report (`report/REPORT-v2.html`), also published as `reports/2026-10-token-naming/report.html`.

## Research question

When asked to create a small layout or design system without an existing naming convention, which token names, taxonomies, and structures do current models choose, and where do they agree?

## Non-goals

- Evaluating whether a model can imitate Delta Theme
- Giving benchmark agents access to Delta source code
- Sharing outputs or memory between runs
- Treating this sample as a definitive model ranking

## Project structure

- `prompts/` — 25 frozen briefs with the response contract
- `runs/` — raw output and isolation metadata from each run
- `data/` — manifest, agent map, validation, normalized records, matched tuples, metrics, per-need evidence
- `scripts/` — generation, protocol validation, capture, run validation, analysis, canvas data embedding
- `report/` — the report (`REPORT-v2.html`)

See `AGENTS.md`, `EXPERIMENT.md`, and `SESSION_HANDOFF.md` before continuing work.

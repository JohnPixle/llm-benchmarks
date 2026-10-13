# Session Handoff

## Current objective

Blind benchmark of design-token naming across five models (Claude Opus 5.5, GPT-5.6 Sol, Claude Fable 5.1, Grok 4.7, Muse Spark 1.3), 125 isolated runs on 25 frozen prompts, with an archival report and an interactive Cursor Canvas report that emphasizes visuals.

## Decisions made

- Use Cursor subagents rather than direct vendor APIs.
- Original study: 50 trials, Opus 5.5 vs GPT-5.6, counterbalanced order.
- Extension (same day): append Fable 5.1 and Grok 4.7 cohorts on the identical prompts without touching the original 50 runs. Grok cohort uses the latest available slug (`grok-4.7-high-fast`).
- Second extension: append Muse Spark 1.3 (`muse-spark-1.3-high`) as sequences 101–125 without changing the first 100 runs or prompt hashes.
- Benchmark agents must not see Delta Theme code or conventions.
- Every trial uses a fresh agent with no resumed conversation or cross-run memory.
- Store the benchmark as its own study folder: `studies/2026-10-token-naming/` (moved from `token-naming-benchmark/` on 13 Oct 2026). Published copies live in `reports/2026-10-token-naming/`.
- Agreement is reported as the full 1–5 distribution, all-five agreement, 3+ majority, and ten pairwise rates.

## Completed

- Project scaffold, isolation rules, protocol, and 25 frozen prompts.
- 125 fresh-agent trials captured; zero tool calls in any transcript.
- 121 strict-valid runs; four GPT-5.6 runs from the original study remain strict failures with recovered leading JSON. Fable, Grok, and Muse were 25/25 strict-valid.
- `scripts/generate.mjs` and `scripts/validate-protocol.mjs` extended to four cohorts; verified first 50 runs byte-identical.
- `scripts/analyze.mjs` and `scripts/concept-analysis.mjs` generalized to N cohorts from the manifest (pairwise matrix, all-model and majority agreement, per-cohort shared-name records, vocabulary fingerprints).
- `scripts/update-canvas-data.mjs` now embeds one typed `BenchmarkData` block into the canvas.
- Canvas rebuilt with six views: Overview (agreement ladder, pairwise heatmap, role/scenario charts, consensus bars), Names by need, Consensus vocabulary (all-four / three-of-four with holdout), Roles & scenarios (grouped charts, per-role heatmaps), Model fingerprints (syntax share, identifier length, root families, vocabulary, approach callouts), Method.
- Muse integration generalized the canvas to five cohorts. The pair network was replaced with ranked pair bars to avoid crossing lines and overlapping labels; agreement tiers and consensus tables now size dynamically.
- `report/REPORT.md` rewritten for four cohorts with text charts and verified figures.
- 13 Oct 2026 (later session): `report/REPORT-v2.html` added as a second edition written for a human reader (what you would get back, what to leave to the AI, what to spell out, does the brief matter, which model). It contains no post-hoc comparison with any specific design system. New measures computed from `data/normalized.json` and `data/paired.json`: segment Jaccard word overlap and shared-root rate per pair, anatomy of disagreeing pairs (65% share root, 66% share half the words, 5% reorderings), synonym forks per model, self-consistency per role, role x scenario majority map, prompt-position effect, `button` position (component-first vs property-first), state-word position (93% last), numeric-scale use, per-run syntax by scenario. `REPORT.md` is unchanged. The computation script lives only in the session scratchpad; the numbers are embedded in the HTML.

- 13 Oct 2026 (evening): `report/REPORT-v2.html` got a System / Light / Dark toggle (header, `localStorage` key `tn-theme`); `reports/2026-10-token-naming/report.html` is a byte-identical copy. A blog article drafted from the study is WordPress post 1138 on deltatheme.com (draft, "What four AIs call the same design token", four inline SVG charts, one table). The article links to a repository placeholder until the repo is public.

- 13 Oct 2026 (late): fifth cohort Muse Spark 1.3 (sequences 101–125, added by another session) folded into the second edition. `report/REPORT-v2.html` now reports five models everywhere (KPIs, hero table, forks, self-consistency, pairwise matrix, scorecard, cheat sheet, 100-token grid); `reports/2026-10-token-naming/` (report.html, report-first-edition.md, dataset.zip with 125 runs) and the root README were refreshed; blog post 1138 updated to five models. Extra metrics script for this edition: scratchpad `extra5.py` (not in the repo; numbers are embedded in the HTML).

- 14 Oct 2026: `report/REPORT-v2.html` gained section 09 "How to apply this in an agent workflow" (six habits plus an alias table); sections after it renumbered. Blog post 1138 retitled "Token naming instinct: a blind study of how five AI models name design tokens" (slug token-naming-instinct; an earlier title was "What five AI models call the same design token"), rewritten in an impersonal voice with HTML bar charts and two tables, the full dashboard brief, a collapsible list of all 100 items, and a compact "In practice" list. The "In practice" list (post) and section 09 (report) are framed around minimising naming drift in a project design system. Both the report and the post now open "When this matters" with the drift use case: a design system for a project that agents work on, where names must not drift across sessions, pages and models.

## Key results (13 Oct 2026, five cohorts)

- All five models same normalized name: 12.6% of 500 needs; 3+ of 5: 50.8%; mean pairwise 33.5%.
- Closest pair Opus–Fable 48.6%; farthest GPT–Muse 27.2%.
- 32 names used by all five models; 37 by four and 61 by three.
- Fable is the only model producing `--custom-property` syntax (140/500 names, 7 of 25 runs).
- Muse is 500/500 dot-path, has 238 distinct normalized names, and the lowest self-consistency at 45.6%.

## Next actions

0. Optional: move the second-edition metrics (word overlap, forks, self-consistency by role, position effect) into `scripts/concept-analysis.mjs` so `REPORT-v2.html` can be regenerated from data instead of hand-embedded constants.

1. Deferred by user: evaluate Delta Theme's design system for agent-friendliness (tokens.json metadata, abilities, skills). Do not mix with the blind dataset.
2. Optional: blinded human quality ratings as a second study phase.
3. Optional: additional cohorts via `extraCohorts` in `scripts/generate.mjs` (append-only).
4. The repo is github.com/JohnPixle/llm-benchmarks (private, created 14 Oct 2026). Before making it public, decide whether the study's internal docs (REPORT.md, EXPERIMENT.md, AGENTS.md, this file) should keep their references to the design system the study was run for.

## Fixed pitfall

`data/agent-map.json` is an array of `{ run_id, agent_id }`. Appending with object spread silently drops entries on write; append array items instead.

## Session close checklist

- Update this file.
- Record any protocol change and its reason (see `EXPERIMENT.md` change log).
- Note commands or checks run.
- Identify incomplete or invalid trials without overwriting raw evidence.
- State one exact next action.

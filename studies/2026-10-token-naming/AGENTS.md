# Agent Instructions

These rules apply to every session working on this benchmark.

## Preserve run isolation

Each benchmark trial must use a brand-new subagent.

- Never resume or reuse an earlier benchmark agent.
- Never include prior run outputs in a trial prompt.
- Never expose the Delta Theme repository, its files, or its token names to a benchmark agent.
- Give each trial only its frozen brief, shared response contract, and opaque run ID.
- Do not let a benchmark agent read or write the project workspace.
- Randomize execution order across model and brief while keeping the planned sample balanced.

## Preserve raw evidence

- Save each response unchanged before parsing it.
- Record the requested model, run ID, brief ID, start time, completion status, and validation result.
- Never silently repair raw output.
- Put parser corrections or exclusions in derived data with an explicit reason.
- Keep analysis code separate from raw responses.

## Avoid contamination

The parent orchestrator may inspect Delta only after blind generation is complete, and only for a clearly labeled post-hoc comparison. Delta-derived names must not enter prompts, schemas, validators, retries, or instructions used for benchmark trials.

## Execution choices

- Cohorts: Claude Opus 5.5, GPT-5.6 Sol, Claude Fable 5.1, Grok 4.7, Muse Spark 1.3
- Sample: 25 runs per cohort, 125 total, all on the same 25 frozen prompts
- Execution backend: fresh Cursor subagents
- Adding a cohort: append it to `extraCohorts` in `scripts/generate.mjs` and to the cohort list in `scripts/validate-protocol.mjs`; never reorder or renumber existing runs. Analysis scripts read the cohort list from the manifest.
- `data/agent-map.json` is an array of `{ run_id, agent_id }`; append objects, do not convert it to a map.

## Session discipline

At the start of a future session, read:

1. `README.md`
2. `EXPERIMENT.md`
3. `SESSION_HANDOFF.md`
4. This file

Before ending a session, update `SESSION_HANDOFF.md` with completed work, verification, open issues, and the exact next action.

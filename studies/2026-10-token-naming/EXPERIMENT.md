# Experiment Protocol

## Status

Executed on 13 October 2026 in two phases. The prompt set and randomized manifest were frozen before the 50 primary trials. Any later changes must be versioned and documented.

Protocol change log:

- v1 (manifest schema 1): Claude Opus 5.5 vs GPT-5.6 Sol, 50 runs, sequences 1–50.
- v2/v3 (manifest schema 3, same day): two cohorts appended on the identical 25 prompts — Claude Fable 5.1 (sequences 51–75) and Grok 4.7 (sequences 76–100). Prompts, pair keys, and the first 50 run IDs/sequences were verified unchanged after regeneration. Reason: user request to extend the comparison after switching models; no prompt or contract edits were needed.
- v4 (manifest schema 4, same day): Muse Spark 1.3 appended on the identical prompts as sequences 101–125. The first 100 runs and all prompt hashes were verified unchanged.

## Cohorts

- Claude Opus 5.5 (`claude-opus-5-5-medium`): 25 independent runs
- GPT-5.6 Sol (`gpt-5.6-sol-medium`): 25 independent runs
- Claude Fable 5.1 (`claude-fable-5-1-thinking-high`): 25 independent runs
- Grok 4.7 (`grok-4.7-high-fast`): 25 independent runs
- Muse Spark 1.3 (`muse-spark-1.3-high`): 25 independent runs

Every run starts with a new subagent and receives no memory or artifacts from any other run.

## Paired matrix

Use a paired, blocked 5 × 5 design. Create 25 prompts and send each prompt once to each model, producing 25 matched tuples (one answer per model per prompt) and 125 total runs. Every (prompt, concept) cell is therefore compared across all ten model pairs and as a five-way tuple.

1. SaaS analytics dashboard
2. Editorial or publishing site
3. Ecommerce storefront
4. Professional-services marketing site
5. General-purpose website design system

Each scenario defines 20 naming targets as opaque concept IDs and plain-language descriptions, divided into five four-item blocks:

1. Primitive colors and scales
2. Semantic roles and interaction states
3. Typography roles and hierarchy
4. Spacing, sizing, radius, and elevation
5. Component, variant, state, and responsive tokens

Create five prompt variants per scenario by cyclically rotating these blocks. Every block occupies every prompt position once; wording otherwise remains identical. The exact scenarios, rotations, and response contract will be frozen under `prompts/` before execution.

## Response contract

Require JSON only, with no explanation or naming rationale:

```json
{
  "schema_version": "1",
  "items": [
    {
      "concept_id": "S1-C01",
      "token": "agent-generated identifier"
    }
  ]
}
```

Require exactly one item for every supplied concept ID. Do not ask the agent to describe its naming convention because that instruction could change the behavior being measured.

## Normalization

Preserve raw responses and raw token names. For a separate canonical representation:

1. Apply Unicode NFC normalization.
2. Remove surrounding whitespace; flag internal whitespace.
3. Split camelCase and PascalCase boundaries.
4. Treat `.`, `-`, `_`, and `/` as separators.
5. Lowercase canonical segments.
6. Preserve segment order, abbreviations, prefixes, and lexical choices.

Do not merge synonyms in primary analysis and never silently repair source data. Flag malformed JSON, missing or extra IDs, duplicate IDs, empty values, illegal characters, and normalized-name collisions. Any tolerant secondary extraction must use frozen rules and remain separate from primary results.

## Planned measurements

- Within-model agreement for each concept across its five order variants
- Paired Claude/GPT exact-match and canonical-match rates
- Naming syntax: kebab case, dot paths, nested objects, prefixes, and CSS custom-property style
- Taxonomy depth and hierarchy
- Primitive versus semantic versus component-token mix
- Category vocabulary and frequency
- Segment count, vocabulary, abbreviations, and singular/plural choices
- Edit-distance and segment-Jaccard similarity
- Within-model entropy by concept
- Duplicate and collision rates
- Scenario, model-family, and prompt-position effects
- Invalid, incomplete, or nonconforming outputs

## Controls

- No Delta repository context during generation
- Identical briefs and response contract for both cohorts
- Identical prompt paired across models
- Position-balanced block rotations
- Randomized pair order
- Counterbalanced first model: 13 Claude-first pairs and 12 GPT-first pairs
- Interleaved execution to reduce temporal drift
- Opaque run IDs
- No retries that reveal validator feedback; failures remain evidence
- Raw responses saved before normalization
- Model identity withheld during any human review
- Tool and workspace access omitted from benchmark prompts

## Quality gates

Before execution:

- Validate 20 unique concept IDs per scenario.
- Confirm every block appears once in every prompt position.
- Check prompts for accidental token-name examples or Delta references.
- Freeze prompts, parser behavior, exclusions, and primary metrics.
- Run one pilot per model and exclude pilots from the final sample.

After execution:

- Confirm 25 completed attempts per model and all 25 intended pairs.
- Audit every run for fresh-agent use and context isolation.
- Report malformed-output rates before any tolerant recovery.
- Analyze paired differences with confidence intervals and cluster at scenario/concept level rather than treating 2,000 token rows as independent observations.
- With five cohorts, report all-five canonical match, strict majority (3+ of 5), the full 1–5 agreement distribution, and all ten pairwise match rates. `max_agreeing` in `data/paired.json` is the largest group of models sharing one canonical name for that need.

## Limitations to report

Cursor does not expose all sampling parameters, deterministic seeds, or hidden system instructions for subagents. Strict JSON may suppress some natural naming behavior. Multiple token names from one response are correlated observations. Results measure the named Cursor model configurations at the time of execution, not every vendor model. This sample supports exploratory comparison, not broad statistical claims.

## Delta comparison

Any comparison with Delta Theme is post-hoc and clearly separated from the blind benchmark. Delta token names must never affect generation prompts or run validation.

# Design-Token Naming Priors Across Five Models

Blind comparison of Claude Opus 5.5, GPT-5.6 Sol, Claude Fable 5.1, Grok 4.7, and Muse Spark 1.3 using 125 fresh, isolated Cursor subagents on 25 frozen prompts.

The interactive version of this report (heatmaps, per-need name breakdowns, consensus lists, model fingerprints) is the Cursor Canvas `token-naming-benchmark-report.canvas.tsx`. This file is the archival summary; every number below comes from `data/analysis.json` and `data/concept-analysis.json`.

## Executive summary

Five models, each answering the same 25 prompts once with no tools, no repository, and no memory, produced 2,500 design-token names for 500 matched needs.

```
How many models chose the same normalized name for a need (500 needs)

All five agree   ███████████                               63   12.6%
Four of five     ████████████                              70   14.0%
Three of five    ████████████████████                     121   24.2%
Two of five      ███████████████████████████████          184   36.8%
No two agree     ██████████                                62   12.4%
```

- A strict majority (three or more models) converged on 50.8% of needs.
- Mean pairwise agreement after normalization is 33.5%. The original Opus–GPT result remains 38.0%.
- The closest pair is the two Anthropic models, Opus 5.5 and Fable 5.1, at 48.6%. The farthest is GPT-5.6 and Muse at 27.2%; Opus–Muse is 27.6%.
- 32 normalized names were produced independently by all five models; 37 more by four of five and 61 by three of five.
- Agreement is structured by role, not by chance: semantic colors and primitives converge, components do not.

## Dataset integrity

- 125 of 125 scheduled trials completed; every trial was a brand-new agent conversation.
- Zero tool calls across all 125 transcripts; no trial saw Delta Theme context or any other trial's output.
- 96 runs passed the strict JSON contract. The four failures are the GPT-5.6 runs from the original study that appended commentary after valid JSON; they remain strict failures and their leading JSON was recovered unmodified.
- Fable 5.1, Grok 4.7, and Muse Spark 1.3 were 25/25 strict-valid.
- All earlier runs remain unchanged; Muse was appended as sequences 101–125 on the same prompt hashes.

## Pairwise agreement

Percent of the 500 needs where two models produced the same normalized name. Diagonal: how often a model agreed with itself across the five order-shuffled prompts of a scenario.

```
                Opus 5.5   GPT-5.6   Fable 5.1   Grok 4.7   Muse 1.3
Opus 5.5         (57.3)     38.0       48.6        34.2        27.6
GPT-5.6           38.0     (55.7)      33.2        31.0        27.2
Fable 5.1         48.6      33.2      (55.2)       36.2        30.6
Grok 4.7          34.2      31.0       36.2       (54.1)       28.0
Muse 1.3          27.6      27.2       30.6        28.0       (45.6)
```

Muse used dot paths for all 500 names, but had the lowest self-consistency (45.6%) and low canonical agreement with every other model (27.2–30.6%). This reinforces that shared punctuation does not imply shared vocabulary.

## Agreement by role

```
Role          All five   3+ agree
Primitives      23%        70%
Semantics       26%        75%
Typography       7%        34%
Foundations      5%        39%
Components       2%        36%
```

Semantic color roles are the shared language: `color.text.primary`, `color.text.secondary`, `color.action.primary.hover`, `color.link.hover`, `color.notice.urgent`. Component names are where the five models diverge across property-first, component-first, `component.*`, and CSS custom-property grammars.

## Agreement by scenario

```
Scenario                          All five   3+ agree   Mean pairwise
S1 SaaS analytics dashboard         28%        60%         47.1%
S3 Ecommerce storefront             21%        64%         43.2%
S2 Editorial publishing              3%        49%         27.6%
S5 General-purpose website system    6%        39%         25.8%
S4 Professional-services marketing   5%        42%         23.6%
```

Concrete product briefs converge; the abstract foundation brief (S5) and the marketing brief (S4) fragment. In S5, GPT-5.6 and Fable 5.1 agreed on only 14% of needs.

## Names every model reached for

Counts are how many times each model produced the name out of its 500 names (Opus / GPT / Fable / Grok / Muse).

```
color.brand.primary              18 / 17 / 16 / 12 / 19
color.text.primary                5 /  9 /  6 /  5 / 10
color.surface.page                7 / 10 /  5 /  5 /  7
color.text.secondary              5 /  8 /  6 /  5 /  6
color.action.primary.hover        5 /  5 /  5 /  5 /  5
color.neutral.strongest           5 /  5 /  5 /  5 /  5
radius.control                   11 / 11 / 12 / 10 /  4
typography.body.default           4 /  8 /  8 /  7 /  4
color.neutral.500                 5 /  4 /  5 /  4 /  5
color.notice.urgent               4 /  4 /  4 /  5 /  4
```

Full list of 32 all-five, 37 four-of-five, and 61 three-of-five names: `data/concept-analysis.json` → `global_common_names`.

### What Muse changed

Universal agreement dropped from 18.6% across four models to 12.6% across five. This is expected when adding a cohort, but Muse also broadened the vocabulary: it produced 238 distinct normalized names, the most of any model, and repeated the same choice across prompt orders least often. The strict-majority rate rose to 50.8% because a five-model majority only requires three models.

## Model fingerprints

```
                     Opus 5.5    GPT-5.6     Fable 5.1   Grok 4.7   Muse 1.3
Syntax (of 500)
  dot-path             320         500         240         480         500
  kebab-case           180           0         120          20           0
  --custom-property      0           0         140           0           0
Avg segments          3.27        3.38        3.14        3.13        3.32
Distinct normalized    203         207         199         214         238
Self-consistency      57.3%       55.7%       55.2%       54.1%       45.6%
Unanimous concepts      34          31          28          30          16
Strict-valid runs     25/25       21/25       25/25       25/25       25/25
```

Top-level category words (first segment, of 500):

```
                   Opus   GPT   Fable   Grok   Muse
color               226   242    224    251    240
typography           59   100     72     72     52
font / text / type   41     0     28     27     44
space                59    14     56     69     28
spacing               0    52      0      0     35
radius               25    25     25     25     25
shadow               15    19     14      0     11
elevation            10     6     11     25     14
breakpoint           15    15     15     15     15
button               21     4     17      0      0
component             0     6      6      0     21
```

GPT-5.6 and Fable 5.1 are the only models that ever opened a name with a `component.*` namespace; Opus 5.5 and Grok 4.7 never did.

### How each model approached the task

- **Claude Opus 5.5** switches surface syntax by scenario (kebab-case in 4 of 5 marketing runs, dot-path elsewhere) while keeping the same words underneath. Most self-consistent model; least often the odd one out.
- **GPT-5.6 Sol** writes one grammar: dot-path, `typography.*` for every text role, `spacing` never `space`, property-first component names (`color.button.primary.background`). Longest identifiers. The only model to add commentary after the JSON.
- **Claude Fable 5.1** thinks in CSS: 7 of 25 runs produced `--prefixed` custom properties, 6 plain kebab-case, 12 dot-path. Shortest identifiers. Agrees with Opus more than any other pair, which points to a shared Anthropic naming prior that survives a model generation.
- **Grok 4.7** is almost pure dot-path like GPT, yet the two agree least of any pair. Grok says `elevation`, `background.page`, `type`; GPT says `shadow`, `surface`, `typography`. Same syntax, different nouns.
- **Muse Spark 1.3** uses dot paths for every name, has the broadest normalized vocabulary (238 names), and the lowest order-variant self-consistency (45.6%). It favors `component.*` more heavily than the other cohorts.

### Examples of four-way divergence

```
S1-C02 "The lowest page background layer"
  Opus   color.surface.base            Fable  color.background.base
  GPT    color.surface.page            Grok   color.background.canvas

S1-C16 "The elevation used by floating panels"
  Opus   elevation.overlay             Fable  elevation.overlay
  GPT    shadow.panel.floating         Grok   elevation.floating

S5-C08 "The color communicating a destructive action"
  Opus   color-feedback-danger         Fable  --color-danger
  GPT    color.action.destructive      Grok   color.action.destructive

S1-C17 "The primary button background"
  Opus   button.primary.background     Fable  component.button.primary.background
  GPT    color.button.primary.background / component.button.primary.background
  Grok   color.button.primary.background
```

## Implications for Delta Theme

This comparison was performed only after blind generation and does not alter the dataset.

With five models, the shared core is smaller but more trustworthy: the 32 all-five names are the strongest cross-model defaults in this sample. Delta already aligns on the universal roots (`color`, `space`, `radius`, `shadow`, `layout`, `breakpoint`). Its distinctive roles (`ink`, `ink-muted`, `action`, `on-action`, `title`) are not predicted consistently and still need an explicit semantic mapping.

Two new cautions from the added cohorts:

- An agent writing CSS directly (Fable's habit) will spell tokens as `--kebab-case`; Delta's generated `tokens.css` should remain the canonical surface so that path works without translation.
- `spacing` vs `space` and `shadow` vs `elevation` are vendor idiolects, not consensus. Delta should pick one and name the alias explicitly in its guidance rather than assume the agent will guess.

## Limitations

One sample per prompt per model at Cursor's default settings. Per-need percentages rest on five comparisons per model pair and are evidence, not estimates. Normalization treats `spacing` and `space` as different words on purpose. The 2,500 names cluster within 125 runs and are not independent. Results apply to these Cursor model configurations on 13 October 2026.

## Reproducibility

- Frozen prompts: `prompts/`
- Randomized schedule, five cohorts: `data/manifest.json` (schema version 4)
- Agent-to-run mapping: `data/agent-map.json`
- Raw captured responses and isolation metadata: `runs/`
- Strict validation: `data/validation.json`
- Normalized rows: `data/normalized.json`
- Matched tuples across all cohorts: `data/paired.json`
- Aggregate metrics: `data/analysis.json`
- Per-need, per-role, consensus, and vocabulary evidence: `data/concept-analysis.json`
- Pipeline: `npm run generate` → `npm run validate:protocol` → run trials → `node scripts/capture-all.mjs <transcripts>` → `npm run validate:runs` → `npm run analyze` → `node scripts/concept-analysis.mjs` → `node scripts/update-canvas-data.mjs`

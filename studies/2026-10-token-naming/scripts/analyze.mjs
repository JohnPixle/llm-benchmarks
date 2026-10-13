import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("data/manifest.json", root), "utf8"));
const validation = JSON.parse(
  await readFile(new URL("data/validation.json", root), "utf8"),
);

// Cohort order is fixed by the manifest so every downstream artefact lists
// models in the same sequence.
const cohortIds = Object.keys(manifest.cohorts);

function segments(token) {
  return token
    .normalize("NFC")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1.$2")
    .replace(/^--/, "")
    .split(/[.\-_/]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());
}

function syntax(token) {
  if (token.startsWith("--")) return "css-custom-property";
  if (token.includes(".")) return "dot-path";
  if (token.includes("/")) return "slash-path";
  if (token.includes("_")) return "snake-case";
  if (token.includes("-")) return "kebab-case";
  if (/[a-z][A-Z]/.test(token)) return "camel-case";
  return "single-segment";
}

const rows = [];
for (const run of manifest.runs) {
  const raw = (await readFile(new URL(`runs/${run.run_id}/response.txt`, root), "utf8")).trim();
  const strict = validation.find((result) => result.run_id === run.run_id);
  // Secondary recovery is intentionally simple and never mutates raw evidence:
  // parse from the first opening brace through the final closing brace.
  const recovered = strict.valid
    ? raw
    : raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  const parsed = JSON.parse(recovered);
  for (const item of parsed.items) {
    const parts = segments(item.token);
    rows.push({
      run_id: run.run_id,
      pair_key: run.pair_key,
      scenario_id: run.scenario_id,
      variant: run.variant,
      cohort: run.cohort,
      concept_id: item.concept_id,
      token: item.token,
      canonical: parts.join("."),
      segments: parts,
      segment_count: parts.length,
      root: parts[0] ?? "",
      syntax: syntax(item.token),
      strict_valid_run: strict.valid,
    });
  }
}

function pct(numerator, denominator) {
  return denominator ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;
}

function counts(values) {
  return Object.fromEntries(
    [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map())]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

const cohortMetrics = {};
for (const cohort of cohortIds) {
  const cohortRows = rows.filter((row) => row.cohort === cohort);
  const groups = new Map();
  for (const row of cohortRows) {
    const key = `${row.scenario_id}:${row.concept_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  let agreeingPairs = 0;
  let possiblePairs = 0;
  let unanimousConcepts = 0;
  for (const group of groups.values()) {
    const canonical = group.map((row) => row.canonical);
    if (new Set(canonical).size === 1) unanimousConcepts += 1;
    for (let a = 0; a < canonical.length; a += 1) {
      for (let b = a + 1; b < canonical.length; b += 1) {
        possiblePairs += 1;
        if (canonical[a] === canonical[b]) agreeingPairs += 1;
      }
    }
  }
  const cohortRuns = new Set(cohortRows.map((row) => row.run_id));
  cohortMetrics[cohort] = {
    label: manifest.cohorts[cohort].label,
    model: manifest.cohorts[cohort].model,
    runs: cohortRuns.size,
    strict_valid_runs: validation.filter((run) => cohortRuns.has(run.run_id) && run.valid).length,
    tokens: cohortRows.length,
    average_segments: Number(
      (cohortRows.reduce((sum, row) => sum + row.segment_count, 0) / cohortRows.length).toFixed(2),
    ),
    syntax: counts(cohortRows.map((row) => row.syntax)),
    root_segments: counts(cohortRows.map((row) => row.root)),
    unique_raw_names: new Set(cohortRows.map((row) => row.token)).size,
    unique_canonical_names: new Set(cohortRows.map((row) => row.canonical)).size,
    within_model_pairwise_agreement_pct: pct(agreeingPairs, possiblePairs),
    unanimous_concepts: unanimousConcepts,
    unanimous_concepts_pct: pct(unanimousConcepts, groups.size),
  };
}

// Every cohort answered every prompt once, so each (prompt, concept) cell is a
// matched tuple across all cohorts.
const cohortPairs = [];
for (let a = 0; a < cohortIds.length; a += 1) {
  for (let b = a + 1; b < cohortIds.length; b += 1) {
    cohortPairs.push([cohortIds[a], cohortIds[b]]);
  }
}
const pairKeyOf = (a, b) => `${a}__${b}`;

const paired = [];
for (const pair of manifest.pairs) {
  const pairRows = rows.filter((row) => row.pair_key === pair.pair_key);
  for (let index = 1; index <= 20; index += 1) {
    const conceptId = `${pair.scenario_id}-C${String(index).padStart(2, "0")}`;
    const byCohort = {};
    for (const cohort of cohortIds) {
      byCohort[cohort] = pairRows.find(
        (row) => row.cohort === cohort && row.concept_id === conceptId,
      );
    }
    const tokens = Object.fromEntries(cohortIds.map((c) => [c, byCohort[c].token]));
    const canonicals = Object.fromEntries(cohortIds.map((c) => [c, byCohort[c].canonical]));
    const matches = {};
    for (const [a, b] of cohortPairs) {
      matches[pairKeyOf(a, b)] = {
        raw: tokens[a] === tokens[b],
        canonical: canonicals[a] === canonicals[b],
      };
    }
    const distinct = new Set(Object.values(canonicals)).size;
    paired.push({
      pair_key: pair.pair_key,
      scenario_id: pair.scenario_id,
      concept_id: conceptId,
      tokens,
      canonicals,
      matches,
      distinct_canonical: distinct,
      all_agree: distinct === 1,
      // Largest number of cohorts that landed on the same canonical name.
      max_agreeing: Math.max(
        ...Object.values(counts(Object.values(canonicals))),
      ),
    });
  }
}

function summarize(subset) {
  const pairwise = {};
  for (const [a, b] of cohortPairs) {
    const key = pairKeyOf(a, b);
    pairwise[key] = {
      a,
      b,
      raw_match_pct: pct(subset.filter((row) => row.matches[key].raw).length, subset.length),
      canonical_match_pct: pct(
        subset.filter((row) => row.matches[key].canonical).length,
        subset.length,
      ),
    };
  }
  const agreeingCounts = counts(subset.map((row) => String(row.max_agreeing)));
  return {
    comparisons: subset.length,
    pairwise,
    all_models_canonical_match_pct: pct(subset.filter((row) => row.all_agree).length, subset.length),
    // Strict majority: more than half of the cohorts share one canonical name.
    majority_canonical_match_pct: pct(
      subset.filter((row) => row.max_agreeing > cohortIds.length / 2).length,
      subset.length,
    ),
    max_agreeing_distribution: Object.fromEntries(
      Array.from({ length: cohortIds.length }, (_, i) => [String(i + 1), agreeingCounts[String(i + 1)] ?? 0]),
    ),
    mean_pairwise_canonical_match_pct: Number(
      (
        Object.values(pairwise).reduce((sum, p) => sum + p.canonical_match_pct, 0) /
        Object.values(pairwise).length
      ).toFixed(1),
    ),
  };
}

const byScenario = {};
for (const scenarioId of ["S1", "S2", "S3", "S4", "S5"]) {
  byScenario[scenarioId] = summarize(paired.filter((row) => row.scenario_id === scenarioId));
}

const overall = summarize(paired);

const analysis = {
  generated_at: new Date().toISOString(),
  cohort_order: cohortIds,
  runs: new Set(rows.map((row) => row.run_id)).size,
  strict_valid_runs: validation.filter((run) => run.valid).length,
  strict_invalid_runs: validation.filter((run) => !run.valid).length,
  recovered_runs: validation.filter((run) => !run.valid).length,
  token_rows: rows.length,
  paired_comparisons: paired.length,
  overall,
  cohorts: cohortMetrics,
  scenarios: byScenario,
};

await writeFile(new URL("data/normalized.json", root), `${JSON.stringify(rows, null, 2)}\n`);
await writeFile(new URL("data/paired.json", root), `${JSON.stringify(paired, null, 2)}\n`);
await writeFile(new URL("data/analysis.json", root), `${JSON.stringify(analysis, null, 2)}\n`);
console.log(
  `Analyzed ${analysis.runs} runs and ${analysis.token_rows} token names across ${cohortIds.length} cohorts; all-model canonical agreement ${overall.all_models_canonical_match_pct}%, mean pairwise ${overall.mean_pairwise_canonical_match_pct}%.`,
);

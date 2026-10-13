import { readFile, writeFile } from "node:fs/promises";

// Embeds the analysis outputs into the report canvas between the DATA markers.
// The canvas is a single self-contained file, so every number it shows is
// written here from data/*.json rather than typed by hand.

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("data/manifest.json", root), "utf8"));
const analysis = JSON.parse(await readFile(new URL("data/analysis.json", root), "utf8"));
const concepts = JSON.parse(await readFile(new URL("data/concept-analysis.json", root), "utf8"));
const rows = JSON.parse(await readFile(new URL("data/normalized.json", root), "utf8"));
const canvasPath =
  "/Users/john/.cursor/projects/Users-john-Documents-LLM-Benchmarks/canvases/token-naming-benchmark-report.canvas.tsx";
const canvas = await readFile(canvasPath, "utf8");

const cohortIds = analysis.cohort_order;

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

// Root families: merge spelling variants that mean the same category so the
// chart compares vocabulary choices rather than singular/plural noise.
const rootFamilies = [
  ["color", ["color", "colour"]],
  ["typography", ["typography", "type", "text", "font"]],
  ["space / spacing", ["space", "spacing"]],
  ["radius", ["radius"]],
  ["shadow / elevation", ["shadow", "elevation"]],
  ["breakpoint", ["breakpoint"]],
  ["button", ["button"]],
  ["layout / size", ["layout", "size"]],
  ["card", ["card"]],
  ["component", ["component", "components"]],
];

const cohorts = cohortIds.map((id) => {
  const metrics = analysis.cohorts[id];
  const cohortRows = rows.filter((row) => row.cohort === id);
  const segmentCounts = countBy(cohortRows.map((row) => Math.min(row.segment_count, 6)));
  const rootCounts = countBy(cohortRows.map((row) => row.root));
  return {
    id,
    label: metrics.label,
    model: metrics.model,
    runs: metrics.runs,
    strict_valid_runs: metrics.strict_valid_runs,
    average_segments: metrics.average_segments,
    unique_canonical: metrics.unique_canonical_names,
    unique_raw: metrics.unique_raw_names,
    within_model_agreement_pct: metrics.within_model_pairwise_agreement_pct,
    unanimous_concepts: metrics.unanimous_concepts,
    syntax: metrics.syntax,
    segment_distribution: [1, 2, 3, 4, 5, 6].map((n) => segmentCounts.get(n) ?? 0),
    root_families: rootFamilies.map(([family, roots]) => ({
      family,
      count: roots.reduce((sum, rootName) => sum + (rootCounts.get(rootName) ?? 0), 0),
    })),
    vocabulary: concepts.vocabulary[id].slice(0, 18),
  };
});

const pairwise = Object.values(analysis.overall.pairwise).map((pair) => ({
  a: pair.a,
  b: pair.b,
  raw: pair.raw_match_pct,
  canonical: pair.canonical_match_pct,
}));

const scenarioTitles = Object.fromEntries(
  manifest.pairs.filter((pair) => pair.variant === 1).map((pair) => [pair.scenario_id, pair.scenario_id]),
);
for (const concept of concepts.concepts) scenarioTitles[concept.scenario_id] = concept.scenario_title;

const scenarios = Object.entries(analysis.scenarios).map(([id, metrics]) => ({
  id,
  title: scenarioTitles[id],
  all_four: metrics.all_models_canonical_match_pct,
  majority: metrics.majority_canonical_match_pct,
  mean_pairwise: metrics.mean_pairwise_canonical_match_pct,
  pairwise: Object.fromEntries(
    Object.entries(metrics.pairwise).map(([key, pair]) => [key, pair.canonical_match_pct]),
  ),
}));

const roles = concepts.roles.map((role) => ({
  role: role.role,
  all_four: role.all_models_match_pct,
  majority: role.majority_match_pct,
  pairwise: Object.fromEntries(
    Object.entries(role.pairwise).map(([key, pair]) => [key, pair.canonical_match_pct]),
  ),
  common_names: role.common_names.slice(0, 8).map((name) => ({
    name: name.name,
    counts: name.counts,
    cohorts: name.cohorts,
  })),
}));

const conceptEvidence = concepts.concepts.map((concept) => ({
  scenario_id: concept.scenario_id,
  concept_id: concept.concept_id,
  description: concept.description,
  role: concept.role,
  all_four: concept.all_models_match_pct,
  majority: concept.majority_match_pct,
  unique_canonical: concept.unique_canonical,
  top: concept.top,
  shared: concept.shared_names.slice(0, 4).map((name) => ({
    name: name.name,
    counts: name.counts,
    spellings: name.spellings,
    cohorts: name.cohorts,
  })),
}));

const consensus = concepts.global_common_names
  .filter((name) => name.cohorts >= 3)
  .map((name) => ({
    name: name.name,
    counts: name.counts,
    cohorts: name.cohorts,
    concepts: name.concepts,
  }));

const data = {
  generated_at: analysis.generated_at.slice(0, 10),
  runs: analysis.runs,
  token_rows: analysis.token_rows,
  strict_invalid_runs: analysis.strict_invalid_runs,
  comparisons: analysis.paired_comparisons,
  all_four_pct: analysis.overall.all_models_canonical_match_pct,
  majority_pct: analysis.overall.majority_canonical_match_pct,
  mean_pairwise_pct: analysis.overall.mean_pairwise_canonical_match_pct,
  agreement_distribution: Array.from({ length: cohortIds.length }, (_, index) => index + 1).map(
    (n) => analysis.overall.max_agreeing_distribution[String(n)] ?? 0,
  ),
  cohorts,
  pairwise,
  scenarios,
  roles,
  concepts: conceptEvidence,
  consensus,
};

const replacement = `// DATA_START
const data: BenchmarkData = ${JSON.stringify(data)};
// DATA_END`;
const markers = /\/\/ DATA_START[\s\S]*?\/\/ DATA_END/;
if (!markers.test(canvas)) throw new Error("Canvas data markers were not found");
const updated = canvas.replace(markers, replacement);
if (updated !== canvas) await writeFile(canvasPath, updated);
console.log(
  `Embedded ${conceptEvidence.length} concepts, ${consensus.length} consensus names, ${cohorts.length} cohorts in the canvas.`,
);

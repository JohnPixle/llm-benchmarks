import { readFile, writeFile } from "node:fs/promises";
import { scenarios } from "./scenarios.mjs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("data/manifest.json", root), "utf8"));
const rows = JSON.parse(await readFile(new URL("data/normalized.json", root), "utf8"));
const paired = JSON.parse(await readFile(new URL("data/paired.json", root), "utf8"));

const cohortIds = Object.keys(manifest.cohorts);

const roleRanges = [
  ["Primitives", 1, 4],
  ["Semantics", 5, 8],
  ["Typography", 9, 12],
  ["Foundations", 13, 16],
  ["Components", 17, 20],
];

function roleFor(conceptId) {
  const number = Number(conceptId.slice(-2));
  return roleRanges.find(([, start, end]) => number >= start && number <= end)[0];
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function topRaw(conceptRows, limit = 4) {
  return countBy(conceptRows.map((row) => row.token))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function representative(conceptRows, canonical) {
  return countBy(
    conceptRows.filter((row) => row.canonical === canonical).map((row) => row.token),
  )[0]?.[0];
}

function pct(n, d) {
  return d ? Number(((n / d) * 100).toFixed(1)) : 0;
}

// A "shared name" record: one canonical name with a per-cohort count, the most
// frequent raw spelling per cohort, and how many cohorts used it at all.
function sharedRecord(name, subsetRows) {
  const counts = {};
  const spellings = {};
  for (const cohort of cohortIds) {
    const cohortRows = subsetRows.filter((row) => row.cohort === cohort && row.canonical === name);
    counts[cohort] = cohortRows.length;
    spellings[cohort] = cohortRows.length ? representative(cohortRows, name) : null;
  }
  const present = cohortIds.filter((cohort) => counts[cohort] > 0);
  const presentCounts = present.map((cohort) => counts[cohort]);
  return {
    name,
    counts,
    spellings,
    cohorts: present.length,
    total: presentCounts.reduce((sum, value) => sum + value, 0),
    // Floor across cohorts that used it: how many times *every* model that
    // reached this name did so.
    floor: present.length ? Math.min(...presentCounts) : 0,
  };
}

function rankShared(a, b) {
  return b.cohorts - a.cohorts || b.floor - a.floor || b.total - a.total || a.name.localeCompare(b.name);
}

const concepts = [];
for (const scenario of scenarios) {
  const descriptions = Object.values(scenario.concepts).flat();
  for (const [conceptId, description] of descriptions) {
    const conceptRows = rows.filter((row) => row.concept_id === conceptId);
    const conceptPairs = paired.filter((row) => row.concept_id === conceptId);
    const top = Object.fromEntries(
      cohortIds.map((cohort) => [cohort, topRaw(conceptRows.filter((row) => row.cohort === cohort))]),
    );
    const shared = [...new Set(conceptRows.map((row) => row.canonical))]
      .map((name) => sharedRecord(name, conceptRows))
      .filter((record) => record.cohorts >= 2)
      .sort(rankShared);
    const pairwise = {};
    for (const key of Object.keys(conceptPairs[0].matches)) {
      pairwise[key] = pct(conceptPairs.filter((row) => row.matches[key].canonical).length, conceptPairs.length);
    }
    concepts.push({
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      concept_id: conceptId,
      description,
      role: roleFor(conceptId),
      all_models_match_pct: pct(conceptPairs.filter((row) => row.all_agree).length, conceptPairs.length),
      majority_match_pct: pct(
        conceptPairs.filter((row) => row.max_agreeing > cohortIds.length / 2).length,
        conceptPairs.length,
      ),
      pairwise_canonical_match_pct: pairwise,
      unique_canonical: new Set(conceptRows.map((row) => row.canonical)).size,
      top,
      shared_names: shared,
    });
  }
}

const roles = roleRanges.map(([role]) => {
  const conceptIds = new Set(
    concepts.filter((concept) => concept.role === role).map((concept) => concept.concept_id),
  );
  const rolePairs = paired.filter((row) => conceptIds.has(row.concept_id));
  const roleRows = rows.filter((row) => conceptIds.has(row.concept_id));
  const pairwise = {};
  for (const key of Object.keys(rolePairs[0].matches)) {
    pairwise[key] = {
      raw_match_pct: pct(rolePairs.filter((row) => row.matches[key].raw).length, rolePairs.length),
      canonical_match_pct: pct(
        rolePairs.filter((row) => row.matches[key].canonical).length,
        rolePairs.length,
      ),
    };
  }
  const common = [...new Set(roleRows.map((row) => row.canonical))]
    .map((name) => sharedRecord(name, roleRows))
    .filter((record) => record.cohorts >= 2)
    .sort(rankShared);
  return {
    role,
    comparisons: rolePairs.length,
    all_models_match_pct: pct(rolePairs.filter((row) => row.all_agree).length, rolePairs.length),
    majority_match_pct: pct(
      rolePairs.filter((row) => row.max_agreeing > cohortIds.length / 2).length,
      rolePairs.length,
    ),
    pairwise,
    common_names: common.slice(0, 12),
    syntax_by_cohort: Object.fromEntries(
      cohortIds.map((cohort) => [
        cohort,
        Object.fromEntries(countBy(roleRows.filter((row) => row.cohort === cohort).map((row) => row.syntax))),
      ]),
    ),
  };
});

const globalCommon = [...new Set(rows.map((row) => row.canonical))]
  .map((name) => {
    const record = sharedRecord(name, rows);
    record.concepts = new Set(rows.filter((row) => row.canonical === name).map((row) => row.concept_id)).size;
    return record;
  })
  .filter((record) => record.cohorts >= 2)
  .sort(rankShared);

// Vocabulary fingerprint: for each cohort, the most used segment words anywhere
// in the identifier (not only the root). Useful for "how do they think" views.
const vocabulary = Object.fromEntries(
  cohortIds.map((cohort) => [
    cohort,
    countBy(rows.filter((row) => row.cohort === cohort).flatMap((row) => row.segments))
      .slice(0, 25)
      .map(([word, count]) => ({ word, count })),
  ]),
);

await writeFile(
  new URL("data/concept-analysis.json", root),
  `${JSON.stringify(
    { cohort_order: cohortIds, concepts, roles, global_common_names: globalCommon, vocabulary },
    null,
    2,
  )}\n`,
);
console.log(
  `Built concept evidence for ${concepts.length} needs, ${roles.length} roles, and ${globalCommon.length} canonical names shared by 2+ models (${globalCommon.filter((r) => r.cohorts === cohortIds.length).length} by all).`,
);

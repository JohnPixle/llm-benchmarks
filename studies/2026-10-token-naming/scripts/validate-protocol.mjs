import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { blocks, scenarios } from "./scenarios.mjs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("data/manifest.json", root), "utf8"),
);
const errors = [];

if (scenarios.length !== 5) errors.push(`Expected 5 scenarios, got ${scenarios.length}`);
if (manifest.pairs.length !== 25) errors.push(`Expected 25 pairs, got ${manifest.pairs.length}`);
if (manifest.runs.length !== 125) errors.push(`Expected 125 runs, got ${manifest.runs.length}`);

for (const scenario of scenarios) {
  const ids = blocks.flatMap((block) => scenario.concepts[block].map(([id]) => id));
  if (ids.length !== 20) errors.push(`${scenario.id} has ${ids.length} concepts`);
  if (new Set(ids).size !== ids.length) errors.push(`${scenario.id} has duplicate concept IDs`);
  for (const block of blocks) {
    if (scenario.concepts[block]?.length !== 4) {
      errors.push(`${scenario.id}/${block} must contain 4 concepts`);
    }
  }

  const variants = manifest.pairs.filter((pair) => pair.scenario_id === scenario.id);
  for (const block of blocks) {
    const positions = variants.map((variant) => variant.block_order.indexOf(block)).sort();
    if (positions.join(",") !== "0,1,2,3,4") {
      errors.push(`${scenario.id}/${block} is not position-balanced`);
    }
  }
}

for (const pair of manifest.pairs) {
  const text = await readFile(new URL(pair.prompt_file, root), "utf8");
  const digest = createHash("sha256").update(text).digest("hex");
  if (digest !== pair.prompt_sha256) errors.push(`${pair.pair_key} prompt hash mismatch`);
  if (/delta|21press/i.test(text)) errors.push(`${pair.pair_key} leaks a forbidden reference`);
}

for (const cohort of ["claude", "gpt", "fable", "grok", "muse"]) {
  const count = manifest.runs.filter((run) => run.cohort === cohort).length;
  if (count !== 25) errors.push(`Expected 25 ${cohort} runs, got ${count}`);
}
// The original two-cohort schedule (sequences 1-50) must be unchanged.
const original = manifest.runs.filter((run) => run.sequence <= 50);
if (original.some((run) => !["claude", "gpt"].includes(run.cohort))) {
  errors.push("Additional cohorts must be appended after sequence 50");
}
const claudeFirst = manifest.pairs.filter((pair) => {
  const pairRuns = original.filter((run) => run.pair_key === pair.pair_key);
  return pairRuns[0]?.cohort === "claude";
}).length;
if (claudeFirst !== 13) errors.push(`Expected 13 Claude-first pairs, got ${claudeFirst}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Protocol valid: 5 scenarios, 25 balanced prompts, 125 runs across 5 cohorts, no forbidden references.");

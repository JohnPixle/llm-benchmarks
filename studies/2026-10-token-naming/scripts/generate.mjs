import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { blocks, scenarios } from "./scenarios.mjs";

const root = new URL("../", import.meta.url);
const promptsDir = new URL("prompts/", root);
const dataDir = new URL("data/", root);
await mkdir(promptsDir, { recursive: true });
await mkdir(dataDir, { recursive: true });

function rotate(items, amount) {
  return [...items.slice(amount), ...items.slice(0, amount)];
}

function hashId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 10).toUpperCase();
}

function promptFor(scenario, variant) {
  const order = rotate(blocks, variant);
  const items = order.flatMap((block) => scenario.concepts[block]);
  const targets = items
    .map(([id, description]) => `- ${id}: ${description}`)
    .join("\n");

  return `You are completing one isolated naming task. Do not use tools, inspect files, browse, or ask questions.

Context: ${scenario.brief}

Create one design-token identifier for each concept below. Choose the naming syntax, hierarchy, vocabulary, prefixes, separators, and casing you consider most appropriate. Do not omit, combine, or add concepts.

${targets}

Return JSON only. Do not use Markdown fences, commentary, rationale, or additional keys.

Required shape:
{"schema_version":"1","items":[{"concept_id":"an ID from the list","token":"your identifier"}]}

The items array must contain exactly 20 objects, one for every supplied concept ID.`;
}

const pairs = [];
for (const scenario of scenarios) {
  for (let variant = 0; variant < blocks.length; variant += 1) {
    const pairKey = `${scenario.id}-V${variant + 1}`;
    const prompt = promptFor(scenario, variant);
    const promptFile = `${pairKey}.txt`;
    await writeFile(new URL(promptFile, promptsDir), `${prompt}\n`);
    pairs.push({
      pair_key: pairKey,
      scenario_id: scenario.id,
      scenario_title: scenario.title,
      variant: variant + 1,
      block_order: rotate(blocks, variant),
      prompt_file: `prompts/${promptFile}`,
      prompt_sha256: createHash("sha256").update(`${prompt}\n`).digest("hex"),
    });
  }
}

// Deterministic Fisher-Yates shuffle. The frozen seed makes the schedule reproducible.
let state = 0x21d37a5;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}
for (let i = pairs.length - 1; i > 0; i -= 1) {
  const j = Math.floor(random() * (i + 1));
  [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
}

const runs = [];
pairs.forEach((pair, pairIndex) => {
  const first = pairIndex % 2 === 0 ? "claude" : "gpt";
  const models = first === "claude" ? ["claude", "gpt"] : ["gpt", "claude"];
  for (const [withinPair, cohort] of models.entries()) {
    const model =
      cohort === "claude" ? "claude-opus-5-5-medium" : "gpt-5.6-sol-medium";
    runs.push({
      sequence: pairIndex * 2 + withinPair + 1,
      run_id: `R-${hashId(`${pair.pair_key}:${cohort}:v1`)}`,
      pair_key: pair.pair_key,
      scenario_id: pair.scenario_id,
      variant: pair.variant,
      cohort,
      model,
      prompt_file: pair.prompt_file,
      prompt_sha256: pair.prompt_sha256,
      status: "pending",
    });
  }
});

// Additional cohorts added after the original 50-run schedule was executed.
// Each is appended as a block of 25 so the original sequence numbers and run
// IDs stay unchanged. Same 25 frozen prompts, same shuffled order.
const extraCohorts = [
  { cohort: "fable", model: "claude-fable-5-1-thinking-high" },
  { cohort: "grok", model: "grok-4.7-high-fast" },
  { cohort: "muse", model: "muse-spark-1.3-high" },
];
extraCohorts.forEach(({ cohort, model }, cohortIndex) => {
  pairs.forEach((pair, pairIndex) => {
    runs.push({
      sequence: 50 + cohortIndex * 25 + pairIndex + 1,
      run_id: `R-${hashId(`${pair.pair_key}:${cohort}:v1`)}`,
      pair_key: pair.pair_key,
      scenario_id: pair.scenario_id,
      variant: pair.variant,
      cohort,
      model,
      prompt_file: pair.prompt_file,
      prompt_sha256: pair.prompt_sha256,
      status: "pending",
    });
  });
});

const manifest = {
  schema_version: "4",
  generated_at: "2026-10-13",
  seed: "0x021d37a5",
  design: "5 scenarios × 5 order variants × 5 matched models",
  cohorts: {
    claude: { label: "Claude Opus 5.5", model: "claude-opus-5-5-medium" },
    gpt: { label: "GPT-5.6 Sol", model: "gpt-5.6-sol-medium" },
    fable: { label: "Claude Fable 5.1", model: "claude-fable-5-1-thinking-high" },
    grok: { label: "Grok 4.7", model: "grok-4.7-high-fast" },
    muse: { label: "Muse Spark 1.3", model: "muse-spark-1.3-high" },
  },
  pairs,
  runs,
};

await writeFile(
  new URL("manifest.json", dataDir),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${pairs.length} prompts and ${runs.length} scheduled runs.`);

import { readdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("data/manifest.json", root), "utf8"),
);
const expectedByScenario = new Map(
  manifest.pairs
    .filter((pair) => pair.variant === 1)
    .map((pair) => [
      pair.scenario_id,
      new Set(
        Array.from({ length: 20 }, (_, index) =>
          `${pair.scenario_id}-C${String(index + 1).padStart(2, "0")}`,
        ),
      ),
    ]),
);

function validate(run, raw) {
  const errors = [];
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    errors.push("invalid-json");
    return { valid: false, errors, parsed: null };
  }
  if (parsed.schema_version !== "1") errors.push("wrong-schema-version");
  if (!Array.isArray(parsed.items)) {
    errors.push("items-not-array");
    return { valid: false, errors, parsed };
  }
  if (parsed.items.length !== 20) errors.push(`wrong-item-count:${parsed.items.length}`);
  const expected = expectedByScenario.get(run.scenario_id);
  const seen = new Set();
  for (const item of parsed.items) {
    if (!item || typeof item !== "object") {
      errors.push("item-not-object");
      continue;
    }
    const keys = Object.keys(item).sort().join(",");
    if (keys !== "concept_id,token") errors.push(`unexpected-item-keys:${keys}`);
    if (!expected.has(item.concept_id)) errors.push(`unexpected-id:${item.concept_id}`);
    if (seen.has(item.concept_id)) errors.push(`duplicate-id:${item.concept_id}`);
    seen.add(item.concept_id);
    if (typeof item.token !== "string" || !item.token.trim()) {
      errors.push(`empty-token:${item.concept_id}`);
    } else {
      if (item.token !== item.token.trim()) errors.push(`outer-whitespace:${item.concept_id}`);
      if (/\s/.test(item.token)) errors.push(`internal-whitespace:${item.concept_id}`);
    }
  }
  for (const id of expected) if (!seen.has(id)) errors.push(`missing-id:${id}`);
  return { valid: errors.length === 0, errors: [...new Set(errors)], parsed };
}

let present = [];
try {
  present = await readdir(new URL("runs/", root));
} catch {
  // No runs yet.
}

const results = [];
for (const run of manifest.runs) {
  if (!present.includes(run.run_id)) {
    results.push({ run_id: run.run_id, status: "missing", valid: false, errors: ["missing-run"] });
    continue;
  }
  const raw = (await readFile(new URL(`runs/${run.run_id}/response.txt`, root), "utf8")).trim();
  const checked = validate(run, raw);
  results.push({
    run_id: run.run_id,
    pair_key: run.pair_key,
    cohort: run.cohort,
    status: "captured",
    valid: checked.valid,
    errors: checked.errors,
  });
  await writeFile(
    new URL(`runs/${run.run_id}/validation.json`, root),
    `${JSON.stringify({ valid: checked.valid, errors: checked.errors }, null, 2)}\n`,
  );
}

await writeFile(
  new URL("data/validation.json", root),
  `${JSON.stringify(results, null, 2)}\n`,
);
const valid = results.filter((result) => result.valid).length;
const missing = results.filter((result) => result.status === "missing").length;
console.log(`Runs: ${valid} valid, ${results.length - valid - missing} invalid, ${missing} missing.`);
if (missing || valid !== results.length) process.exitCode = 1;

import { mkdir, readFile, writeFile } from "node:fs/promises";

const transcriptDir = process.argv[2];
if (!transcriptDir) {
  console.error("Usage: node scripts/capture-all.mjs <subagent-transcript-directory>");
  process.exit(2);
}

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("data/manifest.json", root), "utf8"));
const agentMap = JSON.parse(await readFile(new URL("data/agent-map.json", root), "utf8"));
let captured = 0;
let pending = 0;

for (const mapping of agentMap) {
  const path = `${transcriptDir}/${mapping.agent_id}.jsonl`;
  let lines;
  try {
    lines = (await readFile(path, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    pending += 1;
    continue;
  }
  const ended = lines.find((line) => line.type === "turn_ended");
  if (!ended) {
    pending += 1;
    continue;
  }
  const run = manifest.runs.find((candidate) => candidate.run_id === mapping.run_id);
  const assistantMessages = lines.filter((line) => line.role === "assistant");
  const textParts = assistantMessages.flatMap((line) =>
    (line.message?.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => part.text),
  );
  if (!textParts.length) {
    pending += 1;
    continue;
  }
  const toolNames = assistantMessages.flatMap((line) =>
    (line.message?.content ?? [])
      .filter((part) => part.type === "tool_use")
      .map((part) => part.name),
  );
  const runDir = new URL(`runs/${run.run_id}/`, root);
  await mkdir(runDir, { recursive: true });
  await writeFile(new URL("response.txt", runDir), `${textParts.at(-1)}\n`);
  await writeFile(
    new URL("meta.json", runDir),
    `${JSON.stringify(
      {
        ...run,
        agent_id: mapping.agent_id,
        captured_at: new Date().toISOString(),
        completion_status: ended.status,
        agent_tool_calls: toolNames,
        isolation_status: toolNames.length === 0 ? "clean" : "tool-use-detected",
      },
      null,
      2,
    )}\n`,
  );
  captured += 1;
}

console.log(`Captured ${captured}/${agentMap.length}; ${pending} pending.`);
if (pending) process.exitCode = 2;

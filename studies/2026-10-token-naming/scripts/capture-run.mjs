import { mkdir, readFile, writeFile } from "node:fs/promises";

const [runId, agentId, transcriptPath] = process.argv.slice(2);
if (!runId || !agentId || !transcriptPath) {
  console.error("Usage: node scripts/capture-run.mjs <run-id> <agent-id> <transcript.jsonl>");
  process.exit(2);
}

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("data/manifest.json", root), "utf8"),
);
const run = manifest.runs.find((candidate) => candidate.run_id === runId);
if (!run) throw new Error(`Unknown run ID: ${runId}`);

const lines = (await readFile(transcriptPath, "utf8"))
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
const assistantMessages = lines.filter((line) => line.role === "assistant");
const textParts = assistantMessages.flatMap((line) =>
  (line.message?.content ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text),
);
if (!textParts.length) throw new Error(`No assistant text found for ${runId}`);

const response = textParts.at(-1);
const toolCalls = assistantMessages.flatMap((line) =>
  (line.message?.content ?? []).filter((part) => part.type === "tool_use"),
);
const runDir = new URL(`runs/${runId}/`, root);
await mkdir(runDir, { recursive: true });
await writeFile(new URL("response.txt", runDir), `${response}\n`);
await writeFile(
  new URL("meta.json", runDir),
  `${JSON.stringify(
    {
      ...run,
      agent_id: agentId,
      captured_at: new Date().toISOString(),
      agent_tool_call_count: toolCalls.length,
      isolation_status: toolCalls.length === 0 ? "clean" : "tool-use-detected",
    },
    null,
    2,
  )}\n`,
);
console.log(`Captured ${runId}; tool calls: ${toolCalls.length}`);

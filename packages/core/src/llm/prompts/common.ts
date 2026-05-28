import type { AgentOutputs, RepositorySnapshot } from "@harnesskit/shared";

export function buildRepositoryContext(snapshot: RepositorySnapshot, previousOutputs?: Partial<AgentOutputs>): string {
  return [
    "# Repository snapshot",
    `Root: ${snapshot.rootPath}`,
    `Generated at: ${snapshot.generatedAt}`,
    "",
    "## File tree",
    snapshot.fileTree,
    "",
    "## Important files",
    JSON.stringify(snapshot.importantFiles, null, 2),
    "",
    "## Deep module summaries",
    snapshot.moduleSummaries && snapshot.moduleSummaries.length > 0
      ? JSON.stringify(snapshot.moduleSummaries, null, 2)
      : "Not enabled or no module summaries detected.",
    "",
    "## Selection warnings",
    snapshot.selectionWarnings && snapshot.selectionWarnings.length > 0
      ? snapshot.selectionWarnings.map((warning) => `- ${warning}`).join("\n")
      : "None.",
    "",
    "## Package files",
    renderFiles(snapshot.packageFiles),
    "",
    "## Config files",
    renderFiles(snapshot.configFiles),
    "",
    "## Documentation",
    renderFiles(snapshot.documentationFiles),
    "",
    "## Source samples",
    renderFiles(snapshot.sourceSamples),
    "",
    "## Test samples",
    renderFiles(snapshot.testSamples),
    previousOutputs ? ["", "## Previous agent outputs", JSON.stringify(previousOutputs, null, 2)].join("\n") : ""
  ].join("\n");
}

function renderFiles(files: Array<{ path: string; content: string }>): string {
  if (files.length === 0) return "None detected.";
  return files.map((file) => `### ${file.path}\n\`\`\`\n${file.content}\n\`\`\``).join("\n\n");
}

export const agentSystemPrompt = [
  "You are a senior software architecture consultant preparing repositories for reliable AI coding-agent work.",
  "Use only evidence from the repository snapshot. If you infer something, say that it is inferred and requires human validation.",
  "Prefer concrete file paths as evidence. Do not invent architecture, commands, models, or integrations.",
  "Be stack-agnostic and describe the project as it is, not as a generic template."
].join("\n");

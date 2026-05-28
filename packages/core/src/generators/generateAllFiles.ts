import type { AgentOutputs, GeneratedFile, RepositorySnapshot } from "@harnesskit/shared";
import { generateAgentsMd } from "./generateAgentsMd.js";
import { generateAuditReport } from "./generateAuditReport.js";
import { generateClaudeMd } from "./generateClaudeMd.js";
import { generateCopilotInstructions } from "./generateCopilotInstructions.js";
import { generateCursorRules } from "./generateCursorRules.js";
import { generateHarnessProject } from "./generateHarnessProject.js";
import { generateMarkdownDocs } from "./generateMarkdownDocs.js";
import { generatePlaybooks } from "./generatePlaybooks.js";
import { generatePromptPack } from "./generatePromptPack.js";

export function generateAllFiles(snapshot: RepositorySnapshot, outputs: AgentOutputs): GeneratedFile[] {
  return [
    generateClaudeMd(outputs),
    generateAgentsMd(outputs),
    generateCursorRules(outputs),
    generateCopilotInstructions(outputs),
    generateHarnessProject(outputs),
    generateAuditReport(outputs),
    ...generateMarkdownDocs(outputs),
    ...generatePlaybooks(outputs),
    ...generatePromptPack(outputs),
    {
      path: ".harnesskit/internal/repository-snapshot.json",
      content: `${JSON.stringify(snapshot, null, 2)}\n`
    },
    {
      path: ".harnesskit/internal/agent-outputs.json",
      content: `${JSON.stringify(outputs, null, 2)}\n`
    },
    {
      path: ".harnesskit/internal/file-tree.md",
      content: `${snapshot.fileTree}\n`
    },
    {
      path: ".harnesskit/internal/important-files.json",
      content: `${JSON.stringify(snapshot.importantFiles, null, 2)}\n`
    }
  ];
}

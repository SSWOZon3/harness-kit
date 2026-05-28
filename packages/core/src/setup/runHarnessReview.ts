import path from "node:path";
import type { AgentOutputs, GeneratedFile, RepositorySnapshot } from "@harnesskit/shared";
import { FinalReviewAgent } from "../agents/FinalReviewAgent.js";
import { generateAllFiles } from "../generators/generateAllFiles.js";
import type { LlmProvider } from "../llm/LlmProvider.js";
import { safeWriteFile } from "../output/safeWriteFile.js";
import { writeHarnessFiles } from "../output/writeHarnessFiles.js";
import { readAgentOutputs, readSnapshot } from "./SetupPipeline.js";

export type RunHarnessReviewOptions = {
  rootPath: string;
  llm: LlmProvider;
  regenerate?: boolean;
  force?: boolean;
  backup?: boolean;
  dryRun?: boolean;
};

export type RunHarnessReviewResult = {
  snapshot: RepositorySnapshot;
  outputs: AgentOutputs;
  files: GeneratedFile[];
  writtenFiles: string[];
};

export async function runHarnessReview(options: RunHarnessReviewOptions): Promise<RunHarnessReviewResult> {
  const rootPath = path.resolve(options.rootPath);
  const snapshot = await readSnapshot(rootPath);
  const outputs = await readAgentOutputs(rootPath);
  const finalReview = await new FinalReviewAgent().run({
    snapshot,
    llm: options.llm,
    previousOutputs: outputs
  });
  const updated = { ...outputs, finalReview };
  const regenerate = options.regenerate ?? true;

  if (regenerate) {
    const files = generateAllFiles(snapshot, updated);
    const writtenFiles = await writeHarnessFiles({
      rootPath,
      files,
      force: options.force,
      backup: options.backup,
      dryRun: options.dryRun
    });
    return { snapshot, outputs: updated, files, writtenFiles };
  }

  const writtenFiles: string[] = [];
  const agentOutputs = await safeWriteFile({
    rootPath,
    relativePath: ".harnesskit/internal/agent-outputs.json",
    content: `${JSON.stringify(updated, null, 2)}\n`,
    dryRun: options.dryRun
  });
  if (!agentOutputs.skipped) writtenFiles.push(agentOutputs.path);

  const finalReviewFile = await safeWriteFile({
    rootPath,
    relativePath: ".harnesskit/internal/final-review.json",
    content: `${JSON.stringify(finalReview, null, 2)}\n`,
    dryRun: options.dryRun
  });
  if (!finalReviewFile.skipped) writtenFiles.push(finalReviewFile.path);

  return { snapshot, outputs: updated, files: [], writtenFiles };
}

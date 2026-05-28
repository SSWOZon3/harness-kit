import path from "node:path";
import fs from "fs-extra";
import type { AgentOutputs, GeneratedFile, RepositorySnapshot } from "@harnesskit/shared";
import { AgentOrchestrator, type AgentProgress } from "../agents/AgentOrchestrator.js";
import type { LlmProvider } from "../llm/LlmProvider.js";
import { createRepositorySnapshot } from "../project-scanner/createRepositorySnapshot.js";
import { generateAllFiles } from "../generators/generateAllFiles.js";
import { writeHarnessFiles } from "../output/writeHarnessFiles.js";

export type SetupPipelineOptions = {
  rootPath: string;
  llm: LlmProvider;
  force?: boolean;
  backup?: boolean;
  dryRun?: boolean;
  deep?: boolean;
  maxFiles?: number;
  maxFileSizeKb?: number;
  onProgress?: AgentProgress;
};

export type SetupPipelineResult = {
  snapshot: RepositorySnapshot;
  outputs: AgentOutputs;
  files: GeneratedFile[];
  writtenFiles: string[];
};

export class SetupPipeline {
  constructor(private readonly options: SetupPipelineOptions) {}

  async run(): Promise<SetupPipelineResult> {
    const rootPath = path.resolve(this.options.rootPath);
    const snapshot = await createRepositorySnapshot({
      rootPath,
      deep: this.options.deep,
      maxFiles: this.options.maxFiles,
      maxFileSizeKb: this.options.maxFileSizeKb
    });
    this.options.onProgress?.("Repository scanned");
    this.options.onProgress?.("File tree generated");
    this.options.onProgress?.("Important files selected");
    if (this.options.deep) this.options.onProgress?.("Deep module sampling completed");

    const outputs = await new AgentOrchestrator(this.options.llm, this.options.onProgress).run(snapshot);
    const files = generateAllFiles(snapshot, outputs);
    const writtenFiles = await writeHarnessFiles({
      rootPath,
      files,
      force: this.options.force,
      backup: this.options.backup,
      dryRun: this.options.dryRun
    });
    this.options.onProgress?.("Files written");
    return { snapshot, outputs, files, writtenFiles };
  }
}

export async function readSnapshot(rootPath: string): Promise<RepositorySnapshot> {
  return fs.readJson(path.join(rootPath, ".harnesskit/internal/repository-snapshot.json"));
}

export async function readAgentOutputs(rootPath: string): Promise<AgentOutputs> {
  return fs.readJson(path.join(rootPath, ".harnesskit/internal/agent-outputs.json"));
}

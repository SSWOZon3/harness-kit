import { Command } from "commander";
import chalk from "chalk";
import { AgentOrchestrator, generateAllFiles, readSnapshot, writeHarnessFiles } from "@harnesskit/core";
import { createProvider, handleError, printGenerated, resolveTargetPath, withSpinner } from "./shared.js";

export function generateCommand(): Command {
  return new Command("generate")
    .description("Run agents against an existing repository snapshot and generate HarnessKit files.")
    .requiredOption("--path <path>", "Repository path")
    .option("--force", "Overwrite existing files", false)
    .option("--no-backup", "Do not create .bak.harnesskit backups")
    .option("--dry-run", "Run without writing files", false)
    .action(async (options) => {
      try {
        const rootPath = resolveTargetPath(options.path);
        const llm = createProvider();
        const snapshot = await readSnapshot(rootPath);
        const outputs = await withSpinner("Running HarnessKit agents", (progress) => {
          const orchestrator = new AgentOrchestrator(llm, progress);
          return orchestrator.run(snapshot);
        });
        const files = generateAllFiles(snapshot, outputs);
        const written = await writeHarnessFiles({
          rootPath,
          files,
          force: options.force,
          backup: options.backup,
          dryRun: options.dryRun
        });
        console.log(chalk.green("HarnessKit files generated"));
        printGenerated(written);
      } catch (error) {
        handleError(error);
      }
    });
}

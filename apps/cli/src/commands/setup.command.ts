import { Command } from "commander";
import chalk from "chalk";
import { runHarnessSetup } from "@harnesskit/core";
import { createProvider, handleError, printGenerated, resolveTargetPath, withSpinner } from "./shared.js";

export function setupCommand(): Command {
  return new Command("setup")
    .description("Run scan, agents, generation, final review, and file writing.")
    .requiredOption("--path <path>", "Repository path")
    .option("--force", "Overwrite existing files without requiring backups", false)
    .option("--no-backup", "Do not create .bak.harnesskit backups")
    .option("--dry-run", "Run without writing files", false)
    .action(async (options) => {
      try {
        console.log(chalk.bold("HarnessKit setup started\n"));
        const rootPath = resolveTargetPath(options.path);
        const llm = createProvider();
        const result = await withSpinner("Running HarnessKit setup", (progress) => runHarnessSetup({
          rootPath,
          llm,
          force: options.force,
          backup: options.backup,
          dryRun: options.dryRun,
          onProgress: progress
        }));
        printGenerated(result.writtenFiles);
        console.log(chalk.bold("\nFinal review:"));
        console.log(result.outputs.finalReview.isReadyForClientDelivery
          ? "Ready for manual review before client delivery."
          : "Needs manual review before client delivery.");
      } catch (error) {
        handleError(error);
      }
    });
}

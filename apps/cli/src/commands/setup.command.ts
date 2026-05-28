import { Command } from "commander";
import chalk from "chalk";
import { runHarnessSetup } from "@harnesskit/core";
import { createProvider, handleError, printGenerated, resolveTargetPath, withSpinner } from "./shared.js";

export function setupCommand(): Command {
  return new Command("setup")
    .description("Run scan, agents, generation, final review, and file writing.")
    .requiredOption("--path <path>", "Repository path")
    .option("--deep", "Enable deep module sampling for larger repositories", false)
    .option("--force", "Overwrite existing files without requiring backups", false)
    .option("--no-backup", "Do not create .bak.harnesskit backups")
    .option("--dry-run", "Run without writing files", false)
    .option("--model <model>", "LLM model override")
    .option("--max-files <number>", "Maximum selected files", parseNumber)
    .option("--max-file-size-kb <number>", "Maximum file size to read in KB", parseNumber)
    .action(async (options) => {
      try {
        console.log(chalk.bold("HarnessKit setup started\n"));
        console.log(chalk.bold("Phase 1/5: Scanning repository"));
        const rootPath = resolveTargetPath(options.path);
        const llm = createProvider(options.model);
        console.log(chalk.bold("\nPhase 2/5: Running analysis agents"));
        const result = await withSpinner("Running HarnessKit setup", (progress) => runHarnessSetup({
          rootPath,
          llm,
          deep: options.deep,
          maxFiles: options.maxFiles,
          maxFileSizeKb: options.maxFileSizeKb,
          force: options.force,
          backup: options.backup,
          dryRun: options.dryRun,
          onProgress: progress
        }));
        console.log(chalk.bold("\nPhase 3/5: Generating files"));
        for (const file of result.files.slice(0, 12)) console.log(chalk.green(`✓ ${file.path}`));
        if (result.files.length > 12) console.log(chalk.green(`✓ ${result.files.length - 12} additional files`));
        console.log(chalk.bold("\nPhase 4/5: Writing files"));
        printGenerated(result.writtenFiles);
        console.log(chalk.bold("\nPhase 5/5: Delivery readiness"));
        console.log(`Score: ${result.outputs.finalReview.overallQualityScore}/100`);
        console.log(`Status: ${result.outputs.finalReview.isReadyForClientDelivery
          ? "Ready for manual consultant review"
          : "Needs consultant review before delivery"}`);
        console.log(chalk.bold("Manual review required:"));
        for (const item of result.outputs.finalReview.recommendedManualReviewItems) console.log(`- ${item}`);
      } catch (error) {
        handleError(error);
      }
    });
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Invalid number: ${value}`);
  return parsed;
}

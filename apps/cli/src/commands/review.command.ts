import { Command } from "commander";
import chalk from "chalk";
import { runHarnessReview } from "@harnesskit/core";
import { createProvider, handleError, resolveTargetPath, withSpinner } from "./shared.js";

export function reviewCommand(): Command {
  return new Command("review")
    .description("Review generated HarnessKit outputs for consistency and delivery readiness.")
    .requiredOption("--path <path>", "Repository path")
    .option("--model <model>", "LLM model override")
    .option("--regenerate", "Regenerate final documents after review", true)
    .option("--no-regenerate", "Only update internal final review data")
    .option("--force", "Overwrite existing files", false)
    .option("--no-backup", "Do not create .bak.harnesskit backups")
    .option("--dry-run", "Run without writing updated agent outputs", false)
    .action(async (options) => {
      try {
        const rootPath = resolveTargetPath(options.path);
        const llm = createProvider(options.model);
        const result = await withSpinner("Running final review", () => runHarnessReview({
          rootPath,
          llm,
          regenerate: options.regenerate,
          force: options.force,
          backup: options.backup,
          dryRun: options.dryRun
        }));
        const finalReview = result.outputs.finalReview;
        console.log(chalk.green("Final review completed"));
        console.log(`Score: ${finalReview.overallQualityScore}/100`);
        console.log(finalReview.isReadyForClientDelivery ? "Ready for manual review before delivery." : "Needs manual review before delivery.");
      } catch (error) {
        handleError(error);
      }
    });
}

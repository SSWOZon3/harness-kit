import { Command } from "commander";
import chalk from "chalk";
import { FinalReviewAgent, readAgentOutputs, readSnapshot, safeWriteFile } from "@harnesskit/core";
import { createProvider, handleError, resolveTargetPath, withSpinner } from "./shared.js";

export function reviewCommand(): Command {
  return new Command("review")
    .description("Review generated HarnessKit outputs for consistency and delivery readiness.")
    .requiredOption("--path <path>", "Repository path")
    .option("--dry-run", "Run without writing updated agent outputs", false)
    .action(async (options) => {
      try {
        const rootPath = resolveTargetPath(options.path);
        const snapshot = await readSnapshot(rootPath);
        const outputs = await readAgentOutputs(rootPath);
        const llm = createProvider();
        const finalReview = await withSpinner("Running final review", () => new FinalReviewAgent().run({
          snapshot,
          llm,
          previousOutputs: outputs
        }));
        const updated = { ...outputs, finalReview };
        await safeWriteFile({
          rootPath,
          relativePath: ".harnesskit/internal/agent-outputs.json",
          content: `${JSON.stringify(updated, null, 2)}\n`,
          dryRun: options.dryRun
        });
        console.log(chalk.green("Final review completed"));
        console.log(`Score: ${finalReview.overallQualityScore}/100`);
        console.log(finalReview.isReadyForClientDelivery ? "Ready for manual review before delivery." : "Needs manual review before delivery.");
      } catch (error) {
        handleError(error);
      }
    });
}

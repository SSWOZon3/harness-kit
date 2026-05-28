import { Command } from "commander";
import chalk from "chalk";
import { createRepositorySnapshot, writeHarnessFiles } from "@harnesskit/core";
import { handleError, printGenerated, resolveTargetPath } from "./shared.js";

export function analyzeCommand(): Command {
  return new Command("analyze")
    .description("Scan a repository and create a compact HarnessKit snapshot.")
    .requiredOption("--path <path>", "Repository path")
    .option("--dry-run", "Show intended work without writing files", false)
    .action(async (options) => {
      try {
        const rootPath = resolveTargetPath(options.path);
        const snapshot = await createRepositorySnapshot({ rootPath });
        const written = await writeHarnessFiles({
          rootPath,
          dryRun: options.dryRun,
          files: [
            { path: ".harnesskit/internal/repository-snapshot.json", content: `${JSON.stringify(snapshot, null, 2)}\n` },
            { path: ".harnesskit/internal/file-tree.md", content: `${snapshot.fileTree}\n` },
            { path: ".harnesskit/internal/important-files.json", content: `${JSON.stringify(snapshot.importantFiles, null, 2)}\n` }
          ]
        });
        console.log(chalk.green("Repository analyzed"));
        printGenerated(written);
      } catch (error) {
        handleError(error);
      }
    });
}

import { Command } from "commander";
import chalk from "chalk";
import { initHarnessConfig } from "@harnesskit/core";
import { handleError, resolveTargetPath } from "./shared.js";

export function initCommand(): Command {
  return new Command("init")
    .description("Initialize HarnessKit config in the current repository.")
    .option("--path <path>", "Repository path", ".")
    .action(async (options) => {
      try {
        const rootPath = resolveTargetPath(options.path);
        await initHarnessConfig(rootPath);
        console.log(chalk.green("Created .harnesskit/config.yml"));
      } catch (error) {
        handleError(error);
      }
    });
}

import { Command } from "commander";
import { initCommand } from "./commands/init.command.js";
import { analyzeCommand } from "./commands/analyze.command.js";
import { generateCommand } from "./commands/generate.command.js";
import { setupCommand } from "./commands/setup.command.js";
import { reviewCommand } from "./commands/review.command.js";

export function createCli(): Command {
  const program = new Command();
  program
    .name("harnesskit")
    .description("Local agentic CLI for generating AI-ready repository setup files.")
    .version("0.1.0");

  program.addCommand(initCommand());
  program.addCommand(analyzeCommand());
  program.addCommand(generateCommand());
  program.addCommand(setupCommand());
  program.addCommand(reviewCommand());

  return program;
}

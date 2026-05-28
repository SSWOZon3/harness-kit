import path from "node:path";
import chalk from "chalk";
import ora from "ora";
import { OpenAiProvider } from "@harnesskit/core";

export function resolveTargetPath(value?: string): string {
  return path.resolve(value ?? process.cwd());
}

export function createProvider(model?: string): OpenAiProvider {
  return new OpenAiProvider({ model });
}

export async function withSpinner<T>(text: string, task: (progress: (message: string) => void) => Promise<T>): Promise<T> {
  const spinner = ora(text).start();
  try {
    const result = await task((message) => {
      spinner.succeed(message);
      spinner.start();
    });
    spinner.stop();
    return result;
  } catch (error) {
    spinner.fail("HarnessKit failed");
    throw error;
  }
}

export function printGenerated(files: string[]): void {
  console.log(chalk.bold("\nGenerated:"));
  for (const file of files) console.log(`- ${file}`);
}

export function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(message));
  process.exit(1);
}

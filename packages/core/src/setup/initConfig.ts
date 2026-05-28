import path from "node:path";
import yaml from "js-yaml";
import { safeWriteFile } from "../output/safeWriteFile.js";

export async function initHarnessConfig(rootPath: string): Promise<void> {
  const config = {
    version: 1,
    provider: "openai",
    model: "gpt-4.1",
    output: {
      overwrite: false,
      createBackups: true
    },
    analysis: {
      maxFiles: 300,
      maxFileSizeKb: 200,
      include: ["**/*"],
      exclude: [
        "node_modules/**",
        ".git/**",
        "dist/**",
        "build/**",
        "coverage/**",
        ".next/**",
        ".env",
        ".env.*"
      ]
    }
  };

  await safeWriteFile({
    rootPath: path.resolve(rootPath),
    relativePath: ".harnesskit/config.yml",
    content: yaml.dump(config, { lineWidth: 120 }),
    backup: true
  });
}

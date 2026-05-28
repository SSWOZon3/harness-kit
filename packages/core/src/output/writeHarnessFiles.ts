import type { GeneratedFile } from "@harnesskit/shared";
import { safeWriteFile } from "./safeWriteFile.js";

export type WriteHarnessFilesOptions = {
  rootPath: string;
  files: GeneratedFile[];
  force?: boolean;
  backup?: boolean;
  dryRun?: boolean;
};

export async function writeHarnessFiles(options: WriteHarnessFilesOptions): Promise<string[]> {
  const written: string[] = [];
  for (const file of options.files) {
    const result = await safeWriteFile({
      rootPath: options.rootPath,
      relativePath: file.path,
      content: file.content,
      force: options.force,
      backup: options.backup,
      dryRun: options.dryRun
    });
    if (!result.skipped) written.push(result.path);
  }
  return written;
}

import path from "node:path";
import fs from "fs-extra";

export type SafeWriteFileOptions = {
  rootPath: string;
  relativePath: string;
  content: string;
  force?: boolean;
  backup?: boolean;
  dryRun?: boolean;
};

export async function safeWriteFile(options: SafeWriteFileOptions): Promise<{ path: string; backedUp: boolean; skipped: boolean }> {
  const target = path.join(options.rootPath, options.relativePath);
  const exists = await fs.pathExists(target);
  const backup = options.backup ?? true;

  if (options.dryRun) {
    return { path: options.relativePath, backedUp: false, skipped: false };
  }

  await fs.ensureDir(path.dirname(target));

  if (exists && !options.force && backup) {
    await fs.copy(target, `${target}.bak.harnesskit`, { overwrite: true });
  } else if (exists && !options.force && !backup) {
    return { path: options.relativePath, backedUp: false, skipped: true };
  }

  await fs.writeFile(target, options.content, "utf8");
  return { path: options.relativePath, backedUp: exists && backup, skipped: false };
}

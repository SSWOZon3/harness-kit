import path from "node:path";
import fs from "fs-extra";
import fg from "fast-glob";
import ignorePackage from "ignore";

type IgnoreManager = {
  add(patterns: string | readonly string[]): IgnoreManager;
  ignores(pathname: string): boolean;
};

const createIgnore = ignorePackage as unknown as () => IgnoreManager;

const defaultExcludes = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  "coverage/**",
  ".next/**",
  ".cache/**",
  "vendor/**",
  "target/**",
  ".env",
  ".env.*",
  "*.png",
  "*.jpg",
  "*.jpeg",
  "*.gif",
  "*.pdf",
  "*.zip",
  "*.sqlite"
];

export type ScanRepositoryOptions = {
  rootPath: string;
  include?: string[];
  exclude?: string[];
  maxFiles?: number;
};

export async function scanRepository(options: ScanRepositoryOptions): Promise<string[]> {
  const rootPath = path.resolve(options.rootPath);
  const gitignorePath = path.join(rootPath, ".gitignore");
  const ig = createIgnore().add(defaultExcludes).add(options.exclude ?? []);

  if (await fs.pathExists(gitignorePath)) {
    ig.add(await fs.readFile(gitignorePath, "utf8"));
  }

  const entries = await fg(options.include ?? ["**/*"], {
    cwd: rootPath,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    unique: true
  });

  return entries
    .filter((entry) => !ig.ignores(entry))
    .sort()
    .slice(0, options.maxFiles ?? 2000);
}

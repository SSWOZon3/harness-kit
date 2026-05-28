import path from "node:path";
import fs from "fs-extra";
import type { FileContent, ImportantFile } from "@harnesskit/shared";

const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx", ".yml", ".yaml",
  ".toml", ".xml", ".gradle", ".java", ".kt", ".kts", ".py", ".go", ".rs", ".rb", ".php",
  ".swift", ".dart", ".cs", ".sql", ".graphql", ".proto", ".env.example", ".txt"
]);

const binaryExtensions = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".zip", ".gz", ".tar", ".sqlite",
  ".db", ".woff", ".woff2", ".ttf", ".ico", ".mov", ".mp4"
]);

export type ReadRelevantFilesOptions = {
  rootPath: string;
  importantFiles: ImportantFile[];
  maxFileSizeKb: number;
};

export async function readRelevantFiles(options: ReadRelevantFilesOptions): Promise<FileContent[]> {
  const files: FileContent[] = [];
  for (const file of options.importantFiles) {
    const absolute = path.join(options.rootPath, file.path);
    if (!(await isReadableTextFile(absolute, options.maxFileSizeKb))) continue;
    const content = await fs.readFile(absolute, "utf8");
    files.push({ path: file.path, content: truncate(content, options.maxFileSizeKb * 1024) });
  }
  return files;
}

export async function isReadableTextFile(filePath: string, maxFileSizeKb: number): Promise<boolean> {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  if (binaryExtensions.has(ext)) return false;
  if (!textExtensions.has(ext) && !["README", "Makefile", "Dockerfile"].includes(base)) return false;
  const stats = await fs.stat(filePath).catch(() => null);
  return Boolean(stats?.isFile() && stats.size <= maxFileSizeKb * 1024);
}

export function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n\n[Truncated by HarnessKit]`;
}

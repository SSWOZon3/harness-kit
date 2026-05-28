import path from "node:path";
import { buildFileTree } from "./buildFileTree.js";
import { detectImportantFiles } from "./detectImportantFiles.js";
import { readRelevantFiles, truncate } from "./readRelevantFiles.js";
import { scanRepository } from "./scanRepository.js";
import type { FileContent, RepositorySnapshot } from "@harnesskit/shared";

export type CreateRepositorySnapshotOptions = {
  rootPath: string;
  maxFiles?: number;
  maxFileSizeKb?: number;
};

export async function createRepositorySnapshot(options: CreateRepositorySnapshotOptions): Promise<RepositorySnapshot> {
  const rootPath = path.resolve(options.rootPath);
  const maxFiles = options.maxFiles ?? Number(process.env.HARNESSKIT_MAX_FILES ?? 300);
  const maxFileSizeKb = options.maxFileSizeKb ?? Number(process.env.HARNESSKIT_MAX_FILE_SIZE_KB ?? 200);
  const paths = await scanRepository({ rootPath, maxFiles: Math.max(maxFiles * 5, 1000) });
  const fileTree = buildFileTree(paths);
  const importantFiles = detectImportantFiles(paths, maxFiles);
  const relevantFiles = await readRelevantFiles({ rootPath, importantFiles, maxFileSizeKb });
  const contentByPath = new Map(relevantFiles.map((file) => [file.path, file.content]));

  for (const file of importantFiles) {
    const content = contentByPath.get(file.path);
    if (content) file.contentPreview = truncate(content, 2000);
  }

  return {
    rootPath,
    generatedAt: new Date().toISOString(),
    fileTree,
    importantFiles,
    configFiles: relevantFiles.filter((file) => isConfigFile(file.path)),
    documentationFiles: relevantFiles.filter((file) => isDocumentationFile(file.path)),
    sourceSamples: relevantFiles.filter((file) => isSourceFile(file.path)).slice(0, 80),
    testSamples: relevantFiles.filter((file) => isTestFile(file.path)).slice(0, 30),
    packageFiles: relevantFiles.filter((file) => isPackageFile(file.path))
  };
}

function isConfigFile(filePath: string): boolean {
  return /(^|\/)(tsconfig|vite|next|nuxt|astro|svelte|jest|vitest|pytest|ruff|eslint|prettier|docker|compose|Makefile|Dockerfile|\.github\/workflows)/i.test(filePath)
    || /\.(ya?ml|toml|xml|gradle)$/.test(filePath);
}

function isDocumentationFile(filePath: string): boolean {
  return /^README/i.test(filePath) || /^docs\//.test(filePath) || /\.mdx?$/.test(filePath);
}

function isSourceFile(filePath: string): boolean {
  return /(^|\/)(src|app|lib|packages|services|domain|application|infrastructure)\//.test(filePath)
    && !isTestFile(filePath);
}

function isTestFile(filePath: string): boolean {
  return /(^|\/)(__tests__|tests?|spec)\//i.test(filePath) || /\.(test|spec)\.[tj]sx?$/.test(filePath);
}

function isPackageFile(filePath: string): boolean {
  return /(^|\/)(package\.json|pyproject\.toml|go\.mod|Cargo\.toml|pubspec\.yaml|pom\.xml|build\.gradle)$/.test(filePath);
}

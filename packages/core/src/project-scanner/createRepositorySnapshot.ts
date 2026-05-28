import path from "node:path";
import { buildFileTree } from "./buildFileTree.js";
import { detectImportantFiles } from "./detectImportantFiles.js";
import { readRelevantFiles, truncate } from "./readRelevantFiles.js";
import { scanRepository } from "./scanRepository.js";
import type { FileContent, ImportantFile, ModuleSummary, RepositorySnapshot } from "@harnesskit/shared";

export type CreateRepositorySnapshotOptions = {
  rootPath: string;
  maxFiles?: number;
  maxFileSizeKb?: number;
  deep?: boolean;
};

export async function createRepositorySnapshot(options: CreateRepositorySnapshotOptions): Promise<RepositorySnapshot> {
  const rootPath = path.resolve(options.rootPath);
  const deep = options.deep ?? false;
  const defaultMaxFiles = deep
    ? Number(process.env.HARNESSKIT_DEEP_MAX_FILES ?? 600)
    : Number(process.env.HARNESSKIT_MAX_FILES ?? 300);
  const maxFiles = options.maxFiles ?? defaultMaxFiles;
  const maxFileSizeKb = options.maxFileSizeKb ?? Number(process.env.HARNESSKIT_MAX_FILE_SIZE_KB ?? 200);
  const paths = await scanRepository({ rootPath, maxFiles: Math.max(maxFiles * 5, 1000) });
  const fileTree = buildFileTree(paths);
  const baseImportantFiles = detectImportantFiles(paths, maxFiles);
  const moduleSummaries = deep ? buildModuleSummaries(paths) : undefined;
  const deepImportantFiles = deep ? selectDeepModuleFiles(paths, moduleSummaries ?? []) : [];
  const importantFiles = mergeImportantFiles(baseImportantFiles, deepImportantFiles).slice(0, maxFiles);
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
    packageFiles: relevantFiles.filter((file) => isPackageFile(file.path)),
    ...(deep
      ? {
          moduleSummaries,
          selectedModules: moduleSummaries?.map((module) => module.name) ?? [],
          selectionWarnings: buildSelectionWarnings(paths, importantFiles, relevantFiles, maxFiles)
        }
      : {})
  };
}

function buildModuleSummaries(paths: string[]): ModuleSummary[] {
  const groups = new Map<string, string[]>();
  for (const filePath of paths) {
    const root = getModuleRoot(filePath);
    if (!root) continue;
    const bucket = groups.get(root) ?? [];
    bucket.push(filePath);
    groups.set(root, bucket);
  }

  return Array.from(groups.entries())
    .map(([rootPath, files]) => {
      const sampledFiles = selectRepresentativeFiles(files).slice(0, 8);
      return {
        name: rootPath.replace(/\/$/, ""),
        rootPath,
        fileCount: files.length,
        sampledFiles,
        reason: describeModuleReason(rootPath, sampledFiles)
      };
    })
    .sort((a, b) => b.fileCount - a.fileCount || a.rootPath.localeCompare(b.rootPath))
    .slice(0, 40);
}

function selectDeepModuleFiles(paths: string[], modules: ModuleSummary[]): ImportantFile[] {
  const selected: ImportantFile[] = [];
  for (const module of modules) {
    for (const filePath of module.sampledFiles) {
      selected.push({
        path: filePath,
        reason: `Deep module sample for ${module.rootPath}: ${module.reason}`
      });
    }
  }
  return selected;
}

function mergeImportantFiles(primary: ImportantFile[], additional: ImportantFile[]): ImportantFile[] {
  const seen = new Set<string>();
  const merged: ImportantFile[] = [];
  for (const file of [...primary, ...additional]) {
    if (seen.has(file.path)) continue;
    seen.add(file.path);
    merged.push(file);
  }
  return merged;
}

function getModuleRoot(filePath: string): string | null {
  const parts = filePath.split("/");
  if (parts.length === 1) return null;
  if (["src", "app", "lib", "packages", "services", "apps"].includes(parts[0] ?? "")) {
    return parts.length >= 3 ? `${parts[0]}/${parts[1]}` : parts[0];
  }
  if (["domain", "application", "infrastructure", "controllers", "routes", "models", "tests", "test", "__tests__", "migrations", "prisma"].includes(parts[0] ?? "")) {
    return parts[0];
  }
  return null;
}

function selectRepresentativeFiles(files: string[]): string[] {
  const preferred = [
    /README/i,
    /(^|\/)(package\.json|pyproject\.toml|go\.mod|Cargo\.toml|pubspec\.yaml|pom\.xml|build\.gradle)$/,
    /(^|\/)(routes|controllers|handlers|pages|api)\//i,
    /(^|\/)(services|use-cases|usecases|application)\//i,
    /(^|\/)(domain|entities|models|schemas|dto|types)\//i,
    /(^|\/)(repositories|infrastructure|database|persistence)\//i,
    /(^|\/)(migrations|prisma)\//i,
    /(^|\/)(__tests__|tests?|spec)\//i,
    /\.(test|spec)\.[tj]sx?$/i
  ];

  const scored = files.map((filePath) => {
    const index = preferred.findIndex((pattern) => pattern.test(filePath));
    return { filePath, score: index === -1 ? 100 : index };
  });

  return scored
    .sort((a, b) => a.score - b.score || a.filePath.localeCompare(b.filePath))
    .map((item) => item.filePath);
}

function describeModuleReason(rootPath: string, sampledFiles: string[]): string {
  if (sampledFiles.some((filePath) => /controller|route|handler|api/i.test(filePath))) return "entry point or API boundary files detected";
  if (sampledFiles.some((filePath) => /use-case|usecase|service|application/i.test(filePath))) return "application logic files detected";
  if (sampledFiles.some((filePath) => /domain|entity|model|schema/i.test(filePath))) return "domain model files detected";
  if (sampledFiles.some((filePath) => /test|spec/i.test(filePath))) return "test files detected";
  return `representative files under ${rootPath}`;
}

function buildSelectionWarnings(paths: string[], importantFiles: ImportantFile[], relevantFiles: FileContent[], maxFiles: number): string[] {
  const warnings: string[] = [];
  if (paths.length > importantFiles.length) {
    warnings.push(`Snapshot selected ${importantFiles.length} important files from ${paths.length} repository files; validate omitted modules manually for large repos.`);
  }
  if (importantFiles.length >= maxFiles) {
    warnings.push(`Important file selection reached maxFiles=${maxFiles}; increase --max-files if key modules are missing.`);
  }
  const unread = importantFiles.length - relevantFiles.length;
  if (unread > 0) {
    warnings.push(`${unread} selected files were not read because they were too large, binary, unsupported, or unavailable.`);
  }
  return warnings;
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

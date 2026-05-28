import { z } from "zod";

export const FileContentSchema = z.object({
  path: z.string(),
  content: z.string()
});

export const ImportantFileSchema = z.object({
  path: z.string(),
  reason: z.string(),
  contentPreview: z.string().optional()
});

export const RepositorySnapshotSchema = z.object({
  rootPath: z.string(),
  generatedAt: z.string(),
  fileTree: z.string(),
  importantFiles: z.array(ImportantFileSchema),
  configFiles: z.array(FileContentSchema),
  documentationFiles: z.array(FileContentSchema),
  sourceSamples: z.array(FileContentSchema),
  testSamples: z.array(FileContentSchema),
  packageFiles: z.array(FileContentSchema)
});

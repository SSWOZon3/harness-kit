import { z } from "zod";

export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string()
});

export const GeneratedFilesSchema = z.array(GeneratedFileSchema);

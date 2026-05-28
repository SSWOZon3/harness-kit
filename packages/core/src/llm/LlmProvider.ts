import type { z } from "zod";

export interface LlmProvider {
  generateJson<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
    schema: z.ZodSchema<T>;
  }): Promise<T>;

  generateText(params: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string>;
}

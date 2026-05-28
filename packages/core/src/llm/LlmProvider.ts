import type { z } from "zod";

export interface LlmProvider {
  generateJson<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
    schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  }): Promise<T>;

  generateText(params: {
    systemPrompt: string;
    userPrompt: string;
  }): Promise<string>;
}

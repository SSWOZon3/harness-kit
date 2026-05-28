import OpenAI from "openai";
import type { z } from "zod";
import type { LlmProvider } from "./LlmProvider.js";

export type OpenAiProviderOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAiProvider implements LlmProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAiProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required to run HarnessKit agents. Create a .env file or export the variable.");
    }
    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.HARNESSKIT_MODEL ?? "gpt-4.1";
  }

  async generateJson<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
    schema: z.ZodSchema<T>;
  }): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${params.systemPrompt}\nReturn only valid JSON for schema ${params.schemaName}. Do not wrap it in Markdown.` },
        { role: "user", content: params.userPrompt }
      ]
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error(`OpenAI returned an empty response for ${params.schemaName}.`);
    return params.schema.parse(JSON.parse(raw));
  }

  async generateText(params: { systemPrompt: string; userPrompt: string }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt }
      ]
    });
    return response.choices[0]?.message?.content ?? "";
  }
}

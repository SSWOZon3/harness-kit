import type { z } from "zod";
import { LlmJsonGenerationError } from "./LlmErrors.js";

export type JsonModelCall = (params: {
  systemPrompt: string;
  userPrompt: string;
}) => Promise<string>;

export async function generateJsonWithRepair<T>(params: {
  callModel: JsonModelCall;
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  maxRetries?: number;
}): Promise<T> {
  const maxRetries = params.maxRetries ?? Number(process.env.HARNESSKIT_LLM_MAX_RETRIES ?? 2);
  let lastError = "No response generated.";
  let rawResponse = "";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const prompt = attempt === 0
      ? params.userPrompt
      : buildRepairPrompt({
          originalPrompt: params.userPrompt,
          schemaName: params.schemaName,
          rawResponse,
          validationError: lastError
        });

    rawResponse = await params.callModel({
      systemPrompt: `${params.systemPrompt}\nReturn only valid JSON for schema ${params.schemaName}. Do not wrap it in Markdown.`,
      userPrompt: prompt
    });

    const parsed = parseJson(rawResponse);
    if (!parsed.ok) {
      lastError = parsed.error;
      continue;
    }

    const validated = params.schema.safeParse(parsed.value);
    if (validated.success) return validated.data;

    lastError = validated.error.toString();
  }

  throw new LlmJsonGenerationError({
    schemaName: params.schemaName,
    attempts: maxRetries + 1,
    lastError,
    rawResponse
  });
}

function parseJson(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(stripMarkdownFence(raw)) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function buildRepairPrompt(params: {
  originalPrompt: string;
  schemaName: string;
  rawResponse: string;
  validationError: string;
}): string {
  return [
    "You returned invalid JSON or JSON that does not match the required schema.",
    "Fix it.",
    "Return only valid JSON.",
    "Do not add Markdown.",
    "Do not explain.",
    "",
    `Schema name: ${params.schemaName}`,
    "",
    "Validation or parse error:",
    params.validationError,
    "",
    "Previous raw response:",
    params.rawResponse.slice(0, 6000),
    "",
    "Original task prompt:",
    params.originalPrompt
  ].join("\n");
}

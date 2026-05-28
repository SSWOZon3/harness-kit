export class LlmJsonGenerationError extends Error {
  constructor(params: {
    schemaName: string;
    attempts: number;
    lastError: string;
    rawResponse: string;
  }) {
    super([
      `Failed to generate valid JSON for ${params.schemaName} after ${params.attempts} attempt(s).`,
      `Last error: ${params.lastError}`,
      `Raw response preview: ${params.rawResponse.slice(0, 1000)}`
    ].join("\n"));
    this.name = "LlmJsonGenerationError";
  }
}

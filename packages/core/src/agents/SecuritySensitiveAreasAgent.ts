import type { SensitiveAreasOutput } from "@harnesskit/shared";
import { SensitiveAreasOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { sensitiveAreasPrompt } from "../llm/prompts/sensitiveAreas.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class SecuritySensitiveAreasAgent extends JsonAgent<SensitiveAreasOutput> {
  readonly name = "Sensitive areas";
  protected readonly schemaName = "SensitiveAreasOutput";
  protected readonly schema = SensitiveAreasOutputSchema;
  protected readonly taskPrompt = sensitiveAreasPrompt;
}

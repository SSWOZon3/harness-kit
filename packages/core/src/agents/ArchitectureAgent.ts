import type { ArchitectureOutput } from "@harnesskit/shared";
import { ArchitectureOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { architecturePrompt } from "../llm/prompts/architecture.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class ArchitectureAgent extends JsonAgent<ArchitectureOutput> {
  readonly name = "Architecture";
  protected readonly schemaName = "ArchitectureOutput";
  protected readonly schema = ArchitectureOutputSchema;
  protected readonly taskPrompt = architecturePrompt;
}

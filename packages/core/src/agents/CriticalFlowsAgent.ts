import type { CriticalFlowsOutput } from "@harnesskit/shared";
import { CriticalFlowsOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { criticalFlowsPrompt } from "../llm/prompts/criticalFlows.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class CriticalFlowsAgent extends JsonAgent<CriticalFlowsOutput> {
  readonly name = "Critical flows";
  protected readonly schemaName = "CriticalFlowsOutput";
  protected readonly schema = CriticalFlowsOutputSchema;
  protected readonly taskPrompt = criticalFlowsPrompt;
}

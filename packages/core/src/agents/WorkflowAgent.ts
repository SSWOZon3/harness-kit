import type { WorkflowOutput } from "@harnesskit/shared";
import { WorkflowOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { workflowPrompt } from "../llm/prompts/workflow.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class WorkflowAgent extends JsonAgent<WorkflowOutput> {
  readonly name = "Workflow";
  protected readonly schemaName = "WorkflowOutput";
  protected readonly schema = WorkflowOutputSchema;
  protected readonly taskPrompt = workflowPrompt;
}

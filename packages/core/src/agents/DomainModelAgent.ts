import type { DomainModelOutput } from "@harnesskit/shared";
import { DomainModelOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { domainModelPrompt } from "../llm/prompts/domainModel.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class DomainModelAgent extends JsonAgent<DomainModelOutput> {
  readonly name = "Domain model";
  protected readonly schemaName = "DomainModelOutput";
  protected readonly schema = DomainModelOutputSchema;
  protected readonly taskPrompt = domainModelPrompt;
}

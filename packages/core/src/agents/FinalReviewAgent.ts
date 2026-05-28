import type { FinalReviewOutput } from "@harnesskit/shared";
import { FinalReviewOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { finalReviewPrompt } from "../llm/prompts/finalReview.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class FinalReviewAgent extends JsonAgent<FinalReviewOutput> {
  readonly name = "Final review";
  protected readonly schemaName = "FinalReviewOutput";
  protected readonly schema = FinalReviewOutputSchema;
  protected readonly taskPrompt = finalReviewPrompt;
}

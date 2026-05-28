import type { TestingOutput } from "@harnesskit/shared";
import { TestingOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { testingPrompt } from "../llm/prompts/testing.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class TestingAgent extends JsonAgent<TestingOutput> {
  readonly name = "Testing";
  protected readonly schemaName = "TestingOutput";
  protected readonly schema = TestingOutputSchema;
  protected readonly taskPrompt = testingPrompt;
}

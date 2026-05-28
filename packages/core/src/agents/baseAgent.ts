import type { z } from "zod";
import { agentSystemPrompt, buildRepositoryContext } from "../llm/prompts/common.js";
import type { AgentContext, HarnessAgent } from "./agents.types.js";

export abstract class JsonAgent<T> implements HarnessAgent<T> {
  abstract readonly name: string;
  protected abstract readonly schemaName: string;
  protected abstract readonly schema: z.ZodSchema<T>;
  protected abstract readonly taskPrompt: string;

  async run(context: AgentContext): Promise<T> {
    return context.llm.generateJson({
      systemPrompt: agentSystemPrompt,
      userPrompt: [
        this.taskPrompt,
        "",
        "Return a JSON object matching the requested schema. Include file evidence whenever the schema allows it.",
        "",
        buildRepositoryContext(context.snapshot, context.previousOutputs)
      ].join("\n"),
      schemaName: this.schemaName,
      schema: this.schema
    });
  }
}

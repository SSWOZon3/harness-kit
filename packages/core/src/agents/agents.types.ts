import type { AgentOutputs, RepositorySnapshot } from "@harnesskit/shared";
import type { LlmProvider } from "../llm/LlmProvider.js";

export type AgentContext = {
  snapshot: RepositorySnapshot;
  previousOutputs: Partial<AgentOutputs>;
  llm: LlmProvider;
};

export interface HarnessAgent<T> {
  name: string;
  run(context: AgentContext): Promise<T>;
}

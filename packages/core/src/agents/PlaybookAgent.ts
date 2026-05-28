import type { PlaybookOutput } from "@harnesskit/shared";
import { PlaybookOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { playbookPrompt } from "../llm/prompts/playbook.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class PlaybookAgent extends JsonAgent<PlaybookOutput> {
  readonly name = "Playbooks";
  protected readonly schemaName = "PlaybookOutput";
  protected readonly schema = PlaybookOutputSchema;
  protected readonly taskPrompt = playbookPrompt;
}

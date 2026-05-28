import type { ProjectOverviewOutput } from "@harnesskit/shared";
import { ProjectOverviewOutputSchema } from "../schemas/AgentOutputs.schema.js";
import { projectOverviewPrompt } from "../llm/prompts/projectOverview.prompt.js";
import { JsonAgent } from "./baseAgent.js";

export class ProjectOverviewAgent extends JsonAgent<ProjectOverviewOutput> {
  readonly name = "Project overview";
  protected readonly schemaName = "ProjectOverviewOutput";
  protected readonly schema = ProjectOverviewOutputSchema;
  protected readonly taskPrompt = projectOverviewPrompt;
}

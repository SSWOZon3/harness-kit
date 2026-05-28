import type { AgentOutputs, RepositorySnapshot } from "@harnesskit/shared";
import type { LlmProvider } from "../llm/LlmProvider.js";
import { ProjectOverviewAgent } from "./ProjectOverviewAgent.js";
import { ArchitectureAgent } from "./ArchitectureAgent.js";
import { DomainModelAgent } from "./DomainModelAgent.js";
import { CriticalFlowsAgent } from "./CriticalFlowsAgent.js";
import { TestingAgent } from "./TestingAgent.js";
import { SecuritySensitiveAreasAgent } from "./SecuritySensitiveAreasAgent.js";
import { WorkflowAgent } from "./WorkflowAgent.js";
import { PlaybookAgent } from "./PlaybookAgent.js";
import { FinalReviewAgent } from "./FinalReviewAgent.js";

export type AgentProgress = (message: string) => void;

export class AgentOrchestrator {
  constructor(
    private readonly llm: LlmProvider,
    private readonly onProgress?: AgentProgress
  ) {}

  async run(snapshot: RepositorySnapshot): Promise<AgentOutputs> {
    const previousOutputs: Partial<AgentOutputs> = {};

    const projectOverview = await new ProjectOverviewAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.projectOverview = projectOverview;
    this.onProgress?.("Project overview agent completed");

    const architecture = await new ArchitectureAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.architecture = architecture;
    this.onProgress?.("Architecture agent completed");

    const workflow = await new WorkflowAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.workflow = workflow;
    this.onProgress?.("Workflow agent completed");

    const domainModel = await new DomainModelAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.domainModel = domainModel;
    this.onProgress?.("Domain model agent completed");

    const criticalFlows = await new CriticalFlowsAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.criticalFlows = criticalFlows;
    this.onProgress?.("Critical flows agent completed");

    const testing = await new TestingAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.testing = testing;
    this.onProgress?.("Testing agent completed");

    const sensitiveAreas = await new SecuritySensitiveAreasAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.sensitiveAreas = sensitiveAreas;
    this.onProgress?.("Sensitive areas agent completed");

    const playbooks = await new PlaybookAgent().run({ snapshot, previousOutputs, llm: this.llm });
    previousOutputs.playbooks = playbooks;
    this.onProgress?.("Playbooks generated");

    const finalReview = await new FinalReviewAgent().run({ snapshot, previousOutputs, llm: this.llm });
    this.onProgress?.("Final review completed");

    return {
      projectOverview,
      architecture,
      domainModel,
      criticalFlows,
      testing,
      sensitiveAreas,
      workflow,
      playbooks,
      finalReview
    };
  }
}

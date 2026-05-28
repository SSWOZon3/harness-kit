import { z } from "zod";

const EvidenceSchema = z.object({
  file: z.string(),
  reason: z.string()
});

export const ProjectOverviewOutputSchema = z.object({
  projectName: z.string(),
  projectType: z.string(),
  businessPurpose: z.string(),
  mainUsers: z.array(z.string()),
  mainCapabilities: z.array(z.string()),
  externalIntegrations: z.array(z.string()),
  runtimeContext: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(EvidenceSchema)
});

export const ArchitectureOutputSchema = z.object({
  architectureStyle: z.string(),
  layers: z.array(z.object({
    name: z.string(),
    pathPatterns: z.array(z.string()),
    responsibility: z.string(),
    allowedDependencies: z.array(z.string()),
    forbiddenDependencies: z.array(z.string())
  })),
  moduleBoundaries: z.array(z.object({
    module: z.string(),
    paths: z.array(z.string()),
    responsibility: z.string()
  })),
  conventions: z.array(z.string()),
  antiPatternsToAvoid: z.array(z.string()),
  evidence: z.array(EvidenceSchema)
});

export const DomainModelOutputSchema = z.object({
  entities: z.array(z.object({
    name: z.string(),
    description: z.string(),
    files: z.array(z.string()),
    importantFields: z.array(z.string()),
    relationships: z.array(z.string())
  })),
  dataStores: z.array(z.object({
    type: z.string(),
    name: z.string(),
    relatedFiles: z.array(z.string())
  })),
  apiContracts: z.array(z.object({
    name: z.string(),
    description: z.string(),
    files: z.array(z.string())
  })),
  businessRules: z.array(z.string()),
  evidence: z.array(EvidenceSchema)
});

export const CriticalFlowsOutputSchema = z.object({
  flows: z.array(z.object({
    name: z.string(),
    description: z.string(),
    entryPoints: z.array(z.string()),
    involvedModules: z.array(z.string()),
    riskLevel: z.enum(["low", "medium", "high", "critical"]),
    whyCritical: z.string(),
    agentGuidance: z.string()
  }))
});

export const TestingOutputSchema = z.object({
  testFrameworks: z.array(z.string()),
  testCommands: z.array(z.string()),
  testFilePatterns: z.array(z.string()),
  mockingStyle: z.string(),
  assertionStyle: z.string(),
  testConventions: z.array(z.string()),
  gaps: z.array(z.string()),
  agentTestingInstructions: z.array(z.string()),
  evidence: z.array(EvidenceSchema)
});

export const SensitiveAreasOutputSchema = z.object({
  sensitiveAreas: z.array(z.object({
    name: z.string(),
    pathPatterns: z.array(z.string()),
    severity: z.enum(["low", "medium", "high", "critical"]),
    reason: z.string(),
    requiredHumanReview: z.boolean(),
    instructionsForAgents: z.string()
  })),
  secretsHandling: z.array(z.string()),
  riskyCommands: z.array(z.string()),
  protectedFiles: z.array(z.string())
});

export const WorkflowOutputSchema = z.object({
  packageManager: z.string(),
  installCommand: z.string().nullable(),
  devCommand: z.string().nullable(),
  buildCommand: z.string().nullable(),
  testCommand: z.string().nullable(),
  lintCommand: z.string().nullable(),
  typecheckCommand: z.string().nullable(),
  formatCommand: z.string().nullable(),
  ciWorkflows: z.array(z.object({
    name: z.string(),
    file: z.string(),
    relevantCommands: z.array(z.string())
  })),
  definitionOfDone: z.array(z.string())
});

export const PlaybookSchema = z.object({
  id: z.string(),
  title: z.string(),
  whenToUse: z.string(),
  steps: z.array(z.string()),
  filesToInspectFirst: z.array(z.string()),
  allowedAreas: z.array(z.string()),
  riskyAreas: z.array(z.string()),
  verificationCommands: z.array(z.string()),
  definitionOfDone: z.array(z.string())
});

export const PlaybookOutputSchema = z.object({
  playbooks: z.array(PlaybookSchema)
});

export const FinalReviewOutputSchema = z.object({
  overallQualityScore: z.number().min(0).max(100),
  issues: z.array(z.object({
    severity: z.enum(["low", "medium", "high"]),
    description: z.string(),
    suggestedFix: z.string()
  })),
  recommendedManualReviewItems: z.array(z.string()),
  isReadyForClientDelivery: z.boolean()
});

export const AgentOutputsSchema = z.object({
  projectOverview: ProjectOverviewOutputSchema,
  architecture: ArchitectureOutputSchema,
  domainModel: DomainModelOutputSchema,
  criticalFlows: CriticalFlowsOutputSchema,
  testing: TestingOutputSchema,
  sensitiveAreas: SensitiveAreasOutputSchema,
  workflow: WorkflowOutputSchema,
  playbooks: PlaybookOutputSchema,
  finalReview: FinalReviewOutputSchema
});

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ReviewSeverity = "low" | "medium" | "high";

export type Evidence = {
  file: string;
  reason: string;
};

export type FileContent = {
  path: string;
  content: string;
};

export type ConfidenceMarker = {
  confidence: number;
  inferred: boolean;
  requiresHumanValidation: boolean;
};

export type ImportantFile = {
  path: string;
  reason: string;
  contentPreview?: string;
};

export type ModuleSummary = {
  name: string;
  rootPath: string;
  fileCount: number;
  sampledFiles: string[];
  reason: string;
};

export type RepositorySnapshot = {
  rootPath: string;
  generatedAt: string;
  fileTree: string;
  importantFiles: ImportantFile[];
  configFiles: FileContent[];
  documentationFiles: FileContent[];
  sourceSamples: FileContent[];
  testSamples: FileContent[];
  packageFiles: FileContent[];
  moduleSummaries?: ModuleSummary[];
  selectedModules?: string[];
  selectionWarnings?: string[];
};

export type GeneratedFile = {
  path: string;
  content: string;
};

export type ProjectOverviewOutput = {
  projectName: string;
  projectType: string;
  businessPurpose: string;
  mainUsers: string[];
  mainCapabilities: string[];
  externalIntegrations: string[];
  runtimeContext: string;
  confidence: number;
  evidence: Evidence[];
};

export type ArchitectureOutput = ConfidenceMarker & {
  architectureStyle: string;
  layers: Array<{
    name: string;
    pathPatterns: string[];
    responsibility: string;
    allowedDependencies: string[];
    forbiddenDependencies: string[];
  }>;
  moduleBoundaries: Array<{
    module: string;
    paths: string[];
    responsibility: string;
  }>;
  conventions: string[];
  antiPatternsToAvoid: string[];
  evidence: Evidence[];
};

export type DomainModelOutput = {
  entities: Array<{
    name: string;
    description: string;
    files: string[];
    importantFields: string[];
    relationships: string[];
  }>;
  dataStores: Array<{
    type: string;
    name: string;
    relatedFiles: string[];
  }>;
  apiContracts: Array<{
    name: string;
    description: string;
    files: string[];
  }>;
  businessRules: string[];
  evidence: Evidence[];
};

export type CriticalFlowsOutput = {
  flows: Array<ConfidenceMarker & {
    name: string;
    description: string;
    entryPoints: string[];
    involvedModules: string[];
    riskLevel: RiskLevel;
    whyCritical: string;
    agentGuidance: string;
    evidence: Evidence[];
  }>;
};

export type TestingOutput = {
  testFrameworks: string[];
  testCommands: string[];
  testFilePatterns: string[];
  mockingStyle: string;
  assertionStyle: string;
  testConventions: string[];
  gaps: string[];
  agentTestingInstructions: string[];
  evidence: Evidence[];
};

export type SensitiveAreasOutput = {
  sensitiveAreas: Array<ConfidenceMarker & {
    name: string;
    pathPatterns: string[];
    severity: RiskLevel;
    reason: string;
    requiredHumanReview: boolean;
    instructionsForAgents: string;
    evidence: Evidence[];
  }>;
  secretsHandling: string[];
  riskyCommands: string[];
  protectedFiles: string[];
};

export type WorkflowOutput = {
  packageManager: string;
  installCommand: string | null;
  devCommand: string | null;
  buildCommand: string | null;
  testCommand: string | null;
  lintCommand: string | null;
  typecheckCommand: string | null;
  formatCommand: string | null;
  ciWorkflows: Array<{
    name: string;
    file: string;
    relevantCommands: string[];
  }>;
  commandEvidence: Array<{
    command: string;
    sourceFile: string;
    inferred: boolean;
    confidence: number;
    requiresHumanValidation: boolean;
  }>;
  definitionOfDone: string[];
};

export type Playbook = ConfidenceMarker & {
  id: string;
  title: string;
  whenToUse: string;
  steps: string[];
  filesToInspectFirst: string[];
  allowedAreas: string[];
  riskyAreas: string[];
  verificationCommands: string[];
  definitionOfDone: string[];
};

export type PlaybookOutput = {
  playbooks: Playbook[];
};

export type FinalReviewOutput = {
  overallQualityScore: number;
  issues: Array<{
    severity: ReviewSeverity;
    description: string;
    suggestedFix: string;
  }>;
  recommendedManualReviewItems: string[];
  isReadyForClientDelivery: boolean;
  clientDeliveryNotes: string[];
  strongestGeneratedAssets: string[];
  weakestGeneratedAssets: string[];
};

export type AgentOutputs = {
  projectOverview: ProjectOverviewOutput;
  architecture: ArchitectureOutput;
  domainModel: DomainModelOutput;
  criticalFlows: CriticalFlowsOutput;
  testing: TestingOutput;
  sensitiveAreas: SensitiveAreasOutput;
  workflow: WorkflowOutput;
  playbooks: PlaybookOutput;
  finalReview: FinalReviewOutput;
};

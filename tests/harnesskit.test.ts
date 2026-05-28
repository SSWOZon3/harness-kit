import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { describe, expect, it } from "vitest";
import type { LlmProvider } from "@harnesskit/core";
import {
  AgentOutputsSchema,
  createRepositorySnapshot,
  generateAllFiles,
  generateJsonWithRepair,
  runHarnessReview,
  runHarnessSetup,
  safeWriteFile,
  scanRepository
} from "@harnesskit/core";
import type { AgentOutputs } from "@harnesskit/shared";

const minimalFixture = path.join(process.cwd(), "tests/fixtures/minimal-repo");
const nodeCleanFixture = path.join(process.cwd(), "tests/fixtures/node-clean-architecture");

class MockLlmProvider implements LlmProvider {
  constructor(private readonly overrides: Partial<AgentOutputs> = {}) {}

  async generateJson<T>(params: { schemaName: string; schema: z.ZodType<T, z.ZodTypeDef, unknown> }): Promise<T> {
    return params.schema.parse(mockBySchema(params.schemaName, this.overrides));
  }

  async generateText(): Promise<string> {
    return "mock";
  }
}

describe("scanner", () => {
  it("ignores node_modules, .git, .env, dist, and binary files", async () => {
    const dir = await copyFixture(minimalFixture);
    await fs.ensureDir(path.join(dir, "node_modules/pkg"));
    await fs.ensureDir(path.join(dir, ".git"));
    await fs.ensureDir(path.join(dir, "dist"));
    await fs.writeFile(path.join(dir, ".env"), "SECRET=1");
    await fs.writeFile(path.join(dir, "node_modules/pkg/index.js"), "");
    await fs.writeFile(path.join(dir, ".git/config"), "");
    await fs.writeFile(path.join(dir, "dist/index.js"), "");
    await fs.writeFile(path.join(dir, "logo.png"), "fake image");

    const files = await scanRepository({ rootPath: dir });

    expect(files).not.toContain(".env");
    expect(files).not.toContain("logo.png");
    expect(files.some((file) => file.startsWith("node_modules/"))).toBe(false);
    expect(files.some((file) => file.startsWith(".git/"))).toBe(false);
    expect(files.some((file) => file.startsWith("dist/"))).toBe(false);
  });

  it("snapshot includes README, package config, source samples, tests, file tree, and important files", async () => {
    const snapshot = await createRepositorySnapshot({ rootPath: minimalFixture });
    expect(snapshot.fileTree).toContain("README.md");
    expect(snapshot.importantFiles.some((file) => file.path === "README.md")).toBe(true);
    expect(snapshot.documentationFiles.some((file) => file.path === "README.md")).toBe(true);
    expect(snapshot.packageFiles.some((file) => file.path === "package.json")).toBe(true);
    expect(snapshot.sourceSamples.some((file) => file.path === "src/index.ts")).toBe(true);
    expect(snapshot.testSamples.some((file) => file.path === "tests/index.test.ts")).toBe(true);
  });

  it("deep mode adds module summaries and selection metadata", async () => {
    const snapshot = await createRepositorySnapshot({ rootPath: nodeCleanFixture, deep: true });
    expect(snapshot.moduleSummaries?.length).toBeGreaterThan(0);
    expect(snapshot.selectedModules?.length).toBeGreaterThan(0);
    expect(snapshot.moduleSummaries?.some((module) => module.sampledFiles.some((file) => file.includes("CreateUserUseCase")))).toBe(true);
  });
});

describe("llm json repair", () => {
  it("retries after invalid JSON", async () => {
    const responses = ["not json", "{\"value\":\"ok\"}"];
    const result = await generateJsonWithRepair({
      callModel: async () => responses.shift() ?? "{}",
      systemPrompt: "system",
      userPrompt: "user",
      schemaName: "RepairTest",
      schema: z.object({ value: z.string() }),
      maxRetries: 1
    });
    expect(result.value).toBe("ok");
  });

  it("retries after schema-invalid JSON", async () => {
    const responses = ["{\"value\":123}", "{\"value\":\"fixed\"}"];
    const result = await generateJsonWithRepair({
      callModel: async () => responses.shift() ?? "{}",
      systemPrompt: "system",
      userPrompt: "user",
      schemaName: "SchemaRepairTest",
      schema: z.object({ value: z.string() }),
      maxRetries: 1
    });
    expect(result.value).toBe("fixed");
  });

  it("fails clearly after max retries", async () => {
    await expect(generateJsonWithRepair({
      callModel: async () => "still not json",
      systemPrompt: "system",
      userPrompt: "user",
      schemaName: "BrokenSchema",
      schema: z.object({ value: z.string() }),
      maxRetries: 1
    })).rejects.toThrow(/BrokenSchema/);
  });
});

describe("output", () => {
  it("safeWriteFile creates a backup by default", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-"));
    await fs.writeFile(path.join(dir, "CLAUDE.md"), "old");
    await safeWriteFile({ rootPath: dir, relativePath: "CLAUDE.md", content: "new" });
    expect(await fs.readFile(path.join(dir, "CLAUDE.md"), "utf8")).toBe("new");
    expect(await fs.readFile(path.join(dir, "CLAUDE.md.bak.harnesskit"), "utf8")).toBe("old");
  });

  it("safeWriteFile respects no-backup by skipping existing files", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-"));
    await fs.writeFile(path.join(dir, "AGENTS.md"), "old");
    const result = await safeWriteFile({ rootPath: dir, relativePath: "AGENTS.md", content: "new", backup: false });
    expect(result.skipped).toBe(true);
    expect(await fs.readFile(path.join(dir, "AGENTS.md"), "utf8")).toBe("old");
  });

  it("safeWriteFile respects dry-run", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-"));
    await safeWriteFile({ rootPath: dir, relativePath: "CLAUDE.md", content: "new", dryRun: true });
    expect(await fs.pathExists(path.join(dir, "CLAUDE.md"))).toBe(false);
  });

  it("safeWriteFile respects force", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-"));
    await fs.writeFile(path.join(dir, "CLAUDE.md"), "old");
    const result = await safeWriteFile({ rootPath: dir, relativePath: "CLAUDE.md", content: "new", force: true });
    expect(result.backedUp).toBe(false);
    expect(await fs.readFile(path.join(dir, "CLAUDE.md"), "utf8")).toBe("new");
  });
});

describe("generators and pipeline", () => {
  it("schemas validate mock agent outputs", () => {
    expect(() => AgentOutputsSchema.parse(mockAgentOutputs())).not.toThrow();
  });

  it("generators create expected files and commercial sections", async () => {
    const snapshot = await createRepositorySnapshot({ rootPath: nodeCleanFixture, deep: true });
    const files = generateAllFiles(snapshot, mockAgentOutputs());
    const paths = files.map((file) => file.path);
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".cursor/rules/harnesskit.mdc");
    expect(paths).toContain(".github/copilot-instructions.md");
    expect(paths).toContain(".harnesskit/project.yml");
    expect(paths).toContain(".harnesskit/audit-report.md");
    expect(paths).toContain(".harnesskit/executive-summary.md");
    expect(paths).toContain(".harnesskit/manual-review-checklist.md");
    expect(paths).toContain(".harnesskit/client-delivery-notes.md");
    expect(paths).toContain(".harnesskit/internal/final-review.json");
    expect(paths.some((file) => file.startsWith(".harnesskit/playbooks/"))).toBe(true);

    const claude = files.find((file) => file.path === "CLAUDE.md")?.content ?? "";
    expect(claude).toContain("Required Workflow For AI Agents");
    expect(claude).toContain("Manages users");

    const audit = files.find((file) => file.path === ".harnesskit/audit-report.md")?.content ?? "";
    expect(audit).toContain("AI-Readiness Score");
    expect(audit).toContain("Before vs After");
    expect(audit).toContain("Manual Review Checklist");
  });

  it("setup pipeline runs in deep mode with a mock LLM provider", async () => {
    const dir = await copyFixture(nodeCleanFixture);
    const result = await runHarnessSetup({ rootPath: dir, deep: true, dryRun: false, llm: new MockLlmProvider() });
    expect(result.snapshot.moduleSummaries?.length).toBeGreaterThan(0);
    expect(result.writtenFiles).toContain("CLAUDE.md");
    expect(result.writtenFiles).toContain(".harnesskit/internal/final-review.json");
    expect(await fs.pathExists(path.join(dir, ".harnesskit/internal/agent-outputs.json"))).toBe(true);
  });

  it("review updates finalReview and regenerates docs", async () => {
    const dir = await copyFixture(nodeCleanFixture);
    await runHarnessSetup({ rootPath: dir, deep: true, llm: new MockLlmProvider() });
    const reviewed = await runHarnessReview({
      rootPath: dir,
      llm: new MockLlmProvider({
        finalReview: {
          ...mockAgentOutputs().finalReview,
          overallQualityScore: 91,
          clientDeliveryNotes: ["Regenerated after review"]
        }
      }),
      regenerate: true
    });

    expect(reviewed.outputs.finalReview.overallQualityScore).toBe(91);
    const audit = await fs.readFile(path.join(dir, ".harnesskit/audit-report.md"), "utf8");
    expect(audit).toContain("91/100");
    expect(await fs.pathExists(path.join(dir, ".harnesskit/internal/final-review.json"))).toBe(true);
  });
});

async function copyFixture(fixture: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-fixture-"));
  await fs.copy(fixture, dir);
  return dir;
}

function mockBySchema(schemaName: string, overrides: Partial<AgentOutputs> = {}): unknown {
  const outputs = { ...mockAgentOutputs(), ...overrides };
  const map: Record<string, unknown> = {
    ProjectOverviewOutput: outputs.projectOverview,
    ArchitectureOutput: outputs.architecture,
    DomainModelOutput: outputs.domainModel,
    CriticalFlowsOutput: outputs.criticalFlows,
    TestingOutput: outputs.testing,
    SensitiveAreasOutput: outputs.sensitiveAreas,
    WorkflowOutput: outputs.workflow,
    PlaybookOutput: outputs.playbooks,
    FinalReviewOutput: outputs.finalReview
  };
  return map[schemaName];
}

function mockAgentOutputs(): AgentOutputs {
  return {
    projectOverview: {
      projectName: "Clean Users API",
      projectType: "Node.js API",
      businessPurpose: "Manages users for a small API service.",
      mainUsers: ["Developers", "API clients"],
      mainCapabilities: ["Create users", "Persist users"],
      externalIntegrations: [],
      runtimeContext: "Node.js",
      confidence: 0.86,
      evidence: [{ file: "README.md", reason: "Project description" }]
    },
    architecture: {
      architectureStyle: "Layered clean architecture",
      confidence: 0.82,
      inferred: true,
      requiresHumanValidation: true,
      layers: [{ name: "Application use cases", pathPatterns: ["src/application/use-cases/**"], responsibility: "Business application logic", allowedDependencies: ["src/domain/**"], forbiddenDependencies: ["src/presentation/**"] }],
      moduleBoundaries: [{ module: "users", paths: ["src/domain/entities/User.ts", "src/application/use-cases/CreateUserUseCase.ts"], responsibility: "User creation" }],
      conventions: ["Place business logic in use cases under src/application/use-cases"],
      antiPatternsToAvoid: ["Do not place business logic in presentation controllers"],
      evidence: [{ file: "src/application/use-cases/CreateUserUseCase.ts", reason: "Use case layer" }]
    },
    domainModel: {
      entities: [{ name: "User", description: "Application user", files: ["src/domain/entities/User.ts"], importantFields: ["id", "email"], relationships: [] }],
      dataStores: [{ type: "Repository", name: "UserRepository", relatedFiles: ["src/infrastructure/database/UserRepository.ts"] }],
      apiContracts: [{ name: "UserController", description: "User creation entry point", files: ["src/presentation/controllers/UserController.ts"] }],
      businessRules: ["Users need an email"],
      evidence: [{ file: "src/domain/entities/User.ts", reason: "User entity" }]
    },
    criticalFlows: {
      flows: [{
        name: "User creation",
        description: "Creates a user through the presentation controller and application use case.",
        entryPoints: ["src/presentation/controllers/UserController.ts"],
        involvedModules: ["users"],
        riskLevel: "medium",
        whyCritical: "Changes user data",
        agentGuidance: "Update the use case first and add tests around user creation.",
        confidence: 0.78,
        inferred: false,
        requiresHumanValidation: true,
        evidence: [{ file: "src/presentation/controllers/UserController.ts", reason: "Entry point" }]
      }]
    },
    testing: {
      testFrameworks: ["Vitest"],
      testCommands: ["pnpm test"],
      testFilePatterns: ["tests/**/*.test.ts"],
      mockingStyle: "Not detected",
      assertionStyle: "expect",
      testConventions: ["Use describe/it"],
      gaps: ["Limited coverage"],
      agentTestingInstructions: ["Run pnpm test"],
      evidence: [{ file: "tests/CreateUserUseCase.test.ts", reason: "Existing use case test" }]
    },
    sensitiveAreas: {
      sensitiveAreas: [{
        name: "User data",
        pathPatterns: ["src/domain/entities/User.ts", "src/infrastructure/database/**"],
        severity: "medium",
        reason: "Handles user email data and persistence.",
        requiredHumanReview: true,
        instructionsForAgents: "Avoid changing user data shape without explicit approval.",
        confidence: 0.8,
        inferred: false,
        requiresHumanValidation: true,
        evidence: [{ file: "src/domain/entities/User.ts", reason: "User email field" }]
      }],
      secretsHandling: ["Do not read .env files"],
      riskyCommands: ["rm -rf", "prisma migrate deploy"],
      protectedFiles: [".env", ".env.*"]
    },
    workflow: {
      packageManager: "pnpm",
      installCommand: "pnpm install",
      devCommand: null,
      buildCommand: "pnpm build",
      testCommand: "pnpm test",
      lintCommand: "pnpm lint",
      typecheckCommand: "pnpm typecheck",
      formatCommand: null,
      ciWorkflows: [],
      commandEvidence: [
        { command: "pnpm test", sourceFile: "package.json", inferred: false, confidence: 0.9, requiresHumanValidation: false }
      ],
      definitionOfDone: ["Run tests", "Summarize risks"]
    },
    playbooks: {
      playbooks: [{
        id: "fix-bug",
        title: "Fix bug in user flow",
        whenToUse: "Use when fixing defects in the user creation flow.",
        steps: ["Inspect src/presentation/controllers/UserController.ts", "Patch the relevant use case under src/application/use-cases", "Run tests"],
        filesToInspectFirst: ["src/presentation/controllers/UserController.ts", "src/application/use-cases/CreateUserUseCase.ts"],
        allowedAreas: ["src/application/use-cases/**", "tests/**"],
        riskyAreas: ["src/infrastructure/database/**", ".env"],
        verificationCommands: ["pnpm test"],
        definitionOfDone: ["Tests pass"],
        confidence: 0.84,
        inferred: false,
        requiresHumanValidation: false
      }]
    },
    finalReview: {
      overallQualityScore: 84,
      issues: [],
      recommendedManualReviewItems: ["Validate inferred architecture boundaries", "Validate test commands"],
      isReadyForClientDelivery: true,
      clientDeliveryNotes: ["Review sensitive user data guidance before delivery"],
      strongestGeneratedAssets: ["Architecture map", "Playbooks"],
      weakestGeneratedAssets: ["Testing gaps"]
    }
  };
}

import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import type { LlmProvider } from "@harnesskit/core";
import {
  AgentOutputsSchema,
  createRepositorySnapshot,
  generateAllFiles,
  runHarnessSetup,
  safeWriteFile,
  scanRepository
} from "@harnesskit/core";
import type { AgentOutputs } from "@harnesskit/shared";

const fixture = path.join(process.cwd(), "tests/fixtures/minimal-repo");

class MockLlmProvider implements LlmProvider {
  async generateJson<T>(params: { schemaName: string; schema: { parse: (value: unknown) => T } }): Promise<T> {
    return params.schema.parse(mockBySchema(params.schemaName));
  }

  async generateText(): Promise<string> {
    return "mock";
  }
}

describe("scanner", () => {
  it("ignores generated, dependency, git, and env files", async () => {
    const dir = await copyFixture();
    await fs.ensureDir(path.join(dir, "node_modules/pkg"));
    await fs.ensureDir(path.join(dir, ".git"));
    await fs.ensureDir(path.join(dir, "dist"));
    await fs.writeFile(path.join(dir, ".env"), "SECRET=1");
    await fs.writeFile(path.join(dir, "node_modules/pkg/index.js"), "");
    await fs.writeFile(path.join(dir, ".git/config"), "");
    await fs.writeFile(path.join(dir, "dist/index.js"), "");

    const files = await scanRepository({ rootPath: dir });

    expect(files).not.toContain(".env");
    expect(files.some((file) => file.startsWith("node_modules/"))).toBe(false);
    expect(files.some((file) => file.startsWith(".git/"))).toBe(false);
    expect(files.some((file) => file.startsWith("dist/"))).toBe(false);
  });

  it("snapshot includes README, package config, source samples, and tests", async () => {
    const snapshot = await createRepositorySnapshot({ rootPath: fixture });
    expect(snapshot.documentationFiles.some((file) => file.path === "README.md")).toBe(true);
    expect(snapshot.packageFiles.some((file) => file.path === "package.json")).toBe(true);
    expect(snapshot.sourceSamples.some((file) => file.path === "src/index.ts")).toBe(true);
    expect(snapshot.testSamples.some((file) => file.path === "tests/index.test.ts")).toBe(true);
  });
});

describe("output", () => {
  it("safeWriteFile creates a backup", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-"));
    await fs.writeFile(path.join(dir, "CLAUDE.md"), "old");
    await safeWriteFile({ rootPath: dir, relativePath: "CLAUDE.md", content: "new" });
    expect(await fs.readFile(path.join(dir, "CLAUDE.md"), "utf8")).toBe("new");
    expect(await fs.readFile(path.join(dir, "CLAUDE.md.bak.harnesskit"), "utf8")).toBe("old");
  });
});

describe("generators and pipeline", () => {
  it("schemas validate mock agent outputs", () => {
    expect(() => AgentOutputsSchema.parse(mockAgentOutputs())).not.toThrow();
  });

  it("generators create expected files", async () => {
    const snapshot = await createRepositorySnapshot({ rootPath: fixture });
    const files = generateAllFiles(snapshot, mockAgentOutputs());
    const paths = files.map((file) => file.path);
    expect(paths).toContain("CLAUDE.md");
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain(".cursor/rules/harnesskit.mdc");
    expect(paths).toContain(".github/copilot-instructions.md");
    expect(paths).toContain(".harnesskit/project.yml");
    expect(paths).toContain(".harnesskit/internal/agent-outputs.json");
  });

  it("setup pipeline runs with a mock LLM provider", async () => {
    const dir = await copyFixture();
    const result = await runHarnessSetup({ rootPath: dir, llm: new MockLlmProvider() });
    expect(result.writtenFiles).toContain("CLAUDE.md");
    expect(await fs.pathExists(path.join(dir, ".harnesskit/internal/agent-outputs.json"))).toBe(true);
  });
});

async function copyFixture(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "harnesskit-fixture-"));
  await fs.copy(fixture, dir);
  return dir;
}

function mockBySchema(schemaName: string): unknown {
  const outputs = mockAgentOutputs();
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
      projectName: "Minimal API",
      projectType: "Node.js API",
      businessPurpose: "Manages users for a small API service.",
      mainUsers: ["Developers"],
      mainCapabilities: ["Create users"],
      externalIntegrations: [],
      runtimeContext: "Node.js",
      confidence: 0.8,
      evidence: [{ file: "README.md", reason: "Project description" }]
    },
    architecture: {
      architectureStyle: "Small modular service",
      layers: [{ name: "Source", pathPatterns: ["src/**"], responsibility: "Application code", allowedDependencies: [], forbiddenDependencies: [] }],
      moduleBoundaries: [{ module: "users", paths: ["src/index.ts"], responsibility: "User creation" }],
      conventions: ["Keep logic in src"],
      antiPatternsToAvoid: ["Do not skip tests"],
      evidence: [{ file: "src/index.ts", reason: "Source sample" }]
    },
    domainModel: {
      entities: [{ name: "User", description: "Application user", files: ["src/index.ts"], importantFields: ["id", "email"], relationships: [] }],
      dataStores: [],
      apiContracts: [],
      businessRules: ["Users need an email"],
      evidence: [{ file: "src/index.ts", reason: "User type" }]
    },
    criticalFlows: {
      flows: [{ name: "User creation", description: "Creates a user", entryPoints: ["src/index.ts"], involvedModules: ["users"], riskLevel: "medium", whyCritical: "Changes user data", agentGuidance: "Add tests for changes" }]
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
      evidence: [{ file: "tests/index.test.ts", reason: "Existing test" }]
    },
    sensitiveAreas: {
      sensitiveAreas: [{ name: "User data", pathPatterns: ["src/**"], severity: "medium", reason: "Handles user emails", requiredHumanReview: true, instructionsForAgents: "Review changes carefully" }],
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
      typecheckCommand: null,
      formatCommand: null,
      ciWorkflows: [],
      definitionOfDone: ["Run tests", "Summarize risks"]
    },
    playbooks: {
      playbooks: [{
        id: "fix-bug",
        title: "Fix bug",
        whenToUse: "Use for bug fixes",
        steps: ["Reproduce", "Patch", "Test"],
        filesToInspectFirst: ["src/index.ts"],
        allowedAreas: ["src/**"],
        riskyAreas: [".env"],
        verificationCommands: ["pnpm test"],
        definitionOfDone: ["Tests pass"]
      }]
    },
    finalReview: {
      overallQualityScore: 82,
      issues: [],
      recommendedManualReviewItems: ["Validate generated architecture"],
      isReadyForClientDelivery: true
    }
  };
}

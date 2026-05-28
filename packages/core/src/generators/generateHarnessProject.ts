import yaml from "js-yaml";
import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";

export function generateHarnessProject(outputs: AgentOutputs): GeneratedFile {
  const doc = {
    version: 1,
    project: {
      name: outputs.projectOverview.projectName,
      type: outputs.projectOverview.projectType,
      purpose: outputs.projectOverview.businessPurpose,
      main_users: outputs.projectOverview.mainUsers,
      main_capabilities: outputs.projectOverview.mainCapabilities
    },
    architecture: {
      style: outputs.architecture.architectureStyle,
      confidence: outputs.architecture.confidence,
      inferred: outputs.architecture.inferred,
      requires_human_validation: outputs.architecture.requiresHumanValidation,
      layers: outputs.architecture.layers,
      modules: outputs.architecture.moduleBoundaries,
      conventions: outputs.architecture.conventions,
      forbidden_patterns: outputs.architecture.antiPatternsToAvoid
    },
    domain: {
      entities: outputs.domainModel.entities,
      data_stores: outputs.domainModel.dataStores,
      api_contracts: outputs.domainModel.apiContracts,
      business_rules: outputs.domainModel.businessRules
    },
    critical_flows: outputs.criticalFlows.flows.map((flow) => ({
      name: flow.name,
      risk_level: flow.riskLevel,
      entry_points: flow.entryPoints,
      guidance: flow.agentGuidance,
      confidence: flow.confidence,
      inferred: flow.inferred,
      requires_human_validation: flow.requiresHumanValidation
    })),
    testing: {
      frameworks: outputs.testing.testFrameworks,
      commands: outputs.testing.testCommands,
      conventions: outputs.testing.testConventions,
      definition_of_done: outputs.workflow.definitionOfDone
    },
    workflow: {
      package_manager: outputs.workflow.packageManager,
      install: outputs.workflow.installCommand,
      dev: outputs.workflow.devCommand,
      build: outputs.workflow.buildCommand,
      test: outputs.workflow.testCommand,
      lint: outputs.workflow.lintCommand,
      typecheck: outputs.workflow.typecheckCommand
    },
    sensitive_areas: outputs.sensitiveAreas.sensitiveAreas.map((area) => ({
      name: area.name,
      paths: area.pathPatterns,
      severity: area.severity,
      reason: area.reason,
      requires_human_review: area.requiredHumanReview,
      confidence: area.confidence,
      inferred: area.inferred,
      requires_human_validation: area.requiresHumanValidation
    })),
    agent_rules: {
      always: [
        "Read CLAUDE.md or AGENTS.md before changing code.",
        "Inspect the relevant architecture, domain, sensitive-area, and playbook files first.",
        "Cite uncertainty and ask for human review when touching critical flows."
      ],
      never: [
        "Do not edit secrets or env files.",
        "Do not bypass tests or CI checks.",
        "Do not modify sensitive areas without explicit approval."
      ],
      before_finishing: outputs.workflow.definitionOfDone
    },
    playbooks: outputs.playbooks.playbooks.map((playbook) => ({
      id: playbook.id,
      title: playbook.title,
      file: `.harnesskit/playbooks/${playbook.id}.md`
    }))
  };

  return { path: ".harnesskit/project.yml", content: `${yaml.dump(doc, { lineWidth: 120 })}` };
}

import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { evidence, formatMarkdown, list, readinessLabel, validationMarker } from "../output/formatMarkdown.js";

export function generateAuditReport(outputs: AgentOutputs): GeneratedFile {
  const score = outputs.finalReview.overallQualityScore;
  return {
    path: ".harnesskit/audit-report.md",
    content: formatMarkdown(`
# AI-Ready Repository Audit

## Executive Summary

HarnessKit analyzed this repository and generated an AI-ready setup for coding agents. The setup documents the project purpose, architecture, domain model, critical flows, sensitive areas, verification workflow, agent instructions, task playbooks, and reusable prompt pack.

This audit is designed for consultant review before client delivery. It is generated from repository evidence and marks inferred or low-confidence conclusions where human validation is needed.

## AI-Readiness Score

**${score}/100 - ${readinessLabel(score)}**

- 0-40: not ready
- 41-70: partially ready
- 71-85: usable with review
- 86-100: strong AI-ready foundation

## What HarnessKit Generated

- \`CLAUDE.md\`: Claude Code operating instructions.
- \`AGENTS.md\`: tool-agnostic AI agent instructions.
- \`.cursor/rules/harnesskit.mdc\`: Cursor project rules.
- \`.github/copilot-instructions.md\`: Copilot repository instructions.
- \`.harnesskit/project.yml\`: structured source of truth.
- \`.harnesskit/architecture.md\`: architecture map and boundaries.
- \`.harnesskit/domains.md\`: domain and capability map.
- \`.harnesskit/data-models.md\`: entities, data stores, and contracts.
- \`.harnesskit/critical-flows.md\`: high-risk flows and agent guidance.
- \`.harnesskit/sensitive-areas.md\`: protected areas and review policy.
- \`.harnesskit/playbooks/*\`: task-specific workflows for agents.
- \`.harnesskit/prompts/*\`: prompt templates for common work.

## Repository Understanding

${outputs.projectOverview.businessPurpose}

- Project type: ${outputs.projectOverview.projectType}
- Runtime context: ${outputs.projectOverview.runtimeContext}
- Main users: ${outputs.projectOverview.mainUsers.join(", ") || "Not detected"}
- Main capabilities: ${outputs.projectOverview.mainCapabilities.join(", ") || "Not detected"}

Evidence:
${evidence(outputs.projectOverview.evidence)}

## Architecture Map

${validationMarker(outputs.architecture)}

Architecture style: ${outputs.architecture.architectureStyle}

${outputs.architecture.layers.map((layer) => `### ${layer.name}\n\n${layer.responsibility}\n\nPaths: ${layer.pathPatterns.map((p) => `\`${p}\``).join(", ") || "Not detected"}`).join("\n\n") || "No architecture layers detected with confidence."}

Evidence:
${evidence(outputs.architecture.evidence)}

## Domain and Data Model Map

${outputs.domainModel.entities.map((entity) => `- **${entity.name}**: ${entity.description}. Files: ${entity.files.map((file) => `\`${file}\``).join(", ") || "Not detected"}`).join("\n") || "- No domain entities detected with confidence."}

Data stores:
${outputs.domainModel.dataStores.map((store) => `- ${store.type}: ${store.name} (${store.relatedFiles.map((file) => `\`${file}\``).join(", ")})`).join("\n") || "- No data stores detected with confidence."}

API contracts:
${outputs.domainModel.apiContracts.map((contract) => `- ${contract.name}: ${contract.description} (${contract.files.map((file) => `\`${file}\``).join(", ")})`).join("\n") || "- No API contracts detected with confidence."}

## Critical Flows and Risk Areas

${outputs.criticalFlows.flows.map((flow) => `### ${flow.name}\n\nRisk: ${flow.riskLevel}\n\n${validationMarker(flow)}\n\n${flow.description}\n\nWhy critical: ${flow.whyCritical}\n\nEntry points: ${flow.entryPoints.map((file) => `\`${file}\``).join(", ") || "Not detected"}\n\nAgent guidance: ${flow.agentGuidance}\n\nEvidence:\n${evidence(flow.evidence)}`).join("\n\n") || "No critical flows detected with confidence."}

## Sensitive Areas for AI Agents

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `### ${area.name}\n\nSeverity: ${area.severity}\n\n${validationMarker(area)}\n\nPaths: ${area.pathPatterns.map((item) => `\`${item}\``).join(", ") || "Not detected"}\n\nWhy it matters: ${area.reason}\n\nHuman review required: ${area.requiredHumanReview ? "yes" : "no"}\n\nAgent policy: ${area.instructionsForAgents}\n\nEvidence:\n${evidence(area.evidence)}`).join("\n\n") || "No sensitive areas detected. Validate manually before delivery."}

## Recommended AI Agent Workflow

1. Read \`CLAUDE.md\` or \`AGENTS.md\`.
2. Identify the relevant domain/module.
3. Read the closest playbook under \`.harnesskit/playbooks/\`.
4. Check \`.harnesskit/sensitive-areas.md\`.
5. Make a focused, reviewable change.
6. Run the relevant verification commands.
7. Summarize changed files, risks, and any manual validation needed.

## Before vs After

Before:
- Agents lack consistent repository context.
- Architecture and sensitive areas are not explicitly documented for AI use.
- Common tasks do not have project-specific playbooks.
- Verification expectations may be scattered across config, docs, and CI.

After:
- Agents have project-specific instructions.
- Architecture, domains, data models, and critical flows are mapped.
- Sensitive areas are marked with human-review policies.
- Playbooks guide common tasks with repo-specific files and commands.
- A consultant has a checklist for manual review before PR delivery.

## Manual Review Checklist

${list(outputs.finalReview.recommendedManualReviewItems)}

## Recommended First AI Tasks

${list(outputs.playbooks.playbooks.map((playbook) => `${playbook.title}: ${playbook.whenToUse}`))}

## Final Review Notes

Client delivery notes:
${list(outputs.finalReview.clientDeliveryNotes)}

Strongest generated assets:
${list(outputs.finalReview.strongestGeneratedAssets)}

Weakest generated assets:
${list(outputs.finalReview.weakestGeneratedAssets)}

## Limitations

- Generated from repository evidence selected by HarnessKit.
- Some conclusions may be inferred and require human validation.
- This setup improves AI-agent context but does not guarantee perfect AI-generated code.
- Secrets and env files are intentionally ignored by default.
- A human consultant should review all generated files before client delivery.
`)
  };
}

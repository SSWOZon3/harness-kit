import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { evidence, formatMarkdown, list, readinessLabel, validationMarker } from "../output/formatMarkdown.js";

export function generateMarkdownDocs(outputs: AgentOutputs): GeneratedFile[] {
  return [
    {
      path: ".harnesskit/architecture.md",
      content: formatMarkdown(`
# Architecture

Style: ${outputs.architecture.architectureStyle}

${validationMarker(outputs.architecture)}

## Layers

${outputs.architecture.layers.map((layer) => `### ${layer.name}\n\n${layer.responsibility}\n\nPaths: ${layer.pathPatterns.map((item) => `\`${item}\``).join(", ") || "Not detected"}\n\nAllowed dependencies: ${layer.allowedDependencies.join(", ") || "Not specified"}\n\nForbidden dependencies: ${layer.forbiddenDependencies.join(", ") || "Not specified"}`).join("\n\n")}

## Module Boundaries

${outputs.architecture.moduleBoundaries.map((module) => `- ${module.module}: ${module.responsibility} (${module.paths.map((item) => `\`${item}\``).join(", ")})`).join("\n") || "- No explicit boundaries detected."}

## Conventions

${list(outputs.architecture.conventions)}

## Anti-patterns to avoid

${list(outputs.architecture.antiPatternsToAvoid)}

## Evidence

${evidence(outputs.architecture.evidence)}
`)
    },
    {
      path: ".harnesskit/domains.md",
      content: formatMarkdown(`
# Domains

## Main capabilities

${list(outputs.projectOverview.mainCapabilities)}

## Business rules

${list(outputs.domainModel.businessRules)}

## Evidence

${evidence(outputs.domainModel.evidence)}
`)
    },
    {
      path: ".harnesskit/data-models.md",
      content: formatMarkdown(`
# Data Models

## Entities

${outputs.domainModel.entities.map((entity) => `### ${entity.name}\n\n${entity.description}\n\nFiles: ${entity.files.map((file) => `\`${file}\``).join(", ") || "Not detected"}\n\nFields: ${entity.importantFields.join(", ") || "Not detected"}\n\nRelationships: ${entity.relationships.join(", ") || "Not detected"}`).join("\n\n") || "No entities detected with confidence."}

## Data stores

${outputs.domainModel.dataStores.map((store) => `- ${store.type}: ${store.name} (${store.relatedFiles.map((file) => `\`${file}\``).join(", ")})`).join("\n") || "- No data stores detected with confidence."}

## API contracts

${outputs.domainModel.apiContracts.map((contract) => `- ${contract.name}: ${contract.description} (${contract.files.map((file) => `\`${file}\``).join(", ")})`).join("\n") || "- No API contracts detected with confidence."}
`)
    },
    {
      path: ".harnesskit/critical-flows.md",
      content: formatMarkdown(`
# Critical Flows

${outputs.criticalFlows.flows.map((flow) => `## ${flow.name}\n\nRisk: ${flow.riskLevel}\n\n${validationMarker(flow)}\n\n${flow.description}\n\nEntry points: ${flow.entryPoints.map((file) => `\`${file}\``).join(", ") || "Not detected"}\n\nModules: ${flow.involvedModules.join(", ") || "Not detected"}\n\nWhy critical: ${flow.whyCritical}\n\nAgent guidance: ${flow.agentGuidance}\n\nEvidence:\n${evidence(flow.evidence)}`).join("\n\n") || "No critical flows detected with confidence."}
`)
    },
    {
      path: ".harnesskit/testing.md",
      content: formatMarkdown(`
# Testing

## Frameworks

${list(outputs.testing.testFrameworks)}

## Commands

${list(outputs.testing.testCommands.map((command) => `\`${command}\``))}

## Patterns

${list(outputs.testing.testFilePatterns)}

## Conventions

${list(outputs.testing.testConventions)}

## Gaps

${list(outputs.testing.gaps)}

## Agent instructions

${list(outputs.testing.agentTestingInstructions)}

## Evidence

${evidence(outputs.testing.evidence)}
`)
    },
    {
      path: ".harnesskit/workflows.md",
      content: formatMarkdown(`
# Workflows

- Package manager: ${outputs.workflow.packageManager}
- Install: ${outputs.workflow.installCommand ?? "Not detected"}
- Dev: ${outputs.workflow.devCommand ?? "Not detected"}
- Build: ${outputs.workflow.buildCommand ?? "Not detected"}
- Test: ${outputs.workflow.testCommand ?? "Not detected"}
- Lint: ${outputs.workflow.lintCommand ?? "Not detected"}
- Typecheck: ${outputs.workflow.typecheckCommand ?? "Not detected"}
- Format: ${outputs.workflow.formatCommand ?? "Not detected"}

## CI workflows

${outputs.workflow.ciWorkflows.map((workflow) => `- ${workflow.name}: \`${workflow.file}\` (${workflow.relevantCommands.join(", ") || "commands not detected"})`).join("\n") || "- No CI workflows detected."}

## Definition of done

${list(outputs.workflow.definitionOfDone)}
`)
    },
    {
      path: ".harnesskit/sensitive-areas.md",
      content: formatMarkdown(`
# Sensitive Areas

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `## ${area.name}\n\nSeverity: ${area.severity}\n\n${validationMarker(area)}\n\nPaths: ${area.pathPatterns.map((item) => `\`${item}\``).join(", ") || "Not detected"}\n\nReason: ${area.reason}\n\nHuman review required: ${area.requiredHumanReview ? "yes" : "no"}\n\nAgent instructions: ${area.instructionsForAgents}\n\nEvidence:\n${evidence(area.evidence)}`).join("\n\n") || "No sensitive areas detected. Validate manually before client delivery."}

## Secrets handling

${list(outputs.sensitiveAreas.secretsHandling)}

## Risky commands

${list(outputs.sensitiveAreas.riskyCommands.map((command) => `\`${command}\``))}

## Protected files

${list(outputs.sensitiveAreas.protectedFiles.map((file) => `\`${file}\``))}
`)
    },
    {
      path: ".harnesskit/ai-usage-guide.md",
      content: formatMarkdown(`
# AI Usage Guide

## Using Claude Code

Open Claude Code in the repository root. Ask it to read \`CLAUDE.md\` before starting.

Example prompt:

\`\`\`md
Read CLAUDE.md and use the playbook \`.harnesskit/playbooks/fix-bug.md\`.
Fix the issue where...
\`\`\`

## Using Cursor

Cursor will pick up \`.cursor/rules/harnesskit.mdc\`. Also ask it to read \`AGENTS.md\` for task-specific context.

## Using Codex

Ask Codex to read \`AGENTS.md\`, inspect the relevant HarnessKit docs, and use the closest playbook before editing.

## Using Copilot

Copilot instructions live in \`.github/copilot-instructions.md\`. Keep prompts focused and point Copilot to the relevant \`.harnesskit/*\` file.

## Human review

Review generated outputs before client delivery, especially sensitive areas, architecture inferences, and verification commands.
`)
    },
    {
      path: ".harnesskit/executive-summary.md",
      content: formatMarkdown(`
# Executive Summary

HarnessKit generated an AI-ready repository setup for ${outputs.projectOverview.projectName}. The setup gives coding agents project instructions, architecture context, sensitive-area policies, task playbooks, prompt templates, and verification expectations.

## AI-Readiness

Score: ${outputs.finalReview.overallQualityScore}/100 - ${readinessLabel(outputs.finalReview.overallQualityScore)}

## What changed

- Added AI agent instructions for Claude, Cursor, Codex, Copilot, and generic agents.
- Added architecture, domain, data model, critical flow, testing, workflow, and sensitive-area documentation.
- Added playbooks and prompt templates for common agent tasks.
- Added manual review and delivery notes for consultant/client validation.

## Consultant note

This output is ready for manual consultant review. Validate inferred architecture, sensitive areas, commands, and weak playbooks before delivery.
`)
    },
    {
      path: ".harnesskit/manual-review-checklist.md",
      content: formatMarkdown(`
# Manual Review Checklist

## Required consultant review

${list(outputs.finalReview.recommendedManualReviewItems)}

## Validate generated assets

- Confirm \`CLAUDE.md\` and \`AGENTS.md\` are accurate and concise.
- Confirm architecture boundaries match the real codebase.
- Confirm workflow commands run locally or in CI.
- Confirm sensitive areas are complete and conservative.
- Confirm playbooks reference real files and useful commands.
- Confirm inferred conclusions are clearly marked.

## Final delivery decision

- Score: ${outputs.finalReview.overallQualityScore}/100 - ${readinessLabel(outputs.finalReview.overallQualityScore)}
- Client-deliverable after manual review: ${outputs.finalReview.isReadyForClientDelivery ? "yes" : "not yet"}
`)
    },
    {
      path: ".harnesskit/client-delivery-notes.md",
      content: formatMarkdown(`
# Client Delivery Notes

## What was generated

HarnessKit prepared this repository for AI coding agents by adding project-specific instructions, architecture maps, domain documentation, sensitive-area policies, playbooks, prompt templates, and verification guidance.

## How to use it

- Claude Code: start by reading \`CLAUDE.md\`.
- Cursor: use \`.cursor/rules/harnesskit.mdc\` and ask Cursor to read \`AGENTS.md\`.
- Codex: ask Codex to read \`AGENTS.md\` and the relevant playbook.
- Copilot: repository guidance lives in \`.github/copilot-instructions.md\`.

## Manual validation required

${list(outputs.finalReview.recommendedManualReviewItems)}

## Suggested first tasks

${list(outputs.playbooks.playbooks.map((playbook) => `${playbook.title}: ${playbook.whenToUse}`))}

## Limitations

- Generated from selected repository evidence.
- Some conclusions may be inferred and require validation.
- AI-ready context improves agent reliability but does not guarantee perfect code.
- Secrets and env files are ignored by default.
`)
    },
    {
      path: ".harnesskit/pull-request-body.md",
      content: formatMarkdown(`
# HarnessKit AI-Ready Setup

This PR prepares the repository for AI coding agents.

Generated:
- CLAUDE.md
- AGENTS.md
- Cursor rules
- Copilot instructions
- Architecture map
- Domain model summary
- Critical flows
- Sensitive areas
- Playbooks
- Prompt pack
- AI usage guide
- Manual review checklist
- Client delivery notes

Final review score: ${outputs.finalReview.overallQualityScore}/100 - ${readinessLabel(outputs.finalReview.overallQualityScore)}

Manual review recommended before relying on the generated instructions for sensitive work.
`)
    }
  ];
}

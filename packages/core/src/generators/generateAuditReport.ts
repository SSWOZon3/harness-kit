import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { evidence, formatMarkdown, list } from "../output/formatMarkdown.js";

export function generateAuditReport(outputs: AgentOutputs): GeneratedFile {
  return {
    path: ".harnesskit/audit-report.md",
    content: formatMarkdown(`
# AI-Ready Repository Audit

## Executive Summary

HarnessKit analyzed this repository and generated an AI-ready setup for coding agents. Final review score: ${outputs.finalReview.overallQualityScore}/100.

## What this project does

${outputs.projectOverview.businessPurpose}

Evidence:
${evidence(outputs.projectOverview.evidence)}

## Architecture detected

${outputs.architecture.architectureStyle}

${outputs.architecture.layers.map((layer) => `### ${layer.name}\n\n${layer.responsibility}\n\nPaths: ${layer.pathPatterns.map((p) => `\`${p}\``).join(", ")}`).join("\n\n")}

## Main domains and models

${outputs.domainModel.entities.map((entity) => `- ${entity.name}: ${entity.description} (${entity.files.map((file) => `\`${file}\``).join(", ")})`).join("\n") || "- No domain entities detected with confidence."}

## Critical flows

${outputs.criticalFlows.flows.map((flow) => `- ${flow.name} (${flow.riskLevel}): ${flow.whyCritical}`).join("\n") || "- No critical flows detected with confidence."}

## Testing and verification

Commands:
${list(outputs.testing.testCommands)}

Gaps:
${list(outputs.testing.gaps)}

## Sensitive areas

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `- ${area.name} (${area.severity}): ${area.reason}`).join("\n") || "- None detected. Requires manual validation."}

## Current AI-readiness score

${outputs.finalReview.overallQualityScore}/100

## Generated setup

- \`CLAUDE.md\`
- \`AGENTS.md\`
- \`.cursor/rules/harnesskit.mdc\`
- \`.github/copilot-instructions.md\`
- \`.harnesskit/project.yml\`
- \`.harnesskit/playbooks/*\`
- \`.harnesskit/prompts/*\`

## How to use this repo with AI agents

Ask agents to read \`CLAUDE.md\` or \`AGENTS.md\`, select the closest playbook, inspect sensitive areas, then make a focused change.

## Recommended first tasks for agents

${list(outputs.playbooks.playbooks.map((playbook) => `Use \`${playbook.id}\`: ${playbook.whenToUse}`))}

## Human review recommendations

${list(outputs.finalReview.recommendedManualReviewItems)}
`)
  };
}

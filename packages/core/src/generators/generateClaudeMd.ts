import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown, list, validationMarker } from "../output/formatMarkdown.js";

export function generateClaudeMd(outputs: AgentOutputs): GeneratedFile {
  return {
    path: "CLAUDE.md",
    content: formatMarkdown(`
# ${outputs.projectOverview.projectName}

This repository has been prepared with HarnessKit for AI-assisted engineering. Keep changes focused, evidence-based, and aligned with the documented architecture.

## Short Overview

${outputs.projectOverview.businessPurpose}

- Type: ${outputs.projectOverview.projectType}
- Runtime: ${outputs.projectOverview.runtimeContext}
- Detailed context: \`.harnesskit/project.yml\`

## Required Workflow For AI Agents

1. Read this file.
2. Identify the relevant domain/module.
3. Read the closest playbook in \`.harnesskit/playbooks/\`.
4. Inspect \`.harnesskit/sensitive-areas.md\`.
5. Make a focused change.
6. Run verification commands.
7. Summarize risks and files changed.

## Architecture Summary

${validationMarker(outputs.architecture)}

- Style: ${outputs.architecture.architectureStyle}
- Detailed architecture: \`.harnesskit/architecture.md\`
- Domains: \`.harnesskit/domains.md\`
- Data models: \`.harnesskit/data-models.md\`

Key conventions:
${list(outputs.architecture.conventions)}

## Commands

- Install: ${outputs.workflow.installCommand ?? "Not detected"}
- Dev: ${outputs.workflow.devCommand ?? "Not detected"}
- Build: ${outputs.workflow.buildCommand ?? "Not detected"}
- Test: ${outputs.workflow.testCommand ?? "Not detected"}
- Lint: ${outputs.workflow.lintCommand ?? "Not detected"}
- Typecheck: ${outputs.workflow.typecheckCommand ?? "Not detected"}

## Sensitive Areas

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `- ${area.name} (${area.severity}): ${area.pathPatterns.join(", ")}${area.requiresHumanValidation ? " - requires human validation" : ""}`).join("\n") || "- None detected. Validate manually."}

## Playbook Usage

Use the closest playbook before editing:
${list(outputs.playbooks.playbooks.map((playbook) => `\`.harnesskit/playbooks/${playbook.id}.md\` - ${playbook.title}${playbook.requiresHumanValidation ? " (manual validation recommended)" : ""}`))}

## Rules For Uncertainty

- Do not invent architecture, commands, integrations, or business rules.
- If something is inferred, say: "Inferred from repository structure; requires human validation."
- Cite concrete files when explaining decisions.
- Ask for human review before changing sensitive areas.

## Before Editing

- Read the files listed by the selected playbook.
- Check whether the target files are in a sensitive area.
- Prefer existing patterns over new abstractions.
- Keep the change small enough to review.

## Definition Of Done

${list(outputs.workflow.definitionOfDone)}
`)
  };
}

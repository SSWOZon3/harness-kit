import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown, list, validationMarker } from "../output/formatMarkdown.js";

export function generateAgentsMd(outputs: AgentOutputs): GeneratedFile {
  return {
    path: "AGENTS.md",
    content: formatMarkdown(`
# AI Agent Instructions

HarnessKit generated this file so any coding agent can work with better repository context. Start here, then use \`.harnesskit/project.yml\` and the relevant playbook.

## Project Overview

${outputs.projectOverview.businessPurpose}

- Project type: ${outputs.projectOverview.projectType}
- Runtime: ${outputs.projectOverview.runtimeContext}
- Capabilities: ${outputs.projectOverview.mainCapabilities.join(", ") || "Not detected"}

## Required Workflow For AI Agents

1. Read this file.
2. Identify the relevant domain/module.
3. Read the closest playbook under \`.harnesskit/playbooks/\`.
4. Inspect \`.harnesskit/sensitive-areas.md\`.
5. Make a focused change.
6. Run verification commands.
7. Summarize changed files, risks, and manual validation needs.

## Architecture

${validationMarker(outputs.architecture)}

- Style: ${outputs.architecture.architectureStyle}
- Details: \`.harnesskit/architecture.md\`
- Domains: \`.harnesskit/domains.md\`
- Data models: \`.harnesskit/data-models.md\`
- Critical flows: \`.harnesskit/critical-flows.md\`

## Commands

- Install: ${outputs.workflow.installCommand ?? "Not detected"}
- Dev: ${outputs.workflow.devCommand ?? "Not detected"}
- Build: ${outputs.workflow.buildCommand ?? "Not detected"}
- Test: ${outputs.workflow.testCommand ?? "Not detected"}
- Lint: ${outputs.workflow.lintCommand ?? "Not detected"}
- Typecheck: ${outputs.workflow.typecheckCommand ?? "Not detected"}

## Sensitive Areas

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `- ${area.name} (${area.severity}): ${area.reason}`).join("\n") || "- None detected. Validate manually."}

## Before Coding

${list([
  "Identify the relevant domain/module and inspect existing patterns.",
  "Read the matching playbook in .harnesskit/playbooks.",
  "Check .harnesskit/sensitive-areas.md before touching risky files.",
  "Do not modify secrets or env files.",
  "Mark inferred conclusions as requiring human validation."
])}

## Before Finishing

${list(outputs.workflow.definitionOfDone)}
`)
  };
}

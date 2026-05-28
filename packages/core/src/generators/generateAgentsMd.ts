import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown, list } from "../output/formatMarkdown.js";

export function generateAgentsMd(outputs: AgentOutputs): GeneratedFile {
  return {
    path: "AGENTS.md",
    content: formatMarkdown(`
# AI Agent Instructions

This repository has been prepared with HarnessKit. Start with this file, then inspect \`.harnesskit/project.yml\` and the relevant playbook for your task.

## Project

${outputs.projectOverview.businessPurpose}

## Architecture

- Style: ${outputs.architecture.architectureStyle}
- Details: \`.harnesskit/architecture.md\`
- Domains: \`.harnesskit/domains.md\`
- Data models: \`.harnesskit/data-models.md\`

## Commands

- Install: ${outputs.workflow.installCommand ?? "Not detected"}
- Dev: ${outputs.workflow.devCommand ?? "Not detected"}
- Build: ${outputs.workflow.buildCommand ?? "Not detected"}
- Test: ${outputs.workflow.testCommand ?? "Not detected"}
- Lint: ${outputs.workflow.lintCommand ?? "Not detected"}
- Typecheck: ${outputs.workflow.typecheckCommand ?? "Not detected"}

## Before Coding

${list([
  "Identify the relevant domain/module.",
  "Read the matching playbook in .harnesskit/playbooks.",
  "Check .harnesskit/sensitive-areas.md before touching risky files.",
  "Prefer small, reviewable changes."
])}

## Before Finishing

${list(outputs.workflow.definitionOfDone)}
`)
  };
}

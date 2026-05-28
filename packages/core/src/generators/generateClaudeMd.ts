import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown, list } from "../output/formatMarkdown.js";

export function generateClaudeMd(outputs: AgentOutputs): GeneratedFile {
  return {
    path: "CLAUDE.md",
    content: formatMarkdown(`
# ${outputs.projectOverview.projectName}

Read this before making changes. More detailed HarnessKit context lives in \`.harnesskit/\`.

## Project Overview

${outputs.projectOverview.businessPurpose}

- Type: ${outputs.projectOverview.projectType}
- Runtime: ${outputs.projectOverview.runtimeContext}
- Confidence: ${outputs.projectOverview.confidence}

## Main Capabilities

${list(outputs.projectOverview.mainCapabilities)}

## Architecture

- Style: ${outputs.architecture.architectureStyle}

Key conventions:
${list(outputs.architecture.conventions)}

See \`.harnesskit/architecture.md\` for layers and boundaries.

## Workflow Commands

- Install: ${outputs.workflow.installCommand ?? "Not detected"}
- Dev: ${outputs.workflow.devCommand ?? "Not detected"}
- Build: ${outputs.workflow.buildCommand ?? "Not detected"}
- Test: ${outputs.workflow.testCommand ?? "Not detected"}
- Lint: ${outputs.workflow.lintCommand ?? "Not detected"}
- Typecheck: ${outputs.workflow.typecheckCommand ?? "Not detected"}

## Sensitive Areas

${outputs.sensitiveAreas.sensitiveAreas.map((area) => `- ${area.name} (${area.severity}): ${area.pathPatterns.join(", ")}`).join("\n") || "- None detected. Validate manually."}

## Agent Rules

- Follow existing architecture and naming conventions.
- Keep changes focused to the requested task.
- Use the closest playbook in \`.harnesskit/playbooks/\`.
- Do not edit secrets, env files, auth, permissions, payments, migrations, infrastructure, or CI/CD unless explicitly requested.
- If a conclusion is inferred rather than evidenced, say so.

## Definition of Done

${list(outputs.workflow.definitionOfDone)}
`)
  };
}

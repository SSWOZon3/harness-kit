import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown } from "../output/formatMarkdown.js";

export function generateCursorRules(outputs: AgentOutputs): GeneratedFile {
  return {
    path: ".cursor/rules/harnesskit.mdc",
    content: formatMarkdown(`
---
description: HarnessKit AI-ready project rules
alwaysApply: true
---

# HarnessKit Rules

Project type: ${outputs.projectOverview.projectType}
Architecture: ${outputs.architecture.architectureStyle}

Always read \`AGENTS.md\` and the relevant \`.harnesskit/playbooks/*\` file before changing code.

Do not edit secrets, env files, auth, permissions, payments, migrations, infrastructure, deployment, CI/CD, or package publishing unless explicitly requested.

Use these verification commands when relevant:
${outputs.testing.testCommands.map((command) => `- \`${command}\``).join("\n") || "- No test command detected; validate manually."}
`)
  };
}

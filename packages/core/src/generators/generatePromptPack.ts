import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown } from "../output/formatMarkdown.js";

const templates: Array<{ path: string; title: string; task: string }> = [
  { path: ".harnesskit/prompts/feature-task.md", title: "Feature Task", task: "Implement the following feature: {{TASK}}" },
  { path: ".harnesskit/prompts/bugfix-task.md", title: "Bugfix Task", task: "Fix the following issue: {{TASK}}" },
  { path: ".harnesskit/prompts/refactor-task.md", title: "Refactor Task", task: "Refactor the following area: {{TASK}}" },
  { path: ".harnesskit/prompts/code-review.md", title: "Code Review", task: "Review the following change: {{TASK}}" },
  { path: ".harnesskit/prompts/test-generation.md", title: "Test Generation", task: "Add or improve tests for: {{TASK}}" }
];

export function generatePromptPack(outputs: AgentOutputs): GeneratedFile[] {
  const commandHint = outputs.workflow.testCommand ?? outputs.workflow.buildCommand ?? "the relevant verification command";
  return templates.map((template) => ({
    path: template.path,
    content: formatMarkdown(`
# ${template.title}

Read \`CLAUDE.md\` / \`AGENTS.md\` first.

Task:
${template.task}

Before coding:
1. Identify the relevant domain/module.
2. Read \`.harnesskit/architecture.md\`.
3. Select the closest playbook from \`.harnesskit/playbooks\`.
4. Identify sensitive areas that must not be touched.

While coding:
- Follow existing patterns.
- Keep changes focused.
- Do not modify sensitive areas unless explicitly requested.
- Add/update tests when needed.

Before finishing:
- Run \`${commandHint}\` or explain why it is not applicable.
- Summarize changed files.
- Explain any risk or manual review needed.
`)
  }));
}

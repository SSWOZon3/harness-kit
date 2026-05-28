import type { AgentOutputs, GeneratedFile } from "@harnesskit/shared";
import { formatMarkdown, list } from "../output/formatMarkdown.js";

export function generateCopilotInstructions(outputs: AgentOutputs): GeneratedFile {
  return {
    path: ".github/copilot-instructions.md",
    content: formatMarkdown(`
# Copilot Instructions

Follow the HarnessKit repository context.

- Read \`AGENTS.md\` first.
- Use \`.harnesskit/project.yml\` as the structured source of truth.
- Prefer repository patterns over generic snippets.
- Avoid sensitive areas unless the user explicitly asks for them.

Definition of done:
${list(outputs.workflow.definitionOfDone)}
`)
  };
}

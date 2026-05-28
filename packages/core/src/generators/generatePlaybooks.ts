import type { AgentOutputs, GeneratedFile, Playbook } from "@harnesskit/shared";
import { formatMarkdown, list } from "../output/formatMarkdown.js";

export function generatePlaybooks(outputs: AgentOutputs): GeneratedFile[] {
  return outputs.playbooks.playbooks.map((playbook) => ({
    path: `.harnesskit/playbooks/${playbook.id}.md`,
    content: renderPlaybook(playbook)
  }));
}

function renderPlaybook(playbook: Playbook): string {
  return formatMarkdown(`
# ${playbook.title}

## When to use

${playbook.whenToUse}

## Steps

${playbook.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

## Files to inspect first

${list(playbook.filesToInspectFirst.map((file) => `\`${file}\``))}

## Allowed areas

${list(playbook.allowedAreas)}

## Risky areas

${list(playbook.riskyAreas)}

## Verification commands

${list(playbook.verificationCommands.map((command) => `\`${command}\``))}

## Definition of done

${list(playbook.definitionOfDone)}
`);
}

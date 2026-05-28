# HarnessKit

HarnessKit is a local, private, agentic CLI for converting software repositories into AI-ready codebases for Claude Code, Cursor, Codex, Copilot, and other coding agents.

It is designed for a consulting workflow:

> I prepare your repository for professional AI-agent usage by adding project-specific instructions, architecture maps, domain maps, critical-flow guidance, sensitive-area policies, playbooks, and prompt packs.

HarnessKit is not a SaaS. It does not include auth, billing, a dashboard, a database, a GitHub App, or automatic PR creation.

## Paid Setup Workflow

```bash
git clone CLIENT_REPO
cd CLIENT_REPO
git checkout -b harnesskit/ai-ready-setup
harnesskit setup --path . --deep
# manually review generated files
git add .
git commit -m "chore: add HarnessKit AI-ready setup"
git push
```

Use `.harnesskit/pull-request-body.md` as the starting point for the client PR.

## What HarnessKit Does

HarnessKit:

- Scans the repository locally while ignoring secrets, generated files, dependencies, and binaries.
- Creates a compact repository snapshot for LLM analysis.
- Runs specialized AI agents for project overview, architecture, domains, critical flows, testing, sensitive areas, workflow, playbooks, and final review.
- Validates agent outputs with Zod schemas.
- Retries and repairs invalid JSON responses from the LLM.
- Generates AI-agent instructions and client-facing delivery assets.
- Marks inferred or low-confidence conclusions for manual validation.

## Generated Files

```txt
CLAUDE.md
AGENTS.md
.cursor/rules/harnesskit.mdc
.github/copilot-instructions.md
.harnesskit/project.yml
.harnesskit/audit-report.md
.harnesskit/executive-summary.md
.harnesskit/architecture.md
.harnesskit/domains.md
.harnesskit/data-models.md
.harnesskit/critical-flows.md
.harnesskit/testing.md
.harnesskit/workflows.md
.harnesskit/sensitive-areas.md
.harnesskit/ai-usage-guide.md
.harnesskit/manual-review-checklist.md
.harnesskit/client-delivery-notes.md
.harnesskit/playbooks/*.md
.harnesskit/prompts/*.md
.harnesskit/internal/repository-snapshot.json
.harnesskit/internal/agent-outputs.json
.harnesskit/internal/final-review.json
.harnesskit/internal/file-tree.md
.harnesskit/internal/important-files.json
.harnesskit/pull-request-body.md
```

## Install

```bash
pnpm install
pnpm build
```

For local development:

```bash
node apps/cli/dist/index.js --help
```

To link locally:

```bash
pnpm --filter harnesskit build
pnpm --filter harnesskit link --global
harnesskit --help
```

## Environment

Create a `.env` file or export variables:

```env
OPENAI_API_KEY=
HARNESSKIT_MODEL=gpt-4.1
HARNESSKIT_MAX_FILE_SIZE_KB=200
HARNESSKIT_MAX_FILES=300
HARNESSKIT_DEEP_MAX_FILES=600
HARNESSKIT_LLM_MAX_RETRIES=2
```

CLI `--model` overrides `HARNESSKIT_MODEL`.

## Commands

```bash
harnesskit init
harnesskit analyze --path ./repo
harnesskit analyze --path ./repo --deep
harnesskit generate --path ./repo
harnesskit setup --path ./repo --deep
harnesskit review --path ./repo --regenerate
```

Main consulting command:

```bash
harnesskit setup --path ./client-repo --deep
```

Useful flags:

```bash
--deep
--force
--dry-run
--no-backup
--model <model>
--max-files <number>
--max-file-size-kb <number>
```

## Deep Mode

Deep mode improves snapshot coverage for larger repositories. It:

- Builds a full file tree.
- Selects important files using stack-agnostic heuristics.
- Groups files by modules/directories.
- Samples representative files from each relevant module.
- Prioritizes docs, config, routes/controllers, services/use cases, domain models, repositories, tests, CI, and migrations.
- Adds `moduleSummaries`, `selectedModules`, and `selectionWarnings` to the repository snapshot.

Use it for real client work:

```bash
harnesskit setup --path . --deep
```

## Review Flow

After manually inspecting or editing generated outputs:

```bash
harnesskit review --path . --regenerate
```

By default, review regenerates final documents after updating the final review. Use `--no-regenerate` to only update internal review JSON.

## Safety And Privacy

HarnessKit runs locally. It sends selected repository context to the configured LLM provider only when running agent commands.

Ignored by default:

- `.env` and `.env.*`
- `.git`
- `node_modules`
- `dist`, `build`, `coverage`, `.next`, `.cache`
- common binary/media/archive/database files

Do not run HarnessKit on repositories containing secrets unless you have client approval and have reviewed scanner behavior.

## Limitations

- HarnessKit improves context and safety for AI agents, but does not guarantee perfect generated code.
- Generated files require human consultant review before delivery.
- Outputs may contain inferences and must be validated.
- It does not create PRs automatically.
- It does not run Claude Code, Cursor, Codex, or Copilot directly.

## Development

```bash
pnpm test
pnpm typecheck
pnpm build
```

Tests use mock LLM providers and never call OpenAI.

# HarnessKit

HarnessKit is a local, private CLI for preparing repositories to work better with AI coding agents such as Claude Code, Cursor, Codex, Copilot, and similar tools.

It is not a SaaS, dashboard, billing system, or hardcoded scanner. It is an agentic repository setup tool: it scans a client repository, asks specialized LLM agents to analyze the project, and generates a reviewable AI-ready setup that can be committed or opened as a pull request.

## What it generates

- `CLAUDE.md`
- `AGENTS.md`
- `.cursor/rules/harnesskit.mdc`
- `.github/copilot-instructions.md`
- `.harnesskit/project.yml`
- `.harnesskit/audit-report.md`
- `.harnesskit/architecture.md`
- `.harnesskit/domains.md`
- `.harnesskit/data-models.md`
- `.harnesskit/critical-flows.md`
- `.harnesskit/testing.md`
- `.harnesskit/workflows.md`
- `.harnesskit/sensitive-areas.md`
- `.harnesskit/ai-usage-guide.md`
- `.harnesskit/playbooks/*.md`
- `.harnesskit/prompts/*.md`
- `.harnesskit/internal/*.json`
- `.harnesskit/pull-request-body.md`

## Install

```bash
pnpm install
pnpm build
```

For local development:

```bash
pnpm --filter harnesskit build
node apps/cli/dist/index.js --help
```

After publishing or linking, the CLI is intended to run as:

```bash
harnesskit setup --path /path/to/client-repo
```

## Environment

Create a `.env` file or export these variables:

```env
OPENAI_API_KEY=
HARNESSKIT_MODEL=gpt-4.1
HARNESSKIT_MAX_FILE_SIZE_KB=200
HARNESSKIT_MAX_FILES=300
```

## Commands

```bash
harnesskit init
harnesskit analyze --path ./repo
harnesskit generate --path ./repo
harnesskit setup --path ./repo
harnesskit review --path ./repo
```

The MVP command is:

```bash
harnesskit setup --path ./repo
```

It runs:

```txt
scan -> agents -> generation -> final review -> write files
```

## Consultant workflow

```bash
git clone CLIENT_REPO
cd CLIENT_REPO
git checkout -b harnesskit/ai-ready-setup
harnesskit setup --path .
git add .
git commit -m "chore: add HarnessKit AI-ready setup"
git push
```

Then use `.harnesskit/pull-request-body.md` as the starting point for the PR.

## Safety and privacy

HarnessKit runs locally from your laptop. It does send selected repository context to the configured LLM provider when running agent commands.

By default, the scanner ignores:

- `.env` and `.env.*`
- `.git`
- `node_modules`
- `dist`, `build`, `coverage`, `.next`, `.cache`
- common binary/media/archive/database files

Do not run HarnessKit on repositories containing secrets unless you have reviewed the scanner rules and client approval.

## Limitations

- HarnessKit does not guarantee that AI agents will generate perfect code.
- HarnessKit prepares context, rules, maps, and playbooks to improve agent reliability.
- Generated files must be reviewed manually before client delivery.
- Outputs can contain inferences and should be validated.
- It does not currently open GitHub PRs automatically.
- It does not include a SaaS dashboard, database, auth, or billing.

## Development

```bash
pnpm test
pnpm typecheck
pnpm build
```

Tests use a mock LLM provider and do not call OpenAI.

import type { ImportantFile } from "@harnesskit/shared";

const priorityRules: Array<{ pattern: RegExp; reason: string; score: number }> = [
  { pattern: /^README/i, reason: "Primary project documentation", score: 100 },
  { pattern: /^docs\//, reason: "Project documentation", score: 95 },
  { pattern: /(^|\/)(package\.json|pyproject\.toml|go\.mod|Cargo\.toml|pubspec\.yaml|pom\.xml|build\.gradle|Makefile|Dockerfile|docker-compose[^/]*)$/, reason: "Build, runtime, or dependency configuration", score: 95 },
  { pattern: /^\.github\/workflows\//, reason: "CI workflow definition", score: 90 },
  { pattern: /(^|\/)(migrations|prisma)\//, reason: "Database schema or migration file", score: 88 },
  { pattern: /(^|\/)(schema|model|models|entities|domain|dto|types)\b/i, reason: "Domain model or schema candidate", score: 85 },
  { pattern: /(^|\/)(routes|controllers|handlers|pages|app\/api)\//i, reason: "Application entry point or API contract candidate", score: 82 },
  { pattern: /(^|\/)(services|use-cases|usecases|application|repositories|infrastructure)\//i, reason: "Business logic or infrastructure candidate", score: 80 },
  { pattern: /(^|\/)(test|tests|__tests__|spec)\//i, reason: "Representative test file", score: 70 },
  { pattern: /(^|\/)(src|app|lib)\//, reason: "Representative source file", score: 60 }
];

export function detectImportantFiles(paths: string[], maxFiles = 300): ImportantFile[] {
  const scored = paths
    .map((path) => {
      const rule = priorityRules.find((candidate) => candidate.pattern.test(path));
      return rule ? { path, reason: rule.reason, score: rule.score } : null;
    })
    .filter((value): value is { path: string; reason: string; score: number } => Boolean(value))
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const seen = new Set<string>();
  const result: ImportantFile[] = [];
  for (const item of scored) {
    if (seen.has(item.path)) continue;
    seen.add(item.path);
    result.push({ path: item.path, reason: item.reason });
    if (result.length >= maxFiles) break;
  }
  return result;
}

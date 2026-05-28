export function formatMarkdown(value: string): string {
  return `${value.trim()}\n`;
}

export function list(items: string[]): string {
  if (items.length === 0) return "- None detected. Requires human validation.";
  return items.map((item) => `- ${item}`).join("\n");
}

export function evidence(items: Array<{ file: string; reason: string }>): string {
  if (items.length === 0) return "- No explicit evidence captured. Requires human validation.";
  return items.map((item) => `- \`${item.file}\` - ${item.reason}`).join("\n");
}

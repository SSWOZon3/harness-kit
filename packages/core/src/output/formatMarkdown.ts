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

export function validationMarker(item: {
  confidence?: number;
  inferred?: boolean;
  requiresHumanValidation?: boolean;
}): string {
  const parts: string[] = [];
  if (typeof item.confidence === "number") parts.push(`Confidence: ${Math.round(item.confidence * 100)}%`);
  if (item.inferred) parts.push("Inferred - requires human validation");
  if (item.requiresHumanValidation && !item.inferred) parts.push("Requires human validation");
  return parts.length > 0 ? `_${parts.join(" | ")}_` : "";
}

export function readinessLabel(score: number): string {
  if (score <= 40) return "Not ready";
  if (score <= 70) return "Partially ready";
  if (score <= 85) return "Usable with consultant review";
  return "Strong AI-ready foundation";
}

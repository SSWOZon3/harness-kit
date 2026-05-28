export function buildFileTree(paths: string[]): string {
  const root: Record<string, unknown> = {};

  for (const filePath of paths.sort()) {
    const parts = filePath.split("/");
    let node = root;
    for (const part of parts) {
      node[part] ??= {};
      node = node[part] as Record<string, unknown>;
    }
  }

  const lines: string[] = [];
  const walk = (node: Record<string, unknown>, depth: number) => {
    const entries = Object.keys(node).sort();
    for (const entry of entries) {
      lines.push(`${"  ".repeat(depth)}- ${entry}`);
      walk(node[entry] as Record<string, unknown>, depth + 1);
    }
  };

  walk(root, 0);
  return lines.join("\n");
}

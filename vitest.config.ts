import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", "tests/fixtures/**"]
  },
  resolve: {
    alias: {
      "@harnesskit/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@harnesskit/shared": path.resolve(__dirname, "packages/shared/src/index.ts")
    }
  }
});

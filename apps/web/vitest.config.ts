import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Node-environment unit tests for pure logic (ranking, cost math, counting,
// corridor defaults). Component/DOM tests are out of scope for this runner —
// the invariant guards the audit backlog asks for all operate on plain data.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: {
      deps: {
        // compromise's exports map omits "./package.json"; inlining lets
        // vitest transform it directly instead of probing that subpath.
        inline: ["compromise"],
      },
    },
  },
});

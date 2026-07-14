import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(dirname, "src"),
    },
  },
  optimizeDeps: {
    include: [
      "@tanstack/react-query",
      "lucide-react",
      "react",
      "react-dom",
      "react-dom/client",
      "react-phone-number-input",
      "react-select-country-list",
    ],
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 50,
        lines: 50,
        functions: 48,
        branches: 35,
      },
      exclude: [
        // Les actions Next.js sont executees cote serveur et ne font pas partie
        // du perimetre des tests unitaires executes dans Chromium.
        "src/actions/**",
        // Les helpers de test ne sont pas du code applicatif.
        "src/tests/**",
        "**/*.module.scss",
        "**/*.scss",
        "**/*.css",
        "**/*.d.ts",
        "**/*.stories.{js,jsx,ts,tsx}",
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{js,jsx,ts,tsx}"],
          setupFiles: ["./src/tests/setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});

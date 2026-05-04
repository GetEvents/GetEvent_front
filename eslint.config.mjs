// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
  next,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: {
      prettier,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "react-hooks/exhaustive-deps": "error",
      "prettier/prettier": "error",
      "linebreak-style": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
]);

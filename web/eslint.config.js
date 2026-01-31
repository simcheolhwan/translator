import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginQuery from "@tanstack/eslint-plugin-query"

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  {
    ignores: ["dist", "node_modules", "routeTree.gen.ts"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
)

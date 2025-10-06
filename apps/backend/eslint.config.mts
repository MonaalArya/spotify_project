// eslint.config.mts
import eslint from "@eslint/js"; // Note: 'eslint' not 'js'—matches official example
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "generated/**", "node_modules/**", "**/*.js"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "off",
      "no-empty": "warn",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
] as const;

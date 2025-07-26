import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["./src/infra/db/db.types.ts"],
  },
  {
    files: ["**/*.repository.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  }
);

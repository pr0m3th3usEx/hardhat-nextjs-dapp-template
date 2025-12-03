import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  ...nextVitals,
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"] },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettier,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "artifacts/**",
    "cache/**",
  ]),
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "import/order": "error",
      "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
      "react-hooks/exhaustive-deps": "error", // Checks effect dependencies
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["utils/export-contracts.ts", "script/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          message:
            "Do not use JSON.parse, it breaks type safety, use sanitization utils instead",
          selector:
            "MemberExpression[object.name='JSON'][property.name='parse']",
        },
      ],
    },
  },
]);

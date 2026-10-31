import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // a context's hook is exported next to its provider on purpose
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "useFormField",
            "useAuth",
            "useNotifications",
            "useTenant",
            "useCurrentRole",
            "useAreaBase",
            "useCan",
            "useHasModule",
            "useTheme",
          ],
        },
      ],
    },
  },
  // Feature-Sliced Design: a layer imports only from layers below it, and only through a slice's public index.ts
  ...[
    ["shared", ["entities", "features", "widgets", "pages", "app"]],
    ["entities", ["features", "widgets", "pages", "app"]],
    ["features", ["widgets", "pages", "app"]],
    ["widgets", ["pages", "app"]],
    ["pages", ["app"]],
    ["app", []],
  ].map(([layer, above]) => ({
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...above.map((name) => ({ group: [`@/${name}/*`], message: `${layer} can't import from ${name}.` })),
            {
              group: ["@/entities/*/*", "@/features/*/*", "@/widgets/*/*"],
              message: "Import a slice through its public index.ts, e.g. @/entities/student.",
            },
          ],
        },
      ],
    },
  }))
);

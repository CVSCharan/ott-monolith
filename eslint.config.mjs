import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Architecture Rule 1: Monolith Module Boundary CI Gate
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/*",
                "!@/modules/*/index",
                "!@/modules/*/actions"
              ],
              message: "Deep imports into module internals are forbidden. Import from public index.ts or actions.ts only."
            },
            {
              group: ["@prisma/client", "@/lib/db"],
              message: "Direct database access is restricted to DAL files (*.dal.ts)."
            }
          ]
        }
      ]
    }
  },
  // Allow Prisma and db imports strictly inside DAL files and Prisma scripts
  {
    files: ["**/dal.ts", "**/*.dal.ts", "src/modules/**/dal.ts", "src/lib/db.ts", "prisma/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*/*",
                "!@/modules/*/index",
                "!@/modules/*/actions"
              ],
              message: "Deep imports into module internals are forbidden. Import from public index.ts or actions.ts only."
            }
          ]
        }
      ]
    }
  }
]);

export default eslintConfig;

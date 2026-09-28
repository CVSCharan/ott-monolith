# ADR 0010: Standardized `src/` Directory Layout

## Status
Accepted

## Context
The repository scaffold was initially created with `app/` at the root directory and path alias `"@/*": ["./*"]`. However, StreamForge is designed as a modular monolith containing:
- Next.js 16 App Router (`src/app/`)
- Domain modules with strict boundary rules (`src/modules/*`)
- Shared core libraries (`src/lib/*`)
- Edge/Node proxy middleware (`src/proxy.ts`)
- Database migrations, seeds, and schemas (`prisma/`)
- Architecture, design, and operational documentation (`docs/`)
- Worker processes and Docker configurations (`worker/`)

Leaving application code at the repository root causes namespace pollution, conflicts between config files (`next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`) and application source, complicates ESLint module boundary enforcement, and violates the architectural convention specified across all project documentation.

## Decision
1. Standardize on the `src/` directory layout:
   - Application routes: `src/app/`
   - Domain modules: `src/modules/<name>/`
   - Shared libraries: `src/lib/`
   - Next.js proxy middleware: `src/proxy.ts`
2. Update TypeScript configuration:
   - Map path alias `@/*` to `./src/*` in `tsconfig.json`.
3. Update Tailwind CSS v4 and PostCSS:
   - Configure Tailwind scanning within `./src/**/*.{ts,tsx,css}`.
4. Update ESLint boundary rules:
   - Enforce import boundaries relative to `src/modules/*`.

## Consequences
- **Positive:** Clean root directory; unambiguous separation between infrastructure config and runtime code; robust module boundary linting without false positives on root scripts.
- **Negative:** Requires `@/*` imports to resolve to `src/`, requiring existing root-level references to be aligned.

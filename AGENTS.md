# AGENTS.md

## Project

Rsbuild + React 19 + TypeScript starter. Package manager is **bun** (`>=1.3.0` in `package.json` `engines`). Do not use npm, yarn, or pnpm.

Shared agent config lives in `.agents/`. `.claude`, `.codex`, and `.cursor` are symlinks to that folder — edit `.agents/` only.

## Layout

- `src/` — app code (`index.tsx` entry, colocated `*.css`, `assets/`)
- `public/` — static files copied as-is
- `rsbuild.config.ts` — bundler
- `eslint.config.ts` / `.stylelintrc.json` / `.prettierrc` — lint and format

## Commands

- `bun run dev` — Start the dev server
- `bun run build` — Build the app for production
- `bun run preview` — Preview the production build locally
- `bun run lint` — Lint with ESLint and Stylelint
- `bun run format` — Format with Prettier
- `bun run check` — Check formatting with Prettier
- `bun run typecheck` — Type-check with `tsc --noEmit`

Before claiming work is done, run `bun run lint`, `bun run typecheck`, and `bun run check`.

## Conventions

- TypeScript `strict` + `verbatimModuleSyntax`: use `import type` for type-only imports
- Always use curly braces; `===` (`== null` is allowed for nullish checks)
- No `console.log` (`console.warn` / `console.error` are allowed)
- Function components; colocate `Component.css` next to `Component.tsx`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …). `commitlint` runs on `commit-msg`. Do not commit unless asked.

## Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- ESLint: https://eslint.org/docs/latest/
- Stylelint: https://stylelint.io/user-guide/rules/

## Tools

### ESLint

- Run `bun run lint` to lint JS/TS and CSS
- JS/TS config: `eslint.config.ts`
- CSS config: `.stylelintrc.json`

### Prettier

- Run `bun run format` to format your code
- Config: `.prettierrc`

### husky / lint-staged

- `.husky/pre-commit` runs `bunx lint-staged`
- Staged `*.{js,jsx,ts,tsx}` go through `eslint --fix` then `prettier --write`
- Staged `*.css` go through `stylelint --fix` then `prettier --write`
- `.husky/commit-msg` runs `bunx commitlint --edit` (Conventional Commits)

# AGENTS.md

## Project

`@hyunicode/create-web-template` — a Bun scaffolder that copies `template/` into a new Rsbuild + React 19 + TypeScript app. Package manager is **bun** (`>=1.3.0` in `package.json` `engines`). Do not use npm, yarn, or pnpm.

Shared agent config lives in `.agents/`. `.claude`, `.codex`, and `.cursor` are symlinks to that folder — edit `.agents/` only. The same layout is copied into generated apps from `template/.agents/`.

## Layout

- `src/` — `create-web-template` CLI (`index.ts` entry)
- `template/` — app scaffold copied into new projects
- `public/` in a generated app — static files copied as-is
- `template/rsbuild.config.ts` — bundler for generated apps
- `eslint.config.ts` / `.stylelintrc.json` / `.prettierrc` — lint and format (root covers the CLI and `template/`)

## Commands

- `bun run create -- [dir]` — Scaffold a new app (`bun src/index.ts`)
- `bun run dev` — Start the template app dev server
- `bun run build` — Build the template app for production
- `bun run preview` — Preview the template production build
- `bun run lint` — Lint with ESLint and Stylelint
- `bun run format` — Format with Prettier
- `bun run check` — Check formatting with Prettier
- `bun run typecheck` — Type-check the CLI and `template/`

Before claiming work is done, run `bun run lint`, `bun run typecheck`, and `bun run check`.

## Conventions

- TypeScript `strict` + `verbatimModuleSyntax`: use `import type` for type-only imports
- Always use curly braces; `===` (`== null` is allowed for nullish checks)
- No `console.log` in the template app (`console.warn` / `console.error` are allowed). The CLI may write to stdout.
- Function components; colocate `Component.css` next to `Component.tsx`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …). `commitlint` runs on `commit-msg`. Do not commit unless asked.
- Keep `template/` a runnable standalone app. The CLI rewrites `package.json` `name`, `rsbuild` title, `App.tsx` heading, and the README title.

## Docs

- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- ESLint: https://eslint.org/docs/latest/
- Stylelint: https://stylelint.io/user-guide/rules/
- Bun create: https://bun.sh/docs/runtime/templating/create

## Tools

### ESLint

- Run `bun run lint` to lint JS/TS and CSS
- JS/TS config: `eslint.config.ts` (CLI + `template/`)
- Generated apps use `template/eslint.config.ts`
- CSS config: `.stylelintrc.json`

### Prettier

- Run `bun run format` to format your code
- Config: `.prettierrc`

### husky / lint-staged

- `.husky/pre-commit` runs `bunx lint-staged`
- Staged `*.{js,jsx,ts,tsx}` go through `eslint --fix` then `prettier --write`
- Staged `*.css` go through `stylelint --fix` then `prettier --write`
- `.husky/commit-msg` runs `bunx commitlint --edit` (Conventional Commits)

# AGENTS.md

## Commands

- `bun run dev` - Start the dev server
- `bun run build` - Build the app for production
- `bun run preview` - Preview the production build locally
- `bun run lint` - Lint with ESLint and Stylelint
- `bun run format` - Format with Prettier
- `bun run check` - Check formatting with Prettier
- `bun run typecheck` - Type-check with `tsc --noEmit`

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

# @hyunicode/create-web-template

Create an Rsbuild + React 19 + TypeScript app with the lint, format, git hook, and CI setup from this repo.

```bash
bunx @hyunicode/create-web-template my-app
```

Until the package is on npm, run the CLI from this repo or GitHub:

```bash
bun src/index.ts my-app
bunx github:hyunicode/web-template my-app
```

## What you get

The generated app includes:

- Rsbuild + React 19 + TypeScript
- ESLint, Stylelint, Prettier
- husky + lint-staged + commitlint
- GitHub Actions CI
- Shared agent conventions in `.agents/`

The CLI asks for a package name and app title (or take `--name` / `--title` / `--yes`), copies `template/`, rewrites those fields, then runs `bun install` and `git init`.

```bash
bunx @hyunicode/create-web-template my-app --yes
bunx @hyunicode/create-web-template my-app --name @acme/web --title "Acme Web" --yes
bunx @hyunicode/create-web-template . --overwrite --no-git
```

## Iterate on the template

This repository is the scaffolder. The app that gets copied lives in `template/`.

```bash
bun install
bun install --cwd template
bun run dev          # template app
bun run create -- my-app --yes
```

Edit files under `template/`. Generated projects pick up the change the next time you run the CLI.

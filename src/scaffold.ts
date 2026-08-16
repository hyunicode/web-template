import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, readdir, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TEMPLATE_TITLE = 'Web Template';
const TEMPLATE_README_HEADING = 'Web template';

export interface ScaffoldOptions {
  dest: string;
  git: boolean;
  install: boolean;
  name: string;
  title: string;
}

export interface ScaffoldHooks {
  onStep: (message: string) => void;
  onWarn: (message: string) => void;
}

interface TemplatePackageJson {
  name: string;
  version: string;
}

export async function isEffectivelyEmpty(dir: string): Promise<boolean> {
  if (!existsSync(dir)) {
    return true;
  }

  const entries = await readdir(dir);
  return entries.every((name) => name === '.git' || name === '.DS_Store');
}

export async function scaffold(options: ScaffoldOptions, hooks: ScaffoldHooks): Promise<void> {
  const templateDir = path.join(import.meta.dirname, '..', 'template');
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  hooks.onStep(`Scaffolding to ${options.dest}`);
  if (existsSync(options.dest)) {
    await emptyDest(options.dest);
  }

  await cp(templateDir, options.dest, {
    dereference: false,
    filter: (source) => {
      const parts = source.split(path.sep);
      return !parts.includes('node_modules') && !parts.includes('dist');
    },
    recursive: true,
  });

  await normalizeGitignore(options.dest);
  await recreateRelativeSymlinks(options.dest);
  await rewritePackageJson(options.dest, options.name);
  await rewriteTitleFiles(options.dest, options.title);

  if (options.git) {
    hooks.onStep('Initializing git');
    const initCode = await run('git', ['init'], options.dest);
    if (initCode !== 0) {
      hooks.onWarn('git init failed; continuing without a repository');
    }
  }

  if (options.install) {
    hooks.onStep('Installing dependencies with bun');
    const installCode = await run('bun', ['install'], options.dest);
    if (installCode !== 0) {
      throw new Error('bun install failed');
    }
  }

  if (options.git && existsSync(path.join(options.dest, '.git'))) {
    hooks.onStep('Creating initial commit');
    const addCode = await run('git', ['add', '-A'], options.dest);
    if (addCode !== 0) {
      hooks.onWarn('git add failed; skip initial commit');
      return;
    }

    const commitCode = await run('git', ['commit', '-m', 'chore: initial commit'], options.dest);
    if (commitCode !== 0) {
      hooks.onWarn('git commit skipped (set user.name and user.email, then commit)');
    }
  }
}

async function emptyDest(dest: string): Promise<void> {
  const entries = await readdir(dest);
  await Promise.all(
    entries
      .filter((name) => name !== '.git')
      .map((name) => rm(path.join(dest, name), { force: true, recursive: true })),
  );
}

const RELATIVE_SYMLINKS: { from: string; to: string }[] = [
  { from: '.cursor', to: '.agents' },
  { from: '.claude', to: '.agents' },
  { from: '.codex', to: '.agents' },
  { from: 'CLAUDE.md', to: 'AGENTS.md' },
];

async function recreateRelativeSymlinks(dest: string): Promise<void> {
  for (const { from, to } of RELATIVE_SYMLINKS) {
    const linkPath = path.join(dest, from);
    await rm(linkPath, { force: true });
    await symlink(to, linkPath);
  }
}

async function normalizeGitignore(dest: string): Promise<void> {
  const hidden = path.join(dest, '.gitignore');
  const fallback = path.join(dest, '_gitignore');

  if (existsSync(fallback)) {
    if (!existsSync(hidden)) {
      await rename(fallback, hidden);
      return;
    }

    await rm(fallback);
  }
}

async function rewritePackageJson(dest: string, name: string): Promise<void> {
  const pkgPath = path.join(dest, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as TemplatePackageJson;
  pkg.name = name;
  pkg.version = '0.0.0';
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

async function rewriteTitleFiles(dest: string, title: string): Promise<void> {
  const replacements: { file: string; from: string; to: string }[] = [
    {
      file: 'rsbuild.config.ts',
      from: TEMPLATE_TITLE,
      to: title,
    },
    {
      file: path.join('src', 'App.tsx'),
      from: TEMPLATE_TITLE,
      to: title,
    },
    {
      file: 'README.md',
      from: TEMPLATE_README_HEADING,
      to: title,
    },
  ];

  for (const { file, from, to } of replacements) {
    const filePath = path.join(dest, file);
    if (!existsSync(filePath)) {
      continue;
    }

    const current = await readFile(filePath, 'utf8');
    await writeFile(filePath, current.replaceAll(from, to));
  }
}

function run(command: string, args: string[], cwd: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
}

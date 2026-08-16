#!/usr/bin/env bun

import * as p from '@clack/prompts';
import path from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import pc from 'picocolors';

import { isPackageName, packageNameFromPath, titleFromName } from './project-name';
import { isEffectivelyEmpty, scaffold } from './scaffold';

const HELP = `
${pc.bold('@hyunicode/create-web-template')} — Rsbuild + React + TypeScript

${pc.dim('Usage')}
  bunx @hyunicode/create-web-template [dir]
  bun create @hyunicode/web-template [dir]
  bun src/index.ts [dir]

${pc.dim('Options')}
  --name <name>     package.json name (default: directory name)
  --title <title>   HTML and app title (default: title-cased name)
  -y, --yes         skip prompts
  --overwrite       allow a non-empty directory
  --no-install      skip bun install
  --no-git          skip git init
  -h, --help        show this message
`;

async function main(): Promise<void> {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { default: false, short: 'h', type: 'boolean' },
      name: { type: 'string' },
      'no-git': { default: false, type: 'boolean' },
      'no-install': { default: false, type: 'boolean' },
      overwrite: { default: false, type: 'boolean' },
      title: { type: 'string' },
      yes: { default: false, short: 'y', type: 'boolean' },
    },
  });

  if (values.help) {
    process.stdout.write(`${HELP.trim()}\n`);
    return;
  }

  const interactive = !values.yes && process.stdin.isTTY;
  p.intro(pc.bgCyan(pc.black(' @hyunicode/create-web-template ')));

  let destInput = positionals[0];
  if (destInput == null) {
    if (!interactive) {
      destInput = 'web-app';
    } else {
      const prompted = await p.text({
        defaultValue: 'web-app',
        message: 'Project directory',
        placeholder: 'web-app',
        validate: (value) => {
          if (value.trim() === '') {
            return 'Directory is required';
          }
        },
      });
      if (p.isCancel(prompted)) {
        cancel();
      }
      destInput = prompted;
    }
  }

  const dest = path.resolve(destInput);
  const defaultName = packageNameFromPath(destInput);
  let name = values.name ?? defaultName;
  let title = values.title ?? titleFromName(name);
  let overwrite = values.overwrite;

  if (interactive) {
    const nameResult = await p.text({
      defaultValue: name,
      initialValue: name,
      message: 'Package name',
      validate: (value) => {
        if (!isPackageName(value.trim())) {
          return 'Use a lowercase npm package name (kebab-case, optional @scope/)';
        }
      },
    });
    if (p.isCancel(nameResult)) {
      cancel();
    }
    name = nameResult.trim();

    const titleResult = await p.text({
      defaultValue: titleFromName(name),
      initialValue: values.title ?? titleFromName(name),
      message: 'App title',
      validate: (value) => {
        if (value.trim() === '') {
          return 'Title is required';
        }
      },
    });
    if (p.isCancel(titleResult)) {
      cancel();
    }
    title = titleResult.trim();
  }

  if (!isPackageName(name)) {
    fail(`Invalid package name: ${name}`);
  }

  if (!(await isEffectivelyEmpty(dest))) {
    if (!overwrite && interactive) {
      const confirmed = await p.confirm({
        message: `${path.relative(process.cwd(), dest) || '.'} is not empty. Continue?`,
      });
      if (p.isCancel(confirmed) || !confirmed) {
        cancel();
      }
      overwrite = true;
    }

    if (!overwrite) {
      fail(`Destination is not empty: ${dest}\nUse --overwrite to continue.`);
    }
  }

  try {
    await scaffold(
      {
        dest,
        git: !values['no-git'],
        install: !values['no-install'],
        name,
        title,
      },
      {
        onStep: (message) => {
          p.log.step(message);
        },
        onWarn: (message) => {
          p.log.warn(message);
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(message);
  }

  const rel = path.relative(process.cwd(), dest);
  const cd = rel === '' ? undefined : rel.startsWith('..') ? dest : rel;
  p.note(
    [cd == null ? undefined : `cd ${cd}`, 'bun run dev'].filter((line) => line != null).join('\n'),
    'Next steps',
  );
  p.outro(pc.green('Done'));
}

function cancel(): never {
  p.cancel('Cancelled');
  process.exit(0);
}

function fail(message: string): never {
  p.log.error(message);
  p.outro(pc.red('Failed'));
  process.exit(1);
}

await main();

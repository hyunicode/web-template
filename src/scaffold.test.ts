import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readlink, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { isTemplateCopySource, scaffold } from './scaffold';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { force: true, recursive: true })));
});

async function makeTempDir(prefix: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

describe('isTemplateCopySource', () => {
  test('keeps the template root even when it lives under node_modules', () => {
    const templateDir = path.join(
      '/cache',
      'node_modules',
      '@hyunicode',
      'create-web-template',
      'template',
    );

    expect(isTemplateCopySource(templateDir, templateDir)).toBe(true);
    expect(isTemplateCopySource(path.join(templateDir, 'package.json'), templateDir)).toBe(true);
    expect(
      isTemplateCopySource(path.join(templateDir, '.agents', 'settings.json'), templateDir),
    ).toBe(true);
  });

  test('skips only node_modules and dist inside the template', () => {
    const templateDir = path.join(
      '/cache',
      'node_modules',
      '@hyunicode',
      'create-web-template',
      'template',
    );

    expect(isTemplateCopySource(path.join(templateDir, 'node_modules', 'react'), templateDir)).toBe(
      false,
    );
    expect(isTemplateCopySource(path.join(templateDir, 'dist', 'index.js'), templateDir)).toBe(
      false,
    );
  });
});

describe('scaffold', () => {
  test('copies a template installed under node_modules and recreates agent symlinks', async () => {
    const root = await makeTempDir('create-web-template-');
    const templateDir = path.join(
      root,
      'node_modules',
      '@hyunicode',
      'create-web-template',
      'template',
    );
    const dest = path.join(root, 'sake');

    await mkdir(path.join(templateDir, '.agents'), { recursive: true });
    await mkdir(path.join(templateDir, 'node_modules', 'left-behind'), { recursive: true });
    await mkdir(path.join(templateDir, 'dist'), { recursive: true });
    await writeFile(
      path.join(templateDir, 'package.json'),
      `${JSON.stringify({ name: 'web-template', version: '1.0.0' }, null, 2)}\n`,
    );
    await writeFile(path.join(templateDir, '.agents', 'settings.json'), '{}\n');
    await writeFile(
      path.join(templateDir, 'node_modules', 'left-behind', 'index.js'),
      'export {};\n',
    );
    await writeFile(path.join(templateDir, 'dist', 'index.js'), 'export {};\n');

    await scaffold(
      {
        dest,
        git: false,
        install: false,
        name: 'sake',
        templateDir,
        title: 'Sake',
      },
      {
        onStep: () => undefined,
        onWarn: () => undefined,
      },
    );

    const pkg = JSON.parse(await readFile(path.join(dest, 'package.json'), 'utf8')) as {
      name: string;
    };
    expect(pkg.name).toBe('sake');
    expect(existsSync(path.join(dest, '.agents', 'settings.json'))).toBe(true);
    expect(existsSync(path.join(dest, 'node_modules', 'left-behind', 'index.js'))).toBe(false);
    expect(existsSync(path.join(dest, 'dist', 'index.js'))).toBe(false);
    expect(await readlink(path.join(dest, '.cursor'))).toBe('.agents');
    expect(await readlink(path.join(dest, '.claude'))).toBe('.agents');
    expect(await readlink(path.join(dest, '.codex'))).toBe('.agents');
    expect(await readlink(path.join(dest, 'CLAUDE.md'))).toBe('AGENTS.md');
  });
});

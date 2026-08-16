const PACKAGE_NAME_RE = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

export function isPackageName(value: string): boolean {
  return PACKAGE_NAME_RE.test(value);
}

export function packageNameFromPath(dest: string): string {
  const base = dest.replace(/\/+$/, '').split('/').pop() ?? dest;
  return base === '.' || base === '' ? 'web-app' : base;
}

export function titleFromName(name: string): string {
  const unscoped = name.includes('/') ? (name.split('/').pop() ?? name) : name;
  return unscoped
    .split(/[-_]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

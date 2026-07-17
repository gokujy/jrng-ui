import { access, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const demosRoot = resolve(workspace, 'projects/docs/src/app/demos');
const publicRegistry = JSON.parse(
  await readFile(resolve(workspace, 'projects/jrng-ui/registry/registry.json'), 'utf8'),
);
const selectors = new Set(publicRegistry.components.map((component) => component.selector));
const directories = (await readdir(demosRoot, { withFileTypes: true })).filter((entry) =>
  entry.isDirectory(),
);
const failures = [];

for (const entry of directories) {
  const base = resolve(demosRoot, entry.name, `${entry.name}.component`);
  for (const extension of ['ts', 'html', 'scss']) {
    const file = `${base}.${extension}`;
    try {
      await access(file);
      const content = await readFile(file, 'utf8');
      if (!content.trim()) failures.push(`${file} is empty.`);
      if (/\bp-(?:button|avatar|card|progress|dialog)\b/.test(content)) {
        failures.push(`${file} references an unsupported old selector.`);
      }
      if (extension === 'html') {
        for (const match of content.matchAll(/<(j-[a-z0-9-]+)/g)) {
          if (!selectors.has(match[1])) failures.push(`${file} references unknown ${match[1]}.`);
        }
      }
    } catch {
      failures.push(`${file} does not exist.`);
    }
  }
}

if (!directories.length) failures.push('No file-backed documentation demos were found.');
if (failures.length) {
  console.error(`Documentation example verification failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${directories.length} file-backed demos and their public selectors.`);
}

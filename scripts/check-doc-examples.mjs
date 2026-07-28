import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(root, 'docs/component-inventory.json')));
const preview = await readTypeScriptTree('projects/docs/src/app/docs');
const failures = [];

for (const component of inventory.components) {
  if (!preview.includes(`<${component.selector}`)) {
    failures.push(`${component.selector}: compiled preview tag missing.`);
  }
  if (!component.basicExample || component.codeExampleStatus !== 'complete') {
    failures.push(`${component.selector}: basic code example missing.`);
  }
  if (!component.publicImportPath.startsWith('jrng-ui/')) {
    failures.push(`${component.selector}: invalid modular import path.`);
  }
}

console.log(`Compiled component examples checked: ${inventory.components.length}`);
console.log(`Invalid examples: ${failures.length}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}

async function readTypeScriptTree(path) {
  const entries = await readdir(resolve(root, path), { withFileTypes: true });
  const sources = await Promise.all(
    entries.map((entry) => {
      const entryPath = `${path}/${entry.name}`;
      if (entry.isDirectory()) return readTypeScriptTree(entryPath);
      return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')
        ? readFile(resolve(root, entryPath), 'utf8')
        : '';
    }),
  );
  return sources.join('\n');
}

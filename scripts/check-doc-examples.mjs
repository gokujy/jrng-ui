import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(root, 'docs/component-inventory.json')));
const preview = await readFile(
  resolve(root, 'projects/docs/src/app/docs/component-detail-view.component.ts'),
  'utf8',
);
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

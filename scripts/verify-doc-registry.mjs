import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(
  await readFile(resolve(workspace, 'docs/component-inventory.json'), 'utf8'),
);
const registry = await readFile(
  resolve(workspace, 'projects/docs/src/app/docs/generated-component-registry.ts'),
  'utf8',
);
const selectors = [...registry.matchAll(/selector: '([^']+)'/g)].map((match) => match[1]);
const expected = inventory.components.map((component) => component.selector);
const missing = expected.filter((selector) => !selectors.includes(selector));
if (selectors.length !== inventory.summary.publicComponents || missing.length) {
  throw new Error(
    `Documentation registry mismatch: ${selectors.length} records; missing ${missing.join(', ') || 'none'}.`,
  );
}
console.log(`Verified documentation registry coverage for ${selectors.length} public components.`);

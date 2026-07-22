import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(root, 'docs/component-inventory.json')));
const routes = await readFile(resolve(root, 'projects/docs/src/app/app.routes.ts'), 'utf8');
const failures = [];
const slugs = new Set();

if (!routes.includes("path: 'docs/components'")) failures.push('Missing /docs/components route.');
if (!routes.includes("path: 'docs/index'")) failures.push('Missing /docs/index route.');
for (const component of inventory.components) {
  const slug = component.selector.slice(2);
  if (slugs.has(slug)) failures.push(`Duplicate component slug: ${slug}`);
  if (component.documentationRoute !== `/docs/components#${slug}`) {
    failures.push(`Invalid documentation route for ${component.selector}.`);
  }
  slugs.add(slug);
}

console.log(`Documentation routes: ${inventory.components.length}`);
console.log(`Duplicate slugs: ${inventory.components.length - slugs.size}`);
console.log(`Broken routes: ${failures.length}`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}

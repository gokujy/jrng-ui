import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await read('docs/component-inventory.json'));
const previewSource = await read('projects/docs/src/app/docs/component-detail-view.component.ts');
const registrySource = await read('projects/docs/src/app/docs/generated-component-registry.ts');
const failures = [];
const selectors = new Set();
const slugs = new Set();

for (const component of inventory.components) {
  check(!selectors.has(component.selector), `Duplicate selector: ${component.selector}`);
  check(!slugs.has(component.selector.slice(2)), `Duplicate slug: ${component.selector.slice(2)}`);
  selectors.add(component.selector);
  slugs.add(component.selector.slice(2));
  check(component.selector.startsWith('j-'), `Invalid selector: ${component.selector}`);
  check(Boolean(component.category), `Missing category: ${component.selector}`);
  check(Boolean(component.publicImportPath), `Missing import path: ${component.selector}`);
  check(
    component.documentationStatus === 'complete',
    `Missing documentation: ${component.selector}`,
  );
  check(component.previewStatus === 'rendered', `Missing rendered preview: ${component.selector}`);
  check(component.codeExampleStatus === 'complete', `Missing code example: ${component.selector}`);
  check(
    component.apiReferenceStatus === 'complete',
    `Missing API reference: ${component.selector}`,
  );
  check(component.testStatus === 'direct', `Missing direct test: ${component.selector}`);
  check(
    previewSource.includes(`<${component.selector}`),
    `Preview selector cannot be resolved: ${component.selector}`,
  );
  check(
    registrySource.includes(`selector: '${component.selector}'`),
    `Missing generated docs record: ${component.selector}`,
  );
}

const forbidden = [
  /Coming soon/i,
  /Documentation planned/i,
  /Example pending/i,
  /Generic Angular component/i,
  /Reusable application interface/i,
  /Add description/i,
  /Lorem ipsum/i,
  /Real-world example/i,
  /When to Use/i,
  /When not to use/i,
  /typed standalone component/i,
  /no backing fields are required/i,
  /Static example/i,
];
for (const pattern of forbidden) {
  check(!pattern.test(previewSource), `Forbidden rendered documentation phrase: ${pattern.source}`);
  check(
    !pattern.test(registrySource),
    `Forbidden generated documentation phrase: ${pattern.source}`,
  );
}

const summary = inventory.summary;
console.log('Documentation completeness');
console.log('--------------------------');
console.log(`Public components: ${summary.publicComponents}`);
console.log(`Documentation records: ${summary.componentsWithDocumentation}`);
console.log(`Working previews: ${summary.componentsWithWorkingPreview}`);
console.log(`Code examples: ${summary.componentsWithExamples}`);
console.log(`API references: ${summary.componentsWithApiReference}`);
console.log(`Direct tests: ${summary.componentsWithDirectTests}`);
console.log(`Missing components: ${summary.componentsRemainingIncomplete}`);
console.log(`Duplicate slugs: ${inventory.components.length - slugs.size}`);
console.log(
  `Broken preview registrations: ${failures.filter((item) => item.includes('preview')).length}`,
);

if (summary.componentsRemainingIncomplete !== 0) {
  failures.push(`${summary.componentsRemainingIncomplete} inventory records are incomplete.`);
}
if (failures.length) {
  console.error(`\n${failures.join('\n')}`);
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) failures.push(message);
}
function read(path) {
  return readFile(resolve(root, path), 'utf8');
}

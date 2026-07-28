import { access, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const implemented = [
  'j-query-builder',
  'j-cron-expression',
  'j-barcode',
  'j-calendar-scheduler',
  'j-gantt',
  'j-kanban',
  'j-chart',
  'j-sparkline',
  'j-file-browser',
  'j-file-preview',
  'j-editor',
  'j-gallery',
  'j-grid-layout',
  'j-tour-guide',
];
const absent = [
  'j-pivot-table',
  'j-diagram',
  'j-map',
  'j-chat',
  'j-dock-manager',
  'j-spreadsheet',
  'j-image-editor',
  'j-ribbon',
  'j-code-editor',
  'j-block-editor',
  'j-document-editor',
];

const inventory = JSON.parse(await read('docs/component-inventory.json'));
const registry = await read('projects/docs/src/app/docs/generated-component-registry.ts');
const categories = await read('projects/docs/src/app/docs/generated-component-categories.ts');
const docsData = await read('projects/docs/src/app/docs/component-docs.data.ts');
const detailView = await read('projects/docs/src/app/docs/component-detail-view.component.ts');
const previewSource = await readTypeScriptTree(
  'projects/docs/src/app/docs/component-detail-previews',
);
const coverage = await read('projects/docs/src/app/docs/generated-api-example-coverage.ts');
const failures = [];

for (const selector of implemented) {
  const component = inventory.components.find((item) => item.selector === selector);
  check(component, `${selector}: source inventory record is missing`);
  if (!component) continue;

  const entrypoint = component.publicImportPath.replace('jrng-ui/', '');
  const entrypointRoot = `projects/jrng-ui/${entrypoint}`;
  check(
    await exists(`${entrypointRoot}/public-api.ts`),
    `${selector}: public entry point is missing`,
  );
  check(
    await directoryContains(entrypointRoot, component.className),
    `${selector}: component implementation class is missing`,
  );
  check(component.documentationStatus === 'complete', `${selector}: docs record is incomplete`);
  check(
    component.documentationRoute === `/docs/components#${selector.slice(2)}`,
    `${selector}: route is missing or invalid`,
  );
  check(categories.includes(`'${selector}'`), `${selector}: navigation/search metadata is missing`);
  check(registry.includes(`selector: '${selector}'`), `${selector}: registry metadata is missing`);
  check(
    docsData.includes('generatedComponentRegistry'),
    `${selector}: registry is not wired to docs`,
  );
  const hasLivePreview =
    previewSource.includes(`<${selector}`) ||
    (selector === 'j-tour-guide' &&
      previewSource.includes("@case ('tour-guide')") &&
      previewSource.includes('startPreviewTour()'));
  check(hasLivePreview, `${selector}: basic live preview is missing`);
  check(
    coverage.includes(`selector: '${selector}'`),
    `${selector}: API/example coverage is missing`,
  );
  check(component.basicExample, `${selector}: Basic example is missing`);
  check(component.apiReferenceStatus === 'complete', `${selector}: API section is incomplete`);
  check(
    component.accessibilityStatus === 'validated' && component.hasAccessibilityDocumentation,
    `${selector}: accessibility documentation is incomplete`,
  );
  check(component.themeTokenSupport !== 'none', `${selector}: theming metadata is missing`);
  check(component.testStatus === 'direct', `${selector}: testing metadata is missing`);
}

for (const selector of absent) {
  check(
    !inventory.components.some((component) => component.selector === selector),
    `${selector}: documentation exists without an implemented public component`,
  );
  check(!registry.includes(`selector: '${selector}'`), `${selector}: fake registry record exists`);
  check(!categories.includes(`'${selector}'`), `${selector}: fake navigation/search entry exists`);
}

for (const heading of [
  'Keyboard support',
  'Testing notes',
  'Accessibility',
  'CSS variables',
  'FAQ',
  'Changelog',
]) {
  check(detailView.includes(heading), `Shared component page is missing the ${heading} section`);
}

console.log(`Implemented advanced components: ${implemented.length}`);
console.log(`Visible advanced components: ${implemented.length - failures.length}`);
console.log(`Unimplemented components kept out of docs: ${absent.length}`);
console.log(`Advanced visibility failures: ${failures.length}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  return readFile(resolve(root, path), 'utf8');
}

async function exists(path) {
  try {
    await access(resolve(root, path));
    return true;
  } catch {
    return false;
  }
}

async function directoryContains(path, text) {
  const directory = resolve(root, path);
  const entries = await readdir(directory, { withFileTypes: true });
  const sources = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
      .map((entry) => readFile(resolve(directory, entry.name), 'utf8')),
  );
  return sources.some((source) => source.includes(`class ${text}`));
}

async function readTypeScriptTree(path) {
  const directory = resolve(root, path);
  const entries = await readdir(directory, { withFileTypes: true });
  const sources = await Promise.all(
    entries.map((entry) => {
      const entryPath = `${path}/${entry.name}`;
      if (entry.isDirectory()) return readTypeScriptTree(entryPath);
      return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')
        ? read(entryPath)
        : '';
    }),
  );
  return sources.join('\n');
}

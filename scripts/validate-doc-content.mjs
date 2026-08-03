import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { REMOVED_COMPONENT_SELECTORS } from './component-categories.mjs';

const root = resolve(import.meta.dirname, '..');
const runtimeSource = await readTypeScriptTree('projects/docs/src/app');
const detailView = await read('projects/docs/src/app/docs/component-detail-view.component.ts');
const baseSource = await read('projects/docs/src/app/docs/component-detail-view-base.ts');
const coverageSource = await read('projects/docs/src/app/docs/generated-api-example-coverage.ts');
const tableFilters = await read(
  'projects/docs/src/app/demos/table-scenarios/table-filter-examples.component.ts',
);
const failures = [];

for (const selector of REMOVED_COMPONENT_SELECTORS) {
  const selectorPattern = new RegExp(`${escapeRegExp(selector)}(?![-\\w])`);
  check(
    !selectorPattern.test(runtimeSource),
    `Removed component selector is referenced by runtime docs: ${selector}`,
  );
}

check(
  detailView.includes('@for (tab of codeTabsFor(example); track tab.value)'),
  'Example cards are missing source tabs.',
);
check(
  detailView.includes('<j-copy-button') &&
    detailView.includes('[text]="activeFeatureCode(example)"'),
  'Example cards are missing functional copy-code metadata.',
);
check(
  detailView.includes('<app-component-preview') &&
    detailView.includes('[previewExample]="example"'),
  'Example cards are not wired to the matching preview state.',
);

validateFeatureArrayKeys(baseSource, 'component-detail-view-base.ts');
validateGeneratedCoverageKeys(coverageSource);

for (const [title, description] of [
  [
    'Inline Column Filters',
    'Display filter controls directly below each column header for quick data filtering.',
  ],
  [
    'Filters Above Table',
    'Use a dedicated filter toolbar above the table for advanced and responsive filtering.',
  ],
  [
    'Expandable Filter Panel',
    'Open an advanced filter panel above the table only when filtering controls are needed.',
  ],
]) {
  check(tableFilters.includes(`name: '${title}'`), `Missing Table filtering example: ${title}`);
  check(
    tableFilters.includes(`'${description}'`) || tableFilters.includes(`details: '${description}'`),
    `Incorrect Table filtering description: ${title}`,
  );
}

for (const requiredImport of [
  "from 'jrng-ui/avatar'",
  "from 'jrng-ui/badge'",
  "from 'jrng-ui/button'",
  "from 'jrng-ui/chip'",
  "from 'jrng-ui/date-picker'",
  "from 'jrng-ui/input'",
  "from 'jrng-ui/input-number'",
  "from 'jrng-ui/select'",
  "from 'jrng-ui/table'",
  "from 'jrng-ui/tooltip'",
]) {
  check(tableFilters.includes(requiredImport), `Table filtering examples miss ${requiredImport}`);
}

check(
  tableFilters.includes('this.rows = createCustomerRows') ||
    tableFilters.includes('readonly rows = createCustomerRows()'),
  'Table filtering examples do not create per-instance customer data.',
);
check(
  tableFilters.includes('readonly panelOpen = signal(false)'),
  'Expandable filter panel does not start closed.',
);
check(
  tableFilters.includes('(prefers-reduced-motion: reduce)'),
  'Expandable filter animation has no reduced-motion override.',
);
check(
  tableFilters.includes('[ariaExpanded]="panelOpen()"') &&
    tableFilters.includes('ariaControls="customer-advanced-filter-panel"'),
  'Expandable filter trigger is missing ARIA state or relationship metadata.',
);

console.log(`Removed selectors checked: ${REMOVED_COMPONENT_SELECTORS.size}`);
console.log('Required independent Table filter examples checked: 3');
console.log(`Documentation content failures: ${failures.length}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}

function validateFeatureArrayKeys(source, label) {
  const file = ts.createSourceFile(label, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const name = declaration.name.getText(file);
      if (!name.endsWith('FEATURE_EXAMPLES')) continue;
      const array = unwrapArray(declaration.initializer);
      if (!array) continue;
      const keys = new Set();
      for (const element of array.elements) {
        if (!ts.isObjectLiteralExpression(element)) continue;
        const key = stringProperty(element, 'key');
        if (!key) continue;
        check(!keys.has(key), `${label}: duplicate example key ${name}.${key}`);
        keys.add(key);
      }
    }
  }
}

function validateGeneratedCoverageKeys(source) {
  const selectorPattern = /selector:\s*'([^']+)'[\s\S]*?examples:\s*\[([\s\S]*?)\n\s*\],\n\s*},/g;
  for (const match of source.matchAll(selectorPattern)) {
    const selector = match[1];
    const keys = new Set();
    for (const keyMatch of match[2].matchAll(/key:\s*'([^']+)'/g)) {
      const key = keyMatch[1];
      check(!keys.has(key), `${selector}: duplicate generated example key ${key}`);
      keys.add(key);
    }
  }
}

function unwrapArray(expression) {
  let current = expression;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current && ts.isArrayLiteralExpression(current) ? current : null;
}

function stringProperty(object, propertyName) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || property.name.getText() !== propertyName) continue;
    return ts.isStringLiteralLike(property.initializer) ? property.initializer.text : '';
  }
  return '';
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function read(path) {
  return readFile(resolve(root, path), 'utf8');
}

async function readTypeScriptTree(path) {
  const entries = await readdir(resolve(root, path), { withFileTypes: true });
  const sources = await Promise.all(
    entries.map((entry) => {
      const entryPath = `${path}/${entry.name}`;
      if (entry.isDirectory()) return readTypeScriptTree(entryPath);
      return entry.isFile() &&
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.spec.ts') &&
        !entry.name.endsWith('.generated.ts')
        ? read(entryPath)
        : '';
    }),
  );
  return sources.join('\n');
}

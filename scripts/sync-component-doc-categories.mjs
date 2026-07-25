import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  COMPONENT_CATEGORY_BY_SELECTOR,
  REMOVED_COMPONENT_SELECTORS,
} from './component-categories.mjs';

const workspaceRoot = process.cwd();
const documentationPath = path.join(
  workspaceRoot,
  'projects',
  'docs',
  'src',
  'app',
  'docs',
  'component-docs.data.ts',
);
const write = process.argv.includes('--write');
const source = fs.readFileSync(documentationPath, 'utf8');
const recordPattern =
  /(\{\s*slug:\s*'[^']+'[\s\S]*?name:\s*'[^']+'[\s\S]*?category:\s*')([^']+)('[\s\S]*?icon:\s*'[^']*'[\s\S]*?selector:\s*'([^']+)')/g;
const failures = [];
let matched = 0;

const updated = source.replace(recordPattern, (record, prefix, category, suffix, selector) => {
  matched += 1;
  if (REMOVED_COMPONENT_SELECTORS.has(selector)) {
    failures.push(`${selector} is removed but still has a documentation record.`);
    return record;
  }
  const expectedCategory = COMPONENT_CATEGORY_BY_SELECTOR.get(selector);
  if (!expectedCategory) {
    if (selector.startsWith('j-')) {
      failures.push(`${selector} has no category definition.`);
    }
    return record;
  }
  if (category !== expectedCategory && !write) {
    failures.push(`${selector} uses ${category}; expected ${expectedCategory}.`);
  }
  return `${prefix}${expectedCategory}${suffix}`;
});

if (!matched) {
  failures.push('No component documentation records were found.');
}
if (failures.length) {
  throw new Error(
    `Component documentation category validation failed:\n- ${failures.join('\n- ')}`,
  );
}
if (write && updated !== source) {
  fs.writeFileSync(documentationPath, updated, 'utf8');
  console.log('Synchronized component documentation categories.');
} else {
  console.log('Component documentation categories are synchronized.');
}

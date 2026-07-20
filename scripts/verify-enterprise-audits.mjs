import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const requiredAudits = [
  'public-api-inventory.json',
  'public-api-audit.md',
  'api-consistency-audit.md',
  'breaking-cleanup-audit.md',
  'accessibility-audit.md',
  'angular-compatibility-audit.md',
  'performance-audit.md',
  'bundle-size-report.md',
  'security-audit.md',
  'theme-token-audit.md',
  'responsive-browser-audit.md',
  'documentation-coverage.md',
  'test-coverage-audit.md',
  'internal-architecture-audit.md',
  'optional-dependency-audit.md',
  'package-content-audit.md',
  'visual-regression-audit.md',
  'error-handling-diagnostics-audit.md',
  'enterprise-release-readiness.md',
];

for (const name of requiredAudits) {
  requireFile(path.join('docs', 'audits', name), `Missing audit output: docs/audits/${name}`);
}

const publicAudit = readJson('docs/audits/public-api-inventory.json');
if (publicAudit.schemaVersion !== 1) failures.push('Unsupported public inventory schema version.');
if (publicAudit.totals.entrypoints < 100)
  failures.push('Public inventory contains implausibly few secondary entrypoints.');
if (publicAudit.totals.component < 119)
  failures.push('Public inventory omits canonical public components.');
if (publicAudit.findings.selectorPrefixViolations.length) {
  failures.push(
    `Selectors without the JRNG prefix: ${names(publicAudit.findings.selectorPrefixViolations)}`,
  );
}
if (publicAudit.findings.missingDocumentation.length) {
  failures.push(
    `Undocumented public artifacts: ${names(publicAudit.findings.missingDocumentation)}`,
  );
}
if (
  publicAudit.entrypoints.some((entrypoint) =>
    /admin-starter|src\/lib/i.test(entrypoint.importPath),
  )
) {
  failures.push('Inventory contains an excluded application or duplicate source-tree entrypoint.');
}

const visual = readJson('docs/visual-regression/critical-cases.json');
const requiredComponents = [
  'button',
  'input',
  'textarea',
  'select',
  'multiselect',
  'autocomplete',
  'date-picker',
  'checkbox',
  'radio',
  'switch',
  'form-field',
  'validation-message',
  'card',
  'badge',
  'tag',
  'avatar',
  'avatar-group',
  'table',
  'data-grid',
  'filter-bar',
  'paginator',
  'dialog',
  'drawer',
  'popover',
  'tooltip',
  'toast',
  'file-upload',
  'page-header',
  'tabs',
  'menu',
  'editor',
  'diff-viewer',
  'timeline',
  'stepper',
  'empty',
];
const requiredStates = [
  'default',
  'disabled',
  'readonly',
  'invalid',
  'loading',
  'empty',
  'error',
  'long-content',
  'rtl',
];
const requiredViewports = [320, 375, 480, 768, 1024, 1280, 1440, 1920];
const visualByName = new Map(
  visual.components.map((component) => [component.component, component]),
);
for (const component of requiredComponents) {
  const record = visualByName.get(component);
  if (!record) {
    failures.push(`Visual manifest is missing ${component}.`);
    continue;
  }
  for (const state of requiredStates)
    if (!record.states.includes(state))
      failures.push(`${component} visual coverage is missing ${state}.`);
  for (const viewport of requiredViewports)
    if (!record.viewports.includes(viewport))
      failures.push(`${component} visual coverage is missing ${viewport}px.`);
}
for (const theme of ['light', 'dark', 'high-contrast']) {
  if (!visual.themes.includes(theme))
    failures.push(`Visual manifest is missing the ${theme} theme.`);
}
if (
  !visual.deterministic ||
  visual.network !== 'blocked' ||
  visual.animations !== 'disabled' ||
  visual.remoteAssets
) {
  failures.push('Visual manifest is not deterministic and network-isolated.');
}

const packageJson = readJson('dist/jrng-ui/package.json');
if (packageJson.sideEffects !== false)
  failures.push('Published package must declare sideEffects: false.');
for (const dependency of ['chart.js']) {
  if (packageJson.dependencies?.[dependency])
    failures.push(`${dependency} leaked into mandatory dependencies.`);
  if (
    !packageJson.peerDependencies?.[dependency] ||
    !packageJson.peerDependenciesMeta?.[dependency]?.optional
  ) {
    failures.push(`${dependency} must remain an optional peer dependency.`);
  }
}

const sourceFiles = walk(path.join(root, 'projects', 'jrng-ui')).filter(
  (file) =>
    !file.includes(`${path.sep}src${path.sep}lib${path.sep}`) &&
    file.endsWith('.ts') &&
    !file.endsWith('.spec.ts'),
);
const entrypointGraph = new Map();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const entrypoint = relative(file).split('/')[2];
  const dependencies = entrypointGraph.get(entrypoint) ?? new Set();
  for (const match of text.matchAll(/from\s+['"]jrng-ui\/([^/'"]+)/g)) {
    if (match[1] !== entrypoint) dependencies.add(match[1]);
  }
  entrypointGraph.set(entrypoint, dependencies);
  if (/from\s+['"]jrng-ui['"]/.test(text)) {
    failures.push(`Canonical source imports the root barrel: ${relative(file)}`);
  }
  if (/admin-starter|firebase|google drive|amazon s3|api[_-]?key|client[_-]?secret/i.test(text)) {
    failures.push(
      `Potential application/private dependency in canonical source: ${relative(file)}`,
    );
  }
}
for (const cycle of findCycles(entrypointGraph)) {
  failures.push(`Circular secondary-entrypoint dependency: ${cycle.join(' -> ')}`);
}

if (failures.length) {
  console.error('Enterprise audit verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Enterprise audit verification passed: ${publicAudit.totals.entrypoints} entrypoints, ${publicAudit.totals.artifacts} artifacts, ${visual.components.length} visual fixtures.`,
);

function requireFile(relativePath, message) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).size === 0) failures.push(message);
}
function readJson(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`Missing JSON file: ${relativePath}`);
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch (error) {
    failures.push(
      `Invalid JSON in ${relativePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {};
  }
}
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}
function names(values) {
  return values.map((value) => `${value.entrypoint}:${value.name}`).join(', ');
}
function findCycles(graph) {
  const cycles = [];
  const complete = new Set();
  const visit = (node, path, active) => {
    if (active.has(node)) {
      const start = path.indexOf(node);
      cycles.push([...path.slice(start), node]);
      return;
    }
    if (complete.has(node)) return;
    active.add(node);
    path.push(node);
    for (const dependency of graph.get(node) ?? []) visit(dependency, path, active);
    path.pop();
    active.delete(node);
    complete.add(node);
  };
  for (const node of graph.keys()) visit(node, [], new Set());
  return cycles;
}

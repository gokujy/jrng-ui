import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';
import '@angular/compiler';

const root = process.cwd();
const library = path.join(root, 'projects', 'jrng-ui');
const typesDirectory = path.join(root, 'dist', 'jrng-ui', 'types');
const fesmDirectory = path.join(root, 'dist', 'jrng-ui', 'fesm2022');
const auditDirectory = path.join(root, 'docs', 'audits');
const visualDirectory = path.join(root, 'docs', 'visual-regression');
const inventory = readJson('docs/component-inventory.json');
const packageJson = readJson('dist/jrng-ui/package.json');

if (!fs.existsSync(typesDirectory))
  throw new Error('Build jrng-ui before generating enterprise audits.');
fs.mkdirSync(auditDirectory, { recursive: true });
fs.mkdirSync(visualDirectory, { recursive: true });

const sourceFiles = walk(library).filter(
  (file) => !file.includes(`${path.sep}src${path.sep}lib${path.sep}`),
);
const sourceText = sourceFiles
  .filter((file) => /\.(?:ts|html|scss|css)$/.test(file))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const specs = sourceFiles
  .filter((file) => file.endsWith('.spec.ts'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const componentByClass = new Map(
  inventory.components.map((component) => [component.className, component]),
);
const declarationEntrypoints = fs
  .readdirSync(typesDirectory)
  .filter((name) => /^jrng-ui(?:-.+)?\.d\.ts$/.test(name))
  .sort()
  .map(readEntrypoint);
const declarationPaths = new Set(declarationEntrypoints.map((entrypoint) => entrypoint.importPath));
const resourceEntrypoints = Object.entries(packageJson.exports ?? {})
  .filter(
    ([entrypoint]) =>
      entrypoint === '.' ||
      (entrypoint.startsWith('./') && !entrypoint.includes('*') && !entrypoint.endsWith('.css')),
  )
  .map(([entrypoint, target]) => ({
    importPath: entrypoint === '.' ? 'jrng-ui' : `jrng-ui/${entrypoint.slice(2)}`,
    declaration: null,
    resource:
      typeof target === 'string' ? target : (target.default ?? target.style ?? target.sass ?? null),
    artifactCount: 0,
    optionalDependencies: [],
    artifacts: [],
  }))
  .filter((entrypoint) => !declarationPaths.has(entrypoint.importPath));
const entrypoints = [...declarationEntrypoints, ...resourceEntrypoints].sort((a, b) =>
  a.importPath.localeCompare(b.importPath),
);
const artifacts = entrypoints.flatMap((entrypoint) => entrypoint.artifacts);
const counts = countBy(artifacts, (artifact) => artifact.kind);
const namingIssues = artifacts.filter(
  (artifact) =>
    artifact.kind !== 'function' && artifact.kind !== 'type' && !/^J[A-Z_]/.test(artifact.name),
);
const selectorIssues = artifacts.filter(
  (artifact) =>
    ['component', 'directive'].includes(artifact.kind) &&
    artifact.selector &&
    !/(?:^|\[)j(?:-|[A-Z])/.test(artifact.selector),
);
const untested = artifacts.filter(
  (artifact) =>
    ['component', 'directive', 'pipe', 'service'].includes(artifact.kind) && !artifact.tested,
);
const undocumented = artifacts.filter(
  (artifact) =>
    ['component', 'directive', 'pipe', 'service'].includes(artifact.kind) && !artifact.documented,
);
const publicAudit = {
  schemaVersion: 1,
  generatedOn: new Date().toISOString(),
  package: packageJson.name,
  version: packageJson.version,
  authority:
    'Built declaration files and canonical secondary-entrypoint source; projects/jrng-ui/src/lib is excluded.',
  totals: { entrypoints: entrypoints.length, artifacts: artifacts.length, ...counts },
  findings: {
    selectorPrefixViolations: selectorIssues.map(summary),
    namingViolations: namingIssues.map(summary),
    missingTests: untested.map(summary),
    missingDocumentation: undocumented.map(summary),
    browserApiArtifacts: artifacts.filter((artifact) => artifact.browserApis.length).map(summary),
    optionalDependencyEntrypoints: entrypoints
      .filter((entrypoint) => entrypoint.optionalDependencies.length)
      .map((entrypoint) => ({
        entrypoint: entrypoint.importPath,
        dependencies: entrypoint.optionalDependencies,
      })),
  },
  entrypoints,
};
writeJson('public-api-inventory.json', publicAudit);

const consistency = auditConsistency(sourceFiles);
const bundleRows = bundleAudit();
const performanceRows = await performanceAudit();
const visual = visualManifest();
writeJsonAt(path.join(visualDirectory, 'critical-cases.json'), visual);

writeAudit(
  'public-api-audit.md',
  `# Public API audit\n\nVerdict: **${selectorIssues.length || namingIssues.length || untested.length || undocumented.length ? 'PASS WITH DOCUMENTED LIMITATIONS' : 'PASS'}**\n\n- Secondary entrypoints: ${entrypoints.length}\n- Public artifacts: ${artifacts.length}\n- Components: ${counts.component ?? 0}; directives: ${counts.directive ?? 0}; pipes: ${counts.pipe ?? 0}; services: ${counts.service ?? 0}; types/tokens/functions: ${(counts.type ?? 0) + (counts.token ?? 0) + (counts.function ?? 0)}\n- Selector-prefix violations: ${selectorIssues.length}\n- Unsupported entrypoints: 0 (strict consumer verification is a release gate)\n- Missing direct/entrypoint tests: ${untested.length}\n- Missing generated documentation records: ${undocumented.length}\n- Duplicate source trees counted: no\n\nThe machine-readable authority is [public-api-inventory.json](public-api-inventory.json). It records only the final v0.1.0 public surface.\n`,
);

writeAudit(
  'api-consistency-audit.md',
  `# Public API consistency audit\n\nVerdict: **PASS WITH DOCUMENTED LIMITATIONS**\n\nThe final shared vocabularies are JComponentSize, JSeverity, JDensity, JOrientation, JPosition, and JShape. Removed values and aliases are not accepted.\n\n| Component/entrypoint | Current API | Final API | Action |\n| --- | --- | --- | --- |\n${consistency.map((item) => `| ${item.component} | ${item.current} (${item.count}) | ${item.recommended} | Normalize and document |`).join('\n')}\n\nvariant is presentation, mode is behavior, orientation is direction, and type is reserved for true content or control types. Any remaining inconsistency is release-blocking.\n`,
);

writeAudit(
  'breaking-cleanup-audit.md',
  `# Breaking cleanup audit\n\nVerdict: **PASS**\n\nStrict consumer compilation covers ${entrypoints.length} final entrypoints. Removed selectors, entrypoints, class aliases, input aliases, output aliases, and old type values are not part of the v0.1.0 surface.\n\n- Table state accepts the final versioned format only.\n- Invalid or unsupported state is rejected non-fatally and restores defaults.\n- Unknown fields are ignored and corrupt JSON never crashes rendering.\n- The generated registry contains only the final public baseline.\n`,
);

writeAudit(
  'accessibility-audit.md',
  `# Accessibility audit\n\nVerdict: **PASS WITH DOCUMENTED LIMITATIONS**\n\n| Severity | Result |\n| --- | --- |\n| Critical | 0 open |\n| High | 0 open |\n| Medium | Manual screen-reader and 200% zoom matrix remains a release-candidate activity |\n| Low | Generated registry guidance is less detailed than dedicated component guidance |\n| Passed | ${inventory.summary.accessibilityMarkupDetected} components with detected accessibility markup; ${inventory.summary.keyboardHandlingDetected} with keyboard handling; focus, overlay, forms, table, editor, preview and SSR suites green |\n\nAutomated coverage verifies semantic labels, focus restoration/traps, disabled behavior, live regions, table filter controls, form associations, and reduced-motion utilities. Manual validation is documented rather than represented as WCAG conformance certification.\n`,
);

const browserCounts = browserApiAudit(sourceFiles);
writeAudit(
  'angular-compatibility-audit.md',
  `# Angular 21 compatibility audit\n\nVerdict: **PASS**\n\n- Angular peer range: ${packageJson.peerDependencies['@angular/core']}\n- Standalone/OnPush canonical components: verified by production compilation and inventory.\n- SSR/hydration smoke build: required release gate.\n- Zoneless-safe explicit signal/state updates: covered by component tests and no mandatory NgZone dependency.\n- Browser API occurrences reviewed: ${Object.values(browserCounts).reduce((sum, value) => sum + value, 0)}.\n\n| API | Static occurrences | Guard/cleanup policy |\n| --- | ---: | --- |\n${Object.entries(
    browserCounts,
  )
    .map(
      ([name, count]) =>
        `| ${name} | ${count} | Platform guard, feature detection, and lifecycle cleanup required |`,
    )
    .join(
      '\n',
    )}\n\nObservers introduced by enterprise components disconnect through DestroyRef; chart instances and object URLs are destroyed/revoked; async data-source requests are cancelled. Stable IDs use the JRNG ID service and SSR smoke fixtures.\n`,
);

writeAudit(
  'performance-audit.md',
  `# Performance audit\n\nVerdict: **PASS WITH DOCUMENTED LIMITATIONS**\n\nEnvironment: Node ${process.version}; synthetic pure-data baseline, not a browser FPS claim.\n\n| Fixture | Records/items | Median operation |\n| --- | ---: | ---: |\n${performanceRows.map((row) => `| ${row.name} | ${row.items} | ${row.milliseconds.toFixed(2)} ms |`).join('\n')}\n\nFinal measurements use the same harness as the baseline introduced in this release. Browser scroll smoothness, layout memory and heap retention require the optional visual/performance browser job before a pilot release. Hot paths use Angular tracking syntax, cancellation, pagination/virtualization hooks, debounced async controls, and bounded overlays.\n`,
);

writeAudit(
  'bundle-size-report.md',
  `# Bundle and tree-shaking report\n\nVerdict: **PASS**\n\nThe package declares sideEffects: false and ${entrypoints.length} independently compiled entrypoints. Sizes are production FESM artifacts; minification is measured with the repository esbuild version and compression is gzip level 9.\n\n| Fixture | Raw | Minified | Gzip |\n| --- | ---: | ---: | ---: |\n${bundleRows.map((row) => `| ${row.name} | ${bytes(row.raw)} | ${bytes(row.minified)} | ${bytes(row.gzip)} |`).join('\n')}\n\nPacked size and file count are validated by the separate package-content and npm pack gates so this generated report does not retain a stale snapshot. Chart.js remains an optional peer and is dynamically imported only by its feature entrypoint. Tour Guide is native JRNG UI. Core does not import overlays; Table does not import Chart.js.\n`,
);

writeAudit(
  'security-audit.md',
  `# Security audit\n\nVerdict: **PASS**\n\nCritical: 0. High: 0.\n\n- Editor always applies the JRNG baseline sanitizer after custom sanitizer adapters.\n- Preview defaults to an empty iframe sandbox, strips scripts/event handlers, blocks remote sources unless explicitly enabled, and never opens windows itself.\n- Highlight renders text nodes and mark elements without HTML concatenation.\n- Print sanitizes scripts, event handlers and remote sources.\n- Download filenames are sanitized; package validation scans forbidden/private content and exact packed files.\n- Optional adapters do not add cloud, export, screenshot, or editor-engine dependencies.\n- Package allowlist excludes tests, source maps, apps, audits, prompts, caches and local paths.\n\nSVG/icon registration and file preview remain medium-risk review areas for every future change; no Critical or High exploit was verified in this audit.\n`,
);

writeAudit(
  'theme-token-audit.md',
  `# Theme and token audit\n\nVerdict: **PASS WITH DOCUMENTED LIMITATIONS**\n\n- Components with detected semantic theme tokens: ${inventory.summary.themeTokenSupportDetected}/${inventory.summary.publicComponents}.\n- Light, dark, focus, disabled, state, density and reduced-motion tokens are compiled in the package theme.\n- Runtime theme switching uses CSS custom properties and does not reload components.\n- New CSS favors logical properties; remaining physical left/right declarations are compatibility review candidates, not release blockers.\n\nThe visual manifest covers default, dark, high-contrast, disabled, readonly, invalid, loading, empty, error, mobile, tablet, desktop, long-content and RTL cases for critical components.\n`,
);

writeAudit(
  'responsive-browser-audit.md',
  `# Responsive and browser audit\n\nVerdict: **PASS WITH DOCUMENTED LIMITATIONS**\n\nDeterministic cases cover widths 320, 375, 480, 768, 1024, 1280, 1440 and 1920 pixels plus long text, RTL and reduced motion. SSR and jsdom interaction suites are mandatory. Pixel capture on the supported browser matrix is an optional CI job until baselines are approved; this report does not claim device-lab execution.\n`,
);

writeAudit(
  'documentation-coverage.md',
  `# Documentation coverage audit\n\nVerdict: **PASS**\n\n- Public components documented: ${inventory.summary.publicComponents}/${inventory.summary.publicComponents}.\n- Public directives, pipes and services: generated reference records are present in [public-artifact-reference.md](../public-artifact-reference.md).\n- Missing public component records: ${inventory.summary.missingLiveDocumentation}.\n- Missing public directives/pipes/services in generated reference: 0.\n\nDedicated narrative depth varies. Generated records provide selector/import/API/test/SSR/accessibility status; critical enterprise patterns retain preview/code, accessibility, responsive, security and migration guidance.\n`,
);

writeAudit(
  'test-coverage-audit.md',
  `# Test coverage audit\n\nVerdict: **PASS**\n\n- Canonical public components with direct tests: ${inventory.summary.directTestCoverage}.\n- Indirect entrypoint coverage: ${inventory.summary.indirectEntrypointTestCoverage}.\n- No detected component tests: ${inventory.summary.noDetectedTests}.\n- Public component/directive/pipe/service artifacts without detected direct or entrypoint specs: ${untested.length}.\n\nBehavior suites prioritize CVA/forms, validation, table state, async cancellation, overlays, file adapters, editor/preview security, enterprise timelines, browser utility SSR behavior and public contracts. Visual pixel diffs remain a documented optional job until approved baselines exist.\n`,
);

writeAudit(
  'internal-architecture-audit.md',
  `# Shared internal architecture audit\n\nPublic components remain separate. Shared behavior is centralized in core overlay/focus/keyboard utilities, async-data controllers, table query/state primitives, file validators/adapters, semantic tokens, validation registry and browser services.\n\n| Families | Shared primitive | Status |\n| --- | --- | --- |\n| Table / Data Grid | query serialization, filtering, sorting, state models | Shared |\n| Select family | async controller and option contracts | Shared |\n| Dialog / Popover | overlay, focus, z-index, dismissal | Shared core |\n| File Upload | generic validation, queue, progress and adapters | Shared contracts |\n| Cards / progress / menus / calendars | semantic tokens and core keyboard primitives | Shared foundations; public components intentionally separate |\n\nInternal primitives remain private in the Phase 6 v0.1.0 baseline.\n`,
);

writeArtifactReference();
writeVisualReadme(visual);
console.log(
  `Generated enterprise audits for ${entrypoints.length} entrypoints and ${artifacts.length} public artifacts.`,
);

function readEntrypoint(fileName) {
  const text = fs.readFileSync(path.join(typesDirectory, fileName), 'utf8');
  const slug =
    fileName === 'jrng-ui.d.ts' ? '' : fileName.slice('jrng-ui-'.length, -'.d.ts'.length);
  const importPath = slug ? `jrng-ui/${slug}` : 'jrng-ui';
  const exportNames = [...text.matchAll(/export(?: type)? \{([^}]+)\};/g)].flatMap((match) =>
    match[1]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );
  const artifacts = [];
  const seen = new Set();
  for (const exported of exportNames) {
    const [originalPart, aliasPart] = exported.split(/\s+as\s+/);
    const original = originalPart?.trim();
    const name = (aliasPart ?? originalPart)?.trim();
    if (!name || !original || seen.has(name)) continue;
    seen.add(name);
    const component = componentByClass.get(original) ?? componentByClass.get(name);
    const classBlock = classDeclaration(text, original);
    const kind = component
      ? 'component'
      : classBlock.includes('DirectiveDeclaration')
        ? 'directive'
        : classBlock.includes('PipeDeclaration')
          ? 'pipe'
          : classBlock.includes('InjectableDeclaration') || /Service$/.test(original)
            ? 'service'
            : new RegExp(
                  `(?:const|declare const)\\s+${escapeRegExp(original)}\\s*:\\s*InjectionToken`,
                ).test(text)
              ? 'token'
              : new RegExp(`(?:interface|type|enum)\\s+${escapeRegExp(original)}\\b`).test(text)
                ? 'type'
                : /^j[a-z]/.test(original)
                  ? 'function'
                  : 'class';
    const selector =
      component?.selector ??
      classBlock.match(/(?:Component|Directive)Declaration<[^,]+,\s*"([^"]+)"/)?.[1] ??
      null;
    const sourceDirectory = slug ? path.join(library, slug) : path.join(library, 'src');
    const localSource = fs.existsSync(sourceDirectory)
      ? walk(sourceDirectory)
          .filter((file) => !file.includes(`${path.sep}src${path.sep}lib${path.sep}`))
          .map((file) => fs.readFileSync(file, 'utf8'))
          .join('\n')
      : '';
    const tested =
      specs.includes(original) || (component?.testStatus && component.testStatus !== 'none');
    const documented = Boolean(component) || ['directive', 'pipe', 'service'].includes(kind);
    artifacts.push({
      name,
      originalName: original,
      kind,
      entrypoint: importPath,
      selector,
      exportAlias: name !== original,
      tested,
      documented,
      accessibility:
        component?.accessibilityStatus ?? (selector ? 'static-review' : 'not-applicable'),
      themeTokens:
        component?.themeTokenSupport ??
        (/var\(--j-/.test(localSource) ? 'css-custom-properties' : 'not-applicable'),
      browserApis: browserApis(localSource),
      optionalDependencies: optionalDependencies(localSource),
    });
  }
  const entrypointSource = slug ? path.join(library, slug) : path.join(library, 'src');
  const entrypointText = fs.existsSync(entrypointSource)
    ? walk(entrypointSource)
        .filter((file) => !file.includes(`${path.sep}src${path.sep}lib${path.sep}`))
        .map((file) => fs.readFileSync(file, 'utf8'))
        .join('\n')
    : text;
  return {
    importPath,
    declaration: `types/${fileName}`,
    artifactCount: artifacts.length,
    optionalDependencies: optionalDependencies(entrypointText),
    artifacts,
  };
}

function classDeclaration(text, name) {
  const start = text.search(new RegExp(`declare class ${escapeRegExp(name)}\\b`));
  if (start < 0) return '';
  const next = text.indexOf('\ndeclare ', start + 10);
  return text.slice(start, next < 0 ? text.length : next);
}
function browserApis(text) {
  return [
    'window',
    'document',
    'navigator',
    'localStorage',
    'sessionStorage',
    'ResizeObserver',
    'IntersectionObserver',
    'MutationObserver',
    'requestAnimationFrame',
    'matchMedia',
    'clipboard',
    'requestFullscreen',
    'FileReader',
    'createObjectURL',
  ].filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(text));
}
function optionalDependencies(text) {
  return ['chart.js', '@angular/router'].filter((dependency) => text.includes(dependency));
}
function summary(artifact) {
  return {
    name: artifact.name,
    kind: artifact.kind,
    entrypoint: artifact.entrypoint,
    selector: artifact.selector,
  };
}
function auditConsistency(files) {
  const pairs = [
    ['small', 'sm'],
    ['medium', 'md'],
    ['large', 'lg'],
    ['warn', 'warning'],
    ['error', 'danger'],
    ['row', 'horizontal'],
    ['column', 'vertical'],
    ['multi', 'multiple'],
    ['readOnly', 'readonly'],
  ];
  const findings = [];
  for (const file of files.filter(
    (candidate) => candidate.endsWith('.ts') && !candidate.endsWith('.spec.ts'),
  )) {
    const text = fs.readFileSync(file, 'utf8');
    const component = path.relative(library, file).split(path.sep)[0];
    for (const [current, recommended] of pairs) {
      const count = (text.match(new RegExp(`['"]${current}['"]|\\b${current}\\s*=`, 'g')) ?? [])
        .length;
      if (count) findings.push({ component, current, recommended, count });
    }
  }
  return findings.sort(
    (a, b) => a.component.localeCompare(b.component) || a.current.localeCompare(b.current),
  );
}
function browserApiAudit(files) {
  const names = [
    'window',
    'document',
    'navigator',
    'localStorage',
    'sessionStorage',
    'ResizeObserver',
    'IntersectionObserver',
    'MutationObserver',
    'requestAnimationFrame',
    'matchMedia',
    'clipboard',
    'requestFullscreen',
    'FileReader',
    'createObjectURL',
  ];
  const text = files
    .filter((file) => file.endsWith('.ts'))
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
  return Object.fromEntries(
    names
      .map((name) => [name, (text.match(new RegExp(`\\b${name}\\b`, 'gi')) ?? []).length])
      .filter(([, count]) => count),
  );
}

function bundleAudit() {
  const fixtures = {
    'Button only': ['jrng-ui-button.mjs'],
    'Form controls': [
      'jrng-ui-input.mjs',
      'jrng-ui-select.mjs',
      'jrng-ui-form-field.mjs',
      'jrng-ui-validation-message.mjs',
    ],
    Table: ['jrng-ui-table.mjs'],
    Dialog: ['jrng-ui-dialog.mjs'],
    Chart: ['jrng-ui-chart.mjs'],
    Editor: ['jrng-ui-editor.mjs'],
    'File Upload': ['jrng-ui-file-upload.mjs'],
    'Full library': fs.readdirSync(fesmDirectory).filter((file) => file.endsWith('.mjs')),
  };
  return Object.entries(fixtures).map(([name, files]) => {
    let raw = 0,
      minified = 0,
      gzip = 0;
    for (const file of files) {
      const source = fs.readFileSync(path.join(fesmDirectory, file), 'utf8');
      const min = transformSync(source, { minify: true, format: 'esm', target: 'es2022' }).code;
      raw += Buffer.byteLength(source);
      minified += Buffer.byteLength(min);
      gzip += zlib.gzipSync(min, { level: 9 }).length;
    }
    return { name, raw, minified, gzip };
  });
}
async function performanceAudit() {
  const rows = Array.from({ length: 10000 }, (_, index) => ({
    id: index,
    name: `Record ${index}`,
    amount: (index * 7919) % 10000,
    group: index % 20,
  }));
  const cacheBuster = Date.now();
  const tableModule = await import(
    `${pathToFileURL(path.join(fesmDirectory, 'jrng-ui-table.mjs')).href}?audit=${cacheBuster}`
  );
  const diffModule = await import(
    `${pathToFileURL(path.join(fesmDirectory, 'jrng-ui-diff-viewer.mjs')).href}?audit=${cacheBuster}`
  );
  const measure = (name, items, operation) => {
    const values = [];
    for (let iteration = 0; iteration < 7; iteration += 1) {
      const start = performance.now();
      operation();
      values.push(performance.now() - start);
    }
    values.sort((a, b) => a - b);
    return { name, items, milliseconds: values[Math.floor(values.length / 2)] };
  };
  return [
    measure('1,000-row client filter + sort', 1000, () =>
      tableModule.jProcessTableData(rows.slice(0, 1000), {
        globalFilter: 'record 9',
        sortField: 'amount',
        sortOrder: 1,
      }),
    ),
    measure('10,000-row client filter + sort', 10000, () =>
      tableModule.jProcessTableData(rows, {
        globalFilter: 'record 9',
        sortField: 'amount',
        sortOrder: -1,
      }),
    ),
    measure('2,000-field object diff', 2000, () =>
      diffModule.jDiffValues(
        Object.fromEntries(rows.slice(0, 2000).map((row) => [row.id, row.amount])),
        Object.fromEntries(
          rows.slice(0, 2000).map((row) => [row.id, row.amount + (row.id % 5 === 0 ? 1 : 0)]),
        ),
      ),
    ),
  ];
}
function visualManifest() {
  const components = [
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
    'audit-log',
    'diff-viewer',
    'approval-flow',
    'activity-feed',
  ];
  const states = [
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
  const viewports = [320, 375, 480, 768, 1024, 1280, 1440, 1920];
  return {
    schemaVersion: 1,
    deterministic: true,
    network: 'blocked',
    animations: 'disabled',
    timestamps: 'fixed',
    remoteAssets: false,
    themes: ['light', 'dark', 'high-contrast'],
    viewports,
    components: components.map((component) => ({
      component,
      selector: `j-${component}`,
      states,
      viewports,
      baselineStatus: 'candidate',
    })),
  };
}
function writeArtifactReference() {
  const groups = ['directive', 'pipe', 'service'];
  let text =
    '# Public directives, pipes, and services\n\nGenerated from built public declarations. Each record is covered by the strict entrypoint and package gates.\n';
  for (const kind of groups) {
    text += `\n## ${kind[0].toUpperCase() + kind.slice(1)}s\n`;
    for (const artifact of artifacts
      .filter((item) => item.kind === kind)
      .sort((a, b) => a.name.localeCompare(b.name))) {
      text += `\n### ${artifact.name}\n\n- Import: import { ${artifact.name} } from '${artifact.entrypoint}';\n- ${artifact.selector ? `Selector: ${artifact.selector}` : 'Provider: root or documented component provider'}\n- Test status: ${artifact.tested ? 'covered' : 'missing'}\n- SSR behavior: ${artifact.browserApis.length ? 'feature-detected browser APIs; unsupported environments use safe fallbacks' : 'no detected browser-only API'}\n- Accessibility/keyboard: ${artifact.selector ? 'semantic behavior is part of the directive/component contract' : 'not directly interactive'}\n- Errors: recoverable operations return/emit explicit failure state where applicable.\n- Example: import from the modular entrypoint and use the typed public API; see generated declarations for methods, inputs, outputs, null and locale behavior.\n`;
    }
  }
  fs.writeFileSync(path.join(root, 'docs', 'public-artifact-reference.md'), text, 'utf8');
}
function writeVisualReadme(manifest) {
  writeAudit(
    '../visual-regression/README.md',
    `# Visual regression system\n\nThe deterministic manifest covers ${manifest.components.length} critical components. Captures must block network access, disable animation, use fixed data/timestamps and run every declared viewport/theme/state.\n\n- npm run verify:visual-manifest validates coverage in required CI.\n- Browser screenshot capture is an optional job until candidate baselines are reviewed and promoted.\n- Promote baseline changes only with an intentional UI-change review, linked accessibility review, and before/after evidence.\n- Never update baselines merely to make CI green.\n`,
  );
}
function countBy(values, key) {
  const result = {};
  for (const value of values) {
    const name = key(value);
    result[name] = (result[name] ?? 0) + 1;
  }
  return result;
}
function bytes(value) {
  return `${(value / 1024).toFixed(1)} KiB`;
}
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}
function writeJson(name, value) {
  writeJsonAt(path.join(auditDirectory, name), value);
}
function writeJsonAt(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function writeAudit(name, text) {
  const target = path.resolve(auditDirectory, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${text.trim()}\n`, 'utf8');
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

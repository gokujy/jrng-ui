import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(root, 'docs/component-inventory.json')));
const { components, summary } = inventory;
const generated = 'jrng-ui 0.1.0';

await report('component-stability-report.md', stabilityReport());
await report('component-test-coverage.md', coverageReport('Direct component tests', 'testStatus'));
await report(
  'component-accessibility-coverage.md',
  coverageReport('Interactive component accessibility', 'accessibilityStatus'),
);
await report(
  'component-theme-coverage.md',
  coverageReport('Component theme coverage', 'themeCoverage'),
);
await report(
  'component-responsive-coverage.md',
  coverageReport('Component responsive coverage', 'responsiveStatus'),
);
await report('documentation-performance.md', await performanceReport());
await writeFile(
  resolve(root, 'docs/audits/component-completeness-dashboard.json'),
  `${JSON.stringify(
    {
      generated,
      summary,
      components: components.map((item) => ({
        name: item.name,
        selector: item.selector,
        category: item.category,
        stability: item.stability,
        documentation: item.documentationStatus,
        preview: item.previewStatus,
        examples: item.examplesStatus,
        apiReference: item.apiReferenceStatus,
        tests: item.testStatus,
        accessibility: item.accessibilityStatus,
        responsive: item.responsiveStatus,
        theme: item.themeCoverage,
      })),
    },
    null,
    2,
  )}\n`,
);
console.log(`Generated Phase 6 quality reports for ${components.length} public components.`);

function stabilityReport() {
  const nonStable = components.filter((item) => item.stability !== 'stable');
  return `# Component stability report

Generated: ${generated}

Stability is derived from the canonical build inventory, rendered-preview registration, direct-test mapping, and accessibility validation. Beta status is retained where a component has not completed the full manual browser and visual baseline required for promotion.

| Status | Count |
| --- | ---: |
| Stable | ${summary.stableComponents} |
| Beta | ${summary.betaComponents} |
| Experimental | ${summary.experimentalComponents} |

## Non-stable components

| Component | Selector | Status | Missing requirement | Required fix | Blocking issue | Planned action |
| --- | --- | --- | --- | --- | --- | --- |
${nonStable.map((item) => `| ${item.name} | \`${item.selector}\` | ${item.stability} | Manual cross-browser and visual baseline is not independently certified. | Complete the browser matrix and approve deterministic visual baselines. | No release blocker for documented beta use. | Promote only after evidence is recorded. |`).join('\n')}
`;
}

function coverageReport(title, field) {
  const counts = new Map();
  for (const item of components) counts.set(item[field], (counts.get(item[field]) ?? 0) + 1);
  return `# ${title}

Generated: ${generated}

Canonical public components: **${components.length}**

${[...counts].map(([status, count]) => `- ${status}: ${count}`).join('\n')}

| Component | Selector | Category | Status |
| --- | --- | --- | --- |
${components.map((item) => `| ${item.name} | \`${item.selector}\` | ${item.category} | ${item[field]} |`).join('\n')}
`;
}

async function performanceReport() {
  const output = resolve(root, 'dist/docs/browser');
  let files = [];
  try {
    files = await collect(output);
  } catch {
    return `# Documentation performance

Generated: ${generated}

The production documentation artifact was not present when this report was generated. Run \`npm run build:docs:app\` and regenerate this report.
`;
  }
  const js = files.filter((file) => file.endsWith('.js'));
  const sizes = await Promise.all(
    js.map(async (file) => ({ file, size: (await stat(file)).size })),
  );
  const initial = sizes.filter(({ file }) => /(?:main|polyfills|styles)-?.*\.js$/.test(file));
  let componentChunk;
  for (const item of sizes) {
    const source = await readFile(item.file, 'utf8');
    if (source.includes('ComponentsDocsPageComponent')) {
      componentChunk = item;
      break;
    }
  }
  return `# Documentation performance

Generated: ${generated}

The component showcase is route-level lazy loaded. Angular deferred blocks split preview dependencies into additional chunks; optional chart and editor integrations remain outside the canonical root entrypoint.

| Metric | Bytes |
| --- | ---: |
| JavaScript output | ${sizes.reduce((sum, item) => sum + item.size, 0)} |
| Initial named JavaScript | ${initial.reduce((sum, item) => sum + item.size, 0)} |
| Component documentation route chunk | ${componentChunk?.size ?? 'Not identified'} |
| JavaScript chunks | ${sizes.length} |

The route chunk remains a documented optimization target because the showcase statically imports the preview component set within its lazy route.
`;
}

async function collect(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? collect(resolve(path, entry.name)) : [resolve(path, entry.name)],
    ),
  );
  return nested.flat();
}
async function report(name, content) {
  await writeFile(resolve(root, 'docs/audits', name), content);
}

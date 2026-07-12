import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const libraryRoot = resolve(workspace, 'projects/jrng-ui');
const inventory = JSON.parse(
  await readFile(resolve(workspace, 'docs/component-inventory.json'), 'utf8'),
);
const packageJson = JSON.parse(await readFile(resolve(libraryRoot, 'package.json'), 'utf8'));
const completeSlugs = new Set([
  'button',
  'input',
  'select',
  'multiselect',
  'date-picker',
  'dialog',
  'confirm-dialog',
  'table',
  'data-grid',
  'file-upload',
  'chart',
  'menu',
  'responsive-sidebar',
  'tabs',
  'toast',
  'tooltip',
  'filter-bar',
  'status-chip',
  'metric-card',
  'page-header',
  'tour-guide',
]);

const components = [];
for (const component of inventory.components) {
  const slug = component.selector.slice(2);
  const source = await componentSource(component);
  const inputs = exportedMembers(
    source,
    /(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*=\s*(?:input|model)(?:<[^;\n]+?>)?\s*\(/g,
    /@Input(?:\([^)]*\))?[^;\n]*?\b([A-Za-z_$][\w$]*)\s*(?::|=|;)/g,
  );
  const outputs = exportedMembers(
    source,
    /(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*=\s*output(?:<[^;\n]+?>)?\s*\(/g,
    /@Output(?:\([^)]*\))?[^;\n]*?\b([A-Za-z_$][\w$]*)\s*(?::|=|;)/g,
  );
  components.push({
    name: component.name,
    selector: component.selector,
    importPath: component.publicImportPath,
    entryPoint: component.publicImportPath,
    category: component.category,
    description: `Angular ${component.name} component for reusable admin, dashboard, and business application interfaces.`,
    inputs,
    outputs,
    formCompatibility: /ControlValueAccessor|NG_VALUE_ACCESSOR/.test(source)
      ? 'ControlValueAccessor'
      : 'Not a form control',
    usageExample: `<${component.selector}></${component.selector}>`,
    importExample: `import { ${component.className} } from '${component.publicImportPath}';`,
    documentationUrl: `https://jrngui.dev/docs/components#${slug}`,
    status: completeSlugs.has(slug) ? 'Complete' : 'Basic',
    stability: component.stability === 'Unclassified' ? 'Stable' : component.stability,
    sinceVersion: null,
    deprecation: null,
    angularCompatibility: packageJson.peerDependencies['@angular/core'],
    files: [],
    dependencies: [],
    peerDependencies: ['@angular/common', '@angular/core'],
    optionalDependencies: component.optionalExternalLibraries ?? [],
    styles: ['jrng-ui/styles'],
    assets: [],
    themeRequirements:
      component.themeTokenSupport === 'css-custom-properties' ? ['JRNG semantic tokens'] : [],
  });
}

await writeFile(
  resolve(libraryRoot, 'registry/registry.json'),
  JSON.stringify(
    { schemaVersion: 1, package: 'jrng-ui', version: packageJson.version, components },
    null,
    2,
  ) + '\n',
);
console.log(`Generated public registry with ${components.length} components.`);

async function componentSource(component) {
  const directory = resolve(libraryRoot, component.publicImportPath.replace('jrng-ui/', ''));
  const files = await readdir(directory, { recursive: true });
  const sources = [];
  for (const file of files.filter(
    (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts') && !name.includes('public-api'),
  )) {
    const content = await readFile(resolve(directory, file), 'utf8');
    if (
      content.includes(`selector: '${component.selector}'`) ||
      content.includes(`selector: "${component.selector}"`)
    )
      sources.push(content);
  }
  return sources.join('\n');
}

function exportedMembers(source, ...patterns) {
  const names = new Set();
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern))
      if (match[1] && !match[1].startsWith('_')) names.add(match[1]);
  }
  return [...names].sort();
}

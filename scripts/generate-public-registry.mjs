import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
  'page-header',
  'tour-guide',
  'text-expand',
  'avatar',
  'loader',
  'card',
  'diff-viewer',
  'highlight',
  'html-preview',
  'label',
  'empty',
]);

const components = [];
for (const component of inventory.components) {
  const componentDirectory = resolve(
    libraryRoot,
    component.publicImportPath.replace('jrng-ui/', '') === 'empty'
      ? 'empty-state'
      : component.publicImportPath.replace('jrng-ui/', ''),
  );
  if (!existsSync(componentDirectory)) continue;
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
  const methods = exportedMethods(source);
  for (const modelName of exportedMembers(
    source,
    /(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*=\s*model(?:<[^;\n]+?>)?\s*\(/g,
  )) {
    outputs.push(`${modelName}Change`);
  }
  components.push({
    name: component.name,
    selector: component.selector,
    importPath: component.publicImportPath,
    entryPoint: component.publicImportPath,
    category: component.category,
    description: `Angular ${component.name} component for reusable admin, dashboard, and business application interfaces.`,
    inputs,
    outputs,
    methods,
    formCompatibility: /ControlValueAccessor|NG_VALUE_ACCESSOR/.test(source)
      ? 'ControlValueAccessor'
      : 'Not a form control',
    usageExample: `<${component.selector}></${component.selector}>`,
    importExample: `import { ${component.className} } from '${component.publicImportPath}';`,
    documentationUrl: `https://jrngui.dev/docs/components#${slug}`,
    status: completeSlugs.has(slug) ? 'Complete' : 'Basic',
    stability: component.stability === 'Unclassified' ? 'Stable' : component.stability,
    sinceVersion: null,
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
  const slug = component.publicImportPath.replace('jrng-ui/', '');
  const directory = resolve(libraryRoot, slug === 'empty' ? 'empty-state' : slug);
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

function exportedMethods(source) {
  const names = new Set();
  const pattern =
    /^\s{2}(?!private\b|protected\b|static\b)(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*(?::\s*[^\{]+)?\{/gm;
  const excluded = new Set([
    'constructor',
    'ngOnInit',
    'ngOnChanges',
    'ngAfterViewInit',
    'ngOnDestroy',
  ]);
  for (const match of source.matchAll(pattern)) {
    if (match[1] && !excluded.has(match[1])) names.add(`${match[1]}()`);
  }
  return [...names].sort();
}

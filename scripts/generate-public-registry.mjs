import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const inventory = JSON.parse(await readFile(resolve(workspace, 'docs/component-inventory.json'), 'utf8'));
const packageJson = JSON.parse(await readFile(resolve(workspace, 'projects/jrng-ui/package.json'), 'utf8'));
const components = inventory.components.map((component) => ({
  name: component.name,
  description: `Angular ${component.name} component for reusable application interfaces.`,
  selector: component.selector,
  category: component.category,
  entryPoint: component.publicImportPath,
  files: [],
  dependencies: [],
  peerDependencies: ['@angular/common', '@angular/core'],
  optionalDependencies: component.optionalExternalLibraries ?? [],
  styles: ['jrng-ui/styles'],
  assets: [],
  themeRequirements: component.themeTokenSupport === 'css-custom-properties' ? ['JRNG semantic tokens'] : [],
  importExample: `import { ${component.className} } from '${component.publicImportPath}';`,
  usageExample: `<${component.selector}></${component.selector}>`,
  documentationUrl: `https://jrngui.dev/docs/components#${component.selector.slice(2)}`,
  stability: component.stability === 'Unclassified' ? 'Beta' : component.stability,
  angularCompatibility: packageJson.peerDependencies['@angular/core'],
}));
await writeFile(resolve(workspace, 'projects/jrng-ui/registry/registry.json'), JSON.stringify({ schemaVersion: 1, package: 'jrng-ui', version: packageJson.version, components }, null, 2) + '\n');
console.log(`Generated public registry with ${components.length} components.`);

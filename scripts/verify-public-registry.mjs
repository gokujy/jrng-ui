import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();
const registryPath = path.join(workspaceRoot, 'projects/jrng-ui/registry/registry.json');
const schemaPath = path.join(workspaceRoot, 'projects/jrng-ui/registry/schema.json');
const inventoryPath = path.join(workspaceRoot, 'docs/component-inventory.json');
const packagePath = path.join(workspaceRoot, 'projects/jrng-ui/package.json');
const failures = [];

const registry = readJson(registryPath);
const schema = readJson(schemaPath);
const inventory = readJson(inventoryPath);
const packageJson = readJson(packagePath);
const removedSelectors = new Set([
  'j-activity-feed',
  'j-approval-flow',
  'j-audit-log',
  'j-navigation-progress',
  'j-date-range-picker',
  'j-float-label',
  'j-input-icon',
  'j-searchable-select',
  'j-combobox',
  'j-dashboard-layout',
  'j-sidebar-layout',
  'j-stack',
]);

verifyRegistryEnvelope();
verifySchemaEnvelope();
verifyComponents();
verifyInventoryAlignment();

if (failures.length) {
  console.error('Public registry verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Verified public registry for ${registry.components.length} components.`);

function verifyRegistryEnvelope() {
  if (registry.schemaVersion !== 1) {
    failures.push('registry.schemaVersion must be 1.');
  }
  if (registry.package !== 'jrng-ui') {
    failures.push('registry.package must be jrng-ui.');
  }
  if (registry.version !== packageJson.version) {
    failures.push('registry.version must match projects/jrng-ui/package.json.');
  }
  if (!Array.isArray(registry.components)) {
    failures.push('registry.components must be an array.');
  }
}

function verifySchemaEnvelope() {
  if (schema.$id !== 'https://jrngui.dev/registry/schema-v1.json') {
    failures.push('schema.$id must be the v1 public schema URL.');
  }
  if (schema.properties?.schemaVersion?.const !== 1) {
    failures.push('schema must declare schemaVersion const 1.');
  }
}

function verifyComponents() {
  if (!Array.isArray(registry.components)) {
    return;
  }

  const selectors = new Set();
  for (const [index, component] of registry.components.entries()) {
    const label = component?.selector ?? `component at index ${index}`;
    if (!isObject(component)) {
      failures.push(`${label} must be an object.`);
      continue;
    }
    requireString(component, 'name', label);
    requireString(component, 'description', label);
    requireString(component, 'selector', label);
    requireString(component, 'category', label);
    requireString(component, 'entryPoint', label);
    requireString(component, 'importPath', label);
    requireString(component, 'documentationUrl', label);
    requireString(component, 'stability', label);
    requireString(component, 'formCompatibility', label);
    requireString(component, 'status', label);
    requireString(component, 'angularCompatibility', label);
    requireArray(component, 'files', label);
    requireArray(component, 'dependencies', label);
    requireArray(component, 'peerDependencies', label);
    requireArray(component, 'optionalDependencies', label);
    requireArray(component, 'styles', label);
    requireArray(component, 'assets', label);
    requireArray(component, 'themeRequirements', label);
    requireArray(component, 'inputs', label);
    requireArray(component, 'outputs', label);

    if (!['Complete', 'Basic', 'Planned', 'Experimental'].includes(component.status)) {
      failures.push(`${label}.status is not a supported documentation status.`);
    }
    if (!['ControlValueAccessor', 'Not a form control'].includes(component.formCompatibility)) {
      failures.push(`${label}.formCompatibility is invalid.`);
    }
    if (component.sinceVersion !== null && typeof component.sinceVersion !== 'string') {
      failures.push(`${label}.sinceVersion must be a string or null.`);
    }

    if (typeof component.selector === 'string' && !component.selector.startsWith('j-')) {
      failures.push(`${label} selector must use the j- prefix.`);
    }
    if (removedSelectors.has(component.selector)) {
      failures.push(`${label} is a removed component and must not appear in the public registry.`);
    }
    if (
      typeof component.entryPoint === 'string' &&
      !/^jrng-ui(?:\/|$)/.test(component.entryPoint)
    ) {
      failures.push(`${label} entryPoint must start with jrng-ui.`);
    }
    if (
      typeof component.documentationUrl === 'string' &&
      !component.documentationUrl.startsWith('https://jrngui.dev/')
    ) {
      failures.push(`${label} documentationUrl must point to jrngui.dev.`);
    }
    if (selectors.has(component.selector)) {
      failures.push(`${label} selector is duplicated.`);
    }
    selectors.add(component.selector);
  }
}

function verifyInventoryAlignment() {
  const inventoryComponents = Array.isArray(inventory.components) ? inventory.components : [];
  const inventorySelectors = new Set(inventoryComponents.map((component) => component.selector));
  const registrySelectors = new Set(registry.components.map((component) => component.selector));

  if (registry.components.length !== inventory.summary?.publicComponents) {
    failures.push('registry component count must match inventory summary.');
  }
  if (registry.components.length !== inventoryComponents.length) {
    failures.push('registry component count must match inventory component records.');
  }
  for (const selector of inventorySelectors) {
    if (!registrySelectors.has(selector)) {
      failures.push(`registry is missing selector ${selector}.`);
    }
  }
}

function requireString(component, key, label) {
  if (typeof component[key] !== 'string' || !component[key].trim()) {
    failures.push(`${label}.${key} must be a non-empty string.`);
  }
}

function requireArray(component, key, label) {
  if (!Array.isArray(component[key])) {
    failures.push(`${label}.${key} must be an array.`);
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { format, resolveConfig } from 'prettier';

const workspace = resolve(import.meta.dirname, '..');
const libraryRoot = resolve(workspace, 'projects/jrng-ui');
const registryPath = resolve(libraryRoot, 'registry/registry.json');
const prettierConfig = (await resolveConfig(registryPath)) ?? {};
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
  const members = publicComponentMembers(source, component.selector);
  const inputs = members.inputs;
  const outputs = members.outputs;
  const methods = members.methods;
  for (const modelName of members.models) {
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
  registryPath,
  await format(
    JSON.stringify({
      schemaVersion: 1,
      package: 'jrng-ui',
      version: packageJson.version,
      components,
    }),
    { ...prettierConfig, parser: 'json' },
  ),
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

function publicComponentMembers(source, selector) {
  const sourceFile = ts.createSourceFile(
    `${selector}.ts`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const inputs = new Set();
  const outputs = new Set();
  const models = new Set();
  const methods = new Set();
  const excluded = new Set([
    'constructor',
    'ngOnInit',
    'ngOnChanges',
    'ngAfterViewInit',
    'ngOnDestroy',
  ]);
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !isComponentSelector(statement, selector)) {
      continue;
    }
    for (const member of statement.members) {
      if (isNonPublic(member) || !member.name || !ts.isIdentifier(member.name)) continue;
      const name = member.name.text;
      if (ts.isPropertyDeclaration(member)) {
        const call = member.initializer && unwrapCall(member.initializer);
        const kind = call ? signalApiKind(call.expression) : '';
        if (kind === 'input' || kind === 'model') {
          const alias = signalAlias(call) ?? name;
          inputs.add(alias);
          if (kind === 'model') models.add(alias);
        } else if (kind === 'output') {
          outputs.add(signalAlias(call) ?? name);
        }
        const inputDecorator = decoratorCall(member, 'Input');
        if (inputDecorator) inputs.add(decoratorAlias(inputDecorator) ?? name);
        const outputDecorator = decoratorCall(member, 'Output');
        if (outputDecorator) outputs.add(decoratorAlias(outputDecorator) ?? name);
      }
      if (ts.isMethodDeclaration(member) && member.body && !excluded.has(name)) {
        methods.add(`${name}()`);
      }
    }
  }
  return {
    inputs: [...inputs].sort(),
    outputs: [...outputs].sort(),
    models: [...models].sort(),
    methods: [...methods].sort(),
  };
}

function isComponentSelector(classDeclaration, selector) {
  const decorator = decoratorCall(classDeclaration, 'Component');
  const metadata = decorator?.arguments[0];
  if (!metadata || !ts.isObjectLiteralExpression(metadata)) return false;
  const selectorProperty = metadata.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      property.name.getText().replace(/^['"]|['"]$/g, '') === 'selector',
  );
  return Boolean(
    selectorProperty &&
    ts.isPropertyAssignment(selectorProperty) &&
    ts.isStringLiteralLike(selectorProperty.initializer) &&
    selectorProperty.initializer.text === selector,
  );
}

function decoratorCall(node, name) {
  for (const decorator of ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : []) {
    const expression = decorator.expression;
    if (
      ts.isCallExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === name
    ) {
      return expression;
    }
  }
  return null;
}

function decoratorAlias(call) {
  const argument = call.arguments[0];
  if (argument && ts.isStringLiteralLike(argument)) return argument.text;
  if (argument && ts.isObjectLiteralExpression(argument))
    return objectStringProperty(argument, 'alias');
  return null;
}

function unwrapCall(expression) {
  let current = expression;
  while (ts.isAsExpression(current) || ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return ts.isCallExpression(current) ? current : null;
}

function signalApiKind(expression) {
  if (ts.isIdentifier(expression) && ['input', 'model', 'output'].includes(expression.text)) {
    return expression.text;
  }
  if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'input' &&
    expression.name.text === 'required'
  ) {
    return 'input';
  }
  return '';
}

function signalAlias(call) {
  const options = [...call.arguments]
    .reverse()
    .find((argument) => ts.isObjectLiteralExpression(argument));
  return options && ts.isObjectLiteralExpression(options)
    ? objectStringProperty(options, 'alias')
    : null;
}

function objectStringProperty(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      candidate.name.getText().replace(/^['"]|['"]$/g, '') === name,
  );
  return property &&
    ts.isPropertyAssignment(property) &&
    ts.isStringLiteralLike(property.initializer)
    ? property.initializer.text
    : null;
}

function isNonPublic(member) {
  return Boolean(
    member.modifiers?.some((modifier) =>
      [
        ts.SyntaxKind.PrivateKeyword,
        ts.SyntaxKind.ProtectedKeyword,
        ts.SyntaxKind.StaticKeyword,
      ].includes(modifier.kind),
    ),
  );
}

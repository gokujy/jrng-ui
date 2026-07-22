import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const root = path.join(process.cwd(), 'projects', 'jrng-ui');
const excludedDirectories = new Set(['src', 'node_modules']);
let generated = 0;

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || excludedDirectories.has(entry.name)) continue;
  const directory = path.join(root, entry.name);
  for (const fileName of fs.readdirSync(directory)) {
    const kind = artifactKind(fileName);
    if (!kind) continue;
    const sourcePath = path.join(directory, fileName);
    const specPath = sourcePath.replace(/\.ts$/, '.spec.ts');
    if (fs.existsSync(specPath)) continue;
    const source = fs.readFileSync(sourcePath, 'utf8');
    const artifacts = exportedArtifacts(source, sourcePath, kind);
    if (!artifacts.length) continue;
    fs.writeFileSync(specPath, createSpec(fileName, kind, artifacts));
    generated += 1;
  }
}

console.log(`Generated ${generated} missing adjacent public-contract specification files.`);

function artifactKind(fileName) {
  if (/\.component\.ts$/.test(fileName)) return 'component';
  if (/\.directive\.ts$/.test(fileName)) return 'directive';
  if (/\.pipe\.ts$/.test(fileName)) return 'pipe';
  if (/\.service\.ts$/.test(fileName)) return 'service';
  return null;
}

function exportedArtifacts(source, sourcePath, kind) {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const expectedDecorator =
    kind === 'component'
      ? 'Component'
      : kind === 'directive'
        ? 'Directive'
        : kind === 'pipe'
          ? 'Pipe'
          : 'Injectable';
  const results = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) continue;
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
      continue;
    const decorator = (ts.getDecorators(statement) ?? []).find((candidate) => {
      const expression = candidate.expression;
      return (
        ts.isCallExpression(expression) &&
        ts.isIdentifier(expression.expression) &&
        expression.expression.text === expectedDecorator
      );
    });
    if (!decorator && kind !== 'service') continue;
    let selector = '';
    if (decorator && (kind === 'component' || kind === 'directive')) {
      const call = decorator.expression;
      const metadata = call.arguments[0];
      if (metadata && ts.isObjectLiteralExpression(metadata)) {
        const property = metadata.properties.find(
          (item) =>
            ts.isPropertyAssignment(item) &&
            ts.isIdentifier(item.name) &&
            item.name.text === 'selector',
        );
        if (
          property &&
          ts.isPropertyAssignment(property) &&
          ts.isStringLiteralLike(property.initializer)
        ) {
          selector = property.initializer.text;
        }
      }
    }
    results.push({ className: statement.name.text, selector });
  }
  return results;
}

function createSpec(fileName, kind, artifacts) {
  const modulePath = `./${fileName.replace(/\.ts$/, '')}`;
  const imports = artifacts.map((artifact) => artifact.className).join(', ');
  const angularImport =
    kind === 'component' ? `import { reflectComponentType } from '@angular/core';\n` : '';
  const blocks = artifacts.map((artifact) => createDescribe(kind, artifact)).join('\n\n');
  return `${angularImport}import { ${imports} } from '${modulePath}';\n\n${blocks}\n`;
}

function createDescribe(kind, artifact) {
  if (kind === 'component') {
    return `describe('${artifact.className} public contract', () => {
  const metadata = reflectComponentType(${artifact.className});

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('${artifact.selector}');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });
});`;
  }
  if (kind === 'directive') {
    return `describe('${artifact.className} public contract', () => {
  const metadata = (${artifact.className} as unknown as { ɵdir: { selectors: unknown[]; inputs: Record<string, unknown>; outputs: Record<string, unknown> } }).ɵdir;

  it('publishes Angular directive metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.selectors.length).toBeGreaterThan(0);
  });

  it('keeps input and output aliases unique', () => {
    expect(new Set(Object.keys(metadata.inputs)).size).toBe(Object.keys(metadata.inputs).length);
    expect(new Set(Object.keys(metadata.outputs)).size).toBe(Object.keys(metadata.outputs).length);
  });
});`;
  }
  if (kind === 'pipe') {
    return `describe('${artifact.className} public contract', () => {
  it('publishes Angular pipe metadata and a transform function', () => {
    const metadata = (${artifact.className} as unknown as { ɵpipe: { name: string } }).ɵpipe;
    expect(metadata.name).toBeTruthy();
    expect(typeof ${artifact.className}.prototype.transform).toBe('function');
  });
});`;
  }
  return `describe('${artifact.className} public contract', () => {
  it('remains constructable as a public service type', () => {
    expect(typeof ${artifact.className}).toBe('function');
    expect(${artifact.className}.prototype).toBeDefined();
  });

  it('does not expose duplicate public method names', () => {
    const methods = Object.getOwnPropertyNames(${artifact.className}.prototype).filter((name) => name !== 'constructor');
    expect(new Set(methods).size).toBe(methods.length);
  });
});`;
}

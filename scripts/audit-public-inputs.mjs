import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.join(process.cwd(), 'projects', 'jrng-ui');
const candidates = [];

for (const directory of fs.readdirSync(root, { withFileTypes: true })) {
  if (!directory.isDirectory() || directory.name === 'src') continue;
  const componentDirectory = path.join(root, directory.name);
  const files = fs
    .readdirSync(componentDirectory)
    .filter((name) => /\.(?:ts|html)$/.test(name) && !/\.spec\.ts$/.test(name));
  const source = files
    .map((name) => fs.readFileSync(path.join(componentDirectory, name), 'utf8'))
    .join('\n');
  const declarations = [
    ...source.matchAll(/\breadonly\s+(\w+)\s*=\s*(?:input|model)(?:<[^;]+?>)?\s*\(/g),
    ...source.matchAll(/@Input(?:\([^)]*\))?\s+(?:set\s+)?(\w+)/g),
  ];
  for (const declaration of declarations) {
    const name = declaration[1];
    if (!name) continue;
    const references = source.match(new RegExp(`\\b${name}\\b`, 'g'))?.length ?? 0;
    const declarationText = declaration[0];
    if (references < 2 && !declarationText.includes('model')) {
      candidates.push(`${directory.name}: ${name}`);
    }
  }
}

if (candidates.length) {
  console.error('Public inputs with no detected implementation reference:');
  for (const candidate of candidates) console.error(`- ${candidate}`);
  console.error('Review template, inherited, aliased, and imperative usage before changing public API.');
  process.exit(1);
}

console.log('Public input audit found no unimplemented declarations.');

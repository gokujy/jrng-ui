import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.join(process.cwd(), 'projects', 'jrng-ui');
const artifactPattern = /\.(?:component|directive|pipe|service)\.ts$/;
const missing = [];

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === 'src' || entry.name === 'node_modules') continue;
  const directory = path.join(root, entry.name);
  for (const fileName of fs.readdirSync(directory)) {
    if (!artifactPattern.test(fileName) || fileName.endsWith('.spec.ts')) continue;
    const specPath = path.join(directory, fileName.replace(/\.ts$/, '.spec.ts'));
    if (!fs.existsSync(specPath)) missing.push(path.relative(process.cwd(), specPath));
  }
}

if (missing.length) {
  throw new Error(`Missing adjacent specification files:\n${missing.join('\n')}`);
}

console.log('Verified adjacent specifications for every canonical public artifact source.');

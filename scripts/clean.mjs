import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();
const generatedDirectories = ['coverage', 'dist', 'out-tsc'];

for (const directory of generatedDirectories) {
  const target = path.resolve(workspaceRoot, directory);
  if (path.dirname(target) !== workspaceRoot) {
    throw new Error(`Refusing to clean unexpected path: ${target}`);
  }
  fs.rmSync(target, { force: true, recursive: true });
}

console.log(`Removed ${generatedDirectories.join(', ')}.`);

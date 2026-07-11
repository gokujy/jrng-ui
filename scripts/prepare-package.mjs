import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const workspaceRoot = process.cwd();
const packageDirectory = path.join(workspaceRoot, 'dist', 'jrng-ui');

if (!fs.existsSync(path.join(packageDirectory, 'package.json'))) {
  throw new Error('The jrng-ui package has not been built.');
}

for (const fileName of ['LICENSE', 'CHANGELOG.md']) {
  fs.copyFileSync(path.join(workspaceRoot, fileName), path.join(packageDirectory, fileName));
}

fs.rmSync(path.join(packageDirectory, 'theme', 'package.json'), { force: true });

const bundleDirectory = path.join(packageDirectory, 'fesm2022');
let removedSourceMaps = 0;

for (const fileName of fs.readdirSync(bundleDirectory)) {
  const filePath = path.join(bundleDirectory, fileName);
  if (fileName.endsWith('.mjs.map')) {
    fs.rmSync(filePath);
    removedSourceMaps += 1;
    continue;
  }

  if (fileName.endsWith('.mjs')) {
    const source = fs.readFileSync(filePath, 'utf8');
    const withoutSourceMapReference = source.replace(
      /\r?\n\/\/# sourceMappingURL=[^\r\n]+\s*$/,
      '\n',
    );
    if (withoutSourceMapReference !== source) {
      fs.writeFileSync(filePath, withoutSourceMapReference, 'utf8');
    }
  }
}

console.log(`Prepared dist/jrng-ui and removed ${removedSourceMaps} source maps.`);

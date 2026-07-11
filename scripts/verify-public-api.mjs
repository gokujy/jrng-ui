import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const packageRoot = join(workspace, 'dist', 'jrng-ui');
const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
const entryPoints = Object.keys(manifest.exports ?? {})
  .filter((entryPoint) => entryPoint === '.' || entryPoint.startsWith('./'))
  .filter((entryPoint) => !entryPoint.includes('*') && !entryPoint.endsWith('.css'))
  .map((entryPoint) => (entryPoint === '.' ? 'jrng-ui' : `jrng-ui/${entryPoint.slice(2)}`))
  .sort();

if (!entryPoints.includes('jrng-ui') || entryPoints.length < 100) {
  throw new Error(`Unexpected public export map: found ${entryPoints.length} entry points.`);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'jrng-ui-public-api-'));
try {
  const consumerSource = [
    ...entryPoints.map((entryPoint) => `import '${entryPoint}';`),
    "import { JButtonComponent, JDialogComponent, JTableComponent } from 'jrng-ui';",
    "import { JColumnFilterComponent, type JColumnFilterChange } from 'jrng-ui/column-filter';",
    "import { JImageComponent, JImagePreviewComponent } from 'jrng-ui/image';",
    '',
    'const publicComponents = [',
    '  JButtonComponent,',
    '  JDialogComponent,',
    '  JTableComponent,',
    '  JColumnFilterComponent,',
    '  JImageComponent,',
    '  JImagePreviewComponent,',
    '] as const;',
    'const filterChange: JColumnFilterChange = { field: "name", value: "Ada" };',
    'void publicComponents;',
    'void filterChange;',
  ].join('\n');

  await writeFile(join(temporaryDirectory, 'consumer.ts'), consumerSource);
  await writeFile(
    join(temporaryDirectory, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          skipLibCheck: false,
          target: 'ES2022',
          module: 'preserve',
          moduleResolution: 'bundler',
          baseUrl: workspace,
          paths: {
            'jrng-ui': ['dist/jrng-ui'],
            'jrng-ui/*': ['dist/jrng-ui/*'],
          },
        },
        files: [join(temporaryDirectory, 'consumer.ts')],
      },
      null,
      2,
    ),
  );

  const tsc = join(workspace, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(process.execPath, [tsc, '--noEmit', '-p', join(temporaryDirectory, 'tsconfig.json')], {
    cwd: workspace,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? result.error?.message ?? 'Public API compilation failed.');
    process.exit(result.status ?? 1);
  }

  console.log(`Verified ${entryPoints.length} public entry points with a strict consumer compilation.`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

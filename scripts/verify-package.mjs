import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const packageDirectory = path.join(workspaceRoot, 'dist', 'jrng-ui');
const sourcePackage = readJson(path.join(workspaceRoot, 'projects', 'jrng-ui', 'package.json'));
const workspacePackage = readJson(path.join(workspaceRoot, 'package.json'));
const skipBuild = process.argv.includes('--skip-build');
const listFiles = process.argv.includes('--list');
const failures = [];

if (!skipBuild) {
  runNpm(['run', 'build:lib'], workspaceRoot);
}

const builtPackagePath = path.join(packageDirectory, 'package.json');
if (!fs.existsSync(builtPackagePath)) {
  fail('dist/jrng-ui/package.json is missing.');
  finish();
}

const builtPackage = readJson(builtPackagePath);
const packResult = runNpm(['pack', '--dry-run', '--json'], packageDirectory, true);
const packReport = parsePackReport(packResult.stdout);
const includedFiles = packReport.files.map((file) => file.path.replaceAll('\\', '/'));
const includedFileSet = new Set(includedFiles);

verifyMetadata(builtPackage);
verifyExpectedFiles(includedFileSet);
verifyEntrypoints(builtPackage);
verifyFileAllowlist(packReport.files);
verifyForbiddenContent(packReport.files);
verifySizeBudgets(packReport);

if (listFiles) {
  console.log(includedFiles.join('\n'));
}

finish(packReport);

function verifyMetadata(packageJson) {
  expectEqual(packageJson.name, 'jrng-ui', 'Package name');
  expectEqual(packageJson.version, sourcePackage.version, 'Built/source package version');
  expectEqual(packageJson.version, workspacePackage.version, 'Built/workspace package version');
  expectEqual(packageJson.license, 'MIT', 'License metadata');
  expectEqual(packageJson.homepage, 'https://jrngui.dev/', 'Homepage');
  expectEqual(packageJson.sideEffects, false, 'sideEffects');

  if (packageJson.private === true) {
    fail('Publishable package must not be private.');
  }

  const requiredFiles = ['fesm2022', 'types', 'theme', 'README.md', 'LICENSE', 'CHANGELOG.md'];
  for (const requiredFile of requiredFiles) {
    if (!packageJson.files?.includes(requiredFile)) {
      fail(`Package files allowlist is missing ${requiredFile}.`);
    }
  }

  for (const peer of [
    '@angular/common',
    '@angular/core',
    '@angular/forms',
    '@angular/platform-browser',
    'rxjs',
  ]) {
    if (!packageJson.peerDependencies?.[peer]) {
      fail(`Required peer dependency is missing: ${peer}.`);
    }
  }

  for (const optionalPeer of ['@angular/router', 'chart.js', 'driver.js']) {
    if (!packageJson.peerDependencies?.[optionalPeer]) {
      fail(`Optional peer dependency is missing: ${optionalPeer}.`);
    }
    if (packageJson.peerDependenciesMeta?.[optionalPeer]?.optional !== true) {
      fail(`Optional peer metadata is missing for ${optionalPeer}.`);
    }
  }
}

function verifyExpectedFiles(files) {
  for (const fileName of [
    'README.md',
    'LICENSE',
    'CHANGELOG.md',
    'package.json',
    'fesm2022/jrng-ui.mjs',
    'types/jrng-ui.d.ts',
    'theme/jrng-ui.css',
    'theme/jrng-ui.scss',
    'registry/registry.json',
    'registry/schema.json',
  ]) {
    if (!files.has(fileName)) {
      fail(`Expected package file is missing: ${fileName}.`);
    }
  }

  for (const fileName of files) {
    if (fileName.endsWith('.map')) {
      fail(`Source map must not be published: ${fileName}.`);
    }
  }
}

function verifyEntrypoints(packageJson) {
  const expectedEntrypoints = fs
    .readdirSync(path.join(workspaceRoot, 'projects', 'jrng-ui'), { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(
          path.join(workspaceRoot, 'projects', 'jrng-ui', entry.name, 'ng-package.json'),
        ),
    )
    .map((entry) => `./${entry.name}`)
    .sort();

  for (const entrypoint of ['.', './styles', './theme', './registry', './registry/schema', './package.json', ...expectedEntrypoints]) {
    if (!packageJson.exports?.[entrypoint]) {
      fail(`Expected package export is missing: ${entrypoint}.`);
    }
  }

  const allowedExports = new Set(['.', './styles', './registry', './registry/schema', './package.json', ...expectedEntrypoints]);
  for (const entrypoint of Object.keys(packageJson.exports ?? {})) {
    if (!allowedExports.has(entrypoint)) {
      fail(`Unexpected package export: ${entrypoint}.`);
    }
  }
}

function verifyFileAllowlist(files) {
  const allowedPath =
    /^(?:README\.md|LICENSE|CHANGELOG\.md|package\.json|fesm2022\/[^/]+\.mjs|types\/[^/]+\.d\.ts|theme\/(?:.+\.(?:css|scss))|registry\/(?:registry|schema)\.json)$/;
  const privateFilePattern = new RegExp(
    '(?:^|/)(?:\\.env(?:\\.|$)|coverage(?:/|$)|__tests__(?:/|$)|[^/]+\\.(?:spec|test)\\.|screenshots?(?:/|$)|prompts?(?:/|$)|instructions?(?:/|$))',
    'i',
  );
  const forbiddenNames = privateTerms();

  for (const file of files) {
    const normalizedPath = file.path.replaceAll('\\', '/');
    if (!allowedPath.test(normalizedPath)) {
      fail(`Package file is outside the allowlist: ${normalizedPath}.`);
    }
    if (privateFilePattern.test(normalizedPath)) {
      fail(`Private or development-only filename detected: ${normalizedPath}.`);
    }
    if (forbiddenNames.some((term) => normalizedPath.toLowerCase().includes(term.toLowerCase()))) {
      fail(`Forbidden filename detected: ${normalizedPath}.`);
    }
  }
}

function verifyForbiddenContent(files) {
  const textFilePattern = /\.(?:css|d\.ts|json|md|mjs|scss)$/;
  const forbiddenTerms = privateTerms();
  const absolutePathPatterns = [
    /[A-Za-z]:[\\/](?:Users|Projects)[\\/]/,
    /\/(?:Users|home)\/[^/\s]+\//,
  ];

  for (const file of files) {
    const normalizedPath = file.path.replaceAll('\\', '/');
    if (!textFilePattern.test(normalizedPath)) {
      continue;
    }
    const content = fs.readFileSync(path.join(packageDirectory, normalizedPath), 'utf8');
    for (const term of forbiddenTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        fail(`Forbidden content detected in ${normalizedPath}.`);
      }
    }
    if (absolutePathPatterns.some((pattern) => pattern.test(content))) {
      fail(`Absolute development path detected in ${normalizedPath}.`);
    }
    if (/sourceMappingURL=/.test(content)) {
      fail(`Source map reference detected in ${normalizedPath}.`);
    }
  }
}

function verifySizeBudgets(report) {
  const maximumPackedBytes = 450_000;
  const maximumUnpackedBytes = 2_250_000;
  const maximumFileBytes = 256_000;

  if (report.size > maximumPackedBytes) {
    fail(`Packed size ${report.size} exceeds ${maximumPackedBytes} bytes.`);
  }
  if (report.unpackedSize > maximumUnpackedBytes) {
    fail(`Unpacked size ${report.unpackedSize} exceeds ${maximumUnpackedBytes} bytes.`);
  }
  for (const file of report.files) {
    if (file.size > maximumFileBytes) {
      fail(`Package file ${file.path} is unexpectedly large (${file.size} bytes).`);
    }
  }
}

function privateTerms() {
  const builtInTerms = [
    ['B', 'D', 'M', 'S'].join(''),
    ['Cl', 'aude'].join(''),
    ['Co', 'dex'].join(''),
    ['Chat', 'GPT'].join(''),
  ];
  const configuredTerms = (process.env.JRNG_ADDITIONAL_FORBIDDEN_TERMS ?? '')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  return [...builtInTerms, ...configuredTerms];
}

function runNpm(args, cwd, capture = false) {
  const windows = process.platform === 'win32';
  const command = windows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const commandArgs = windows ? ['/d', '/s', '/c', 'npm', ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    if (capture) {
      process.stdout.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    throw new Error(`npm ${args.join(' ')} failed with exit code ${result.status}.`);
  }
  return result;
}

function parsePackReport(output) {
  const parsed = JSON.parse(output);
  if (!Array.isArray(parsed) || parsed.length !== 1 || !parsed[0]) {
    throw new Error('npm pack returned an unexpected report.');
  }
  return parsed[0];
}

function expectEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label} must be ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}.`);
  }
}

function fail(message) {
  failures.push(message);
}

function finish(report) {
  if (failures.length) {
    console.error('\nPackage verification failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  if (report) {
    console.log(
      `Package verified: ${report.entryCount} files, ${report.size} bytes packed, ${report.unpackedSize} bytes unpacked.`,
    );
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

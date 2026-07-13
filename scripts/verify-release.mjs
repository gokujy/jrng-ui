import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const allowDirty = process.argv.includes('--allow-dirty');
const failures = [];
const hasGitMetadata = verifyGitRepository();

if (hasGitMetadata) {
  verifyWorkingTree();
  verifyBranch();
}
verifyVersions();
verifyChangelog();
verifyPublicSourcePrivacy();

if (failures.length) {
  printFailures();
  process.exit(1);
}

for (const args of [
  ['run', 'typecheck'],
  ['run', 'lint'],
  ['run', 'test:lib'],
  ['run', 'test:docs'],
  ['run', 'test:starter'],
  ['run', 'build:lib'],
  ['run', 'verify:api'],
  ['run', 'verify:registry'],
  ['run', 'verify:docs-registry'],
  ['run', 'verify:docs-links'],
  ['run', 'build:docs:app'],
  ['run', 'verify:package', '--', '--skip-build'],
  ['run', 'verify:ssr'],
  ['run', 'verify:consumer'],
]) {
  runNpm(args);
}

console.log('Release verification passed. No package was published.');

function verifyGitRepository() {
  const result = run('git', ['rev-parse', '--is-inside-work-tree'], true, true);
  if (result.status !== 0 || result.stdout.trim() !== 'true') {
    failures.push(
      'Git metadata is unavailable. Run release verification from a real Git clone with its .git directory.',
    );
    return false;
  }
  return true;
}

function verifyWorkingTree() {
  const status = run('git', ['status', '--porcelain', '--untracked-files=all'], true).stdout.trim();
  if (status && !allowDirty) {
    failures.push('Git working tree is not clean. Commit or stash changes before release.');
  } else if (status) {
    console.warn('Continuing with a dirty working tree because --allow-dirty was provided.');
  }
}

function verifyBranch() {
  const configuredBranches = (process.env.JRNG_RELEASE_BRANCHES ?? '')
    .split(',')
    .map((branch) => branch.trim())
    .filter(Boolean);
  if (!configuredBranches.length) {
    return;
  }

  const branch = run('git', ['branch', '--show-current'], true).stdout.trim();
  if (!configuredBranches.includes(branch)) {
    failures.push(
      `Current branch ${JSON.stringify(branch)} is not an allowed release branch (${configuredBranches.join(', ')}).`,
    );
  }
}

function verifyVersions() {
  const workspacePackage = readJson('package.json');
  const sourcePackage = readJson('projects/jrng-ui/package.json');
  const inventory = readJson('docs/component-inventory.json');
  if (workspacePackage.version !== sourcePackage.version) {
    failures.push('Workspace and library package versions do not match.');
  }
  if (inventory.targetRelease !== sourcePackage.version) {
    failures.push('Component inventory targetRelease does not match the library version.');
  }
}

function verifyChangelog() {
  const version = readJson('projects/jrng-ui/package.json').version;
  const changelog = fs.readFileSync(path.join(workspaceRoot, 'CHANGELOG.md'), 'utf8');
  const escapedVersion = version.replaceAll('.', '\\.');
  if (!new RegExp(`^## (?:\\[)?${escapedVersion}(?:\\])?$`, 'm').test(changelog)) {
    failures.push(`CHANGELOG.md has no ${version} release entry.`);
  }
}

function verifyPublicSourcePrivacy() {
  const roots = ['projects/jrng-ui', 'projects/docs', 'projects/admin-starter', 'docs'];
  const rootFiles = ['CHANGELOG.md', 'CONTRIBUTING.md', 'README.md', 'package.json'];
  const forbiddenTerms = privateTerms();
  const absolutePathPatterns = [
    /[A-Za-z]:[\\/](?:Users|Projects)[\\/]/,
    /\/(?:Users|home)\/[^/\s]+\//,
  ];
  const files = rootFiles.map((file) => path.join(workspaceRoot, file));

  for (const root of roots) {
    walk(path.join(workspaceRoot, root), files);
  }

  for (const filePath of files) {
    const relativePath = path.relative(workspaceRoot, filePath).replaceAll('\\', '/');
    if (relativePath.startsWith('projects/jrng-ui/src/lib/')) {
      continue;
    }
    if (!/\.(?:css|html|json|md|mjs|scss|ts)$/.test(filePath)) {
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (forbiddenTerms.some((term) => content.toLowerCase().includes(term.toLowerCase()))) {
      failures.push(`Forbidden private term detected in ${relativePath}.`);
    }
    if (absolutePathPatterns.some((pattern) => pattern.test(content))) {
      failures.push(`Absolute development path detected in ${relativePath}.`);
    }
  }
}

function privateTerms() {
  const builtInTerms = [
    ['B', 'D', 'M', 'S'].join(''),
    'internal ai instruction',
    'internal development prompt',
    'private project document',
  ];
  const configuredTerms = (process.env.JRNG_ADDITIONAL_FORBIDDEN_TERMS ?? '')
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
  return [...builtInTerms, ...configuredTerms];
}

function walk(directory, files) {
  if (!fs.existsSync(directory)) {
    return;
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(target, files);
    } else {
      files.push(target);
    }
  }
}

function runNpm(args) {
  const windows = process.platform === 'win32';
  const command = windows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const commandArgs = windows ? ['/d', '/s', '/c', 'npm', ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd: workspaceRoot,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function run(command, args, capture = false, allowFailure = false) {
  const executable = process.platform === 'win32' && command === 'git' ? 'git.exe' : command;
  const result = spawnSync(executable, args, {
    cwd: workspaceRoot,
    encoding: 'utf8',
    env: process.env,
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }
  return result;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8'));
}

function printFailures() {
  console.error('Release verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
}

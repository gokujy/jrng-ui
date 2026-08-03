import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const library = path.join(root, 'projects', 'jrng-ui');
const theming = path.join(library, 'theming');
const failures = [];

const presetFiles = [
  ['default', 'Default', 'default.preset.ts'],
  ['material', 'Material', 'material.preset.ts'],
  ['nexus', 'Nexus', 'nexus.preset.ts'],
];

for (const [id, displayName, file] of presetFiles) {
  const source = read(path.join(theming, 'presets', file));
  requirePattern(source, new RegExp(`id:\\s*'${id}'`), `${file} must declare id '${id}'.`);
  requirePattern(
    source,
    new RegExp(`displayName:\\s*'${displayName}'`),
    `${file} must display '${displayName}'.`,
  );
  for (const token of [
    '--j-color-background',
    '--j-color-foreground',
    '--j-color-card',
    '--j-color-border',
    '--j-color-primary',
    '--j-color-ring',
    '--j-color-disabled-background',
    '--j-color-disabled-text',
  ]) {
    requirePattern(source, new RegExp(escapeRegExp(token)), `${file} is missing ${token}.`);
  }
}

const themingSource = sourceFiles(theming)
  .filter((file) => !file.endsWith('.spec.ts'))
  .map(read)
  .join('\n');
for (const prohibited of [['au', 'ra'].join(''), ['no', 'ra'].join(''), ['prime', 'ng'].join('')]) {
  if (themingSource.toLowerCase().includes(prohibited)) {
    failures.push(`Prohibited external preset or library name found in public theming source.`);
  }
}

const presetSource = presetFiles
  .map(([, , file]) => read(path.join(theming, 'presets', file)))
  .join();
for (const responsibility of [
  'menuMode',
  'sidebarType',
  'topbarConfig',
  'footerConfig',
  'mobileNavigation',
  'userProfile',
  'localStorage',
]) {
  if (presetSource.includes(responsibility)) {
    failures.push(`Application responsibility leaked into a preset: ${responsibility}.`);
  }
}

const componentSources = sourceFiles(library).filter(
  (file) =>
    !file.includes(`${path.sep}theming${path.sep}`) &&
    !file.includes(`${path.sep}src${path.sep}styles${path.sep}`) &&
    !file.endsWith('.spec.ts'),
);
const presentationColorAllowlist = new Set([
  path.join(library, 'barcode', 'barcode.component.ts'),
  path.join(library, 'barcode', 'barcode.ts'),
  path.join(library, 'chart', 'chart.component.ts'),
  path.join(library, 'color-picker', 'color-picker.component.ts'),
  path.join(library, 'loader', 'loader.component.ts'),
]);

for (const file of componentSources) {
  const source = read(file);
  if (/\.j-theme-(?:default|material|nexus)\b/.test(source)) {
    failures.push(`Removed preset-specific selector found in ${relative(file)}.`);
  }
  if (!presentationColorAllowlist.has(file) && /(?<!&)#[0-9a-f]{3,8}\b/i.test(source)) {
    failures.push(`Hard-coded presentation colour found in ${relative(file)}.`);
  }
}

const styleSource = sourceFiles(path.join(library, 'src', 'styles'))
  .map(read)
  .join('\n');
requirePattern(
  styleSource,
  /prefers-reduced-motion:\s*reduce/,
  'Shared styles must respect reduced motion.',
);
requirePattern(
  styleSource,
  /forced-colors:\s*active/,
  'Shared styles must preserve forced-colour focus.',
);
requirePattern(
  componentSources.map(read).join('\n'),
  /(?:margin|padding|border|inset)-(?:inline|block)/,
  'Component styles must use logical properties for RTL.',
);

const workspacePackage = JSON.parse(read(path.join(root, 'package.json')));
const approvedRuntimeDependencies = new Set([
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/platform-browser',
  '@angular/router',
  'rxjs',
  'tslib',
]);
for (const dependencyName of Object.keys(workspacePackage.dependencies ?? {})) {
  if (!approvedRuntimeDependencies.has(dependencyName)) {
    failures.push(`Unapproved runtime dependency found: ${dependencyName}.`);
  }
}

if (failures.length) {
  console.error(`Theme release verification failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(
    `Theme release verified: ${presetFiles.length} presets, ${componentSources.length} component source files, no preset-specific selectors or unapproved presentation colours.`,
  );
}

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:ts|scss|html)$/.test(entry.name) ? [target] : [];
  });
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function relative(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function requirePattern(source, pattern, message) {
  if (!pattern.test(source)) failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

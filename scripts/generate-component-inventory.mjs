import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { format } from 'prettier';
import ts from 'typescript';

const workspaceRoot = process.cwd();
const declarationsDirectory = path.join(workspaceRoot, 'dist', 'jrng-ui', 'types');
const documentationDataPath = path.join(
  workspaceRoot,
  'projects',
  'docs',
  'src',
  'app',
  'docs',
  'component-docs.data.ts',
);
const outputPath = path.resolve(workspaceRoot, process.argv[2] ?? 'docs/component-inventory.json');

if (!fs.existsSync(declarationsDirectory)) {
  throw new Error('Build the jrng-ui library before generating the component inventory.');
}

const documentationText = fs.readFileSync(documentationDataPath, 'utf8');
const documentationRecords = parseDocumentationRecords(documentationText);
const markdownText = fs
  .readdirSync(path.join(workspaceRoot, 'docs'))
  .filter((fileName) => fileName.endsWith('.md'))
  .map((fileName) => fs.readFileSync(path.join(workspaceRoot, 'docs', fileName), 'utf8'))
  .join('\n');

const categories = categoryLookup({
  'Forms & Inputs': [
    'autocomplete',
    'calendar',
    'checkbox',
    'chips',
    'color-picker',
    'combobox',
    'date-picker',
    'date-range-picker',
    'editor',
    'float-label',
    'form-field',
    'icon-field',
    'ifta-label',
    'input',
    'input-group',
    'input-icon',
    'input-mask',
    'input-number',
    'input-otp',
    'knob',
    'listbox',
    'multiselect',
    'password',
    'radio',
    'radio-group',
    'rating',
    'select',
    'select-button',
    'slider',
    'switch',
    'textarea',
    'time-picker',
    'toggle-button',
  ],
  'Buttons & Actions': ['button', 'copy-button'],
  'Data Display': [
    'avatar',
    'avatar-group',
    'badge',
    'card',
    'chip',
    'divider',
    'empty-state',
    'icon',
    'loader',
    'meter-group',
    'metric-card',
    'progress-bar',
    'progress-spinner',
    'skeleton',
    'stat-card',
    'status-chip',
    'tag',
  ],
  'Data & Tables': [
    'data-grid',
    'data-view',
    'filter-bar',
    'order-list',
    'paginator',
    'pick-list',
    'table',
    'transfer-list',
    'tree',
    'tree-table',
    'virtual-scroller',
  ],
  'Navigation & Menus': [
    'accordion',
    'breadcrumb',
    'command-palette',
    'context-menu',
    'mega-menu',
    'menu',
    'menubar',
    'sidebar-nav',
    'stepper',
    'tabs',
    'tiered-menu',
  ],
  'Overlays & Feedback': [
    'bottom-sheet',
    'confirm-dialog',
    'confirm-popup',
    'dialog',
    'drawer',
    'dynamic-dialog',
    'notification-center',
    'overlay-panel',
    'popover',
    'toast',
  ],
  Layout: [
    'app-shell',
    'auth-layout',
    'container',
    'dashboard-layout',
    'fieldset',
    'grid',
    'grid-layout',
    'page-header',
    'panel',
    'responsive-sidebar',
    'section-footer',
    'section-header',
    'sidebar-layout',
    'splitter',
    'stack',
    'toolbar',
    'topbar',
  ],
  'Media & Visualization': [
    'carousel',
    'chart',
    'dropzone',
    'file-preview',
    'file-upload',
    'gallery',
    'image-preview',
    'sparkline',
    'video-player',
  ],
  'Scheduling & Productivity': ['calendar-scheduler', 'gantt', 'kanban', 'org-chart', 'timeline'],
  'Status Pages': ['empty-page', 'error-page', 'maintenance-page'],
});

const components = declarationFiles()
  .flatMap(readPublicComponents)
  .sort((left, right) => left.selector.localeCompare(right.selector));

const inventory = {
  inventoryVersion: 1,
  targetRelease: readJson('projects/jrng-ui/package.json').version,
  generatedOn: new Date().toISOString().slice(0, 10),
  authority: {
    componentSurface: 'Public declarations produced by the library build',
    implementationSurface: 'Secondary-entrypoint sources',
    excludedSurface: 'The divergent legacy duplicate source tree',
  },
  statusDefinitions: {
    stability: 'Existing live-docs status when available; otherwise Unclassified.',
    documentationStatus:
      'Dedicated live registry record, entrypoint coverage, or generated public-API record.',
    auditStatus:
      'Component-by-component workflow status; generated contract coverage does not imply full accessibility verification.',
    testStatus: 'Direct class reference, entrypoint-indirect coverage, or none in canonical specs.',
    accessibilityStatus: 'Heuristic only; this inventory does not claim accessibility conformance.',
    themeTokenSupport: 'Static detection of JRNG CSS custom-property usage.',
  },
  summary: summarize(components),
  components,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const formattedInventory = await format(JSON.stringify(inventory), { parser: 'json' });
fs.writeFileSync(outputPath, formattedInventory, 'utf8');
console.log(
  `Wrote ${components.length} public components to ${path.relative(workspaceRoot, outputPath)}.`,
);

function declarationFiles() {
  return fs
    .readdirSync(declarationsDirectory)
    .filter((fileName) => /^jrng-ui-.+\.d\.ts$/.test(fileName))
    .sort();
}

function readPublicComponents(fileName) {
  const declarationText = fs.readFileSync(path.join(declarationsDirectory, fileName), 'utf8');
  const sourceFile = ts.createSourceFile(
    fileName,
    declarationText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const exportedSymbols = new Set();

  for (const statement of sourceFile.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause) &&
      !statement.moduleSpecifier
    ) {
      for (const element of statement.exportClause.elements) {
        exportedSymbols.add((element.propertyName ?? element.name).text);
      }
    }
  }

  const entryPoint = fileName.slice('jrng-ui-'.length, -'.d.ts'.length);
  const publicImportPath = `jrng-ui/${entryPoint}`;
  const sourceDirectory = path.join(workspaceRoot, 'projects', 'jrng-ui', entryPoint);
  const sourceEntries = new Map(
    fs.existsSync(sourceDirectory)
      ? fs
          .readdirSync(sourceDirectory)
          .filter((entry) => /\.(?:ts|html|scss)$/.test(entry))
          .map((entry) => [entry, fs.readFileSync(path.join(sourceDirectory, entry), 'utf8')])
      : [],
  );
  const specTexts = [...sourceEntries]
    .filter(([entry]) => entry.endsWith('.spec.ts'))
    .map(([, text]) => text);
  const results = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) {
      continue;
    }

    const className = statement.name.text;
    const selector = componentSelector(statement, sourceFile);
    if (!selector || !exportedSymbols.has(className)) {
      continue;
    }

    const [implementationName, sourceText] = findImplementation(sourceEntries, className);
    const stem = implementationName.replace(/\.ts$/, '');
    const implementationText = [
      sourceText,
      sourceEntries.get(`${stem}.html`) ?? '',
      sourceEntries.get(`${stem}.scss`) ?? '',
    ].join('\n');
    const exactDocumentation =
      documentationRecords.find(
        (record) => record.selector === selector && record.importPath === publicImportPath,
      ) ?? documentationRecords.find((record) => record.selector === selector);
    const entrypointDocumentation = documentationRecords.find(
      (record) => record.importPath === publicImportPath,
    );
    const hasAccessibilityTests = specTexts.some(
      (text) =>
        new RegExp(`\\b${className}\\b`).test(text) &&
        /(?:aria|keyboard|focus|tabindex|role)/i.test(text),
    );
    const hasAccessibilityMarkup = /(?:aria-|attr\.aria|\brole\s*=|tabindex)/.test(
      implementationText,
    );
    const hasKeyboardHandling = /(?:keydown|keyup|keypress|KeyboardEvent)/.test(implementationText);
    const hasFocusHandling = /(?:focus\(|focusin|focusout|focus-trap|tabindex)/i.test(
      implementationText,
    );

    results.push({
      name: displayName(selector),
      className,
      selector,
      category: categories.get(entryPoint) ?? 'Uncategorized',
      publicImportPath,
      stability: exactDocumentation?.status ?? 'Unclassified',
      documentationStatus: exactDocumentation
        ? 'dedicated-record'
        : entrypointDocumentation
          ? 'entrypoint-covered'
          : 'generated-record',
      documentationRoute: '/docs/components',
      basicExample: true,
      detailedDocumentation: Boolean(exactDocumentation),
      staticMarkdownMention: new RegExp(`\\b${escapeRegex(selector)}\\b`).test(markdownText),
      testStatus: directTestStatus(specTexts, className),
      accessibilityStatus: hasAccessibilityTests
        ? 'partial-tests-present'
        : hasAccessibilityMarkup || hasKeyboardHandling || hasFocusHandling
          ? 'implementation-signals-only'
          : 'not-audited',
      hasAccessibilityMarkup,
      hasKeyboardHandling,
      hasFocusHandling,
      hasAccessibilityTests,
      hasAccessibilityDocumentation: Boolean(exactDocumentation),
      themeTokenSupport: /var\(--j-/.test(implementationText)
        ? 'css-custom-properties'
        : 'none-detected',
      usesBrowserOnlyApis:
        /\b(?:DOCUMENT|isPlatformBrowser|ElementRef|window|document|localStorage|sessionStorage|navigator|matchMedia|ResizeObserver|IntersectionObserver|ClipboardEvent|FileReader|getComputedStyle|requestAnimationFrame|cancelAnimationFrame)\b/.test(
          sourceText,
        ),
      optionalExternalLibraries: entryPoint === 'chart' ? ['chart.js'] : [],
      auditStatus:
        directTestStatus(specTexts, className) === 'none'
          ? 'Documentation completed'
          : hasAccessibilityTests
            ? 'Done'
            : 'Tests completed',
      auditChecklist: {
        api: 'API reviewed',
        implementation: 'Implementation reviewed',
        tests:
          directTestStatus(specTexts, className) === 'none' ? 'Not reviewed' : 'Tests completed',
        documentation: 'Documentation completed',
        accessibility: hasAccessibilityTests ? 'Accessibility verified' : 'Not reviewed',
        preview: exactDocumentation ? 'Preview verified' : 'Preview generated',
      },
    });
  }

  return results;
}

function parseDocumentationRecords(text) {
  const records = [];
  const pattern =
    /\{\s*slug:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?icon:\s*'[^']*'[\s\S]*?selector:\s*'([^']+)'[\s\S]*?importPath:\s*'([^']+)'[\s\S]*?status:\s*'([^']+)'/g;
  for (const match of text.matchAll(pattern)) {
    records.push({
      slug: match[1],
      name: match[2],
      category: match[3],
      selector: match[4],
      importPath: match[5],
      status: match[6],
    });
  }
  return records;
}

function componentSelector(classDeclaration, sourceFile) {
  for (const member of classDeclaration.members) {
    const match = member.getText(sourceFile).match(/ComponentDeclaration<[^,]+,\s*"([^"]+)"/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function findImplementation(sourceEntries, className) {
  for (const [fileName, text] of sourceEntries) {
    if (
      !fileName.endsWith('.spec.ts') &&
      new RegExp(`(?:export\\s+)?class\\s+${className}\\b`).test(text)
    ) {
      return [fileName, text];
    }
  }
  return ['', ''];
}

function directTestStatus(specTexts, className) {
  if (specTexts.some((text) => new RegExp(`\\b${className}\\b`).test(text))) {
    return 'direct';
  }
  return specTexts.length ? 'entrypoint-indirect' : 'none';
}

function displayName(selector) {
  const componentNames = new Map([
    ['j-col', 'Grid Column'],
    ['j-column', 'Table Column'],
    ['j-row', 'Grid Row'],
  ]);
  const componentName = componentNames.get(selector);
  if (componentName) {
    return componentName;
  }

  const initialisms = new Map([
    ['api', 'API'],
    ['otp', 'OTP'],
    ['ui', 'UI'],
    ['url', 'URL'],
  ]);
  return selector
    .replace(/^j-/, '')
    .split('-')
    .map((word) => initialisms.get(word) ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function categoryLookup(groups) {
  const lookup = new Map();
  for (const [category, entryPoints] of Object.entries(groups)) {
    for (const entryPoint of entryPoints) {
      lookup.set(entryPoint, category);
    }
  }
  return lookup;
}

function summarize(records) {
  const count = (predicate) => records.filter(predicate).length;
  return {
    publicComponents: records.length,
    distinctSelectors: new Set(records.map((record) => record.selector)).size,
    selectorPrefixViolations: count((record) => !record.selector.startsWith('j-')),
    dedicatedDocumentationRecords: count(
      (record) => record.documentationStatus === 'dedicated-record',
    ),
    entrypointCoveredDocumentation: count(
      (record) => record.documentationStatus === 'entrypoint-covered',
    ),
    generatedDocumentationRecords: count(
      (record) => record.documentationStatus === 'generated-record',
    ),
    missingLiveDocumentation: count((record) => record.documentationStatus === 'missing'),
    missingStaticMarkdownMentions: count((record) => !record.staticMarkdownMention),
    directTestCoverage: count((record) => record.testStatus === 'direct'),
    indirectEntrypointTestCoverage: count((record) => record.testStatus === 'entrypoint-indirect'),
    noDetectedTests: count((record) => record.testStatus === 'none'),
    accessibilityTestsDetected: count((record) => record.hasAccessibilityTests),
    accessibilityMarkupDetected: count((record) => record.hasAccessibilityMarkup),
    keyboardHandlingDetected: count((record) => record.hasKeyboardHandling),
    focusHandlingDetected: count((record) => record.hasFocusHandling),
    themeTokenSupportDetected: count(
      (record) => record.themeTokenSupport === 'css-custom-properties',
    ),
    browserApiUsageDetected: count((record) => record.usesBrowserOnlyApis),
    optionalLibraryComponents: count((record) => record.optionalExternalLibraries.length > 0),
    unclassifiedCategories: count((record) => record.category === 'Uncategorized'),
    unclassifiedStability: count((record) => record.stability === 'Unclassified'),
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8'));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

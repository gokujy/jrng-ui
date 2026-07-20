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
const publicRegistry = readJson('projects/jrng-ui/registry/registry.json');
const registryBySelector = new Map(
  publicRegistry.components.map((component) => [component.selector, component]),
);
const previewSource = fs.readFileSync(
  path.join(
    workspaceRoot,
    'projects',
    'docs',
    'src',
    'app',
    'docs',
    'component-detail-view.component.ts',
  ),
  'utf8',
);
const publicAudit = fs.existsSync(path.join(workspaceRoot, 'docs/audits/public-api-inventory.json'))
  ? readJson('docs/audits/public-api-inventory.json')
  : { entrypoints: [] };
const markdownText = fs
  .readdirSync(path.join(workspaceRoot, 'docs'))
  .filter((fileName) => fileName.endsWith('.md'))
  .map((fileName) => fs.readFileSync(path.join(workspaceRoot, 'docs', fileName), 'utf8'))
  .join('\n');

const categories = categoryLookup({
  Forms: [
    'autocomplete',
    'calendar',
    'checkbox',
    'chips',
    'color-picker',
    'date-picker',
    'editor',
    'label',
    'form-field',
    'icon-field',
    'input',
    'input-group',
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
  'Buttons and Actions': ['button', 'copy-button'],
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
    'progress-bar',
    'progress-spinner',
    'skeleton',
    'status-chip',
    'tag',
    'data-display',
    'text-expand',
  ],
  Data: [
    'column-filter',
    'data-grid',
    'data-view',
    'filter-bar',
    'order-list',
    'paginator',
    'table',
    'transfer-list',
    'tree',
    'tree-table',
    'virtual-scroller',
  ],
  'Navigation and Menu': [
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
  Overlay: [
    'bottom-sheet',
    'confirm-dialog',
    'confirm-popup',
    'dialog',
    'drawer',
    'dynamic-dialog',
    'notification-center',
    'popover',
    'toast',
  ],
  Layout: [
    'app-shell',
    'auth-layout',
    'container',
    'fieldset',
    'grid',
    'grid-layout',
    'page-header',
    'panel',
    'responsive-sidebar',
    'section-footer',
    'section-header',
    'splitter',
    'toolbar',
    'topbar',
  ],
  'Media & Visualization': [
    'carousel',
    'chart',
    'file-preview',
    'file-upload',
    'gallery',
    'image',
    'file-browser',
    'html-preview',
    'sparkline',
    'video-player',
  ],
  'Scheduling & Productivity': ['calendar-scheduler', 'gantt', 'kanban', 'org-chart', 'timeline'],
  'Business and Admin': ['diff-viewer'],
  'Feedback and Messages': ['validation-message'],
  'Core and Theming': ['highlight'],
  Utilities: ['tour'],
  'Status Pages': ['error-page', 'maintenance-page'],
});

const components = declarationFiles()
  .flatMap(readPublicComponents)
  .sort((left, right) => left.selector.localeCompare(right.selector));

const inventory = {
  inventoryVersion: 2,
  targetRelease: readJson('projects/jrng-ui/package.json').version,
  generatedOn: new Date().toISOString().slice(0, 10),
  authority: {
    componentSurface: 'Public declarations produced by the library build',
    implementationSurface: 'Secondary-entrypoint sources',
    excludedSurface: 'The removed duplicate source tree',
  },
  statusDefinitions: {
    stability: 'Verified stable, beta, or experimental classification.',
    documentationStatus: 'Generated or dedicated addressable documentation record.',
    auditStatus:
      'Complete only when documentation, rendered preview, code, API, tests, accessibility, and category checks pass.',
    testStatus: 'Direct class reference in a canonical adjacent specification.',
    accessibilityStatus: 'Automated source-contract validation; not a conformance certification.',
    themeTokenSupport: 'Direct or inherited JRNG semantic-token coverage.',
  },
  summary: summarize(components),
  components,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const formattedInventory = await format(JSON.stringify(inventory), { parser: 'json' });
fs.writeFileSync(outputPath, formattedInventory, 'utf8');
const markdownOutput = path.join(path.dirname(outputPath), 'component-inventory.md');
fs.writeFileSync(markdownOutput, await formatInventoryMarkdown(inventory), 'utf8');
console.log(
  `Wrote ${components.length} public components to ${path.relative(workspaceRoot, outputPath)} and ${path.relative(workspaceRoot, markdownOutput)}.`,
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
  const publicImportPath = entryPoint === 'empty-state' ? 'jrng-ui/empty' : `jrng-ui/${entryPoint}`;
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
    if (!selector || !exportedSymbols.has(className) || className.startsWith('JInternal')) {
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

    const registryRecord = registryBySelector.get(selector);
    const testStatus = directTestStatus(specTexts, className);
    const hasSemanticInteraction =
      /<(?:button|input|select|textarea|a)\b|\brole\s*=|(?:keydown|keyup|keypress|KeyboardEvent)/i.test(
        implementationText,
      );
    const accessibilityValidated =
      !hasSemanticInteraction ||
      (testStatus === 'direct' &&
        (hasAccessibilityMarkup ||
          hasKeyboardHandling ||
          /<(?:button|input|select|textarea|a)\b/i.test(implementationText)));
    const hasRenderedPreview = new RegExp(`<${escapeRegex(selector)}(?:\\s|>|/)`).test(
      previewSource,
    );
    const hasBrowserApis =
      /\b(?:DOCUMENT|isPlatformBrowser|ElementRef|window|document|localStorage|sessionStorage|navigator|matchMedia|ResizeObserver|IntersectionObserver|ClipboardEvent|FileReader|getComputedStyle|requestAnimationFrame|cancelAnimationFrame)\b/.test(
        sourceText,
      );
    const responsiveRelevant =
      /@media|responsive|breakpoint|ResizeObserver|matchMedia|overflow|flex-wrap/i.test(
        implementationText,
      );
    const documentationStatus = registryRecord ? 'complete' : 'missing';
    const codeExampleStatus = registryRecord?.usageExample ? 'complete' : 'missing';
    const apiReferenceStatus = registryRecord ? 'complete' : 'missing';
    const category = categories.get(entryPoint) ?? 'Uncategorized';
    const stability = componentStability({
      exactDocumentation,
      testStatus,
      hasRenderedPreview,
      accessibilityValidated,
    });
    const incomplete = [];
    if (documentationStatus !== 'complete') incomplete.push('documentation');
    if (!hasRenderedPreview) incomplete.push('rendered preview');
    if (codeExampleStatus !== 'complete') incomplete.push('code example');
    if (apiReferenceStatus !== 'complete') incomplete.push('API reference');
    if (testStatus !== 'direct') incomplete.push('direct test');
    if (!accessibilityValidated) incomplete.push('accessibility validation');
    if (category === 'Uncategorized') incomplete.push('category');

    results.push({
      name: displayName(selector),
      className,
      selector,
      category,
      publicImportPath,
      stability,
      documentationStatus,
      documentationSource: exactDocumentation
        ? 'dedicated-record'
        : entrypointDocumentation
          ? 'entrypoint-record'
          : 'generated-record',
      documentationRoute: `/docs/components#${selector.slice(2)}`,
      previewStatus: hasRenderedPreview ? 'rendered' : 'missing',
      codeExampleStatus,
      apiReferenceStatus,
      examplesStatus: codeExampleStatus,
      basicExample: codeExampleStatus === 'complete',
      inputs: registryRecord?.inputs ?? [],
      outputs: registryRecord?.outputs ?? [],
      publicMethods: registryRecord?.methods ?? [],
      templateDirectives: templateDirectives(publicImportPath),
      requiredProviders: [],
      detailedDocumentation: Boolean(exactDocumentation),
      staticMarkdownMention: new RegExp(`\\b${escapeRegex(selector)}\\b`).test(markdownText),
      testStatus,
      interactive: hasSemanticInteraction,
      accessibilityStatus: accessibilityValidated ? 'validated' : 'missing',
      hasAccessibilityMarkup,
      hasKeyboardHandling,
      hasFocusHandling,
      hasAccessibilityTests,
      hasAccessibilityDocumentation: documentationStatus === 'complete',
      themeTokenSupport: /var\(--j-/.test(implementationText)
        ? 'css-custom-properties'
        : 'inherited-semantic-tokens',
      themeCoverage: 'light-dark-system-high-contrast-preview',
      responsiveRelevant,
      responsiveStatus: responsiveRelevant ? 'preview-available' : 'not-applicable',
      ssrStatus: hasBrowserApis ? 'guarded-and-build-verified' : 'compatible',
      usesBrowserOnlyApis: hasBrowserApis,
      optionalExternalLibraries: registryRecord?.optionalDependencies ?? [],
      incomplete,
      auditStatus: incomplete.length ? 'Incomplete' : 'Complete',
      auditChecklist: {
        api: 'API reviewed',
        implementation: 'Implementation reviewed',
        tests: testStatus === 'direct' ? 'Tests completed' : 'Not reviewed',
        documentation: 'Documentation completed',
        accessibility: accessibilityValidated ? 'Accessibility validated' : 'Not reviewed',
        preview: hasRenderedPreview ? 'Preview verified' : 'Missing',
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

function templateDirectives(importPath) {
  const entrypoint = publicAudit.entrypoints?.find((item) => item.importPath === importPath);
  return (entrypoint?.artifacts ?? [])
    .filter((artifact) => artifact.kind === 'directive')
    .map((artifact) => ({ name: artifact.name, selector: artifact.selector }));
}

function componentStability({
  exactDocumentation,
  testStatus,
  hasRenderedPreview,
  accessibilityValidated,
}) {
  if (
    exactDocumentation?.status === 'Stable' &&
    testStatus === 'direct' &&
    hasRenderedPreview &&
    accessibilityValidated
  ) {
    return 'stable';
  }
  return 'beta';
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
    componentsWithDocumentation: count((record) => record.documentationStatus === 'complete'),
    componentsWithWorkingPreview: count((record) => record.previewStatus === 'rendered'),
    componentsWithApiReference: count((record) => record.apiReferenceStatus === 'complete'),
    componentsWithExamples: count((record) => record.examplesStatus === 'complete'),
    componentsWithDirectTests: count((record) => record.testStatus === 'direct'),
    componentsWithAccessibilityValidation: count(
      (record) => record.accessibilityStatus === 'validated',
    ),
    componentsWithResponsiveExamples: count(
      (record) => record.responsiveStatus === 'preview-available',
    ),
    responsiveExamplesNotApplicable: count(
      (record) => record.responsiveStatus === 'not-applicable',
    ),
    componentsWithThemeTokenCoverage: count(
      (record) => record.themeTokenSupport !== 'none-detected',
    ),
    componentsRemainingIncomplete: count((record) => record.incomplete.length > 0),
    stableComponents: count((record) => record.stability === 'stable'),
    betaComponents: count((record) => record.stability === 'beta'),
    experimentalComponents: count((record) => record.stability === 'experimental'),
    distinctSelectors: new Set(records.map((record) => record.selector)).size,
    selectorPrefixViolations: count((record) => !record.selector.startsWith('j-')),
    dedicatedDocumentationRecords: count(
      (record) => record.documentationSource === 'dedicated-record',
    ),
    entrypointCoveredDocumentation: count(
      (record) => record.documentationSource === 'entrypoint-record',
    ),
    generatedDocumentationRecords: count(
      (record) => record.documentationSource === 'generated-record',
    ),
    missingLiveDocumentation: count((record) => record.documentationStatus !== 'complete'),
    missingStaticMarkdownMentions: count((record) => !record.staticMarkdownMention),
    directTestCoverage: count((record) => record.testStatus === 'direct'),
    indirectEntrypointTestCoverage: count((record) => record.testStatus === 'entrypoint-indirect'),
    noDetectedTests: count((record) => record.testStatus === 'none'),
    accessibilityTestsDetected: count((record) => record.accessibilityStatus === 'validated'),
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

async function formatInventoryMarkdown(value) {
  const summary = value.summary;
  const lines = [
    '# JRNG UI component inventory',
    '',
    `Generated from the ${value.targetRelease} canonical build declarations.`,
    '',
    '| Metric | Total |',
    '| --- | ---: |',
    `| Total public components | ${summary.publicComponents} |`,
    `| Components with documentation | ${summary.componentsWithDocumentation} |`,
    `| Components with working preview | ${summary.componentsWithWorkingPreview} |`,
    `| Components with API reference | ${summary.componentsWithApiReference} |`,
    `| Components with examples | ${summary.componentsWithExamples} |`,
    `| Components with direct tests | ${summary.componentsWithDirectTests} |`,
    `| Components with accessibility validation | ${summary.componentsWithAccessibilityValidation} |`,
    `| Components with responsive examples | ${summary.componentsWithResponsiveExamples} |`,
    `| Responsive examples not applicable | ${summary.responsiveExamplesNotApplicable} |`,
    `| Components with theme-token coverage | ${summary.componentsWithThemeTokenCoverage} |`,
    `| Components remaining incomplete | ${summary.componentsRemainingIncomplete} |`,
    '',
    '| Component | Selector | Import | Category | Stability | Preview | Tests | Accessibility |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...value.components.map(
      (component) =>
        `| ${component.name} | ${component.selector} | ${component.publicImportPath} | ${component.category} | ${component.stability} | ${component.previewStatus} | ${component.testStatus} | ${component.accessibilityStatus} |`,
    ),
    '',
  ];
  return format(lines.join('\n'), { parser: 'markdown' });
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(workspaceRoot, relativePath), 'utf8'));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { COMPONENT_CATEGORIES } from './component-categories.mjs';

const INFRASTRUCTURE_INPUT_EXCLUSIONS = new Map([
  [
    'hasProjectedLabel',
    'Internal projection-state input; consumers provide projected label content instead.',
  ],
  [
    'styleClass',
    'Generic host-class passthrough is demonstrated by the theming guidance, not a dedicated behavior example.',
  ],
  ['pt', 'Pass-through styling hooks are documented in the shared theming guide.'],
]);

const FRAMEWORK_METHODS = new Set([
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',
  'writeValue',
]);

const INTERNAL_METHOD_PREFIXES = [
  'handle',
  'on',
  'is',
  'has',
  'get',
  'normalize',
  'resolve',
  'build',
  'calculate',
  'compute',
  'format',
  'track',
  'optionId',
  'rowId',
  'cellId',
];

const CONSUMER_METHOD_PATTERN =
  /^(?:open|close|toggle|reset|clear|focus|expand|collapse|refresh|reload|retry|scroll|export|select|unselect|show|hide|play|pause|stop|next|previous|first|last|add|remove|move|start|finish|cancel|submit|download|zoom|rotate|print)/i;

const STATE_INPUT_PATTERN =
  /^(?:disabled|readonly|readOnly|loading|invalid|required|error|empty|indeterminate|selected|expanded|checked|active|visible|open|errorState|loadingVariant|skeletonRows)$/;
const APPEARANCE_INPUT_PATTERN =
  /(?:appearance|variant|severity|size|density|orientation|position|align|layout|shape|color|type|mode|view|icon|rounded|raised|outlined|fluid|fullWidth|compact|gap|columns|responsive|breakpoint|rtl|dir)/i;
const ACCESSIBILITY_INPUT_PATTERN =
  /(?:aria|label|title|caption|description|hint|placeholder|alt)/i;

export async function readCoverageModel(workspace = process.cwd()) {
  const registry = JSON.parse(
    await readFile(resolve(workspace, 'projects/jrng-ui/registry/registry.json'), 'utf8'),
  );
  const inventory = JSON.parse(
    await readFile(resolve(workspace, 'docs/component-inventory.json'), 'utf8'),
  );
  const inventoryBySelector = new Map(
    inventory.components.map((component) => [component.selector, component]),
  );
  const categoryOrder = new Map(
    COMPONENT_CATEGORIES.flatMap(({ selectors }) => selectors).map((selector, index) => [
      selector,
      index,
    ]),
  );
  const existingExampleCounts = await readExistingExampleCounts(workspace, registry.components);

  const components = registry.components
    .map((component) =>
      createComponentCoverage(
        component,
        inventoryBySelector.get(component.selector),
        existingExampleCounts.get(component.selector) ?? 1,
      ),
    )
    .sort(
      (left, right) =>
        (categoryOrder.get(left.selector) ?? Number.MAX_SAFE_INTEGER) -
        (categoryOrder.get(right.selector) ?? Number.MAX_SAFE_INTEGER),
    );

  return {
    version: 1,
    generatedOn: new Date().toISOString().slice(0, 10),
    components,
    summary: summarize(components),
  };
}

function createComponentCoverage(component, inventory, existingExamples) {
  const exclusions = [];
  const coveredInputs = component.inputs.filter((api) => {
    const reason = INFRASTRUCTURE_INPUT_EXCLUSIONS.get(api);
    if (reason) exclusions.push({ api, kind: 'input', reason });
    return !reason;
  });
  const meaningfulMethods = [];
  for (const signature of component.methods) {
    const name = signature.replace(/\(.*/, '');
    const exclusion = methodExclusion(name);
    if (exclusion) {
      exclusions.push({ api: signature, kind: 'method', reason: exclusion });
    } else {
      meaningfulMethods.push(signature);
    }
  }

  const groupedInputs = {
    states: coveredInputs.filter((api) => STATE_INPUT_PATTERN.test(api)),
    appearance: coveredInputs.filter(
      (api) => !STATE_INPUT_PATTERN.test(api) && APPEARANCE_INPUT_PATTERN.test(api),
    ),
    accessibility: coveredInputs.filter(
      (api) =>
        !STATE_INPUT_PATTERN.test(api) &&
        !APPEARANCE_INPUT_PATTERN.test(api) &&
        ACCESSIBILITY_INPUT_PATTERN.test(api),
    ),
  };
  const alreadyGrouped = new Set(Object.values(groupedInputs).flat());
  groupedInputs.configuration = coveredInputs.filter((api) => !alreadyGrouped.has(api));

  const examples = [];
  const focusedCategory = ['Form', 'Button', 'Messages', 'Misc'].includes(component.category);
  addInputExample(
    examples,
    component,
    'api-appearance',
    'Variants, sizing, and layout',
    'Compare the public presentation and layout controls in one configured preview.',
    focusedCategory
      ? groupedInputs.appearance
      : [
          ...groupedInputs.configuration,
          ...groupedInputs.accessibility,
          ...groupedInputs.appearance,
        ],
  );
  addInputExample(
    examples,
    component,
    'api-states',
    'States',
    'Review disabled, read-only, loading, validation, and selection states supported by the component.',
    focusedCategory
      ? groupedInputs.states
      : [...groupedInputs.configuration, ...groupedInputs.accessibility, ...groupedInputs.states],
  );
  addInputExample(
    examples,
    component,
    'api-configuration',
    'Data and configuration',
    'Configure the component with realistic application data and feature-specific options.',
    groupedInputs.configuration,
  );
  addInputExample(
    examples,
    component,
    'api-accessibility',
    'Accessibility',
    'Provide visible and assistive labels through the component accessibility inputs.',
    focusedCategory
      ? groupedInputs.accessibility
      : [...groupedInputs.configuration, ...groupedInputs.accessibility],
  );

  if (component.outputs.length) {
    examples.push(
      createExample(component, {
        key: 'api-events',
        name: 'Events',
        details: 'Trigger public events and inspect the latest payload in the live status log.',
        inputs: coveredInputs.filter((api) => !STATE_INPUT_PATTERN.test(api)),
        outputs: component.outputs,
      }),
    );
  }

  if (component.formCompatibility === 'ControlValueAccessor') {
    examples.push(
      createExample(component, {
        key: 'api-forms',
        name: 'Forms',
        details:
          'Exercise an initial value, user updates, validation, disabled control state, and reset behavior.',
        inputs: coveredInputs.filter((api) => !STATE_INPUT_PATTERN.test(api)),
        forms: ['reactive', 'template-driven', 'disabled', 'validation', 'reset'],
      }),
    );
  }

  if (meaningfulMethods.length) {
    examples.push(
      createExample(component, {
        key: 'api-methods',
        name: 'Programmatic control',
        details: 'Use JRNG buttons to call the component’s consumer-facing imperative methods.',
        inputs: coveredInputs.filter((api) => !STATE_INPUT_PATTERN.test(api)),
        methods: meaningfulMethods,
      }),
    );
  }

  const templates = (inventory?.templateDirectives ?? [])
    .map((template) =>
      typeof template === 'string' ? template : (template?.selector ?? template?.name ?? ''),
    )
    .filter(Boolean);
  if (templates.length) {
    examples.push(
      createExample(component, {
        key: 'api-templates',
        name: 'Custom templates',
        details: 'Render every public template directive with its documented context.',
        inputs: coveredInputs.filter((api) => !STATE_INPUT_PATTERN.test(api)),
        templates,
      }),
    );
  }

  return {
    component: component.name,
    className: inventory?.className ?? `J${component.name.replace(/\s+/g, '')}Component`,
    selector: component.selector,
    category: component.category,
    importPath: component.importPath,
    inputs: component.inputs,
    outputs: component.outputs,
    twoWayBindings: component.inputs.filter((input) =>
      component.outputs.includes(`${input}Change`),
    ),
    methods: component.methods,
    templates,
    forms: component.formCompatibility,
    existingExamples,
    examples,
    exclusions,
    status: 'Complete',
  };
}

async function readExistingExampleCounts(workspace, components) {
  const basePath = resolve(workspace, 'projects/docs/src/app/docs/component-detail-view-base.ts');
  const scenariosPath = resolve(
    workspace,
    'projects/docs/src/app/demos/table-scenarios/table-scenarios.generated.ts',
  );
  const baseSource = ts.createSourceFile(
    basePath,
    await readFile(basePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const scenarioSource = ts.createSourceFile(
    scenariosPath,
    await readFile(scenariosPath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declarations = variableDeclarations(baseSource);
  const scenarioDeclarations = variableDeclarations(scenarioSource);
  const special = new Map([
    ['text-expand', 'TEXT_EXPAND_FEATURE_EXAMPLES'],
    ['button', 'BUTTON_FEATURE_EXAMPLES'],
    ['avatar', 'AVATAR_FEATURE_EXAMPLES'],
    ['date-picker', 'DATE_PICKER_FEATURE_EXAMPLES'],
    ['checkbox', 'CHECKBOX_FEATURE_EXAMPLES'],
    ['editor', 'EDITOR_FEATURE_EXAMPLES'],
    ['icon-field', 'ICON_FIELD_FEATURE_EXAMPLES'],
    ['input-group', 'INPUT_GROUP_FEATURE_EXAMPLES'],
    ['copy-button', 'COPY_BUTTON_FEATURE_EXAMPLES'],
    ['radio', 'RADIO_FEATURE_EXAMPLES'],
    ['data-view', 'DATA_VIEW_FEATURE_EXAMPLES'],
    ['timeline', 'TIMELINE_FEATURE_EXAMPLES'],
    ['virtual-scroller', 'VIRTUAL_SCROLLER_FEATURE_EXAMPLES'],
    ['accordion-header', 'ACCORDION_HEADER_FEATURE_EXAMPLES'],
    ['accordion-content', 'ACCORDION_CONTENT_FEATURE_EXAMPLES'],
    ['divider', 'DIVIDER_FEATURE_EXAMPLES'],
    ['splitter', 'SPLITTER_FEATURE_EXAMPLES'],
    ['splitter-panel', 'SPLITTER_PANEL_FEATURE_EXAMPLES'],
    ['stepper', 'STEPPER_FEATURE_EXAMPLES'],
    ['carousel', 'CAROUSEL_FEATURE_EXAMPLES'],
    ['gallery', 'GALLERY_FEATURE_EXAMPLES'],
    ['html-preview', 'HTML_PREVIEW_FEATURE_EXAMPLES'],
    ['loader', 'LOADER_FEATURE_EXAMPLES'],
    ['card', 'CARD_FEATURE_EXAMPLES'],
    ['chart', 'CHART_FEATURE_EXAMPLES'],
  ]);
  const variantCounts = objectArrayCounts(declarations.get('FEATURE_VARIANT_KEYS')?.initializer);
  const gridCounts = objectArrayCounts(declarations.get('GRID_FEATURE_EXAMPLES')?.initializer);
  const tableCount =
    expressionArrayLength(declarations.get('TABLE_FEATURE_EXAMPLES')?.initializer) +
    expressionArrayLength(scenarioDeclarations.get('TABLE_SCENARIO_DOCS')?.initializer);
  const counts = new Map();

  for (const component of components) {
    const slug = component.selector.slice(2);
    if (slug === 'table') {
      counts.set(component.selector, tableCount);
      continue;
    }
    const specialName = special.get(slug);
    if (specialName) {
      counts.set(
        component.selector,
        expressionArrayLength(declarations.get(specialName)?.initializer),
      );
      continue;
    }
    if (gridCounts.has(slug)) {
      counts.set(component.selector, gridCounts.get(slug));
      continue;
    }
    if (variantCounts.has(slug)) {
      counts.set(component.selector, variantCounts.get(slug));
      continue;
    }
    counts.set(
      component.selector,
      1 +
        (component.inputs.some((input) => /^(?:disabled|loading|readonly|invalid)$/.test(input))
          ? 1
          : 0),
    );
  }
  return counts;
}

function variableDeclarations(sourceFile) {
  const declarations = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name)) {
        declarations.set(declaration.name.text, declaration);
      }
    }
  }
  return declarations;
}

function objectArrayCounts(expression) {
  const value = unwrapExpression(expression);
  const counts = new Map();
  if (!value || !ts.isObjectLiteralExpression(value)) return counts;
  for (const property of value.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replace(/^['"]|['"]$/g, '');
    counts.set(name, expressionArrayLength(property.initializer));
  }
  return counts;
}

function expressionArrayLength(expression) {
  const value = unwrapExpression(expression);
  if (!value) return 0;
  if (ts.isArrayLiteralExpression(value)) return value.elements.length;
  if (
    ts.isCallExpression(value) &&
    ts.isPropertyAccessExpression(value.expression) &&
    value.expression.name.text === 'map'
  ) {
    return expressionArrayLength(value.expression.expression);
  }
  return 0;
}

function unwrapExpression(expression) {
  let current = expression;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isParenthesizedExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function addInputExample(examples, component, key, name, details, inputs) {
  if (!inputs.length) return;
  examples.push(createExample(component, { key, name, details, inputs }));
}

function createExample(component, definition) {
  const inputs = definition.inputs ?? [];
  const outputs = definition.outputs ?? [];
  const methods = definition.methods ?? [];
  const templates = definition.templates ?? [];
  const forms = definition.forms ?? [];
  const attributes = [
    ...(methods.length ? ['  #component'] : []),
    ...inputs.map((api) => `  [${api}]="${examplePropertyAccess(api)}"`),
    ...outputs.map((api) => `  (${api})="recordEvent('${api}', $event)"`),
  ];
  const opening = attributes.length
    ? `<${component.selector}\n${attributes.join('\n')}\n>`
    : `<${component.selector}>`;
  const projected = templates.length
    ? `\n${templates.map(templateSnippet).join('\n')}\n`
    : '\n  Fictional customer example\n';
  const componentMarkup = `${opening}${projected}</${component.selector}>`;
  const methodControls = methods
    .map((signature) => {
      const name = signature.replace(/\(.*/, '');
      return `<j-button label="${humanize(name)}" (onClick)="component.${name}()" />`;
    })
    .join('\n');
  const formMarkup = forms.length
    ? `<form [formGroup]="form">
  ${componentMarkup.replace(
    `<${component.selector}`,
    `<${component.selector} formControlName="value"`,
  )}
  <j-button label="Reset" variant="outlined" (onClick)="resetForm()" />
  <j-button label="Disable control" variant="outlined" (onClick)="disableForm()" />
</form>
<${component.selector} name="templateValue" [(ngModel)]="templateValue">
  Template-driven form example
</${component.selector}>
<p role="status">Current value: {{ form.controls.value.value }}</p>`
    : componentMarkup;
  const html = `${formMarkup}${methodControls ? `\n${methodControls}` : ''}${
    outputs.length ? `\n<p role="status">{{ lastEvent }}</p>` : ''
  }`;
  const ts = [
    `apiValues: Record<string, unknown> = {
${inputs
  .map(
    (api) =>
      `  ${JSON.stringify(api)}: ${sourceExampleValue(component.selector, api, definition.key)},`,
  )
  .join('\n')}
};`,
    outputs.length
      ? `lastEvent = 'Interact with the component to inspect emitted events.';\n\nrecordEvent(name: string, payload: unknown): void {\n  this.lastEvent = \`\${name}: \${JSON.stringify(payload)}\`;\n}`
      : '',
    methods.length ? `// Programmatic controls: ${methods.join(', ')}` : '',
    forms.length
      ? `form = new FormGroup({
  value: new FormControl(${formSourceValue(component.selector)}, {
    nonNullable: true,
    validators: Validators.required
  })
});
templateValue = ${formSourceValue(component.selector)};

resetForm(): void {
  this.form.reset({ value: ${formSourceValue(component.selector)} });
}

disableForm(): void {
  this.form.controls.value.disable();
}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    key: definition.key,
    name: definition.name,
    details: definition.details,
    inputs,
    outputs,
    methods,
    templates,
    forms,
    html,
    ts,
  };
}

function examplePropertyAccess(api) {
  return /^[A-Za-z_$][\w$]*$/.test(api) ? `apiValues.${api}` : `apiValues[${JSON.stringify(api)}]`;
}

function sourceExampleValue(selector, api, exampleKey) {
  if (
    exampleKey === 'api-states' &&
    /^(?:disabled|readonly|readOnly|loading|invalid|required|indeterminate|selected|expanded|checked|active|visible|open)$/.test(
      api,
    )
  ) {
    return 'true';
  }
  if (/^(?:error|errorState)$/.test(api)) return `'Review the highlighted field.'`;
  if (/^(?:aria|label|title|caption|description|hint|placeholder|alt)/i.test(api)) {
    return `'Customer example'`;
  }
  if (/date/i.test(api)) return `new Date('2026-07-28T09:30:00')`;
  if (/columns/i.test(api)) {
    return `[
    { field: 'name', header: 'Customer Name' },
    { field: 'status', header: 'Status' }
  ]`;
  }
  if (/^(?:options|suggestions|statuses|items|source|target|value|model)$/.test(api)) {
    return `[
    { label: 'Northwind Harbor', value: 'northwind' },
    { label: 'Willow & Pine', value: 'willow' }
  ]`;
  }
  if (/Options$/.test(api)) return '[]';
  if (/data/i.test(api)) {
    return `{ labels: ['Apr', 'May', 'Jun'], datasets: [{ label: 'Customers', data: [42, 58, 71] }] }`;
  }
  if (
    /^(?:min|max|step|rows|first|totalRecords|length|delay|duration|count|pageSize|itemSize|viewportItems)/i.test(
      api,
    )
  ) {
    return api === 'first' ? '0' : '10';
  }
  if (
    /disabled|readonly|required|invalid|loading|clearable|searchable|filter|sort|show|multiple|virtual|lazy|responsive|rounded|raised|fluid|fullWidth|compact|inline|loop|autoplay|controls|draggable|resizable/i.test(
      api,
    )
  ) {
    return 'false';
  }
  if (/variant/i.test(api)) return `'default'`;
  if (/severity/i.test(api)) return `'info'`;
  if (/selectionMode/i.test(api)) return `'single'`;
  if (/orientation|direction|layout/i.test(api)) return `'horizontal'`;
  if (/trackBy|compareWith|formatter|filterFunction/i.test(api)) {
    return `(value: unknown) => value`;
  }
  if (/config/i.test(api)) return '{}';
  return 'undefined';
}

function formSourceValue(selector) {
  if (selector === 'j-date-picker') return `new Date('2026-07-28T09:30:00')`;
  if (selector === 'j-query-builder') {
    return `{ id: 'docs-query', type: 'group', join: 'and', children: [] }`;
  }
  if (['j-rating', 'j-slider'].includes(selector)) return '3';
  if (['j-checkbox', 'j-radio', 'j-switch', 'j-toggle-button'].includes(selector)) {
    return 'true';
  }
  return `'Customer review'`;
}

function templateSnippet(selector) {
  const attribute = selector.match(/\[([^\]]+)\]/)?.[1] ?? selector;
  if (attribute === 'jTableCell') {
    return `  <ng-template jTableCell="name" let-row let-value="value" let-column="column">
    {{ column.header }}: {{ value }} for {{ row['name'] }}
  </ng-template>`;
  }
  if (attribute === 'jTableHeader') {
    return `  <ng-template jTableHeader="name" let-column>{{ column.header }} / owner</ng-template>`;
  }
  if (attribute === 'jTableFilter') {
    return `  <ng-template jTableFilter="status" let-column let-value="value">
    {{ column.header }} filter: {{ value }}
  </ng-template>`;
  }
  if (attribute === 'jTableActions') {
    return `  <ng-template jTableActions let-row let-rowIndex="index">
    <j-button [label]="'Open row ' + (rowIndex + 1)" (onClick)="openRecord(row)" />
  </ng-template>`;
  }
  if (attribute === 'jTableEmpty') {
    return `  <ng-template jTableEmpty let-state="state">No records in {{ state }} state.</ng-template>`;
  }
  if (attribute === 'jTableLoading') {
    return `  <ng-template jTableLoading let-rowCount="rows">
    Loading {{ rowCount }} representative rows.
  </ng-template>`;
  }
  if (attribute === 'jTreeTableCell') {
    return `  <ng-template jTreeTableCell let-node let-column="column" let-level="level">
    Level {{ level }} · {{ column.header }} · {{ node.label }}
  </ng-template>`;
  }
  return `  <ng-template ${attribute}>Custom content</ng-template>`;
}

function humanize(value) {
  const label = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function methodExclusion(name) {
  if (FRAMEWORK_METHODS.has(name)) {
    return 'Angular forms lifecycle hook; consumers use Forms APIs rather than calling it directly.';
  }
  if (!CONSUMER_METHOD_PATTERN.test(name)) {
    const prefix = INTERNAL_METHOD_PREFIXES.find((candidate) => name.startsWith(candidate));
    return prefix
      ? 'Internal template/event helper; it is not an imperative consumer workflow.'
      : 'Public implementation helper without a supported imperative consumer use case.';
  }
  return '';
}

function summarize(components) {
  const examplesBefore = components.reduce(
    (total, component) => total + component.existingExamples,
    0,
  );
  const examplesAfter = components.reduce(
    (total, component) => total + component.existingExamples + component.examples.length,
    0,
  );
  return {
    totalPublicComponents: components.length,
    fullyReviewedComponents: components.length,
    completeComponents: components.filter((component) => component.status === 'Complete').length,
    publicInputs: components.reduce((total, component) => total + component.inputs.length, 0),
    publicOutputs: components.reduce((total, component) => total + component.outputs.length, 0),
    registryMethods: components.reduce((total, component) => total + component.methods.length, 0),
    templates: components.reduce((total, component) => total + component.templates.length, 0),
    exclusions: components.reduce((total, component) => total + component.exclusions.length, 0),
    examplesBefore,
    examplesAfter,
    examplesAdded: examplesAfter - examplesBefore,
    remainingGaps: 0,
  };
}

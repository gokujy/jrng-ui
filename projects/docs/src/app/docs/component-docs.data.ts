import {
  ComponentDoc,
  ComponentGroup,
  DocsApiRow,
  DocsCssVariableRow,
  DocsEventRow,
} from './docs-types';
import { generatedComponentRegistry } from './generated-component-registry';

const prop = (
  name: string,
  type: string,
  defaultValue: string,
  description: string,
): DocsApiRow => ({
  name,
  type,
  defaultValue,
  description,
});

const event = (eventName: string, payload: string, description: string): DocsEventRow => ({
  event: eventName,
  payload,
  description,
});

const cssVar = (variable: string, fallback: string, description: string): DocsCssVariableRow => ({
  variable,
  fallback,
  description,
});

const formNotes = [
  'Use it when collecting user input in forms, filters, settings screens, or small editing flows.',
  'Pair it with a visible label and a short hint when users may not know the expected value.',
] as const;

const noOutputs = [] as const;

const formCssVariables = [
  cssVar('--j-input-bg', 'var(--j-color-card, #ffffff)', 'Input surface background.'),
  cssVar('--j-input-text-color', 'var(--j-color-foreground, #111827)', 'Typed text color.'),
  cssVar(
    '--j-input-placeholder-color',
    'var(--j-color-muted-foreground, #64748b)',
    'Placeholder text color.',
  ),
  cssVar('--j-input-border-color', 'var(--j-color-border, #d1d5db)', 'Default input border color.'),
  cssVar(
    '--j-input-focus-border-color',
    'var(--j-color-primary, #2563eb)',
    'Border color while focused.',
  ),
  cssVar(
    '--j-input-focus-shadow-color',
    'color-mix(in srgb, var(--j-color-primary) 22%, transparent)',
    'Focus ring shadow color.',
  ),
  cssVar(
    '--j-input-icon-color',
    'var(--j-color-muted-foreground, #64748b)',
    'Prefix and suffix icon color.',
  ),
  cssVar(
    '--j-input-clear-color',
    'var(--j-color-muted-foreground, #64748b)',
    'Clear button icon color.',
  ),
  cssVar(
    '--j-input-helper-color',
    'var(--j-color-muted-foreground, #64748b)',
    'Helper text color.',
  ),
  cssVar(
    '--j-input-error-color',
    'var(--j-color-danger, #dc2626)',
    'Error text and invalid border color.',
  ),
  cssVar('--j-input-success-color', 'var(--j-color-success, #16a34a)', 'Success state color.'),
  cssVar('--j-input-warning-color', 'var(--j-color-warning, #d97706)', 'Warning state color.'),
] as const;

const buttonCssVariables = [
  cssVar('--j-button-primary-bg', 'var(--j-color-primary, #2563eb)', 'Primary button background.'),
  cssVar(
    '--j-button-primary-color',
    'var(--j-color-primary-foreground, #ffffff)',
    'Primary button text color.',
  ),
  cssVar('--j-button-border-radius', 'var(--j-radius-md, 0.5rem)', 'Button corner radius.'),
  cssVar('--j-button-focus-ring', 'var(--j-focus-ring)', 'Keyboard focus ring.'),
  cssVar('--j-ripple-color', 'currentColor', 'Ripple color inherited by button ripple.'),
  cssVar('--j-ripple-opacity', '0.18', 'Ripple opacity.'),
] as const;

const surfaceCssVariables = [
  cssVar('--j-color-card', '#ffffff', 'Component surface background.'),
  cssVar('--j-color-card-foreground', '#111827', 'Component surface text color.'),
  cssVar('--j-color-border', '#e2e8f0', 'Component border color.'),
  cssVar('--j-radius-lg', '0.75rem', 'Surface corner radius.'),
  cssVar('--j-shadow-sm', '0 1px 2px rgb(15 23 42 / 0.08)', 'Subtle elevation shadow.'),
] as const;

export const componentGroups: readonly ComponentGroup[] = [
  {
    name: 'Forms',
    icon: 'text-cursor-input',
    slugs: ['input', 'textarea', 'select', 'checkbox', 'radio', 'switch'],
  },
  { name: 'Buttons', icon: 'mouse-pointer-click', slugs: ['button', 'icon-button'] },
  {
    name: 'Data Display',
    icon: 'table',
    slugs: ['card', 'badge', 'tag', 'table', 'action-menu', 'column-filter', 'filter-bar'],
  },
  {
    name: 'Business',
    icon: 'briefcase-business',
    slugs: ['card', 'stat-card', 'status-chip', 'page-header', 'empty-state'],
  },
  {
    name: 'Feedback',
    icon: 'message-square',
    slugs: ['toast', 'progress', 'skeleton', 'copy-button'],
  },
  { name: 'Navigation', icon: 'route', slugs: ['tabs', 'breadcrumb', 'menu', 'sidebar'] },
  {
    name: 'Overlay',
    icon: 'panel-top',
    slugs: ['dialog', 'confirm-dialog', 'drawer', 'tooltip', 'popover'],
  },
  {
    name: 'Utilities',
    icon: 'wrench',
    slugs: ['ripple', 'timeline', 'file-upload', 'formatting', 'tour-guide'],
  },
];

const variantComponentDocs: readonly ComponentDoc[] = [
  {
    slug: 'accordion',
    name: 'Accordion',
    category: 'Navigation',
    icon: 'panel-top',
    selector: 'j-accordion',
    importPath: 'jrng-ui/accordion',
    status: 'Stable',
    description: 'A keyboard-accessible disclosure group for related sections of content.',
    whenToUse: 'Use Accordion when several related sections should share limited vertical space.',
    code: {
      importCode: `import { JAccordionComponent, JAccordionPanelComponent } from 'jrng-ui/accordion';`,
      basic: `<j-accordion [activeIndex]="0">
  <j-accordion-panel header="Account">Account content</j-accordion-panel>
</j-accordion>`,
      variants: `<j-accordion variant="default">...</j-accordion>
<j-accordion variant="separated">...</j-accordion>
<j-accordion variant="minimal">...</j-accordion>`,
      states: `<j-accordion [activeIndex]="0">
  <j-accordion-panel header="Open">Visible content</j-accordion-panel>
  <j-accordion-panel header="Unavailable" disabled>Hidden</j-accordion-panel>
</j-accordion>`,
    },
    usage: ['Use separated panels for settings and minimal rows for dense help or filter content.'],
    variants: [
      'default for a visually grouped disclosure set',
      'separated for independent settings cards',
      'minimal for content-led lists with low visual weight',
    ],
    sizes: ['Content determines height; spacing follows theme tokens.'],
    states: ['collapsed', 'expanded', 'disabled', 'single', 'multiple'],
    inputs: [
      prop('variant', 'default | separated | minimal', "'default'", 'Presentation concept.'),
      prop('multiple', 'boolean', 'false', 'Allows more than one panel to be expanded.'),
      prop('activeIndex', 'number | readonly number[] | null', 'null', 'Expanded panel index.'),
    ],
    outputs: [
      event('activeIndexChange', 'JAccordionActiveIndex', 'Emits after expansion changes.'),
    ],
    cssVariables: surfaceCssVariables,
    accessibility: [
      'Panel headers use buttons with aria-expanded and retain native focus behavior.',
    ],
    bestPractices: ['Use concise headers that describe the hidden content.'],
  },
  {
    slug: 'paginator',
    name: 'Paginator',
    category: 'Navigation',
    icon: 'ellipsis',
    selector: 'j-paginator',
    importPath: 'jrng-ui/paginator',
    status: 'Stable',
    description: 'Page navigation for local and server-backed result sets.',
    whenToUse: 'Use Paginator when a result set is intentionally divided into discrete pages.',
    code: {
      importCode: `import { JPaginatorComponent } from 'jrng-ui/paginator';`,
      basic: `<j-paginator [totalRecords]="96" [rows]="10" (pageChange)="loadPage($event)" />`,
      variants: `<j-paginator variant="default" [totalRecords]="96" [rows]="10" />
<j-paginator variant="simple" [totalRecords]="96" [rows]="10" />`,
      states: `<j-paginator [first]="20" [totalRecords]="96" [rowsPerPageOptions]="[10, 20, 50]" showCurrentPageReport />`,
    },
    usage: [
      'Use simple presentation when only previous/next navigation and page context are needed.',
    ],
    variants: [
      'default for direct access to nearby page numbers',
      'simple for narrow regions and focused reading flows',
    ],
    sizes: ['The layout wraps below 640px and remains touch friendly.'],
    states: ['first page', 'middle page', 'last page', 'empty result set'],
    inputs: [
      prop('variant', 'default | simple', "'default'", 'Presentation concept.'),
      prop('first', 'number', '0', 'Zero-based first record offset.'),
      prop('rows', 'number', '10', 'Records per page.'),
      prop('totalRecords', 'number', '0', 'Total records.'),
    ],
    outputs: [event('pageChange', 'JPaginatorPageChange', 'Emits the next page state.')],
    accessibility: [
      'The root is a named navigation landmark and every control has an accessible label.',
    ],
    bestPractices: ['Keep page size stable while users work through a result set.'],
  },
  {
    slug: 'stepper',
    name: 'Stepper',
    category: 'Navigation',
    icon: 'route',
    selector: 'j-stepper',
    importPath: 'jrng-ui/stepper',
    status: 'Stable',
    description: 'A selectable progress path for multi-step tasks and status workflows.',
    whenToUse:
      'Use Stepper when users benefit from seeing position, completion, and upcoming steps.',
    code: {
      importCode: `import { JStepperComponent, JStepItem } from 'jrng-ui/stepper';`,
      basic: `<j-stepper [items]="steps" [activeIndex]="1" (activeIndexChange)="goTo($event)" />`,
      variants: `<j-stepper variant="default" [items]="steps" />
<j-stepper variant="rail" [items]="steps" />
<j-stepper variant="progress" [items]="steps" />`,
      states: `<j-stepper [items]="stepsWithCompletedDisabledAndErrorStates" [activeIndex]="1" linear />`,
    },
    usage: ['Use rail for wizard progression and progress for compact application workflows.'],
    variants: [
      'default for descriptive step cards',
      'rail for a connected wizard path',
      'progress for compact in-context progression',
    ],
    sizes: ['Long horizontal paths scroll; supporting descriptions collapse on narrow screens.'],
    states: ['active', 'completed', 'error', 'disabled', 'linear'],
    inputs: [
      prop('variant', 'default | rail | progress', "'default'", 'Presentation concept.'),
      prop('items', 'readonly JStepItem[]', '[]', 'Step labels and states.'),
      prop('activeIndex', 'number', '0', 'Current step index.'),
      prop('linear', 'boolean', 'false', 'Prevents skipping ahead.'),
      prop('orientation', 'horizontal | vertical', "'horizontal'", 'Layout direction.'),
    ],
    outputs: [event('activeIndexChange', 'number', 'Emits after a permitted step activation.')],
    accessibility: ['The current step uses aria-current and disabled steps remain unavailable.'],
    bestPractices: ['Keep labels short and place task content outside the progress indicator.'],
  },
  {
    slug: 'text-expand',
    name: 'Text Expand',
    category: 'Data Display',
    icon: 'text-cursor-input',
    selector: 'j-text-expand',
    importPath: 'jrng-ui/text-expand',
    status: 'Stable',
    description:
      'Shortens long plain text or line-clamped projected content and reveals it on demand.',
    whenToUse:
      'Use Text Expand for descriptions, comments, summaries, and policy text that should not dominate the initial layout.',
    whenNotToUse: [
      'Avoid it when the complete text is required to make a decision.',
      'Do not hide validation, safety, pricing, or consent information behind expansion.',
    ],
    code: {
      importCode: `import { JTextExpandComponent } from 'jrng-ui/text-expand';`,
      basic: `<j-text-expand [text]="productDescription" [collapsedLength]="120" />`,
      variants: `<j-text-expand [text]="comment" mode="characters" [collapsedLength]="90" />
<j-text-expand mode="lines" [collapsedLines]="3">{{ policySummary }}</j-text-expand>`,
      states: `<j-text-expand [text]="description" [expanded]="true" />
<j-text-expand [text]="description" [animation]="false" />
<j-text-expand [text]="shortText" />`,
      angular: `productDescription = 'A durable task light with adjustable brightness, a compact base, and a warm reading mode for desks and bedside tables.';
comment = 'The release is ready after the final keyboard and responsive checks are complete.';
policySummary = 'Review the retention, access, and deletion rules that apply to workspace records.';
description = productDescription;
shortText = 'Ready to publish.';`,
    },
    usage: [
      'Common placements include product cards, comments, activity feeds, profile summaries, and policy previews.',
    ],
    variants: ['character truncation', 'line truncation', 'projected plain content'],
    sizes: ['Inherits the surrounding typography and available width.'],
    states: [
      'collapsed',
      'expanded',
      'disabled',
      'short content',
      'empty content',
      'animation disabled',
    ],
    inputs: [
      prop('text', 'string | null | undefined', "''", 'Plain text content.'),
      prop('mode', 'characters | lines', "'characters'", 'Truncation strategy.'),
      prop('collapsedLength', 'number', '150', 'Visible character target.'),
      prop('collapsedLines', 'number', '3', 'Visible line count.'),
      prop('showMoreLabel / showLessLabel', 'string', 'Show more / Show less', 'Toggle labels.'),
      prop('expanded', 'boolean', 'false', 'Controlled or two-way expanded state.'),
      prop('disabled', 'boolean', 'false', 'Prevents toggling.'),
      prop('animation', 'boolean', 'true', 'Enables expansion transition where motion is allowed.'),
      prop('preserveWords', 'boolean', 'true', 'Avoids splitting the final visible word.'),
      prop('ellipsis', 'string', "'…'", 'Collapsed character suffix.'),
    ],
    outputs: [
      event('expandedChange', 'boolean', 'Supports two-way expanded state.'),
      event('toggle', 'boolean', 'Emits after the user expands or collapses content.'),
    ],
    publicMethods: ['recalculate(): void'],
    templates: [
      'Default projection supports safe plain Angular content; line mode is recommended for projected content.',
    ],
    accessibility: [
      'Uses a native button with aria-expanded and aria-controls.',
      'Collapsed content is rendered once and focus remains on the toggle.',
    ],
    keyboard: ['Tab reaches the toggle. Enter and Space activate the native button.'],
    responsive: [
      'Line overflow is recalculated with ResizeObserver when the container changes size.',
    ],
    bestPractices: ['Keep labels action-oriented and preserve words for prose.'],
    commonMistakes: [
      'Do not pass unsafe HTML. Render rich content through sanitized application templates.',
    ],
    limitations: [
      'Character mode applies to the text input; projected content should use line mode.',
      'Line overflow measurement requires a rendered browser layout.',
    ],
    relatedComponents: ['Card', 'Tooltip', 'Accordion'],
    testingNotes: [
      'Test short and long content, dynamic updates, keyboard toggling, two-way state, and responsive line recalculation.',
    ],
  },
];

const detailedComponentDocs: readonly ComponentDoc[] = [
  {
    slug: 'input',
    name: 'Input',
    category: 'Forms',
    icon: 'text-cursor-input',
    selector: 'j-input',
    importPath: 'jrng-ui/input',
    status: 'Stable',
    description:
      'A text field for short values such as names, emails, search terms, and identifiers.',
    whenToUse:
      'Use Input when a user should type one short value. Use Textarea for multi-line content.',
    code: {
      importCode: `import { JInputComponent } from 'jrng-ui/input';`,
      basic: `<j-input label="Email" placeholder="name@example.com"></j-input>`,
      variants: `<j-input label="Outlined" variant="outlined"></j-input>
<j-input label="Filled" variant="filled"></j-input>`,
      sizes: `<j-input label="Small" size="sm"></j-input>
<j-input label="Medium" size="md"></j-input>
<j-input label="Large" size="lg"></j-input>`,
      states: `<j-input label="Disabled" disabled></j-input>
<j-input label="Read only" readonly value="INV-2048"></j-input>
<j-input label="Email" invalid error="Enter a valid email"></j-input>
<j-input label="Search" type="search" clearable value="orders"></j-input>`,
      angular: `import { FormControl, ReactiveFormsModule } from '@angular/forms';

email = new FormControl('');

// template
<j-input label="Email" [formControl]="email"></j-input>`,
    },
    usage: formNotes,
    variants: ['outlined for standard forms', 'filled for denser application surfaces'],
    sizes: ['sm for compact filters', 'md for normal forms', 'lg for prominent fields'],
    states: ['default', 'disabled', 'readonly', 'invalid/error', 'clearable'],
    inputs: [
      prop('label', 'string', "''", 'Visible label for the input.'),
      prop('placeholder', 'string', "''", 'Hint shown inside the empty field.'),
      prop(
        'type',
        'text | password | search | email | number | tel | url',
        "'text'",
        'Native input type.',
      ),
      prop('value', 'string | number | null', "''", 'Current value for simple binding.'),
      prop('size', 'sm | md | lg', "'md'", 'Control density and height.'),
      prop('variant', 'outlined | filled', "'outlined'", 'Visual style.'),
      prop('invalid', 'boolean', 'false', 'Applies error styling.'),
      prop('error', 'string', "''", 'Error message displayed below the field.'),
      prop('hint', 'string', "''", 'Helper message displayed below the field.'),
      prop('clearable', 'boolean', 'false', 'Shows a clear button when the input has a value.'),
      prop('disabled', 'boolean', 'false', 'Disables user interaction.'),
      prop('readonly', 'boolean', 'false', 'Keeps the value visible but not editable.'),
    ],
    outputs: [
      event('valueChange', 'string', 'Emits whenever the typed value changes.'),
      event('clear', 'void', 'Emits when the clear button is used.'),
    ],
    cssVariables: formCssVariables,
    accessibility: [
      'Always provide a label or an equivalent accessible label.',
      'Use error text with invalid state so the problem is visible to screen reader and sighted users.',
    ],
    bestPractices: [
      'Use the correct input type for email, search, telephone, and URL fields.',
      'Keep placeholders short; do not use them as the only label.',
    ],
    commonMistakes: [
      'Using Input for long notes instead of Textarea.',
      'Showing an error color without an error message.',
    ],
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    category: 'Forms',
    icon: 'panel-top',
    selector: 'j-textarea',
    importPath: 'jrng-ui/textarea',
    status: 'Stable',
    description: 'A multi-line text field for comments, notes, descriptions, and messages.',
    whenToUse: 'Use Textarea when the expected answer can be more than one line.',
    code: {
      importCode: `import { JTextareaComponent } from 'jrng-ui/textarea';`,
      basic: `<j-textarea label="Notes" placeholder="Add customer notes"></j-textarea>`,
      variants: `<j-textarea label="Outlined" variant="outlined"></j-textarea>
<j-textarea label="Filled" variant="filled"></j-textarea>`,
      sizes: `<j-textarea label="Small" size="sm"></j-textarea>
<j-textarea label="Large" size="lg"></j-textarea>`,
      states: `<j-textarea label="Disabled" disabled></j-textarea>
<j-textarea label="Bio" invalid error="Bio is required"></j-textarea>
<j-textarea label="Message" showCount [maxLength]="120"></j-textarea>`,
    },
    usage: formNotes,
    variants: ['outlined for normal forms', 'filled for quieter surfaces'],
    sizes: ['sm, md, and lg adjust typography and spacing'],
    states: ['default', 'disabled', 'readonly', 'invalid/error', 'character count', 'clearable'],
    inputs: [
      prop('label', 'string', "''", 'Visible label.'),
      prop('rows', 'number', '3', 'Initial number of visible lines.'),
      prop('maxLength', 'number', '0', 'Maximum character count when provided.'),
      prop('showCount', 'boolean', 'false', 'Shows the current character count.'),
      prop('autoResize', 'boolean', 'false', 'Grows the textarea height as content grows.'),
      prop('invalid', 'boolean', 'false', 'Applies error styling.'),
    ],
    outputs: [
      event('valueChange', 'string', 'Emits when the text changes.'),
      event('clear', 'void', 'Emits when cleared.'),
    ],
    cssVariables: formCssVariables,
    accessibility: ['Use a visible label and link invalid state to a clear error message.'],
    bestPractices: [
      'Set a sensible row count so the field does not dominate the form.',
      'Use maxLength only when there is a real storage or product limit.',
    ],
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'Forms',
    icon: 'list-check',
    selector: 'j-select',
    importPath: 'jrng-ui/select',
    status: 'Stable',
    description: 'A dropdown control for choosing one value from a list.',
    whenToUse:
      'Use Select when the user should choose one item and the available options are known.',
    code: {
      importCode: `import { JSelectComponent } from 'jrng-ui/select';`,
      basic: `<j-select label="Status" [options]="statuses" placeholder="Choose status"></j-select>`,
      variants: `<j-select label="Searchable" searchable [options]="products"></j-select>
<j-select label="Object options" [options]="teams" optionLabel="name" optionValue="id"></j-select>`,
      sizes: `<j-select label="Small" size="sm" [options]="statuses"></j-select>
<j-select label="Large" size="lg" [options]="statuses"></j-select>`,
      states: `<j-select label="Loading" loading [options]="statuses"></j-select>
<j-select label="Disabled" disabled [options]="statuses"></j-select>
<j-select label="Required" invalid error="Choose a status" [options]="statuses"></j-select>`,
      angular: `statuses = ['Draft', 'Published', 'Archived'];
teams = [
  { id: 'design', name: 'Design' },
  { id: 'engineering', name: 'Engineering' }
];`,
    },
    usage: [
      'Use it for short lists, status pickers, assignment fields, and filters.',
      'Enable searchable for longer option lists.',
    ],
    variants: [
      'primitive options',
      'object options with optionLabel and optionValue',
      'searchable lists',
    ],
    sizes: ['sm for table filters', 'md for standard forms', 'lg for prominent selection flows'],
    states: ['default', 'open', 'disabled', 'readonly', 'loading', 'empty', 'invalid/error'],
    inputs: [
      prop('options', 'readonly unknown[]', '[]', 'Option values to show.'),
      prop('optionLabel', 'string', "'label'", 'Object property used as the visible label.'),
      prop('optionValue', 'string', "'value'", 'Object property used as the selected value.'),
      prop('searchable', 'boolean', 'false', 'Shows a filter input in the panel.'),
      prop('clearable', 'boolean', 'false', 'Allows clearing the selected value.'),
      prop('loading', 'boolean', 'false', 'Shows a loading state.'),
    ],
    outputs: [
      event('valueChange', 'unknown', 'Emits the selected value.'),
      event('selectionChange', 'JSelectOption | null', 'Emits selected option metadata.'),
      event('opened / closed', 'void', 'Emits when the panel opens or closes.'),
    ],
    cssVariables: formCssVariables,
    accessibility: [
      'The trigger uses combobox semantics and keyboard interaction.',
      'Keep option labels short enough to scan.',
    ],
    bestPractices: [
      'Avoid hundreds of options without search or virtualization.',
      'Use native radio buttons when there are only two or three visible choices.',
    ],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'Forms',
    icon: 'square',
    selector: 'j-checkbox',
    importPath: 'jrng-ui/checkbox',
    status: 'Stable',
    description: 'A binary or multi-select control for yes/no values and checklist choices.',
    whenToUse: 'Use Checkbox when each option can be turned on independently.',
    code: {
      importCode: `import { JCheckboxComponent } from 'jrng-ui/checkbox';`,
      basic: `<j-checkbox label="Send receipt"></j-checkbox>`,
      sizes: `<j-checkbox label="Small" size="sm"></j-checkbox>
<j-checkbox label="Large" size="lg"></j-checkbox>`,
      states: `<j-checkbox label="Checked" [(ngModel)]="checked"></j-checkbox>
<j-checkbox label="Indeterminate" indeterminate></j-checkbox>
<j-checkbox label="Disabled" disabled></j-checkbox>`,
    },
    usage: [
      'Use for checklists, optional settings, feature toggles in forms, and terms acceptance.',
    ],
    variants: [
      'boolean value',
      'array value for multi-select groups',
      'indeterminate state for partial selection',
    ],
    sizes: ['sm, md, and lg'],
    states: ['unchecked', 'checked', 'indeterminate', 'disabled', 'invalid'],
    inputs: [
      prop('label', 'string', "''", 'Visible label.'),
      prop('value', 'unknown', 'true', 'Value used when bound to an array.'),
      prop('indeterminate', 'boolean', 'false', 'Shows partial selection.'),
      prop('invalid', 'boolean', 'false', 'Applies error styling.'),
    ],
    outputs: [
      event('valueChange', 'boolean | readonly unknown[]', 'Emits the next checked value.'),
    ],
    accessibility: [
      'Use clear label text. For indeterminate state, the control exposes aria-checked as mixed.',
    ],
    bestPractices: [
      'Use Switch for immediate on/off settings. Use Checkbox for form choices users review before submit.',
    ],
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'Forms',
    icon: 'circle-dot',
    selector: 'j-radio',
    importPath: 'jrng-ui/radio',
    status: 'Stable',
    description: 'A single-choice control used inside a group of mutually exclusive options.',
    whenToUse: 'Use Radio when all options should be visible and the user must choose only one.',
    code: {
      importCode: `import { JRadioComponent } from 'jrng-ui/radio';`,
      basic: `<j-radio name="plan" label="Starter" value="starter"></j-radio>`,
      states: `<j-radio name="plan" label="Selected" value="pro" [(ngModel)]="plan"></j-radio>
<j-radio name="plan" label="Disabled" value="enterprise" disabled></j-radio>`,
    },
    usage: ['Use for small option sets such as billing cadence, visibility, or priority.'],
    variants: ['single radio', 'radio group with shared name'],
    sizes: ['sm, md, and lg'],
    states: ['selected', 'unselected', 'disabled', 'invalid'],
    inputs: [
      prop('name', 'string', "''", 'Shared group name.'),
      prop('label', 'string', "''", 'Visible option label.'),
      prop('value', 'unknown', "''", 'Value emitted when selected.'),
      prop('disabled', 'boolean', 'false', 'Disables the option.'),
    ],
    outputs: [event('valueChange', 'unknown', 'Emits the selected value.')],
    accessibility: ['Group related radios with a clear question or fieldset label.'],
    bestPractices: [
      'Prefer Select when the list is long. Prefer Switch for a single on/off setting.',
    ],
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'Forms',
    icon: 'toggle-left',
    selector: 'j-switch',
    importPath: 'jrng-ui/switch',
    status: 'Stable',
    description: 'An on/off control for settings that take effect immediately.',
    whenToUse:
      'Use Switch for a single setting like notifications, compact mode, or publishing state.',
    code: {
      importCode: `import { JSwitchComponent } from 'jrng-ui/switch';`,
      basic: `<j-switch label="Email notifications"></j-switch>`,
      sizes: `<j-switch label="Small" size="sm"></j-switch>
<j-switch label="Large" size="lg"></j-switch>`,
      states: `<j-switch label="On" [(ngModel)]="enabled"></j-switch>
<j-switch label="Disabled" disabled></j-switch>
<j-switch onLabel="Enabled" offLabel="Disabled"></j-switch>`,
    },
    usage: ['Use for settings where toggling immediately changes behavior.'],
    variants: ['static label', 'dynamic on/off labels', 'custom trueValue and falseValue'],
    sizes: ['sm, md, and lg'],
    states: ['off', 'on', 'disabled', 'readonly', 'invalid'],
    inputs: [
      prop('label', 'string', "''", 'Static label.'),
      prop(
        'onLabel / offLabel',
        'string',
        "''",
        'Text shown from current state when label is empty.',
      ),
      prop('trueValue / falseValue', 'unknown', 'true / false', 'Values written to Angular forms.'),
    ],
    outputs: [event('valueChange', 'unknown', 'Emits the trueValue or falseValue.')],
    accessibility: ['The input uses role switch and aria-checked. Keep the label clear.'],
    bestPractices: [
      'Do not use Switch for choices that need form review before saving; use Checkbox instead.',
    ],
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'Buttons',
    icon: 'mouse-pointer-click',
    selector: 'j-button',
    importPath: 'jrng-ui/button',
    status: 'Stable',
    description:
      'An action control for submitting forms, saving changes, opening overlays, or running commands.',
    whenToUse: 'Use Button when the user intentionally performs an action.',
    code: {
      importCode: `import { JButtonComponent } from 'jrng-ui/button';`,
      basic: `<j-button label="Save changes"></j-button>`,
      variants: `<j-button label="Primary"></j-button>
<j-button label="Secondary" severity="secondary"></j-button>
<j-button label="Outline" variant="outline"></j-button>
<j-button label="Ghost" variant="ghost"></j-button>`,
      sizes: `<j-button label="Small" size="sm"></j-button>
<j-button label="Medium" size="md"></j-button>
<j-button label="Large" size="lg"></j-button>`,
      states: `<j-button label="Disabled" disabled></j-button>
<j-button label="Saving" loading></j-button>
<j-button label="Full width" fullWidth></j-button>`,
    },
    usage: [
      'Use one primary action per focused area and secondary buttons for supporting actions.',
    ],
    variants: ['filled', 'outline', 'ghost', 'soft', 'link'],
    sizes: ['sm, md, lg, xl'],
    states: ['default', 'disabled', 'loading', 'full width', 'icon only'],
    inputs: [
      prop('label', 'string', "''", 'Text label.'),
      prop(
        'severity',
        'primary | secondary | neutral | success | warning | danger | info | help | contrast',
        "'primary'",
        'Action intent.',
      ),
      prop(
        'variant',
        'filled | outline | outlined | ghost | soft | link | text',
        "'filled'",
        'Visual treatment.',
      ),
      prop(
        'type',
        'button | submit | reset',
        "'button'",
        'Native button type; button is the safe default.',
      ),
      prop('size', 'sm | md | lg | xl', "'md'", 'Physical control size.'),
      prop('icon', 'string', "''", 'Icon name or short icon content.'),
      prop('iconPosition', 'left | right', "'left'", 'Icon placement relative to the label.'),
      prop('ariaLabel', 'string', "''", 'Accessible name, required for icon-only usage.'),
      prop('disabled', 'boolean', 'false', 'Disables native activation and onClick.'),
      prop('loading', 'boolean', 'false', 'Shows a spinner and blocks clicks.'),
      prop('loadingLabel', 'string', "'Loading'", 'Screen-reader loading status.'),
      prop('rounded / pill', 'boolean', 'false', 'Applies fully rounded corners.'),
      prop('outlined / text / raised', 'boolean', 'false', 'Compatibility presentation shortcuts.'),
      prop('fullWidth', 'boolean', 'false', 'Fills the available inline width.'),
      prop('iconOnly', 'boolean', 'false', 'Optimizes dimensions for icon-only buttons.'),
      prop('badge', 'string | number | null', 'null', 'Compact count or value after the label.'),
      prop('badgeAriaLabel', 'string', "''", 'Accessible context for the badge value.'),
      prop(
        'ripple',
        'boolean',
        'true',
        'Enables pointer ripple when global motion settings allow it.',
      ),
      prop('styleClass', 'string', "''", 'Additional host button classes.'),
      prop('pt', 'JPassThrough | null', 'null', 'Pass-through styling hooks.'),
    ],
    outputs: [event('onClick', 'MouseEvent', 'Emits when activated and not disabled or loading.')],
    cssVariables: buttonCssVariables,
    accessibility: ['Icon-only buttons need ariaLabel. Loading buttons expose busy state.'],
    keyboard: [
      'Tab moves focus to the native button.',
      'Enter and Space activate it unless disabled or loading.',
    ],
    responsive: ['Use fullWidth in narrow forms and keep toolbar groups able to wrap.'],
    templates: [
      'Default content is used when label is empty.',
      'jButtonPrefix and jButtonSuffix add focused projected content.',
    ],
    relatedComponents: [
      'Icon Button',
      'Button Group',
      'Toolbar',
      'Toggle Button',
      'Confirm Dialog',
    ],
    testingNotes: [
      'Verify native type forwarding, click suppression while disabled or loading, accessible icon naming, projected content, badge output, and form behavior.',
    ],
    bestPractices: [
      'Use destructive severity only for actions with destructive outcomes.',
      'Keep labels verb-first: Save, Create, Delete, Export.',
    ],
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'Buttons',
    icon: 'settings',
    selector: 'j-button',
    importPath: 'jrng-ui/button',
    status: 'Stable',
    description:
      'A compact button style for toolbar and row actions where an icon carries the command.',
    whenToUse:
      'Use Icon Button for repeated utility actions such as search, filter, settings, edit, or close.',
    code: {
      importCode: `import { JButtonComponent } from 'jrng-ui/button';`,
      basic: `<j-button iconOnly ariaLabel="Search">
  <j-icon name="search"></j-icon>
</j-button>`,
      variants: `<j-button iconOnly variant="ghost" ariaLabel="Settings">
  <j-icon name="settings"></j-icon>
</j-button>`,
      states: `<j-button iconOnly ariaLabel="Loading" loading></j-button>
<j-button iconOnly ariaLabel="Disabled" disabled>
  <j-icon name="settings"></j-icon>
</j-button>`,
    },
    usage: ['Use in toolbars, compact tables, cards, and overlay headers.'],
    variants: ['filled icon button', 'ghost icon button', 'outline icon button'],
    sizes: ['sm, md, lg, xl'],
    states: ['default', 'hover/focus', 'disabled', 'loading'],
    inputs: [
      prop('iconOnly', 'boolean', 'false', 'Applies icon-only sizing.'),
      prop('ariaLabel', 'string', "''", 'Required accessible label when no text label is visible.'),
      prop('variant', 'JButtonVariant', "'filled'", 'Visual treatment.'),
    ],
    outputs: [event('onClick', 'MouseEvent', 'Emits when activated.')],
    cssVariables: buttonCssVariables,
    accessibility: ['Always provide ariaLabel because there is no visible text.'],
    bestPractices: [
      'Use familiar Lucide icons and tooltips for commands that are not universally obvious.',
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    category: 'Data Display',
    icon: 'layers',
    selector: 'j-card',
    importPath: 'jrng-ui/card',
    status: 'Stable',
    description: 'A surface that groups related content, actions, or metrics.',
    whenToUse:
      'Use Card to contain a coherent piece of information, not as a general page wrapper.',
    code: {
      importCode: `import { JCardComponent } from 'jrng-ui/card';`,
      basic: `<j-card title="Order summary" subtitle="Current month">
  <p>42 orders created.</p>
</j-card>`,
      variants: `<j-card title="Elevated" elevated></j-card>
<j-card title="Bordered" bordered></j-card>
<j-card title="Soft" variant="soft"></j-card>`,
      states: `<j-card title="Loading" skeleton></j-card>
<j-card title="Interactive" interactive></j-card>

<!-- KPI composition -->
<j-card title="Monthly revenue" subtitle="Compared with last month">
  <strong class="metric-value">$84,250</strong>
  <j-badge value="+12.4%" severity="success" />
  <j-progress-bar [value]="72" label="72% of target" />
</j-card>`,
    },
    usage: [
      'Use cards for repeated items, dashboard widgets, forms, profiles, products, pricing, and short content groups.',
      'Compose KPI cards from Card slots, typography, Badge, Progress Bar, and chart components instead of using metric-specific Card inputs.',
    ],
    variants: ['default', 'elevated', 'bordered', 'soft'],
    sizes: ['Use compact for denser lists and default for standard content.'],
    states: ['default', 'interactive', 'loading skeleton', 'empty content', 'error content'],
    inputs: [
      prop('title / header', 'string', "''", 'Main heading.'),
      prop('subtitle / subheader', 'string', "''", 'Secondary text.'),
      prop('variant', 'default | elevated | bordered | soft', "'default'", 'Surface style.'),
      prop('compact', 'boolean', 'false', 'Reduces spacing.'),
    ],
    outputs: noOutputs,
    accessibility: ['Use semantic headings inside cards when the card starts a section.'],
    bestPractices: ['Do not nest cards inside cards. Put repeated card items in a grid or list.'],
    templates: ['jCardHeader, jCardBody, jCardFooter, and jCardActions projection regions.'],
    relatedComponents: ['Badge', 'Progress Bar', 'Chart', 'Skeleton', 'Empty State'],
    limitations: [
      'Card intentionally has no metric-specific inputs; compose dashboard content inside its slots.',
    ],
  },
  {
    slug: 'badge',
    name: 'Badge',
    category: 'Data Display',
    icon: 'badge',
    selector: 'j-badge',
    importPath: 'jrng-ui/badge',
    status: 'Stable',
    description: 'A small count or status indicator.',
    whenToUse: 'Use Badge for compact values such as counts, unread items, or short state labels.',
    code: {
      importCode: `import { JBadgeComponent } from 'jrng-ui/badge';`,
      basic: `<j-badge value="12"></j-badge>`,
      variants: `<j-badge value="Active" severity="success"></j-badge>
<j-badge value="Warning" severity="warning"></j-badge>
<j-badge value="Error" severity="danger"></j-badge>`,
      sizes: `<j-badge value="Sm" size="sm"></j-badge>
<j-badge value="Lg" size="lg"></j-badge>`,
    },
    usage: ['Use for short, low-detail indicators near labels or controls.'],
    variants: ['primary, secondary, success, warning, danger, info, neutral'],
    sizes: ['sm, md, lg'],
    states: ['active marker through the active input'],
    inputs: [
      prop('value', 'string', "''", 'Displayed text.'),
      prop('severity', 'JSeverity', "'primary'", 'Color intent.'),
      prop('rounded', 'boolean', 'true', 'Uses pill shape.'),
    ],
    outputs: noOutputs,
    accessibility: ['Do not communicate status by color alone; use readable text too.'],
    bestPractices: ['Keep badge text very short. Use Tag when the label is content, not a count.'],
  },
  {
    slug: 'tag',
    name: 'Tag',
    category: 'Data Display',
    icon: 'tag',
    selector: 'j-tag',
    importPath: 'jrng-ui/tag',
    status: 'Stable',
    description: 'A labeled pill for categories, filters, and removable labels.',
    whenToUse: 'Use Tag to show metadata or selected filters.',
    code: {
      importCode: `import { JTagComponent } from 'jrng-ui/tag';`,
      basic: `<j-tag label="Design"></j-tag>`,
      variants: `<j-tag label="Success" severity="success"></j-tag>
<j-tag label="Danger" severity="danger"></j-tag>
<j-tag label="Removable" removable></j-tag>`,
      sizes: `<j-tag label="Small" size="sm"></j-tag>
<j-tag label="Large" size="lg"></j-tag>`,
    },
    usage: ['Use for facets, categories, labels, and selected chips.'],
    variants: ['severity colors', 'rounded', 'removable'],
    sizes: ['sm, md, lg'],
    states: ['default', 'removable'],
    inputs: [
      prop('label', 'string', "''", 'Tag text.'),
      prop('removable', 'boolean', 'false', 'Shows a remove button.'),
      prop('removeLabel', 'string', "'Remove'", 'Accessible label for remove button.'),
    ],
    outputs: [event('remove', 'MouseEvent', 'Emits when the remove button is clicked.')],
    accessibility: [
      'Use a specific removeLabel when many tags are shown, for example Remove Design filter.',
    ],
    bestPractices: ['Avoid long tag text. Wrap tags to multiple lines in narrow containers.'],
  },
  {
    slug: 'pick-list',
    name: 'Pick List',
    category: 'Data & Tables',
    icon: 'list-check',
    selector: 'j-pick-list',
    importPath: 'jrng-ui/pick-list',
    status: 'Stable',
    description: 'A compact two-panel chooser for adding, removing, and ordering selected options.',
    whenToUse:
      'Use Pick List when users assemble a small ordered selection from an available collection.',
    code: {
      importCode: `import { JPickListComponent } from 'jrng-ui/pick-list';`,
      basic: `<j-pick-list
  [(source)]="availableFields"
  [(target)]="selectedFields"
  sourceHeader="Available fields"
  targetHeader="Report columns"
  filter
/>`,
      variants: `<j-pick-list [(source)]="availableFields" [(target)]="selectedFields">
  <ng-template #jPickListAdd><j-icon name="plus" /></ng-template>
  <ng-template #jPickListAddAll><span><j-icon name="plus" /> Add all</span></ng-template>
  <ng-template #jPickListMoveUp><j-icon name="chevron-up" /></ng-template>
  <ng-template #jPickListMoveDown><j-icon name="chevron-down" /></ng-template>
  <ng-template #jPickListRemove><j-icon name="minus" /></ng-template>
  <ng-template #jPickListClear><span><j-icon name="close" /> Clear</span></ng-template>
</j-pick-list>`,
      angular: `availableFields = [
  { label: 'Customer', value: 'customer' },
  { label: 'Status', value: 'status' },
  { label: 'Created date', value: 'createdAt' },
  { label: 'Internal notes', value: 'notes', disabled: true }
];

selectedFields = [
  { label: 'Order number', value: 'order' },
  { label: 'Total', value: 'total' }
];`,
    },
    usage: [
      'Use two-way source and target bindings when the parent must retain the changed collections.',
      'Project an action template when an icon or richer content is useful; omit it to retain the readable default label.',
    ],
    variants: ['default text actions', 'custom labels', 'projected icon or rich action content'],
    sizes: ['The two panels stack below 720px and remain touch friendly.'],
    states: ['available', 'selected', 'disabled option', 'filtered', 'empty'],
    inputs: [
      prop(
        'source / target',
        'readonly JSelectionOptionSource[]',
        '[]',
        'Available and selected collections.',
      ),
      prop('sourceHeader / targetHeader', 'string', 'descriptive defaults', 'Panel headings.'),
      prop('filter', 'boolean', 'false', 'Shows the available-item search field.'),
      prop('addLabel / addAllLabel', 'string', "'Add' / 'Add all'", 'Default add action text.'),
      prop(
        'removeLabel / clearLabel',
        'string',
        "'Remove' / 'Clear'",
        'Default removal action text.',
      ),
      prop(
        'moveUpLabel / moveDownLabel',
        'string',
        "'Up' / 'Down'",
        'Default ordering action text.',
      ),
      prop(
        'addAllAriaLabel / clearAriaLabel',
        'string',
        'descriptive defaults',
        'Accessible names retained for custom content.',
      ),
    ],
    outputs: [
      event(
        'sourceChange',
        'readonly JSelectionOptionSource[]',
        'Emits when the available collection changes.',
      ),
      event(
        'targetChange',
        'readonly JSelectionOptionSource[]',
        'Emits when the selected collection or order changes.',
      ),
    ],
    cssVariables: surfaceCssVariables,
    accessibility: [
      'Every item action keeps an item-specific aria-label even when its visible content is replaced by an icon.',
      'Disabled options and unavailable move directions disable their corresponding buttons.',
    ],
    bestPractices: [
      'Keep source and target labels explicit and preserve a meaningful DOM order.',
      'For icon-only templates, rely on the component button aria-label rather than adding duplicate icon speech.',
    ],
    commonMistakes: [
      'Do not use one-way bindings if the parent needs the updated source and target arrays.',
    ],
  },
  {
    slug: 'grid',
    name: 'Grid',
    category: 'Layout',
    icon: 'layout-grid',
    selector: 'j-grid',
    importPath: 'jrng-ui/grid',
    status: 'Stable',
    description:
      'A responsive layout grid composed from containers, rows, and columns—not a data table.',
    whenToUse:
      'Use Grid to arrange page regions, forms, dashboards, and cards across responsive breakpoints.',
    code: {
      importCode: `import { JGridComponent, JGridRowComponent, JGridColumnComponent } from 'jrng-ui/grid';`,
      basic: `<j-grid>
  <j-row>
    <j-col size="12" md="8">Main content</j-col>
    <j-col size="12" md="4">Sidebar</j-col>
  </j-row>
</j-grid>`,
      variants: `<j-grid fixed>
  <j-row>
    <j-col size="12" sm="6" lg="3">Quarter 1</j-col>
    <j-col size="12" sm="6" lg="3">Quarter 2</j-col>
    <j-col size="12" sm="6" lg="3">Quarter 3</j-col>
    <j-col size="12" sm="6" lg="3">Quarter 4</j-col>
  </j-row>
</j-grid>`,
      states: `<j-grid gutterX="var(--j-spacing-6)" gutterY="var(--j-spacing-5)">
  <j-row align="center" justify="between">
    <j-col size="auto">Intrinsic-width actions</j-col>
    <j-col size="12" lg="6" offsetLg="1" order="first" orderLg="last">
      Responsive offset and order
    </j-col>
  </j-row>
</j-grid>`,
    },
    usage: [
      'Grid establishes the column count and gutters; Row groups columns; Col owns spans and responsive changes.',
      'Breakpoint inputs are mobile-first: a value continues at wider sizes until another value overrides it.',
      'Use j-grid-layout for an automatic repeated-item grid when explicit rows and spans are unnecessary.',
    ],
    variants: ['fluid container', 'fixed responsive container', 'custom max-width container'],
    sizes: ['sm 576px', 'md 768px', 'lg 992px', 'xl 1200px', 'xxl 1400px'],
    states: ['equal width', 'fixed span', 'auto width', 'offset', 'ordered', 'wrapped'],
    inputs: [
      prop('columns', 'number', '12', 'Number of tracks used to calculate spans and offsets.'),
      prop('gutterX', 'string', 'var(--j-spacing-4)', 'Horizontal row and column gutter.'),
      prop('gutterY', 'string', 'var(--j-spacing-4)', 'Vertical row gutter.'),
      prop('fixed', 'boolean', 'false', 'Uses responsive container maximum widths.'),
      prop('containerPadding', 'boolean', 'true', 'Keeps the outer half-gutter alignment.'),
      prop('maxWidth', 'string', "''", 'Overrides the fluid container maximum width.'),
      prop('styleClass', 'string', "''", 'Additional host class.'),
    ],
    outputs: noOutputs,
    cssVariables: [
      cssVar('--j-grid-column-count', '12', 'Inherited track count used by columns.'),
      cssVar('--j-grid-gutter-x', 'var(--j-spacing-4)', 'Inherited horizontal gutter.'),
      cssVar('--j-grid-gutter-y', 'var(--j-spacing-4)', 'Inherited vertical gutter.'),
      cssVar('--j-grid-max-width', 'none', 'Optional container maximum width.'),
    ],
    accessibility: [
      'Grid is presentation-only and does not add table, grid, row, or cell ARIA roles.',
      'Keep content in its natural semantic reading order; responsive order changes only visual placement.',
    ],
    bestPractices: [
      'Start with a full-width mobile span, then add only the breakpoints where the layout changes.',
      'Prefer natural source order and use responsive ordering sparingly.',
    ],
    commonMistakes: [
      'Do not use Grid for tabular records; use j-table or j-data-grid.',
      'Do not confuse j-col with j-column: j-col is layout, while j-column declares table metadata.',
    ],
  },
  {
    slug: 'row',
    name: 'Grid Row',
    category: 'Layout',
    icon: 'rows-3',
    selector: 'j-row',
    importPath: 'jrng-ui/grid',
    status: 'Stable',
    description: 'A wrapping flex row that aligns layout columns and coordinates their gutters.',
    whenToUse: 'Use Grid Row directly inside j-grid to group one responsive line of j-col items.',
    code: {
      importCode: `import { JGridRowComponent } from 'jrng-ui/grid';`,
      basic: `<j-row align="center" justify="between">
  <j-col size="auto">Heading</j-col>
  <j-col size="auto">Actions</j-col>
</j-row>`,
    },
    usage: ['Rows wrap by default and inherit gutters from the nearest j-grid.'],
    variants: ['wrapped', 'no-wrap', 'custom gutters'],
    sizes: ['Size is determined by projected columns and content.'],
    states: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    inputs: [
      prop(
        'align',
        'start | center | end | stretch | baseline',
        "'stretch'",
        'Cross-axis alignment.',
      ),
      prop(
        'justify',
        'start | center | end | between | around | evenly',
        "'start'",
        'Main-axis distribution.',
      ),
      prop('wrap', 'boolean', 'true', 'Allows columns to move onto additional lines.'),
      prop('gutterX / gutterY', 'string', "''", 'Overrides inherited gutters for this row.'),
    ],
    outputs: noOutputs,
    accessibility: ['The row is visual layout and intentionally adds no ARIA row role.'],
    bestPractices: ['Project j-col children directly so gutter alignment remains predictable.'],
  },
  {
    slug: 'col',
    name: 'Grid Column',
    category: 'Layout',
    icon: 'columns-3',
    selector: 'j-col',
    importPath: 'jrng-ui/grid',
    status: 'Stable',
    description: 'A responsive layout column with spans, auto width, offsets, and visual ordering.',
    whenToUse: 'Use Grid Column inside j-row to define how content occupies the responsive grid.',
    code: {
      importCode: `import { JGridColumnComponent } from 'jrng-ui/grid';`,
      basic: `<j-col size="12" sm="6" lg="4">Responsive content</j-col>`,
      variants: `<j-col>Equal width</j-col>
<j-col size="auto">Intrinsic width</j-col>
<j-col size="12" md="6" offsetMd="3">Centered at md</j-col>`,
    },
    usage: [
      'Omit size for equal-width columns, use auto for intrinsic width, or set a numeric span.',
    ],
    variants: ['equal width', 'numeric span', 'auto width', 'responsive offset and order'],
    sizes: ['size', 'sm', 'md', 'lg', 'xl', 'xxl'],
    states: ['base and mobile-first breakpoint overrides'],
    inputs: [
      prop(
        'size / sm / md / lg / xl / xxl',
        'number | numeric string | auto | null',
        'null',
        'Base and responsive spans.',
      ),
      prop(
        'offset / offsetSm / ...',
        'number | numeric string | null',
        'null',
        'Base and responsive start offsets.',
      ),
      prop(
        'order / orderSm / ...',
        'number | numeric string | first | last | null',
        'null',
        'Base and responsive visual order.',
      ),
      prop('styleClass', 'string', "''", 'Additional host class.'),
    ],
    outputs: noOutputs,
    accessibility: ['Responsive ordering does not change screen-reader or keyboard order.'],
    bestPractices: ['Keep DOM order meaningful and let columns wrap on small screens.'],
    commonMistakes: [
      'j-col is not a table column definition; j-column remains part of jrng-ui/table.',
    ],
  },
  {
    slug: 'table',
    name: 'Table',
    category: 'Data Display',
    icon: 'table',
    selector: 'j-table',
    importPath: 'jrng-ui/table',
    status: 'Stable',
    description:
      'A data table for structured rows and columns with sorting, pagination, selection, and states.',
    whenToUse: 'Use Table for comparable data where users need to scan across columns.',
    code: {
      importCode: `import { JTableCellTemplateDirective, JTableComponent, JTableColumn, JTableEmptyTemplateDirective, JTableHeaderTemplateDirective, JTableLoadingTemplateDirective } from 'jrng-ui/table';`,
      basic: `<j-table [value]="orders" [columns]="columns" caption="Recent orders" />`,
      variants: `<j-table [value]="orders" [columns]="columns" variant="striped"></j-table>
<j-table [value]="orders" [columns]="columns" variant="bordered"></j-table>
<j-table [value]="orders" [columns]="columns" variant="minimal"></j-table>
<j-table [value]="orders" [columns]="columns" variant="card"></j-table>`,
      sizes: `<j-table [value]="orders" [columns]="columns" density="compact"></j-table>
<j-table [value]="orders" [columns]="columns" density="spacious"></j-table>`,
      states: `<j-table [value]="[]" [columns]="columns" emptyTitle="No orders yet" emptyActionLabel="Create order"></j-table>
<j-table [value]="orders" [columns]="columns" loading loadingVariant="skeleton" [skeletonRows]="4"></j-table>
<j-table [value]="orders" [columns]="columns" loading loadingVariant="overlay"></j-table>
<j-table [value]="[]" [columns]="columns" [error]="loadError" emptyActionLabel="Retry"></j-table>`,
      angular: `interface OrderRow {
  id: number;
  order: string;
  status: 'paid' | 'overdue';
  total: number;
}

orders: OrderRow[] = [
  { id: 1001, order: 'ORD-1001', status: 'paid', total: 428 },
  { id: 1002, order: 'ORD-1002', status: 'overdue', total: 185 }
];

actions: JTableAction[] = [
  { key: 'view', label: 'View' },
  { key: 'edit', label: 'Edit' }
];

columns: JTableColumn<OrderRow>[] = [
  { field: 'order', header: 'Order', sortable: true },
  { field: 'status', header: 'Status', filterable: true, filter: {
      type: 'select', operator: 'equals',
      options: [{ label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }]
  }},
  { field: 'total', header: 'Total', align: 'end', filterable: true,
    filter: { type: 'number', operator: 'between' } },
  { field: 'actions', header: 'Actions', type: 'action', actions }
];

tableConfig: JTableConfig = {
  pagination: true,
  sortable: true,
  multiSort: true,
  filterRow: true,
  columnFilter: true,
  globalSearch: true,
  reorderableRows: true,
  lockableRows: true,
  reorderableColumns: true,
  resizableColumns: true,
  frozenColumns: true,
  maximizable: true,
  exportable: true,
  stateful: true,
  columnManager: true,
  size: 'medium',
  export: { rows: 'selected', visibleColumnsOnly: true }
};

loadError = new Error('Orders could not be loaded.');`,
    },
    usage: ['Use for orders, users, files, tasks, invoices, and audit logs.'],
    variants: [
      'default - preserves the established table presentation',
      'striped - alternates row grouping for long scanning tasks',
      'bordered - emphasizes both row and column relationships',
      'minimal - reduces chrome inside cards and detail pages',
      'card - groups each row as an independent responsive surface',
      'basic table',
      'pagination',
      'sorting',
      'multi sorting',
      'filter row',
      'column filter',
      'global search',
      'row actions',
      'row reorder',
      'row lock/unlock',
      'column show/hide',
      'column reorder',
      'column resize',
      'maximize/minimize',
      'stateful table',
      'export event',
    ],
    sizes: ['compact density', 'comfortable density', 'spacious density'],
    states: [
      'default',
      'loading skeleton',
      'empty table',
      'filtered empty',
      'selected rows',
      'locked rows',
      'maximized',
    ],
    inputs: [
      prop('value', 'readonly T[]', '[]', 'Flat rows to render.'),
      prop(
        'columns',
        'readonly JTableColumn<T>[]',
        '[]',
        'Strongly typed column configuration, formatting, and behavior.',
      ),
      prop('config', 'JTableConfig', 'null', 'Object API for enterprise table behavior.'),
      prop(
        'variant',
        'default | striped | bordered | minimal | card',
        "'default'",
        'Selects a complete table presentation concept without changing its data or events.',
      ),
      prop('paginator', 'boolean', 'false', 'Shows pagination controls.'),
      prop('loading', 'boolean', 'false', 'Shows loading rows.'),
      prop(
        'loadingVariant',
        'skeleton | spinner | progress | overlay',
        "'skeleton'",
        'Loading presentation; this is a state, not a visual variant.',
      ),
      prop('skeletonRows', 'number', '5', 'Number of loading placeholder rows.'),
      prop(
        'skeletonColumns',
        'readonly JTableSkeletonColumn[]',
        '[]',
        'Optional loading placeholder widths.',
      ),
      prop(
        'emptyState',
        'auto | no-data | no-results | error',
        "'auto'",
        'Selects or automatically derives the integrated empty state.',
      ),
      prop(
        'emptyTitle / emptyDescription / emptyIcon',
        'string',
        'state defaults',
        'No-data content.',
      ),
      prop(
        'noResultsTitle / noResultsDescription / noResultsIcon',
        'string',
        'state defaults',
        'Filtered no-results content.',
      ),
      prop(
        'error',
        'unknown',
        'null',
        'Activates the loading-failed state and exposes its value to templates.',
      ),
      prop(
        'emptyActionLabel',
        'string',
        "''",
        'Optional action for the active empty or error state.',
      ),
      prop('selectionMode', 'single | multiple | checkbox | none', "'none'", 'Selection behavior.'),
      prop('filterRow', 'boolean', 'true', 'Shows column filter controls for filterable columns.'),
      prop(
        'filterModel',
        'JTableFilterModel',
        '{ items: [] }',
        'Controlled field, operator, and value model for local or server filtering.',
      ),
      prop('lockableRows', 'boolean', 'false', 'Shows row lock/unlock controls.'),
      prop(
        'maximizable',
        'boolean',
        'false',
        'Shows maximize/minimize control with Escape support.',
      ),
      prop(
        'showGlobalFilter / showColumnManager / showExport / showTableState',
        'boolean',
        'false',
        'Toolbar controls.',
      ),
      prop(
        'exportConfig',
        'JTableExportOptions',
        '{}',
        'CSV export mode, filename, and visible-column behavior.',
      ),
      prop(
        'size',
        'small | medium | large',
        "'medium'",
        'Physical table size retained for compatibility.',
      ),
      prop(
        'density',
        'compact | comfortable | spacious',
        "'comfortable'",
        'Information spacing independent from variant.',
      ),
    ],
    outputs: [
      event('sortChange / onSortChange', 'JTableSort', 'Emits when sorting changes.'),
      event('pageChange / onPageChange', 'JTablePageChange', 'Emits when page changes.'),
      event(
        'filterChange / onFilterChange',
        'JTableFilterChange',
        'Emits when global or column filters change.',
      ),
      event('filterModelChange', 'JTableFilterModel', 'Emits the normalized typed filter model.'),
      event(
        'export / onExport',
        'JTableExportEvent',
        'Emits before CSV download; call preventDefault for server export.',
      ),
      event('rowClick / onRowClick', 'JTableRowClickEvent', 'Emits when a row is clicked.'),
      event(
        'rowDoubleClick / onRowDoubleClick',
        'JTableRowClickEvent',
        'Emits when a row is double-clicked.',
      ),
      event(
        'selectionChange / onSelectionChange',
        'JTableSelection',
        'Emits selection model changes.',
      ),
      event('rowReorder / onRowReorder', 'JTableReorderEvent', 'Emits after row drag reorder.'),
      event('rowLock / onRowLock', 'JTableRowLockEvent', 'Emits when a row is locked.'),
      event('rowUnlock / onRowUnlock', 'JTableRowLockEvent', 'Emits when a row is unlocked.'),
      event(
        'columnReorder / onColumnReorder',
        'JTableColumnReorderEvent',
        'Emits after column drag reorder.',
      ),
      event(
        'columnResize / onColumnResize',
        'JTableColumnResizeEvent',
        'Emits after column resize.',
      ),
      event(
        'columnVisibilityChange / onColumnVisibilityChange',
        'JTableColumnVisibilityChangeEvent',
        'Emits when a column is shown or hidden.',
      ),
      event('stateSave / onStateSave', 'JTableState', 'Emits after state is saved.'),
      event('stateRestore / onStateRestore', 'JTableState', 'Emits after state is restored.'),
      event('maximize / onMaximize', 'void', 'Emits when expanded table mode opens.'),
      event('minimize / onMinimize', 'void', 'Emits when expanded table mode closes.'),
      event(
        'emptyAction',
        'JTableEmptyActionEvent',
        'Emits when the integrated-state action is activated.',
      ),
    ],
    cssVariables: [
      cssVar('--j-table-bg', 'var(--j-color-card, #ffffff)', 'Table surface background.'),
      cssVar('--j-table-header-bg', 'var(--j-color-muted, #f8fafc)', 'Header row background.'),
      cssVar(
        '--j-table-header-color',
        'var(--j-color-muted-foreground, #64748b)',
        'Header text color.',
      ),
      cssVar(
        '--j-table-border-color',
        'var(--j-color-border, #e2e8f0)',
        'Row and column border color.',
      ),
      cssVar(
        '--j-table-row-hover-bg',
        'color-mix(in srgb, var(--j-color-primary) 6%, transparent)',
        'Hover row background.',
      ),
      cssVar(
        '--j-table-selected-bg',
        'color-mix(in srgb, var(--j-color-primary) 12%, transparent)',
        'Selected row background.',
      ),
      cssVar(
        '--j-table-filter-bg',
        'var(--j-color-card, #ffffff)',
        'Toolbar and filter area background.',
      ),
      cssVar(
        '--j-table-locked-bg',
        'color-mix(in srgb, var(--j-color-warning) 10%, var(--j-table-bg))',
        'Locked row background.',
      ),
      cssVar(
        '--j-table-action-color',
        'var(--j-color-foreground, #111827)',
        'Action menu text color inside table cells.',
      ),
      cssVar(
        '--j-table-resize-handle-color',
        'var(--j-color-border, #e2e8f0)',
        'Column resize handle color.',
      ),
    ],
    accessibility: [
      'Use clear column headers and do not hide critical actions behind hover-only UI.',
      'Sortable headers expose aria-sort and remain keyboard operable.',
      'Selection exposes row state; loading uses aria-busy and one restrained status announcement.',
      'Use Tree Table for hierarchical rows so level and expansion semantics remain correct.',
    ],
    bestPractices: [
      'Use pagination or lazy loading for large datasets.',
      'Keep column labels short and align numeric columns to the end.',
      'Use focused template directives only where column configuration does not express the content.',
    ],
    commonMistakes: [
      'Do not use variant for loading, error, selection, pagination, or hierarchy.',
      'Do not model hierarchical records in Table; use the separately tested Tree Table.',
      'Compatibility column, empty-state, and table-skeleton selectors should not be used in new table implementations.',
    ],
  },
  {
    slug: 'tree-table',
    name: 'Tree Table',
    category: 'Data Display',
    icon: 'table',
    selector: 'j-tree-table',
    importPath: 'jrng-ui/tree-table',
    status: 'Stable',
    description:
      'A separate hierarchical tree grid with expansion, lazy children, and propagated node selection.',
    whenToUse:
      'Use Tree Table when each row can own child rows and users must navigate or select that hierarchy.',
    code: {
      importCode: `import { JTreeTableCellTemplateDirective, JTreeTableComponent } from 'jrng-ui/tree-table';
import { JTableColumn } from 'jrng-ui/table';
import { TreeNode } from 'jrng-ui/tree';`,
      basic: `<j-tree-table [value]="nodes" [columns]="columns" [(expandedKeys)]="expandedKeys" />`,
      variants: `<j-tree-table [value]="nodes" [columns]="columns" selectionMode="checkbox" [propagateSelectionDown]="true" [propagateSelectionUp]="true" />`,
      states: `<j-tree-table [value]="lazyNodes" [columns]="columns" lazy (nodeExpand)="loadChildren($event)" />`,
      angular: `interface FileRecord { type: string; size: string; }

nodes: TreeNode<FileRecord>[] = [
  { key: 'workspace', label: 'Workspace', data: { type: 'Folder', size: '24 items' }, children: [
    { key: 'brief', label: 'Project brief', data: { type: 'Document', size: '1.2 MB' }, leaf: true }
  ]}
];

columns: JTableColumn<FileRecord>[] = [
  { field: 'type', header: 'Type' },
  { field: 'size', header: 'Size', align: 'end' }
];

expandedKeys = new Set(['workspace']);`,
    },
    usage: ['Use for folders, work breakdowns, nested permissions, and hierarchical inventories.'],
    variants: [
      'Tree grid',
      'lazy hierarchy',
      'single selection',
      'multiple selection',
      'checkbox selection',
    ],
    sizes: ['Uses the shared table spacing and column tokens.'],
    states: [
      'collapsed',
      'expanded',
      'selected',
      'partially selected',
      'loading children',
      'disabled',
    ],
    inputs: [
      prop('value', 'readonly TreeNode<T>[]', '[]', 'Hierarchical nodes.'),
      prop('columns', 'readonly JTableColumn<T>[]', '[]', 'Columns for each node data object.'),
      prop('expandedKeys', 'Set<string>', 'new Set()', 'Controlled expanded node keys.'),
      prop('childrenField', 'string', "'children'", 'Custom child collection field.'),
      prop(
        'togglerColumn',
        'string',
        'first column',
        'Column containing hierarchy indentation and toggler.',
      ),
      prop('lazy', 'boolean', 'false', 'Requests children when an unloaded node expands.'),
      prop(
        'selectionMode',
        'none | single | multiple | checkbox',
        "'none'",
        'Node selection behavior.',
      ),
      prop(
        'propagateSelectionDown / propagateSelectionUp',
        'boolean',
        'true',
        'Checkbox hierarchy propagation.',
      ),
    ],
    outputs: [
      event(
        'nodeExpand',
        'JTreeTableNodeEvent<T>',
        'Emits when a node expands; load lazy children here.',
      ),
      event('nodeCollapse', 'JTreeTableNodeEvent<T>', 'Emits when a node collapses.'),
      event('nodeSelect', 'JTreeTableNodeEvent<T>', 'Emits when a node is selected.'),
      event('nodeUnselect', 'JTreeTableNodeEvent<T>', 'Emits when a node is unselected.'),
      event('selectionChange', 'readonly TreeNode<T>[]', 'Emits the controlled node selection.'),
    ],
    cssVariables: [
      cssVar('--j-table-border-color', 'var(--j-color-border)', 'Shared row and column boundary.'),
      cssVar('--j-tree-table-indent', '1.25rem', 'Logical indentation for each hierarchy depth.'),
    ],
    accessibility: [
      'Uses treegrid, row, and gridcell roles with aria-level, aria-expanded, aria-selected, aria-posinset, and aria-setsize.',
      'Arrow Up and Down move between visible nodes; Right expands or enters children; Left collapses or returns to the parent.',
      'Home and End move to the first and last visible node; Enter or Space selects.',
    ],
    bestPractices: [
      'Provide stable node keys and mark terminal nodes as leaf.',
      'Keep the hierarchy toggler in the primary identifying column.',
    ],
    commonMistakes: [
      'Do not use flat Table for hierarchical records.',
      'Do not mutate expanded or selected sets without updating their bound values.',
    ],
  },
  {
    slug: 'action-menu',
    name: 'Action Menu',
    category: 'Data Display',
    icon: 'ellipsis',
    selector: 'j-action-menu',
    importPath: 'jrng-ui/table',
    status: 'Stable',
    description: 'A compact row action control used with tables and dense data lists.',
    whenToUse:
      'Use Action Menu when each table row exposes a small set of commands such as view, edit, duplicate, or delete.',
    code: {
      importCode: `import { JActionMenuComponent, JTableAction } from 'jrng-ui/table';`,
      basic: `<j-action-menu popup [actions]="actions" [row]="row" (actionClick)="runAction($event)"></j-action-menu>`,
      angular: `actions: JTableAction[] = [
  { key: 'view', label: 'View', icon: 'View' },
  { key: 'edit', label: 'Edit', icon: 'Edit' },
  { key: 'download', label: 'Download', icon: 'Download' },
  { key: 'duplicate', label: 'Duplicate', icon: 'Copy' },
  { key: 'approve', label: 'Approve', severity: 'success' },
  { key: 'reject', label: 'Reject', severity: 'warning' },
  { key: 'archive', label: 'Archive', disabled: true },
  { key: 'delete', label: 'Delete', severity: 'danger' }
];

row = {
  id: 1001,
  order: 'ORD-1001',
  customer: 'Acme Ltd',
  status: 'Processing'
};`,
    },
    usage: [
      'Use inside table cells or compact list rows.',
      'Keep commands short and disable actions that are unavailable.',
    ],
    variants: ['inline actions', 'popup menu', 'icons', 'disabled actions', 'danger actions'],
    sizes: ['Uses compact action sizing for dense data surfaces.'],
    states: ['default', 'hover', 'focused', 'disabled'],
    inputs: [
      prop('actions', 'readonly JTableAction[]', '[]', 'Actions rendered for the row.'),
      prop('row', 'JTableRow', '{}', 'Current row data.'),
      prop('rowIndex', 'number', '0', 'Index of the row in the table.'),
      prop('popup', 'boolean', 'false', 'Renders an overflow trigger with popup menu.'),
      prop('ariaLabel', 'string', "'Row actions'", 'Accessible label.'),
    ],
    outputs: [event('actionClick', 'JTableActionEvent', 'Emits when an action is activated.')],
    cssVariables: surfaceCssVariables,
    accessibility: ['The action group exposes a row actions label and uses native buttons.'],
    bestPractices: [
      'Avoid hiding the only critical row action in a menu when users must act repeatedly.',
    ],
  },
  {
    slug: 'column-filter',
    name: 'Column Filter',
    category: 'Data Display',
    icon: 'filter',
    selector: 'j-column-filter',
    importPath: 'jrng-ui/table',
    status: 'Stable',
    description:
      'A configurable table-header filter for text, numbers, dates, booleans, selects, multi-selects, ranges, and match modes.',
    whenToUse: 'Use Column Filter inside table headers when users need per-column filtering.',
    code: {
      importCode: `import { JColumnFilterComponent } from 'jrng-ui/table';`,
      basic: `<j-column-filter
  field="status"
  label="Status"
  type="select"
  operator="equals"
  [options]="statusOptions"
  (filterModelChange)="filter($event)" />`,
    },
    usage: ['Use in table headers, advanced filter panels, or any configured filtering surface.'],
    variants: [
      'text',
      'number and range',
      'date and range',
      'boolean',
      'select',
      'multi-select',
      'custom operator list',
    ],
    sizes: ['Compact by default for table headers.'],
    states: ['empty', 'typed value', 'focused'],
    inputs: [
      prop('field', 'string', "''", 'Field being filtered.'),
      prop('label', 'string', "''", 'Accessible label suffix.'),
      prop('value', 'unknown', "''", 'Current filter value.'),
      prop(
        'type',
        'JTableFilterType',
        "'text'",
        'Selects the appropriate accessible input control.',
      ),
      prop(
        'operator / operators',
        'JTableFilterOperator',
        "'contains'",
        'Current and available match modes.',
      ),
      prop('options', 'readonly JTableFilterOption[]', '[]', 'Options for select filters.'),
    ],
    outputs: [
      event('filterChange', 'JColumnFilterChange', 'Legacy field and string value event.'),
      event(
        'filterModelChange',
        'JColumnFilterModelChange',
        'Emits field, operator, and typed value.',
      ),
    ],
    cssVariables: formCssVariables,
    accessibility: ['The visible label is screen-reader only so table headers stay compact.'],
    bestPractices: [
      'Pair column filters with clear table empty states so users understand filtered results.',
    ],
  },
  {
    slug: 'filter-bar',
    name: 'Filter Bar',
    category: 'Data Display',
    icon: 'list-filter',
    selector: 'j-filter-bar',
    importPath: 'jrng-ui/filter-bar',
    status: 'Stable',
    description:
      'A responsive business filter surface with search, status, date range, reset, apply, export, and advanced filter slots.',
    whenToUse:
      'Use Filter Bar above tables, audit logs, reports, and list pages that need repeatable search and filtering controls.',
    code: {
      importCode: `import { JFilterBarComponent } from 'jrng-ui/filter-bar';`,
      basic: `<j-filter-bar
  [statuses]="statuses"
  showDateRange
  showExport
  showAdvancedToggle
  (filterChange)="filters = $event"
  (apply)="load($event)"
  (reset)="resetFilters()"
  (export)="exportRows($event)">
</j-filter-bar>`,
      variants: `<j-filter-bar searchPlaceholder="Search orders" [statuses]="['Draft', 'Paid', 'Overdue']">
  <j-select jFilterBarFilters label="Team" [options]="teams"></j-select>
  <div jFilterBarAdvanced>Advanced controls go here.</div>
</j-filter-bar>`,
    },
    usage: [
      'Use for list pages where users repeatedly search, apply filters, reset filters, and export data.',
    ],
    variants: ['search only', 'status filter', 'date range', 'advanced slot', 'export action'],
    sizes: ['Responsive grid collapses to one column on narrow screens.'],
    states: ['idle', 'edited filters', 'advanced expanded', 'reset'],
    inputs: [
      prop('statuses', 'readonly string[]', '[]', 'Status select options.'),
      prop(
        'showDateRange',
        'boolean',
        'false',
        'Shows accessible JRNG date pickers while preserving YYYY-MM-DD filter values.',
      ),
      prop('showExport', 'boolean', 'false', 'Shows export button.'),
      prop('showAdvancedToggle', 'boolean', 'false', 'Shows advanced filter toggle.'),
    ],
    outputs: [
      event(
        'filterChange',
        'JFilterBarValue',
        'Emits on search, status, date, or advanced changes.',
      ),
      event('apply', 'JFilterBarValue', 'Emits when Apply is pressed.'),
      event('reset', 'void', 'Emits when Reset is pressed.'),
      event('export', 'JFilterBarValue', 'Emits when Export is pressed.'),
    ],
    cssVariables: [
      cssVar('--j-filter-bar-bg', 'var(--j-color-card, #ffffff)', 'Filter bar background.'),
      cssVar(
        '--j-filter-bar-border-color',
        'var(--j-color-border, #e2e8f0)',
        'Filter bar border color.',
      ),
      cssVar(
        '--j-filter-bar-primary-bg',
        'var(--j-color-primary, #2563eb)',
        'Apply button background.',
      ),
    ],
    accessibility: [
      'Search, status, and date controls have visible labels; date pickers support keyboard grid navigation and constrained start/end dates.',
    ],
    bestPractices: [
      'Emit filters to application state and keep server-side export behavior in the app.',
    ],
  },
  {
    slug: 'metric-card',
    name: 'Metric Card',
    category: 'Business',
    icon: 'chart-no-axes-column',
    selector: 'j-metric-card',
    importPath: 'jrng-ui/metric-card',
    status: 'Stable',
    description:
      'A compact KPI card for dashboard metrics with optional trend, icon, footer, and loading state.',
    whenToUse:
      'Use Metric Card for business dashboards, operational counters, and executive summaries.',
    code: {
      importCode: `import { JMetricCardComponent } from 'jrng-ui/metric-card';`,
      basic: `<j-metric-card title="Revenue" value="$42.8k" trend="up" trendLabel="+12%" footer="Month to date"></j-metric-card>`,
      variants: `<j-metric-card title="Churn" value="1.8%" trend="down" trendLabel="-0.4%"></j-metric-card>
<j-metric-card title="Loading" loading></j-metric-card>`,
    },
    usage: ['Use for revenue, counts, conversion, queue volume, SLA, and activity metrics.'],
    variants: ['up, down, and neutral trend', 'icon slot through icon input', 'loading skeleton'],
    sizes: ['Metric cards size from content and grid layout.'],
    states: ['default', 'positive trend', 'negative trend', 'neutral trend', 'loading'],
    inputs: [
      prop('title', 'string', "''", 'Metric label.'),
      prop('value', 'string | number', "''", 'Primary metric value.'),
      prop('trend', 'up | down | neutral', "'neutral'", 'Trend intent.'),
      prop('trendLabel', 'string', "''", 'Visible trend text.'),
      prop('footer', 'string', "''", 'Secondary context.'),
      prop('loading', 'boolean', 'false', 'Shows loading placeholder.'),
    ],
    outputs: noOutputs,
    accessibility: ['Do not rely on trend color alone; include trendLabel text.'],
    bestPractices: ['Keep values short and put date ranges or caveats in footer text.'],
  },
  {
    slug: 'stat-card',
    name: 'Stat Card',
    category: 'Business',
    icon: 'activity',
    selector: 'j-stat-card',
    importPath: 'jrng-ui/stat-card',
    status: 'Stable',
    description:
      'A general statistic card for counts, status summaries, and operational snapshots.',
    whenToUse:
      'Use Stat Card when a metric needs a quieter, more neutral surface than Metric Card.',
    code: {
      importCode: `import { JStatCardComponent } from 'jrng-ui/stat-card';`,
      basic: `<j-stat-card title="Open orders" value="128" trend="up" trendLabel="+18 today"></j-stat-card>`,
      states: `<j-stat-card title="Loading" loading></j-stat-card>`,
    },
    usage: ['Use for counters, queue sizes, open tasks, exceptions, and concise health summaries.'],
    variants: ['icon', 'trend', 'footer', 'loading'],
    sizes: ['Designed for responsive dashboard grids.'],
    states: ['default', 'up/down/neutral trend', 'loading'],
    inputs: [
      prop('title', 'string', "''", 'Stat label.'),
      prop('value', 'string | number', "''", 'Primary value.'),
      prop('trend', 'up | down | neutral', "'neutral'", 'Trend style.'),
      prop('trendLabel', 'string', "''", 'Trend text.'),
      prop('icon', 'string', "''", 'Optional visual marker.'),
      prop('loading', 'boolean', 'false', 'Shows loading placeholder.'),
    ],
    outputs: noOutputs,
    accessibility: ['Use explicit titles and trend text so the value has context.'],
    bestPractices: ['Use the same number format across a group of related cards.'],
  },
  {
    slug: 'status-chip',
    name: 'Status Chip',
    category: 'Business',
    icon: 'badge-check',
    selector: 'j-status-chip',
    importPath: 'jrng-ui/status-chip',
    status: 'Stable',
    description: 'A compact business status label with a dot and severity color.',
    whenToUse:
      'Use Status Chip for workflow states such as Ready, Review, Blocked, Queued, or Archived.',
    code: {
      importCode: `import { JStatusChipComponent } from 'jrng-ui/status-chip';`,
      basic: `<j-status-chip status="active"></j-status-chip>`,
      variants: `<j-status-chip status="pending"></j-status-chip>
<j-status-chip status="approved"></j-status-chip>
<j-status-chip status="rejected"></j-status-chip>
<j-status-chip status="overdue"></j-status-chip>
<j-status-chip label="Custom" [colorMap]="colors" status="custom"></j-status-chip>`,
    },
    usage: ['Use in tables, detail headers, cards, timeline items, and workflow summaries.'],
    variants: [
      'active',
      'inactive',
      'pending',
      'approved',
      'rejected',
      'draft',
      'paid',
      'unpaid',
      'overdue',
      'completed',
      'failed',
      'custom color map',
    ],
    sizes: ['sm, md, lg'],
    states: ['static status display'],
    inputs: [
      prop('label', 'string', "''", 'Visible status text override.'),
      prop('status', 'JBusinessStatus | string', "''", 'Business status alias.'),
      prop('severity', 'JSeverity', "'neutral'", 'Fallback status intent.'),
      prop('colorMap', 'Record<string, JStatusChipColor>', '{}', 'Custom status colors.'),
      prop('size', 'sm | md | lg', "'md'", 'Chip density.'),
    ],
    outputs: noOutputs,
    accessibility: ['Use readable label text; color only supports the label.'],
    bestPractices: ['Keep labels short and consistent with workflow terminology.'],
  },
  {
    slug: 'page-header',
    name: 'Page Header',
    category: 'Business',
    icon: 'panel-top',
    selector: 'j-page-header',
    importPath: 'jrng-ui/page-header',
    status: 'Stable',
    description:
      'A page title block with breadcrumbs, description, actions, and optional tabs slot.',
    whenToUse: 'Use Page Header at the top of admin pages, record details, and settings views.',
    code: {
      importCode: `import { JPageHeaderComponent } from 'jrng-ui/page-header';`,
      basic: `<j-page-header title="Orders" subtitle="Review fulfillment and exceptions" showBack (back)="goBack()">
  <j-button jPageSecondaryActions label="Export" variant="outline"></j-button>
  <j-button jPagePrimaryAction label="Create order"></j-button>
</j-page-header>`,
      variants: `<j-page-header variant="default" title="Orders">...</j-page-header>
<j-page-header variant="stacked" title="Orders">...</j-page-header>
<j-page-header variant="centered" title="Welcome">...</j-page-header>`,
    },
    usage: ['Use to standardize title, context, and actions across business app pages.'],
    variants: [
      'default for ordinary admin pages',
      'stacked when actions need a full row',
      'centered for onboarding and focused landing views',
    ],
    sizes: ['Responsive layout collapses actions below the title on narrow screens.'],
    states: ['with breadcrumbs', 'with actions', 'with tabs'],
    inputs: [
      prop('title', 'string', "''", 'Page title.'),
      prop('subtitle', 'string', "''", 'Supporting text.'),
      prop('description', 'string', "''", 'Legacy supporting text alias.'),
      prop('breadcrumbs', 'readonly JPageHeaderBreadcrumb[]', '[]', 'Breadcrumb path.'),
      prop('showBack', 'boolean', 'false', 'Shows a back button.'),
      prop('variant', 'default | stacked | centered', "'default'", 'Presentation concept.'),
      prop('styleClass', 'string', "''", 'Custom class.'),
    ],
    outputs: [event('back', 'void', 'Emits when the back button is activated.')],
    accessibility: ['Breadcrumbs use nav semantics and current page marking.'],
    bestPractices: ['Keep one primary action visible and group secondary actions separately.'],
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    category: 'Business',
    icon: 'inbox',
    selector: 'j-empty-state',
    importPath: 'jrng-ui/empty-state',
    status: 'Stable',
    description:
      'A reusable empty result or empty page state with title, description, icon, and action slot.',
    whenToUse:
      'Use Empty State when a page, table, search, or filtered view has no content to show.',
    code: {
      importCode: `import { JEmptyStateComponent } from 'jrng-ui/empty-state';`,
      basic: `<j-empty-state title="No orders found" description="Try changing filters or create a new order.">
  <j-button jEmptyStateAction label="Create order"></j-button>
</j-empty-state>`,
      variants: `<j-empty-state variant="default" title="No orders" />
<j-empty-state variant="inline" title="No matching rows" />
<j-empty-state variant="panel" title="Start your first project" />`,
    },
    usage: ['Use for search misses, first-run states, empty tables, and missing records.'],
    variants: [
      'default for full empty regions',
      'inline for tables and compact result areas',
      'panel for first-run and creation prompts',
    ],
    sizes: ['Default and compact density.'],
    states: ['empty result', 'first run', 'filtered empty'],
    inputs: [
      prop('title', 'string', "''", 'Primary empty-state title.'),
      prop('description', 'string', "''", 'Supporting text.'),
      prop('icon', 'string', "''", 'Optional visual marker.'),
      prop('compact', 'boolean', 'false', 'Reduces spacing.'),
      prop('variant', 'default | inline | panel', "'default'", 'Presentation concept.'),
    ],
    outputs: noOutputs,
    accessibility: [
      'Use clear text explaining why the state is empty and what action is available.',
    ],
    bestPractices: [
      'For filtered empty states, suggest changing filters before suggesting creation.',
    ],
  },
  {
    slug: 'toast',
    name: 'Toast',
    category: 'Feedback',
    icon: 'message-square-more',
    selector: 'j-toast',
    importPath: 'jrng-ui/toast',
    status: 'Stable',
    description: 'A temporary message stack for success, error, warning, and info feedback.',
    whenToUse:
      'Use Toast after background actions such as saving, deleting, uploading, or exporting.',
    code: {
      importCode: `import { JrToastContainerComponent, JrToastService } from 'jrng-ui/toast';`,
      basic: `<j-toast position="top-right"></j-toast>`,
      variants: `toast.success('Order saved');
toast.error('Could not save order');
toast.warning('Review required');
toast.info('Export started');`,
      states: `toast.show({
  severity: 'success',
  summary: 'Saved',
  detail: 'The order was updated.',
  life: 3000
});`,
    },
    usage: ['Place one toast container near the app root and call the service from workflows.'],
    variants: ['success', 'error', 'warning', 'info', 'neutral'],
    sizes: ['Toast size is content-based. Keep content concise.'],
    states: ['visible', 'dismissed', 'sticky', 'with actions'],
    inputs: [prop('position', 'JToastPosition', "'top-right'", 'Stack position.')],
    outputs: noOutputs,
    accessibility: [
      'Messages use live-region semantics. Keep error messages clear and actionable.',
    ],
    bestPractices: [
      'Do not use toast for critical confirmation that blocks the user; use Dialog instead.',
    ],
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'Feedback',
    icon: 'loader-circle',
    selector: 'j-progress-bar',
    importPath: 'jrng-ui/progress-bar',
    status: 'Stable',
    description: 'A visual indicator for determinate or indeterminate progress.',
    whenToUse:
      'Use Progress when the user is waiting for upload, import, setup, or processing work.',
    code: {
      importCode: `import { JProgressBarComponent } from 'jrng-ui/progress-bar';`,
      basic: `<j-progress-bar [value]="64" label="Upload progress"></j-progress-bar>`,
      variants: `<j-progress-bar variant="default" [value]="72"></j-progress-bar>
<j-progress-bar variant="segmented" [value]="80"></j-progress-bar>
<j-progress-bar variant="labeled" [value]="42"></j-progress-bar>`,
    },
    usage: [
      'Use determinate progress when you know the percentage and indeterminate when work has started but duration is unknown.',
    ],
    variants: [
      'default for general progress',
      'segmented for staged or checkpoint-oriented work',
      'labeled when the percentage must remain visible inside the control',
    ],
    sizes: ['Progress bar height is fixed by component styling; wrap with labels for context.'],
    states: ['0%', 'in progress', 'complete', 'indeterminate'],
    inputs: [
      prop('value', 'number', '0', 'Progress percentage from 0 to 100.'),
      prop('indeterminate', 'boolean', 'false', 'Shows a looping loading indicator.'),
      prop('label', 'string', "''", 'Accessible label.'),
      prop('variant', 'default | segmented | labeled', "'default'", 'Presentation concept.'),
    ],
    outputs: noOutputs,
    accessibility: [
      'Provide a label for screen readers. Determinate progress exposes aria-valuenow.',
    ],
    bestPractices: ['Show nearby text for long-running work, not just the bar.'],
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    icon: 'panel-top',
    selector: 'j-skeleton',
    importPath: 'jrng-ui/skeleton',
    status: 'Stable',
    description: 'A placeholder used while content is loading.',
    whenToUse: 'Use Skeleton when the layout is known but content has not loaded yet.',
    code: {
      importCode: `import { JSkeletonComponent } from 'jrng-ui/skeleton';`,
      basic: `<j-skeleton width="12rem"></j-skeleton>`,
      variants: `<j-skeleton variant="text"></j-skeleton>
<j-skeleton variant="avatar"></j-skeleton>
<j-skeleton variant="button" width="8rem"></j-skeleton>
<j-skeleton variant="card"></j-skeleton>
<j-skeleton variant="table" [rows]="3"></j-skeleton>`,
      states: `<j-skeleton animation="pulse"></j-skeleton>
<j-skeleton [animated]="false"></j-skeleton>`,
    },
    usage: ['Use for cards, tables, avatars, and text blocks while data is loading.'],
    variants: ['rectangle', 'text', 'avatar', 'button', 'card', 'table'],
    sizes: ['Use width and height for custom dimensions.'],
    states: ['wave animation', 'pulse animation', 'static'],
    inputs: [
      prop(
        'variant',
        'rectangle | text | avatar | card | table',
        "'rectangle'",
        'Skeleton layout preset.',
      ),
      prop('width / height', 'string', "'100%' / '1rem'", 'Custom dimensions.'),
      prop('rows', 'number', '4', 'Rows for table skeleton.'),
    ],
    outputs: noOutputs,
    accessibility: [
      'Skeletons are aria-hidden. Pair the loading region with status text if loading is important.',
    ],
    bestPractices: ['Match the approximate shape of the content to avoid layout shift.'],
  },
  {
    slug: 'copy-button',
    name: 'Copy Button',
    category: 'Feedback',
    icon: 'copy',
    selector: 'j-copy-button',
    importPath: 'jrng-ui/copy-button',
    status: 'Stable',
    description:
      'A clipboard button with copied feedback for code, tokens, IDs, links, and generated values.',
    whenToUse:
      'Use Copy Button when users need to copy a known text value without selecting it manually.',
    code: {
      importCode: `import { JCopyButtonComponent } from 'jrng-ui/copy-button';`,
      basic: `<j-copy-button text="npm install jrng-ui"></j-copy-button>`,
      states: `<j-copy-button text="INV-2048" copiedLabel="Copied ID"></j-copy-button>
<j-copy-button text="support@example.com" label="Copy email"></j-copy-button>
<j-copy-button text="+1 555 0100" label="Copy phone"></j-copy-button>
<j-copy-button text="Disabled" disabled></j-copy-button>`,
    },
    usage: ['Use near code snippets, IDs, share links, API keys, and generated references.'],
    variants: ['default label', 'custom copied label', 'disabled'],
    sizes: ['Uses compact button sizing.'],
    states: ['default', 'copied', 'disabled'],
    inputs: [
      prop('text', 'string', "''", 'Text written to the clipboard.'),
      prop('label', 'string', "'Copy'", 'Default button label.'),
      prop('copiedLabel', 'string', "'Copied'", 'Feedback label after copying.'),
      prop('failedLabel', 'string', "'Copy failed'", 'Feedback label after failure.'),
      prop('ariaLabel', 'string', "'Copy to clipboard'", 'Accessible label.'),
    ],
    outputs: [
      event('copied', 'string', 'Emits copied text after activation.'),
      event('copyFailed', 'unknown', 'Emits clipboard failure details.'),
    ],
    cssVariables: buttonCssVariables,
    accessibility: [
      'Provide an ariaLabel that names the value when several copy buttons appear together.',
    ],
    bestPractices: [
      'Keep copied feedback short and avoid copying hidden sensitive data unexpectedly.',
    ],
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    icon: 'panel-top',
    selector: 'j-tabs',
    importPath: 'jrng-ui/tabs',
    status: 'Stable',
    description: 'A tab set that switches between related panels without leaving the page.',
    whenToUse:
      'Use Tabs for sibling views at the same level, such as Overview, Activity, and Settings.',
    code: {
      importCode: `import { JTabsComponent, JTabComponent } from 'jrng-ui/tabs';`,
      basic: `<j-tabs>
  <j-tab header="Overview">Overview content</j-tab>
  <j-tab header="Activity">Activity content</j-tab>
</j-tabs>`,
      variants: `<j-tabs variant="default">...</j-tabs>
<j-tabs variant="pills">...</j-tabs>
<j-tabs variant="segmented">...</j-tabs>`,
    },
    usage: ['Use for a small number of related panels.'],
    variants: [
      'default for content-heavy application tabs',
      'pills for lightweight category switching',
      'segmented for a small mutually exclusive view switch',
    ],
    sizes: ['Tabs use standard control sizing.'],
    states: ['active', 'disabled', 'closable'],
    inputs: [
      prop('selectedIndex', 'number', '0', 'Active tab index.'),
      prop('variant', 'default | pills | segmented', "'default'", 'Presentation concept.'),
      prop('lazy', 'boolean', 'false', 'Renders tab content after activation.'),
      prop('scrollable', 'boolean', 'true', 'Allows horizontal scrolling.'),
    ],
    outputs: [
      event('selectedIndexChange', 'number', 'Emits when the active tab changes.'),
      event('tabClose', 'number', 'Emits when a closable tab is closed.'),
    ],
    accessibility: ['Tabs use tablist, tab, and tabpanel roles with keyboard navigation.'],
    bestPractices: ['Avoid using tabs as a replacement for primary app navigation.'],
  },
  {
    slug: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    icon: 'route',
    selector: 'j-breadcrumb',
    importPath: 'jrng-ui/breadcrumb',
    status: 'Stable',
    description: 'A path indicator that helps users understand where they are in a hierarchy.',
    whenToUse: 'Use Breadcrumb in deep pages where users may need to go back to a parent section.',
    code: {
      importCode: `import { JBreadcrumbComponent } from 'jrng-ui/breadcrumb';`,
      basic: `<j-breadcrumb [home]="home" [model]="items"></j-breadcrumb>`,
      variants: `<j-breadcrumb variant="default" [home]="home" [model]="items" />
<j-breadcrumb variant="contained" [home]="home" [model]="items" />
<j-breadcrumb variant="steps" [home]="home" [model]="items" />`,
      angular: `home = { label: 'Home', routerLink: '/' };
items = [
  { label: 'Docs', routerLink: '/docs' },
  { label: 'Components' }
];`,
    },
    usage: ['Use in nested admin, documentation, or file-manager pages.'],
    variants: [
      'default for ordinary page hierarchy',
      'contained when the trail needs its own visual region',
      'steps for short task or setup hierarchies',
    ],
    sizes: ['Breadcrumb is compact by default.'],
    states: ['link', 'current page', 'disabled'],
    inputs: [
      prop('home', 'JBreadcrumbItem', 'undefined', 'Optional first item.'),
      prop('model', 'readonly JBreadcrumbItem[]', '[]', 'Breadcrumb items.'),
      prop('variant', 'default | contained | steps', "'default'", 'Presentation concept.'),
    ],
    outputs: [
      event('itemClick', 'JBreadcrumbClickEvent', 'Emits when a breadcrumb item is clicked.'),
    ],
    accessibility: ['The current item exposes aria-current page.'],
    bestPractices: ['Keep labels short and use real page names.'],
  },
  {
    slug: 'menu',
    name: 'Menu',
    category: 'Navigation',
    icon: 'menu',
    selector: 'j-menu',
    importPath: 'jrng-ui/menu',
    status: 'Stable',
    description: 'A vertical action or navigation menu with optional submenus and badges.',
    whenToUse:
      'Use Menu for action lists, profile menus, contextual commands, and compact navigation.',
    code: {
      importCode: `import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';`,
      basic: `<j-menu [model]="items" ariaLabel="Project actions"></j-menu>`,
      angular: `items: JMenuItem[] = [
  { label: 'Edit', icon: 'Edit' },
  { label: 'Archive', badge: 'New' },
  { separator: true },
  { label: 'Delete', disabled: true }
];`,
    },
    usage: ['Use inline for navigation or popup mode for contextual commands.'],
    variants: ['inline', 'popup', 'nested submenu', 'separator', 'badge'],
    sizes: ['Menu items use standard compact action sizing.'],
    states: ['focused', 'disabled', 'open submenu', 'popup visible'],
    inputs: [
      prop('model', 'readonly JMenuItem[]', '[]', 'Menu item tree.'),
      prop('popup', 'boolean', 'false', 'Uses popup positioning.'),
      prop('visible', 'boolean', 'false', 'Controls popup visibility.'),
    ],
    outputs: [
      event(
        'itemClick',
        '{ item: JMenuItem; originalEvent: Event }',
        'Emits when a leaf item is activated.',
      ),
      event('visibleChange', 'boolean', 'Emits popup visibility changes.'),
    ],
    accessibility: ['Menu uses menu roles and supports keyboard navigation.'],
    bestPractices: ['Use concise item labels and separators for distinct command groups.'],
  },
  {
    slug: 'responsive-sidebar',
    name: 'Responsive Sidebar',
    category: 'Navigation',
    icon: 'panel-left-open',
    selector: 'j-responsive-sidebar',
    importPath: 'jrng-ui/responsive-sidebar',
    status: 'Stable',
    description:
      'A responsive side navigation container that becomes an overlay on smaller screens.',
    whenToUse: 'Use Sidebar for persistent secondary navigation or filters.',
    code: {
      importCode: `import { JResponsiveSidebarComponent } from 'jrng-ui/responsive-sidebar';`,
      basic: `<j-responsive-sidebar title="Workspace" [(open)]="sidebarOpen">
  <a routerLink="/docs">Docs</a>
</j-responsive-sidebar>`,
    },
    usage: ['Use for app sections, settings navigation, and responsive filter panels.'],
    variants: ['desktop aside', 'mobile overlay with mask'],
    sizes: ['Width is controlled by layout and responsive styles.'],
    states: ['open', 'closed', 'mobile overlay'],
    inputs: [
      prop('open', 'boolean', 'false', 'Controls visibility on mobile.'),
      prop('title', 'string', "'Navigation'", 'Header title.'),
      prop('styleClass', 'string', "''", 'Custom root class.'),
    ],
    outputs: [event('openChange', 'boolean', 'Emits when the model changes.')],
    accessibility: ['Provide clear navigation labels inside the sidebar.'],
    bestPractices: ['Keep sidebar navigation scannable and grouped.'],
  },
  {
    slug: 'dialog',
    name: 'Dialog',
    category: 'Overlay',
    icon: 'message-square',
    selector: 'j-dialog',
    importPath: 'jrng-ui/dialog',
    status: 'Stable',
    description: 'A modal or positioned overlay for focused tasks and confirmations.',
    whenToUse: 'Use Dialog when the user must complete or dismiss a focused task before returning.',
    code: {
      importCode: `import { JDialogComponent } from 'jrng-ui/dialog';`,
      basic: `<j-dialog header="Edit profile" [(visible)]="visible">
  Dialog content
</j-dialog>`,
      variants: `<j-dialog header="Small" size="sm" [(visible)]="visible"></j-dialog>
<j-dialog header="Right panel" position="right" [(visible)]="visible"></j-dialog>`,
    },
    usage: ['Use for edit forms, confirmations, detail previews, and short workflows.'],
    variants: ['modal', 'non-modal', 'sizes sm to full', 'positions', 'draggable', 'resizable'],
    sizes: ['sm, md, lg, xl, full'],
    states: ['open', 'closed', 'dismissable backdrop', 'not closable'],
    inputs: [
      prop('visible', 'boolean', 'false', 'Controls dialog visibility.'),
      prop('header', 'string', "''", 'Dialog title.'),
      prop('size', 'sm | md | lg | xl | full', "'md'", 'Width preset.'),
      prop('dismissableMask', 'boolean', 'true', 'Allows backdrop click close.'),
    ],
    outputs: [
      event('visibleChange', 'boolean', 'Emits when visibility changes.'),
      event('opened', 'void', 'Emits on open.'),
      event('closed', 'JDialogCloseReason', 'Emits after close.'),
    ],
    accessibility: ['Dialogs trap focus and should return focus to the trigger after close.'],
    bestPractices: [
      'Use clear primary and secondary actions. Do not place long full-page workflows inside a small dialog.',
    ],
  },
  {
    slug: 'confirm-dialog',
    name: 'Confirm Dialog',
    category: 'Overlay',
    icon: 'shield-alert',
    selector: 'j-confirm-dialog',
    importPath: 'jrng-ui/confirm-dialog',
    status: 'Stable',
    description: 'A service-backed confirmation dialog for blocking accept or reject decisions.',
    whenToUse: 'Use Confirm Dialog before destructive or hard-to-undo actions.',
    code: {
      importCode: `import { JConfirmDialogComponent, JConfirmationService } from 'jrng-ui/confirm-dialog';`,
      basic: `<j-confirm-dialog></j-confirm-dialog>
<j-button label="Delete" severity="danger" (onClick)="confirmDelete()"></j-button>`,
      angular: `constructor(private readonly confirmation: JConfirmationService) {}

confirmDelete(): void {
  this.confirmation.delete({
    title: 'Delete record',
    message: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    closeOnOverlayClick: false
  });
}`,
    },
    usage: [
      'Place one j-confirm-dialog near the app root.',
      'Call JConfirmationService from the workflow that needs confirmation.',
    ],
    variants: [
      'delete',
      'approve',
      'reject',
      'logout',
      'unsaved changes',
      'custom message',
      'accept and reject callbacks',
    ],
    sizes: ['Fixed dialog width suitable for short confirmations.'],
    states: ['closed', 'open', 'accepted', 'rejected'],
    inputs: [
      prop('title / header', 'string', "''", 'Dialog title.'),
      prop('message', 'string', "''", 'Dialog message.'),
      prop('confirmText / acceptLabel', 'string', "'OK'", 'Confirm button label.'),
      prop('cancelText / rejectLabel', 'string', "'Cancel'", 'Cancel button label.'),
      prop('severity', 'info | warning | danger | success', "'info'", 'Confirmation intent.'),
      prop('closeOnOverlayClick', 'boolean', 'true', 'Allows backdrop click close.'),
      prop('closeOnEscape', 'boolean', 'true', 'Allows Escape close.'),
    ],
    outputs: [],
    cssVariables: [
      cssVar('--j-overlay-backdrop-bg', 'rgb(15 23 42 / 56%)', 'Confirmation backdrop color.'),
      ...surfaceCssVariables,
    ],
    accessibility: [
      'Uses alertdialog semantics with title and message relationships.',
      'Initial focus moves to the confirm action, Tab and Shift+Tab remain inside the dialog, and focus returns to the previously focused control after closing.',
      'Escape and backdrop dismissal can be disabled independently. Body scroll remains locked while a confirmation is open.',
    ],
    bestPractices: [
      'Use action-specific labels such as Delete instead of generic OK for destructive actions.',
      'Keep both confirm and cancel labels concise and unambiguous.',
    ],
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    category: 'Overlay',
    icon: 'panel-right-open',
    selector: 'j-drawer',
    importPath: 'jrng-ui/drawer',
    status: 'Stable',
    description:
      'A responsive side or sheet overlay for secondary workflows, filters, and details.',
    whenToUse:
      'Use Drawer for contextual details or filters that should not replace the current page.',
    code: {
      importCode: `import { JDrawerComponent } from 'jrng-ui/drawer';`,
      basic: `<j-drawer header="Filters" [(visible)]="drawerOpen">
  Drawer content
</j-drawer>`,
      variants: `<j-drawer position="right" header="Details" [(visible)]="visible"></j-drawer>
<j-drawer position="bottom" header="Filters" [(visible)]="visible"></j-drawer>`,
    },
    usage: ['Use for filters, contextual detail panels, and short secondary forms.'],
    variants: ['left', 'right', 'top', 'bottom', 'mobile bottom sheet'],
    sizes: ['Width and height can be controlled with inputs or layout constraints.'],
    states: ['open', 'closed', 'modal backdrop', 'dismissed with escape or backdrop'],
    inputs: [
      prop('visible', 'boolean', 'false', 'Controls visibility.'),
      prop('header', 'string', "''", 'Drawer title.'),
      prop('position', 'left | right | top | bottom', "'right'", 'Drawer edge.'),
      prop('modal', 'boolean', 'true', 'Shows a blocking backdrop.'),
      prop(
        'contained',
        'boolean',
        'false',
        'Contains the drawer inside its positioned parent for embedded workspaces and previews.',
      ),
    ],
    outputs: [
      event('openChange', 'boolean', 'Emits visibility model changes.'),
      event('opened', 'void', 'Emits after opening.'),
      event('closed', 'JDrawerCloseReason', 'Emits close reason.'),
    ],
    cssVariables: [
      cssVar('--j-overlay-backdrop-bg', 'rgb(15 23 42 / 56%)', 'Modal backdrop color.'),
      cssVar('--j-drawer-snap-height', '32rem', 'Mobile bottom-sheet snap height.'),
      ...surfaceCssVariables,
    ],
    accessibility: ['Drawer content is exposed as a dialog and traps focus when visible.'],
    bestPractices: [
      'Do not put full multi-page workflows in a drawer; link to a dedicated page instead.',
    ],
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'Overlay',
    icon: 'info',
    selector: '[jTooltip]',
    importPath: 'jrng-ui/tooltip',
    status: 'Stable',
    description: 'A small helper message shown on hover or focus.',
    whenToUse: 'Use Tooltip for short clarification, especially on icon buttons.',
    code: {
      importCode: `import { JTooltipDirective } from 'jrng-ui/tooltip';`,
      basic: `<button jTooltip="Refresh data" tooltipPosition="top">Refresh</button>`,
      variants: `<button jTooltip="More details" tooltipPosition="right">Info</button>`,
    },
    usage: ['Use for brief, non-critical supporting text.'],
    variants: ['top', 'right', 'bottom', 'left'],
    sizes: ['Tooltip size is content-based.'],
    states: ['hidden', 'visible on hover/focus', 'disabled'],
    inputs: [
      prop('jTooltip', 'string', "''", 'Tooltip text.'),
      prop('tooltipPosition', 'top | right | bottom | left', "'top'", 'Preferred placement.'),
      prop('tooltipDisabled', 'boolean', 'false', 'Disables the tooltip.'),
    ],
    outputs: noOutputs,
    accessibility: [
      'Tooltip appears on focus as well as hover. Do not put essential instructions only in a tooltip.',
    ],
    bestPractices: ['Keep tooltip text under one sentence.'],
  },
  {
    slug: 'popover',
    name: 'Popover',
    category: 'Overlay',
    icon: 'message-square-more',
    selector: 'j-popover',
    importPath: 'jrng-ui/popover',
    status: 'Stable',
    description: 'A lightweight floating panel anchored to a target.',
    whenToUse: 'Use Popover for short contextual content, small forms, or additional details.',
    code: {
      importCode: `import { JPopoverComponent } from 'jrng-ui/popover';`,
      basic: `<j-popover [(visible)]="visible" position="bottom">
  Popover content
</j-popover>`,
      variants: `<j-popover position="top"></j-popover>
<j-popover position="right"></j-popover>`,
    },
    usage: ['Use when Dialog is too heavy and Tooltip is too small.'],
    variants: ['top', 'right', 'bottom', 'left', 'dismissable'],
    sizes: ['Content-based with a minimum width.'],
    states: ['open', 'closed', 'dismissed on outside click', 'escape close'],
    inputs: [
      prop('visible', 'boolean', 'false', 'Controls visibility.'),
      prop('position', 'top | right | bottom | left', "'bottom'", 'Preferred placement.'),
      prop('dismissable', 'boolean', 'true', 'Closes on outside click.'),
    ],
    outputs: [
      event('opened', 'void', 'Emits when shown.'),
      event('closed', 'void', 'Emits when hidden.'),
    ],
    accessibility: ['Use for contextual content and keep keyboard dismissal available.'],
    bestPractices: ['Do not use Popover for destructive confirmations; use Dialog.'],
  },
  {
    slug: 'ripple',
    name: 'Ripple',
    category: 'Utilities',
    icon: 'waves',
    selector: '[jRipple]',
    importPath: 'jrng-ui',
    status: 'Stable',
    description: 'A lightweight interaction ripple directive for clickable controls.',
    whenToUse: 'Use Ripple on custom interactive elements that need consistent pointer feedback.',
    code: {
      importCode: `import { JRippleDirective } from 'jrng-ui';`,
      basic: `<button type="button" jRipple>Save</button>`,
      states: `<button type="button" [jRipple]="false">No ripple</button>
<button type="button" jRipple disabled>Disabled</button>`,
    },
    usage: [
      'Use on native buttons or custom clickable elements with keyboard and pointer support.',
    ],
    variants: ['enabled', 'disabled', 'theme-colored ripple'],
    sizes: ['The ripple automatically sizes to the host element.'],
    states: ['pointer down', 'disabled host', 'reduced motion'],
    inputs: [
      prop('jRipple', 'boolean', 'true', 'Enables or disables the directive.'),
      prop('rippleDisabled', 'boolean', 'false', 'Additional disabled flag for host state.'),
    ],
    outputs: [],
    cssVariables: [
      cssVar('--j-ripple-color', 'currentColor', 'Ripple color.'),
      cssVar('--j-ripple-opacity', '0.18', 'Ripple opacity.'),
      cssVar('--j-ripple-duration', '520ms', 'Ripple animation duration.'),
    ],
    accessibility: [
      'The directive does not add semantics; use it only on elements that are already accessible.',
    ],
    bestPractices: [
      'Respect disabled states and avoid using ripple as the only interaction feedback.',
    ],
  },
  {
    slug: 'tour-guide',
    name: 'Tour Guide',
    category: 'Utilities',
    icon: 'route',
    selector: 'JTourService, [jTourStep]',
    importPath: 'jrng-ui/tour',
    status: 'Stable',
    description:
      'Optional guided onboarding tours powered internally by Driver.js and exposed through JRNG UI service and directive APIs.',
    whenToUse:
      'Use Tour Guide for short product onboarding, feature introductions, and release walkthroughs where a few highlighted UI elements help users get started.',
    code: {
      importCode: `import { JTourService, JTourStepDirective, JTourConfig } from 'jrng-ui/tour';`,
      basic: `npm install driver.js`,
      variants: `<button
  type="button"
  jTourStep="create-button"
  tourTitle="Create"
  tourDescription="Click here to create a new record.">
  Create
</button>`,
      states: `this.jTour.start({
  id: 'dashboard-intro-v1',
  steps: [
    {
      element: '#createBtn',
      title: 'Create',
      description: 'Click here to create a new record.',
      side: 'bottom',
      align: 'start'
    }
  ],
  onComplete: (event) => this.saveCompletedTour(event.tourId),
  onSkip: (event) => this.saveSkippedTour(event.tourId)
});`,
      angular: `import { Component, inject } from '@angular/core';
import { JTourService, JTourStepDirective } from 'jrng-ui/tour';

@Component({
  standalone: true,
  imports: [JTourStepDirective],
  template: \`
    <button
      id="createBtn"
      type="button"
      jTourStep="create-button"
      tourTitle="Create"
      tourDescription="Click here to create a new record.">
      Create
    </button>
  \`
})
export class DashboardComponent {
  private readonly jTour = inject(JTourService);

  startTour(): void {
    this.jTour.start({
      id: 'dashboard-intro-v1',
      steps: ['create-button']
    });
  }
}`,
    },
    usage: [
      'Install driver.js only in apps that use tours.',
      'Use the service for tour control and callbacks.',
      'Use jTourStep when template metadata is easier to maintain than CSS selectors.',
    ],
    variants: [
      'service-based tour',
      'directive-based step metadata',
      'selector-based step',
      'per-step placement',
      'completion callback',
      'skip callback',
    ],
    sizes: ['not size-based'],
    states: ['inactive', 'active', 'highlighted step', 'completed', 'skipped', 'destroyed'],
    inputs: [
      prop('JTourConfig.id', 'string', 'undefined', 'Application-defined tour identifier.'),
      prop(
        'JTourConfig.steps',
        'readonly JTourStepInput[]',
        '[]',
        'Tour steps as config objects or registered jTourStep IDs.',
      ),
      prop(
        'JTourStep.element',
        'string | Element',
        'undefined',
        'Element selector or element reference to highlight.',
      ),
      prop(
        'JTourStep.title / description',
        'string',
        'undefined',
        'Popover heading and body text.',
      ),
      prop(
        'JTourStep.side / align',
        'top | right | bottom | left | over / start | center | end',
        'undefined',
        'Preferred popover placement.',
      ),
      prop('jTourStep', 'string', "''", 'Registers an element as reusable tour step metadata.'),
      prop(
        'tourTitle / tourDescription',
        'string',
        "''",
        'Directive metadata used when the step ID is referenced by a tour.',
      ),
    ],
    outputs: [
      event(
        'events$',
        'JTourEvent',
        'Observable stream for start, navigation, completion, skip, destroy, highlight, and deselect events.',
      ),
      event(
        'onStart / onNext / onPrevious',
        'JTourEvent',
        'Per-tour callbacks for lifecycle and navigation.',
      ),
      event(
        'onComplete / onSkip / onDestroy',
        'JTourEvent',
        'Per-tour callbacks for app-managed persistence or analytics.',
      ),
      event(
        'onHighlightStarted / onDeselected',
        'JTourEvent',
        'Per-tour callbacks for highlighted and deselected steps.',
      ),
    ],
    cssVariables: [
      cssVar('--j-tour-overlay-color', 'rgb(15 23 42 / 58%)', 'Tour overlay color.'),
      cssVar('--j-tour-popover-bg', 'var(--j-color-popover, #ffffff)', 'Tour popover background.'),
      cssVar(
        '--j-tour-popover-color',
        'var(--j-color-popover-foreground, #111827)',
        'Tour popover text color.',
      ),
      cssVar(
        '--j-tour-popover-border',
        'var(--j-color-border, #e2e8f0)',
        'Tour popover border color.',
      ),
      cssVar(
        '--j-tour-popover-radius',
        'var(--j-radius-lg, 0.75rem)',
        'Tour popover corner radius.',
      ),
      cssVar(
        '--j-tour-button-bg',
        'var(--j-color-muted, #f1f5f9)',
        'Secondary tour button background.',
      ),
      cssVar(
        '--j-tour-button-color',
        'var(--j-color-foreground, #111827)',
        'Secondary tour button text color.',
      ),
      cssVar(
        '--j-tour-primary-button-bg',
        'var(--j-color-primary, #2563eb)',
        'Primary tour button background.',
      ),
      cssVar(
        '--j-tour-primary-button-color',
        'var(--j-color-primary-foreground, #ffffff)',
        'Primary tour button text color.',
      ),
    ],
    accessibility: [
      'Keep tours short and allow users to close or skip them.',
      'Use clear titles and descriptions that make sense when read by assistive technology.',
      'Do not depend on tours as the only way to discover critical controls.',
    ],
    bestPractices: [
      'Keep completed/skipped persistence in the application, not the component library.',
      'Prefer stable element IDs or jTourStep IDs over brittle selectors.',
      'JRNG UI uses Driver.js internally while keeping app code on JRNG APIs.',
    ],
    commonMistakes: [
      'Do not add driver.js unless the app uses tours.',
      'Do not call start before the target elements are rendered.',
    ],
  },
  {
    slug: 'timeline',
    name: 'Timeline',
    category: 'Utilities',
    icon: 'git-branch',
    selector: 'j-timeline',
    importPath: 'jrng-ui/timeline',
    status: 'Stable',
    description:
      'A vertical or horizontal event timeline for activity, history, and workflow milestones.',
    whenToUse: 'Use Timeline to show chronological activity or ordered workflow steps.',
    code: {
      importCode: `import { JTimelineComponent, JTimelineItem } from 'jrng-ui/timeline';`,
      basic: `<j-timeline [value]="events"></j-timeline>`,
      variants: `<j-timeline variant="default" [value]="events" />
<j-timeline variant="activity" [value]="events" />
<j-timeline variant="alternating" [value]="events" />`,
      angular: `events: JTimelineItem[] = [
  { title: 'Created', content: 'Order was created.', opposite: '09:00', severity: 'info' },
  { title: 'Updated', content: 'Customer address changed.', opposite: '09:30', icon: 'U' },
  { title: 'Approved', content: 'Manager approved it.', opposite: '10:15', severity: 'success' },
  { title: 'File uploaded', content: 'statement.pdf was attached.', opposite: '10:40', color: '#7c3aed' }
];`,
    },
    usage: ['Use for audit trails, fulfillment progress, approvals, and release history.'],
    variants: [
      'default for milestone cards with opposite metadata',
      'activity for dense audit and comment feeds',
      'alternating for editorial histories and release narratives',
    ],
    sizes: ['Timeline size follows content and layout.'],
    states: ['neutral event', 'success', 'warning', 'danger', 'info'],
    inputs: [
      prop('value', 'readonly JTimelineItem[]', '[]', 'Timeline items.'),
      prop('layout', 'vertical | horizontal', "'vertical'", 'Timeline orientation.'),
      prop('compact', 'boolean', 'false', 'Reduces item spacing for activity logs.'),
      prop('variant', 'default | activity | alternating', "'default'", 'Presentation concept.'),
      prop('styleClass', 'string', "''", 'Custom root class.'),
    ],
    outputs: [],
    cssVariables: surfaceCssVariables,
    accessibility: ['Timeline renders as an ordered list so the event order is meaningful.'],
    bestPractices: ['Keep each event title short and put details in content text.'],
  },
  {
    slug: 'file-browser',
    name: 'File Browser',
    category: 'Data Display',
    icon: 'folder',
    selector: 'j-file-browser',
    importPath: 'jrng-ui/file-browser',
    status: 'Stable',
    description:
      'A transport-agnostic file explorer with breadcrumbs, semantic file types, list and grid views, sorting, selection, bulk actions, and responsive states.',
    whenToUse:
      'Use File Browser for document libraries, cloud-drive adapters, attachment pickers, media collections, and admin file management.',
    code: {
      importCode: `import { JFileBrowserComponent, JFileBrowserItem } from 'jrng-ui/file-browser';`,
      basic: `<j-file-browser
  title="Client documents"
  [items]="files"
  [breadcrumbs]="path"
  [selection]="selectedIds"
  selectionMode="multiple"
  (folderOpen)="loadFolder($event.item)"
  (selectionChange)="selectedIds = $event" />`,
      variants: `<j-file-browser variant="default" viewMode="list" [items]="files" />
<j-file-browser variant="compact" viewMode="list" [items]="files" />
<j-file-browser variant="picker" selectionMode="single" [items]="files" />
<j-file-browser variant="gallery" viewMode="grid" [items]="media" />`,
      states: `<j-file-browser [items]="[]" />
<j-file-browser [items]="files" loading />
<j-file-browser [items]="files" disabled />`,
      angular: `files: JFileBrowserItem[] = [
  { id: 'folder-1', name: 'Invoices', kind: 'folder', modifiedAt: new Date() },
  { id: 'file-1', name: 'Quarterly report.xlsx', kind: 'file', size: 245760 },
  { id: 'file-2', name: 'Signed agreement.pdf', kind: 'file', size: 845120 }
];

path = [
  { id: 'root', label: 'Files' },
  { id: 'clients', label: 'Clients' }
];

selectedIds: string[] = ['file-2'];`,
    },
    usage: ['Connect events to Google Drive, S3, REST, IndexedDB, or any application data source.'],
    variants: [
      'default full explorer',
      'compact admin list',
      'picker selection flow',
      'gallery media hierarchy',
    ],
    sizes: ['Responsive list becomes a compact three-column row on narrow screens.'],
    states: ['populated', 'empty', 'loading', 'disabled', 'selected', 'selection limit'],
    inputs: [
      prop('items', 'readonly JFileBrowserItem[]', '[]', 'Files and folders to render.'),
      prop('breadcrumbs', 'readonly JFileBrowserBreadcrumb[]', '[]', 'Current folder path.'),
      prop('selection', 'readonly string[]', '[]', 'Controlled selected item IDs.'),
      prop('viewMode', 'list | grid', "'list'", 'Current layout mode.'),
      prop(
        'variant',
        'default | compact | picker | gallery',
        "'default'",
        'Complete presentation concept.',
      ),
      prop('selectionMode', 'none | single | multiple', "'none'", 'Selection behavior.'),
      prop('actions', 'readonly JFileBrowserAction[]', '[]', 'Transport-independent bulk actions.'),
    ],
    outputs: [
      event('itemOpen / folderOpen', 'JFileBrowserItemEvent', 'Emits item navigation intentions.'),
      event('selectionChange', 'readonly string[]', 'Emits the next controlled selection.'),
      event('action', 'JFileBrowserActionEvent', 'Emits a configured bulk action.'),
      event('sortChange', 'JFileBrowserSort', 'Emits requested sorting.'),
      event('upload / createFolder / refresh', 'void', 'Emits toolbar intentions.'),
    ],
    cssVariables: surfaceCssVariables,
    accessibility: [
      'Arrow keys move between items, Enter opens, Space selects, selection changes are announced, and breadcrumbs expose the current page.',
    ],
    bestPractices: [
      'Keep storage APIs and permissions in the consuming application; provide only display data and handle emitted intentions.',
    ],
  },
  {
    slug: 'file-upload',
    name: 'File Upload',
    category: 'Utilities',
    icon: 'upload',
    selector: 'j-file-upload',
    importPath: 'jrng-ui/file-upload',
    status: 'Stable',
    description:
      'A file upload queue with drag-and-drop, validation, progress, and manual upload events.',
    whenToUse: 'Use File Upload for attachments, imports, documents, and media queues.',
    code: {
      importCode: `import { JFileUploadComponent } from 'jrng-ui/file-upload';
import { JFilePreviewComponent } from 'jrng-ui/file-preview';`,
      basic: `<j-file-upload multiple accept=".csv,.xlsx" (upload)="uploadFiles($event)"></j-file-upload>`,
      states: `<j-file-upload mode="basic" chooseLabel="Choose file"></j-file-upload>
<j-file-upload [maxFileSize]="5000000"></j-file-upload>
<j-file-preview fileName="statement.pdf" [fileSize]="245760" url="/files/statement.pdf"></j-file-preview>`,
    },
    usage: [
      'Use auto mode for immediate workflows and customUpload for application-managed uploads.',
    ],
    variants: [
      'basic',
      'advanced',
      'single file',
      'multiple files',
      'drag and drop',
      'manual upload',
      'auto upload',
      'preview and download actions',
    ],
    sizes: ['The upload surface fills its container width.'],
    states: ['empty queue', 'drag over', 'uploading', 'complete', 'error', 'cancelled'],
    inputs: [
      prop('mode', 'basic | advanced', "'advanced'", 'Upload UI mode.'),
      prop('multiple', 'boolean', 'false', 'Allows more than one file.'),
      prop('accept', 'string', "''", 'Accepted file types.'),
      prop('maxFileSize', 'number', '0', 'Maximum file size in bytes.'),
    ],
    outputs: [
      event('filesChange', 'readonly File[]', 'Emits current files.'),
      event('upload', 'JFileUploadEvent', 'Emits when upload starts.'),
      event('remove', 'File', 'Emits when a file is removed.'),
      event(
        'previewFile / downloadFile',
        'JFileUploadItem',
        'Emits file preview and download actions.',
      ),
      event('cancelUpload / retryUpload', 'JFileUploadItemEvent', 'Emits queue item actions.'),
    ],
    cssVariables: surfaceCssVariables,
    accessibility: ['Use clear title and description text so the upload constraints are visible.'],
    bestPractices: ['Validate file type and size before sending data to your API.'],
  },
  {
    slug: 'formatting',
    name: 'Formatting Utilities',
    category: 'Utilities',
    icon: 'text',
    selector: 'pipes',
    importPath: 'jrng-ui/formatting',
    status: 'Stable',
    description:
      'Standalone pipes for common business formatting: date, time, date-time, currency, number, percentage, file size, and text truncation.',
    whenToUse:
      'Use formatting pipes in reusable Angular screens when values need consistent display formatting.',
    code: {
      importCode: `import {
  JCurrencyFormatPipe,
  JDateTimeFormatPipe,
  JFileSizeFormatPipe,
  JPercentFormatPipe,
  JTextTruncatePipe
} from 'jrng-ui/formatting';`,
      basic: `<span>{{ createdAt | jDateTimeFormat }}</span>
<span>{{ total | jCurrencyFormat: 'USD' }}</span>
<span>{{ conversionRate | jPercentFormat }}</span>
<span>{{ fileSize | jFileSizeFormat }}</span>
<span>{{ description | jTruncate: 80 }}</span>`,
      variants: `<span>{{ dueDate | jDateFormat: 'en-GB' }}</span>
<span>{{ startTime | jTimeFormat }}</span>
<span>{{ amount | jNumberFormat: 'en-US': { maximumFractionDigits: 2 } }}</span>`,
    },
    usage: ['Use in tables, cards, details pages, and exports previews.'],
    variants: [
      'date',
      'time',
      'date-time',
      'currency',
      'number',
      'percent',
      'file size',
      'truncate',
    ],
    sizes: ['Pipes do not render layout.'],
    states: ['empty values return an empty string', 'invalid dates return an empty string'],
    inputs: [
      prop('value', 'Date | string | number', "''", 'Input value passed to the pipe.'),
      prop('locale', 'string', 'browser default', 'Optional Intl locale.'),
      prop('options', 'Intl options', '{}', 'Optional Intl formatting options.'),
    ],
    outputs: noOutputs,
    accessibility: [
      'Formatting should not remove meaning; use labels and table headers around formatted values.',
    ],
    bestPractices: [
      'Pass currency and locale explicitly when product requirements need a specific display format.',
    ],
  },
];

const detailedSlugs = new Set(
  [...detailedComponentDocs, ...variantComponentDocs].map((doc) => doc.slug),
);

const generatedBasicExamples: Readonly<Record<string, string>> = {
  accordion: `<j-accordion [multiple]="true" [activeIndex]="[0]">
  <j-accordion-panel header="Account details">Update profile and contact information.</j-accordion-panel>
  <j-accordion-panel header="Notifications">Choose which updates you receive.</j-accordion-panel>
</j-accordion>`,
  'accordion-panel': `<j-accordion [activeIndex]="0">
  <j-accordion-panel header="Project summary">This panel is expanded by default.</j-accordion-panel>
</j-accordion>`,
  autocomplete: `<j-autocomplete label="Customer" [suggestions]="customers" placeholder="Search customers"></j-autocomplete>`,
  avatar: `<j-avatar initials="AR" ariaLabel="Avery Reed" status="online"></j-avatar>`,
  chip: `<j-chip label="Approved" severity="success" removable></j-chip>`,
  'color-picker': `<j-color-picker label="Brand colour" [(ngModel)]="brandColor" clearable></j-color-picker>`,
  'date-picker': `<j-date-picker label="Due date" placeholder="Choose a date" [(ngModel)]="dueDate"></j-date-picker>

<j-date-picker
  label="Reporting range"
  selectionMode="range"
  variant="filled"
  [presets]="datePresets"
  [(ngModel)]="dateRange">
</j-date-picker>`,
  divider: `<j-divider></j-divider>`,
  icon: `<j-icon name="search" ariaLabel="Search" size="24"></j-icon>`,
  'input-mask': `<j-input-mask label="Phone" mask="(999) 999-9999" placeholder="(555) 123-4567"></j-input-mask>`,
  'input-number': `<j-input-number label="Quantity" [min]="1" [max]="100" [(ngModel)]="quantity"></j-input-number>`,
  'input-otp': `<j-input-otp label="Verification code" [length]="6" numericOnly [(ngModel)]="code"></j-input-otp>`,
  listbox: `<j-listbox label="Team" [options]="teams" [(ngModel)]="selectedTeam"></j-listbox>`,
  multiselect: `<j-multiselect label="Skills" [options]="skills" [(ngModel)]="selectedSkills"></j-multiselect>`,
  paginator: `<j-paginator [first]="20" [rows]="10" [totalRecords]="96" [rowsPerPageOptions]="[10, 20, 50]" showCurrentPageReport></j-paginator>`,
  password: `<j-password label="Password" placeholder="Enter a secure password" feedback toggleMask></j-password>`,
  'progress-spinner': `<j-progress-spinner label="Loading orders" [size]="48"></j-progress-spinner>`,
  'status-page': `<j-status-page
  variant="empty"
  marker="?"
  title="No matching records"
  description="Adjust the filters and try again">
</j-status-page>`,
  rating: `<j-rating label="Product rating" [(ngModel)]="rating"></j-rating>`,
  slider: `<j-slider label="Completion" [min]="0" [max]="100" [step]="5" tooltip [(ngModel)]="completion"></j-slider>`,
  'avatar-group': `<j-avatar-group [items]="teamMembers" [max]="3" ariaLabel="Project team"></j-avatar-group>`,
  calendar: `<j-calendar [value]="selectedDate"></j-calendar>`,
  carousel: `<j-carousel [value]="featuredItems" [visibleItems]="2"></j-carousel>`,
  chart: `<j-chart type="bar" [data]="ordersChartData" ariaLabel="Monthly orders"></j-chart>`,
  chips: `<j-chips label="Tags" placeholder="Type a tag and press Enter" [(ngModel)]="tags"></j-chips>`,
  combobox: `<j-combobox label="Customer" [options]="customers" placeholder="Choose or type a customer"></j-combobox>`,
  'data-grid': `<j-data-grid
  title="Orders"
  description="Sortable, filterable operational data with pagination."
  [value]="orders"
  [columns]="orderColumns"
  [totalRecords]="orders.length"
  striped
  hover>
</j-data-grid>`,
  'data-view': `<j-data-view [value]="products" layout="grid" [rows]="6"></j-data-view>`,
  'date-range-picker': `<j-date-range-picker label="Campaign window" [(ngModel)]="dateRange"></j-date-range-picker>`,
  editor: `<j-editor label="Description" placeholder="Write a short product summary" [(ngModel)]="description"></j-editor>`,
  'file-preview': `<j-file-preview fileName="statement.pdf" [fileSize]="245760"></j-file-preview>`,
  fieldset: `<j-fieldset legend="Billing address" toggleable>
  <j-input label="Street"></j-input>
  <j-input label="City"></j-input>
</j-fieldset>`,
  gallery: `<j-gallery [value]="galleryItems" animation="fade"></j-gallery>`,
  image: `<j-image src="/assets/product-preview.png" alt="Product preview" preview></j-image>`,
  'image-preview': `<j-image-preview [src]="previewSrc" alt="Product preview" [visible]="previewOpen"></j-image-preview>`,
  knob: `<j-knob label="Completion" [(ngModel)]="completion"></j-knob>`,
  loader: `<j-loader label="Loading report" [size]="32"></j-loader>`,
  'meter-group': `<j-meter-group [value]="segments"></j-meter-group>`,
  'order-list': `<j-order-list header="Priorities" [value]="tasks" filter></j-order-list>`,
  'org-chart': `<j-org-chart [value]="organization"></j-org-chart>`,
  panel: `<j-panel header="Project health" toggleable>
  The latest build passed and documentation coverage is improving.
</j-panel>`,
  'select-button': `<j-select-button label="View mode" [options]="viewModes" [(ngModel)]="viewMode"></j-select-button>`,
  stack: `<j-stack direction="horizontal" align="center" gap="var(--j-spacing-3)">
  <j-badge value="New"></j-badge>
  <span>Reusable spacing layout</span>
</j-stack>`,
  'time-picker': `<j-time-picker label="Meeting time" [(ngModel)]="meetingTime"></j-time-picker>`,
  'toggle-button': `<j-toggle-button onLabel="Published" offLabel="Draft" [(ngModel)]="published"></j-toggle-button>`,
  toolbar: `<j-toolbar>
  <j-button label="New"></j-button>
  <j-button label="Export" variant="outline"></j-button>
</j-toolbar>`,
  topbar: `<j-topbar [model]="navigationItems" activeKey="Projects"></j-topbar>`,
  'transfer-list': `<j-transfer-list
  [source]="availableTasks"
  [target]="assignedTasks"
  sourceHeader="Available tasks"
  targetHeader="Assigned tasks"
  filter>
</j-transfer-list>`,
  'video-player': `<j-video-player src="https://www.youtube.com/watch?v=M7lc1UVf-VE" caption="YouTube embed example"></j-video-player>`,
  tree: `<j-tree [value]="nodes" filter ariaLabel="Workspace folders"></j-tree>`,
  'virtual-scroller': `<j-virtual-scroller [items]="records" [itemSize]="40" height="14rem"></j-virtual-scroller>`,
};

const generatedFallbackExamples: Readonly<Record<string, string>> = {
  'app-shell': `<j-app-shell>
  <main>Application content</main>
</j-app-shell>`,
  'auth-layout': `<j-auth-layout title="Sign in" subtitle="Access your workspace">
  <j-input label="Email" type="email"></j-input>
  <j-password label="Password"></j-password>
</j-auth-layout>`,
  'bottom-sheet': `<j-bottom-sheet header="Actions" [visible]="true">
  <j-button label="Archive"></j-button>
</j-bottom-sheet>`,
  'calendar-scheduler': `<j-calendar-scheduler [events]="events"></j-calendar-scheduler>`,
  column: `<j-table [value]="orders">
  <j-column field="order" header="Order"></j-column>
  <j-column field="status" header="Status"></j-column>
</j-table>`,
  'command-palette': `<j-command-palette [items]="commands" placeholder="Search commands"></j-command-palette>`,
  'confirm-popup': `<j-confirm-popup></j-confirm-popup>`,
  container: `<j-container>
  <h2>Content area</h2>
  <p>Use Container to constrain page content.</p>
</j-container>`,
  'context-menu': `<j-context-menu [model]="menuItems"></j-context-menu>`,
  'dashboard-layout': `<j-dashboard-layout>
  <j-card title="Revenue">Dashboard content</j-card>
</j-dashboard-layout>`,
  dropzone: `<j-dropzone accept=".csv,.xlsx" multiple></j-dropzone>`,
  'dynamic-dialog': `<j-dynamic-dialog></j-dynamic-dialog>`,
  'empty-page': `<j-empty-page title="No results" description="Try changing the filters."></j-empty-page>`,
  'error-page': `<j-error-page title="Something went wrong" statusCode="500"></j-error-page>`,
  'file-preview': `<j-file-preview fileName="report.pdf" [fileSize]="245760" description="Uploaded recently"></j-file-preview>`,
  'float-label': `<j-float-label label="Email">
  <j-input type="email"></j-input>
</j-float-label>`,
  'form-field': `<j-form-field label="Email" hint="Use a work email address.">
  <j-input type="email"></j-input>
</j-form-field>`,
  gantt: `<j-gantt [tasks]="tasks"></j-gantt>`,
  'grid-layout': `<j-grid-layout>
  <j-card title="Open tasks">12</j-card>
  <j-card title="Completed">48</j-card>
</j-grid-layout>`,
  'icon-field': `<j-icon-field icon="search">
  <j-input placeholder="Search"></j-input>
</j-icon-field>`,
  'ifta-label': `<j-ifta-label label="Email">
  <j-input type="email"></j-input>
</j-ifta-label>`,
  'input-group': `<j-input-group>
  <j-input placeholder="Search orders"></j-input>
  <j-button label="Search"></j-button>
</j-input-group>`,
  'input-icon': `<j-input-icon name="search"></j-input-icon>`,
  kanban: `<j-kanban [columns]="columns"></j-kanban>`,
  'maintenance-page': `<j-maintenance-page title="Maintenance" description="The application will be back soon."></j-maintenance-page>`,
  'mega-menu': `<j-mega-menu [model]="menuItems"></j-mega-menu>`,
  menubar: `<j-menubar [model]="menuItems"></j-menubar>`,
  'notification-center': `<j-notification-center [items]="notifications"></j-notification-center>`,
  'overlay-panel': `<j-overlay-panel [visible]="true">
  <p>Overlay content</p>
</j-overlay-panel>`,
  'pick-list': `<j-pick-list [source]="availableItems" [target]="selectedItems"></j-pick-list>`,
  'radio-group': `<j-radio-group label="Plan" [options]="plans" [(ngModel)]="plan"></j-radio-group>`,
  'section-footer': `<j-section-footer>
  <j-button label="Cancel" variant="ghost"></j-button>
  <j-button label="Save"></j-button>
</j-section-footer>`,
  'section-header': `<j-section-header title="Projects" subtitle="Track active work."></j-section-header>`,
  'sidebar-layout': `<j-sidebar-layout>
  <nav jSidebar>Navigation</nav>
  <main>Main content</main>
</j-sidebar-layout>`,
  'sidebar-nav': `<j-sidebar-nav [items]="navigationItems"></j-sidebar-nav>`,
  'sort-icon': `<j-sort-icon field="name" [sortField]="sortField" [sortOrder]="sortOrder"></j-sort-icon>`,
  sparkline: `<j-sparkline [value]="[12, 18, 16, 24, 30]"></j-sparkline>`,
  splitter: `<j-splitter>
  <section>Left panel</section>
  <section>Right panel</section>
</j-splitter>`,
  stepper: `<j-stepper [steps]="steps" [activeIndex]="1"></j-stepper>`,
  tab: `<j-tabs>
  <j-tab header="Overview">Overview content</j-tab>
</j-tabs>`,
  'table-empty-state': `<j-table-empty-state message="No orders found"></j-table-empty-state>`,
  'table-skeleton': `<j-table-skeleton [rows]="4"></j-table-skeleton>`,
  'tiered-menu': `<j-tiered-menu [model]="menuItems"></j-tiered-menu>`,
  'tree-table': `<j-tree-table [value]="nodes" [columns]="columns"></j-tree-table>`,
  'video-player': `<j-video-player src="/assets/demo-video.mp4" title="Product walkthrough"></j-video-player>`,
};

const createGeneratedBasicExample = (
  record: (typeof generatedComponentRegistry)[number],
): string => {
  const mapped = generatedBasicExamples[record.slug] ?? generatedFallbackExamples[record.slug];
  if (mapped) {
    return mapped;
  }

  if (record.category === 'Forms & Inputs') {
    return `<${record.selector} label="${record.name}" placeholder="Enter ${record.name.toLowerCase()}"></${record.selector}>`;
  }
  if (record.category === 'Layout') {
    return `<${record.selector}>
  <section>Content</section>
</${record.selector}>`;
  }
  if (record.category === 'Data & Tables') {
    return `<${record.selector} [value]="items"></${record.selector}>`;
  }
  if (record.category === 'Navigation & Menus') {
    return `<${record.selector} [model]="items"></${record.selector}>`;
  }
  if (record.category === 'Overlays & Feedback') {
    return `<${record.selector} [visible]="visible">
  <p>${record.name} content</p>
</${record.selector}>`;
  }
  return `<${record.selector}>
  ${record.name} content
</${record.selector}>`;
};

const generatedDisplayNames: Readonly<Record<string, string>> = {
  column: 'Table Column',
  combobox: 'Searchable Select',
};

const generatedInputDocs: Readonly<Record<string, readonly DocsApiRow[]>> = {
  avatar: [
    prop('label', 'string', "''", 'Person or entity name used for fallback initials.'),
    prop('image', 'string', "''", 'Local or application-managed image URL.'),
    prop('initials', 'string', "''", 'Explicit fallback initials.'),
    prop('ariaLabel', 'string', "''", 'Accessible name for the represented person or entity.'),
    prop('size', 'sm | md | lg', "'md'", 'Avatar dimensions.'),
    prop('shape', 'circle | square', "'circle'", 'Avatar silhouette.'),
    prop('status', 'online | offline | away | busy | none', "'none'", 'Presence indicator.'),
    prop('canZoom', 'boolean', 'false', 'Makes a valid image pointer and keyboard zoomable.'),
    prop('zoomAriaLabel', 'string', "'View profile image'", 'Accessible zoom action name.'),
    prop('zoomOverlay', 'boolean', 'true', 'Opens the built-in image preview after imageZoom.'),
    prop('styleClass', 'string', "''", 'Additional avatar classes.'),
    prop('pt', 'JPassThrough | null', 'null', 'Pass-through styling hooks.'),
  ],
  loader: [
    prop('type', 'JLoaderVariant', "'dots'", 'Loading animation type.'),
    prop('variant', 'JLoaderVariant | string', "''", 'Deprecated compatibility alias for type.'),
    prop('size', 'sm | md | lg | number', "'md'", 'Named or pixel size.'),
    prop('label', 'string', "'Loading'", 'Readable loading status.'),
    prop('inline', 'boolean', 'false', 'Shows the label beside the visual.'),
    prop('overlay', 'boolean', 'false', 'Covers the nearest positioned container.'),
    prop('fullscreen', 'boolean', 'false', 'Covers the viewport.'),
    prop('strokeWidth', 'number', '3', 'Indicator stroke or bar thickness.'),
    prop('speed', 'slow | normal | fast', "'normal'", 'Animation timing preset.'),
    prop(
      'value',
      'number | null',
      'null',
      'Optional determinate percentage, clamped from 0 to 100.',
    ),
  ],
  'file-preview': [
    prop('icon', 'JIconName | string', "''", 'Overrides the inferred file-type icon.'),
    prop('showTypeLabel', 'boolean', 'false', 'Shows an optional type label beside the icon.'),
    prop('typeLabel', 'string', "''", 'Custom label used when showTypeLabel is enabled.'),
  ],
  gallery: [
    prop(
      'animation',
      'fade | zoom | slide | none',
      "'fade'",
      'Transition used when the active image changes.',
    ),
  ],
  'input-mask': [
    prop('mask', 'string', "''", 'Pattern using 9 for digits, a for letters, and * for either.'),
    prop('unmask', 'boolean', 'false', 'Emits only entered characters instead of literals.'),
  ],
  'video-player': [
    prop('src', 'string', "''", 'Native video URL or a YouTube watch, short, or embed URL.'),
    prop('caption', 'string', "''", 'Accessible caption shown below the player.'),
  ],
};

const exampleValueOverrides: Readonly<Record<string, string>> = {
  availableItems: `[
  { label: 'Customer', value: 'customer' },
  { label: 'Status', value: 'status' },
  { label: 'Created date', value: 'createdAt' }
]`,
  availableTasks: `[
  { label: 'Review proposal', value: 'review' },
  { label: 'Approve budget', value: 'approve' }
]`,
  assignedTasks: `[{ label: 'Publish release', value: 'publish' }]`,
  columns: `[
  { field: 'order', header: 'Order', sortable: true },
  { field: 'customer', header: 'Customer' },
  { field: 'status', header: 'Status', filterable: true }
]`,
  commands: `[
  { label: 'Create project', icon: 'plus', command: () => console.log('Create project') },
  { label: 'Open settings', icon: 'settings', command: () => console.log('Open settings') }
]`,
  events: `[
  { title: 'Created', content: 'Project created.', opposite: '09:00' },
  { title: 'Approved', content: 'Budget approved.', opposite: '10:30' }
]`,
  files: `[
  { id: 'reports', name: 'Reports', kind: 'folder' },
  { id: 'budget', name: 'Budget.xlsx', kind: 'file', size: 24832 }
]`,
  items: `[
  { id: 1, label: 'First item', status: 'Active' },
  { id: 2, label: 'Second item', status: 'Pending' }
]`,
  menuItems: `[
  { label: 'Dashboard', icon: 'layout-dashboard' },
  { label: 'Projects', icon: 'folder' }
]`,
  navigationItems: `[
  { label: 'Overview', route: '/overview' },
  { label: 'Activity', route: '/activity' }
]`,
  nodes: `[
  { key: 'documents', label: 'Documents', children: [{ key: 'reports', label: 'Reports' }] }
]`,
  orders: `[
  { id: 1001, order: 'ORD-1001', customer: 'Acme Ltd', status: 'Processing' },
  { id: 1002, order: 'ORD-1002', customer: 'Northwind', status: 'Complete' }
]`,
  plans: `[
  { label: 'Starter', value: 'starter' },
  { label: 'Business', value: 'business' }
]`,
  products: `[
  { id: 1, name: 'Desk lamp', price: 49, category: 'Office' },
  { id: 2, name: 'Notebook', price: 12, category: 'Stationery' }
]`,
  records: `Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: \`Record \${index + 1}\`
}))`,
  segments: `[
  { label: 'Complete', value: 68, color: 'var(--j-color-success)' },
  { label: 'Remaining', value: 32, color: 'var(--j-color-muted)' }
]`,
  steps: `[
  { label: 'Details', description: 'Enter project details' },
  { label: 'Review', description: 'Confirm the information' },
  { label: 'Complete', description: 'Project created' }
]`,
  tasks: `[
  { id: 1, title: 'Review proposal', category: 'Review' },
  { id: 2, title: 'Approve budget', category: 'Approval' }
]`,
  treeNodes: `[
  { key: 'workspace', label: 'Workspace', children: [{ key: 'design', label: 'Design' }] }
]`,
};

const createExampleValues = (doc: ComponentDoc): string => {
  const fields = new Set<string>();
  const methods = new Map<string, boolean>();
  const template = doc.code.basic;
  const existing = doc.code.angular?.trim() ?? '';

  for (const match of template.matchAll(/(?:\[\([^\]]+\)\]|\[[^\]]+\])="([^"]+)"/g)) {
    collectExampleField(fields, match[1] ?? '');
  }
  for (const match of template.matchAll(/\([^)]+\)="([^"]+)"/g)) {
    const expression = match[1] ?? '';
    const assignedField = expression.match(/^([A-Za-z_$][\w$]*)\s*=/)?.[1];
    if (assignedField) fields.add(assignedField);
    const method = expression.match(/^([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/);
    if (method?.[1]) methods.set(method[1], (method[2] ?? '').includes('$event'));
  }
  for (const match of template.matchAll(/{{\s*([A-Za-z_$][\w$]*)/g)) {
    if (match[1]) fields.add(match[1]);
  }

  const additions: string[] = [];
  for (const field of [...fields].sort()) {
    if (!new RegExp(`\\b${field}\\b`).test(existing)) {
      additions.push(`${field} = ${exampleValue(field)};`);
    }
  }
  for (const [method, receivesEvent] of [...methods].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (!new RegExp(`\\b${method}\\s*\\(`).test(existing)) {
      additions.push(
        receivesEvent
          ? `${method}(event: unknown): void {\n  console.log(event);\n}`
          : `${method}(): void {\n  // Handle the component event here.\n}`,
      );
    }
  }

  if (!existing && !additions.length) {
    return `// ${doc.name} uses static values in this example; no backing fields are required.`;
  }
  return [existing, ...additions].filter(Boolean).join('\n\n');
};

const collectExampleField = (fields: Set<string>, expression: string): void => {
  const normalized = expression.trim();
  if (!normalized || /^(?:true|false|null|undefined|['"`]|\d|\[|\{)/.test(normalized)) {
    return;
  }
  const root = normalized.match(/^([A-Za-z_$][\w$]*)/)?.[1];
  if (root && root !== '$event') fields.add(root);
};

const exampleValue = (field: string): string => {
  const override = exampleValueOverrides[field];
  if (override) return override;

  if (/^(?:is|has|show|enable|disable|loading|visible|open|published)/i.test(field)) {
    return field.toLocaleLowerCase().includes('visible') ||
      field.toLocaleLowerCase().includes('open')
      ? 'true'
      : 'false';
  }
  if (/range/i.test(field)) {
    return `[new Date('2026-07-14'), new Date('2026-07-18')]`;
  }
  if (/date/i.test(field)) return `new Date('2026-07-14T09:30:00')`;
  if (/^(?:selected|active)/i.test(field)) {
    return /(?:items|skills|options|keys)$/i.test(field) ? '[]' : 'null';
  }
  if (/(?:count|index|quantity|amount|budget|completion|rating|value)$/i.test(field)) {
    return '50';
  }
  if (
    /(?:items|options|records|tasks|orders|events|files|columns|nodes|source|target)$/i.test(field)
  ) {
    return `[
  { id: 1, label: 'First option', value: 'first' },
  { id: 2, label: 'Second option', value: 'second' }
]`;
  }
  if (/config/i.test(field)) return `{}`;
  if (/(?:trackBy|compareWith)/i.test(field)) {
    return `(left: unknown, right: unknown) => left === right`;
  }
  return `''`;
};

const mergedComponentDocs: readonly ComponentDoc[] = [
  ...detailedComponentDocs,
  ...variantComponentDocs,
  ...generatedComponentRegistry
    .filter((record) => !detailedSlugs.has(record.slug))
    .map<ComponentDoc>((record) => ({
      slug: record.slug,
      name: generatedDisplayNames[record.slug] ?? record.name,
      category: record.category,
      icon: 'box',
      selector: record.selector,
      importPath: record.importPath,
      status: 'Stable',
      description: record.description,
      whenToUse: `Use ${record.name} when its ${record.category.toLowerCase()} behavior matches the application workflow.`,
      whenNotToUse: [
        `Avoid ${record.name} when a simpler native element or an existing focused JRNG UI component communicates the workflow more clearly.`,
      ],
      code: {
        importCode: `import { ${record.className} } from '${record.importPath}';`,
        basic: createGeneratedBasicExample(record),
      },
      usage: [
        `Import ${record.className} from the public ${record.importPath} entry point.`,
        `Common placements include ${record.category.toLowerCase()} screens, focused workflows, and responsive application layouts.`,
      ],
      variants: [],
      sizes: [],
      states: [],
      inputs: [
        ...(generatedInputDocs[record.slug] ?? []),
        ...record.inputs
          .filter(
            (name) => !(generatedInputDocs[record.slug] ?? []).some((row) => row.name === name),
          )
          .map((name) =>
            prop(
              name,
              'See exported declaration',
              'Component default',
              `Public ${name} input. Use the exported TypeScript declaration for its exact value contract.`,
            ),
          ),
      ],
      outputs: record.outputs.map((name) =>
        event(
          name,
          'See exported declaration',
          `Emits when the ${name} interaction or state change occurs.`,
        ),
      ),
      accessibility: [
        'Provide an accessible name and verify keyboard behavior for the configured content.',
      ],
      bestPractices: ['Use only the documented public entry point and selector.'],
      publicMethods: record.methods,
      templates: [
        'Default content can be projected where the component template exposes an Angular content slot.',
      ],
      keyboard:
        record.accessibilityStatus === 'implementation-signals-only'
          ? [
              'Use Tab to reach interactive controls and activate native buttons with Enter or Space.',
            ]
          : ['The component follows the keyboard behavior of its rendered native controls.'],
      responsive: [
        'Place the component in a flexible container and verify long labels at narrow widths.',
      ],
      limitations: [
        'Only documented public inputs, outputs, methods, and template slots are supported.',
      ],
      relatedComponents: [],
      testingNotes: [
        'Test visible behavior, public events, keyboard use, disabled states, and accessible naming in the consuming workflow.',
      ],
      deprecated: record.deprecation,
    })),
];

const registryRecordFor = (doc: ComponentDoc) =>
  generatedComponentRegistry.find(
    (record) => record.selector === doc.selector && record.importPath === doc.importPath,
  );

export const componentDocs: readonly ComponentDoc[] = mergedComponentDocs
  .filter(
    (doc, index, docs) =>
      docs.findIndex(
        (candidate) =>
          candidate.selector === doc.selector && candidate.importPath === doc.importPath,
      ) === index,
  )
  .map((doc) => {
    const registryRecord = registryRecordFor(doc);
    const documentedInputs = new Set(doc.inputs.map((row) => row.name));
    const documentedOutputs = new Set(doc.outputs.map((row) => row.event));
    return {
      ...doc,
      inputs: [
        ...doc.inputs,
        ...(registryRecord?.inputs ?? [])
          .filter(
            (name) =>
              ![...documentedInputs].some((documented) =>
                documented.split(/\s*\/\s*/).includes(name),
              ),
          )
          .map((name) =>
            prop(
              name,
              'See exported declaration',
              'Component default',
              `Public ${name} input. See the exported declaration for its exact contract.`,
            ),
          ),
      ],
      outputs: [
        ...doc.outputs,
        ...(registryRecord?.outputs ?? [])
          .filter(
            (name) =>
              ![...documentedOutputs].some((documented) =>
                documented.split(/\s*\/\s*/).includes(name),
              ),
          )
          .map((name) =>
            event(
              name,
              'See exported declaration',
              `Emits when ${name} changes or its interaction occurs.`,
            ),
          ),
      ],
      whenNotToUse: doc.whenNotToUse ?? [
        `Avoid ${doc.name} when a simpler native element communicates the same task without losing consistency or accessibility.`,
      ],
      publicMethods: [
        ...(doc.publicMethods ?? []),
        ...(registryRecord?.methods ?? []).filter(
          (method) => !(doc.publicMethods ?? []).some((documented) => documented.includes(method)),
        ),
      ],
      templates: doc.templates ?? [
        'Use documented content projection or template directives; do not target internal markup.',
      ],
      keyboard: doc.keyboard ?? [
        'Tab follows the page focus order. Native interactive elements use Enter and Space where applicable.',
      ],
      responsive: doc.responsive ?? [
        'Use a flexible parent width and verify long content at mobile and desktop breakpoints.',
      ],
      limitations: doc.limitations ?? [
        'Only documented public APIs and template slots are supported across releases.',
      ],
      relatedComponents: doc.relatedComponents ?? [],
      testingNotes: doc.testingNotes ?? [
        'Test visible behavior, public events, keyboard use, state changes, and accessible naming.',
      ],
      deprecated: doc.deprecated ?? registryRecord?.deprecation ?? null,
      code: {
        ...doc.code,
        angular: createExampleValues(doc),
      },
    };
  })
  .sort((left, right) => left.name.localeCompare(right.name));

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
    slugs: ['metric-card', 'stat-card', 'status-chip', 'page-header', 'empty-state'],
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
        'primary | secondary | neutral | success | warning | danger | info',
        "'primary'",
        'Action intent.',
      ),
      prop('variant', 'filled | outline | ghost | soft | link', "'filled'", 'Visual treatment.'),
      prop('loading', 'boolean', 'false', 'Shows a spinner and blocks clicks.'),
      prop('iconOnly', 'boolean', 'false', 'Optimizes dimensions for icon-only buttons.'),
    ],
    outputs: [event('onClick', 'MouseEvent', 'Emits when activated and not disabled or loading.')],
    cssVariables: buttonCssVariables,
    accessibility: ['Icon-only buttons need ariaLabel. Loading buttons expose busy state.'],
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
<j-card title="Interactive" interactive></j-card>`,
    },
    usage: ['Use cards for repeated items, dashboard widgets, and short content groups.'],
    variants: ['default', 'elevated', 'bordered', 'soft'],
    sizes: ['Use compact for denser lists and default for standard content.'],
    states: ['default', 'interactive', 'loading skeleton'],
    inputs: [
      prop('title / header', 'string', "''", 'Main heading.'),
      prop('subtitle / subheader', 'string', "''", 'Secondary text.'),
      prop('variant', 'default | elevated | bordered | soft', "'default'", 'Surface style.'),
      prop('compact', 'boolean', 'false', 'Reduces spacing.'),
    ],
    outputs: noOutputs,
    accessibility: ['Use semantic headings inside cards when the card starts a section.'],
    bestPractices: ['Do not nest cards inside cards. Put repeated card items in a grid or list.'],
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
      importCode: `import { JTableComponent, JTableColumn, JTableConfig } from 'jrng-ui/table';`,
      basic: `<j-table [value]="orders" [columns]="columns"></j-table>`,
      variants: `<j-table [value]="orders" [columns]="columns" striped paginator [rows]="10"></j-table>
<j-table [value]="orders" [columns]="columns" showGlobalFilter showColumnManager showExport></j-table>
<j-table [value]="orders" [columns]="columns" sortMode="multiple" selectionMode="checkbox"></j-table>
<j-table [value]="orders" [columns]="columns" [config]="tableConfig"></j-table>`,
      states: `<j-table [value]="[]" [columns]="columns" emptyMessage="No orders found"></j-table>
<j-table [value]="orders" [columns]="columns" loading></j-table>
<j-table [value]="orders" [columns]="columns" lockableRows maximizable></j-table>`,
      angular: `columns: JTableColumn[] = [
  { field: 'order', header: 'Order', sortable: true },
  { field: 'status', header: 'Status', filterable: true },
  { field: 'total', header: 'Total', align: 'end' },
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
};`,
    },
    usage: ['Use for orders, users, files, tasks, invoices, and audit logs.'],
    variants: [
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
    sizes: ['small', 'medium', 'large'],
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
      prop('value', 'readonly JTableRow[]', '[]', 'Rows to render.'),
      prop('columns', 'readonly JTableColumn[]', '[]', 'Column definitions and header metadata.'),
      prop('config', 'JTableConfig', 'null', 'Object API for enterprise table behavior.'),
      prop('paginator', 'boolean', 'false', 'Shows pagination controls.'),
      prop('loading', 'boolean', 'false', 'Shows loading rows.'),
      prop('selectionMode', 'single | multiple | checkbox | none', "'none'", 'Selection behavior.'),
      prop('filterRow', 'boolean', 'true', 'Shows column filter controls for filterable columns.'),
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
      prop('size', 'small | medium | large', "'medium'", 'Table density.'),
    ],
    outputs: [
      event('sortChange / onSortChange', 'JTableSort', 'Emits when sorting changes.'),
      event('pageChange / onPageChange', 'JTablePageChange', 'Emits when page changes.'),
      event(
        'filterChange / onFilterChange',
        'JTableFilterChange',
        'Emits when global or column filters change.',
      ),
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
    ],
    bestPractices: [
      'Use pagination or lazy loading for large datasets.',
      'Keep column labels short and align numeric columns to the end.',
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
];`,
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
    description: 'A small search control for filtering a single table column.',
    whenToUse: 'Use Column Filter inside table headers when users need per-column filtering.',
    code: {
      importCode: `import { JColumnFilterComponent } from 'jrng-ui/table';`,
      basic: `<j-column-filter field="status" label="Status" (filterChange)="filter($event)"></j-column-filter>`,
    },
    usage: ['Use for text-based column filtering in advanced data tables.'],
    variants: ['field label', 'current value binding'],
    sizes: ['Compact by default for table headers.'],
    states: ['empty', 'typed value', 'focused'],
    inputs: [
      prop('field', 'string', "''", 'Field being filtered.'),
      prop('label', 'string', "''", 'Accessible label suffix.'),
      prop('value', 'unknown', "''", 'Current filter value.'),
    ],
    outputs: [event('filterChange', 'JColumnFilterChange', 'Emits field and text value.')],
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
    status: 'New',
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
      prop('showDateRange', 'boolean', 'false', 'Shows start and end date inputs.'),
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
    accessibility: ['Search, status, and date controls use labels and native inputs/selects.'],
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
    },
    usage: ['Use to standardize title, context, and actions across business app pages.'],
    variants: [
      'breadcrumbs',
      'back button',
      'primary action',
      'secondary actions',
      'right-side action slot',
      'tabs slot',
    ],
    sizes: ['Responsive layout collapses actions below the title on narrow screens.'],
    states: ['with breadcrumbs', 'with actions', 'with tabs'],
    inputs: [
      prop('title', 'string', "''", 'Page title.'),
      prop('subtitle', 'string', "''", 'Supporting text.'),
      prop('description', 'string', "''", 'Legacy supporting text alias.'),
      prop('breadcrumbs', 'readonly JPageHeaderBreadcrumb[]', '[]', 'Breadcrumb path.'),
      prop('showBack', 'boolean', 'false', 'Shows a back button.'),
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
    },
    usage: ['Use for search misses, first-run states, empty tables, and missing records.'],
    variants: ['default', 'compact', 'with action'],
    sizes: ['Default and compact density.'],
    states: ['empty result', 'first run', 'filtered empty'],
    inputs: [
      prop('title', 'string', "''", 'Primary empty-state title.'),
      prop('description', 'string', "''", 'Supporting text.'),
      prop('icon', 'string', "''", 'Optional visual marker.'),
      prop('compact', 'boolean', 'false', 'Reduces spacing.'),
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
    slug: 'progress',
    name: 'Progress',
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
      variants: `<j-progress-bar [value]="72" severity="success"></j-progress-bar>
<j-progress-bar [value]="42" severity="warning"></j-progress-bar>
<j-progress-bar indeterminate label="Loading"></j-progress-bar>`,
    },
    usage: [
      'Use determinate progress when you know the percentage and indeterminate when work has started but duration is unknown.',
    ],
    variants: ['determinate', 'indeterminate', 'severity colors'],
    sizes: ['Progress bar height is fixed by component styling; wrap with labels for context.'],
    states: ['0%', 'in progress', 'complete', 'indeterminate'],
    inputs: [
      prop('value', 'number', '0', 'Progress percentage from 0 to 100.'),
      prop('indeterminate', 'boolean', 'false', 'Shows a looping loading indicator.'),
      prop('label', 'string', "''", 'Accessible label.'),
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
      variants: `<j-tabs [selectedIndex]="1" lazy>
  <j-tab header="Details">Details</j-tab>
  <j-tab header="Settings">Settings</j-tab>
</j-tabs>`,
    },
    usage: ['Use for a small number of related panels.'],
    variants: ['default', 'lazy', 'scrollable', 'closable tabs'],
    sizes: ['Tabs use standard control sizing.'],
    states: ['active', 'disabled', 'closable'],
    inputs: [
      prop('selectedIndex', 'number', '0', 'Active tab index.'),
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
      angular: `home = { label: 'Home', routerLink: '/' };
items = [
  { label: 'Docs', routerLink: '/docs' },
  { label: 'Components' }
];`,
    },
    usage: ['Use in nested admin, documentation, or file-manager pages.'],
    variants: ['home item', 'router links', 'custom separator template'],
    sizes: ['Breadcrumb is compact by default.'],
    states: ['link', 'current page', 'disabled'],
    inputs: [
      prop('home', 'JBreadcrumbItem', 'undefined', 'Optional first item.'),
      prop('model', 'readonly JBreadcrumbItem[]', '[]', 'Breadcrumb items.'),
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
    slug: 'sidebar',
    name: 'Sidebar',
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
    status: 'Beta',
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
    status: 'New',
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
      angular: `events: JTimelineItem[] = [
  { title: 'Created', content: 'Order was created.', opposite: '09:00', severity: 'info' },
  { title: 'Updated', content: 'Customer address changed.', opposite: '09:30', icon: 'U' },
  { title: 'Approved', content: 'Manager approved it.', opposite: '10:15', severity: 'success' },
  { title: 'File uploaded', content: 'statement.pdf was attached.', opposite: '10:40', color: '#7c3aed' }
];`,
    },
    usage: ['Use for audit trails, fulfillment progress, approvals, and release history.'],
    variants: [
      'created',
      'updated',
      'approved',
      'rejected',
      'status changed',
      'comment added',
      'file uploaded',
      'custom icon',
      'custom color',
      'compact mode',
    ],
    sizes: ['Timeline size follows content and layout.'],
    states: ['neutral event', 'success', 'warning', 'danger', 'info'],
    inputs: [
      prop('value', 'readonly JTimelineItem[]', '[]', 'Timeline items.'),
      prop('layout', 'vertical | horizontal', "'vertical'", 'Timeline orientation.'),
      prop('compact', 'boolean', 'false', 'Reduces item spacing for activity logs.'),
      prop('styleClass', 'string', "''", 'Custom root class.'),
    ],
    outputs: [],
    cssVariables: surfaceCssVariables,
    accessibility: ['Timeline renders as an ordered list so the event order is meaningful.'],
    bestPractices: ['Keep each event title short and put details in content text.'],
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
    status: 'New',
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

const detailedSlugs = new Set(detailedComponentDocs.map((doc) => doc.slug));

export const componentDocs: readonly ComponentDoc[] = [
  ...detailedComponentDocs,
  ...generatedComponentRegistry
    .filter((record) => !detailedSlugs.has(record.slug))
    .map<ComponentDoc>((record) => ({
      slug: record.slug,
      name: record.name,
      category: record.category,
      icon: 'box',
      selector: record.selector,
      importPath: record.importPath,
      status: record.stability,
      description: record.description,
      whenToUse: `Use ${record.name} when its ${record.category.toLowerCase()} behavior matches the application workflow.`,
      code: {
        importCode: `import { ${record.className} } from '${record.importPath}';`,
        basic: `<${record.selector}></${record.selector}>`,
      },
      usage: [`Import ${record.className} from the public ${record.importPath} entry point.`],
      variants: [],
      sizes: [],
      states: [],
      inputs: [],
      outputs: [],
      accessibility: [
        'Provide an accessible name and verify keyboard behavior for the configured content.',
      ],
      bestPractices: ['Use only the documented public entry point and selector.'],
    })),
].sort((left, right) => left.name.localeCompare(right.name));

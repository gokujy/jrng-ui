export interface PriorityComponentGuidance {
  readonly advancedExample: string;
  readonly publicMethods: readonly string[];
  readonly templates: readonly string[];
  readonly reactiveForms: string;
  readonly validationStates: readonly string[];
  readonly loadingDisabledStates: readonly string[];
  readonly keyboardBehaviour: readonly string[];
  readonly responsiveBehaviour: string;
  readonly darkMode: string;
  readonly composedExample: string;
  readonly troubleshooting: readonly string[];
}

const standardDarkMode =
  'The live preview uses semantic JRNG UI tokens and follows the documentation theme switch. Verify custom overrides in both light and dark modes.';

const standardResponsive =
  'The component respects its container. Test narrow layouts and avoid fixed widths unless the application workflow requires them.';

function guidance(
  advancedExample: string,
  composedExample: string,
  overrides: Partial<PriorityComponentGuidance> = {},
): PriorityComponentGuidance {
  return {
    advancedExample,
    publicMethods: [],
    templates: ['Default projected content where supported.'],
    reactiveForms:
      'This component is not a form control and does not implement ControlValueAccessor.',
    validationStates: ['No form validation state applies.'],
    loadingDisabledStates: ['Use documented loading and disabled inputs when available.'],
    keyboardBehaviour: [
      'Use the native or documented keyboard interaction for the rendered control.',
    ],
    responsiveBehaviour: standardResponsive,
    darkMode: standardDarkMode,
    composedExample,
    troubleshooting: [
      'Confirm the component is imported from its public secondary entrypoint.',
      'Confirm JRNG UI global styles are loaded once.',
    ],
    ...overrides,
  };
}

const formGuidance = {
  reactiveForms:
    'Import ReactiveFormsModule and bind formControl or formControlName. Read validation state from the Angular control and pass invalid, error, disabled, or required state to the component.',
  validationStates: [
    'Show validation feedback after the control is touched or the form is submitted.',
    'Keep error text actionable and associate it with the control.',
  ],
  loadingDisabledStates: [
    'Disable the control while its value or options are being saved.',
    'Preserve the current value when asynchronous options refresh.',
  ],
};

export const priorityComponentGuidance: Readonly<Record<string, PriorityComponentGuidance>> = {
  button: guidance(
    `<j-button label="Save changes" icon="check" [loading]="saving" (onClick)="save()" />`,
    'Submit a business form while preventing repeated activation during an asynchronous save.',
    {
      templates: ['Default label content and documented icon input.'],
      keyboardBehaviour: ['Enter and Space activate the button unless it is disabled or loading.'],
      loadingDisabledStates: [
        'Loading prevents repeated activation and keeps an accessible label.',
        'Disabled buttons do not emit onClick.',
      ],
    },
  ),
  input: guidance(
    `<j-input label="Reference" formControlName="reference" required clearable />`,
    'Capture a searchable business reference with required validation.',
    {
      ...formGuidance,
      keyboardBehaviour: [
        'Uses native text-input editing, selection, and focus behavior.',
        'The clear action is keyboard focusable when enabled.',
      ],
    },
  ),
  select: guidance(
    `<j-select label="Status" [options]="statuses" formControlName="status" clearable />`,
    'Choose one workflow status from a controlled option set.',
    {
      ...formGuidance,
      keyboardBehaviour: [
        'Arrow keys move through options; Enter selects; Escape closes the list.',
        'Typeahead follows the available option labels.',
      ],
    },
  ),
  multiselect: guidance(
    `<j-multiselect label="Teams" [options]="teams" formControlName="teamIds" filter />`,
    'Assign several teams to a record while retaining searchable options.',
    {
      ...formGuidance,
      keyboardBehaviour: [
        'Arrow keys navigate options, Space toggles selection, and Escape closes the panel.',
      ],
    },
  ),
  'date-picker': guidance(
    `<j-date-picker label="Due date" formControlName="dueDate" [minDate]="today" />`,
    'Select a due date while enforcing a business date boundary.',
    {
      ...formGuidance,
      keyboardBehaviour: [
        'Arrow keys move by day, Page Up and Page Down change month, Enter selects, and Escape closes.',
      ],
    },
  ),
  dialog: guidance(
    `<j-dialog header="Edit record" [(visible)]="visible"><app-record-form /></j-dialog>`,
    'Edit a record without leaving the current data view.',
    {
      publicMethods: ['show()', 'hide()'],
      templates: ['Default body content.', 'jDialogHeader', 'jDialogFooter'],
      keyboardBehaviour: [
        'Tab remains inside the open dialog and Escape closes when enabled.',
        'Focus returns to the invoking control after close.',
      ],
    },
  ),
  'confirm-dialog': guidance(
    `confirmation.confirm({ header: 'Delete record?', message: 'This action cannot be undone.', acceptLabel: 'Delete' });`,
    'Confirm an irreversible record deletion with explicit action labels.',
    {
      publicMethods: ['JConfirmationService.confirm()', 'JConfirmationService.close()'],
      templates: ['Service-configured header, message, and actions.'],
      keyboardBehaviour: [
        'Initial focus moves to the configured action, Tab is trapped, and Escape rejects when enabled.',
      ],
    },
  ),
  table: guidance(
    `<j-table [value]="rows" [columns]="columns" [loading]="loading" paginator />`,
    'Review, sort, filter, select, and paginate operational records.',
    {
      publicMethods: ['reset()', 'exportCSV()'],
      templates: ['jTableHeader', 'jTableCell', 'caption', 'empty', 'loading'],
      keyboardBehaviour: [
        'Interactive headers and row actions are reachable in logical order.',
        'Selection controls use their native keyboard behavior.',
      ],
      responsiveBehaviour:
        'Use horizontal scrolling or responsive column priorities on narrow screens; preserve row identity and action labels.',
    },
  ),
  'data-grid': guidance(
    `<j-data-grid title="Orders" [value]="orders" [columns]="columns" [totalRecords]="total" />`,
    'Present a complete server-backed order workspace with filters and pagination.',
    {
      publicMethods: ['reset()', 'exportCSV()', 'restoreState()'],
      templates: ['Toolbar actions, cell templates, empty state, and loading state.'],
      keyboardBehaviour: ['Grid controls follow table keyboard behavior and expose named actions.'],
      responsiveBehaviour:
        'Keep essential identity and actions visible; allow lower-priority columns to scroll or collapse.',
    },
  ),
  'file-upload': guidance(
    `<j-file-upload title="Upload documents" accept=".pdf,.png" multiple />`,
    'Collect approved document types and show progress or validation feedback.',
    {
      validationStates: [
        'Reject unsupported type and size before upload.',
        'Announce upload errors and keep retry actions available.',
      ],
      loadingDisabledStates: ['Show progress while files upload and disable repeated submission.'],
      keyboardBehaviour: [
        'The file chooser and remove actions are keyboard accessible; drag and drop is optional.',
      ],
    },
  ),
  chart: guidance(
    `<j-chart type="bar" [data]="chartData" ariaLabel="Monthly revenue" />`,
    'Summarize a business trend while retaining an accessible text label.',
    {
      templates: ['Canvas rendering managed by Chart.js when installed.'],
      loadingDisabledStates: [
        'Provide a skeleton while data is loading and an empty state when no series exists.',
      ],
      keyboardBehaviour: [
        'Provide the chart purpose and equivalent values outside pointer-only tooltips.',
      ],
      responsiveBehaviour:
        'Charts resize to their container; give the container a meaningful minimum height.',
    },
  ),
  menu: guidance(
    `<j-menu [model]="actions" ariaLabel="Record actions" />`,
    'Expose a consistent set of contextual record actions.',
    {
      templates: ['Menu item labels, icons, badges, separators, and nested items.'],
      keyboardBehaviour: [
        'Arrow keys navigate, Enter activates, and Escape closes an overlay menu.',
      ],
    },
  ),
  'responsive-sidebar': guidance(
    `<j-responsive-sidebar [items]="navigation" [(collapsed)]="collapsed" />`,
    'Provide desktop and mobile navigation for an admin workspace.',
    {
      templates: ['Header, navigation content, and footer account area.'],
      keyboardBehaviour: [
        'Toggle controls expose expanded state and navigation remains reachable in DOM order.',
      ],
      responsiveBehaviour:
        'Collapse on constrained desktop widths and present an accessible modal navigation panel on mobile.',
    },
  ),
  tabs: guidance(
    `<j-tabs [(activeIndex)]="activeTab"><j-tab header="Details">...</j-tab></j-tabs>`,
    'Organize related record details without introducing separate routes.',
    {
      publicMethods: ['select(index)'],
      templates: ['Tab header and panel content.'],
      keyboardBehaviour: [
        'Left and Right move tab focus, Home and End jump, and the selected panel is labelled by its tab.',
      ],
    },
  ),
  toast: guidance(
    `toast.success('Changes saved.', 'Saved');`,
    'Confirm a completed background action without interrupting the workflow.',
    {
      publicMethods: ['success()', 'error()', 'warning()', 'info()', 'clear()'],
      templates: ['Toast container renders service messages.'],
      keyboardBehaviour: [
        'Dismiss actions are keyboard accessible and messages use appropriate live regions.',
      ],
    },
  ),
  tooltip: guidance(
    `<button jTooltip="Refresh data" tooltipPosition="top">Refresh</button>`,
    'Clarify an icon action while keeping the control independently labelled.',
    {
      keyboardBehaviour: ['Tooltips appear on focus as well as hover and dismiss on Escape.'],
      responsiveBehaviour: 'Keep tooltip text brief; do not rely on hover on touch layouts.',
    },
  ),
  'filter-bar': guidance(
    `<j-filter-bar [filters]="filters" (filterChange)="load($event)" />`,
    'Coordinate search and structured filters for a server-side table.',
    {
      templates: ['Filter controls and trailing actions.'],
      keyboardBehaviour: [
        'Controls follow logical focus order and each filter has an accessible name.',
      ],
      responsiveBehaviour:
        'Filters wrap into rows or a compact mobile disclosure without changing their values.',
    },
  ),
  'status-chip': guidance(
    `<j-status-chip status="approved" label="Approved" />`,
    'Show a workflow status with text and color rather than color alone.',
    {
      keyboardBehaviour: [
        'Status chips are informational unless explicitly rendered as an action.',
      ],
    },
  ),
  'page-header': guidance(
    `<j-page-header title="Users" subtitle="Manage access and profiles" [breadcrumbs]="breadcrumbs"><j-button label="Create user" /></j-page-header>`,
    'Orient users and expose the primary action for an admin page.',
    {
      templates: ['Breadcrumbs, title content, metadata, and trailing actions.'],
      responsiveBehaviour:
        'Actions wrap below the title on narrow screens while heading order remains unchanged.',
    },
  ),
  'tour-guide': guidance(
    `tour.start({ id: 'dashboard-intro', steps: ['create-button', 'filter-button'] });`,
    'Introduce a small number of stable interface targets to a new user.',
    {
      publicMethods: ['start()', 'next()', 'previous()', 'skip()', 'complete()', 'destroy()'],
      templates: ['jTourStep directive registers title and description metadata.'],
      keyboardBehaviour: [
        'Tour controls are keyboard accessible, focus is restored, Escape closes when allowed, and reduced motion is respected.',
      ],
    },
  ),
};

export const priorityComponentSlugs = new Set(Object.keys(priorityComponentGuidance));

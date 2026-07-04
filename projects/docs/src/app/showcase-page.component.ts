import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  JAccordionComponent,
  JAccordionPanelComponent,
  JAutocompleteComponent,
  JBadgeComponent,
  JCheckboxComponent,
  JConfirmationService,
  JDatePickerComponent,
  JFileUploadComponent,
  JFieldsetComponent,
  JMultiselectComponent,
  JPanelComponent,
  JPasswordComponent,
  JRadioGroupComponent,
  JRatingComponent,
  JSelectComponent,
  JSliderComponent,
  JSwitchComponent,
  JTableColumn,
  JTableComponent,
  JTablePageChange,
  JTableRow,
  JTableSelection,
  JTableSort,
  JTabComponent,
  JTabsComponent,
  JTextareaComponent,
  JrButtonComponent,
  JrDialogComponent,
  JrInputComponent,
  JInputNumberComponent,
  JrToastService,
} from 'jrng-ui';

type ShowcasePage =
  | 'introduction'
  | 'theme'
  | 'button'
  | 'inputs'
  | 'select'
  | 'selection'
  | 'date-picker'
  | 'dialog'
  | 'toast'
  | 'confirm-dialog'
  | 'table'
  | 'layout'
  | 'file-upload'
  | 'accessibility'
  | 'migration';

interface PageMeta {
  readonly title: string;
  readonly eyebrow: string;
  readonly intro: string;
}

interface ApiRow {
  readonly input: string;
  readonly type: string;
  readonly notes: string;
}

interface MigrationRow {
  readonly prime: string;
  readonly jrng: string;
  readonly notes: string;
}

function isShowcasePage(value: unknown): value is ShowcasePage {
  return (
    value === 'introduction' ||
    value === 'theme' ||
    value === 'button' ||
    value === 'inputs' ||
    value === 'select' ||
    value === 'selection' ||
    value === 'date-picker' ||
    value === 'dialog' ||
    value === 'toast' ||
    value === 'confirm-dialog' ||
    value === 'table' ||
    value === 'layout' ||
    value === 'file-upload' ||
    value === 'accessibility' ||
    value === 'migration'
  );
}

@Component({
  selector: 'app-code-card',
  imports: [CommonModule],
  template: `
    <article class="example-card">
      <h2>Code usage</h2>
      <pre><code>{{ code }}</code></pre>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeCardComponent {
  @Input() code = '';
}

@Component({
  selector: 'app-api-table',
  imports: [CommonModule],
  template: `
    <article class="example-card">
      <h2>API</h2>
      <table class="showcase-table">
        <thead>
          <tr>
            <th>Input/API</th>
            <th>Type</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows">
            <td><code>{{ row.input }}</code></td>
            <td>{{ row.type }}</td>
            <td>{{ row.notes }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiTableComponent {
  @Input() rows: readonly ApiRow[] = [];
}

@Component({
  selector: 'app-showcase-page',
  imports: [
    ApiTableComponent,
    CommonModule,
    CodeCardComponent,
    ReactiveFormsModule,
    RouterLink,
    JAccordionComponent,
    JAccordionPanelComponent,
    JAutocompleteComponent,
    JBadgeComponent,
    JCheckboxComponent,
    JDatePickerComponent,
    JFileUploadComponent,
    JFieldsetComponent,
    JMultiselectComponent,
    JPanelComponent,
    JPasswordComponent,
    JRadioGroupComponent,
    JRatingComponent,
    JSelectComponent,
    JSliderComponent,
    JSwitchComponent,
    JTableComponent,
    JTabComponent,
    JTabsComponent,
    JTextareaComponent,
    JrButtonComponent,
    JrDialogComponent,
    JrInputComponent,
    JInputNumberComponent,
  ],
  template: `
    <section class="page-hero">
      <span class="page-hero__eyebrow">{{ meta().eyebrow }}</span>
      <h1>{{ meta().title }}</h1>
      <p>{{ meta().intro }}</p>
    </section>

    <ng-container [ngSwitch]="currentPage()">
      <section *ngSwitchCase="'introduction'" class="showcase-grid showcase-grid--three">
        <article class="example-card">
          <h2>Public entrypoints</h2>
          <p>Every example imports from the package entrypoints used by consumers.</p>
          <pre><code>import {{ '{' }} JButtonComponent {{ '}' }} from 'jrng-ui/button';</code></pre>
        </article>
        <article class="example-card">
          <h2>Standalone Angular</h2>
          <p>Components are standalone and work with strict templates and Reactive Forms.</p>
          <j-badge value="Angular 21" severity="info" />
        </article>
        <article class="example-card">
          <h2>Migration view</h2>
          <p>Use the migration page as the first BDMS replacement checklist.</p>
          <a class="showcase-link" routerLink="/migration">Open mapping</a>
        </article>
      </section>

      <section *ngSwitchCase="'theme'" class="stack">
        <article class="example-card">
          <h2>Default Light Theme</h2>
          <div class="token-grid">
            <span style="--token: var(--j-color-primary)">Primary</span>
            <span style="--token: var(--j-color-secondary)">Secondary</span>
            <span style="--token: var(--j-color-success)">Success</span>
            <span style="--token: var(--j-color-warning)">Warning</span>
            <span style="--token: var(--j-color-danger)">Danger</span>
            <span style="--token: var(--j-color-info)">Info</span>
          </div>
        </article>
        <article class="example-card">
          <h2>Token override</h2>
          <p>Override CSS variables at app root, a feature module shell, or a theme host.</p>
          <pre><code>{{ code.theme }}</code></pre>
        </article>
      </section>

      <section *ngSwitchCase="'button'" class="stack">
        <article class="example-card">
          <h2>Basic example</h2>
          <div class="example-row">
            <j-button label="Save" />
            <j-button label="Cancel" severity="secondary" variant="outlined" />
            <j-button label="Delete" severity="danger" />
          </div>
        </article>
        <article class="example-card">
          <h2>States, sizes, and severity</h2>
          <div class="example-row">
            <j-button *ngFor="let size of sizes" [label]="size" [size]="size" />
            <j-button label="Disabled" disabled />
            <j-button label="Loading" loading />
          </div>
          <div class="example-row">
            <j-button *ngFor="let severity of severities" [label]="severity" [severity]="severity" />
          </div>
        </article>
        <app-code-card [code]="code.button" />
        <app-api-table [rows]="api['button']" />
      </section>

      <section *ngSwitchCase="'inputs'" class="stack">
        <article class="example-card">
          <h2>Basic and Reactive Forms</h2>
          <div class="form-grid">
            <j-input label="Customer email" placeholder="finance@example.com" [formControl]="emailControl" clearable />
            <j-password label="Password" [formControl]="passwordControl" feedback />
            <j-input-number label="Invoice amount" mode="currency" currency="INR" [formControl]="amountControl" />
            <j-textarea label="Notes" [rows]="4" showCount [maxLength]="120" [formControl]="notesControl" />
          </div>
        </article>
        <article class="example-card">
          <h2>Disabled and invalid</h2>
          <div class="form-grid">
            <j-input label="Disabled" value="Locked value" disabled />
            <j-input label="Invalid" error="Name is required" required />
          </div>
        </article>
        <app-code-card [code]="code.inputs" />
        <app-api-table [rows]="api['inputs']" />
      </section>

      <section *ngSwitchCase="'select'" class="stack">
        <article class="example-card">
          <h2>Select and multiselect</h2>
          <div class="form-grid">
            <j-select
              label="Status"
              placeholder="Select status"
              [options]="statusOptions"
              [formControl]="statusControl"
              searchable
              clearable
            />
            <j-multiselect
              label="Departments"
              placeholder="Select departments"
              [options]="departmentOptions"
              [formControl]="departmentsControl"
              displayChips
              searchable
              clearable
            />
            <j-autocomplete
              label="City"
              placeholder="Start typing"
              [suggestions]="cityOptions"
              [formControl]="cityControl"
              dropdown
            />
            <j-select label="Invalid select" [options]="statusOptions" error="Status is required" required />
          </div>
        </article>
        <app-code-card [code]="code.select" />
        <app-api-table [rows]="api['select']" />
      </section>

      <section *ngSwitchCase="'selection'" class="stack">
        <article class="example-card">
          <h2>Checkbox, radio, switch, rating, and slider</h2>
          <div class="selection-grid">
            <j-checkbox label="Accept terms" [formControl]="termsControl" />
            <j-checkbox label="Indeterminate" indeterminate />
            <j-switch label="Notifications" [formControl]="notificationsControl" onLabel="On" offLabel="Off" />
            <j-radio-group label="Priority" [options]="priorityOptions" [formControl]="priorityControl" direction="horizontal" />
            <j-rating label="Risk" [formControl]="ratingControl" cancel />
            <j-slider label="Discount" [formControl]="discountControl" [min]="0" [max]="50" />
          </div>
        </article>
        <app-code-card [code]="code.selection" />
        <app-api-table [rows]="api['selection']" />
      </section>

      <section *ngSwitchCase="'date-picker'" class="stack">
        <article class="example-card">
          <h2>Native-backed date picker</h2>
          <div class="form-grid">
            <j-date-picker label="Due date" [formControl]="dueDateControl" showIcon showButtonBar showClear />
            <j-date-picker label="Disabled" value="2026-07-04" disabled />
            <j-date-picker label="Invalid" error="Date is required" required />
          </div>
        </article>
        <app-code-card [code]="code.datePicker" />
        <app-api-table [rows]="api['datePicker']" />
      </section>

      <section *ngSwitchCase="'dialog'" class="stack">
        <article class="example-card">
          <h2>Dialog examples</h2>
          <div class="example-row">
            <j-button label="Open medium dialog" (clicked)="dialogOpen = true" />
            <j-button label="Open full dialog" severity="secondary" (clicked)="fullDialogOpen = true" />
          </div>
        </article>
        <app-code-card [code]="code.dialog" />
        <app-api-table [rows]="api['dialog']" />
      </section>

      <section *ngSwitchCase="'toast'" class="stack">
        <article class="example-card">
          <h2>Toast service</h2>
          <div class="example-row">
            <j-button label="Success" severity="success" (clicked)="toast.success('Record saved', 'Success')" />
            <j-button label="Info" severity="info" (clicked)="toast.info('Sync completed', 'Info')" />
            <j-button label="Warning" severity="warning" (clicked)="toast.warning('Low inventory', 'Warning')" />
            <j-button label="Error" severity="danger" (clicked)="toast.error('Export failed', 'Error')" />
          </div>
        </article>
        <app-code-card [code]="code.toast" />
        <app-api-table [rows]="api['toast']" />
      </section>

      <section *ngSwitchCase="'confirm-dialog'" class="stack">
        <article class="example-card">
          <h2>Confirm dialog service</h2>
          <div class="example-row">
            <j-button label="Archive supplier" severity="warning" (clicked)="confirmArchive()" />
            <j-button label="Delete invoice" severity="danger" (clicked)="confirmDelete()" />
          </div>
          <p class="muted">{{ confirmationResult }}</p>
        </article>
        <app-code-card [code]="code.confirmDialog" />
        <app-api-table [rows]="api['confirmDialog']" />
      </section>

      <section *ngSwitchCase="'table'" class="stack">
        <article class="example-card">
          <h2>Sortable, pageable, selectable table</h2>
          <j-table
            [value]="invoiceRows"
            [columns]="invoiceColumns"
            [rows]="3"
            [totalRecords]="invoiceRows.length"
            paginator
            selectionMode="checkbox"
            [selection]="selectedRows"
            striped
            responsive
            (selectionChange)="selectedRows = $event"
            (sortChange)="lastSort = $event"
            (pageChange)="lastPage = $event"
          />
          <p class="muted">Sort: {{ lastSort?.field || 'none' }}. Page: {{ lastPage?.page || 1 }}.</p>
        </article>
        <article class="example-card">
          <h2>Loading and empty states</h2>
          <div class="showcase-grid">
            <j-table [value]="[]" [columns]="invoiceColumns" loading />
            <j-table [value]="[]" [columns]="invoiceColumns" emptyMessage="No invoices match this filter." />
          </div>
        </article>
        <app-code-card [code]="code.table" />
        <app-api-table [rows]="api['table']" />
      </section>

      <section *ngSwitchCase="'layout'" class="stack">
        <article class="example-card">
          <h2>Tabs</h2>
          <j-tabs [(selectedIndex)]="selectedTab">
            <j-tab header="Overview">Overview content for dashboard panels.</j-tab>
            <j-tab header="Activity">Activity content with audit records.</j-tab>
            <j-tab header="Disabled" disabled>Disabled content.</j-tab>
          </j-tabs>
        </article>
        <article class="example-card">
          <h2>Accordion, panel, and fieldset</h2>
          <div class="showcase-grid">
            <j-accordion [activeIndex]="0">
              <j-accordion-panel header="Purchase order">PO review checklist.</j-accordion-panel>
              <j-accordion-panel header="Tax validation">GST and ledger validation.</j-accordion-panel>
            </j-accordion>
            <j-panel header="Toggleable panel" toggleable>Panel body content.</j-panel>
            <j-fieldset legend="Filters" toggleable>Fieldset content for grouped controls.</j-fieldset>
          </div>
        </article>
        <app-code-card [code]="code.layout" />
        <app-api-table [rows]="api['layout']" />
      </section>

      <section *ngSwitchCase="'file-upload'" class="stack">
        <article class="example-card">
          <h2>Upload examples</h2>
          <div class="showcase-grid">
            <j-file-upload multiple accept=".pdf,.xlsx" [maxFileSize]="2000000" (filesChange)="handleFiles($event)" />
            <j-file-upload mode="basic" chooseLabel="Choose invoice" />
          </div>
          <p class="muted">{{ fileMessage }}</p>
        </article>
        <app-code-card [code]="code.fileUpload" />
        <app-api-table [rows]="api['fileUpload']" />
      </section>

      <section *ngSwitchCase="'accessibility'" class="stack">
        <article class="example-card">
          <h2>Visual checks</h2>
          <ul class="check-list">
            <li>Use Tab and Shift+Tab across every demo page.</li>
            <li>Use Enter and Space on buttons, toggles, radio options, tabs, and table rows.</li>
            <li>Use Escape on select overlays and dialogs.</li>
            <li>Resize below 640px to check table, dialog, and sidebar behavior.</li>
          </ul>
        </article>
        <article class="example-card">
          <h2>ARIA and form associations</h2>
          <p>Controls expose labels, invalid state, and described-by links where validation text is present.</p>
          <j-input label="Accessible invalid field" error="This error is linked with aria-describedby." />
        </article>
        <app-code-card [code]="code.accessibility" />
      </section>

      <section *ngSwitchCase="'migration'" class="stack">
        <article class="example-card">
          <h2>PrimeNG to JRNG mapping</h2>
          <table class="showcase-table">
            <thead>
              <tr>
                <th>PrimeNG</th>
                <th>JRNG UI</th>
                <th>Migration note</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of migrationRows">
                <td><code>{{ row.prime }}</code></td>
                <td><code>{{ row.jrng }}</code></td>
                <td>{{ row.notes }}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>
    </ng-container>

    <j-dialog header="Create invoice" [(visible)]="dialogOpen" size="md">
      <div class="form-grid">
        <j-input label="Customer" placeholder="Customer name" />
        <j-input-number label="Amount" mode="currency" currency="INR" />
      </div>
      <j-button jDialogFooter label="Cancel" variant="text" (clicked)="dialogOpen = false" />
      <j-button jDialogFooter label="Save" (clicked)="dialogOpen = false; toast.success('Invoice saved')" />
    </j-dialog>

    <j-dialog header="Full screen review" [(visible)]="fullDialogOpen" size="full">
      <p>This dialog uses the full-size option and is useful for dense mobile workflows.</p>
      <j-button jDialogFooter label="Close" (clicked)="fullDialogOpen = false" />
    </j-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly toast = inject(JrToastService);
  private readonly confirmation = inject(JConfirmationService);

  readonly currentPage = signal<ShowcasePage>('introduction');

  readonly sizes = ['sm', 'md', 'lg'] as const;
  readonly severities = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

  readonly emailControl = new FormControl<string>('finance@jr.example', { nonNullable: true });
  readonly passwordControl = new FormControl<string>('Bdms@2026', { nonNullable: true });
  readonly amountControl = new FormControl<number | null>(128400);
  readonly notesControl = new FormControl<string>('Approve after tax review.', { nonNullable: true });
  readonly statusControl = new FormControl<string>('active', { nonNullable: true });
  readonly departmentsControl = new FormControl<readonly string[]>(['finance'], { nonNullable: true });
  readonly cityControl = new FormControl<string>('ahmedabad', { nonNullable: true });
  readonly termsControl = new FormControl<boolean>(true, { nonNullable: true });
  readonly notificationsControl = new FormControl<boolean>(true, { nonNullable: true });
  readonly priorityControl = new FormControl<string>('high', { nonNullable: true });
  readonly ratingControl = new FormControl<number>(3, { nonNullable: true });
  readonly discountControl = new FormControl<number>(12, { nonNullable: true });
  readonly dueDateControl = new FormControl<string | null>('2026-07-04');

  readonly statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
  ] as const;

  readonly departmentOptions = [
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' },
    { label: 'Sales', value: 'sales' },
    { label: 'Compliance', value: 'compliance' },
  ] as const;

  readonly cityOptions = [
    { label: 'Ahmedabad', value: 'ahmedabad' },
    { label: 'Bengaluru', value: 'bengaluru' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Pune', value: 'pune' },
  ] as const;

  readonly priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ] as const;

  readonly invoiceColumns: readonly JTableColumn[] = [
    { field: 'id', header: 'Invoice', sortable: true },
    { field: 'customer', header: 'Customer', sortable: true },
    { field: 'amount', header: 'Amount', type: 'number', sortable: true, align: 'end' },
    { field: 'status', header: 'Status', type: 'tag' },
  ];

  readonly invoiceRows: readonly JTableRow[] = [
    { id: 'INV-4024', customer: 'Aster Retail', amount: 42000, status: 'Paid' },
    { id: 'INV-4025', customer: 'Northwind', amount: 88400, status: 'Pending' },
    { id: 'INV-4026', customer: 'Green Foods', amount: 24100, status: 'Paid' },
    { id: 'INV-4027', customer: 'Patel Purchase', amount: 66800, status: 'Failed' },
    { id: 'INV-4028', customer: 'Orbit Supply', amount: 110000, status: 'Pending' },
  ];

  selectedRows: JTableSelection = [];
  lastSort: JTableSort | null = null;
  lastPage: JTablePageChange | null = null;
  dialogOpen = false;
  fullDialogOpen = false;
  selectedTab = 0;
  fileMessage = 'No files selected.';
  confirmationResult = 'No confirmation action yet.';

  readonly migrationRows: readonly MigrationRow[] = [
    { prime: 'p-button', jrng: 'j-button', notes: 'Map severity, variant, size, disabled, and loading states.' },
    { prime: 'p-inputText', jrng: 'j-input', notes: 'Use CVA with formControlName or [formControl].' },
    { prime: 'p-select / p-dropdown', jrng: 'j-select', notes: 'Primitive and object option arrays are supported.' },
    { prime: 'p-calendar / p-datepicker', jrng: 'j-date-picker', notes: 'Current implementation uses a native date input fallback.' },
    { prime: 'p-table', jrng: 'j-table', notes: 'Core sort, page, selection, loading, and empty states are available.' },
    { prime: 'p-dialog', jrng: 'j-dialog', notes: 'Use [(visible)] and projected footer buttons.' },
    { prime: 'p-toast', jrng: 'j-toast', notes: 'Use JrToastService methods and one global j-toast container.' },
    { prime: 'p-confirmDialog', jrng: 'j-confirm-dialog', notes: 'Use JConfirmationService.confirm(options).' },
    { prime: 'p-tabView', jrng: 'j-tabs', notes: 'Use j-tabs with projected j-tab panels.' },
    { prime: 'p-fieldset', jrng: 'j-fieldset', notes: 'Legend and toggleable modes are supported.' },
    { prime: 'p-rating', jrng: 'j-rating', notes: 'Use CVA and optional clear/cancel behavior.' },
  ];

  readonly pageMeta: Record<ShowcasePage, PageMeta> = {
    introduction: {
      eyebrow: 'Showcase',
      title: 'JRNG UI component showcase',
      intro: 'A routed demo app for visually testing the JRNG UI replacement library before BDMS migration.',
    },
    theme: {
      eyebrow: 'Theme',
      title: 'Theme tokens and global styles',
      intro: 'Inspect CSS variables, semantic colors, spacing, focus rings, and app-level token overrides.',
    },
    button: {
      eyebrow: 'Action',
      title: 'Button',
      intro: 'PrimeNG-like action buttons with severity, variant, size, disabled, and loading states.',
    },
    inputs: {
      eyebrow: 'Forms',
      title: 'Inputs',
      intro: 'Text, password, number, and textarea controls with Reactive Forms support.',
    },
    select: {
      eyebrow: 'Forms',
      title: 'Select components',
      intro: 'Select, multiselect, and autocomplete patterns for common business forms.',
    },
    selection: {
      eyebrow: 'Forms',
      title: 'Checkbox, radio, switch',
      intro: 'Selection controls with CVA support, keyboard behavior, labels, and invalid states.',
    },
    'date-picker': {
      eyebrow: 'Forms',
      title: 'DatePicker',
      intro: 'Initial date picker API with native input fallback and Reactive Forms support.',
    },
    dialog: {
      eyebrow: 'Overlay',
      title: 'Dialog',
      intro: 'Modal workflows with focus trap, Escape close, scroll lock, and small-screen behavior.',
    },
    toast: {
      eyebrow: 'Feedback',
      title: 'Toast',
      intro: 'Global toast container and service shortcuts for transient user feedback.',
    },
    'confirm-dialog': {
      eyebrow: 'Feedback',
      title: 'ConfirmDialog',
      intro: 'Service-driven confirmation dialog for destructive and approval actions.',
    },
    table: {
      eyebrow: 'Data',
      title: 'Table',
      intro: 'Data table with sorting, pagination, selection, loading, and responsive mode.',
    },
    layout: {
      eyebrow: 'Layout',
      title: 'Tabs, accordion, panel',
      intro: 'Common layout and content containers for admin screens.',
    },
    'file-upload': {
      eyebrow: 'Advanced',
      title: 'FileUpload',
      intro: 'Basic and advanced upload surfaces with file lists, validation, and events.',
    },
    accessibility: {
      eyebrow: 'Quality',
      title: 'Accessibility checklist',
      intro: 'Manual visual and keyboard checks for focus, ARIA, overlays, forms, and responsive behavior.',
    },
    migration: {
      eyebrow: 'Migration',
      title: 'PrimeNG to JRNG mapping',
      intro: 'Replacement map for the most common PrimeNG components used during BDMS migration.',
    },
  };

  readonly api: Record<string, readonly ApiRow[]> = {
    button: [
      { input: 'label', type: 'string', notes: 'Text label when content is not projected.' },
      { input: 'severity', type: 'JSeverity', notes: 'primary, secondary, success, warning, danger, info, neutral.' },
      { input: 'variant', type: 'filled | outlined | text', notes: 'Visual treatment.' },
      { input: 'loading', type: 'boolean', notes: 'Blocks click output and shows loading state.' },
    ],
    inputs: [
      { input: 'label', type: 'string', notes: 'Associates visible label with control.' },
      { input: 'error', type: 'string', notes: 'Sets invalid styling and described-by text.' },
      { input: 'fluid', type: 'boolean', notes: 'Expands control to full container width.' },
    ],
    select: [
      { input: 'options', type: 'readonly unknown[]', notes: 'Primitive or object option sources.' },
      { input: 'searchable', type: 'boolean', notes: 'Adds filter input to the overlay.' },
      { input: 'clearable', type: 'boolean', notes: 'Adds clear action when a value is selected.' },
    ],
    selection: [
      { input: 'formControl', type: 'Reactive Forms', notes: 'All shown controls implement CVA.' },
      { input: 'disabled', type: 'boolean', notes: 'Also supported through Angular forms disabled state.' },
      { input: 'size', type: 'sm | md | lg', notes: 'Where implemented by the component.' },
    ],
    datePicker: [
      { input: 'dataType', type: 'date | string', notes: 'Controls emitted value shape.' },
      { input: 'showButtonBar', type: 'boolean', notes: 'Shows Today and Clear buttons.' },
      { input: 'minDate / maxDate', type: 'Date | string', notes: 'Pass-through constraints for date input.' },
    ],
    dialog: [
      { input: 'visible', type: 'boolean', notes: 'Two-way bind with [(visible)].' },
      { input: 'size', type: 'sm | md | lg | xl | full', notes: 'Controls dialog width and full-screen mode.' },
      { input: 'closeOnEscape', type: 'boolean', notes: 'Escape closes the dialog by default.' },
    ],
    toast: [
      { input: 'success/error/info/warning', type: 'service methods', notes: 'Shortcut methods on JrToastService.' },
      { input: 'life', type: 'number', notes: 'Auto-dismiss time in milliseconds.' },
      { input: 'sticky', type: 'boolean', notes: 'Keeps toast visible until closed.' },
    ],
    confirmDialog: [
      { input: 'confirm(options)', type: 'service method', notes: 'Shows the current confirmation request.' },
      { input: 'accept / reject', type: 'callbacks', notes: 'Called before the dialog closes.' },
      { input: 'acceptLabel / rejectLabel', type: 'string', notes: 'Custom action labels.' },
    ],
    table: [
      { input: 'value', type: 'readonly JTableRow[]', notes: 'Rows to render.' },
      { input: 'columns', type: 'readonly JTableColumn[]', notes: 'Column model.' },
      { input: 'lazy', type: 'boolean', notes: 'Emits lazyLoad instead of local processing.' },
      { input: 'selectionMode', type: 'single | multiple | checkbox | none', notes: 'Selection behavior.' },
    ],
    layout: [
      { input: 'selectedIndex', type: 'number', notes: 'Controls active tab.' },
      { input: 'activeIndex', type: 'number | number[] | null', notes: 'Controls accordion panels.' },
      { input: 'toggleable', type: 'boolean', notes: 'Panel and fieldset collapse support.' },
    ],
    fileUpload: [
      { input: 'multiple', type: 'boolean', notes: 'Allows multiple selected files.' },
      { input: 'accept', type: 'string', notes: 'Native file accept filter.' },
      { input: 'maxFileSize', type: 'number', notes: 'Client-side size validation.' },
    ],
  };

  readonly code = {
    theme: `@use 'jrng-ui/theme';

:root {
  --j-color-primary: #2563eb;
  --j-radius-md: 0.5rem;
}`,
    button: `import { JButtonComponent } from 'jrng-ui/button';

<j-button label="Save" severity="primary" size="md" />
<j-button label="Cancel" variant="outlined" severity="secondary" />`,
    inputs: `const email = new FormControl('', { nonNullable: true });

<j-input label="Email" [formControl]="email" clearable />
<j-textarea label="Notes" [rows]="4" showCount />`,
    select: `<j-select
  label="Status"
  [options]="statusOptions"
  formControlName="status"
  searchable
  clearable
/>`,
    selection: `<j-checkbox label="Accept" formControlName="accepted" />
<j-radio-group [options]="priorityOptions" formControlName="priority" />
<j-switch formControlName="enabled" />`,
    datePicker: `<j-date-picker
  label="Due date"
  formControlName="dueDate"
  showIcon
  showButtonBar
  showClear
/>`,
    dialog: `<j-dialog header="Create invoice" [(visible)]="open" size="md">
  ...
  <j-button jDialogFooter label="Save" />
</j-dialog>`,
    toast: `constructor(private toast: JrToastService) {}

this.toast.success('Record saved', 'Success');`,
    confirmDialog: `this.confirmation.confirm({
  header: 'Archive supplier',
  message: 'Archive this supplier?',
  accept: () => this.archive()
});`,
    table: `<j-table
  [value]="rows"
  [columns]="columns"
  [rows]="10"
  paginator
  selectionMode="checkbox"
/>`,
    layout: `<j-tabs [(selectedIndex)]="selectedIndex">
  <j-tab header="Overview">...</j-tab>
</j-tabs>

<j-accordion [activeIndex]="0">
  <j-accordion-panel header="Details">...</j-accordion-panel>
</j-accordion>`,
    fileUpload: `<j-file-upload
  multiple
  accept=".pdf,.xlsx"
  [maxFileSize]="2000000"
  (filesChange)="files = $event"
/>`,
    accessibility: `<j-input
  label="Email"
  error="Email is required"
  required
/>`,
  } as const;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const page = data['page'];
      this.currentPage.set(isShowcasePage(page) ? page : 'introduction');
    });
  }

  meta(): PageMeta {
    return this.pageMeta[this.currentPage()];
  }

  handleFiles(files: readonly File[]): void {
    this.fileMessage = files.length ? `${files.length} file(s) selected.` : 'No files selected.';
  }

  confirmArchive(): void {
    this.confirmation.confirm({
      header: 'Archive supplier',
      message: 'Archive this supplier record?',
      icon: '!',
      severity: 'warning',
      acceptLabel: 'Archive',
      rejectLabel: 'Cancel',
      accept: () => {
        this.confirmationResult = 'Supplier archived.';
        this.toast.success('Supplier archived');
      },
      reject: () => {
        this.confirmationResult = 'Archive cancelled.';
      },
    });
  }

  confirmDelete(): void {
    this.confirmation.confirm({
      header: 'Delete invoice',
      message: 'Delete this invoice permanently?',
      icon: '!',
      severity: 'danger',
      acceptLabel: 'Delete',
      rejectLabel: 'Keep',
      accept: () => {
        this.confirmationResult = 'Invoice deleted.';
        this.toast.error('Invoice deleted');
      },
      reject: () => {
        this.confirmationResult = 'Delete cancelled.';
      },
    });
  }
}

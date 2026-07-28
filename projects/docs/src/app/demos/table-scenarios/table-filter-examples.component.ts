import {
  ChangeDetectionStrategy,
  Component,
  Type,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JChipComponent } from 'jrng-ui/chip';
import { JDatePickerComponent, JDatePickerValue } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JSelectComponent } from 'jrng-ui/select';
import {
  JTableCellTemplateDirective,
  JTableColumn,
  JTableComponent,
  JTableFilterTemplateDirective,
} from 'jrng-ui/table';
import { JTooltipDirective } from 'jrng-ui/tooltip';

interface CustomerFilterRow extends Record<string, unknown> {
  readonly customerId: string;
  readonly customerName: string;
  readonly company: string;
  readonly email: string;
  readonly accountManager: string;
  readonly industry: string;
  readonly subscription: string;
  readonly status: string;
  readonly joinedDate: string;
  readonly lastActive: string;
  readonly outstandingBalance: number;
  readonly actions: string;
}

interface AppliedFilters {
  readonly search: string;
  readonly customer: string;
  readonly accountManager: string;
  readonly industry: string;
  readonly subscription: string;
  readonly status: string;
  readonly joinedFrom: string;
  readonly joinedTo: string;
  readonly activeFrom: string;
  readonly activeTo: string;
}

interface FilterChip {
  readonly key: keyof AppliedFilters;
  readonly label: string;
}

const EMPTY_FILTERS: AppliedFilters = {
  search: '',
  customer: '',
  accountManager: '',
  industry: '',
  subscription: '',
  status: '',
  joinedFrom: '',
  joinedTo: '',
  activeFrom: '',
  activeTo: '',
};

const TABLE_FILTER_COMMON_IMPORTS = [
  FormsModule,
  JAvatarComponent,
  JBadgeComponent,
  JButtonComponent,
  JDatePickerComponent,
  JInputComponent,
  JSelectComponent,
  JTableCellTemplateDirective,
  JTableComponent,
  JTooltipDirective,
];

const TABLE_FILTER_STYLES = `
  :host { display: block; min-width: 0; }
  .j-docs-table-filter-actions,
  .j-docs-table-filter-toolbar,
  .j-docs-table-filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--j-spacing-2);
  }
  .j-docs-table-filter-actions {
    align-items: center;
    justify-content: space-between;
    margin-block-end: var(--j-spacing-3);
  }
  .j-docs-table-filter-toolbar {
    align-items: end;
    background: var(--j-color-surface-subtle);
    border: 1px solid var(--j-color-border);
    border-radius: var(--j-radius-lg);
    margin-block-end: var(--j-spacing-3);
    padding: var(--j-spacing-3);
  }
  .j-docs-table-filter-toolbar > * { flex: 1 1 10rem; }
  .j-docs-table-filter-toolbar > .j-docs-table-filter-buttons { flex: 0 1 auto; }
  .j-docs-table-filter-buttons { display: flex; flex-wrap: wrap; gap: var(--j-spacing-2); }
  .j-docs-table-filter-chips { align-items: center; margin-block: var(--j-spacing-2) var(--j-spacing-3); }
  .j-docs-table-filter-result {
    color: var(--j-color-muted-foreground);
    font-size: var(--j-font-size-sm);
    margin: 0;
  }
  .j-docs-table-customer {
    align-items: center;
    display: inline-flex;
    gap: var(--j-spacing-2);
  }
  .j-docs-table-inline-control { align-items: end; display: flex; gap: var(--j-spacing-1); }
  .j-docs-table-inline-control > :first-child { flex: 1 1 auto; min-width: 7rem; }
  .j-docs-table-filter-panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows var(--j-duration-normal) var(--j-ease-standard),
      opacity var(--j-duration-fast) var(--j-ease-standard);
  }
  .j-docs-table-filter-panel[data-open='true'] { grid-template-rows: 1fr; opacity: 1; }
  .j-docs-table-filter-panel__inner { min-height: 0; overflow: hidden; }
  .j-docs-table-filter-count { align-items: center; display: inline-flex; gap: var(--j-spacing-1); }
  @media (max-width: 640px) {
    .j-docs-table-filter-toolbar > *,
    .j-docs-table-filter-buttons,
    .j-docs-table-filter-buttons j-button { flex: 1 1 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .j-docs-table-filter-panel { transition: none; }
  }
`;

const INLINE_FILTERS_TEMPLATE = `
  <div class="j-docs-table-filter-actions">
    <p class="j-docs-table-filter-result" role="status">
      {{ inlineState() === 'empty' ? 'No customers match the current filters.' : '12 fictional customers' }}
    </p>
    <div class="j-docs-table-filter-buttons">
      <j-button label="Loading state" variant="outlined" (onClick)="toggleInlineLoading()" />
      <j-button label="Empty result" variant="text" (onClick)="toggleInlineEmpty()" />
    </div>
  </div>
  <j-table
    #table
    caption="Customers with inline column filters"
    [value]="inlineState() === 'empty' ? [] : rows"
    [columns]="inlineColumns"
    filterDisplay="row"
    [loading]="inlineState() === 'loading'"
    [paginator]="true"
    [rows]="5"
    [scrollable]="true"
    [tableStyle]="{ 'min-width': '92rem' }"
    [showGlobalFilter]="false"
    [showColumnManager]="false"
    [showExport]="false"
    [maximizable]="false"
    noResultsTitle="No matching customers"
    noResultsDescription="Clear one or more column filters to restore customer rows."
  >
    <ng-template jTableCell="customerName" let-row>
      <span class="j-docs-table-customer">
        <j-avatar [initials]="initials($any(row)['customerName'])" [ariaLabel]="$any(row)['customerName']" size="sm" />
        <strong>{{ $any(row)['customerName'] }}</strong>
      </span>
    </ng-template>
    <ng-template jTableCell="status" let-value="value">
      <j-badge [value]="$any(value)" [severity]="value === 'Active' ? 'success' : 'warning'" variant="soft" />
    </ng-template>
    <ng-template jTableCell="actions" let-row>
      <j-button
        icon="eye"
        actionDisplay="icon"
        [ariaLabel]="'View ' + $any(row)['customerName']"
        jTooltip="View customer"
      />
    </ng-template>
    <ng-template jTableFilter="customerId" let-value="value" let-apply="apply">
      <div class="j-docs-table-inline-control">
        <j-input ariaLabel="Filter customer ID" clearable [value]="$any(value)" (valueChange)="apply($event)" />
        <j-button icon="close" actionDisplay="icon" ariaLabel="Clear customer ID filter" variant="text" (onClick)="apply('')" />
      </div>
    </ng-template>
    <ng-template jTableFilter="customerName" let-value="value" let-apply="apply">
      <div class="j-docs-table-inline-control">
        <j-input ariaLabel="Filter customer name" clearable [value]="$any(value)" (valueChange)="apply($event)" />
        <j-button icon="close" actionDisplay="icon" ariaLabel="Clear customer name filter" variant="text" (onClick)="apply('')" />
      </div>
    </ng-template>
    <ng-template jTableFilter="company" let-value="value" let-apply="apply">
      <j-input ariaLabel="Filter company" clearable [value]="$any(value)" (valueChange)="apply($event)" />
    </ng-template>
    <ng-template jTableFilter="accountManager" let-value="value" let-apply="apply">
      <j-select ariaLabel="Filter account manager" clearable [options]="managerOptions" [ngModel]="value" (ngModelChange)="apply($event)" />
    </ng-template>
    <ng-template jTableFilter="status" let-value="value" let-apply="apply">
      <j-select ariaLabel="Filter status" clearable [options]="statusOptions" [ngModel]="value" (ngModelChange)="apply($event)" />
    </ng-template>
    <ng-template jTableFilter="joinedDate" let-value="value" let-apply="apply">
      <j-date-picker ariaLabel="Filter joined date" clearable dataType="string" [value]="$any(value)" (valueChange)="apply($event)" />
    </ng-template>
    <ng-template jTableFilter="outstandingBalance" let-value="value" let-apply="apply">
      <j-input-number ariaLabel="Minimum outstanding balance" clearable [ngModel]="value" (ngModelChange)="apply($event)" />
    </ng-template>
  </j-table>
`;

const TOOLBAR_FILTERS_TEMPLATE = `
  <div class="j-docs-table-filter-toolbar" aria-label="Customer filters">
    <j-input label="Search customers" clearable [value]="search()" (valueChange)="search.set($event)" />
    <j-select label="Account Manager" clearable [options]="managerOptions" [ngModel]="manager()" (ngModelChange)="manager.set(asText($event))" />
    <j-select label="Industry" clearable [options]="industryOptions" [ngModel]="industry()" (ngModelChange)="industry.set(asText($event))" />
    <j-select label="Subscription" clearable [options]="subscriptionOptions" [ngModel]="subscription()" (ngModelChange)="subscription.set(asText($event))" />
    <j-select label="Status" clearable [options]="statusOptions" [ngModel]="status()" (ngModelChange)="status.set(asText($event))" />
    <j-date-picker label="Joined after" clearable dataType="string" [value]="joinedFrom()" (valueChange)="joinedFrom.set(asDateText($event))" />
    <div class="j-docs-table-filter-buttons">
      <j-button label="Clear Filters" variant="outlined" (onClick)="clearAll()" />
      <j-button label="Apply Filters" (onClick)="applyFilters()" />
    </div>
  </div>
  @if (activeChips().length) {
    <div class="j-docs-table-filter-chips" aria-label="Active filters">
      @for (chip of activeChips(); track chip.key) {
        <j-chip [label]="chip.label" removable [removeAriaLabel]="'Remove ' + chip.label" (remove)="removeFilter(chip.key)" />
      }
    </div>
  }
  <div class="j-docs-table-filter-actions">
    <p class="j-docs-table-filter-result" role="status">{{ visibleRows().length }} customers</p>
    <div class="j-docs-table-filter-buttons">
      <j-button label="Loading state" variant="outlined" (onClick)="loading.set(!loading())" />
      <j-button label="Empty result" variant="text" (onClick)="forceEmpty.set(!forceEmpty())" />
    </div>
  </div>
  <j-table
    caption="Customers filtered above the table"
    [value]="forceEmpty() ? [] : visibleRows()"
    [columns]="toolbarColumns"
    [loading]="loading()"
    [paginator]="true"
    [rows]="5"
    [scrollable]="true"
    [tableStyle]="{ 'min-width': '82rem' }"
    [showCurrentPageReport]="true"
    [showGlobalFilter]="false"
    [showColumnManager]="false"
    [showExport]="false"
    [maximizable]="false"
    noResultsTitle="No matching customers"
  >
    <ng-template jTableCell="customerName" let-row>
      <span class="j-docs-table-customer">
        <j-avatar [initials]="initials($any(row)['customerName'])" [ariaLabel]="$any(row)['customerName']" size="sm" />
        <strong>{{ $any(row)['customerName'] }}</strong>
      </span>
    </ng-template>
    <ng-template jTableCell="status" let-value="value">
      <j-badge [value]="$any(value)" [severity]="value === 'Active' ? 'success' : 'warning'" variant="soft" />
    </ng-template>
    <ng-template jTableCell="actions" let-row>
      <j-button icon="eye" actionDisplay="icon" [ariaLabel]="'View ' + $any(row)['customerName']" jTooltip="View customer" />
    </ng-template>
  </j-table>
`;

const EXPANDABLE_FILTERS_TEMPLATE = `
  <div class="j-docs-table-filter-actions">
    <j-button
      icon="filter"
      [label]="panelOpen() ? 'Hide Filters' : 'Filters'"
      [ariaLabel]="panelOpen() ? 'Hide customer filters' : 'Show customer filters'"
      ariaControls="customer-advanced-filter-panel"
      [ariaExpanded]="panelOpen()"
      (onClick)="panelOpen.set(!panelOpen())"
    >
      @if (activeChips().length) {
        <span class="j-docs-table-filter-count">
          <j-badge [value]="activeChips().length" ariaLabel="Active filter count" />
        </span>
      }
    </j-button>
    <p class="j-docs-table-filter-result" role="status">{{ visibleRows().length }} customers</p>
  </div>
  <section
    id="customer-advanced-filter-panel"
    class="j-docs-table-filter-panel"
    [attr.data-open]="panelOpen()"
    [attr.aria-hidden]="!panelOpen()"
  >
    <div class="j-docs-table-filter-panel__inner">
      <div class="j-docs-table-filter-toolbar">
        <j-input label="Global search" clearable [value]="search()" (valueChange)="search.set($event)" />
        <j-input label="Customer name or email" clearable [value]="customer()" (valueChange)="customer.set($event)" />
        <j-select label="Industry" clearable [options]="industryOptions" [ngModel]="industry()" (ngModelChange)="industry.set(asText($event))" />
        <j-select label="Subscription" clearable [options]="subscriptionOptions" [ngModel]="subscription()" (ngModelChange)="subscription.set(asText($event))" />
        <j-select label="Status" clearable [options]="statusOptions" [ngModel]="status()" (ngModelChange)="status.set(asText($event))" />
        <j-date-picker label="Joined from" clearable dataType="string" [value]="joinedFrom()" (valueChange)="joinedFrom.set(asDateText($event))" />
        <j-date-picker label="Joined to" clearable dataType="string" [value]="joinedTo()" (valueChange)="joinedTo.set(asDateText($event))" />
        <j-date-picker label="Last active from" clearable dataType="string" [value]="activeFrom()" (valueChange)="activeFrom.set(asDateText($event))" />
        <j-date-picker label="Last active to" clearable dataType="string" [value]="activeTo()" (valueChange)="activeTo.set(asDateText($event))" />
        <div class="j-docs-table-filter-buttons">
          <j-button label="Clear All" variant="outlined" (onClick)="clearAll()" />
          <j-button label="Apply Filters" (onClick)="applyFilters()" />
        </div>
      </div>
    </div>
  </section>
  @if (!panelOpen() && activeChips().length) {
    <div class="j-docs-table-filter-chips" aria-label="Active filters">
      @for (chip of activeChips(); track chip.key) {
        <j-chip [label]="chip.label" removable [removeAriaLabel]="'Remove ' + chip.label" (remove)="removeFilter(chip.key)" />
      }
    </div>
  }
  <div class="j-docs-table-filter-actions">
    <span></span>
    <div class="j-docs-table-filter-buttons">
      <j-button label="Loading state" variant="outlined" (onClick)="loading.set(!loading())" />
      <j-button label="Empty result" variant="text" (onClick)="forceEmpty.set(!forceEmpty())" />
    </div>
  </div>
  <j-table
    caption="Customers with expandable advanced filters"
    [value]="forceEmpty() ? [] : visibleRows()"
    [columns]="toolbarColumns"
    [loading]="loading()"
    [paginator]="true"
    [rows]="5"
    [scrollable]="true"
    [tableStyle]="{ 'min-width': '82rem' }"
    [showCurrentPageReport]="true"
    [showGlobalFilter]="false"
    [showColumnManager]="false"
    [showExport]="false"
    [maximizable]="false"
    noResultsTitle="No matching customers"
  >
    <ng-template jTableCell="customerName" let-row>
      <span class="j-docs-table-customer">
        <j-avatar [initials]="initials($any(row)['customerName'])" [ariaLabel]="$any(row)['customerName']" size="sm" />
        <strong>{{ $any(row)['customerName'] }}</strong>
      </span>
    </ng-template>
    <ng-template jTableCell="status" let-value="value">
      <j-badge [value]="$any(value)" [severity]="value === 'Active' ? 'success' : 'warning'" variant="soft" />
    </ng-template>
    <ng-template jTableCell="actions" let-row>
      <j-button icon="eye" actionDisplay="icon" [ariaLabel]="'View ' + $any(row)['customerName']" jTooltip="View customer" />
    </ng-template>
  </j-table>
`;

abstract class CustomerFilterExampleBase {
  readonly rows = createCustomerRows();
  readonly managerOptions = options('Avery Reed', 'Morgan Kim', 'Jordan Lee');
  readonly industryOptions = options('Technology', 'Retail', 'Healthcare', 'Logistics');
  readonly subscriptionOptions = options('Starter', 'Growth', 'Enterprise');
  readonly statusOptions = options('Active', 'Onboarding', 'Paused');

  readonly search = signal('');
  readonly customer = signal('');
  readonly manager = signal('');
  readonly industry = signal('');
  readonly subscription = signal('');
  readonly status = signal('');
  readonly joinedFrom = signal('');
  readonly joinedTo = signal('');
  readonly activeFrom = signal('');
  readonly activeTo = signal('');
  readonly applied = signal<AppliedFilters>({ ...EMPTY_FILTERS });
  readonly loading = signal(false);
  readonly forceEmpty = signal(false);

  readonly toolbarColumns = createColumns(false);
  readonly visibleRows = computed(() => filterRows(this.rows, this.applied()));
  readonly activeChips = computed(() => chipsFor(this.applied()));

  applyFilters(): void {
    this.applied.set({
      search: this.search(),
      customer: this.customer(),
      accountManager: this.manager(),
      industry: this.industry(),
      subscription: this.subscription(),
      status: this.status(),
      joinedFrom: this.joinedFrom(),
      joinedTo: this.joinedTo(),
      activeFrom: this.activeFrom(),
      activeTo: this.activeTo(),
    });
  }

  clearAll(): void {
    for (const field of filterSignalEntries(this)) field.set('');
    this.applied.set({ ...EMPTY_FILTERS });
    this.forceEmpty.set(false);
  }

  removeFilter(key: keyof AppliedFilters): void {
    const next = { ...this.applied(), [key]: '' };
    this.applied.set(next);
    const draft = draftSignal(this, key);
    draft?.set('');
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  asText(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  asDateText(value: JDatePickerValue): string {
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return '';
  }
}

@Component({
  selector: 'app-inline-column-filters-table',
  imports: [...TABLE_FILTER_COMMON_IMPORTS, JInputNumberComponent, JTableFilterTemplateDirective],
  template: INLINE_FILTERS_TEMPLATE,
  styles: [TABLE_FILTER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineColumnFiltersTableComponent extends CustomerFilterExampleBase {
  readonly inlineColumns = createColumns(true);
  readonly inlineState = signal<'normal' | 'loading' | 'empty'>('normal');

  toggleInlineLoading(): void {
    this.inlineState.update((state) => (state === 'loading' ? 'normal' : 'loading'));
  }

  toggleInlineEmpty(): void {
    this.inlineState.update((state) => (state === 'empty' ? 'normal' : 'empty'));
  }
}

@Component({
  selector: 'app-filters-above-table',
  imports: [...TABLE_FILTER_COMMON_IMPORTS, JChipComponent],
  template: TOOLBAR_FILTERS_TEMPLATE,
  styles: [TABLE_FILTER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersAboveTableComponent extends CustomerFilterExampleBase {}

@Component({
  selector: 'app-expandable-filter-panel-table',
  imports: [...TABLE_FILTER_COMMON_IMPORTS, JChipComponent],
  template: EXPANDABLE_FILTERS_TEMPLATE,
  styles: [TABLE_FILTER_STYLES],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableFilterPanelTableComponent extends CustomerFilterExampleBase {
  readonly panelOpen = signal(false);
}

export const TABLE_FILTER_EXAMPLE_COMPONENTS: Readonly<Record<string, Type<unknown>>> = {
  'filtering-inline-column-filters': InlineColumnFiltersTableComponent,
  'filtering-filters-above-table': FiltersAboveTableComponent,
  'filtering-expandable-filter-panel': ExpandableFilterPanelTableComponent,
};

export const TABLE_FILTER_EXAMPLE_DOCS = [
  {
    key: 'filtering-inline-column-filters',
    family: 'filtering',
    name: 'Inline Column Filters',
    details: 'Display filter controls directly below each column header for quick data filtering.',
    html: INLINE_FILTERS_TEMPLATE.trim(),
    ts: `export class InlineColumnFiltersTableComponent extends CustomerFilterExampleBase {
  readonly inlineColumns = createColumns(true);
  readonly inlineState = signal<'normal' | 'loading' | 'empty'>('normal');
}`,
    scss: TABLE_FILTER_STYLES.trim(),
  },
  {
    key: 'filtering-filters-above-table',
    family: 'filtering',
    name: 'Filters Above Table',
    details:
      'Use a dedicated filter toolbar above the table for advanced and responsive filtering.',
    html: TOOLBAR_FILTERS_TEMPLATE.trim(),
    ts: `export class FiltersAboveTableComponent extends CustomerFilterExampleBase {}`,
    scss: TABLE_FILTER_STYLES.trim(),
  },
  {
    key: 'filtering-expandable-filter-panel',
    family: 'filtering',
    name: 'Expandable Filter Panel',
    details:
      'Open an advanced filter panel above the table only when filtering controls are needed.',
    html: EXPANDABLE_FILTERS_TEMPLATE.trim(),
    ts: `export class ExpandableFilterPanelTableComponent extends CustomerFilterExampleBase {
  readonly panelOpen = signal(false);
}`,
    scss: TABLE_FILTER_STYLES.trim(),
  },
] as const;

function createColumns(inline: boolean): readonly JTableColumn<CustomerFilterRow>[] {
  const filterable = inline;
  return [
    { field: 'customerId', header: 'Customer ID', sortable: true, filterable, width: '9rem' },
    {
      field: 'customerName',
      header: 'Customer Name',
      sortable: true,
      filterable,
      minWidth: '13rem',
    },
    { field: 'company', header: 'Company', sortable: true, filterable, minWidth: '13rem' },
    {
      field: 'accountManager',
      header: 'Account Manager',
      sortable: true,
      filterable,
      minWidth: '12rem',
      filter: { type: 'select', operator: 'equals' },
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable,
      width: '9rem',
      filter: { type: 'select', operator: 'equals' },
    },
    {
      field: 'joinedDate',
      header: 'Joined Date',
      type: 'date',
      sortable: true,
      filterable,
      width: '11rem',
    },
    {
      field: 'outstandingBalance',
      header: 'Outstanding Balance',
      type: 'number',
      sortable: true,
      filterable,
      align: 'end',
      width: '12rem',
      formatter: (value) => `$${Number(value).toLocaleString('en-US')}`,
    },
    { field: 'actions', header: 'Actions', width: '6rem', align: 'center' },
  ];
}

function createCustomerRows(): readonly CustomerFilterRow[] {
  const names = [
    [
      'CUS-1001',
      'Avery Morgan',
      'Northwind Harbor',
      'avery@northwind.example',
      'Avery Reed',
      'Technology',
      'Enterprise',
      'Active',
      '2025-02-14',
      '2026-07-27',
      1200,
    ],
    [
      'CUS-1002',
      'Riley Chen',
      'Willow & Pine',
      'riley@willowpine.example',
      'Morgan Kim',
      'Retail',
      'Growth',
      'Onboarding',
      '2025-04-22',
      '2026-07-25',
      0,
    ],
    [
      'CUS-1003',
      'Noah Brooks',
      'Blue Cedar Labs',
      'noah@bluecedar.example',
      'Jordan Lee',
      'Technology',
      'Growth',
      'Active',
      '2024-11-08',
      '2026-07-28',
      480,
    ],
    [
      'CUS-1004',
      'Maya Patel',
      'Crescent Health',
      'maya@crescent.example',
      'Avery Reed',
      'Healthcare',
      'Enterprise',
      'Active',
      '2025-07-01',
      '2026-07-23',
      2360,
    ],
    [
      'CUS-1005',
      'Elliot James',
      'Harbor Lane Goods',
      'elliot@harborlane.example',
      'Morgan Kim',
      'Retail',
      'Starter',
      'Paused',
      '2026-01-18',
      '2026-06-30',
      310,
    ],
    [
      'CUS-1006',
      'Zoe Carter',
      'Summit Route',
      'zoe@summitroute.example',
      'Jordan Lee',
      'Logistics',
      'Growth',
      'Active',
      '2025-09-12',
      '2026-07-26',
      875,
    ],
    [
      'CUS-1007',
      'Liam Foster',
      'Oakline Systems',
      'liam@oakline.example',
      'Avery Reed',
      'Technology',
      'Enterprise',
      'Active',
      '2024-08-05',
      '2026-07-24',
      0,
    ],
    [
      'CUS-1008',
      'Sofia Nguyen',
      'Meadow Retail',
      'sofia@meadow.example',
      'Morgan Kim',
      'Retail',
      'Growth',
      'Onboarding',
      '2026-03-03',
      '2026-07-22',
      1420,
    ],
    [
      'CUS-1009',
      'Theo Wilson',
      'Atlas Freight',
      'theo@atlasfreight.example',
      'Jordan Lee',
      'Logistics',
      'Enterprise',
      'Active',
      '2025-05-29',
      '2026-07-27',
      690,
    ],
    [
      'CUS-1010',
      'Ivy Robinson',
      'Juniper Care',
      'ivy@junipercare.example',
      'Avery Reed',
      'Healthcare',
      'Starter',
      'Paused',
      '2025-12-11',
      '2026-07-10',
      225,
    ],
    [
      'CUS-1011',
      'Milo Davis',
      'Redwood Market',
      'milo@redwood.example',
      'Morgan Kim',
      'Retail',
      'Growth',
      'Active',
      '2024-10-19',
      '2026-07-21',
      990,
    ],
    [
      'CUS-1012',
      'Nora Evans',
      'Skyline Transit',
      'nora@skyline.example',
      'Jordan Lee',
      'Logistics',
      'Enterprise',
      'Active',
      '2025-06-17',
      '2026-07-28',
      1750,
    ],
  ] as const;
  return names.map(
    ([
      customerId,
      customerName,
      company,
      email,
      accountManager,
      industry,
      subscription,
      status,
      joinedDate,
      lastActive,
      outstandingBalance,
    ]) => ({
      customerId,
      customerName,
      company,
      email,
      accountManager,
      industry,
      subscription,
      status,
      joinedDate,
      lastActive,
      outstandingBalance,
      actions: '',
    }),
  );
}

function options(...values: readonly string[]): readonly { label: string; value: string }[] {
  return values.map((value) => ({ label: value, value }));
}

function filterRows(
  rows: readonly CustomerFilterRow[],
  filters: AppliedFilters,
): readonly CustomerFilterRow[] {
  const includes = (value: unknown, query: string) =>
    String(value ?? '')
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase());
  return rows.filter((row) => {
    const globalMatch =
      !filters.search ||
      [
        row.customerId,
        row.customerName,
        row.company,
        row.email,
        row.accountManager,
        row.industry,
        row.subscription,
        row.status,
      ].some((value) => includes(value, filters.search));
    return (
      globalMatch &&
      (!filters.customer ||
        includes(row.customerName, filters.customer) ||
        includes(row.email, filters.customer)) &&
      (!filters.accountManager || row.accountManager === filters.accountManager) &&
      (!filters.industry || row.industry === filters.industry) &&
      (!filters.subscription || row.subscription === filters.subscription) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.joinedFrom || row.joinedDate >= filters.joinedFrom) &&
      (!filters.joinedTo || row.joinedDate <= filters.joinedTo) &&
      (!filters.activeFrom || row.lastActive >= filters.activeFrom) &&
      (!filters.activeTo || row.lastActive <= filters.activeTo)
    );
  });
}

function chipsFor(filters: AppliedFilters): readonly FilterChip[] {
  const labels: Record<keyof AppliedFilters, string> = {
    search: 'Search',
    customer: 'Customer',
    accountManager: 'Manager',
    industry: 'Industry',
    subscription: 'Subscription',
    status: 'Status',
    joinedFrom: 'Joined from',
    joinedTo: 'Joined to',
    activeFrom: 'Active from',
    activeTo: 'Active to',
  };
  return (Object.keys(filters) as (keyof AppliedFilters)[])
    .filter((key) => Boolean(filters[key]))
    .map((key) => ({ key, label: `${labels[key]}: ${filters[key]}` }));
}

function filterSignalEntries(instance: CustomerFilterExampleBase) {
  return [
    instance.search,
    instance.customer,
    instance.manager,
    instance.industry,
    instance.subscription,
    instance.status,
    instance.joinedFrom,
    instance.joinedTo,
    instance.activeFrom,
    instance.activeTo,
  ];
}

function draftSignal(
  instance: CustomerFilterExampleBase,
  key: keyof AppliedFilters,
): WritableSignal<string> | null {
  const signals: Record<keyof AppliedFilters, WritableSignal<string>> = {
    search: instance.search,
    customer: instance.customer,
    accountManager: instance.manager,
    industry: instance.industry,
    subscription: instance.subscription,
    status: instance.status,
    joinedFrom: instance.joinedFrom,
    joinedTo: instance.joinedTo,
    activeFrom: instance.activeFrom,
    activeTo: instance.activeTo,
  };
  return signals[key] ?? null;
}

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { format } from 'prettier';

const workspace = resolve(import.meta.dirname, '..');
const output = resolve(
  workspace,
  'projects/docs/src/app/demos/table-scenarios/table-scenarios.generated.ts',
);

const families = {
  basic: [
    'Basic table',
    'Dynamic columns',
    'Custom header template',
    'Custom body template',
    'Custom footer template',
    'Small size',
    'Default size',
    'Large size',
    'Compact density',
    'Grid lines',
    'Striped rows',
    'Hoverable rows',
    'Responsive table',
    'Conditional row styling',
    'Conditional cell styling',
    'Custom empty state',
    'Custom loading state',
  ],
  pagination: [
    'Basic pagination',
    'Configurable rows per page',
    'Rows-per-page dropdown',
    'Current page report',
    'First and last page buttons',
    'Programmatic pagination',
    'Reset pagination',
    'Pagination events',
    'Client-side pagination',
    'Server-side pagination',
    'Pagination with sorting',
    'Pagination with filtering',
  ],
  sorting: [
    'Single-column sorting',
    'Multiple-column sorting',
    'Default sorting',
    'Ascending and descending sorting',
    'Removable sorting',
    'Custom sort function',
    'Sorting text values',
    'Sorting numeric values',
    'Sorting date values',
    'Sorting boolean values',
    'Programmatic sorting',
    'Sort events',
    'Sorting with pagination',
    'Sorting with filtering',
  ],
  filtering: [
    'Global search',
    'Basic column filtering',
    'Text filter',
    'Number filter',
    'Date filter',
    'Boolean filter',
    'Select filter',
    'MultiSelect filter',
    'Range filter',
    'Custom filter template',
    'Filter match modes',
    'Multiple filter constraints',
    'AND/OR operators',
    'Filter menu',
    'Inline filter row',
    'Apply filter',
    'Clear individual filter',
    'Clear all filters',
    'Programmatic filtering',
    'Client-side filtering',
    'Server-side filtering',
    'Filtering with sorting and pagination',
  ],
  selection: [
    'Single-row selection',
    'Multiple-row selection',
    'Checkbox selection',
    'Radio-button selection',
    'Select-all checkbox',
    'Indeterminate header checkbox',
    'Disabled row selection',
    'Conditional row selection',
    'Row-click selection',
    'Selection using a dedicated column',
    'Programmatic selection',
    'Clear selection',
    'Row select event',
    'Row unselect event',
    'Select-all event',
    'Keyboard-accessible selection',
  ],
  expansion: [
    'Basic row expansion',
    'Single expanded row',
    'Multiple expanded rows',
    'Expand all',
    'Collapse all',
    'Programmatic expansion',
    'Custom expanded-row template',
    'Nested detail section',
    'Expanded content containing other JRNG components',
    'Expansion events',
    'Expansion with pagination',
    'Expansion with filtering',
  ],
  editing: [
    'Cell editing',
    'Row editing',
    'Text input editor',
    'Number input editor',
    'Select editor',
    'Date picker editor',
    'Checkbox editor',
    'Save changes',
    'Cancel changes',
    'Validation during editing',
    'Invalid edit state',
    'Read-only cells',
    'Conditionally editable cells',
    'Programmatic editing',
    'Edit events',
    'Cell editing with selection',
    'Row editing with multiple fields',
  ],
  grouping: [
    'Group by field',
    'Subheader grouping',
    'Rowspan grouping',
    'Expandable row groups',
    'Group totals',
    'Group footer',
    'Custom group header',
    'Custom group footer',
    'Programmatic group expansion',
    'Group expansion events',
  ],
  columns: [
    'Column resizing in fit mode',
    'Column resizing in expand mode',
    'Resizing in scrollable tables',
    'Column reordering',
    'Column visibility toggle',
    'Column chooser',
    'Programmatic column visibility',
    'Fixed columns',
    'Frozen column',
    'Multiple frozen columns',
    'Frozen columns on the left',
    'Frozen columns on the right',
    'Column groups',
    'Multi-row headers',
    'Header colspan',
    'Header rowspan',
    'Grouped columns with sorting',
    'Grouped columns with filtering',
    'Grouped columns with resizing',
  ],
  reorder: [
    'Drag-and-drop row reordering',
    'Reordering using a drag handle',
    'Disabled reordering for specific rows',
    'Reorder events',
    'Programmatic row updates',
    'Reordering with selection',
    'Reordering with pagination',
    'Keyboard-accessible alternative',
  ],
  scrolling: [
    'Vertical',
    'Horizontal',
    'Horizontal and Vertical',
    'Fixed Height',
    'Flexible',
    'Responsive scrolling',
    'Sticky header',
    'Frozen rows',
    'Frozen columns',
    'Multiple frozen columns',
    'Scrolling with pagination',
    'Scrolling with column resizing',
    'Scrolling with grouped columns',
  ],
  virtual: [
    'Basic virtual scrolling',
    'Virtual scrolling with preloaded data',
    'Lazy virtual scrolling',
    'Virtual scrolling with loading placeholders',
    'Virtual scrolling with filtering',
    'Virtual scrolling with sorting',
    'Virtual scrolling with row selection',
    'Large dataset example',
  ],
  states: [
    'Loading overlay',
    'Loading skeleton rows',
    'Initial loading',
    'Pagination loading',
    'Filtering loading',
    'Lazy-load loading',
    'Empty dataset',
    'No filter results',
    'Custom empty template',
    'Error state',
    'Retry action',
  ],
  export: [
    'Export all rows to CSV',
    'Export visible rows',
    'Export selected rows',
    'Export filtered rows',
    'Export custom columns',
    'Custom CSV filename',
    'Custom export formatting',
    'Export event',
    'Disabled export while loading',
  ],
  stateful: [
    'Persist pagination',
    'Persist sorting',
    'Persist filters',
    'Persist column order',
    'Persist column width',
    'Persist column visibility',
    'Persist row selection',
    'Persist expanded rows',
    'Session storage example',
    'Local storage example',
    'Clear saved state',
    'Restore default state',
  ],
  actions: [
    'Row context menu',
    'Header context menu',
    'Row action buttons',
    'Icon-only actions',
    'Edit action',
    'Delete action',
    'View-details action',
    'Conditional actions',
    'Disabled actions',
    'Action overflow menu',
    'Keyboard-accessible menu',
  ],
  advanced: [
    'Customer management table',
    'Employee directory',
    'Product inventory',
    'Order management',
    'Transaction history',
    'Database editor',
    'Admin user management',
  ],
};

const scenarios = Object.entries(families).flatMap(([family, names]) =>
  names.map((name) => {
    const key = `${family}-${slug(name)}`;
    // A family uses one compiled template and receives a scenario input. Each
    // documentation card still creates a separate component instance, so its
    // rows, selection, paging, filters, and edit state remain independent.
    const template = templateFor(family, names[0]);
    return {
      key,
      family,
      name,
      template,
      details: descriptionFor(family, name),
    };
  }),
);

const imports = `import { Component, input, Type } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JSelectComponent } from 'jrng-ui/select';
import {
  JTableActionsTemplateDirective,
  JTableCellTemplateDirective,
  JTableComponent,
  JTableEmptyTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableLoadingTemplateDirective,
} from 'jrng-ui/table';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { TableScenarioState } from './table-scenario-state';

const TABLE_DEMO_IMPORTS = {
  basic: [JTableComponent, JTableCellTemplateDirective, JTableEmptyTemplateDirective, JTableHeaderTemplateDirective, JTableLoadingTemplateDirective],
  pagination: [JButtonComponent, JTableComponent],
  sorting: [JButtonComponent, JTableComponent],
  filtering: [JButtonComponent, JCheckboxComponent, JDatePickerComponent, JInputComponent, JInputNumberComponent, JSelectComponent, JTableComponent, JTableFilterTemplateDirective],
  selection: [JButtonComponent, JTableComponent],
  expansion: [JButtonComponent, JCardComponent, JTableComponent],
  editing: [JTableComponent],
  grouping: [JButtonComponent, JTableComponent],
  columns: [JTableComponent],
  reorder: [JTableComponent],
  scrolling: [JTableComponent],
  virtual: [JTableComponent],
  states: [JTableComponent, JTableEmptyTemplateDirective],
  export: [JTableComponent],
  stateful: [JButtonComponent, JTableComponent],
  actions: [JButtonComponent, JTableActionsTemplateDirective, JTableComponent, JTooltipDirective],
  advanced: [JTableComponent],
};

const TABLE_DEMO_STYLES = \`
  :host { display: block; min-width: 0; }
  .j-table-demo__controls { display: flex; flex-wrap: wrap; gap: var(--j-spacing-2); margin-bottom: var(--j-spacing-3); }
  .j-table-demo__status { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-sm); margin: var(--j-spacing-2) 0 0; }
  .j-table-demo__detail { display: grid; gap: var(--j-spacing-2); padding: var(--j-spacing-3); }
  .j-table-demo__scroll-note { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-sm); margin: 0 0 var(--j-spacing-3); }
  .j-table-demo__flex-scroll { display: flex; flex-direction: column; height: min(55vh, 28rem); min-height: 18rem; min-width: 0; }
  :host ::ng-deep .j-table-demo__needs-review td { background: color-mix(in srgb, var(--j-color-warning) 9%, var(--j-table-bg)); }
  :host ::ng-deep .j-table-demo__high-value { color: var(--j-color-success); font-weight: var(--j-font-weight-semibold); }
  @media (max-width: 640px) { .j-table-demo__controls j-button { flex: 1 1 auto; } }
\`;
`;

const declarations = Object.keys(families)
  .map((family) => {
    const familyScenarios = scenarios.filter((scenario) => scenario.family === family);
    const className = `${pascal(family)}TableScenariosComponent`;
    const template = familyScenarios[0].template;
    return `
@Component({
  selector: 'app-${family}-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.${family},
  template: ${JSON.stringify(template)},
  styles: [TABLE_DEMO_STYLES],
})
export class ${className} extends TableScenarioState {
  readonly scenario = input.required<string>();
}
`;
  })
  .join('\n');

const familySources = `const TABLE_SCENARIO_SOURCES = {
${Object.keys(families)
  .map((family) => {
    const scenario = scenarios.find((candidate) => candidate.family === family);
    return `  ${family}: {
    html: ${JSON.stringify(scenario.template)},
    ts: ${JSON.stringify(`@Component({
  selector: 'app-${family}-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.${family},
  templateUrl: './${family}-table-scenarios.component.html',
})
export class ${pascal(family)}TableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}`)},
    scss: ':host { display: block; min-width: 0; }',
  },`;
  })
  .join('\n')}
} as const;
`;

const componentMap = `export const TABLE_SCENARIO_COMPONENTS: Readonly<Record<string, Type<unknown>>> = {
${scenarios
  .map((scenario) => `  '${scenario.key}': ${pascal(scenario.family)}TableScenariosComponent,`)
  .join('\n')}
};

${familySources}
export const TABLE_SCENARIO_DOCS = [
${scenarios
  .map(
    (scenario) =>
      `  { key: '${scenario.key}', family: '${scenario.family}', name: ${JSON.stringify(
        scenario.name,
      )}, details: ${JSON.stringify(
        scenario.details,
      )}, ...TABLE_SCENARIO_SOURCES.${scenario.family} },`,
  )
  .join('\n')}
] as const;
`;

await writeFile(
  output,
  await format(`${imports}${declarations}${componentMap}`, {
    parser: 'typescript',
    singleQuote: true,
  }),
);
console.log(`Generated ${scenarios.length} isolated Table documentation scenarios.`);

function templateFor(family, name) {
  const common =
    'selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false"';
  const status = `<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>`;
  const compiledFamilyTemplate = compiledTemplateFor(family, common, status);
  if (compiledFamilyTemplate) return compiledFamilyTemplate;

  if (family === 'basic') {
    if (name === 'Custom header template')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" ${common}>
  <ng-template jTableHeader="customer" let-column>{{ column.header }} / account</ng-template>
</j-table>`;
    if (name === 'Custom body template')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" ${common}>
  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>
</j-table>`;
    if (name === 'Custom footer template')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" ${common}>
  <ng-template #jTableFooter><tr><td [attr.colspan]="columns.length"><strong>Five recent orders</strong></td></tr></ng-template>
</j-table>`;
    if (name === 'Small size' || name === 'Compact density')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" density="compact" ${common} />`;
    if (name === 'Large size')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" density="spacious" ${common} />`;
    if (name === 'Grid lines')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" variant="gridlines" ${common} />`;
    if (name === 'Striped rows')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" variant="striped" ${common} />`;
    if (name === 'Responsive table')
      return `<j-table [value]="rows.slice(0, 5)" [columns]="wideColumns" responsiveMode="stack" ${common} />`;
    if (name === 'Conditional row styling')
      return `<j-table [value]="rows.slice(0, 6)" [columns]="columns" [rowClass]="rowClass" ${common} />`;
    if (name === 'Conditional cell styling')
      return `<j-table [value]="rows.slice(0, 6)" [columns]="conditionalColumns" ${common} />`;
    if (name === 'Custom empty state')
      return `<j-table [value]="[]" [columns]="columns" ${common}>
  <ng-template jTableEmpty let-state><div class="j-table-demo__detail"><img src="/assets/images/empty-state-search.webp" alt="Document with a magnifying glass" width="180" height="120" /><strong>No orders available</strong><span>State: {{ state }}</span></div></ng-template>
</j-table>`;
    if (name === 'Custom loading state')
      return `<j-table [value]="[]" [columns]="columns" loading ${common}>
  <ng-template jTableLoading let-variant><div class="j-table-demo__detail" role="status">Preparing {{ variant }} rows…</div></ng-template>
</j-table>`;
    return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" ${common} caption="${name}" />`;
  }

  if (family === 'pagination') {
    if (name === 'Programmatic pagination')
      return `<div class="j-table-demo__controls"><j-button label="Page 1" (onClick)="table.goToPage(1)" /><j-button label="Page 3" variant="outlined" (onClick)="table.goToPage(3)" /></div>
<j-table #table [value]="rows" [columns]="columns" [rows]="3" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;
    if (name === 'Reset pagination')
      return `<div class="j-table-demo__controls"><j-button label="Reset pagination" (onClick)="table.resetPagination()" /></div>
<j-table #table [value]="rows" [columns]="columns" [first]="6" [rows]="3" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;
    const lazy = name === 'Server-side pagination';
    return `<j-table [value]="${lazy ? 'serverRows' : 'rows'}" [columns]="columns" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" ${
      lazy ? 'dataMode="lazy" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)"' : ''
    } [showGlobalFilter]="${name.includes('filtering')}" [showColumnManager]="false" [showExport]="false" [maximizable]="false" ${
      name.includes('sorting') ? 'sortField="total" [sortOrder]="-1"' : ''
    } (pageChange)="onPage($event)" />
${status}`;
  }

  if (family === 'sorting') {
    if (name === 'Programmatic sorting')
      return `<div class="j-table-demo__controls"><j-button label="Sort total descending" (onClick)="table.sortBy('total', -1)" /><j-button label="Clear sort" variant="outlined" (onClick)="table.clearSort()" /></div>
<j-table #table [value]="rows" [columns]="columns" ${common} />`;
    const multiple = name === 'Multiple-column sorting';
    return `<j-table [value]="rows" [columns]="columns" sortMode="${multiple ? 'multiple' : 'single'}" ${
      name.includes('Default') || name.includes('descending')
        ? 'sortField="total" [sortOrder]="-1"'
        : ''
    } [removableSort]="${name !== 'Ascending and descending sorting'}" [paginator]="${name.includes(
      'pagination',
    )}" [rows]="5" [filterDisplay]="${name.includes('filtering') ? "'row'" : "'none'"}" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" (sortChange)="onSort($event)" />
${status}`;
  }

  if (family === 'filtering') {
    if (name === 'Custom filter template')
      return `<j-table [value]="rows" [columns]="columns" filterDisplay="row" ${common}>
  <ng-template jTableFilter="customer" let-apply="apply">
    <j-input label="Customer" placeholder="Filter customer" (valueChange)="apply($event)" />
  </ng-template>
  <ng-template jTableFilter="total" let-apply="apply">
    <j-input-number label="Minimum total" (valueChange)="apply($event)" />
  </ng-template>
  <ng-template jTableFilter="status" let-apply="apply">
    <j-select label="Status" [options]="statusOptions" (valueChange)="apply($event)" />
  </ng-template>
  <ng-template jTableFilter="date" let-apply="apply">
    <j-date-picker label="Order date" (valueChange)="apply($event)" />
  </ng-template>
  <ng-template jTableFilter="active" let-apply="apply">
    <j-checkbox label="Active only" (valueChange)="apply($event)" />
  </ng-template>
</j-table>`;
    if (name === 'Programmatic filtering')
      return `<div class="j-table-demo__controls"><j-button label="Approved only" (onClick)="table.filter('status', 'Approved', 'equals')" /><j-button label="Clear filters" variant="outlined" (onClick)="table.resetFilters()" /></div>
<j-table #table [value]="rows" [columns]="columns" filterDisplay="row" ${common} />`;
    const server = name === 'Server-side filtering';
    return `<j-table [value]="${server ? 'serverRows' : 'rows'}" [columns]="columns" filterDisplay="${
      name === 'Filter menu' ? 'menu' : 'row'
    }" [showGlobalFilter]="${name === 'Global search'}" ${
      server ? 'dataMode="lazy" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)"' : ''
    } [paginator]="${name.includes('pagination')}" [rows]="5" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;
  }

  if (family === 'selection') {
    if (name === 'Programmatic selection' || name === 'Clear selection')
      return `<div class="j-table-demo__controls"><j-button label="Select first two" (onClick)="table.selectRows(rows.slice(0, 2))" /><j-button label="Clear selection" variant="outlined" (onClick)="clearSelection(table)" /></div>
<j-table #table [value]="rows.slice(0, 6)" [columns]="columns" selectionMode="checkbox" [selection]="selection" (selectionChange)="onSelection($event)" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />
${status}`;
    const mode =
      name.includes('Single') || name.includes('Row-click')
        ? 'single'
        : name.includes('Radio')
          ? 'radio'
          : 'checkbox';
    return `<j-table [value]="rows.slice(0, 6)" [columns]="columns" selectionMode="${mode}" [selection]="selection" ${
      name.includes('Disabled') || name.includes('Conditional')
        ? '[rowSelectable]="rowSelectable"'
        : ''
    } (selectionChange)="onSelection($event)" (rowSelect)="eventMessage = 'Row selected.'" (rowUnselect)="eventMessage = 'Row unselected.'" (selectAllChange)="eventMessage = 'Select-all changed.'" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />
${status}`;
  }

  if (family === 'expansion')
    return `<div class="j-table-demo__controls"><j-button label="Expand all" (onClick)="table.expandAllRows()" /><j-button label="Collapse all" variant="outlined" (onClick)="table.collapseAllRows()" /></div>
<j-table #table [value]="rows" [columns]="columns" expandableRows rowKey="id" [expandedRowKeys]="expandedKeys" (expandedRowKeysChange)="expandedKeys = $event" (rowExpand)="eventMessage = 'Row expanded.'" (rowCollapse)="eventMessage = 'Row collapsed.'" [paginator]="${name.includes(
      'pagination',
    )}" [rows]="5" [filterDisplay]="${name.includes('filtering') ? "'row'" : "'none'"}" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">
  <ng-template #jTableExpandedRow let-row>
    <j-card header="Order details"><div class="j-table-demo__detail"><span>{{ row.product }}</span><strong>{{ row.email }}</strong></div></j-card>
  </ng-template>
</j-table>
${status}`;

  if (family === 'editing')
    return `<p class="j-table-demo__status">Double-click an editable cell. Press Enter to save or Escape to cancel.</p>
<j-table [value]="rows.slice(0, 6)" [columns]="columns" editMode="cell" selectionMode="${
      name.includes('selection') ? 'single' : 'none'
    }" (cellEditSave)="onCellEdit($event)" (editValidationError)="eventMessage = $event.error" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />
${status}`;

  if (family === 'grouping') {
    if (name === 'Rowspan grouping')
      return `<j-table [value]="rows" [columns]="groupedColumns" ${common} />`;
    return `<div class="j-table-demo__controls"><j-button label="Expand groups" (onClick)="table.expandAllGroups()" /><j-button label="Collapse groups" variant="outlined" (onClick)="table.collapseAllGroups()" /></div>
<j-table #table [value]="rows" [columns]="columns" groupRowsBy="department" collapsibleRowGroups (rowGroupToggle)="eventMessage = 'Group expansion changed.'" ${common}>
  <ng-template #jTableGroupHeader let-value="value"><strong>{{ value }}</strong></ng-template>
  <ng-template #jTableGroupFooter let-value="value"><span>{{ value }} subtotal</span></ng-template>
</j-table>
${status}`;
  }

  if (family === 'columns')
    return `<j-table [value]="rows.slice(0, 6)" [columns]="${name.includes('Frozen') || name.includes('Fixed') ? 'wideColumns' : 'columns'}" [columnGroups]="${
      name.includes('group') || name.includes('Group') || name.includes('Header')
        ? 'columnGroups'
        : '[]'
    }" columnResizeMode="${name.includes('fit') ? 'fit' : 'expand'}" scrollHeight="18rem" [showGlobalFilter]="false" showColumnManager [showExport]="false" [maximizable]="false" />`;

  if (family === 'reorder')
    return `<p class="j-table-demo__status">Drag rows, or focus a row and press Alt+Arrow Up/Down.</p>
<j-table [value]="rows.slice(0, 7)" [columns]="columns" reorderableRows [rowReorderable]="rowReorderable" selectionMode="${
      name.includes('selection') ? 'checkbox' : 'none'
    }" [paginator]="${name.includes('pagination')}" [rows]="4" (rowReorder)="onRowReorder($event)" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />
${status}`;

  if (family === 'scrolling')
    return `<j-table [value]="rows" [columns]="wideColumns" scrollHeight="18rem" [paginator]="${name.includes(
      'pagination',
    )}" [rows]="5" [frozenRows]="${name === 'Frozen rows'}" [lockedRowKeys]="${
      name === 'Frozen rows' ? "['1']" : '[]'
    }" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;

  if (family === 'virtual')
    return `<j-table [value]="virtualRows" [columns]="columns" virtualScroll [virtualItemSize]="44" scrollHeight="22rem" dataMode="${
      name.includes('Lazy') ? 'virtual' : 'client'
    }" [loading]="${name.includes('loading')}" selectionMode="${
      name.includes('selection') ? 'checkbox' : 'none'
    }" [filterDisplay]="${name.includes('filtering') ? "'row'" : "'none'"}" ${
      name.includes('sorting') ? 'sortField="total" [sortOrder]="-1"' : ''
    } [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;

  if (family === 'states') {
    if (name === 'Custom empty template')
      return `<j-table [value]="[]" [columns]="columns" ${common}><ng-template jTableEmpty><div class="j-table-demo__detail"><strong>Nothing here yet</strong><span>Create the first order to begin.</span></div></ng-template></j-table>`;
    if (name === 'Error state' || name === 'Retry action')
      return `<j-table [value]="[]" [columns]="columns" [errorState]="true" emptyActionLabel="Retry" (emptyAction)="retry()" ${common} />${status}`;
    if (name === 'Empty dataset') return `<j-table [value]="[]" [columns]="columns" ${common} />`;
    if (name === 'No filter results')
      return `<j-table [value]="rows" [columns]="columns" globalFilter="no-match" ${common} />`;
    return `<j-table [value]="rows.slice(0, 5)" [columns]="columns" loading loadingVariant="${
      name === 'Loading overlay' ? 'overlay' : 'skeleton'
    }" [paginator]="${name.includes(
      'Pagination',
    )}" selectionMode="none" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;
  }

  if (family === 'export') {
    const mode = name.includes('selected')
      ? 'selected'
      : name.includes('visible')
        ? 'visible'
        : name.includes('filtered')
          ? 'filtered'
          : 'all';
    return `<j-table [value]="rows" [columns]="actionColumns" selectionMode="${
      mode === 'selected' ? 'checkbox' : 'none'
    }" [selection]="selection" (selectionChange)="selection = $event" [exportConfig]="{ rows: '${mode}', filename: 'jrng-orders.csv', visibleColumnsOnly: true }" [loading]="${name.includes(
      'loading',
    )}" (export)="onExport($event)" [paginator]="true" [rows]="5" [showGlobalFilter]="false" [showColumnManager]="false" showExport [maximizable]="false" />${status}`;
  }

  if (family === 'stateful')
    return `<j-table #table [value]="rows" [columns]="columns" stateKey="jrng-table-${slug(
      name,
    )}" stateStorage="${name.includes('Session') ? 'session' : 'local'}" [restoreSelection]="${name.includes(
      'selection',
    )}" expandableRows [paginator]="true" [rows]="5" filterDisplay="row" [showGlobalFilter]="true" showColumnManager [showExport]="false" [maximizable]="false" />`;

  if (family === 'actions')
    return `<j-table [value]="rows.slice(0, 6)" [columns]="actionColumns" (action)="onAction($event)" (contextMenu)="eventMessage = 'Row context menu requested.'" (headerContextMenu)="eventMessage = 'Header context menu requested.'" ${common}>
  ${
    name === 'Row action buttons' || name === 'Icon-only actions'
      ? `<ng-template jTableActions="id" let-row><j-button icon="eye" actionDisplay="icon" ariaLabel="View order" title="View order" jTooltip="View order" (onClick)="eventMessage = 'View ' + row.code" /></ng-template>`
      : ''
  }
</j-table>${status}`;

  return `<j-table title="${name}" description="A complete business workflow using local demonstration data." [value]="rows" [columns]="actionColumns" [paginator]="true" [rows]="5" filterDisplay="row" selectionMode="checkbox" [selection]="selection" (selectionChange)="onSelection($event)" (cellEditSave)="onCellEdit($event)" (action)="onAction($event)" (export)="onExport($event)" editMode="${
    name === 'Database editor' ? 'cell' : 'none'
  }" responsiveMode="scroll" />${status}`;
}

function compiledTemplateFor(family, common, status) {
  if (family === 'basic')
    return `<j-table [value]="scenario().includes('empty-state') || scenario().includes('loading-state') ? [] : rows.slice(0, 5)" [columns]="scenario().includes('responsive') || scenario().includes('dynamic') ? wideColumns : scenario().includes('conditional-cell') ? conditionalColumns : columns" [density]="scenario().includes('small') || scenario().includes('compact') ? 'compact' : scenario().includes('large') ? 'spacious' : 'comfortable'" [variant]="scenario().includes('grid-lines') ? 'gridlines' : scenario().includes('striped') ? 'striped' : 'standard'" [responsiveMode]="scenario().includes('responsive') ? 'stack' : 'scroll'" [rowClass]="scenario().includes('conditional-row') ? rowClass : null" [loading]="scenario().includes('loading-state')" [caption]="scenario()" ${common}>
  <ng-template jTableHeader="customer" let-column>{{ column.header }} / account</ng-template>
  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>
  <ng-template #jTableFooter><tr><td [attr.colspan]="columns.length"><strong>Recent order total</strong></td></tr></ng-template>
  <ng-template jTableEmpty let-state><div class="j-table-demo__detail"><strong>No orders available</strong><span>State: {{ state }}</span></div></ng-template>
  <ng-template jTableLoading let-variant><div class="j-table-demo__detail" role="status">Preparing {{ variant }} rows…</div></ng-template>
</j-table>`;

  if (family === 'pagination')
    return `<div class="j-table-demo__controls"><j-button label="Page 1" (onClick)="table.goToPage(1)" /><j-button label="Page 3" variant="outlined" (onClick)="table.goToPage(3)" /><j-button label="Reset" variant="text" (onClick)="table.resetPagination()" /></div>
<j-table #table [value]="scenario().includes('server-side') ? serverRows : rows" [columns]="columns" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" [dataMode]="scenario().includes('server-side') ? 'lazy' : 'client'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [showGlobalFilter]="scenario().includes('filtering')" [showCurrentPageReport]="true" [showFirstLastPageButtons]="true" [showColumnManager]="false" [showExport]="false" [maximizable]="false" [sortField]="scenario().includes('sorting') ? 'total' : ''" [sortOrder]="scenario().includes('sorting') ? -1 : 0" (pageChange)="onPage($event)" />
${status}`;

  if (family === 'sorting')
    return `<div class="j-table-demo__controls"><j-button label="Sort total descending" (onClick)="table.sortBy('total', -1)" /><j-button label="Clear sort" variant="outlined" (onClick)="table.clearSort()" /></div>
<j-table #table [value]="rows" [columns]="columns" [sortMode]="scenario().includes('multiple') ? 'multiple' : 'single'" [sortField]="scenario().includes('default') || scenario().includes('descending') ? 'total' : ''" [sortOrder]="scenario().includes('default') || scenario().includes('descending') ? -1 : 0" [removableSort]="!scenario().includes('ascending-and-descending')" [paginator]="scenario().includes('pagination')" [rows]="5" [filterDisplay]="scenario().includes('filtering') ? 'row' : 'none'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" (sortChange)="onSort($event)" />
${status}`;

  if (family === 'filtering')
    return `<div class="j-table-demo__controls"><j-button label="Approved only" (onClick)="table.filter('status', 'Approved', 'equals')" /><j-button label="Clear filters" variant="outlined" (onClick)="table.resetFilters()" /></div>
<j-table #table [value]="scenario().includes('server-side') ? serverRows : rows" [columns]="columns" [filterDisplay]="scenario().includes('filter-menu') ? 'menu' : 'row'" [showGlobalFilter]="scenario().includes('global-search')" [dataMode]="scenario().includes('server-side') ? 'lazy' : 'client'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [paginator]="scenario().includes('pagination')" [rows]="5" [showColumnManager]="false" [showExport]="false" [maximizable]="false">
  <ng-template jTableFilter="customer" let-apply="apply"><j-input label="Customer" placeholder="Filter customer" (valueChange)="apply($event)" /></ng-template>
  <ng-template jTableFilter="total" let-apply="apply"><j-input-number label="Minimum total" (valueChange)="apply($event)" /></ng-template>
  <ng-template jTableFilter="status" let-apply="apply"><j-select label="Status" [options]="statusOptions" (valueChange)="apply($event)" /></ng-template>
  <ng-template jTableFilter="date" let-apply="apply"><j-date-picker label="Order date" (valueChange)="apply($event)" /></ng-template>
  <ng-template jTableFilter="active" let-apply="apply"><j-checkbox label="Active only" (valueChange)="apply($event)" /></ng-template>
</j-table>`;

  if (family === 'selection')
    return `<div class="j-table-demo__controls"><j-button label="Select first two" (onClick)="table.selectRows(rows.slice(0, 2))" /><j-button label="Clear selection" variant="outlined" (onClick)="table.clearSelection()" /></div>
<j-table #table [value]="rows.slice(0, 6)" [columns]="columns" [selectionMode]="scenario().includes('single') || scenario().includes('row-click') ? 'single' : scenario().includes('radio') ? 'radio' : 'checkbox'" [selection]="selection" [rowSelectable]="scenario().includes('disabled') || scenario().includes('conditional') ? rowSelectable : null" (selectionChange)="onSelection($event)" (rowSelect)="eventMessage = 'Row selected.'" (rowUnselect)="eventMessage = 'Row unselected.'" (selectAllChange)="eventMessage = 'Select-all changed.'" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />
${status}`;

  if (family === 'expansion')
    return `<div class="j-table-demo__controls"><j-button label="Expand all" (onClick)="table.expandAllRows()" /><j-button label="Collapse all" variant="outlined" (onClick)="table.collapseAllRows()" /></div>
<j-table #table [value]="rows" [columns]="columns" expandableRows rowKey="id" [expandedRowKeys]="expandedKeys" (expandedRowKeysChange)="expandedKeys = $event" (rowExpand)="eventMessage = 'Row expanded.'" (rowCollapse)="eventMessage = 'Row collapsed.'" [paginator]="scenario().includes('pagination')" [rows]="5" [filterDisplay]="scenario().includes('filtering') ? 'row' : 'none'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">
  <ng-template #jTableExpandedRow let-row><j-card header="Order details"><div class="j-table-demo__detail"><span>{{ row.product }}</span><strong>{{ row.email }}</strong></div></j-card></ng-template>
</j-table>${status}`;

  if (family === 'editing')
    return `<p class="j-table-demo__status">Double-click to edit. Cell mode uses Enter/Escape; row mode uses Save/Cancel or Ctrl+Enter/Escape.</p>
<j-table [value]="rows.slice(0, 6)" [columns]="columns" [editMode]="scenario().includes('row-editing') || scenario().includes('multiple-fields') ? 'row' : 'cell'" [selectionMode]="scenario().includes('selection') ? 'single' : 'none'" (cellEditSave)="onCellEdit($event)" (rowEditSave)="onRowEdit($event)" (editValidationError)="eventMessage = $event.error" ${common} />
${status}`;

  if (family === 'grouping')
    return `<div class="j-table-demo__controls"><j-button label="Expand groups" (onClick)="table.expandAllGroups()" /><j-button label="Collapse groups" variant="outlined" (onClick)="table.collapseAllGroups()" /></div>
<j-table #table [value]="rows" [columns]="scenario().includes('rowspan') ? groupedColumns : columns" [groupRowsBy]="scenario().includes('rowspan') ? '' : 'department'" [collapsibleRowGroups]="!scenario().includes('rowspan')" (rowGroupToggle)="eventMessage = 'Group expansion changed.'" ${common}>
  <ng-template #jTableGroupHeader let-value="value"><strong>{{ value }}</strong></ng-template>
  <ng-template #jTableGroupFooter let-value="value"><span>{{ value }} subtotal</span></ng-template>
</j-table>${status}`;

  if (family === 'columns')
    return `<j-table [value]="rows.slice(0, 6)" [columns]="wideColumns" [columnGroups]="scenario().includes('group') || scenario().includes('header') ? columnGroups : []" [columnResizeMode]="scenario().includes('fit-mode') ? 'fit' : 'expand'" scrollHeight="18rem" [reorderableColumns]="scenario().includes('reordering')" [showGlobalFilter]="false" showColumnManager [showExport]="false" [maximizable]="false" />`;

  if (family === 'reorder')
    return `<p class="j-table-demo__status">Use the drag handle or the labelled Move Up/Down buttons. Alt+Arrow also works from a focused row.</p>
<j-table [value]="rows.slice(0, 7)" [columns]="columns" reorderableRows [rowReorderable]="rowReorderable" [selectionMode]="scenario().includes('selection') ? 'checkbox' : 'none'" [paginator]="scenario().includes('pagination')" [rows]="4" (rowReorder)="onRowReorder($event)" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />${status}`;

  if (family === 'scrolling')
    return `@if (scenario() === 'scrolling-horizontal') {
  <p class="j-table-demo__scroll-note">Horizontal scrolling activates when the combined column width exceeds the available table container. Define a minimum width for the table or individual columns to prevent columns from becoming too narrow.</p>
}
<div [class.j-table-demo__flex-scroll]="scenario().includes('flexible')">
  <j-table
    [value]="scenario() === 'scrolling-horizontal' ? horizontalRows : rows"
    [columns]="scenario() === 'scrolling-horizontal' ? horizontalColumns : wideColumns"
    [scrollable]="true"
    [scrollHeight]="scenario() === 'scrolling-horizontal' ? '' : scenario().includes('flexible') ? 'flex' : '18rem'"
    [tableStyle]="scenario() === 'scrolling-horizontal' || scenario().includes('horizontal-and-vertical') ? { 'min-width': '110rem' } : null"
    [paginator]="scenario().includes('pagination')"
    [rows]="5"
    [frozenRows]="scenario().includes('frozen-rows')"
    [lockedRowKeys]="scenario().includes('frozen-rows') ? ['1'] : []"
    [columnGroups]="scenario().includes('grouped-columns') ? columnGroups : []"
    [showGlobalFilter]="false"
    [showColumnManager]="false"
    [showExport]="false"
    [maximizable]="false"
    scrollLabel="Customer table"
  />
</div>`;

  if (family === 'virtual')
    return `<j-table [value]="virtualRows" [columns]="columns" virtualScroll [virtualItemSize]="44" scrollHeight="22rem" [dataMode]="scenario().includes('lazy') ? 'virtual' : 'client'" [loading]="scenario().includes('loading')" [selectionMode]="scenario().includes('selection') ? 'checkbox' : 'none'" [filterDisplay]="scenario().includes('filtering') ? 'row' : 'none'" [sortField]="scenario().includes('sorting') ? 'total' : ''" [sortOrder]="scenario().includes('sorting') ? -1 : 0" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />`;

  if (family === 'states')
    return `<j-table [value]="scenario().includes('empty') || scenario().includes('error') || scenario().includes('retry') ? [] : rows.slice(0, 5)" [columns]="columns" [loading]="scenario().includes('loading')" [loadingVariant]="scenario().includes('overlay') ? 'overlay' : 'skeleton'" [globalFilter]="scenario().includes('no-filter-results') ? 'no-match' : ''" [errorState]="scenario().includes('error') || scenario().includes('retry') ? true : null" emptyActionLabel="Retry" (emptyAction)="retry()" ${common}>
  <ng-template jTableEmpty><div class="j-table-demo__detail"><img src="/assets/images/empty-state-search.webp" alt="Document with a magnifying glass" width="180" height="120" /><strong>Nothing here yet</strong><span>Create the first order or retry loading.</span></div></ng-template>
</j-table>${status}`;

  if (family === 'export')
    return `<j-table [value]="rows" [columns]="actionColumns" [selectionMode]="scenario().includes('selected') ? 'checkbox' : 'none'" [selection]="selection" (selectionChange)="selection = $event" [exportConfig]="{ rows: scenario().includes('selected') ? 'selected' : scenario().includes('visible') ? 'visible' : scenario().includes('filtered') ? 'filtered' : 'all', filename: 'jrng-orders.csv', visibleColumnsOnly: true }" [loading]="scenario().includes('loading')" (export)="onExport($event)" [paginator]="true" [rows]="5" [showGlobalFilter]="false" [showColumnManager]="false" showExport [maximizable]="false" />${status}`;

  if (family === 'stateful')
    return `<div class="j-table-demo__controls"><j-button label="Clear saved state" (onClick)="table.clearState()" /><j-button label="Restore defaults" variant="outlined" (onClick)="table.resetTableState()" /></div>
<j-table #table [value]="rows" [columns]="columns" [stateKey]="'jrng-' + scenario()" [stateStorage]="scenario().includes('session-storage') ? 'session' : 'local'" [restoreSelection]="scenario().includes('selection')" expandableRows [paginator]="true" [rows]="5" filterDisplay="row" [showGlobalFilter]="true" showColumnManager [showExport]="false" [maximizable]="false" />`;

  if (family === 'actions')
    return `<j-table [value]="rows.slice(0, 6)" [columns]="actionColumns" (action)="onAction($event)" (contextMenu)="eventMessage = 'Row context menu requested.'" (headerContextMenu)="eventMessage = 'Header context menu requested.'" ${common}>
  <ng-template jTableActions="id" let-row><j-button icon="eye" actionDisplay="icon" ariaLabel="View order" title="View order" jTooltip="View order" (onClick)="eventMessage = 'View ' + row['code']" /></ng-template>
</j-table>${status}`;

  if (family === 'advanced')
    return `<j-table [title]="scenario()" description="A complete local business workflow." [value]="rows" [columns]="actionColumns" [paginator]="true" [rows]="5" filterDisplay="row" selectionMode="checkbox" [selection]="selection" (selectionChange)="onSelection($event)" (cellEditSave)="onCellEdit($event)" (rowEditSave)="onRowEdit($event)" (action)="onAction($event)" (export)="onExport($event)" [editMode]="scenario().includes('database-editor') ? 'row' : 'cell'" responsiveMode="scroll" />${status}`;

  return '';
}

function descriptionFor(family, name) {
  return `${name} using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.`;
}

function slug(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

function pascal(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('');
}

function indent(value, spaces) {
  const padding = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => `${padding}${line}`)
    .join('\n');
}

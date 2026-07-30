import { Component, input, Type } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JSelectComponent } from 'jrng-ui/select';
import {
  JActionMenuComponent,
  JTableActionsTemplateDirective,
  JTableCellTemplateDirective,
  JTableComponent,
  JTableEmptyTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableLoadingTemplateDirective,
} from 'jrng-ui/table';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import {
  TABLE_FILTER_EXAMPLE_COMPONENTS,
  TABLE_FILTER_EXAMPLE_DOCS,
} from './table-filter-examples.component';
import { TableScenarioState } from './table-scenario-state';

const TABLE_DEMO_IMPORTS = {
  basic: [
    JTableComponent,
    JTableCellTemplateDirective,
    JTableEmptyTemplateDirective,
    JTableHeaderTemplateDirective,
    JTableLoadingTemplateDirective,
  ],
  pagination: [JButtonComponent, JTableComponent],
  sorting: [JButtonComponent, JTableComponent],
  filtering: [
    JButtonComponent,
    JCheckboxComponent,
    JDatePickerComponent,
    JInputComponent,
    JInputNumberComponent,
    JSelectComponent,
    JTableComponent,
    JTableFilterTemplateDirective,
  ],
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
  actions: [
    JButtonComponent,
    JTableActionsTemplateDirective,
    JTableComponent,
    JTooltipDirective,
  ],
  advanced: [
    JActionMenuComponent,
    JAvatarComponent,
    JBadgeComponent,
    JButtonComponent,
    JTableActionsTemplateDirective,
    JTableCellTemplateDirective,
    JTableComponent,
  ],
};

const TABLE_DEMO_STYLES = `
  :host { display: block; min-width: 0; }
  .j-table-demo__controls { display: flex; flex-wrap: wrap; gap: var(--j-spacing-2); margin-bottom: var(--j-spacing-3); }
  .j-table-demo__status { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-sm); margin: var(--j-spacing-2) 0 0; }
  .j-table-demo__detail { display: grid; gap: var(--j-spacing-2); padding: var(--j-spacing-3); }
  .j-table-demo__scroll-note { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-sm); margin: 0 0 var(--j-spacing-3); }
  .j-table-demo__flex-scroll { display: flex; flex-direction: column; height: min(55vh, 28rem); min-height: 18rem; min-width: 0; }
  .j-table-demo__customer { align-items: center; display: flex; gap: var(--j-spacing-2); min-width: 0; }
  .j-table-demo__customer-copy { display: grid; min-width: 0; }
  .j-table-demo__customer-copy strong { font-weight: var(--j-font-weight-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .j-table-demo__customer-copy small { color: var(--j-color-text-muted); font-size: var(--j-font-size-xs); }
  .j-table-demo__row-actions { align-items: center; display: flex; gap: var(--j-spacing-2); }
  .j-table-demo__caption-actions { align-items: center; display: flex; flex-wrap: wrap; gap: var(--j-spacing-3); justify-content: flex-end; margin-inline-start: auto; width: 100%; }
  .j-table-demo__approval { align-items: center; display: flex; gap: var(--j-spacing-1); }
  :host ::ng-deep .j-table-demo__needs-review td { background: color-mix(in srgb, var(--j-color-warning) 9%, var(--j-table-bg)); }
  :host ::ng-deep .j-table-demo__high-value { color: var(--j-color-success); font-weight: var(--j-font-weight-semibold); }
  @media (max-width: 640px) { .j-table-demo__controls j-button { flex: 1 1 auto; } }
`;

@Component({
  selector: 'app-basic-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.basic,
  template:
    '<j-table [value]="scenario().includes(\'empty-state\') || scenario().includes(\'loading-state\') ? [] : rows.slice(0, 5)" [columns]="scenario().includes(\'responsive\') || scenario().includes(\'dynamic\') ? wideColumns : scenario().includes(\'conditional-cell\') ? conditionalColumns : columns" [density]="scenario().includes(\'small\') || scenario().includes(\'compact\') ? \'compact\' : scenario().includes(\'large\') ? \'spacious\' : \'comfortable\'" [variant]="scenario().includes(\'grid-lines\') ? \'gridlines\' : scenario().includes(\'striped\') ? \'striped\' : \'standard\'" [responsiveMode]="scenario().includes(\'responsive\') ? \'stack\' : \'scroll\'" [rowClass]="scenario().includes(\'conditional-row\') ? rowClass : null" [loading]="scenario().includes(\'loading-state\')" [caption]="scenario()" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableHeader="customer" let-column>{{ column.header }} / account</ng-template>\n  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>\n  <ng-template #jTableFooter><tr><td [attr.colspan]="columns.length"><strong>Recent order total</strong></td></tr></ng-template>\n  <ng-template jTableEmpty let-state><div class="j-table-demo__detail"><strong>No customers available</strong><span>State: {{ state }}</span></div></ng-template>\n  <ng-template jTableLoading let-variant><div class="j-table-demo__detail" role="status">Preparing {{ variant }} rows…</div></ng-template>\n</j-table>',
  styles: [TABLE_DEMO_STYLES],
})
export class BasicTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-pagination-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.pagination,
  template:
    '<div class="j-table-demo__controls"><j-button label="Page 1" (onClick)="table.goToPage(1)" /><j-button label="Page 3" variant="outlined" (onClick)="table.goToPage(3)" /><j-button label="Reset" variant="text" (onClick)="table.resetPagination()" /></div>\n<j-table #table [value]="scenario().includes(\'server-side\') ? serverRows : rows" [columns]="columns" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" [dataMode]="scenario().includes(\'server-side\') ? \'lazy\' : \'client\'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [showGlobalFilter]="scenario().includes(\'filtering\')" [showCurrentPageReport]="true" [showFirstLastPageButtons]="true" [showColumnManager]="false" [showExport]="false" [maximizable]="false" [sortField]="scenario().includes(\'sorting\') ? \'total\' : \'\'" [sortOrder]="scenario().includes(\'sorting\') ? -1 : 0" (pageChange)="onPage($event)" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class PaginationTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-sorting-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.sorting,
  template:
    '<div class="j-table-demo__controls"><j-button label="Sort total descending" (onClick)="table.sortBy(\'total\', -1)" /><j-button label="Clear sort" variant="outlined" (onClick)="table.clearSort()" /></div>\n<j-table #table [value]="rows" [columns]="columns" [sortMode]="scenario().includes(\'multiple\') ? \'multiple\' : \'single\'" [sortField]="scenario().includes(\'default\') || scenario().includes(\'descending\') ? \'total\' : \'\'" [sortOrder]="scenario().includes(\'default\') || scenario().includes(\'descending\') ? -1 : 0" [removableSort]="!scenario().includes(\'ascending-and-descending\')" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [filterDisplay]="scenario().includes(\'filtering\') ? \'row\' : \'none\'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" (sortChange)="onSort($event)" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class SortingTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-filtering-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.filtering,
  template:
    '<div class="j-table-demo__controls"><j-button label="Approved only" (onClick)="table.filter(\'status\', \'Approved\', \'equals\')" /><j-button label="Clear filters" variant="outlined" (onClick)="table.resetFilters()" /></div>\n<j-table #table [value]="scenario().includes(\'server-side\') ? serverRows : rows" [columns]="columns" [filterDisplay]="scenario().includes(\'filter-menu\') ? \'menu\' : \'row\'" [showGlobalFilter]="scenario().includes(\'global-search\')" [dataMode]="scenario().includes(\'server-side\') ? \'lazy\' : \'client\'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableFilter="customer" let-apply="apply"><j-input label="Customer" placeholder="Filter customer" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="total" let-apply="apply"><j-input-number label="Minimum total" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="status" let-apply="apply"><j-select label="Status" [options]="statusOptions" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="date" let-apply="apply"><j-date-picker label="Joined date" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="active" let-apply="apply"><j-checkbox label="Active only" (valueChange)="apply($event)" /></ng-template>\n</j-table>',
  styles: [TABLE_DEMO_STYLES],
})
export class FilteringTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-selection-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.selection,
  template:
    '<div class="j-table-demo__controls"><j-button label="Select first two" (onClick)="table.selectRows(rows.slice(0, 2))" /><j-button label="Clear selection" variant="outlined" (onClick)="table.clearSelection()" /></div>\n<j-table #table [value]="rows.slice(0, 6)" [columns]="columns" [selectionMode]="scenario().includes(\'single\') || scenario().includes(\'row-click\') ? \'single\' : scenario().includes(\'radio\') ? \'radio\' : \'checkbox\'" [selection]="selection" [rowSelectable]="scenario().includes(\'disabled\') || scenario().includes(\'conditional\') ? rowSelectable : null" (selectionChange)="onSelection($event)" (rowSelect)="eventMessage = \'Row selected.\'" (rowUnselect)="eventMessage = \'Row unselected.\'" (selectAllChange)="eventMessage = \'Select-all changed.\'" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class SelectionTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-expansion-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.expansion,
  template:
    '<div class="j-table-demo__controls"><j-button label="Expand all" (onClick)="table.expandAllRows()" /><j-button label="Collapse all" variant="outlined" (onClick)="table.collapseAllRows()" /></div>\n<j-table #table [value]="rows" [columns]="columns" expandableRows rowKey="id" [expandedRowKeys]="expandedKeys" (expandedRowKeysChange)="expandedKeys = $event" (rowExpand)="eventMessage = \'Row expanded.\'" (rowCollapse)="eventMessage = \'Row collapsed.\'" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [filterDisplay]="scenario().includes(\'filtering\') ? \'row\' : \'none\'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template #jTableExpandedRow let-row><j-card header="Customer details"><div class="j-table-demo__detail"><span>{{ row.product }}</span><strong>{{ row.email }}</strong></div></j-card></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class ExpansionTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-editing-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.editing,
  template:
    '<p class="j-table-demo__status">Double-click to edit. Cell mode uses Enter/Escape; row mode uses Save/Cancel or Ctrl+Enter/Escape.</p>\n<j-table [value]="rows.slice(0, 6)" [columns]="columns" [editMode]="scenario().includes(\'row-editing\') || scenario().includes(\'multiple-fields\') ? \'row\' : \'cell\'" [selectionMode]="scenario().includes(\'selection\') ? \'single\' : \'none\'" (cellEditSave)="onCellEdit($event)" (rowEditSave)="onRowEdit($event)" (editValidationError)="eventMessage = $event.error" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class EditingTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-grouping-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.grouping,
  template:
    '<div class="j-table-demo__controls"><j-button label="Expand groups" (onClick)="table.expandAllGroups()" /><j-button label="Collapse groups" variant="outlined" (onClick)="table.collapseAllGroups()" /></div>\n<j-table #table [value]="rows" [columns]="scenario().includes(\'rowspan\') ? groupedColumns : columns" [groupRowsBy]="scenario().includes(\'rowspan\') ? \'\' : \'department\'" [collapsibleRowGroups]="!scenario().includes(\'rowspan\')" (rowGroupToggle)="eventMessage = \'Group expansion changed.\'" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template #jTableGroupHeader let-value="value"><strong>{{ value }}</strong></ng-template>\n  <ng-template #jTableGroupFooter let-value="value"><span>{{ value }} subtotal</span></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class GroupingTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-columns-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.columns,
  template:
    '<j-table [value]="rows.slice(0, 6)" [columns]="wideColumns" [columnGroups]="scenario().includes(\'group\') || scenario().includes(\'header\') ? columnGroups : []" [resizableColumns]="scenario().includes(\'resizing\')" [columnResizeMode]="scenario().includes(\'fit-mode\') ? \'fit\' : \'expand\'" scrollHeight="18rem" [reorderableColumns]="scenario().includes(\'reordering\')" [showGlobalFilter]="false" showColumnManager [showExport]="false" [maximizable]="false" />',
  styles: [TABLE_DEMO_STYLES],
})
export class ColumnsTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-reorder-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.reorder,
  template:
    '<p class="j-table-demo__status">Use the drag handle or the labelled Move Up/Down buttons. Alt+Arrow also works from a focused row.</p>\n<j-table [value]="rows.slice(0, 7)" [columns]="columns" reorderableRows [rowReorderable]="rowReorderable" [selectionMode]="scenario().includes(\'selection\') ? \'checkbox\' : \'none\'" [paginator]="scenario().includes(\'pagination\')" [rows]="4" (rowReorder)="onRowReorder($event)" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" /><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class ReorderTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-scrolling-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.scrolling,
  template:
    "@if (scenario() === 'scrolling-horizontal') {\n  <p class=\"j-table-demo__scroll-note\">Horizontal scrolling activates when the combined column width exceeds the available table container. Define a minimum width for the table or individual columns to prevent columns from becoming too narrow.</p>\n}\n<div [class.j-table-demo__flex-scroll]=\"scenario().includes('flexible')\">\n  <j-table\n    [value]=\"scenario() === 'scrolling-horizontal' ? horizontalRows : rows\"\n    [columns]=\"scenario() === 'scrolling-horizontal' ? horizontalColumns : wideColumns\"\n    [scrollable]=\"true\"\n    [scrollHeight]=\"scenario() === 'scrolling-horizontal' ? '' : scenario().includes('flexible') ? 'flex' : '18rem'\"\n    [tableStyle]=\"scenario() === 'scrolling-horizontal' || scenario().includes('horizontal-and-vertical') ? { 'min-width': '110rem' } : null\"\n    [paginator]=\"scenario().includes('pagination')\"\n    [rows]=\"5\"\n    [frozenRows]=\"scenario().includes('frozen-rows')\"\n    [lockedRowKeys]=\"scenario().includes('frozen-rows') ? ['1'] : []\"\n    [columnGroups]=\"scenario().includes('grouped-columns') ? columnGroups : []\"\n    [showGlobalFilter]=\"false\"\n    [showColumnManager]=\"false\"\n    [showExport]=\"false\"\n    [maximizable]=\"false\"\n    scrollLabel=\"Customer table\"\n  />\n</div>",
  styles: [TABLE_DEMO_STYLES],
})
export class ScrollingTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-virtual-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.virtual,
  template:
    "<j-table [value]=\"scenario().includes('placeholders') ? virtualRows.slice(0, 4) : scenario().includes('lazy') ? virtualRows.slice(0, 25) : virtualRows\" [columns]=\"columns\" virtualScroll [virtualItemSize]=\"44\" scrollHeight=\"22rem\" [dataMode]=\"scenario().includes('lazy') || scenario().includes('placeholders') ? 'virtual' : 'client'\" [totalRecords]=\"virtualRows.length\" [selectionMode]=\"scenario().includes('selection') ? 'checkbox' : 'none'\" [filterDisplay]=\"scenario().includes('filtering') ? 'row' : 'none'\" [sortField]=\"scenario().includes('sorting') ? 'total' : ''\" [sortOrder]=\"scenario().includes('sorting') ? -1 : 0\" [paginator]=\"false\" [showGlobalFilter]=\"false\" [showColumnManager]=\"false\" [showExport]=\"false\" [maximizable]=\"false\" />",
  styles: [TABLE_DEMO_STYLES],
})
export class VirtualTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-states-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.states,
  template:
    '<j-table [value]="scenario().includes(\'empty\') || scenario().includes(\'error\') || scenario().includes(\'retry\') ? [] : rows.slice(0, 5)" [columns]="columns" [loading]="scenario().includes(\'loading\')" [loadingVariant]="scenario().includes(\'overlay\') ? \'overlay\' : \'skeleton\'" [globalFilter]="scenario().includes(\'no-filter-results\') ? \'no-match\' : \'\'" [errorState]="scenario().includes(\'error\') || scenario().includes(\'retry\') ? true : null" emptyActionLabel="Retry" (emptyAction)="retry()" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableEmpty><div class="j-table-demo__detail"><img src="/assets/images/empty-state-search.webp" alt="Document with a magnifying glass" width="180" height="120" /><strong>Nothing here yet</strong><span>Create the first order or retry loading.</span></div></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class StatesTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-export-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.export,
  template:
    '<j-table [value]="rows" [columns]="actionColumns" [selectionMode]="scenario().includes(\'selected\') ? \'checkbox\' : \'none\'" [selection]="selection" (selectionChange)="selection = $event" [exportConfig]="{ rows: scenario().includes(\'selected\') ? \'selected\' : scenario().includes(\'visible\') ? \'visible\' : scenario().includes(\'filtered\') ? \'filtered\' : \'all\', filename: \'jrng-customers.csv\', visibleColumnsOnly: true }" [loading]="scenario().includes(\'loading\')" (export)="onExport($event)" [paginator]="true" [rows]="5" [showGlobalFilter]="false" [showColumnManager]="false" showExport [maximizable]="false" /><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class ExportTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-stateful-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.stateful,
  template:
    '<div class="j-table-demo__controls"><j-button label="Clear saved state" (onClick)="table.clearState()" /><j-button label="Restore defaults" variant="outlined" (onClick)="table.resetTableState()" /></div>\n<j-table #table [value]="rows" [columns]="columns" [stateKey]="\'jrng-\' + scenario()" [stateStorage]="scenario().includes(\'session-storage\') ? \'session\' : \'local\'" [restoreSelection]="scenario().includes(\'selection\')" expandableRows [paginator]="true" [rows]="5" filterDisplay="row" [showGlobalFilter]="true" showColumnManager [showExport]="false" [maximizable]="false" />',
  styles: [TABLE_DEMO_STYLES],
})
export class StatefulTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-actions-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.actions,
  template:
    '<j-table [value]="rows.slice(0, 6)" [columns]="actionColumns" (action)="onAction($event)" (contextMenu)="eventMessage = \'Row context menu requested.\'" (headerContextMenu)="eventMessage = \'Header context menu requested.\'" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableActions="id" let-row><j-button icon="eye" actionDisplay="icon" ariaLabel="View order" title="View order" jTooltip="View order" (onClick)="eventMessage = \'View \' + row[\'code\']" /></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class ActionsTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}

@Component({
  selector: 'app-advanced-table-scenarios',
  imports: TABLE_DEMO_IMPORTS.advanced,
  template:
    '<j-table\n  [value]="enterpriseRows"\n  [columns]="enterpriseColumns"\n  [config]="enterpriseTableConfig"\n  variant="enterprise"\n  scrollHeight="clamp(18rem, calc(100dvh - var(--j-app-header-height, 4rem) - var(--j-page-header-height, 3rem) - var(--j-app-footer-height, 0rem) - 13.5rem), 34rem)"\n  [tableStyle]="{ \'min-width\': \'92rem\' }"\n  [hover]="true"\n  sortField="id"\n  [sortOrder]="-1"\n  (refresh)="eventMessage = \'Requests refreshed.\'"\n>\n  <ng-template #jTableCaption let-table="table">\n    <span class="j-table-demo__caption-actions">\n      <j-button icon="settings" actionDisplay="icon" size="sm" severity="info" ariaLabel="Table config" title="Table config" (onClick)="table.handleToolbarAction({ key: \'columns\' })" />\n      <j-button [icon]="table.maximized ? \'minimize\' : \'maximize\'" actionDisplay="icon" size="sm" severity="secondary" [ariaLabel]="table.maximized ? \'Minimize table\' : \'Maximize table\'" [title]="table.maximized ? \'Minimize table\' : \'Maximize table\'" [ariaPressed]="table.maximized" (onClick)="table.handleToolbarAction({ key: \'fullscreen\' })" />\n      <j-button icon="filter" actionDisplay="icon" size="sm" severity="info" ariaLabel="Toggle filters" title="Toggle filters" (onClick)="table.handleToolbarAction({ key: \'filters\' })" />\n      @if (table.activeFilterItems.length) {\n        <j-button icon="close" actionDisplay="icon" size="sm" severity="danger" ariaLabel="Clear filters" title="Clear filters" (onClick)="table.resetFilters()" />\n      }\n      <j-button icon="refresh" actionDisplay="icon" size="sm" severity="info" ariaLabel="Refresh table" title="Refresh table" (onClick)="eventMessage = \'Requests refreshed.\'" />\n      <j-button icon="download" actionDisplay="icon" size="sm" severity="success" ariaLabel="Export table" title="Export table" (onClick)="table.exportCSV()" />\n    </span>\n  </ng-template>\n  <ng-template jTableCell="requesterName" let-row>\n    <span class="j-table-demo__customer">\n      <j-avatar [initials]="initials($any(row)[\'requesterName\'])" [ariaLabel]="$any(row)[\'requesterName\']" size="sm" />\n      <span class="j-table-demo__customer-copy">\n        <strong>{{ $any(row)[\'requesterName\'] }}</strong>\n        <small>{{ $any(row)[\'requesterCode\'] }}</small>\n      </span>\n    </span>\n  </ng-template>\n  <ng-template jTableCell="units" let-value="formattedValue"><j-badge [value]="value" variant="soft" size="md" /></ng-template>\n  <ng-template jTableCell="reviewers" let-row>\n    <span class="j-table-demo__approval">\n      @for (reviewer of $any(row)[\'reviewers\'].split(\', \'); track reviewer) {\n        <j-avatar [initials]="initials(reviewer)" [ariaLabel]="reviewer" size="sm" />\n      }\n    </span>\n  </ng-template>\n  <ng-template jTableCell="status" let-value="formattedValue">\n    <j-badge [value]="value" [severity]="statusSeverity(value)" variant="soft" size="md" />\n  </ng-template>\n  <ng-template jTableActions="actions" let-row>\n    <span class="j-table-demo__row-actions">\n      @if ($any(row)[\'status\'] !== \'Approved\') {\n        <j-button icon="check" actionDisplay="icon" size="sm" variant="text" severity="success" [ariaLabel]="\'Complete \' + $any(row)[\'requesterName\']" title="Complete request" (onClick)="eventMessage = \'Complete \' + $any(row)[\'requesterName\']" />\n      }\n      <j-action-menu popup [actions]="requestMenuActions($any(row))" [row]="$any(row)" ariaLabel="Request actions" triggerLabel="Open request actions" (action)="onAction($event)" />\n    </span>\n  </ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
  styles: [TABLE_DEMO_STYLES],
})
export class AdvancedTableScenariosComponent extends TableScenarioState {
  readonly scenario = input.required<string>();
}
export const TABLE_SCENARIO_COMPONENTS: Readonly<
  Record<string, Type<unknown>>
> = {
  ...TABLE_FILTER_EXAMPLE_COMPONENTS,
  'basic-basic-table': BasicTableScenariosComponent,
  'basic-dynamic-columns': BasicTableScenariosComponent,
  'basic-custom-header-template': BasicTableScenariosComponent,
  'basic-custom-body-template': BasicTableScenariosComponent,
  'basic-custom-footer-template': BasicTableScenariosComponent,
  'basic-small-size': BasicTableScenariosComponent,
  'basic-default-size': BasicTableScenariosComponent,
  'basic-large-size': BasicTableScenariosComponent,
  'basic-compact-density': BasicTableScenariosComponent,
  'basic-grid-lines': BasicTableScenariosComponent,
  'basic-striped-rows': BasicTableScenariosComponent,
  'basic-hoverable-rows': BasicTableScenariosComponent,
  'basic-responsive-table': BasicTableScenariosComponent,
  'basic-conditional-row-styling': BasicTableScenariosComponent,
  'basic-conditional-cell-styling': BasicTableScenariosComponent,
  'basic-custom-empty-state': BasicTableScenariosComponent,
  'basic-custom-loading-state': BasicTableScenariosComponent,
  'pagination-basic-pagination': PaginationTableScenariosComponent,
  'pagination-configurable-rows-per-page': PaginationTableScenariosComponent,
  'pagination-rows-per-page-dropdown': PaginationTableScenariosComponent,
  'pagination-current-page-report': PaginationTableScenariosComponent,
  'pagination-first-and-last-page-buttons': PaginationTableScenariosComponent,
  'pagination-programmatic-pagination': PaginationTableScenariosComponent,
  'pagination-reset-pagination': PaginationTableScenariosComponent,
  'pagination-pagination-events': PaginationTableScenariosComponent,
  'pagination-client-side-pagination': PaginationTableScenariosComponent,
  'pagination-server-side-pagination': PaginationTableScenariosComponent,
  'pagination-pagination-with-sorting': PaginationTableScenariosComponent,
  'pagination-pagination-with-filtering': PaginationTableScenariosComponent,
  'sorting-single-column-sorting': SortingTableScenariosComponent,
  'sorting-multiple-column-sorting': SortingTableScenariosComponent,
  'sorting-default-sorting': SortingTableScenariosComponent,
  'sorting-ascending-and-descending-sorting': SortingTableScenariosComponent,
  'sorting-removable-sorting': SortingTableScenariosComponent,
  'sorting-custom-sort-function': SortingTableScenariosComponent,
  'sorting-sorting-text-values': SortingTableScenariosComponent,
  'sorting-sorting-numeric-values': SortingTableScenariosComponent,
  'sorting-sorting-date-values': SortingTableScenariosComponent,
  'sorting-sorting-boolean-values': SortingTableScenariosComponent,
  'sorting-programmatic-sorting': SortingTableScenariosComponent,
  'sorting-sort-events': SortingTableScenariosComponent,
  'sorting-sorting-with-pagination': SortingTableScenariosComponent,
  'sorting-sorting-with-filtering': SortingTableScenariosComponent,
  'filtering-global-search': FilteringTableScenariosComponent,
  'filtering-basic-column-filtering': FilteringTableScenariosComponent,
  'filtering-text-filter': FilteringTableScenariosComponent,
  'filtering-number-filter': FilteringTableScenariosComponent,
  'filtering-date-filter': FilteringTableScenariosComponent,
  'filtering-boolean-filter': FilteringTableScenariosComponent,
  'filtering-select-filter': FilteringTableScenariosComponent,
  'filtering-multiselect-filter': FilteringTableScenariosComponent,
  'filtering-range-filter': FilteringTableScenariosComponent,
  'filtering-custom-filter-template': FilteringTableScenariosComponent,
  'filtering-filter-match-modes': FilteringTableScenariosComponent,
  'filtering-multiple-filter-constraints': FilteringTableScenariosComponent,
  'filtering-and-or-operators': FilteringTableScenariosComponent,
  'filtering-filter-menu': FilteringTableScenariosComponent,
  'filtering-inline-filter-row': FilteringTableScenariosComponent,
  'filtering-apply-filter': FilteringTableScenariosComponent,
  'filtering-clear-individual-filter': FilteringTableScenariosComponent,
  'filtering-clear-all-filters': FilteringTableScenariosComponent,
  'filtering-programmatic-filtering': FilteringTableScenariosComponent,
  'filtering-client-side-filtering': FilteringTableScenariosComponent,
  'filtering-server-side-filtering': FilteringTableScenariosComponent,
  'filtering-filtering-with-sorting-and-pagination':
    FilteringTableScenariosComponent,
  'selection-single-row-selection': SelectionTableScenariosComponent,
  'selection-multiple-row-selection': SelectionTableScenariosComponent,
  'selection-checkbox-selection': SelectionTableScenariosComponent,
  'selection-radio-button-selection': SelectionTableScenariosComponent,
  'selection-select-all-checkbox': SelectionTableScenariosComponent,
  'selection-indeterminate-header-checkbox': SelectionTableScenariosComponent,
  'selection-disabled-row-selection': SelectionTableScenariosComponent,
  'selection-conditional-row-selection': SelectionTableScenariosComponent,
  'selection-row-click-selection': SelectionTableScenariosComponent,
  'selection-selection-using-a-dedicated-column':
    SelectionTableScenariosComponent,
  'selection-programmatic-selection': SelectionTableScenariosComponent,
  'selection-clear-selection': SelectionTableScenariosComponent,
  'selection-row-select-event': SelectionTableScenariosComponent,
  'selection-row-unselect-event': SelectionTableScenariosComponent,
  'selection-select-all-event': SelectionTableScenariosComponent,
  'selection-keyboard-accessible-selection': SelectionTableScenariosComponent,
  'expansion-basic-row-expansion': ExpansionTableScenariosComponent,
  'expansion-single-expanded-row': ExpansionTableScenariosComponent,
  'expansion-multiple-expanded-rows': ExpansionTableScenariosComponent,
  'expansion-expand-all': ExpansionTableScenariosComponent,
  'expansion-collapse-all': ExpansionTableScenariosComponent,
  'expansion-programmatic-expansion': ExpansionTableScenariosComponent,
  'expansion-custom-expanded-row-template': ExpansionTableScenariosComponent,
  'expansion-nested-detail-section': ExpansionTableScenariosComponent,
  'expansion-expanded-content-containing-other-jrng-components':
    ExpansionTableScenariosComponent,
  'expansion-expansion-events': ExpansionTableScenariosComponent,
  'expansion-expansion-with-pagination': ExpansionTableScenariosComponent,
  'expansion-expansion-with-filtering': ExpansionTableScenariosComponent,
  'editing-cell-editing': EditingTableScenariosComponent,
  'editing-row-editing': EditingTableScenariosComponent,
  'editing-text-input-editor': EditingTableScenariosComponent,
  'editing-number-input-editor': EditingTableScenariosComponent,
  'editing-select-editor': EditingTableScenariosComponent,
  'editing-date-picker-editor': EditingTableScenariosComponent,
  'editing-checkbox-editor': EditingTableScenariosComponent,
  'editing-save-changes': EditingTableScenariosComponent,
  'editing-cancel-changes': EditingTableScenariosComponent,
  'editing-validation-during-editing': EditingTableScenariosComponent,
  'editing-invalid-edit-state': EditingTableScenariosComponent,
  'editing-read-only-cells': EditingTableScenariosComponent,
  'editing-conditionally-editable-cells': EditingTableScenariosComponent,
  'editing-programmatic-editing': EditingTableScenariosComponent,
  'editing-edit-events': EditingTableScenariosComponent,
  'editing-cell-editing-with-selection': EditingTableScenariosComponent,
  'editing-row-editing-with-multiple-fields': EditingTableScenariosComponent,
  'grouping-group-by-field': GroupingTableScenariosComponent,
  'grouping-subheader-grouping': GroupingTableScenariosComponent,
  'grouping-rowspan-grouping': GroupingTableScenariosComponent,
  'grouping-expandable-row-groups': GroupingTableScenariosComponent,
  'grouping-group-totals': GroupingTableScenariosComponent,
  'grouping-group-footer': GroupingTableScenariosComponent,
  'grouping-custom-group-header': GroupingTableScenariosComponent,
  'grouping-custom-group-footer': GroupingTableScenariosComponent,
  'grouping-programmatic-group-expansion': GroupingTableScenariosComponent,
  'grouping-group-expansion-events': GroupingTableScenariosComponent,
  'columns-column-resizing-in-fit-mode': ColumnsTableScenariosComponent,
  'columns-column-resizing-in-expand-mode': ColumnsTableScenariosComponent,
  'columns-resizing-in-scrollable-tables': ColumnsTableScenariosComponent,
  'columns-column-reordering': ColumnsTableScenariosComponent,
  'columns-column-visibility-toggle': ColumnsTableScenariosComponent,
  'columns-column-chooser': ColumnsTableScenariosComponent,
  'columns-programmatic-column-visibility': ColumnsTableScenariosComponent,
  'columns-fixed-columns': ColumnsTableScenariosComponent,
  'columns-frozen-column': ColumnsTableScenariosComponent,
  'columns-multiple-frozen-columns': ColumnsTableScenariosComponent,
  'columns-frozen-columns-on-the-left': ColumnsTableScenariosComponent,
  'columns-frozen-columns-on-the-right': ColumnsTableScenariosComponent,
  'columns-column-groups': ColumnsTableScenariosComponent,
  'columns-multi-row-headers': ColumnsTableScenariosComponent,
  'columns-header-colspan': ColumnsTableScenariosComponent,
  'columns-header-rowspan': ColumnsTableScenariosComponent,
  'columns-grouped-columns-with-sorting': ColumnsTableScenariosComponent,
  'columns-grouped-columns-with-filtering': ColumnsTableScenariosComponent,
  'columns-grouped-columns-with-resizing': ColumnsTableScenariosComponent,
  'reorder-drag-and-drop-row-reordering': ReorderTableScenariosComponent,
  'reorder-reordering-using-a-drag-handle': ReorderTableScenariosComponent,
  'reorder-disabled-reordering-for-specific-rows':
    ReorderTableScenariosComponent,
  'reorder-reorder-events': ReorderTableScenariosComponent,
  'reorder-programmatic-row-updates': ReorderTableScenariosComponent,
  'reorder-reordering-with-selection': ReorderTableScenariosComponent,
  'reorder-reordering-with-pagination': ReorderTableScenariosComponent,
  'reorder-keyboard-accessible-alternative': ReorderTableScenariosComponent,
  'scrolling-vertical': ScrollingTableScenariosComponent,
  'scrolling-horizontal': ScrollingTableScenariosComponent,
  'scrolling-horizontal-and-vertical': ScrollingTableScenariosComponent,
  'scrolling-fixed-height': ScrollingTableScenariosComponent,
  'scrolling-flexible': ScrollingTableScenariosComponent,
  'scrolling-responsive-scrolling': ScrollingTableScenariosComponent,
  'scrolling-sticky-header': ScrollingTableScenariosComponent,
  'scrolling-frozen-rows': ScrollingTableScenariosComponent,
  'scrolling-frozen-columns': ScrollingTableScenariosComponent,
  'scrolling-multiple-frozen-columns': ScrollingTableScenariosComponent,
  'scrolling-scrolling-with-pagination': ScrollingTableScenariosComponent,
  'scrolling-scrolling-with-column-resizing': ScrollingTableScenariosComponent,
  'scrolling-scrolling-with-grouped-columns': ScrollingTableScenariosComponent,
  'virtual-basic-virtual-scrolling': VirtualTableScenariosComponent,
  'virtual-virtual-scrolling-with-preloaded-data':
    VirtualTableScenariosComponent,
  'virtual-lazy-virtual-scrolling': VirtualTableScenariosComponent,
  'virtual-virtual-scrolling-with-loading-placeholders':
    VirtualTableScenariosComponent,
  'virtual-virtual-scrolling-with-filtering': VirtualTableScenariosComponent,
  'virtual-virtual-scrolling-with-sorting': VirtualTableScenariosComponent,
  'virtual-virtual-scrolling-with-row-selection':
    VirtualTableScenariosComponent,
  'virtual-large-dataset-example': VirtualTableScenariosComponent,
  'states-loading-overlay': StatesTableScenariosComponent,
  'states-loading-skeleton-rows': StatesTableScenariosComponent,
  'states-initial-loading': StatesTableScenariosComponent,
  'states-pagination-loading': StatesTableScenariosComponent,
  'states-filtering-loading': StatesTableScenariosComponent,
  'states-lazy-load-loading': StatesTableScenariosComponent,
  'states-empty-dataset': StatesTableScenariosComponent,
  'states-no-filter-results': StatesTableScenariosComponent,
  'states-custom-empty-template': StatesTableScenariosComponent,
  'states-error-state': StatesTableScenariosComponent,
  'states-retry-action': StatesTableScenariosComponent,
  'export-export-all-rows-to-csv': ExportTableScenariosComponent,
  'export-export-visible-rows': ExportTableScenariosComponent,
  'export-export-selected-rows': ExportTableScenariosComponent,
  'export-export-filtered-rows': ExportTableScenariosComponent,
  'export-export-custom-columns': ExportTableScenariosComponent,
  'export-custom-csv-filename': ExportTableScenariosComponent,
  'export-custom-export-formatting': ExportTableScenariosComponent,
  'export-export-event': ExportTableScenariosComponent,
  'export-disabled-export-while-loading': ExportTableScenariosComponent,
  'stateful-persist-pagination': StatefulTableScenariosComponent,
  'stateful-persist-sorting': StatefulTableScenariosComponent,
  'stateful-persist-filters': StatefulTableScenariosComponent,
  'stateful-persist-column-order': StatefulTableScenariosComponent,
  'stateful-persist-column-width': StatefulTableScenariosComponent,
  'stateful-persist-column-visibility': StatefulTableScenariosComponent,
  'stateful-persist-row-selection': StatefulTableScenariosComponent,
  'stateful-persist-expanded-rows': StatefulTableScenariosComponent,
  'stateful-session-storage-example': StatefulTableScenariosComponent,
  'stateful-local-storage-example': StatefulTableScenariosComponent,
  'stateful-clear-saved-state': StatefulTableScenariosComponent,
  'stateful-restore-default-state': StatefulTableScenariosComponent,
  'actions-row-context-menu': ActionsTableScenariosComponent,
  'actions-header-context-menu': ActionsTableScenariosComponent,
  'actions-row-action-buttons': ActionsTableScenariosComponent,
  'actions-icon-only-actions': ActionsTableScenariosComponent,
  'actions-edit-action': ActionsTableScenariosComponent,
  'actions-delete-action': ActionsTableScenariosComponent,
  'actions-view-details-action': ActionsTableScenariosComponent,
  'actions-conditional-actions': ActionsTableScenariosComponent,
  'actions-disabled-actions': ActionsTableScenariosComponent,
  'actions-action-overflow-menu': ActionsTableScenariosComponent,
  'actions-keyboard-accessible-menu': ActionsTableScenariosComponent,
  'advanced-customer-management-table': AdvancedTableScenariosComponent,
  'advanced-employee-directory': AdvancedTableScenariosComponent,
  'advanced-product-inventory': AdvancedTableScenariosComponent,
  'advanced-customer-renewals': AdvancedTableScenariosComponent,
  'advanced-transaction-history': AdvancedTableScenariosComponent,
  'advanced-database-editor': AdvancedTableScenariosComponent,
  'advanced-admin-user-management': AdvancedTableScenariosComponent,
};

const TABLE_SCENARIO_SOURCES = {
  basic: {
    html: '<j-table [value]="scenario().includes(\'empty-state\') || scenario().includes(\'loading-state\') ? [] : rows.slice(0, 5)" [columns]="scenario().includes(\'responsive\') || scenario().includes(\'dynamic\') ? wideColumns : scenario().includes(\'conditional-cell\') ? conditionalColumns : columns" [density]="scenario().includes(\'small\') || scenario().includes(\'compact\') ? \'compact\' : scenario().includes(\'large\') ? \'spacious\' : \'comfortable\'" [variant]="scenario().includes(\'grid-lines\') ? \'gridlines\' : scenario().includes(\'striped\') ? \'striped\' : \'standard\'" [responsiveMode]="scenario().includes(\'responsive\') ? \'stack\' : \'scroll\'" [rowClass]="scenario().includes(\'conditional-row\') ? rowClass : null" [loading]="scenario().includes(\'loading-state\')" [caption]="scenario()" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableHeader="customer" let-column>{{ column.header }} / account</ng-template>\n  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>\n  <ng-template #jTableFooter><tr><td [attr.colspan]="columns.length"><strong>Recent order total</strong></td></tr></ng-template>\n  <ng-template jTableEmpty let-state><div class="j-table-demo__detail"><strong>No customers available</strong><span>State: {{ state }}</span></div></ng-template>\n  <ng-template jTableLoading let-variant><div class="j-table-demo__detail" role="status">Preparing {{ variant }} rows…</div></ng-template>\n</j-table>',
    ts: "@Component({\n  selector: 'app-basic-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.basic,\n  templateUrl: './basic-table-scenarios.component.html',\n})\nexport class BasicTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  pagination: {
    html: '<div class="j-table-demo__controls"><j-button label="Page 1" (onClick)="table.goToPage(1)" /><j-button label="Page 3" variant="outlined" (onClick)="table.goToPage(3)" /><j-button label="Reset" variant="text" (onClick)="table.resetPagination()" /></div>\n<j-table #table [value]="scenario().includes(\'server-side\') ? serverRows : rows" [columns]="columns" [rows]="3" [rowsPerPageOptions]="[3, 5, 10]" [dataMode]="scenario().includes(\'server-side\') ? \'lazy\' : \'client\'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [showGlobalFilter]="scenario().includes(\'filtering\')" [showCurrentPageReport]="true" [showFirstLastPageButtons]="true" [showColumnManager]="false" [showExport]="false" [maximizable]="false" [sortField]="scenario().includes(\'sorting\') ? \'total\' : \'\'" [sortOrder]="scenario().includes(\'sorting\') ? -1 : 0" (pageChange)="onPage($event)" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-pagination-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.pagination,\n  templateUrl: './pagination-table-scenarios.component.html',\n})\nexport class PaginationTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  sorting: {
    html: '<div class="j-table-demo__controls"><j-button label="Sort total descending" (onClick)="table.sortBy(\'total\', -1)" /><j-button label="Clear sort" variant="outlined" (onClick)="table.clearSort()" /></div>\n<j-table #table [value]="rows" [columns]="columns" [sortMode]="scenario().includes(\'multiple\') ? \'multiple\' : \'single\'" [sortField]="scenario().includes(\'default\') || scenario().includes(\'descending\') ? \'total\' : \'\'" [sortOrder]="scenario().includes(\'default\') || scenario().includes(\'descending\') ? -1 : 0" [removableSort]="!scenario().includes(\'ascending-and-descending\')" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [filterDisplay]="scenario().includes(\'filtering\') ? \'row\' : \'none\'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" (sortChange)="onSort($event)" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-sorting-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.sorting,\n  templateUrl: './sorting-table-scenarios.component.html',\n})\nexport class SortingTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  filtering: {
    html: '<div class="j-table-demo__controls"><j-button label="Approved only" (onClick)="table.filter(\'status\', \'Approved\', \'equals\')" /><j-button label="Clear filters" variant="outlined" (onClick)="table.resetFilters()" /></div>\n<j-table #table [value]="scenario().includes(\'server-side\') ? serverRows : rows" [columns]="columns" [filterDisplay]="scenario().includes(\'filter-menu\') ? \'menu\' : \'row\'" [showGlobalFilter]="scenario().includes(\'global-search\')" [dataMode]="scenario().includes(\'server-side\') ? \'lazy\' : \'client\'" [totalRecords]="rows.length" (lazyLoad)="onLazyLoad($event)" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableFilter="customer" let-apply="apply"><j-input label="Customer" placeholder="Filter customer" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="total" let-apply="apply"><j-input-number label="Minimum total" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="status" let-apply="apply"><j-select label="Status" [options]="statusOptions" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="date" let-apply="apply"><j-date-picker label="Joined date" (valueChange)="apply($event)" /></ng-template>\n  <ng-template jTableFilter="active" let-apply="apply"><j-checkbox label="Active only" (valueChange)="apply($event)" /></ng-template>\n</j-table>',
    ts: "@Component({\n  selector: 'app-filtering-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.filtering,\n  templateUrl: './filtering-table-scenarios.component.html',\n})\nexport class FilteringTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  selection: {
    html: '<div class="j-table-demo__controls"><j-button label="Select first two" (onClick)="table.selectRows(rows.slice(0, 2))" /><j-button label="Clear selection" variant="outlined" (onClick)="table.clearSelection()" /></div>\n<j-table #table [value]="rows.slice(0, 6)" [columns]="columns" [selectionMode]="scenario().includes(\'single\') || scenario().includes(\'row-click\') ? \'single\' : scenario().includes(\'radio\') ? \'radio\' : \'checkbox\'" [selection]="selection" [rowSelectable]="scenario().includes(\'disabled\') || scenario().includes(\'conditional\') ? rowSelectable : null" (selectionChange)="onSelection($event)" (rowSelect)="eventMessage = \'Row selected.\'" (rowUnselect)="eventMessage = \'Row unselected.\'" (selectAllChange)="eventMessage = \'Select-all changed.\'" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-selection-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.selection,\n  templateUrl: './selection-table-scenarios.component.html',\n})\nexport class SelectionTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  expansion: {
    html: '<div class="j-table-demo__controls"><j-button label="Expand all" (onClick)="table.expandAllRows()" /><j-button label="Collapse all" variant="outlined" (onClick)="table.collapseAllRows()" /></div>\n<j-table #table [value]="rows" [columns]="columns" expandableRows rowKey="id" [expandedRowKeys]="expandedKeys" (expandedRowKeysChange)="expandedKeys = $event" (rowExpand)="eventMessage = \'Row expanded.\'" (rowCollapse)="eventMessage = \'Row collapsed.\'" [paginator]="scenario().includes(\'pagination\')" [rows]="5" [filterDisplay]="scenario().includes(\'filtering\') ? \'row\' : \'none\'" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template #jTableExpandedRow let-row><j-card header="Customer details"><div class="j-table-demo__detail"><span>{{ row.product }}</span><strong>{{ row.email }}</strong></div></j-card></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-expansion-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.expansion,\n  templateUrl: './expansion-table-scenarios.component.html',\n})\nexport class ExpansionTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  editing: {
    html: '<p class="j-table-demo__status">Double-click to edit. Cell mode uses Enter/Escape; row mode uses Save/Cancel or Ctrl+Enter/Escape.</p>\n<j-table [value]="rows.slice(0, 6)" [columns]="columns" [editMode]="scenario().includes(\'row-editing\') || scenario().includes(\'multiple-fields\') ? \'row\' : \'cell\'" [selectionMode]="scenario().includes(\'selection\') ? \'single\' : \'none\'" (cellEditSave)="onCellEdit($event)" (rowEditSave)="onRowEdit($event)" (editValidationError)="eventMessage = $event.error" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" />\n<p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-editing-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.editing,\n  templateUrl: './editing-table-scenarios.component.html',\n})\nexport class EditingTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  grouping: {
    html: '<div class="j-table-demo__controls"><j-button label="Expand groups" (onClick)="table.expandAllGroups()" /><j-button label="Collapse groups" variant="outlined" (onClick)="table.collapseAllGroups()" /></div>\n<j-table #table [value]="rows" [columns]="scenario().includes(\'rowspan\') ? groupedColumns : columns" [groupRowsBy]="scenario().includes(\'rowspan\') ? \'\' : \'department\'" [collapsibleRowGroups]="!scenario().includes(\'rowspan\')" (rowGroupToggle)="eventMessage = \'Group expansion changed.\'" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template #jTableGroupHeader let-value="value"><strong>{{ value }}</strong></ng-template>\n  <ng-template #jTableGroupFooter let-value="value"><span>{{ value }} subtotal</span></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-grouping-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.grouping,\n  templateUrl: './grouping-table-scenarios.component.html',\n})\nexport class GroupingTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  columns: {
    html: '<j-table [value]="rows.slice(0, 6)" [columns]="wideColumns" [columnGroups]="scenario().includes(\'group\') || scenario().includes(\'header\') ? columnGroups : []" [resizableColumns]="scenario().includes(\'resizing\')" [columnResizeMode]="scenario().includes(\'fit-mode\') ? \'fit\' : \'expand\'" scrollHeight="18rem" [reorderableColumns]="scenario().includes(\'reordering\')" [showGlobalFilter]="false" showColumnManager [showExport]="false" [maximizable]="false" />',
    ts: "@Component({\n  selector: 'app-columns-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.columns,\n  templateUrl: './columns-table-scenarios.component.html',\n})\nexport class ColumnsTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  reorder: {
    html: '<p class="j-table-demo__status">Use the drag handle or the labelled Move Up/Down buttons. Alt+Arrow also works from a focused row.</p>\n<j-table [value]="rows.slice(0, 7)" [columns]="columns" reorderableRows [rowReorderable]="rowReorderable" [selectionMode]="scenario().includes(\'selection\') ? \'checkbox\' : \'none\'" [paginator]="scenario().includes(\'pagination\')" [rows]="4" (rowReorder)="onRowReorder($event)" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false" /><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-reorder-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.reorder,\n  templateUrl: './reorder-table-scenarios.component.html',\n})\nexport class ReorderTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  scrolling: {
    html: "@if (scenario() === 'scrolling-horizontal') {\n  <p class=\"j-table-demo__scroll-note\">Horizontal scrolling activates when the combined column width exceeds the available table container. Define a minimum width for the table or individual columns to prevent columns from becoming too narrow.</p>\n}\n<div [class.j-table-demo__flex-scroll]=\"scenario().includes('flexible')\">\n  <j-table\n    [value]=\"scenario() === 'scrolling-horizontal' ? horizontalRows : rows\"\n    [columns]=\"scenario() === 'scrolling-horizontal' ? horizontalColumns : wideColumns\"\n    [scrollable]=\"true\"\n    [scrollHeight]=\"scenario() === 'scrolling-horizontal' ? '' : scenario().includes('flexible') ? 'flex' : '18rem'\"\n    [tableStyle]=\"scenario() === 'scrolling-horizontal' || scenario().includes('horizontal-and-vertical') ? { 'min-width': '110rem' } : null\"\n    [paginator]=\"scenario().includes('pagination')\"\n    [rows]=\"5\"\n    [frozenRows]=\"scenario().includes('frozen-rows')\"\n    [lockedRowKeys]=\"scenario().includes('frozen-rows') ? ['1'] : []\"\n    [columnGroups]=\"scenario().includes('grouped-columns') ? columnGroups : []\"\n    [showGlobalFilter]=\"false\"\n    [showColumnManager]=\"false\"\n    [showExport]=\"false\"\n    [maximizable]=\"false\"\n    scrollLabel=\"Customer table\"\n  />\n</div>",
    ts: "@Component({\n  selector: 'app-scrolling-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.scrolling,\n  templateUrl: './scrolling-table-scenarios.component.html',\n})\nexport class ScrollingTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  virtual: {
    html: "<j-table [value]=\"scenario().includes('placeholders') ? virtualRows.slice(0, 4) : scenario().includes('lazy') ? virtualRows.slice(0, 25) : virtualRows\" [columns]=\"columns\" virtualScroll [virtualItemSize]=\"44\" scrollHeight=\"22rem\" [dataMode]=\"scenario().includes('lazy') || scenario().includes('placeholders') ? 'virtual' : 'client'\" [totalRecords]=\"virtualRows.length\" [selectionMode]=\"scenario().includes('selection') ? 'checkbox' : 'none'\" [filterDisplay]=\"scenario().includes('filtering') ? 'row' : 'none'\" [sortField]=\"scenario().includes('sorting') ? 'total' : ''\" [sortOrder]=\"scenario().includes('sorting') ? -1 : 0\" [paginator]=\"false\" [showGlobalFilter]=\"false\" [showColumnManager]=\"false\" [showExport]=\"false\" [maximizable]=\"false\" />",
    ts: "@Component({\n  selector: 'app-virtual-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.virtual,\n  templateUrl: './virtual-table-scenarios.component.html',\n})\nexport class VirtualTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  states: {
    html: '<j-table [value]="scenario().includes(\'empty\') || scenario().includes(\'error\') || scenario().includes(\'retry\') ? [] : rows.slice(0, 5)" [columns]="columns" [loading]="scenario().includes(\'loading\')" [loadingVariant]="scenario().includes(\'overlay\') ? \'overlay\' : \'skeleton\'" [globalFilter]="scenario().includes(\'no-filter-results\') ? \'no-match\' : \'\'" [errorState]="scenario().includes(\'error\') || scenario().includes(\'retry\') ? true : null" emptyActionLabel="Retry" (emptyAction)="retry()" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableEmpty><div class="j-table-demo__detail"><img src="/assets/images/empty-state-search.webp" alt="Document with a magnifying glass" width="180" height="120" /><strong>Nothing here yet</strong><span>Create the first order or retry loading.</span></div></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-states-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.states,\n  templateUrl: './states-table-scenarios.component.html',\n})\nexport class StatesTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  export: {
    html: '<j-table [value]="rows" [columns]="actionColumns" [selectionMode]="scenario().includes(\'selected\') ? \'checkbox\' : \'none\'" [selection]="selection" (selectionChange)="selection = $event" [exportConfig]="{ rows: scenario().includes(\'selected\') ? \'selected\' : scenario().includes(\'visible\') ? \'visible\' : scenario().includes(\'filtered\') ? \'filtered\' : \'all\', filename: \'jrng-customers.csv\', visibleColumnsOnly: true }" [loading]="scenario().includes(\'loading\')" (export)="onExport($event)" [paginator]="true" [rows]="5" [showGlobalFilter]="false" [showColumnManager]="false" showExport [maximizable]="false" /><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-export-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.export,\n  templateUrl: './export-table-scenarios.component.html',\n})\nexport class ExportTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  stateful: {
    html: '<div class="j-table-demo__controls"><j-button label="Clear saved state" (onClick)="table.clearState()" /><j-button label="Restore defaults" variant="outlined" (onClick)="table.resetTableState()" /></div>\n<j-table #table [value]="rows" [columns]="columns" [stateKey]="\'jrng-\' + scenario()" [stateStorage]="scenario().includes(\'session-storage\') ? \'session\' : \'local\'" [restoreSelection]="scenario().includes(\'selection\')" expandableRows [paginator]="true" [rows]="5" filterDisplay="row" [showGlobalFilter]="true" showColumnManager [showExport]="false" [maximizable]="false" />',
    ts: "@Component({\n  selector: 'app-stateful-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.stateful,\n  templateUrl: './stateful-table-scenarios.component.html',\n})\nexport class StatefulTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  actions: {
    html: '<j-table [value]="rows.slice(0, 6)" [columns]="actionColumns" (action)="onAction($event)" (contextMenu)="eventMessage = \'Row context menu requested.\'" (headerContextMenu)="eventMessage = \'Header context menu requested.\'" selectionMode="none" [paginator]="false" [showGlobalFilter]="false" [showColumnManager]="false" [showExport]="false" [maximizable]="false">\n  <ng-template jTableActions="id" let-row><j-button icon="eye" actionDisplay="icon" ariaLabel="View order" title="View order" jTooltip="View order" (onClick)="eventMessage = \'View \' + row[\'code\']" /></ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-actions-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.actions,\n  templateUrl: './actions-table-scenarios.component.html',\n})\nexport class ActionsTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
  advanced: {
    html: '<j-table\n  [value]="enterpriseRows"\n  [columns]="enterpriseColumns"\n  [config]="enterpriseTableConfig"\n  variant="enterprise"\n  scrollHeight="clamp(18rem, calc(100dvh - var(--j-app-header-height, 4rem) - var(--j-page-header-height, 3rem) - var(--j-app-footer-height, 0rem) - 13.5rem), 34rem)"\n  [tableStyle]="{ \'min-width\': \'92rem\' }"\n  [hover]="true"\n  sortField="id"\n  [sortOrder]="-1"\n  (refresh)="eventMessage = \'Requests refreshed.\'"\n>\n  <ng-template #jTableCaption let-table="table">\n    <span class="j-table-demo__caption-actions">\n      <j-button icon="settings" actionDisplay="icon" size="sm" severity="info" ariaLabel="Table config" title="Table config" (onClick)="table.handleToolbarAction({ key: \'columns\' })" />\n      <j-button [icon]="table.maximized ? \'minimize\' : \'maximize\'" actionDisplay="icon" size="sm" severity="secondary" [ariaLabel]="table.maximized ? \'Minimize table\' : \'Maximize table\'" [title]="table.maximized ? \'Minimize table\' : \'Maximize table\'" [ariaPressed]="table.maximized" (onClick)="table.handleToolbarAction({ key: \'fullscreen\' })" />\n      <j-button icon="filter" actionDisplay="icon" size="sm" severity="info" ariaLabel="Toggle filters" title="Toggle filters" (onClick)="table.handleToolbarAction({ key: \'filters\' })" />\n      @if (table.activeFilterItems.length) {\n        <j-button icon="close" actionDisplay="icon" size="sm" severity="danger" ariaLabel="Clear filters" title="Clear filters" (onClick)="table.resetFilters()" />\n      }\n      <j-button icon="refresh" actionDisplay="icon" size="sm" severity="info" ariaLabel="Refresh table" title="Refresh table" (onClick)="eventMessage = \'Requests refreshed.\'" />\n      <j-button icon="download" actionDisplay="icon" size="sm" severity="success" ariaLabel="Export table" title="Export table" (onClick)="table.exportCSV()" />\n    </span>\n  </ng-template>\n  <ng-template jTableCell="requesterName" let-row>\n    <span class="j-table-demo__customer">\n      <j-avatar [initials]="initials($any(row)[\'requesterName\'])" [ariaLabel]="$any(row)[\'requesterName\']" size="sm" />\n      <span class="j-table-demo__customer-copy">\n        <strong>{{ $any(row)[\'requesterName\'] }}</strong>\n        <small>{{ $any(row)[\'requesterCode\'] }}</small>\n      </span>\n    </span>\n  </ng-template>\n  <ng-template jTableCell="units" let-value="formattedValue"><j-badge [value]="value" variant="soft" size="md" /></ng-template>\n  <ng-template jTableCell="reviewers" let-row>\n    <span class="j-table-demo__approval">\n      @for (reviewer of $any(row)[\'reviewers\'].split(\', \'); track reviewer) {\n        <j-avatar [initials]="initials(reviewer)" [ariaLabel]="reviewer" size="sm" />\n      }\n    </span>\n  </ng-template>\n  <ng-template jTableCell="status" let-value="formattedValue">\n    <j-badge [value]="value" [severity]="statusSeverity(value)" variant="soft" size="md" />\n  </ng-template>\n  <ng-template jTableActions="actions" let-row>\n    <span class="j-table-demo__row-actions">\n      @if ($any(row)[\'status\'] !== \'Approved\') {\n        <j-button icon="check" actionDisplay="icon" size="sm" variant="text" severity="success" [ariaLabel]="\'Complete \' + $any(row)[\'requesterName\']" title="Complete request" (onClick)="eventMessage = \'Complete \' + $any(row)[\'requesterName\']" />\n      }\n      <j-action-menu popup [actions]="requestMenuActions($any(row))" [row]="$any(row)" ariaLabel="Request actions" triggerLabel="Open request actions" (action)="onAction($event)" />\n    </span>\n  </ng-template>\n</j-table><p class="j-table-demo__status" role="status" aria-live="polite">{{ eventMessage }}</p>',
    ts: "@Component({\n  selector: 'app-advanced-table-scenarios',\n  imports: TABLE_DEMO_IMPORTS.advanced,\n  templateUrl: './advanced-table-scenarios.component.html',\n})\nexport class AdvancedTableScenariosComponent extends TableScenarioState {\n  readonly scenario = input.required<string>();\n}",
    scss: ':host { display: block; min-width: 0; }',
  },
} as const;

export const TABLE_SCENARIO_DOCS = [
  ...TABLE_FILTER_EXAMPLE_DOCS,
  {
    key: 'basic-basic-table',
    family: 'basic',
    name: 'Basic table',
    details:
      'Basic table using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-dynamic-columns',
    family: 'basic',
    name: 'Dynamic columns',
    details:
      'Dynamic columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-custom-header-template',
    family: 'basic',
    name: 'Custom header template',
    details:
      'Custom header template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-custom-body-template',
    family: 'basic',
    name: 'Custom body template',
    details:
      'Custom body template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-custom-footer-template',
    family: 'basic',
    name: 'Custom footer template',
    details:
      'Custom footer template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-small-size',
    family: 'basic',
    name: 'Small size',
    details:
      'Small size using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-default-size',
    family: 'basic',
    name: 'Default size',
    details:
      'Default size using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-large-size',
    family: 'basic',
    name: 'Large size',
    details:
      'Large size using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-compact-density',
    family: 'basic',
    name: 'Compact density',
    details:
      'Compact density using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-grid-lines',
    family: 'basic',
    name: 'Grid lines',
    details:
      'Grid lines using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-striped-rows',
    family: 'basic',
    name: 'Striped rows',
    details:
      'Striped rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-hoverable-rows',
    family: 'basic',
    name: 'Hoverable rows',
    details:
      'Hoverable rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-responsive-table',
    family: 'basic',
    name: 'Responsive table',
    details:
      'Responsive table using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-conditional-row-styling',
    family: 'basic',
    name: 'Conditional row styling',
    details:
      'Conditional row styling using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-conditional-cell-styling',
    family: 'basic',
    name: 'Conditional cell styling',
    details:
      'Conditional cell styling using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-custom-empty-state',
    family: 'basic',
    name: 'Custom empty state',
    details:
      'Custom empty state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'basic-custom-loading-state',
    family: 'basic',
    name: 'Custom loading state',
    details:
      'Custom loading state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.basic,
  },
  {
    key: 'pagination-basic-pagination',
    family: 'pagination',
    name: 'Basic pagination',
    details:
      'Basic pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-configurable-rows-per-page',
    family: 'pagination',
    name: 'Configurable rows per page',
    details:
      'Configurable rows per page using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-rows-per-page-dropdown',
    family: 'pagination',
    name: 'Rows-per-page dropdown',
    details:
      'Rows-per-page dropdown using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-current-page-report',
    family: 'pagination',
    name: 'Current page report',
    details:
      'Current page report using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-first-and-last-page-buttons',
    family: 'pagination',
    name: 'First and last page buttons',
    details:
      'First and last page buttons using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-programmatic-pagination',
    family: 'pagination',
    name: 'Programmatic pagination',
    details:
      'Programmatic pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-reset-pagination',
    family: 'pagination',
    name: 'Reset pagination',
    details:
      'Reset pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-pagination-events',
    family: 'pagination',
    name: 'Pagination events',
    details:
      'Pagination events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-client-side-pagination',
    family: 'pagination',
    name: 'Client-side pagination',
    details:
      'Client-side pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-server-side-pagination',
    family: 'pagination',
    name: 'Server-side pagination',
    details:
      'Server-side pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-pagination-with-sorting',
    family: 'pagination',
    name: 'Pagination with sorting',
    details:
      'Pagination with sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'pagination-pagination-with-filtering',
    family: 'pagination',
    name: 'Pagination with filtering',
    details:
      'Pagination with filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.pagination,
  },
  {
    key: 'sorting-single-column-sorting',
    family: 'sorting',
    name: 'Single-column sorting',
    details:
      'Single-column sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-multiple-column-sorting',
    family: 'sorting',
    name: 'Multiple-column sorting',
    details:
      'Multiple-column sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-default-sorting',
    family: 'sorting',
    name: 'Default sorting',
    details:
      'Default sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-ascending-and-descending-sorting',
    family: 'sorting',
    name: 'Ascending and descending sorting',
    details:
      'Ascending and descending sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-removable-sorting',
    family: 'sorting',
    name: 'Removable sorting',
    details:
      'Removable sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-custom-sort-function',
    family: 'sorting',
    name: 'Custom sort function',
    details:
      'Custom sort function using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-text-values',
    family: 'sorting',
    name: 'Sorting text values',
    details:
      'Sorting text values using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-numeric-values',
    family: 'sorting',
    name: 'Sorting numeric values',
    details:
      'Sorting numeric values using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-date-values',
    family: 'sorting',
    name: 'Sorting date values',
    details:
      'Sorting date values using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-boolean-values',
    family: 'sorting',
    name: 'Sorting boolean values',
    details:
      'Sorting boolean values using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-programmatic-sorting',
    family: 'sorting',
    name: 'Programmatic sorting',
    details:
      'Programmatic sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sort-events',
    family: 'sorting',
    name: 'Sort events',
    details:
      'Sort events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-with-pagination',
    family: 'sorting',
    name: 'Sorting with pagination',
    details:
      'Sorting with pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'sorting-sorting-with-filtering',
    family: 'sorting',
    name: 'Sorting with filtering',
    details:
      'Sorting with filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.sorting,
  },
  {
    key: 'filtering-global-search',
    family: 'filtering',
    name: 'Global search',
    details:
      'Global search using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-basic-column-filtering',
    family: 'filtering',
    name: 'Basic column filtering',
    details:
      'Basic column filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-text-filter',
    family: 'filtering',
    name: 'Text filter',
    details:
      'Text filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-number-filter',
    family: 'filtering',
    name: 'Number filter',
    details:
      'Number filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-date-filter',
    family: 'filtering',
    name: 'Date filter',
    details:
      'Date filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-boolean-filter',
    family: 'filtering',
    name: 'Boolean filter',
    details:
      'Boolean filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-select-filter',
    family: 'filtering',
    name: 'Select filter',
    details:
      'Select filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-multiselect-filter',
    family: 'filtering',
    name: 'MultiSelect filter',
    details:
      'MultiSelect filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-range-filter',
    family: 'filtering',
    name: 'Range filter',
    details:
      'Range filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-custom-filter-template',
    family: 'filtering',
    name: 'Custom filter template',
    details:
      'Custom filter template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-filter-match-modes',
    family: 'filtering',
    name: 'Filter match modes',
    details:
      'Filter match modes using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-multiple-filter-constraints',
    family: 'filtering',
    name: 'Multiple filter constraints',
    details:
      'Multiple filter constraints using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-and-or-operators',
    family: 'filtering',
    name: 'AND/OR operators',
    details:
      'AND/OR operators using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-filter-menu',
    family: 'filtering',
    name: 'Filter menu',
    details:
      'Filter menu using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-inline-filter-row',
    family: 'filtering',
    name: 'Inline filter row',
    details:
      'Inline filter row using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-apply-filter',
    family: 'filtering',
    name: 'Apply filter',
    details:
      'Apply filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-clear-individual-filter',
    family: 'filtering',
    name: 'Clear individual filter',
    details:
      'Clear individual filter using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-clear-all-filters',
    family: 'filtering',
    name: 'Clear all filters',
    details:
      'Clear all filters using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-programmatic-filtering',
    family: 'filtering',
    name: 'Programmatic filtering',
    details:
      'Programmatic filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-client-side-filtering',
    family: 'filtering',
    name: 'Client-side filtering',
    details:
      'Client-side filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-server-side-filtering',
    family: 'filtering',
    name: 'Server-side filtering',
    details:
      'Server-side filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'filtering-filtering-with-sorting-and-pagination',
    family: 'filtering',
    name: 'Filtering with sorting and pagination',
    details:
      'Filtering with sorting and pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.filtering,
  },
  {
    key: 'selection-single-row-selection',
    family: 'selection',
    name: 'Single-row selection',
    details:
      'Single-row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-multiple-row-selection',
    family: 'selection',
    name: 'Multiple-row selection',
    details:
      'Multiple-row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-checkbox-selection',
    family: 'selection',
    name: 'Checkbox selection',
    details:
      'Checkbox selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-radio-button-selection',
    family: 'selection',
    name: 'Radio-button selection',
    details:
      'Radio-button selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-select-all-checkbox',
    family: 'selection',
    name: 'Select-all checkbox',
    details:
      'Select-all checkbox using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-indeterminate-header-checkbox',
    family: 'selection',
    name: 'Indeterminate header checkbox',
    details:
      'Indeterminate header checkbox using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-disabled-row-selection',
    family: 'selection',
    name: 'Disabled row selection',
    details:
      'Disabled row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-conditional-row-selection',
    family: 'selection',
    name: 'Conditional row selection',
    details:
      'Conditional row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-row-click-selection',
    family: 'selection',
    name: 'Row-click selection',
    details:
      'Row-click selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-selection-using-a-dedicated-column',
    family: 'selection',
    name: 'Selection using a dedicated column',
    details:
      'Selection using a dedicated column using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-programmatic-selection',
    family: 'selection',
    name: 'Programmatic selection',
    details:
      'Programmatic selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-clear-selection',
    family: 'selection',
    name: 'Clear selection',
    details:
      'Clear selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-row-select-event',
    family: 'selection',
    name: 'Row select event',
    details:
      'Row select event using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-row-unselect-event',
    family: 'selection',
    name: 'Row unselect event',
    details:
      'Row unselect event using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-select-all-event',
    family: 'selection',
    name: 'Select-all event',
    details:
      'Select-all event using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'selection-keyboard-accessible-selection',
    family: 'selection',
    name: 'Keyboard-accessible selection',
    details:
      'Keyboard-accessible selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.selection,
  },
  {
    key: 'expansion-basic-row-expansion',
    family: 'expansion',
    name: 'Basic row expansion',
    details:
      'Basic row expansion using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-single-expanded-row',
    family: 'expansion',
    name: 'Single expanded row',
    details:
      'Single expanded row using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-multiple-expanded-rows',
    family: 'expansion',
    name: 'Multiple expanded rows',
    details:
      'Multiple expanded rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-expand-all',
    family: 'expansion',
    name: 'Expand all',
    details:
      'Expand all using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-collapse-all',
    family: 'expansion',
    name: 'Collapse all',
    details:
      'Collapse all using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-programmatic-expansion',
    family: 'expansion',
    name: 'Programmatic expansion',
    details:
      'Programmatic expansion using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-custom-expanded-row-template',
    family: 'expansion',
    name: 'Custom expanded-row template',
    details:
      'Custom expanded-row template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-nested-detail-section',
    family: 'expansion',
    name: 'Nested detail section',
    details:
      'Nested detail section using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-expanded-content-containing-other-jrng-components',
    family: 'expansion',
    name: 'Expanded content containing other JRNG components',
    details:
      'Expanded content containing other JRNG components using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-expansion-events',
    family: 'expansion',
    name: 'Expansion events',
    details:
      'Expansion events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-expansion-with-pagination',
    family: 'expansion',
    name: 'Expansion with pagination',
    details:
      'Expansion with pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'expansion-expansion-with-filtering',
    family: 'expansion',
    name: 'Expansion with filtering',
    details:
      'Expansion with filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.expansion,
  },
  {
    key: 'editing-cell-editing',
    family: 'editing',
    name: 'Cell editing',
    details:
      'Cell editing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-row-editing',
    family: 'editing',
    name: 'Row editing',
    details:
      'Row editing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-text-input-editor',
    family: 'editing',
    name: 'Text input editor',
    details:
      'Text input editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-number-input-editor',
    family: 'editing',
    name: 'Number input editor',
    details:
      'Number input editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-select-editor',
    family: 'editing',
    name: 'Select editor',
    details:
      'Select editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-date-picker-editor',
    family: 'editing',
    name: 'Date picker editor',
    details:
      'Date picker editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-checkbox-editor',
    family: 'editing',
    name: 'Checkbox editor',
    details:
      'Checkbox editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-save-changes',
    family: 'editing',
    name: 'Save changes',
    details:
      'Save changes using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-cancel-changes',
    family: 'editing',
    name: 'Cancel changes',
    details:
      'Cancel changes using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-validation-during-editing',
    family: 'editing',
    name: 'Validation during editing',
    details:
      'Validation during editing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-invalid-edit-state',
    family: 'editing',
    name: 'Invalid edit state',
    details:
      'Invalid edit state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-read-only-cells',
    family: 'editing',
    name: 'Read-only cells',
    details:
      'Read-only cells using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-conditionally-editable-cells',
    family: 'editing',
    name: 'Conditionally editable cells',
    details:
      'Conditionally editable cells using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-programmatic-editing',
    family: 'editing',
    name: 'Programmatic editing',
    details:
      'Programmatic editing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-edit-events',
    family: 'editing',
    name: 'Edit events',
    details:
      'Edit events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-cell-editing-with-selection',
    family: 'editing',
    name: 'Cell editing with selection',
    details:
      'Cell editing with selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'editing-row-editing-with-multiple-fields',
    family: 'editing',
    name: 'Row editing with multiple fields',
    details:
      'Row editing with multiple fields using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.editing,
  },
  {
    key: 'grouping-group-by-field',
    family: 'grouping',
    name: 'Group by field',
    details:
      'Group by field using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-subheader-grouping',
    family: 'grouping',
    name: 'Subheader grouping',
    details:
      'Subheader grouping using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-rowspan-grouping',
    family: 'grouping',
    name: 'Rowspan grouping',
    details:
      'Rowspan grouping using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-expandable-row-groups',
    family: 'grouping',
    name: 'Expandable row groups',
    details:
      'Expandable row groups using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-group-totals',
    family: 'grouping',
    name: 'Group totals',
    details:
      'Group totals using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-group-footer',
    family: 'grouping',
    name: 'Group footer',
    details:
      'Group footer using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-custom-group-header',
    family: 'grouping',
    name: 'Custom group header',
    details:
      'Custom group header using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-custom-group-footer',
    family: 'grouping',
    name: 'Custom group footer',
    details:
      'Custom group footer using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-programmatic-group-expansion',
    family: 'grouping',
    name: 'Programmatic group expansion',
    details:
      'Programmatic group expansion using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'grouping-group-expansion-events',
    family: 'grouping',
    name: 'Group expansion events',
    details:
      'Group expansion events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.grouping,
  },
  {
    key: 'columns-column-resizing-in-fit-mode',
    family: 'columns',
    name: 'Column resizing in fit mode',
    details:
      'Column resizing in fit mode using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-column-resizing-in-expand-mode',
    family: 'columns',
    name: 'Column resizing in expand mode',
    details:
      'Column resizing in expand mode using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-resizing-in-scrollable-tables',
    family: 'columns',
    name: 'Resizing in scrollable tables',
    details:
      'Resizing in scrollable tables using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-column-reordering',
    family: 'columns',
    name: 'Column reordering',
    details:
      'Column reordering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-column-visibility-toggle',
    family: 'columns',
    name: 'Column visibility toggle',
    details:
      'Column visibility toggle using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-column-chooser',
    family: 'columns',
    name: 'Column chooser',
    details:
      'Column chooser using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-programmatic-column-visibility',
    family: 'columns',
    name: 'Programmatic column visibility',
    details:
      'Programmatic column visibility using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-fixed-columns',
    family: 'columns',
    name: 'Fixed columns',
    details:
      'Fixed columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-frozen-column',
    family: 'columns',
    name: 'Frozen column',
    details:
      'Frozen column using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-multiple-frozen-columns',
    family: 'columns',
    name: 'Multiple frozen columns',
    details:
      'Multiple frozen columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-frozen-columns-on-the-left',
    family: 'columns',
    name: 'Frozen columns on the left',
    details:
      'Frozen columns on the left using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-frozen-columns-on-the-right',
    family: 'columns',
    name: 'Frozen columns on the right',
    details:
      'Frozen columns on the right using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-column-groups',
    family: 'columns',
    name: 'Column groups',
    details:
      'Column groups using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-multi-row-headers',
    family: 'columns',
    name: 'Multi-row headers',
    details:
      'Multi-row headers using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-header-colspan',
    family: 'columns',
    name: 'Header colspan',
    details:
      'Header colspan using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-header-rowspan',
    family: 'columns',
    name: 'Header rowspan',
    details:
      'Header rowspan using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-grouped-columns-with-sorting',
    family: 'columns',
    name: 'Grouped columns with sorting',
    details:
      'Grouped columns with sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-grouped-columns-with-filtering',
    family: 'columns',
    name: 'Grouped columns with filtering',
    details:
      'Grouped columns with filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'columns-grouped-columns-with-resizing',
    family: 'columns',
    name: 'Grouped columns with resizing',
    details:
      'Grouped columns with resizing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.columns,
  },
  {
    key: 'reorder-drag-and-drop-row-reordering',
    family: 'reorder',
    name: 'Drag-and-drop row reordering',
    details:
      'Drag-and-drop row reordering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-reordering-using-a-drag-handle',
    family: 'reorder',
    name: 'Reordering using a drag handle',
    details:
      'Reordering using a drag handle using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-disabled-reordering-for-specific-rows',
    family: 'reorder',
    name: 'Disabled reordering for specific rows',
    details:
      'Disabled reordering for specific rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-reorder-events',
    family: 'reorder',
    name: 'Reorder events',
    details:
      'Reorder events using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-programmatic-row-updates',
    family: 'reorder',
    name: 'Programmatic row updates',
    details:
      'Programmatic row updates using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-reordering-with-selection',
    family: 'reorder',
    name: 'Reordering with selection',
    details:
      'Reordering with selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-reordering-with-pagination',
    family: 'reorder',
    name: 'Reordering with pagination',
    details:
      'Reordering with pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'reorder-keyboard-accessible-alternative',
    family: 'reorder',
    name: 'Keyboard-accessible alternative',
    details:
      'Keyboard-accessible alternative using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.reorder,
  },
  {
    key: 'scrolling-vertical',
    family: 'scrolling',
    name: 'Vertical',
    details:
      'Vertical using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-horizontal',
    family: 'scrolling',
    name: 'Horizontal',
    details:
      'Horizontal using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-horizontal-and-vertical',
    family: 'scrolling',
    name: 'Horizontal and Vertical',
    details:
      'Horizontal and Vertical using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-fixed-height',
    family: 'scrolling',
    name: 'Fixed Height',
    details:
      'Fixed Height using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-flexible',
    family: 'scrolling',
    name: 'Flexible',
    details:
      'Flexible using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-responsive-scrolling',
    family: 'scrolling',
    name: 'Responsive scrolling',
    details:
      'Responsive scrolling using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-sticky-header',
    family: 'scrolling',
    name: 'Sticky header',
    details:
      'Sticky header using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-frozen-rows',
    family: 'scrolling',
    name: 'Frozen rows',
    details:
      'Frozen rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-frozen-columns',
    family: 'scrolling',
    name: 'Frozen columns',
    details:
      'Frozen columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-multiple-frozen-columns',
    family: 'scrolling',
    name: 'Multiple frozen columns',
    details:
      'Multiple frozen columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-scrolling-with-pagination',
    family: 'scrolling',
    name: 'Scrolling with pagination',
    details:
      'Scrolling with pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-scrolling-with-column-resizing',
    family: 'scrolling',
    name: 'Scrolling with column resizing',
    details:
      'Scrolling with column resizing using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'scrolling-scrolling-with-grouped-columns',
    family: 'scrolling',
    name: 'Scrolling with grouped columns',
    details:
      'Scrolling with grouped columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.scrolling,
  },
  {
    key: 'virtual-basic-virtual-scrolling',
    family: 'virtual',
    name: 'Basic virtual scrolling',
    details:
      'Basic virtual scrolling using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-virtual-scrolling-with-preloaded-data',
    family: 'virtual',
    name: 'Virtual scrolling with preloaded data',
    details:
      'Virtual scrolling with preloaded data using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-lazy-virtual-scrolling',
    family: 'virtual',
    name: 'Lazy virtual scrolling',
    details:
      'Lazy virtual scrolling using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-virtual-scrolling-with-loading-placeholders',
    family: 'virtual',
    name: 'Virtual scrolling with loading placeholders',
    details:
      'Virtual scrolling with loading placeholders using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-virtual-scrolling-with-filtering',
    family: 'virtual',
    name: 'Virtual scrolling with filtering',
    details:
      'Virtual scrolling with filtering using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-virtual-scrolling-with-sorting',
    family: 'virtual',
    name: 'Virtual scrolling with sorting',
    details:
      'Virtual scrolling with sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-virtual-scrolling-with-row-selection',
    family: 'virtual',
    name: 'Virtual scrolling with row selection',
    details:
      'Virtual scrolling with row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'virtual-large-dataset-example',
    family: 'virtual',
    name: 'Large dataset example',
    details:
      'Large dataset example using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.virtual,
  },
  {
    key: 'states-loading-overlay',
    family: 'states',
    name: 'Loading overlay',
    details:
      'Loading overlay using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-loading-skeleton-rows',
    family: 'states',
    name: 'Loading skeleton rows',
    details:
      'Loading skeleton rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-initial-loading',
    family: 'states',
    name: 'Initial loading',
    details:
      'Initial loading using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-pagination-loading',
    family: 'states',
    name: 'Pagination loading',
    details:
      'Pagination loading using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-filtering-loading',
    family: 'states',
    name: 'Filtering loading',
    details:
      'Filtering loading using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-lazy-load-loading',
    family: 'states',
    name: 'Lazy-load loading',
    details:
      'Lazy-load loading using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-empty-dataset',
    family: 'states',
    name: 'Empty dataset',
    details:
      'Empty dataset using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-no-filter-results',
    family: 'states',
    name: 'No filter results',
    details:
      'No filter results using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-custom-empty-template',
    family: 'states',
    name: 'Custom empty template',
    details:
      'Custom empty template using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-error-state',
    family: 'states',
    name: 'Error state',
    details:
      'Error state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'states-retry-action',
    family: 'states',
    name: 'Retry action',
    details:
      'Retry action using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.states,
  },
  {
    key: 'export-export-all-rows-to-csv',
    family: 'export',
    name: 'Export all rows to CSV',
    details:
      'Export all rows to CSV using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-export-visible-rows',
    family: 'export',
    name: 'Export visible rows',
    details:
      'Export visible rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-export-selected-rows',
    family: 'export',
    name: 'Export selected rows',
    details:
      'Export selected rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-export-filtered-rows',
    family: 'export',
    name: 'Export filtered rows',
    details:
      'Export filtered rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-export-custom-columns',
    family: 'export',
    name: 'Export custom columns',
    details:
      'Export custom columns using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-custom-csv-filename',
    family: 'export',
    name: 'Custom CSV filename',
    details:
      'Custom CSV filename using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-custom-export-formatting',
    family: 'export',
    name: 'Custom export formatting',
    details:
      'Custom export formatting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-export-event',
    family: 'export',
    name: 'Export event',
    details:
      'Export event using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'export-disabled-export-while-loading',
    family: 'export',
    name: 'Disabled export while loading',
    details:
      'Disabled export while loading using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.export,
  },
  {
    key: 'stateful-persist-pagination',
    family: 'stateful',
    name: 'Persist pagination',
    details:
      'Persist pagination using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-sorting',
    family: 'stateful',
    name: 'Persist sorting',
    details:
      'Persist sorting using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-filters',
    family: 'stateful',
    name: 'Persist filters',
    details:
      'Persist filters using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-column-order',
    family: 'stateful',
    name: 'Persist column order',
    details:
      'Persist column order using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-column-width',
    family: 'stateful',
    name: 'Persist column width',
    details:
      'Persist column width using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-column-visibility',
    family: 'stateful',
    name: 'Persist column visibility',
    details:
      'Persist column visibility using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-row-selection',
    family: 'stateful',
    name: 'Persist row selection',
    details:
      'Persist row selection using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-persist-expanded-rows',
    family: 'stateful',
    name: 'Persist expanded rows',
    details:
      'Persist expanded rows using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-session-storage-example',
    family: 'stateful',
    name: 'Session storage example',
    details:
      'Session storage example using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-local-storage-example',
    family: 'stateful',
    name: 'Local storage example',
    details:
      'Local storage example using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-clear-saved-state',
    family: 'stateful',
    name: 'Clear saved state',
    details:
      'Clear saved state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'stateful-restore-default-state',
    family: 'stateful',
    name: 'Restore default state',
    details:
      'Restore default state using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.stateful,
  },
  {
    key: 'actions-row-context-menu',
    family: 'actions',
    name: 'Row context menu',
    details:
      'Row context menu using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-header-context-menu',
    family: 'actions',
    name: 'Header context menu',
    details:
      'Header context menu using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-row-action-buttons',
    family: 'actions',
    name: 'Row action buttons',
    details:
      'Row action buttons using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-icon-only-actions',
    family: 'actions',
    name: 'Icon-only actions',
    details:
      'Icon-only actions using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-edit-action',
    family: 'actions',
    name: 'Edit action',
    details:
      'Edit action using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-delete-action',
    family: 'actions',
    name: 'Delete action',
    details:
      'Delete action using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-view-details-action',
    family: 'actions',
    name: 'View-details action',
    details:
      'View-details action using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-conditional-actions',
    family: 'actions',
    name: 'Conditional actions',
    details:
      'Conditional actions using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-disabled-actions',
    family: 'actions',
    name: 'Disabled actions',
    details:
      'Disabled actions using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-action-overflow-menu',
    family: 'actions',
    name: 'Action overflow menu',
    details:
      'Action overflow menu using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'actions-keyboard-accessible-menu',
    family: 'actions',
    name: 'Keyboard-accessible menu',
    details:
      'Keyboard-accessible menu using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.actions,
  },
  {
    key: 'advanced-customer-management-table',
    family: 'advanced',
    name: 'Customer management table',
    details:
      'Customer management table using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-employee-directory',
    family: 'advanced',
    name: 'Employee directory',
    details:
      'Employee directory using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-product-inventory',
    family: 'advanced',
    name: 'Product inventory',
    details:
      'Product inventory using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-customer-renewals',
    family: 'advanced',
    name: 'Customer renewals',
    details:
      'Customer renewals using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-transaction-history',
    family: 'advanced',
    name: 'Transaction history',
    details:
      'Transaction history using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-database-editor',
    family: 'advanced',
    name: 'Database editor',
    details:
      'Database editor using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
  {
    key: 'advanced-admin-user-management',
    family: 'advanced',
    name: 'Admin user management',
    details:
      'Admin user management using independent local state and realistic business records. Expected behavior: the visible controls update only this example and emit a polite status message. Accessibility: semantic headers, keyboard focus, labelled controls, and responsive scrolling remain available.',
    ...TABLE_SCENARIO_SOURCES.advanced,
  },
] as const;

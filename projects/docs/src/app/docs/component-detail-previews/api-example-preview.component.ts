import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Type,
  ViewContainerRef,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import {
  JTableActionsTemplateDirective,
  JTableCellTemplateDirective,
  JTableComponent,
  JTableEmptyTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableLoadingTemplateDirective,
} from 'jrng-ui/table';
import { JTreeTableCellTemplateDirective, JTreeTableComponent } from 'jrng-ui/tree-table';
import { JSplitterComponent, JSplitterPanelComponent } from 'jrng-ui/splitter';
import { COMPONENT_PREVIEW_IMPORTS, DetailFeatureExample } from '../component-detail-view-base';
import { ComponentDoc } from '../docs-types';

@Component({
  selector: 'app-api-example-preview',
  imports: [
    JButtonComponent,
    JTableComponent,
    JTableActionsTemplateDirective,
    JTableCellTemplateDirective,
    JTableEmptyTemplateDirective,
    JTableFilterTemplateDirective,
    JTableHeaderTemplateDirective,
    JTableLoadingTemplateDirective,
    JTreeTableComponent,
    JTreeTableCellTemplateDirective,
    JSplitterComponent,
    JSplitterPanelComponent,
  ],
  template: `
    <div class="j-preview-stack">
      @if (previewExample().key === 'api-templates' && doc().selector === 'j-table') {
        <j-table [value]="templateRows" [columns]="templateColumns">
          <ng-template jTableHeader="name" let-column> {{ column.header }} / owner </ng-template>
          <ng-template jTableCell="name" let-row let-value="value" let-column="column">
            {{ column.header }}: {{ value }} for {{ row['name'] }}
          </ng-template>
          <ng-template jTableFilter="status" let-column let-value="value">
            {{ column.header }} filter: {{ value }}
          </ng-template>
          <ng-template jTableActions let-row let-rowIndex="index">
            <j-button [label]="'Open row ' + (rowIndex + 1)" (onClick)="openRecord(row)" />
          </ng-template>
          <ng-template jTableEmpty let-state="state">
            No records in {{ state }} state.
          </ng-template>
          <ng-template jTableLoading let-rowCount="rows">
            Loading {{ rowCount }} representative rows.
          </ng-template>
        </j-table>
      } @else if (previewExample().key === 'api-templates' && doc().selector === 'j-tree-table') {
        <j-tree-table [value]="templateTreeNodes" [columns]="templateColumns">
          <ng-template jTreeTableCell let-node let-column="column" let-level="level">
            Level {{ level }} · {{ column.header }} · {{ node.label }}
          </ng-template>
        </j-tree-table>
      } @else if (doc().selector === 'j-splitter-panel') {
        <j-splitter>
          <j-splitter-panel [size]="35" [minSize]="20" [maxSize]="60">
            Navigation
          </j-splitter-panel>
          <j-splitter-panel [size]="65">Workspace</j-splitter-panel>
        </j-splitter>
      } @else {
        <ng-container #componentHost />
      }

      @if (previewExample().methods?.length) {
        <div class="j-preview-row" aria-label="Programmatic component controls">
          @for (signature of previewExample().methods ?? []; track signature) {
            <j-button
              variant="outlined"
              size="sm"
              [label]="methodLabel(signature)"
              (onClick)="invoke(signature)"
            />
          }
        </div>
      }

      @if (previewExample().forms?.length) {
        <div class="j-preview-row" aria-label="Forms controls">
          <j-button variant="outlined" size="sm" label="Reset" (onClick)="resetFormValue()" />
          <j-button
            variant="outlined"
            size="sm"
            label="Disable control"
            (onClick)="setFormDisabled(true)"
          />
          <j-button
            variant="outlined"
            size="sm"
            label="Enable control"
            (onClick)="setFormDisabled(false)"
          />
        </div>
      }

      @if (lastEvent()) {
        <p class="j-preview-note" role="status" aria-live="polite">{{ lastEvent() }}</p>
      }
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiExamplePreviewComponent {
  readonly doc = input.required<ComponentDoc>();
  readonly previewExample = input.required<DetailFeatureExample>();
  readonly lastEvent = signal('');

  private readonly componentHost = viewChild('componentHost', { read: ViewContainerRef });
  private componentRef: ComponentRef<unknown> | null = null;
  private outputSubscriptions: { unsubscribe(): void }[] = [];
  readonly templateColumns = [
    { field: 'name', header: 'Work item', sortable: true },
    { field: 'status', header: 'Status', filterable: true },
  ];
  readonly templateRows = [
    { id: 1, name: 'Design review', status: 'Ready' },
    { id: 2, name: 'Release approval', status: 'Pending' },
  ];
  readonly templateTreeNodes = [
    {
      key: 'operations',
      label: 'Operations',
      data: { name: 'Operations', status: 'Active' },
      children: [],
    },
  ];

  constructor() {
    effect(() => {
      const doc = this.doc();
      const example = this.previewExample();
      const host = this.componentHost();
      untracked(() => {
        this.destroyPreview();
        if (example.key === 'api-templates' || doc.selector === 'j-splitter-panel' || !host) {
          return;
        }
        host.clear();

        const componentType = componentTypeFor(doc.selector);
        if (!componentType) {
          this.lastEvent.set(`No runnable component type was found for ${doc.selector}.`);
          return;
        }

        this.componentRef = host.createComponent(componentType);
        for (const api of example.inputs ?? []) {
          const value = apiExampleValue(doc.selector, api, example.key);
          if (value !== undefined) this.componentRef.setInput(api, value);
        }
        this.connectOutputs(example.outputs ?? []);
        if (example.forms?.length) this.connectForms();
        this.componentRef.changeDetectorRef.detectChanges();
      });
    });
  }

  invoke(signature: string): void {
    const name = signature.replace(/\(.*/, '');
    const instance = this.componentRef?.instance as Record<string, unknown> | undefined;
    const method = instance?.[name];
    if (typeof method !== 'function') {
      this.lastEvent.set(`${name}() is unavailable in this preview.`);
      return;
    }
    try {
      const result = method.call(instance, methodArgument(name));
      this.lastEvent.set(`${name}() called${result === undefined ? '' : `: ${stringify(result)}`}`);
      this.componentRef?.changeDetectorRef.detectChanges();
    } catch (error) {
      this.lastEvent.set(`${name}() requires application-specific data: ${errorMessage(error)}`);
    }
  }

  resetFormValue(): void {
    const instance = this.componentRef?.instance as {
      writeValue?: (value: unknown) => void;
    } | null;
    const value = formExampleValue(this.doc().selector);
    instance?.writeValue?.(value);
    this.lastEvent.set(`Form reset to ${stringify(value)}.`);
    this.componentRef?.changeDetectorRef.detectChanges();
  }

  setFormDisabled(disabled: boolean): void {
    const instance = this.componentRef?.instance as {
      setDisabledState?: (value: boolean) => void;
    } | null;
    instance?.setDisabledState?.(disabled);
    this.lastEvent.set(disabled ? 'Form control disabled.' : 'Form control enabled.');
    this.componentRef?.changeDetectorRef.detectChanges();
  }

  methodLabel(signature: string): string {
    return signature
      .replace(/\(.*/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/^./, (value) => value.toUpperCase());
  }

  openRecord(row: unknown): void {
    this.lastEvent.set(`Opened record: ${stringify(row)}`);
  }

  private connectOutputs(outputs: readonly string[]): void {
    const instance = this.componentRef?.instance as Record<string, unknown> | undefined;
    for (const output of outputs) {
      const emitter = instance?.[output] as
        { subscribe(callback: (payload: unknown) => void): { unsubscribe(): void } } | undefined;
      if (!emitter?.subscribe) continue;
      this.outputSubscriptions.push(
        emitter.subscribe((payload) => this.lastEvent.set(`${output}: ${stringify(payload)}`)),
      );
    }
  }

  private connectForms(): void {
    const instance = this.componentRef?.instance as {
      writeValue?: (value: unknown) => void;
      registerOnChange?: (callback: (value: unknown) => void) => void;
      registerOnTouched?: (callback: () => void) => void;
    } | null;
    instance?.registerOnChange?.((value) => this.lastEvent.set(`Form value: ${stringify(value)}`));
    instance?.registerOnTouched?.(() => this.lastEvent.set('Form control touched.'));
    instance?.writeValue?.(formExampleValue(this.doc().selector));
  }

  private destroyPreview(): void {
    for (const subscription of this.outputSubscriptions) subscription.unsubscribe();
    this.outputSubscriptions = [];
    this.componentRef?.destroy();
    this.componentRef = null;
  }
}

function componentTypeFor(selector: string): Type<unknown> | null {
  for (const candidate of COMPONENT_PREVIEW_IMPORTS as readonly unknown[]) {
    const definition = (candidate as { ɵcmp?: { selectors?: readonly (readonly string[])[] } })
      .ɵcmp;
    if (definition?.selectors?.some((parts) => parts[0] === selector)) {
      return candidate as Type<unknown>;
    }
  }
  return null;
}

function apiExampleValue(selector: string, api: string, exampleKey: string): unknown {
  if (['j-notification-center', 'j-popover'].includes(selector) && api === 'visible') {
    return false;
  }
  if (
    ['j-context-menu', 'j-notification-center', 'j-popover'].includes(selector) &&
    api === 'target'
  ) {
    return undefined;
  }
  if (
    exampleKey === 'api-states' &&
    /^(?:disabled|readonly|readOnly|loading|invalid|required|error|empty|indeterminate|selected|expanded|checked|active|visible|open|errorState|loadingVariant|skeletonRows)$/.test(
      api,
    )
  ) {
    if (/^(?:error|errorState)$/.test(api)) return 'Review the highlighted field.';
    if (api === 'loadingVariant') return 'skeleton';
    if (api === 'skeletonRows') return 3;
    return true;
  }
  if (selector === 'j-table') {
    const tableModes: Readonly<Record<string, string>> = {
      columnResizeMode: 'fit',
      dataMode: 'client',
      density: 'comfortable',
      editMode: 'cell',
      emptyState: 'auto',
      expansionMode: 'multiple',
      filterDisplay: 'none',
      globalFilter: '',
      loadingVariant: 'skeleton',
      responsiveMode: 'scroll',
      sortMode: 'single',
      stateStorage: 'session',
    };
    if (api in tableModes) return tableModes[api];
    if (api === 'filterModel') return { items: [], logicOperator: 'and' };
    if (['filters', 'hiddenFilters', 'permanentFilters'].includes(api)) return {};
    if (
      [
        'columnGroups',
        'exportAdapters',
        'globalFilterFields',
        'multiSortMeta',
        'rowsPerPageOptions',
        'skeletonColumns',
      ].includes(api)
    ) {
      return [];
    }
    if (['expandedRowKeys', 'lockedRowKeys'].includes(api)) return new Set();
    if (api === 'selection') return null;
    if (
      [
        'queryMapper',
        'rowClass',
        'rowExpandable',
        'rowReorderable',
        'rowSelectable',
        'stateStorageAdapter',
      ].includes(api)
    ) {
      return () => true;
    }
  }
  if (selector === 'j-chart') {
    if (api === 'width') return 480;
    if (api === 'height') return 260;
    if (api === 'options') return {};
    if (api === 'plugins') return [];
    if (api === 'tooltipFormatter') return (context: unknown) => stringify(context);
  }
  if (selector === 'j-date-picker') {
    const datePickerValues: Readonly<Record<string, string>> = {
      dataType: 'date',
      dateFormat: 'MM/dd/yyyy',
      hourFormat: '24',
      multipleSeparator: ', ',
      rangeSeparator: ' - ',
      selectionMode: 'single',
      view: 'date',
    };
    if (api in datePickerValues) return datePickerValues[api];
    if (api === 'value') return new Date('2026-07-28T09:30:00');
    if (api === 'disabledDates') return [new Date('2026-07-30T00:00:00')];
    if (api === 'presets') {
      return [{ label: 'Today', value: new Date('2026-07-28T00:00:00') }];
    }
  }
  if (selector === 'j-query-builder') {
    if (api === 'fields') {
      return [
        { key: 'customer', label: 'Customer', type: 'text' },
        { key: 'total', label: 'Order total', type: 'number' },
      ];
    }
    if (api === 'operators') return [];
    if (api === 'value') {
      return { id: 'docs-query', type: 'group', join: 'and', children: [] };
    }
  }
  if (selector === 'j-data-view') {
    if (api === 'rowsPerPageOptions') return [3, 6, 12];
    if (api === 'sortOptions') {
      return [
        { label: 'Name ascending', value: 'name' },
        { label: 'Name descending', value: '!name' },
      ];
    }
  }
  if (selector === 'j-kanban' && api === 'value') {
    return [
      {
        id: 'review',
        title: 'Review',
        cards: [{ id: 'proposal', title: 'Review proposal', description: 'Due Friday' }],
      },
      { id: 'approved', title: 'Approved', cards: [] },
    ];
  }
  if (selector === 'j-tree-table' && api === 'expandedKeys') return new Set();
  if (/^(?:ariaLabel|ariaDescription|label|title|caption)$/.test(api)) {
    return `${displayName(selector)} business example`;
  }
  if (/description|hint|emptyMessage|placeholder|alt|message/i.test(api)) {
    return 'Use a clear, task-specific value.';
  }
  if (/^(?:options|suggestions|statuses|items|source|target|value|model)$/.test(api)) {
    return [
      { id: 1, key: 'design', label: 'Design review', name: 'Design review', value: 'design' },
      {
        id: 2,
        key: 'release',
        label: 'Release approval',
        name: 'Release approval',
        value: 'release',
      },
    ];
  }
  if (/columns/i.test(api)) {
    return [
      { field: 'name', header: 'Work item', sortable: true },
      { field: 'status', header: 'Status', filterable: true },
    ];
  }
  if (/Options$/.test(api)) return [];
  if (/events/i.test(api)) {
    return [
      {
        id: 'planning',
        title: 'Planning review',
        start: new Date('2026-07-28T09:00:00'),
        end: new Date('2026-07-28T10:00:00'),
      },
    ];
  }
  if (/nodes|tree/i.test(api)) {
    return [
      {
        key: 'operations',
        label: 'Operations',
        data: { name: 'Operations', status: 'Active' },
        children: [],
      },
    ];
  }
  if (/files/i.test(api)) {
    return [{ id: 'report', name: 'Quarterly-report.pdf', kind: 'file', size: 24832 }];
  }
  if (/data/i.test(api)) {
    return {
      labels: ['Apr', 'May', 'Jun'],
      datasets: [{ label: 'Requests', data: [42, 58, 71] }],
    };
  }
  if (/date/i.test(api)) return new Date('2026-07-28T09:30:00');
  if (/^(?:scrollHeight|scrollWidth|width|height|minWidth|maxWidth)$/i.test(api)) {
    return '20rem';
  }
  if (
    /^(?:min|max|step|rows|first|totalRecords|length|delay|duration|count|size|width|height|index|pageSize|itemSize|viewportItems)/i.test(
      api,
    )
  ) {
    return api === 'step' ? 1 : api === 'first' ? 0 : 10;
  }
  if (
    /disabled|readonly|required|invalid|loading|clearable|searchable|filter|sort|show|multiple|virtual|lazy|responsive|rounded|raised|fluid|fullWidth|compact|inline|loop|autoplay|controls|draggable|resizable/i.test(
      api,
    )
  ) {
    return false;
  }
  if (/variant/i.test(api)) return 'default';
  if (/severity/i.test(api)) return 'info';
  if (/orientation|direction|layout/i.test(api)) return 'horizontal';
  if (/selectionMode/i.test(api)) return 'single';
  if (/type/i.test(api)) return 'text';
  if (/size/i.test(api)) return 'md';
  if (/icon/i.test(api)) return 'info';
  if (/trackBy|compareWith|formatter|filterFunction/i.test(api)) {
    return (value: unknown) => value;
  }
  if (/config/i.test(api)) return {};
  if (/class|id|name|field|key|route|url|src|currency|locale|format/i.test(api)) {
    return api === 'currency' ? 'USD' : api === 'locale' ? 'en-US' : api;
  }
  return undefined;
}

function formExampleValue(selector: string): unknown {
  if (selector === 'j-date-picker') return new Date('2026-07-28T09:30:00');
  if (
    ['j-checkbox', 'j-radio', 'j-rating', 'j-slider', 'j-switch', 'j-toggle-button'].includes(
      selector,
    )
  ) {
    return selector === 'j-rating' || selector === 'j-slider' ? 3 : true;
  }
  if (selector === 'j-query-builder') {
    return { id: 'docs-query', type: 'group', join: 'and', children: [] };
  }
  return 'Quarterly review';
}

function methodArgument(name: string): unknown {
  if (/scroll|index/i.test(name)) return 0;
  if (/zoom/i.test(name)) return 1;
  if (/select|add|remove|move/i.test(name)) {
    return { id: 1, key: 'example', label: 'Business example', value: 'example' };
  }
  return undefined;
}

function displayName(selector: string): string {
  return selector
    .replace(/^j-/, '')
    .replaceAll('-', ' ')
    .replace(/^./, (value) => value.toUpperCase());
}

function stringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

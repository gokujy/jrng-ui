import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Type,
  ViewContainerRef,
  effect,
  inject,
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
    <div class="j-preview-stack j-api-example-preview">
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
  private readonly documentRef = inject(DOCUMENT);
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

        const projectedExample = this.documentRef.createTextNode('Fictional customer example');
        this.componentRef = host.createComponent(componentType, {
          projectableNodes: [[projectedExample]],
        });
        for (const [api, value] of Object.entries(requiredPreviewInputs(doc.selector))) {
          this.componentRef.setInput(api, value);
        }
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
      const result = method.call(instance, methodArgument(this.doc().selector, name));
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
  if (selector === 'j-image') {
    if (api === 'src') return '/assets/images/product-laptop.webp';
    if (api === 'fallback') return '/assets/images/product-headphones.webp';
    if (api === 'loading') return 'eager';
  }
  if (selector === 'j-gallery' && api === 'value') return galleryPreviewItems();
  if (api === 'value') {
    const value = controlExampleValue(selector);
    if (value !== undefined) return value;
  }
  if (['j-notification-center', 'j-popover'].includes(selector) && api === 'visible') {
    return false;
  }
  if (
    ['j-context-menu', 'j-notification-center', 'j-popover'].includes(selector) &&
    api === 'target'
  ) {
    return undefined;
  }
  if (selector === 'j-editor') {
    if (api === 'airMode' || api === 'stickyToolbar' || api === 'tabMovesFocus') return false;
    if (api === 'fontFamilies') return ['Arial', 'Georgia', 'Verdana'];
    if (api === 'fontSizes') return [10, 12, 14, 18, 24];
    if (api === 'height') return '14rem';
    if (api === 'imageAccept') return 'image/png,image/jpeg,image/webp,image/gif';
    if (api === 'imageMaxFileSize') return 5 * 1024 * 1024;
    if (api === 'lineHeights') return [1, 1.4, 1.6, 2];
    if (api === 'minHeight') return '10rem';
    if (api === 'outputFormat') return 'html';
    if (api === 'resizable' || api === 'spellcheck') return true;
    if (api === 'tabSize') return 4;
    if (api === 'toolbar') return 'full';
    if (api === 'toolbarLabel') return 'Customer notes editor toolbar';
    if (api === 'toolbarPosition') return 'top';
    if (api === 'imageAdapter' || api === 'sanitizerAdapter') return null;
  }
  if (api === 'appendTo') return 'body';
  if (api === 'asyncPageSize') return 20;
  if (api === 'delay') return 250;
  if (api === 'minLength') return 1;
  if (api === 'size') return 'md';
  if (api === 'groupOptions') return 'items';
  if (api === 'optionLabel') return 'label';
  if (api === 'optionValue') return 'value';
  if (api === 'optionDisabled') return 'disabled';
  if (selector === 'j-autocomplete' && api === 'dataSource') return null;
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
    if (api === 'value') {
      return [
        { id: 'CUS-1042', name: 'Northwind Harbor', status: 'Active' },
        { id: 'CUS-1087', name: 'Willow & Pine', status: 'Review' },
      ];
    }
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
    if (api === 'type') return 'bar';
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
    if (api === 'sortField') return 'name';
    if (api === 'sortOptions') {
      return [
        { label: 'Name', field: 'name' },
        { label: 'Category', field: 'category' },
        { label: 'Owner', field: 'owner' },
      ];
    }
    if (api === 'value') {
      return [
        { id: 1, name: 'Northwind Harbor', category: 'Technology', owner: 'Avery Reed' },
        { id: 2, name: 'Willow & Pine', category: 'Retail', owner: 'Morgan Lee' },
      ];
    }
  }
  if (selector === 'j-meter-group' && api === 'value') {
    return [
      { label: 'Active', value: 64 },
      { label: 'Review', value: 24 },
    ];
  }
  if (['j-tree', 'j-tree-table', 'j-org-chart'].includes(selector) && api === 'value') {
    return [
      {
        key: 'customers',
        label: 'Customers',
        data: { name: 'Customers', status: 'Active' },
        children: [],
      },
    ];
  }
  if (selector === 'j-timeline' && api === 'value') {
    return [
      {
        title: 'Account created',
        description: 'Customer profile was created.',
        date: '2026-07-12',
      },
      {
        title: 'Review completed',
        description: 'Account details were verified.',
        date: '2026-07-18',
      },
    ];
  }
  if (selector === 'j-gantt' && api === 'tasks') {
    return [
      {
        id: 'discovery',
        label: 'Customer discovery',
        start: '2026-07-06',
        end: '2026-07-12',
        progress: 100,
      },
      {
        id: 'launch',
        label: 'Customer launch',
        start: '2026-07-13',
        end: '2026-07-24',
        progress: 45,
      },
    ];
  }
  if (selector === 'j-virtual-scroller' && api === 'items') {
    return Array.from({ length: 24 }, (_, index) => `Customer record ${index + 1}`);
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
      {
        id: 1,
        key: 'northwind',
        label: 'Northwind Harbor',
        name: 'Northwind Harbor',
        value: 'northwind',
      },
      {
        id: 2,
        key: 'willow',
        label: 'Willow & Pine',
        name: 'Willow & Pine',
        value: 'willow',
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
  return controlExampleValue(selector) ?? 'Customer review';
}

function controlExampleValue(selector: string): unknown {
  switch (selector) {
    case 'j-autocomplete':
    case 'j-cascader':
    case 'j-listbox':
    case 'j-radio-group':
    case 'j-select':
    case 'j-select-button':
      return 'northwind';
    case 'j-multiselect':
      return ['northwind'];
    case 'j-chips':
      return [
        { label: 'Priority customer', severity: 'info' },
        { label: 'Review due', severity: 'warning' },
      ];
    case 'j-checkbox':
    case 'j-switch':
    case 'j-toggle-button':
      return true;
    case 'j-input-number':
    case 'j-knob':
    case 'j-rating':
    case 'j-slider':
      return 3;
    case 'j-date-picker':
      return new Date('2026-07-28T09:30:00');
    case 'j-time-picker':
      return '09:30';
    case 'j-color-picker':
      return '#0f766e';
    case 'j-cron-expression':
      return '0 9 * * 1-5';
    case 'j-input-otp':
      return '482731';
    case 'j-input-mask':
      return '5551234567';
    case 'j-query-builder':
      return { id: 'docs-query', type: 'group', join: 'and', children: [] };
    case 'j-radio':
      return 'customer-review';
    case 'j-signature':
      return {
        width: 320,
        height: 120,
        strokes: [
          {
            color: '#0f766e',
            width: 2,
            points: [
              { x: 48, y: 72, pressure: 0.5 },
              { x: 96, y: 42, pressure: 0.6 },
              { x: 154, y: 74, pressure: 0.5 },
            ],
          },
        ],
      };
    case 'j-tree-select':
      return { key: 'operations', label: 'Operations', children: [] };
    case 'j-editor':
      return '<p>Customer review notes are ready.</p>';
    case 'j-input':
    case 'j-password':
    case 'j-textarea':
      return 'Customer review';
    default:
      return undefined;
  }
}

function requiredPreviewInputs(selector: string): Readonly<Record<string, unknown>> {
  if (selector === 'j-image') {
    return {
      src: '/assets/images/product-laptop.webp',
      alt: 'Laptop on a desk in a bright workspace',
    };
  }
  if (selector === 'j-gallery') return { value: galleryPreviewItems() };
  return {};
}

function galleryPreviewItems(): readonly Readonly<Record<string, string>>[] {
  return [
    {
      src: '/assets/gallery/alpine-dawn.png',
      thumbnail: '/assets/gallery/alpine-dawn.png',
      alt: 'Sunrise over an alpine valley',
      caption: 'Alpine dawn',
    },
    {
      src: '/assets/gallery/coastal-light.png',
      thumbnail: '/assets/gallery/coastal-light.png',
      alt: 'Sunlit coastline and blue water',
      caption: 'Coastal light',
    },
  ];
}

function methodArgument(selector: string, name: string): unknown {
  if (selector === 'j-gallery' && name === 'select') return 0;
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

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
  Directive,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  JAccordionComponent,
  JAccordionContentComponent,
  JAccordionHeaderComponent,
  JAccordionPanelComponent,
  JAccordionVariant,
} from 'jrng-ui/accordion';
import { JAppShellComponent } from 'jrng-ui/app-shell';
import { JAnchorComponent, JAnchorLink } from 'jrng-ui/anchor';
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JBarcodeComponent } from 'jrng-ui/barcode';
import { JBottomSheetComponent } from 'jrng-ui/bottom-sheet';
import { JBreadcrumbComponent, JBreadcrumbItem, JBreadcrumbVariant } from 'jrng-ui/breadcrumb';
import { JButtonComponent, JButtonVariant } from 'jrng-ui/button';
import { JCalendarSchedulerComponent } from 'jrng-ui/calendar-scheduler';
import { JRecurrenceEditorComponent, JSchedulerComponent } from 'jrng-ui/scheduler';
import { JCardComponent } from 'jrng-ui/card';
import { JCarouselComponent } from 'jrng-ui/carousel';
import { JCascaderComponent } from 'jrng-ui/cascader';
import { JChartComponent } from 'jrng-ui/chart';
import { JChipComponent } from 'jrng-ui/chip';
import { JChipsComponent } from 'jrng-ui/chips';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JCommandPaletteComponent } from 'jrng-ui/command-palette';
import { JConfirmDialogComponent, JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JConfirmPopupComponent } from 'jrng-ui/confirm-popup';
import { JContainerComponent } from 'jrng-ui/container';
import { JContextMenuComponent } from 'jrng-ui/context-menu';
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
import { JCronExpressionComponent } from 'jrng-ui/cron-expression';
import { JColorPickerComponent } from 'jrng-ui/color-picker';
import { JDataDisplayComponent } from 'jrng-ui/data-display';
import { JDataViewComponent } from 'jrng-ui/data-view';
import { JDatePickerComponent, JDatePickerPreset } from 'jrng-ui/date-picker';
import { JDividerComponent } from 'jrng-ui/divider';
import { JDiffViewerComponent } from 'jrng-ui/diff-viewer';
import { JDialogComponent, JDialogService } from 'jrng-ui/dialog';
import { JDrawerComponent } from 'jrng-ui/drawer';
import { JDynamicDialogComponent } from 'jrng-ui/dynamic-dialog';
import { JEditorComponent } from 'jrng-ui/editor';
import { JEmptyComponent, JEmptyStateVariant } from 'jrng-ui/empty';
import { JErrorPageComponent } from 'jrng-ui/error-page';
import { JFieldsetComponent } from 'jrng-ui/fieldset';
import { JFilterBarComponent } from 'jrng-ui/filter-bar';
import {
  JFileBrowserActionEvent,
  JFileBrowserComponent,
  JFileBrowserItem,
  JFileBrowserSortField,
  JFileBrowserViewMode,
} from 'jrng-ui/file-browser';
import { JFilePreviewComponent } from 'jrng-ui/file-preview';
import { JFileUploadComponent } from 'jrng-ui/file-upload';
import { JLabelComponent } from 'jrng-ui/label';
import { JFormFieldComponent } from 'jrng-ui/form-field';
import { JGalleryComponent } from 'jrng-ui/gallery';
import { JGanttComponent } from 'jrng-ui/gantt';
import { JGridColumnComponent, JGridComponent, JGridRowComponent } from 'jrng-ui/grid';
import {
  JGridLayoutComponent,
  JGridLayoutDragHandleDirective,
  JGridLayoutItemTemplateDirective,
} from 'jrng-ui/grid-layout';
import { JHighlightComponent } from 'jrng-ui/highlight';
import { JHtmlPreviewComponent } from 'jrng-ui/html-preview';
import {
  JCurrencyFormatPipe,
  JDateTimeFormatPipe,
  JFileSizeFormatPipe,
  JPercentFormatPipe,
  JTextTruncatePipe,
} from 'jrng-ui/formatting';
import { JIconComponent, JIconName } from 'jrng-ui/icon';
import { JImageComponent } from 'jrng-ui/image';
import { JIconFieldComponent } from 'jrng-ui/icon-field';
import { JInputGroupComponent } from 'jrng-ui/input-group';
import { JInputMaskComponent } from 'jrng-ui/input-mask';
import { JInputNumberComponent } from 'jrng-ui/input-number';
import { JInputOtpComponent } from 'jrng-ui/input-otp';
import { JInputComponent, JInputVariant } from 'jrng-ui/input';
import {
  JInplaceActionsDirective,
  JInplaceComponent,
  JInplaceContentDirective,
  JInplaceDisplayDirective,
} from 'jrng-ui/inplace';
import { JListboxComponent } from 'jrng-ui/listbox';
import { JLoaderComponent, JLoaderVariant } from 'jrng-ui/loader';
import { JMaintenancePageComponent } from 'jrng-ui/maintenance-page';
import { JMegaMenuComponent } from 'jrng-ui/mega-menu';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';
import { JMenubarComponent } from 'jrng-ui/menubar';
import { JMeterGroupComponent } from 'jrng-ui/meter-group';
import { JMultiselectComponent } from 'jrng-ui/multiselect';
import { JNotificationCenterComponent } from 'jrng-ui/notification-center';
import { JOrderListComponent } from 'jrng-ui/order-list';
import { JOrgChartComponent } from 'jrng-ui/org-chart';
import { JPaginatorComponent, JPaginatorVariant } from 'jrng-ui/paginator';
import { JPasswordComponent } from 'jrng-ui/password';
import { JPanelComponent } from 'jrng-ui/panel';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JPopoutComponent } from 'jrng-ui/popout';
import {
  JQueryBuilderComponent,
  JQueryField,
  JQueryGroup,
  jCreateQueryCondition,
  jCreateQueryGroup,
} from 'jrng-ui/query-builder';
import { JProgressBarComponent } from 'jrng-ui/progress-bar';
import { JProgressSpinnerComponent } from 'jrng-ui/progress-spinner';
import { JPullToRefreshComponent } from 'jrng-ui/pull-to-refresh';
import { JRadioGroupComponent } from 'jrng-ui/radio-group';
import { JRadioComponent } from 'jrng-ui/radio';
import { JRatingComponent } from 'jrng-ui/rating';
import { JSelectComponent } from 'jrng-ui/select';
import { JSelectButtonComponent } from 'jrng-ui/select-button';
import { JSignatureComponent, JSignatureValue } from 'jrng-ui/signature';
import { JSpeechToTextButtonComponent, JSpeechToTextDirective } from 'jrng-ui/speech-to-text';
import { JSectionFooterComponent } from 'jrng-ui/section-footer';
import { JSectionHeaderComponent } from 'jrng-ui/section-header';
import { JSidebarNavComponent } from 'jrng-ui/sidebar-nav';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { JSparklineComponent } from 'jrng-ui/sparkline';
import { JSplitterComponent, JSplitterPanelComponent } from 'jrng-ui/splitter';
import { JSplitButtonComponent, JSplitButtonItemDirective } from 'jrng-ui/split-button';
import {
  JSpeedDialAction,
  JSpeedDialComponent,
  JSpeedDialTriggerDirective,
} from 'jrng-ui/speed-dial';
import { JStepperComponent } from 'jrng-ui/stepper';
import { JSliderComponent } from 'jrng-ui/slider';
import { JSwitchComponent } from 'jrng-ui/switch';
import {
  JSwipeActionsComponent,
  JSwipeContentDirective,
  JSwipeEndActionsDirective,
  JSwipeStartActionsDirective,
} from 'jrng-ui/swipe-actions';
import { JTabComponent, JTabsComponent, JTabsVariant } from 'jrng-ui/tabs';
import { JTagComponent } from 'jrng-ui/tag';
import { JToggleButtonComponent } from 'jrng-ui/toggle-button';
import { JToolbarComponent } from 'jrng-ui/toolbar';
import {
  JActionMenuComponent,
  JColumnFilterComponent,
  JTableAction,
  JTableActionEvent,
  JTableColumn,
  JTableComponent,
  JTableConfig,
  JTableCellTemplateDirective,
  JTableEmptyTemplateDirective,
  JTableExportEvent,
  JTableHeaderTemplateDirective,
  JTableVariant,
} from 'jrng-ui/table';
import { JTextareaComponent } from 'jrng-ui/textarea';
import { JTextExpandComponent } from 'jrng-ui/text-expand';
import { JTieredMenuComponent } from 'jrng-ui/tiered-menu';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
import { JTimelineComponent, JTimelineItem } from 'jrng-ui/timeline';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JTourGuideComponent, JTourService, JTourStepDirective } from 'jrng-ui/tour';
import { JToastContainerComponent, JToastService, JToastVariant } from 'jrng-ui/toast';
import { JTransferListComponent } from 'jrng-ui/transfer-list';
import { JTreeComponent } from 'jrng-ui/tree';
import {
  JTreeSelectComponent,
  JTreeSelectNodeDirective,
  JTreeSelectValueDirective,
} from 'jrng-ui/tree-select';
import { JTreeTableCellTemplateDirective, JTreeTableComponent } from 'jrng-ui/tree-table';
import { JTreeNode } from 'jrng-ui/tree';
import { JVideoPlayerComponent } from 'jrng-ui/video-player';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';
import { JWatermarkComponent, JWatermarkDirective } from 'jrng-ui/watermark';
import { JValidationMessageComponent } from 'jrng-ui/validation-message';
import {
  JKanbanCardEvent,
  JKanbanColumn,
  JKanbanColumnEvent,
  JKanbanComponent,
  JKanbanMoveEvent,
} from 'jrng-ui/kanban';
import { JKnobComponent } from 'jrng-ui/knob';
import { JRippleDirective } from 'jrng-ui';
import { ComponentDoc } from './docs-types';
import { CodeBlockComponent } from './code-block.component';
import { ButtonBasicDemoComponent } from '../demos/button-basic-demo/button-basic-demo.component';
import { AvatarZoomDemoComponent } from '../demos/avatar-zoom-demo/avatar-zoom-demo.component';
import { LoaderTypesDemoComponent } from '../demos/loader-types-demo/loader-types-demo.component';
import { TextExpandBasicDemoComponent } from '../demos/text-expand-basic-demo/text-expand-basic-demo.component';
import { CardMetricDemoComponent } from '../demos/card-metric-demo/card-metric-demo.component';
import { TableScenarioHostComponent } from '../demos/table-scenarios/table-scenarios.component';
import {
  TABLE_SCENARIO_COMPONENTS,
  TABLE_SCENARIO_DOCS,
} from '../demos/table-scenarios/table-scenarios.generated';
import { demoSources } from '../demos/demo-sources.generated';
import {
  PriorityComponentGuidance,
  priorityComponentGuidance,
} from './priority-component-guidance';
import { generatedApiExampleCoverage } from './generated-api-example-coverage';

type DetailCodeTab = 'html' | 'ts' | 'scss' | 'data';

export interface DetailFeatureExample {
  readonly name: string;
  readonly details: string;
  readonly key: string;
  readonly responsivePreview?: boolean;
  readonly index: number;
  readonly html: string;
  readonly ts?: string;
  readonly scss?: string;
  readonly inputs?: readonly string[];
  readonly outputs?: readonly string[];
  readonly methods?: readonly string[];
  readonly templates?: readonly string[];
  readonly forms?: readonly string[];
}

interface DetailContentsItem {
  readonly id: string;
  readonly label: string;
  readonly level: 0 | 1;
}

const FEATURE_VARIANT_KEYS: Readonly<Record<string, readonly string[]>> = {
  accordion: ['default', 'separated', 'minimal'],
  breadcrumb: ['default', 'contained', 'steps'],
  button: ['filled', 'outline', 'ghost', 'soft', 'link'],
  card: ['default', 'elevated', 'bordered', 'soft'],
  'empty-state': ['default', 'inline', 'panel'],
  input: ['outlined', 'filled'],
  'icon-button': ['filled', 'ghost', 'outline'],
  paginator: ['default', 'simple'],
  'progress-bar': ['default', 'segmented', 'labeled'],
  select: ['basic'],
  stepper: ['default', 'rail', 'progress'],
  tabs: ['default', 'pills', 'segmented'],
  textarea: ['outlined', 'filled'],
  timeline: ['default', 'activity', 'alternating'],
};

const TOAST_FEATURE_EXAMPLES = [
  {
    key: 'severities',
    name: 'Message severities',
    details: 'Match the semantic severity to the outcome being communicated.',
    html: `<j-toast />
<j-button label="Success" (onClick)="toast.success('Changes saved.', 'Saved')" />
<j-button label="Error" (onClick)="toast.error('Try again in a moment.', 'Save failed')" />
<j-button label="Warning" (onClick)="toast.warning('Two fields need review.', 'Review required')" />
<j-button label="Info" (onClick)="toast.info('Your export is being prepared.', 'Export started')" />`,
    ts: `readonly toast = inject(JToastService);`,
  },
  {
    key: 'appearance',
    name: 'Visual styles',
    details: 'Use soft, outlined, or solid treatment without changing message semantics.',
    html: `<j-button label="Soft" (onClick)="showStyle('soft')" />
<j-button label="Outlined" (onClick)="showStyle('outlined')" />
<j-button label="Solid" (onClick)="showStyle('solid')" />`,
    ts: `showStyle(variant: JToastVariant): void {
  this.toast.show({
    severity: 'info',
    variant,
    summary: \`\${variant} toast\`,
    detail: 'Appearance is independent from severity.'
  });
}`,
  },
  {
    key: 'actions',
    name: 'Actionable message',
    details: 'Keep an actionable toast visible until the user chooses an action or dismisses it.',
    html: `<j-button label="Archive project" severity="danger" (onClick)="archiveProject()" />`,
    ts: `archiveProject(): void {
  this.toast.show({
    severity: 'neutral',
    variant: 'outlined',
    summary: 'Project archived',
    detail: 'The project was moved to the archive.',
    sticky: true,
    actions: [{
      label: 'Undo',
      style: 'primary',
      command: () => this.restoreProject()
    }],
    cancelAction: { label: 'Dismiss', command: () => undefined }
  });
}`,
  },
] as const;

const TABLE_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Render a small fictional customer list with semantic, sortable column headers.',
    html: `<j-table [value]="customers" [columns]="columns" caption="Recent customers" />`,
  },
  {
    key: 'columns',
    name: 'Typed columns',
    details:
      'Use JTableColumn<T> for checked fields, widths, alignment, value getters, and formatters.',
    html: `<j-table [value]="customers" [columns]="columns" />`,
  },
  {
    key: 'templates',
    name: 'Header and cell templates',
    details:
      'Replace selected headers or cells while retaining the table data and interaction model.',
    html: `<j-table [value]="customers" [columns]="columns">
  <ng-template jTableHeader="status" let-column>{{ column.header }} / owner</ng-template>
  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>
</j-table>`,
  },
  {
    key: 'variants',
    name: 'Visual variants',
    details: 'Choose a recognizable surface concept without changing table behavior.',
    html: `<j-table [value]="customers" [columns]="columns" variant="gridlines" />`,
  },
  {
    key: 'density',
    name: 'Density',
    details: 'Set information spacing independently from the visual variant.',
    html: `<j-table [value]="customers" [columns]="columns" density="compact" />`,
  },
  {
    key: 'skeleton',
    name: 'Skeleton loading',
    details: 'Reserve table space with representative rows while records load.',
    html: `<j-table [value]="[]" [columns]="columns" loading loadingVariant="skeleton" [skeletonRows]="4" />`,
  },
  {
    key: 'overlay',
    name: 'Spinner and overlay loading',
    details: 'Keep existing rows visible when refreshing data in place.',
    html: `<j-table [value]="customers" [columns]="columns" loading loadingVariant="overlay" />`,
  },
  {
    key: 'no-data',
    name: 'No data',
    details:
      'Explain that the source dataset has no records and optionally offer a recovery action.',
    html: `<j-table [value]="[]" [columns]="columns" emptyTitle="No customers yet" emptyDescription="New customers will appear here." emptyActionLabel="Add customer" />`,
  },
  {
    key: 'no-results',
    name: 'No results',
    details:
      'Automatically distinguish an active filter returning zero matches from an empty dataset.',
    html: `<j-table [value]="customers" [columns]="columns" globalFilter="not-a-match" noResultsTitle="No matching customers" />`,
  },
  {
    key: 'error',
    name: 'Error state',
    details: 'Present a loading failure as an alert without treating it as ordinary emptiness.',
    html: `<j-table [value]="[]" [columns]="columns" [errorState]="loadError" emptyActionLabel="Retry" />`,
  },
  {
    key: 'selection',
    name: 'Row selection',
    details: 'Use a select-all checkbox in the header and one checkbox per selectable row.',
    html: `<j-table
  [value]="customers"
  [columns]="columns"
  selectionMode="checkbox"
  [(selection)]="selectedCustomers" />`,
  },
  {
    key: 'pagination',
    name: 'Pagination',
    details: 'Page local or server-backed rows without changing empty-state semantics.',
    html: `<j-table [value]="customers" [columns]="columns" paginator [rows]="3" />`,
  },
  {
    key: 'sorting',
    name: 'Sorting',
    details: 'Mark sortable columns and activate them with pointer or keyboard input.',
    html: `<j-table [value]="customers" [columns]="columns" sortField="outstandingBalance" [sortOrder]="-1" />`,
  },
  {
    key: 'filtering',
    name: 'Filtering',
    details: 'Use the reusable filter row and typed match-mode configuration.',
    html: `<j-table [value]="customers" [columns]="columns" filterDisplay="row" showGlobalFilter />`,
  },
  {
    key: 'tree-table',
    name: 'Tree Table',
    details: 'Use the separate tree grid for hierarchical records, expansion, and node selection.',
    html: `<j-tree-table [value]="treeNodes" [columns]="treeColumns" />`,
  },
  {
    key: 'lazy-tree-table',
    name: 'Lazy Tree Table',
    details: 'Load a node’s children on demand while preserving hierarchy and focus.',
    html: `<j-tree-table [value]="lazyTreeNodes" [columns]="treeColumns" lazy (nodeExpand)="loadChildren($event)" />`,
  },
  {
    key: 'accessibility',
    name: 'Accessibility and keyboard',
    details:
      'Tables expose semantic headers and sort state; Tree Table exposes tree-grid level, selection, and expansion state.',
    html: `<j-table [value]="customers" [columns]="columns" caption="Customers awaiting review" selectionMode="checkbox" />`,
  },
  {
    key: 'composition',
    name: 'Composition',
    details:
      'Column metadata, empty content, and loading content are integrated Table capabilities.',
    html: `<j-table [value]="customers" [columns]="columns" loadingVariant="skeleton">
  <ng-template jTableEmpty let-state>{{ state }}</ng-template>
  <ng-template jTableLoading let-variant>{{ variant }}</ng-template>
</j-table>`,
  },
] as const;

const IMPORTANT_TABLE_FEATURE_KEYS = new Set([
  'basic',
  'sorting',
  'pagination',
  'selection',
  'filtering-inline-column-filters',
  'filtering-popup-menu-filters',
  'filtering-filters-above-table',
  'actions-row-action-buttons',
]);

const TREE_TABLE_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Render a compact customer hierarchy with semantic tree-grid rows.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" ariaLabel="Customer hierarchy" />`,
  },
  {
    key: 'expansion',
    name: 'Expansion',
    details: 'Expand and collapse customer groups using pointer or keyboard controls.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" />`,
  },
  {
    key: 'controlled-expansion',
    name: 'Controlled Expansion',
    details: 'Own expanded row keys explicitly for programmatic hierarchy control.',
    html: `<j-tree-table
  [value]="customerHierarchy"
  [columns]="columns"
  [expandedKeys]="expandedKeys"
  (expandedKeysChange)="expandedKeys = $event"
/>`,
  },
  {
    key: 'lazy-children',
    name: 'Lazy Children',
    details: 'Request child customer records only when a parent row is opened.',
    html: `<j-tree-table
  [value]="lazyCustomerHierarchy"
  [columns]="columns"
  lazy
  (lazyLoad)="loadCustomerChildren($event)"
/>`,
  },
  {
    key: 'sorting',
    name: 'Sorting',
    details: 'Sort siblings while preserving their position inside the customer hierarchy.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="sortableColumns" />`,
  },
  {
    key: 'filtering',
    name: 'Filtering',
    details: 'Filter parent and child rows with one accessible customer search field.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" filter filterPlaceholder="Search customers" />`,
  },
  {
    key: 'single-selection',
    name: 'Single Selection',
    details: 'Select one customer hierarchy row at a time.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" selectionMode="single" />`,
  },
  {
    key: 'multiple-selection',
    name: 'Multiple Selection',
    details: 'Select several independent rows with explicit multiple-selection behavior.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" selectionMode="multiple" />`,
  },
  {
    key: 'checkbox-selection',
    name: 'Checkbox Selection',
    details: 'Propagate checkbox selection through customer parent and child rows.',
    html: `<j-tree-table
  [value]="customerHierarchy"
  [columns]="columns"
  selectionMode="checkbox"
  propagateSelectionDown
  propagateSelectionUp
/>`,
  },
  {
    key: 'custom-template',
    name: 'Custom Template',
    details: 'Format the customer type column without replacing tree-grid semantics.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns">
  <ng-template jTreeTableCell="type" let-value="value">
    <strong>{{ value }}</strong>
  </ng-template>
</j-tree-table>`,
  },
  {
    key: 'empty',
    name: 'Empty',
    details: 'Explain that no customer hierarchy records are available.',
    html: `<j-tree-table [value]="[]" [columns]="columns" emptyMessage="No customer records found." />`,
  },
  {
    key: 'keyboard',
    name: 'Keyboard Navigation',
    details: 'Use arrow keys to move, expand, collapse, and select hierarchy rows.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" ariaLabel="Keyboard-navigable customer hierarchy" />`,
  },
  {
    key: 'rtl',
    name: 'RTL',
    details: 'Verify hierarchy indentation and controls in a right-to-left context.',
    html: `<div dir="rtl">
  <j-tree-table [value]="customerHierarchy" [columns]="columns" ariaLabel="RTL customer hierarchy" />
</div>`,
  },
  {
    key: 'accessibility',
    name: 'Accessibility',
    details:
      'Provide a clear name while retaining row level, expansion, selection, and sort state.',
    html: `<j-tree-table [value]="customerHierarchy" [columns]="columns" ariaLabel="Customer account hierarchy" />`,
  },
] as const;

const TEXT_EXPAND_FEATURE_EXAMPLES = [
  {
    key: 'characters',
    name: 'Character limit',
    details: 'Shorten prose without splitting the final visible word.',
    html: `<j-text-expand [text]="productDescription" [collapsedLength]="120" />`,
  },
  {
    key: 'lines',
    name: 'Line limit',
    details: 'Clamp responsive content by its rendered line count.',
    html: `<j-text-expand [text]="productDescription" mode="lines" [collapsedLines]="3" />`,
  },
  {
    key: 'labels',
    name: 'Custom labels',
    details: 'Use labels that match the surrounding product language.',
    html: `<j-text-expand [text]="comment" showMoreLabel="Read comment" showLessLabel="Collapse comment" />`,
  },
  {
    key: 'expanded',
    name: 'Initially expanded',
    details: 'Start open when the full content is initially important.',
    html: `<j-text-expand [text]="productDescription" [expanded]="true" />`,
  },
  {
    key: 'short',
    name: 'Short text',
    details: 'No toggle is rendered when all text already fits.',
    html: `<j-text-expand text="Ready to publish." />`,
  },
  {
    key: 'dynamic',
    name: 'Dynamic update',
    details: 'The visible result recalculates when input text changes.',
    html: `<j-text-expand [text]="dynamicSummary" [collapsedLength]="90" />`,
  },
  {
    key: 'responsive',
    name: 'Responsive card content',
    details: 'Line mode responds to card width changes.',
    html: `<j-card header="Release summary"><j-text-expand [text]="productDescription" mode="lines" [collapsedLines]="2" /></j-card>`,
  },
  {
    key: 'product',
    name: 'Product description',
    details: 'Keep product grids scannable while preserving full details.',
    html: `<j-text-expand [text]="productDescription" [collapsedLength]="100" />`,
  },
  {
    key: 'comment',
    name: 'Reviewer note',
    details: 'Collapse long discussion content in event streams.',
    html: `<j-text-expand [text]="comment" [collapsedLength]="80" />`,
  },
  {
    key: 'policy',
    name: 'Policy summary',
    details: 'Show a concise summary while keeping the complete text available.',
    html: `<j-text-expand [text]="policySummary" mode="lines" [collapsedLines]="3" />`,
  },
  {
    key: 'projected',
    name: 'Projected content',
    details: 'Use line mode for safe projected Angular content.',
    html: `<j-text-expand mode="lines" [collapsedLines]="2"><strong>Release note:</strong> {{ projectedSummary }}</j-text-expand>`,
  },
  {
    key: 'motion',
    name: 'Animation disabled',
    details: 'Disable transitions explicitly in addition to automatic reduced-motion support.',
    html: `<j-text-expand [text]="productDescription" [animation]="false" />`,
  },
] as const;

const BUTTON_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic buttons',
    details: 'Use a clear verb for the primary action.',
    html: `<j-button label="Apply updates" (onClick)="save()" />`,
  },
  {
    key: 'severity',
    name: 'Severity intents',
    details: 'Communicate action intent independently from surface treatment.',
    html: `<j-button label="Primary" /><j-button label="Success" severity="success" /><j-button label="Info" severity="info" /><j-button label="Warning" severity="warning" /><j-button label="Danger" severity="danger" /><j-button label="Help" severity="help" /><j-button label="Contrast" severity="contrast" />`,
  },
  {
    key: 'outline',
    name: 'Outlined buttons',
    details: 'Use outline for supporting actions with visible boundaries.',
    html: `<j-button label="Export" variant="outlined" />`,
  },
  {
    key: 'text',
    name: 'Text buttons',
    details: 'Use text treatment for low-emphasis actions.',
    html: `<j-button label="Learn more" variant="text" />`,
  },
  {
    key: 'link',
    name: 'Link-style buttons',
    details: 'Use link treatment for action semantics presented inline.',
    html: `<j-button label="Open summary" variant="link" />`,
  },
  {
    key: 'raised',
    name: 'Raised buttons',
    details: 'Add restrained elevation when an action must stand above a busy surface.',
    html: `<j-button label="Create project" variant="solid" />`,
  },
  {
    key: 'pill',
    name: 'Rounded and pill',
    details: 'Use pill shape for compact filters and friendly calls to action.',
    html: `<j-button label="Follow" shape="pill" /><j-button label="Next" shape="rounded" />`,
  },
  {
    key: 'icon-before',
    name: 'Icon before label',
    details: 'Place a familiar icon before the action label.',
    html: `<j-button label="Save" icon="save" />`,
  },
  {
    key: 'icon-after',
    name: 'Icon after label',
    details: 'Place a directional icon after navigation-oriented text.',
    html: `<j-button label="Continue" icon="arrow-right" iconPosition="right" />`,
  },
  {
    key: 'icon-only',
    name: 'Icon-only buttons',
    details: 'Always provide an accessible label.',
    html: `<j-button icon="settings" actionDisplay="icon" ariaLabel="Open settings" />`,
  },
  {
    key: 'loading',
    name: 'Loading buttons',
    details: 'Busy buttons prevent repeated activation and expose status.',
    html: `<j-button label="Saving" loading loadingLabel="Saving changes" />`,
  },
  {
    key: 'progress',
    name: 'Determinate progress',
    details: 'Expose upload progress without changing the button width or accessible name.',
    html: `<j-button label="Uploading" [progress]="64" progressState="running" progressLabel />`,
  },
  {
    key: 'progress-states',
    name: 'Progress outcomes',
    details: 'Use semantic success, error, and cancelled states after a task finishes.',
    html: `<j-button label="Uploaded" [progress]="100" progressState="success" />
<j-button label="Upload failed" [progress]="72" progressState="error" />
<j-button label="Cancelled" [progress]="38" progressState="cancelled" />`,
  },
  {
    key: 'disabled',
    name: 'Disabled buttons',
    details: 'Unavailable actions remain visible but cannot emit onClick.',
    html: `<j-button label="Publish" disabled />`,
  },
  {
    key: 'full-width',
    name: 'Full-width buttons',
    details: 'Use full width in narrow forms and mobile panels.',
    html: `<j-button label="Continue" width="full" />`,
  },
  {
    key: 'badge',
    name: 'Button with badge',
    details: 'Add a compact count without changing the action label.',
    html: `<j-button label="Notifications" icon="bell" [badge]="4" badgeAriaLabel="4 unread notifications" />`,
  },
  {
    key: 'group',
    name: 'Button group',
    details: 'Place related actions together with one clear primary action.',
    html: `<div class="j-preview-row"><j-button label="Save" /><j-button label="Preview" variant="outlined" /><j-button label="Cancel" variant="soft" /></div>`,
  },
  {
    key: 'form',
    name: 'Form submit and reset',
    details: 'Native types integrate with Angular and browser forms.',
    html: `<form (submit)="save()"><j-button label="Submit" type="submit" /><j-button label="Reset" type="reset" variant="soft" /></form>`,
  },
  {
    key: 'toolbar',
    name: 'Toolbar actions',
    details: 'Use compact treatments for repeated workspace commands.',
    html: `<j-toolbar><j-button label="New" icon="plus" /><j-button label="Export" variant="outlined" /><j-button icon="settings" actionDisplay="icon" ariaLabel="Toolbar settings" variant="soft" /></j-toolbar>`,
  },
  {
    key: 'destructive',
    name: 'Destructive confirmation',
    details: 'Reserve danger intent for the final destructive action.',
    html: `<j-button label="Delete project" severity="danger" />`,
  },
  {
    key: 'template',
    name: 'Custom content',
    details: 'Project concise content while retaining native button behavior.',
    html: `<j-button><strong>Approve</strong><span jButtonSuffix>⌘ Enter</span></j-button>`,
  },
] as const;

const SPEED_DIAL_FEATURE_EXAMPLES = [
  {
    key: 'linear',
    name: 'Customer quick actions',
    details: 'Reveal related customer actions from one compact trigger.',
    html: `<j-speed-dial [actions]="customerQuickActions" showLabels />`,
  },
  {
    key: 'circle',
    name: 'Circular actions',
    details: 'Distribute actions around a container-relative trigger.',
    html: `<j-speed-dial [actions]="customerQuickActions" type="circle" [radius]="58" />`,
  },
  {
    key: 'fixed',
    name: 'Fixed mobile action',
    details: 'Pin the trigger to the logical bottom-end corner and optionally add a mask.',
    html: `<j-speed-dial [actions]="customerQuickActions" fixed position="bottom-end" mask />`,
  },
  {
    key: 'custom-trigger',
    name: 'Custom trigger',
    details: 'Project a JRNG button while retaining the Speed Dial state and methods.',
    html: `<j-speed-dial [actions]="customerQuickActions">
  <ng-template jSpeedDialTrigger let-speedDial>
    <j-button label="Customer actions" (onClick)="speedDial.toggle()" />
  </ng-template>
</j-speed-dial>`,
  },
] as const;

const AVATAR_FEATURE_EXAMPLES = [
  ['initials', 'Initials avatar', `<j-avatar initials="AR" ariaLabel="Avery Reed" />`],
  ['character', 'Single character', `<j-avatar initials="A" ariaLabel="Avery" />`],
  [
    'icon',
    'Icon avatar',
    `<j-avatar ariaLabel="Unassigned user"><j-icon name="user" aria-hidden="true" /></j-avatar>`,
  ],
  [
    'image',
    'User image',
    `<j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" />`,
  ],
  ['circle', 'Circle shape', `<j-avatar initials="AR" ariaLabel="Avery Reed" />`],
  [
    'square',
    'Square shape',
    `<j-avatar initials="AR" ariaLabel="Avery Reed" shape="square" size="lg" />`,
  ],
  [
    'sizes',
    'Sizes',
    `<j-avatar initials="AR" ariaLabel="Avery Reed" size="sm" />
<j-avatar initials="AR" ariaLabel="Avery Reed" />
<j-avatar initials="AR" ariaLabel="Avery Reed" size="lg" />`,
  ],
  [
    'colors',
    'Custom colours',
    `<j-avatar initials="AR" ariaLabel="Avery Reed" style="--j-color-surface-subtle: var(--j-color-primary-soft); --j-color-text: var(--j-color-primary)" />`,
  ],
  [
    'status',
    'Presence status',
    `<j-avatar initials="AR" ariaLabel="Avery Reed, online" status="online" />
<j-avatar initials="MK" ariaLabel="Morgan Kim, away" status="away" />
<j-avatar initials="JL" ariaLabel="Jordan Lee, offline" status="offline" />`,
  ],
  [
    'badge',
    'Avatar with badge',
    `<span class="avatar-badge"><j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" /><j-badge value="4" severity="danger" /></span>`,
  ],
  [
    'profile',
    'Profile header',
    `<div class="profile"><j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" previewable /><div><strong>Avery Reed</strong><span>Product designer</span></div></div>`,
  ],
  [
    'comment',
    'Comment author',
    `<div class="comment"><j-avatar image="/assets/images/avatar-user-02.webp" label="Morgan Kim" /><div><strong>Morgan Kim</strong><span>Updated the release checklist.</span></div></div>`,
  ],
  [
    'fallback',
    'Image fallback',
    `<j-avatar image="/assets/avatars/missing.svg" label="Avery Reed" initials="AR" />`,
  ],
  [
    'clickable',
    'Clickable avatar',
    `<j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" previewable previewAriaLabel="Preview Avery Reed profile image" />`,
  ],
  [
    'zoom',
    'Zoomable avatar',
    `<j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" previewable />`,
  ],
  [
    'static',
    'Non-zoomable avatar',
    `<j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" />`,
  ],
].map(([key, name, html]) => ({
  key,
  name,
  details: `${name} in a realistic people or assignment context.`,
  html,
}));

const DATE_PICKER_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic date',
    details: 'Choose one date with a labelled, clearable input.',
    html: `<j-date-picker label="Due date" placeholder="Choose a date" [(ngModel)]="dueDate" />`,
  },
  {
    key: 'range',
    name: 'Date range and presets',
    details: 'Choose a start and end date or apply a reusable business range.',
    html: `<j-date-picker label="Reporting period" selectionMode="range" [presets]="datePresets" [(ngModel)]="pickerRange" />`,
  },
  {
    key: 'multiple',
    name: 'Multiple dates',
    details: 'Choose several non-contiguous dates in one control.',
    html: `<j-date-picker label="Available dates" selectionMode="multiple" [(ngModel)]="multipleDates" />`,
  },
  {
    key: 'constraints',
    name: 'Minimum and maximum dates',
    details: 'Restrict selection to an allowed booking window.',
    html: `<j-date-picker label="Booking date" [minDate]="bookingMinDate" [maxDate]="bookingMaxDate" [(ngModel)]="bookingDate" />`,
  },
  {
    key: 'disabled-dates',
    name: 'Disabled dates',
    details: 'Keep unavailable dates visible while preventing their selection.',
    html: `<j-date-picker label="Appointment" [disabledDates]="unavailableDates" [(ngModel)]="appointmentDate" />`,
  },
  {
    key: 'inline',
    name: 'Inline calendar',
    details: 'Keep the date grid visible for scheduling-focused layouts.',
    html: `<j-date-picker label="Schedule" inline [(ngModel)]="inlineDate" />`,
  },
  {
    key: 'time',
    name: 'Date and time',
    details: 'Collect a date and a 12-hour time in the same control.',
    html: `<j-date-picker label="Starts at" showTime hourFormat="12" [(ngModel)]="dateTimeValue" />`,
  },
  {
    key: 'month',
    name: 'Month picker',
    details: 'Select a month directly with the default MM-yyyy display format.',
    html: `<j-date-picker label="Billing month" view="month" [(ngModel)]="billingMonth" />`,
  },
  {
    key: 'month-custom',
    name: 'Custom month format',
    details: 'Customize month output with numeric, short-name, or full-name tokens.',
    html: `<j-date-picker label="Reporting month" view="month" dateFormat="MMM yyyy" [(ngModel)]="reportingMonth" />`,
  },
  {
    key: 'disabled',
    name: 'Disabled state',
    details: 'Disabled date pickers remain readable and cannot be edited.',
    html: `<j-date-picker label="Locked date" disabled [(ngModel)]="lockedDate" />`,
  },
] as const;

const CHECKBOX_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic checkbox',
    details: 'Bind one boolean choice with a clear visible label.',
    html: `<j-checkbox label="Send receipt" [(ngModel)]="receiptEnabled" />`,
  },
  {
    key: 'group',
    name: 'Checkbox group',
    details: 'Bind multiple checkbox values to one array.',
    html: `<j-checkbox name="interests" label="Design" value="design" [(ngModel)]="selectedInterests" />
<j-checkbox name="interests" label="Engineering" value="engineering" [(ngModel)]="selectedInterests" />
<j-checkbox name="interests" label="Research" value="research" [(ngModel)]="selectedInterests" />`,
  },
  {
    key: 'indeterminate',
    name: 'Indeterminate',
    details: 'Represent a partially selected child collection.',
    html: `<j-checkbox label="Select all projects" indeterminate />`,
  },
  {
    key: 'sizes',
    name: 'Sizes',
    details: 'Match checkbox density to its surrounding controls.',
    html: `<j-checkbox label="Small" size="sm" />
<j-checkbox label="Default" />
<j-checkbox label="Large" size="lg" />`,
  },
  {
    key: 'readonly',
    name: 'Read-only',
    details: 'Keep a checked value readable without allowing changes.',
    html: `<j-checkbox label="Verified by policy" readonly [(ngModel)]="policyVerified" />`,
  },
  {
    key: 'invalid',
    name: 'Invalid',
    details: 'Associate validation feedback with the checkbox.',
    html: `<j-checkbox label="Accept terms" required invalid error="Acceptance is required." />`,
  },
  {
    key: 'disabled',
    name: 'Disabled',
    details: 'Disabled checkboxes do not toggle or emit changes.',
    html: `<j-checkbox label="Managed by administrator" disabled [(ngModel)]="managedSetting" />`,
  },
] as const;

const EDITOR_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Rich text editor',
    details:
      'Format content with fonts, colour, lists, alignment, links, tables, media, word count, and fullscreen support.',
    html: `<j-editor
  label="Customer summary"
  placeholder="Write a customer summary"
  hint="Use the toolbar to format the document or insert media."
  showWordCount
  showCharacterCount
  showFullscreen
  stickyToolbar
  [(ngModel)]="editorValue"
/>`,
  },
  {
    key: 'html',
    name: 'View and edit HTML',
    details: 'Switch between the visual editor and sanitized HTML source using the code action.',
    html: `<j-editor
  label="Release notes"
  showSourceToggle
  showWordCount
  [(ngModel)]="editorHtmlValue"
/>`,
  },
  {
    key: 'media',
    name: 'Image upload and editing',
    details:
      'Upload or drop raster images, then select an image to resize, align, describe, or remove it.',
    html: `<j-editor
  label="Customer presentation"
  imageAccept="image/png,image/jpeg,image/webp,image/gif"
  [imageMaxFileSize]="5242880"
  minHeight="14rem"
  showSourceToggle
  [(ngModel)]="editorMediaValue"
/>`,
  },
] as const;

const ICON_FIELD_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Search field',
    details: 'Combine a search icon, clear action, and an independently bound input.',
    html: `<j-icon-field
  prefixIcon="search"
  clearable
  fullWidth
  ariaLabel="Project search"
  (clear)="iconFieldBasicSearch = ''"
>
  <j-input
    name="projectSearch"
    placeholder="Search projects"
    [(ngModel)]="iconFieldBasicSearch"
    width="full"
  />
</j-icon-field>`,
  },
  {
    key: 'disabled',
    name: 'Disabled field',
    details: 'The wrapper and projected input are disabled and use separate example state.',
    html: `<j-icon-field prefixIcon="lock" disabled fullWidth ariaLabel="Locked search">
  <j-input
    name="lockedSearch"
    disabled
    [(ngModel)]="iconFieldDisabledSearch"
    width="full"
  />
</j-icon-field>`,
  },
] as const;

const INPUT_GROUP_FEATURE_EXAMPLES = [
  {
    key: 'currency',
    name: 'Currency amount',
    details: 'Use text add-ons to communicate the expected currency format.',
    html: `<j-input-group prefixAddon="$" suffixAddon=".00" ariaLabel="Budget amount">
  <j-input name="budgetAmount" type="number" [(ngModel)]="groupBudget" />
</j-input-group>`,
  },
  {
    key: 'website',
    name: 'Website address',
    details: 'Keep protocol and domain context visible around an editable value.',
    html: `<j-input-group prefixAddon="https://" suffixAddon=".example.com" ariaLabel="Workspace URL">
  <j-input name="workspaceSlug" [(ngModel)]="workspaceSlug" />
</j-input-group>`,
  },
  {
    key: 'email',
    name: 'Email address',
    details: 'Combine an account name with a fixed organization domain.',
    html: `<j-input-group suffixAddon="@jrng.dev" fullWidth ariaLabel="Work email">
  <j-input name="emailAlias" [(ngModel)]="emailAlias" width="full" />
</j-input-group>`,
  },
  {
    key: 'comfortable',
    name: 'Comfortable spacing',
    details: 'Use separated controls when a compact joined treatment is not appropriate.',
    html: `<j-input-group prefixAddon="Qty" [compact]="false" ariaLabel="Order quantity">
  <j-input name="orderQuantity" type="number" [(ngModel)]="groupQuantity" />
</j-input-group>`,
  },
  {
    key: 'disabled',
    name: 'Disabled group',
    details: 'Disabled groups are inert and keep their value readable.',
    html: `<j-input-group prefixAddon="$" suffixAddon=".00" disabled ariaLabel="Locked amount">
  <j-input name="lockedAmount" disabled [ngModel]="1250" />
</j-input-group>`,
  },
] as const;

const COPY_BUTTON_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Copy text',
    details: 'Copy a plain value and announce success to assistive technology.',
    html: `<j-copy-button text="JRNG-2026" />`,
  },
  {
    key: 'labels',
    name: 'Custom labels',
    details: 'Adapt the idle and success messages to the copied content.',
    html: `<j-copy-button
  text="https://jrng.dev/components"
  label="Copy link"
  copiedLabel="Link copied"
  ariaLabel="Copy component link"
/>`,
  },
  {
    key: 'icon',
    name: 'Icon-only action',
    details: 'Use a concise action with a required accessible name.',
    html: `<j-copy-button text="npm install jrng-ui" icon="copy" iconOnly ariaLabel="Copy install command" />`,
  },
  {
    key: 'code',
    name: 'Inline code',
    details: 'Place a copy action next to a command or code token.',
    html: `<div class="j-copy-code">
  <code>npm install jrng-ui</code>
  <j-copy-button text="npm install jrng-ui" icon="copy" iconOnly ariaLabel="Copy install command" />
</div>`,
  },
  {
    key: 'disabled',
    name: 'Disabled',
    details: 'Disabled copy actions do not access the clipboard or emit events.',
    html: `<j-copy-button text="Unavailable token" disabled />`,
  },
] as const;

const RADIO_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Plan selection',
    details: 'Select one option from a named group with a shared model.',
    html: `<j-radio name="planChoice" label="Starter" value="starter" [(ngModel)]="plan" />
<j-radio name="planChoice" label="Pro" value="pro" [(ngModel)]="plan" />
<j-radio name="planChoice" label="Enterprise" value="enterprise" [(ngModel)]="plan" />`,
  },
  {
    key: 'sizes',
    name: 'Sizes',
    details: 'Match the radio size to compact, default, and spacious forms.',
    html: `<j-radio name="densityChoice" label="Small" value="small" size="sm" [(ngModel)]="radioSizeChoice" />
<j-radio name="densityChoice" label="Default" value="default" [(ngModel)]="radioSizeChoice" />
<j-radio name="densityChoice" label="Large" value="large" size="lg" [(ngModel)]="radioSizeChoice" />`,
  },
  {
    key: 'disabled',
    name: 'Disabled option',
    details: 'A disabled option cannot receive selection or emit a value change.',
    html: `<j-radio name="lockedChoice" label="Managed plan" value="managed" disabled [(ngModel)]="lockedPlan" />`,
  },
] as const;

const DATA_VIEW_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Product catalogue',
    details: 'Render meaningful item content with layout switching, sorting, and pagination.',
    html: `<j-data-view
  [value]="dataViewItems"
  layout="grid"
  sortField="name"
  [sortOptions]="dataViewSortOptions"
  [rows]="3"
  [paginator]="false"
>
  <ng-template #jDataViewItem let-item>
    <article class="j-data-view-card">
      <strong>{{ item.name }}</strong>
      <span>{{ item.category }}</span>
      <small>{{ item.owner }}</small>
    </article>
  </ng-template>
</j-data-view>`,
  },
] as const;

const TIMELINE_FEATURE_EXAMPLES = [
  {
    key: 'default',
    name: 'Project milestones',
    details: 'Show dated milestones in a conventional vertical timeline.',
    html: `<j-timeline [value]="timelineItems" ariaLabel="Project milestones" />`,
  },
  {
    key: 'activity',
    name: 'Activity feed',
    details: 'Use a compact activity treatment for audit and collaboration events.',
    html: `<j-timeline variant="activity" compact [value]="timelineItems" ariaLabel="Recent activity" />`,
  },
  {
    key: 'alternating',
    name: 'Alternating history',
    details: 'Alternate cards around the axis for editorial histories and release narratives.',
    html: `<j-timeline variant="alternating" [value]="timelineItems" ariaLabel="Release history" />`,
  },
  {
    key: 'horizontal',
    name: 'Horizontal timeline',
    details: 'Present a scrollable sequence for stages, journeys, and delivery phases.',
    html: `<j-timeline layout="horizontal" [value]="timelineItems" ariaLabel="Delivery stages" />`,
  },
  {
    key: 'collapsible',
    name: 'Collapsible details',
    details: 'Let keyboard and pointer users expand or collapse long event descriptions.',
    html: `<j-timeline collapsible [value]="timelineItems" ariaLabel="Order updates" />`,
  },
] as const;

const VIRTUAL_SCROLLER_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Windowed list',
    details: 'Render only the visible slice of a large collection.',
    html: `<j-virtual-scroller [items]="virtualItems" [itemSize]="40" [viewportItems]="5" height="12rem" />`,
  },
  {
    key: 'loading',
    name: 'Incremental loading threshold',
    details:
      'Keep loaded rows visible and show a loader when the remaining rows reach the threshold.',
    html: `<j-virtual-scroller
  [items]="virtualItems"
  [itemSize]="40"
  [viewportItems]="5"
  [loadingThreshold]="100"
  loading
  loadingLabel="Loading more records"
  height="12rem"
/>`,
  },
] as const;

const ACCORDION_HEADER_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Text header',
    details: 'Use a concise heading that describes the associated region.',
    html: `<j-accordion value="account">
  <j-accordion-panel value="account">
    <j-accordion-header>Account details</j-accordion-header>
    <j-accordion-content>Update profile and contact information.</j-accordion-content>
  </j-accordion-panel>
</j-accordion>`,
  },
  {
    key: 'rich',
    name: 'Rich header',
    details: 'Compose status and supporting text inside the projected header.',
    html: `<j-accordion value="billing">
  <j-accordion-panel value="billing">
    <j-accordion-header>
      <span>Billing settings</span>
      <j-badge value="Required" severity="warning" />
    </j-accordion-header>
    <j-accordion-content>Choose invoice and payment preferences.</j-accordion-content>
  </j-accordion-panel>
</j-accordion>`,
  },
  {
    key: 'disabled',
    name: 'Disabled header',
    details: 'A disabled panel header remains readable but cannot toggle.',
    html: `<j-accordion>
  <j-accordion-panel value="managed" disabled>
    <j-accordion-header>Managed by administrator</j-accordion-header>
    <j-accordion-content>This section is unavailable.</j-accordion-content>
  </j-accordion-panel>
</j-accordion>`,
  },
] as const;

const ACCORDION_CONTENT_FEATURE_EXAMPLES = [
  {
    key: 'text',
    name: 'Text content',
    details: 'Present readable supporting content with consistent spacing.',
    html: `<j-accordion value="summary">
  <j-accordion-panel value="summary">
    <j-accordion-header>Project summary</j-accordion-header>
    <j-accordion-content>
      <p>The release is on schedule and all required checks have passed.</p>
    </j-accordion-content>
  </j-accordion-panel>
</j-accordion>`,
  },
  {
    key: 'form',
    name: 'Form content',
    details: 'Accordion content can contain accessible JRNG form controls and actions.',
    html: `<j-accordion value="profile">
  <j-accordion-panel value="profile">
    <j-accordion-header>Profile settings</j-accordion-header>
    <j-accordion-content>
      <j-input label="Display name" value="Avery Reed" />
      <j-button label="Save profile" />
    </j-accordion-content>
  </j-accordion-panel>
</j-accordion>`,
  },
] as const;

const DIVIDER_FEATURE_EXAMPLES = [
  {
    key: 'horizontal',
    name: 'Horizontal divider',
    details: 'Separate stacked content with the default horizontal rule.',
    html: `<span>Profile details</span>
<j-divider />
<span>Notification preferences</span>`,
  },
  {
    key: 'vertical',
    name: 'Vertical divider',
    details: 'Separate actions or compact columns within a horizontal layout.',
    html: `<div class="j-divider-row">
  <j-button label="Preview" variant="text" />
  <j-divider layout="vertical" />
  <j-button label="Publish" variant="text" />
</div>`,
  },
  {
    key: 'label',
    name: 'Divider with label',
    details: 'Place a text label at the start, center, or end of the separator.',
    html: `<j-divider text="Advanced settings" position="start" />`,
  },
  {
    key: 'styles',
    name: 'Line styles',
    details: 'Choose solid, dashed, dotted, or double lines.',
    html: `<j-divider lineStyle="solid" />
<j-divider lineStyle="dashed" />
<j-divider lineStyle="dotted" />
<j-divider lineStyle="double" />`,
  },
  {
    key: 'strength',
    name: 'Strength and spacing',
    details: 'Tune visual emphasis and surrounding whitespace.',
    html: `<j-divider strength="subtle" spacing="compact" />
<j-divider strength="strong" spacing="spacious" />`,
  },
] as const;

const SPLITTER_FEATURE_EXAMPLES = [
  {
    key: 'invoice',
    name: 'Invoice comparison',
    details: 'Resize standard invoice rows beside the editable final preview.',
    html: `<j-splitter styleClass="j-doc-splitter" [snapPoints]="[30, 50, 70]">
  <j-splitter-panel [size]="40" [minSize]="25">
    <section class="j-splitter-demo-panel"><strong>Standard invoice rows</strong></section>
  </j-splitter-panel>
  <j-splitter-panel [size]="60" [minSize]="30">
    <section class="j-splitter-demo-panel"><strong>Final invoice preview</strong></section>
  </j-splitter-panel>
</j-splitter>`,
  },
  {
    key: 'vertical',
    name: 'Vertical workspace',
    details: 'Resize stacked editor and preview regions.',
    html: `<j-splitter orientation="vertical" styleClass="j-doc-splitter j-doc-splitter--vertical">
  <j-splitter-panel [size]="45"><section class="j-splitter-demo-panel">Editor</section></j-splitter-panel>
  <j-splitter-panel [size]="55"><section class="j-splitter-demo-panel">Preview</section></j-splitter-panel>
</j-splitter>`,
  },
  {
    key: 'readonly',
    name: 'Read-only sizes',
    details: 'Keep the panel arrangement visible while preventing resizing.',
    html: `<j-splitter readOnly styleClass="j-doc-splitter">
  <j-splitter-panel [size]="35"><section class="j-splitter-demo-panel">Navigation</section></j-splitter-panel>
  <j-splitter-panel [size]="65"><section class="j-splitter-demo-panel">Content</section></j-splitter-panel>
</j-splitter>`,
  },
] as const;

const SPLITTER_PANEL_FEATURE_EXAMPLES = [
  {
    key: 'sizes',
    name: 'Panel size constraints',
    details: 'Set initial, minimum, and maximum sizes for each panel.',
    html: `<j-splitter styleClass="j-doc-splitter">
  <j-splitter-panel [size]="30" [minSize]="20" [maxSize]="45">
    <section class="j-splitter-demo-panel">Filters</section>
  </j-splitter-panel>
  <j-splitter-panel [size]="70" [minSize]="55" [maxSize]="80">
    <section class="j-splitter-demo-panel">Results</section>
  </j-splitter-panel>
</j-splitter>`,
  },
] as const;

const STEPPER_FEATURE_EXAMPLES = [
  {
    key: 'default',
    name: 'Default stepper',
    details: 'Use card-style steps for short interactive workflows.',
    html: `<j-stepper [items]="stepperItems" [activeIndex]="1" />`,
  },
  {
    key: 'rail',
    name: 'Connected rail',
    details: 'Show progress along a connected wizard path without an active-card outline.',
    html: `<j-stepper variant="rail" [items]="stepperItems" [activeIndex]="1" />`,
  },
  {
    key: 'progress',
    name: 'Compact progress',
    details: 'Use a compact segmented treatment inside forms and panels.',
    html: `<j-stepper variant="progress" [items]="stepperItems" [activeIndex]="1" />`,
  },
  {
    key: 'vertical',
    name: 'Vertical steps',
    details: 'Stack steps for narrow layouts and longer descriptions.',
    html: `<j-stepper orientation="vertical" variant="rail" [items]="stepperItems" [activeIndex]="1" />`,
  },
  {
    key: 'linear',
    name: 'Linear workflow',
    details: 'Prevent users from skipping beyond the next available step.',
    html: `<j-stepper linear [items]="stepperItems" [activeIndex]="0" />`,
  },
  {
    key: 'disabled',
    name: 'Disabled stepper',
    details: 'Disable all navigation while keeping workflow status readable.',
    html: `<j-stepper disabled [items]="stepperItems" [activeIndex]="1" />`,
  },
] as const;

const CAROUSEL_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Image carousel',
    details: 'Navigate a labelled image collection with buttons, indicators, or the arrow keys.',
    html: `<j-carousel [value]="carouselItems" ariaLabel="Travel highlights" />`,
  },
  {
    key: 'multiple',
    name: 'Multiple visible items',
    details: 'Show two cards at a time while moving through the collection one card at a time.',
    html: `<j-carousel [value]="carouselItems" [visibleItems]="2" ariaLabel="Travel highlights" />`,
  },
  {
    key: 'autoplay',
    name: 'Autoplay with pause',
    details: 'Advance automatically and pause while the pointer rests over the carousel.',
    html: `<j-carousel [value]="carouselItems" autoplay [interval]="3000" pauseOnHover ariaLabel="Travel highlights" />`,
  },
  {
    key: 'bounded',
    name: 'Bounded navigation',
    details: 'Stop at the first and last available positions instead of looping.',
    html: `<j-carousel [value]="carouselItems" [loop]="false" ariaLabel="Travel highlights" />`,
  },
  {
    key: 'minimal',
    name: 'Minimal controls',
    details: 'Hide controls or indicators when navigation is provided elsewhere.',
    html: `<j-carousel [value]="carouselItems" [controls]="false" [indicators]="false" ariaLabel="Travel highlights" />`,
  },
] as const;

const GALLERY_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Travel gallery',
    details: 'Browse the supplied gallery images with thumbnails and full-screen preview.',
    html: `<j-gallery [value]="galleryItems" />`,
  },
  {
    key: 'contained',
    name: 'Contained gallery',
    details: 'Place the gallery on a bordered surface for dense application layouts.',
    html: `<j-gallery [value]="galleryItems" variant="contained" animation="fade" />`,
  },
  {
    key: 'filmstrip',
    name: 'Filmstrip',
    details: 'Move thumbnails above the primary image for media-review workflows.',
    html: `<j-gallery [value]="galleryItems" variant="filmstrip" animation="slide" />`,
  },
  {
    key: 'hero',
    name: 'Hero gallery',
    details: 'Use a wide stage for destination and campaign imagery.',
    html: `<j-gallery [value]="galleryItems" variant="hero" animation="crossfade" />`,
  },
  {
    key: 'reduced',
    name: 'No animation',
    details: 'Disable transitions when immediate image changes are preferred.',
    html: `<j-gallery [value]="galleryItems" animation="none" />`,
  },
] as const;

const VIDEO_PLAYER_FEATURE_EXAMPLES = [
  {
    key: 'sample-one',
    name: 'Local video preview one',
    details: 'Play the first bundled MP4 with native controls and an accessible description.',
    html: `<j-video-player
  src="/assets/videos/sample-video-1.mp4"
  caption="Sample video 1"
  ariaLabel="Play sample video 1"
/>`,
  },
  {
    key: 'sample-two',
    name: 'Local video preview two',
    details: 'Play the second bundled MP4 in the responsive video player.',
    html: `<j-video-player
  src="/assets/videos/sample-video-2.mp4"
  caption="Sample video 2"
  ariaLabel="Play sample video 2"
/>`,
  },
  {
    key: 'sample-three',
    name: 'Local video preview three',
    details: 'Play the third bundled MP4 while preserving the native keyboard and media controls.',
    html: `<j-video-player
  src="/assets/videos/sample-video-3.mp4"
  caption="Sample video 3"
  ariaLabel="Play sample video 3"
/>`,
  },
] as const;

const HTML_PREVIEW_FEATURE_EXAMPLES = [
  {
    key: 'iframe',
    name: 'Isolated preview',
    details: 'Render sanitized markup inside a script-free iframe with working preview actions.',
    html: `<j-html-preview mode="iframe" device="desktop" [height]="260" [html]="previewHtml" />`,
  },
  {
    key: 'inline',
    name: 'Inline preview',
    details: 'Render trusted, sanitized markup inside the current document theme.',
    html: `<j-html-preview mode="inline" [height]="240" [html]="previewHtml" />`,
  },
  {
    key: 'mobile',
    name: 'Mobile viewport',
    details: 'Constrain the preview to a mobile device width while retaining horizontal safety.',
    html: `<j-html-preview mode="iframe" device="mobile" [height]="260" [html]="previewHtml" />`,
  },
  {
    key: 'loading',
    name: 'Loading state',
    details: 'Communicate asynchronous preview generation without rendering stale markup.',
    html: `<j-html-preview loading loadingMessage="Generating invoice preview…" />`,
  },
  {
    key: 'error',
    name: 'Error and empty states',
    details: 'Provide clear feedback when preview generation fails or produces no content.',
    html: `<j-html-preview error="The preview could not be generated." />`,
  },
] as const;

const LOADER_FEATURE_EXAMPLES = [
  ['basic', 'Loader types', `<j-loader type="spinner" label="Loading records" />`],
  ['spinner', 'Spinner', `<j-loader type="spinner" label="Loading" />`],
  ['dots', 'Dots', `<j-loader type="dots" label="Loading" />`],
  ['pulse', 'Pulse', `<j-loader type="pulse" label="Loading" />`],
  ['bars', 'Bars', `<j-loader type="bars" label="Loading" />`],
  ['ring', 'Ring', `<j-loader type="ring" label="Loading" />`],
  ['inline', 'Inline text loader', `<j-loader type="spinner" inline label="Loading" />`],
  ['button', 'Button loading', `<j-button label="Saving" loading loadingLabel="Saving record" />`],
  [
    'card',
    'Card loading',
    `<j-card header="Account summary"><j-loader type="spinner" inline label="Loading account summary" /></j-card>`,
  ],
  ['page', 'Full-page wait', `<j-loader type="spinner" label="Preparing content" />`],
  ['overlay', 'Overlay loading', `<j-loader type="spinner" overlay label="Loading workspace" />`],
  [
    'fullscreen',
    'Fullscreen loading',
    `<j-loader type="spinner" fullscreen label="Loading application" />`,
  ],
  [
    'determinate',
    'Determinate loader',
    `<j-loader type="ring" [value]="68" label="Upload progress" />`,
  ],
  ['size', 'Custom size', `<j-loader type="spinner" [size]="56" label="Loading" />`],
  ['label', 'Custom label', `<j-loader type="spinner" inline label="Loading customer profile" />`],
  ['motion', 'Reduced-motion behaviour', `<j-loader type="spinner" label="Loading" />`],
].map(([key, name, html]) => ({
  key,
  name,
  details: `${name} for an appropriate loading context.`,
  html,
}));

const CARD_FEATURE_EXAMPLES = [
  [
    'basic',
    'Basic content card',
    `<j-card header="Design review"><p>Review navigation and responsive behavior before release.</p></j-card>`,
  ],
  [
    'slots',
    'Header and footer',
    `<j-card header="Release plan" subheader="Version 0.1.1" footer="Updated today">All milestones are on track.</j-card>`,
  ],
  [
    'form',
    'Form card',
    `<j-card header="Workspace settings"><j-input label="Workspace name" value="Operations" /><j-button jCardActions label="Save" /></j-card>`,
  ],
  [
    'profile',
    'Profile card',
    `<j-card header="Avery Reed" subheader="Product designer"><j-avatar image="/assets/images/avatar-user-01.webp" label="Avery Reed" size="lg" /></j-card>`,
  ],
  [
    'product',
    'Product card',
    `<j-card header="Team plan" subheader="For growing teams"><strong>$24 / month</strong><j-button jCardActions label="Choose plan" /></j-card>`,
  ],
  [
    'pricing',
    'Pricing card',
    `<j-card header="Business" subheader="Advanced controls"><strong>$49 / month</strong><j-button jCardActions label="Start trial" /></j-card>`,
  ],
  [
    'metric',
    'Metric or KPI card',
    `<j-card header="Monthly revenue" subheader="Compared with last month"><strong>$84,250</strong><j-badge value="+12.4%" severity="success" /><j-progress-bar [value]="72" label="72% of target" /></j-card>`,
  ],
  [
    'trend',
    'Metric with change',
    `<j-card header="Active accounts"><strong>1,284</strong><j-badge value="+8.2%" severity="success" /></j-card>`,
  ],
  [
    'chart',
    'Metric with mini chart',
    `<j-card header="Weekly volume"><j-progress-bar [value]="64" label="64% of weekly target" /></j-card>`,
  ],
  [
    'progress',
    'Metric with progress',
    `<j-card header="Storage"><strong>72 GB of 100 GB</strong><j-progress-bar [value]="72" label="72% used" /></j-card>`,
  ],
  [
    'status',
    'Status summary',
    `<j-card header="Release status"><j-badge value="Ready" severity="success" /><p>All required checks passed.</p></j-card>`,
  ],
  [
    'clickable',
    'Clickable card',
    `<j-card header="Open project" subheader="Keyboard focusable" interactive><p>View project details.</p></j-card>`,
  ],
  ['loading', 'Loading card', `<j-card header="Loading report" skeleton />`],
  [
    'empty',
    'Empty card',
    `<j-card header="Saved views"><j-empty title="No saved views" description="Save a filter to reuse it here." variant="inline" /></j-card>`,
  ],
  [
    'error',
    'Error-state card',
    `<j-card header="Account summary"><j-empty title="Could not load summary" description="Try again in a moment." variant="inline" /></j-card>`,
  ],
  [
    'template',
    'Custom template card',
    `<j-card><div jCardHeader><strong>Custom header</strong></div><p>Projected card content.</p><j-button jCardActions label="Continue" /></j-card>`,
  ],
].map(([key, name, html]) => ({
  key,
  name,
  details: `${name} composed from Card slots and focused JRNG UI components.`,
  html,
}));

const CHART_FEATURE_EXAMPLES = [
  {
    key: 'bar',
    name: 'Bar chart',
    details: 'Compare values across discrete categories with a zero-based bar chart.',
    html: `<j-chart type="bar" [data]="monthlyCustomers" ariaLabel="Monthly customer growth" />`,
  },
  {
    key: 'line',
    name: 'Line chart',
    details: 'Show a time-series trend with accessible alternative text.',
    html: `<j-chart type="line" [data]="activeCustomers" ariaLabel="Daily active customers" />`,
  },
  {
    key: 'pie',
    name: 'Pie chart with outside labels',
    details: 'Add optional formatted labels and connector lines to a part-to-whole chart.',
    html: `<j-chart type="pie" [data]="customerSegments" [outsideLabels]="outsideLabelOptions" ariaLabel="Customer segments" />`,
  },
  {
    key: 'doughnut',
    name: 'Doughnut chart',
    details: 'Communicate a small part-to-whole comparison with clearly named segments.',
    html: `<j-chart type="doughnut" [data]="customerSegments" ariaLabel="Customer segments" />`,
  },
  {
    key: 'radar',
    name: 'Radar chart',
    details: 'Compare profiles across a shared set of dimensions.',
    html: `<j-chart type="radar" [data]="capabilityScores" ariaLabel="Capability comparison" />`,
  },
  {
    key: 'polar-area',
    name: 'Polar area chart',
    details: 'Compare category magnitude with equal-angle radial segments.',
    html: `<j-chart type="polarArea" [data]="channelOrders" ariaLabel="Orders by channel" />`,
  },
  {
    key: 'scatter',
    name: 'Scatter chart',
    details: 'Plot two numeric dimensions to show correlation and outliers.',
    html: `<j-chart type="scatter" [data]="campaignPoints" ariaLabel="Campaign cost and conversion" />`,
  },
  {
    key: 'bubble',
    name: 'Bubble chart',
    details: 'Use radius to add a third numeric dimension to x/y points.',
    html: `<j-chart type="bubble" [data]="campaignBubbles" ariaLabel="Campaign cost conversion and volume" />`,
  },
  {
    key: 'mixed',
    name: 'Mixed chart',
    details: 'Combine related volume and target series when they share the same horizontal scale.',
    html: `<j-chart type="mixed" [data]="revenueAndTarget" ariaLabel="Revenue and target" />`,
  },
] as const;

const BADGE_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Use a badge as a compact count or status indicator.',
    html: `<j-badge value="8" ariaLabel="8 unread messages" />`,
  },
  {
    key: 'severity',
    name: 'Severity',
    details: 'Communicate semantic states with the available severity colors.',
    html: `<j-badge value="Approved" severity="success" />
<j-badge value="Pending" severity="info" />
<j-badge value="Warning" severity="warning" />
<j-badge value="Rejected" severity="danger" />`,
  },
  {
    key: 'size',
    name: 'Sizes',
    details: 'Choose from extra-small through extra-large sizing.',
    html: `<j-badge value="XS" size="xs" />
<j-badge value="Small" size="sm" />
<j-badge value="Default" />
<j-badge value="Large" size="lg" />
<j-badge value="XLarge" size="xl" />`,
  },
  {
    key: 'overlay',
    name: 'Overlay',
    details: 'Position a count or dot on any relatively positioned element.',
    html: `<span class="badge-anchor">
  <j-button icon="message-square" actionDisplay="icon" ariaLabel="Notifications" />
  <j-badge value="4" severity="danger" overlay ariaLabel="4 notifications" />
</span>`,
  },
  {
    key: 'variants',
    name: 'Variants and icons',
    details: 'Combine solid, soft, and outlined treatments with optional icons.',
    html: `<j-badge value="Verified" icon="check" severity="success" />
<j-badge value="Draft" variant="soft" severity="secondary" />
<j-badge value="Review" variant="outlined" severity="warning" />`,
  },
  {
    key: 'button',
    name: 'Button badges',
    details: 'Compose badges into actions for concise notification and message counts.',
    html: `<j-button label="Emails" [badge]="8" badgeAriaLabel="8 unread emails" />
<j-button label="Messages" icon="message-square" [badge]="2" badgeAriaLabel="2 unread messages" variant="outlined" />`,
  },
] as const;

const CHIP_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Represent compact entities and selections with a concise label.',
    html: `<j-chip label="Enterprise customer" />`,
  },
  {
    key: 'icon',
    name: 'Icons',
    details: 'Place a contextual icon before the chip label.',
    html: `<j-chip label="Technology" icon="settings" />
<j-chip label="Verified" icon="check" severity="success" />`,
  },
  {
    key: 'image',
    name: 'Images',
    details: 'Use an image to represent a person or other visual entity.',
    html: `<j-chip label="Avery Reed" image="/assets/images/avatar-user-01.webp" imageAlt="" />`,
  },
  {
    key: 'removable',
    name: 'Removable',
    details: 'Enable an accessible remove action with a customizable icon and label.',
    html: `<j-chip label="Angular" removable removeAriaLabel="Remove Angular" (remove)="removeFilter('Angular')" />`,
  },
  {
    key: 'custom',
    name: 'Custom content',
    details: 'Project custom content when a label and leading visual are not enough.',
    html: `<j-chip ariaLabel="Priority: urgent" severity="danger">🔥 <strong>Urgent</strong></j-chip>`,
  },
] as const;

const METER_GROUP_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Full-width meter group',
    details: 'Meter tracks occupy the full width available from their container.',
    html: `<j-meter-group [value]="storageSegments" />`,
  },
] as const;

const PROGRESS_BAR_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Determinate',
    details: 'Show measurable completion with a visible full-width track.',
    html: `<j-progress-bar [value]="64" label="64% complete" />`,
  },
  {
    key: 'labeled',
    name: 'Labeled',
    details: 'Display the percentage inside a taller progress track.',
    html: `<j-progress-bar [value]="72" variant="labeled" label="72% uploaded" />`,
  },
  {
    key: 'segmented',
    name: 'Segmented',
    details: 'Use segmented styling for milestones or staged workflows.',
    html: `<j-progress-bar [value]="80" variant="segmented" severity="success" label="4 of 5 steps" />`,
  },
  {
    key: 'indeterminate',
    name: 'Indeterminate',
    details: 'Indicate ongoing work when a completion value is unavailable.',
    html: `<j-progress-bar indeterminate label="Preparing export" />`,
  },
] as const;

const PROGRESS_SPINNER_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Use a status spinner for an operation with an unknown duration.',
    html: `<j-progress-spinner label="Loading customers" />`,
  },
  {
    key: 'sizes',
    name: 'Sizes',
    details: 'Scale the spinner to match inline, panel, and page loading contexts.',
    html: `<j-progress-spinner [size]="20" label="Loading" />
<j-progress-spinner [size]="40" label="Loading" />
<j-progress-spinner [size]="64" label="Loading" />`,
  },
  {
    key: 'stroke',
    name: 'Stroke width',
    details: 'Adjust the ring weight independently from its overall size.',
    html: `<j-progress-spinner [size]="56" [strokeWidth]="2" label="Loading report" />
<j-progress-spinner [size]="56" [strokeWidth]="6" label="Loading report" />`,
  },
] as const;

const SKELETON_FEATURE_EXAMPLES = [
  {
    key: 'text',
    name: 'Text',
    details: 'Reserve space for headings and body copy to reduce layout shift.',
    html: `<j-skeleton variant="text" width="45%" />
<j-skeleton variant="text" />
<j-skeleton variant="text" width="75%" />`,
  },
  {
    key: 'shapes',
    name: 'Shapes',
    details: 'Use avatar, button, rounded, and rectangular placeholders.',
    html: `<j-skeleton variant="avatar" />
<j-skeleton variant="button" width="7rem" />
<j-skeleton shape="rounded" width="8rem" height="4rem" />`,
  },
  {
    key: 'card',
    name: 'Card',
    details: 'Build a representative card loading state from grouped lines.',
    html: `<j-skeleton variant="card" />`,
  },
  {
    key: 'table',
    name: 'Table rows',
    details: 'Reserve a stable region for a collection of loading rows.',
    html: `<j-skeleton variant="table" [rows]="4" />`,
  },
  {
    key: 'animation',
    name: 'Animation',
    details: 'Choose wave, pulse, or static rendering while respecting reduced motion.',
    html: `<j-skeleton animation="wave" />
<j-skeleton animation="pulse" />
<j-skeleton [animated]="false" />`,
  },
] as const;

const SWIPE_ACTIONS_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Start and end actions',
    details: 'Reveal contextual actions from either edge of a complete list-row surface.',
    html: `<j-swipe-actions ariaLabel="Actions for Aster Labs">
  <ng-template jSwipeStartActions><j-button label="Activate" icon="check" severity="success" width="full" /></ng-template>
  <ng-template jSwipeContent>...</ng-template>
  <ng-template jSwipeEndActions><j-button label="Archive" icon="archive" severity="danger" width="full" /></ng-template>
</j-swipe-actions>`,
  },
  {
    key: 'keyboard',
    name: 'Keyboard control',
    details: 'Focus the row, use Left or Right to reveal actions, and Escape to close them.',
    html: `<j-swipe-actions ariaLabel="Keyboard actions for Aster Labs">...</j-swipe-actions>`,
  },
  {
    key: 'disabled',
    name: 'Disabled',
    details: 'Disable gesture and keyboard activation while retaining readable row content.',
    html: `<j-swipe-actions disabled ariaLabel="Actions unavailable for Aster Labs">...</j-swipe-actions>`,
  },
] as const;

const TAG_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic',
    details: 'Display a short categorical label or state.',
    html: `<j-tag label="Active" severity="success" />`,
  },
  {
    key: 'severity',
    name: 'Severity',
    details: 'Use semantic colors while keeping a visible text label.',
    html: `<j-tag label="Primary" severity="primary" />
<j-tag label="Success" severity="success" />
<j-tag label="Info" severity="info" />
<j-tag label="Warning" severity="warning" />
<j-tag label="Danger" severity="danger" />
<j-tag label="Contrast" severity="contrast" />`,
  },
  {
    key: 'size',
    name: 'Sizes',
    details: 'Scale tags from extra-small metadata to prominent labels.',
    html: `<j-tag label="Extra small" size="xs" />
<j-tag label="Small" size="sm" />
<j-tag label="Default" />
<j-tag label="Large" size="lg" />
<j-tag label="Extra large" size="xl" />`,
  },
  {
    key: 'rounded',
    name: 'Rounded',
    details: 'Use pill-shaped tags when they sit beside chips or compact filters.',
    html: `<j-tag label="Featured" severity="info" rounded />`,
  },
  {
    key: 'removable',
    name: 'Removable',
    details: 'Provide a specifically labelled remove action for editable tag collections.',
    html: `<j-tag label="Design" removable removeLabel="Remove Design" (remove)="removeTag('Design')" />`,
  },
] as const;

const WATERMARK_FEATURE_EXAMPLES = [
  {
    key: 'component',
    name: 'Component',
    details: 'Wrap a bounded content region with a non-interactive watermark layer.',
    html: `<j-watermark [text]="['CONFIDENTIAL', 'Aster Labs']" [opacity]="0.12">
  <j-card header="Customer summary">...</j-card>
</j-watermark>`,
  },
  {
    key: 'directive',
    name: 'Directive',
    details: 'Apply a repeating watermark directly to an existing surface without another wrapper.',
    html: `<div
  class="invoice-preview"
  [jWatermark]="['DRAFT', 'INV-2048']"
  [watermarkOpacity]="0.1">
  <h3>Invoice preview</h3>
  ...
</div>`,
  },
] as const;

const DIFF_VIEWER_FEATURE_EXAMPLES = [
  {
    key: 'object',
    name: 'Object comparison',
    details: 'Show unchanged, changed, added, and removed fields in one understandable comparison.',
    html: `<j-diff-viewer
  [before]="originalCustomer"
  [after]="updatedCustomer"
  ariaLabel="Customer record changes" />`,
    ts: `originalCustomer = { name: 'Aster Labs', status: 'Pending', owner: 'Avery', legacyId: 'CUS-18' };
updatedCustomer = { name: 'Aster Labs', status: 'Approved', owner: 'Morgan', region: 'West' };`,
  },
  {
    key: 'inline',
    name: 'Inline text',
    details: 'Compare multiline text in a compact before-to-after layout.',
    html: `<j-diff-viewer layout="inline" [before]="oldPolicy" [after]="newPolicy" ariaLabel="Policy text changes" />`,
  },
  {
    key: 'collapsed',
    name: 'Changed fields only',
    details: 'Collapse unchanged rows when reviewers only need actionable differences.',
    html: `<j-diff-viewer [before]="originalCustomer" [after]="updatedCustomer" collapseUnchanged />`,
  },
  {
    key: 'accessibility',
    name: 'Accessibility',
    details:
      'Give the comparison a specific accessible name; each row announces its field and state.',
    html: `<j-diff-viewer
  [before]="originalCustomer"
  [after]="updatedCustomer"
  ariaLabel="Changes to Aster Labs customer record" />`,
  },
] as const;

const ERROR_PAGE_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Full-width error page',
    details: 'Fill the available page region with a clear recovery action.',
    html: `<j-error-page code="500" title="Something went wrong" description="The page could not be loaded.">
  <j-button label="Try again" />
</j-error-page>`,
  },
  {
    key: 'animated',
    name: 'Animated error code',
    details:
      'Add a restrained bounce to the error code while respecting reduced-motion preferences.',
    html: `<j-error-page code="404" animation="bounce" codeColor="var(--j-color-info)" title="Page not found" />`,
  },
  {
    key: 'color',
    name: 'Custom code color',
    details: 'Match the error code emphasis to the context or product theme.',
    html: `<j-error-page code="403" codeColor="#7c3aed" title="Access denied" />`,
  },
  {
    key: 'split',
    name: 'Split recovery page',
    details: 'Use a split composition for high-emphasis server errors and recovery guidance.',
    html: `<j-error-page
  code="503"
  layout="split"
  animation="float"
  eyebrow="Service unavailable"
  title="We are reconnecting"
  description="The service is temporarily unavailable. Try again shortly.">
  <j-button label="Try again" />
  <j-button label="System status" variant="outlined" />
</j-error-page>`,
  },
  {
    key: 'minimal',
    name: 'Minimal not-found page',
    details: 'Use the compact treatment inside an application content area.',
    html: `<j-error-page
  code="404"
  layout="minimal"
  eyebrow="Not found"
  title="This page does not exist"
  codeColor="var(--j-color-info)" />`,
  },
] as const;

const MAINTENANCE_PAGE_FEATURE_EXAMPLES = [
  {
    key: 'default',
    name: 'Scheduled maintenance',
    details: 'A full-width branded maintenance view with an estimated recovery time.',
    html: `<j-maintenance-page
  title="Scheduled maintenance"
  description="We are upgrading the workspace to improve reliability."
  detail="Expected back at 04:30 UTC">
  <j-button label="View system status" variant="outlined" />
</j-maintenance-page>`,
  },
  {
    key: 'progress',
    name: 'Maintenance progress',
    details: 'Show an indeterminate progress treatment when work is actively underway.',
    html: `<j-maintenance-page
  animation="orbit"
  showProgress
  progressLabel="Database migration is in progress"
  detail="No action is required" />`,
  },
  {
    key: 'minimal',
    name: 'Minimal maintenance notice',
    details: 'Use the centered compact layout for a single application area.',
    html: `<j-maintenance-page
  variant="minimal"
  icon="↻"
  badge="Quick update"
  title="Back in a few minutes"
  animation="pulse" />`,
  },
  {
    key: 'status',
    name: 'Service status view',
    details: 'Use a low-height status panel with a custom operational color.',
    html: `<j-maintenance-page
  variant="status"
  icon="●"
  accentColor="#0ea5e9"
  badge="Database maintenance"
  title="Read-only mode"
  description="Viewing remains available while updates are paused." />`,
  },
] as const;

const CALENDAR_SCHEDULER_FEATURE_EXAMPLES = [
  {
    key: 'month',
    name: 'Month view',
    details: 'Review scheduled work with localized dates, spanning events, and overflow handling.',
    html: `<j-calendar-scheduler
  [events]="events"
  [activeDate]="activeDate"
  view="month"
  [maxEventsPerDay]="2" />`,
  },
  {
    key: 'week',
    name: 'Working week',
    details: 'Hide weekends and start the schedule on Monday for business workflows.',
    html: `<j-calendar-scheduler
  [events]="events"
  [activeDate]="activeDate"
  view="week"
  [firstDayOfWeek]="1"
  [showWeekends]="false" />`,
  },
  {
    key: 'day',
    name: 'Day view',
    details: 'Focus on one day while retaining event time, title, and accessible details.',
    html: `<j-calendar-scheduler [events]="events" [activeDate]="activeDate" view="day" />`,
  },
  {
    key: 'agenda',
    name: 'Agenda view',
    details: 'Present events as a readable chronological list with locations and categories.',
    html: `<j-calendar-scheduler [events]="events" [activeDate]="activeDate" view="agenda" />`,
  },
  {
    key: 'locale',
    name: 'Locale and 24-hour time',
    details: 'Customize locale, first weekday, weekend visibility, and time convention.',
    html: `<j-calendar-scheduler
  [events]="events"
  [activeDate]="activeDate"
  locale="en-GB"
  [firstDayOfWeek]="1"
  [hour12]="false" />`,
  },
] as const;

const SCHEDULER_FEATURE_EXAMPLE_DEFINITIONS = [
  [
    'basic',
    'Basic Scheduler',
    'A controlled month schedule with application-owned events.',
    'view="month"',
  ],
  ['month', 'Month View', 'Seven-column month planning with multi-day overflow.', 'view="month"'],
  [
    'month-drag',
    'Month Drag and Drop',
    'Move an event to another date through an immutable controlled proposal.',
    'view="month" editable',
  ],
  [
    'multi-month',
    'Multi-Month Year',
    'Scan twelve responsive mini-months beginning at the active month.',
    'view="multiMonth"',
  ],
  [
    'week',
    'Week View',
    'A scrollable timed week with deterministic overlap placement.',
    'view="week"',
  ],
  ['day', 'Day View', 'A focused timed day for dense appointment workflows.', 'view="day"'],
  [
    'work-week',
    'Work Week',
    'Show Monday through Friday while retaining the complete configured time range.',
    'view="workWeek"',
  ],
  [
    'thirty-minute-slots',
    'Thirty-Minute Slots',
    'Render the complete day with one selectable row per thirty-minute interval.',
    'view="week" slotDuration="00:30"',
  ],
  [
    'custom-three-day',
    'Custom Three-Day View',
    'Register an application-defined three-day time-grid range.',
    'view="custom" [customViews]="customViews" customViewId="three-day"',
  ],
  [
    'custom-resource-timeline',
    'Custom Resource Timeline',
    'Register a two-day resource timeline with forty-five-minute slots without changing the root view registry.',
    'view="custom" [customViews]="customViews" customViewId="operations-window"',
  ],
  ['agenda', 'Agenda View', 'A responsive document-style list grouped by date.', 'view="agenda"'],
  [
    'month-agenda',
    'Month Agenda',
    'List the active month in date-grouped document flow.',
    'view="monthAgenda"',
  ],
  ['year', 'Year View', 'Twelve keyboard-accessible mini-months.', 'view="year"'],
  ['timeline-day', 'Timeline Day', 'A horizontally scrollable day axis.', 'view="timelineDay"'],
  ['timeline-week', 'Timeline Week', 'A virtualizable week axis.', 'view="timelineWeek"'],
  [
    'timeline-interactions',
    'Timeline Drag and Resize',
    'Move or resize timeline events with pointer gestures or Alt+Arrow keyboard controls and change horizontal zoom.',
    'view="timelineWeek" editable [(timelineZoom)]="zoom"',
  ],
  ['timeline-month', 'Timeline Month', 'Long-running work across a month.', 'view="timelineMonth"'],
  [
    'timeline-year',
    'Timeline Year',
    'Operational planning across quarters and a year.',
    'view="timelineYear"',
  ],
  [
    'timeline-quarter',
    'Timeline Quarter',
    'Plan across the active calendar quarter with the shared timeline renderer.',
    'view="timelineQuarter"',
  ],
  [
    'working-days',
    'Working Days',
    'Limit visible week columns to working days.',
    'view="week" [daysOfWeek]="[1,2,3,4,5]"',
  ],
  [
    'business-hours',
    'Business Hours',
    'Shade global and resource-specific working and availability windows, and constrain them when configured.',
    'view="resourceWeek" [businessHours]="hours" [availability]="availability" showBusinessHours',
  ],
  [
    'all-day',
    'All-Day Events',
    'Display all-day commitments separately from timed work.',
    'view="week"',
  ],
  ['multi-day', 'Multi-Day Events', 'Keep one visual span across adjacent dates.', 'view="month"'],
  [
    'background-events',
    'Background Events',
    'Render availability and inverse-background ranges behind interactive events.',
    'view="week"',
  ],
  ['overlap', 'Overlapping Events', 'Place concurrent timed events side by side.', 'view="week"'],
  [
    'more',
    'More Events Popover',
    'Measure available row height automatically and keep dense month cells readable with keyboard-reachable overflow.',
    'view="month" maxEventsVisible="auto" showMorePopover',
  ],
  [
    'overflow-modes',
    'Month Overflow Modes',
    'Open dense dates in a popover, dialog, drawer, or expand the complete week inline.',
    'view="month" [maxEventsVisible]="2" [moreEventsMode]="overflowMode"',
  ],
  [
    'quick-info',
    'Event Quick Info',
    'Inspect and request edits without mutating controlled data.',
    'quickInfo',
  ],
  [
    'event-popover',
    'Event Popover',
    'Expose event details from click and keyboard activation.',
    'eventPopover',
  ],
  [
    'move-dialog',
    'Non-Drag Move Dialog',
    'Move one or many events by date, time and resource without requiring pointer drag.',
    'editable quickInfo',
  ],
  [
    'dialog-edit',
    'Create and Edit Dialog',
    'Use the optional JRNG Dialog and Reactive Forms editor, or replace it with an app-owned editor.',
    'editable builtInEditor',
  ],
  [
    'range-selection',
    'Date Range Selection',
    'Select by Shift+click, pointer drag, keyboard activation, or methods while the parent owns the typed range.',
    'selectable dateSelectionMode="dateRange" [(selectedRange)]="selectedRange"',
  ],
  [
    'drag-drop',
    'Drag and Drop',
    'Propose snapped immutable event changes.',
    'view="week" editable',
  ],
  [
    'cross-scheduler',
    'Drag Between Schedulers',
    'Transfer a validated event payload between independently controlled Scheduler instances.',
    'view="week" editable externalDrag externalDropEnabled',
  ],
  [
    'external-drop',
    'External Event Drop',
    'Convert external application data into a controlled Scheduler drop proposal.',
    'view="week" editable externalDropEnabled',
  ],
  [
    'resize',
    'Resize Events',
    'Resize either edge with pointer or keyboard controls, final persistence, validation, and a revert callback.',
    'view="day" [editableSettings]="{ resize: true, resizeFromStart: true }"',
  ],
  [
    'blocked',
    'Blocked Intervals',
    'Visualize unavailable time and reject invalid interactions.',
    'view="week"',
  ],
  [
    'recurring',
    'Recurring Events',
    'Expand recurrence only around the visible range.',
    'view="month"',
  ],
  [
    'recurrence-scope',
    'Recurrence Edit Scope',
    'Request occurrence, future, or whole-series scope.',
    'recurrenceEdit',
  ],
  [
    'recurrence-exceptions',
    'Recurrence Exceptions',
    'Exclude or modify one occurrence while preserving the source recurrence rule.',
    'view="month" recurrenceEdit',
  ],
  [
    'edit-occurrence',
    'Edit One Occurrence',
    'Create one immutable recurrence exception from the optional editor workflow.',
    'view="month" recurrenceEdit',
  ],
  [
    'edit-future',
    'Edit Future Occurrences',
    'Split a recurring series at a selected occurrence without materializing its history.',
    'view="month" recurrenceEdit',
  ],
  [
    'categories',
    'Event Categories',
    'Combine named category cues with readable colors.',
    'view="month"',
  ],
  [
    'event-selection',
    'Multi-Event Selection',
    'Select stable event IDs for application-owned bulk actions.',
    'eventSelection',
  ],
  [
    'clipboard',
    'Clipboard and Multi-Event Paste',
    'Copy or cut selected events and paste them while preserving their relative offsets.',
    'view="week" editable clipboardEnabled',
  ],
  [
    'undo-redo',
    'Undo and Redo',
    'Emit inverse controlled requests for accepted create, update, delete, move, resize, and paste operations.',
    'view="week" editable historyEnabled',
  ],
  [
    'context-menu',
    'Context Menu',
    'Request contextual actions for events, dates, resources, and slots.',
    'view="week"',
  ],
  [
    'flat-resources',
    'Flat Resources',
    'Compare independent people, rooms, or equipment.',
    'view="resourceWeek"',
  ],
  [
    'hierarchical-resources',
    'Hierarchical Resources',
    'Expand parent and child resource rows.',
    'view="resourceTimelineWeek" resourcesExpandable',
  ],
  [
    'resource-week',
    'Resource Week',
    'Schedule resource columns across a working week.',
    'view="resourceWeek"',
  ],
  [
    'multiple-resources',
    'Multiple Resource Assignment',
    'Render one shared event in every assigned resource lane.',
    'view="resourceWeek"',
  ],
  [
    'resource-dimensions',
    'Multiple Resource Dimensions',
    'Compose independent department and room dimensions into stable scheduling lanes.',
    'view="resourceWeek" [resourceDimensions]="dimensions"',
  ],
  [
    'resource-timeline',
    'Resource Timeline',
    'Keep the resource rail aligned with virtual timeline lanes.',
    'view="resourceTimelineWeek"',
  ],
  [
    'resource-timeline-interactions',
    'Resource Timeline Movement',
    'Move events across time and resource lanes with scroll-safe pointer math or Alt+Arrow controls.',
    'view="resourceTimelineWeek" editable',
  ],
  [
    'resource-reorder',
    'Resource Row Reorder',
    'Request pointer or Alt+Arrow resource reordering without mutating controlled resources.',
    'view="resourceTimelineWeek" resourceEditable',
  ],
  [
    'date-grouping',
    'Date Grouping',
    'Compare capacity in date-first layouts.',
    'view="dateWeek" groupByDate',
  ],
  [
    'resource-grouping',
    'Resource-First Grouping',
    'Order simultaneous resource lanes before their date columns.',
    'view="resourceWeek" groupByResource',
  ],
  [
    'resource-aggregate-columns',
    'Resource Aggregate Columns',
    'Show parent resource totals beside leaf scheduling lanes when operational comparison needs both.',
    'view="resourceWeek" resourceAggregateColumns',
  ],
  [
    'adaptive-resources',
    'Adaptive Mobile Resources',
    'Focus narrow screens on one valid resource.',
    'view="resourceWeek" adaptiveMode="always"',
  ],
  [
    'appointments',
    'Appointment Booking',
    'Render actionable availability as an overlay, grid treatment, indicator, or separate lane without committing bookings locally.',
    'view="day" [appointmentSlots]="slots" [appointmentDisplay]="displayMode"',
  ],
  [
    'capacity',
    'Capacity and Conflicts',
    'Announce overlap and resource-capacity violations.',
    'view="resourceWeek"',
  ],
  [
    'event-template',
    'Custom Event Template',
    'Render domain content through a typed event template.',
    'view="month"',
  ],
  [
    'resource-template',
    'Custom Resource Template',
    'Render resource identity through a typed template while preserving row activation and hierarchy controls.',
    'view="resourceTimelineWeek"',
  ],
  [
    'toolbar',
    'Custom Toolbar',
    'Compose independent header and footer toolbars with date, filters, search, print, export, navigation, and view controls.',
    '[headerToolbar]="headerToolbar" [footerToolbar]="footerToolbar" view="week"',
  ],
  [
    'cells-headers',
    'Custom Cells and Headers',
    'Customize semantic cells and headers with typed contexts.',
    'view="month"',
  ],
  ['locale', 'Locale', 'Format dates with a BCP 47 locale.', 'locale="en-GB"'],
  [
    'alternate-calendar',
    'Alternate Calendar Display',
    'Use an Intl-compatible display calendar without changing stored instants.',
    'calendar="indian"',
  ],
  [
    'time-format',
    'Time Format',
    'Use locale-aware 12-hour or 24-hour labels.',
    'locale="en-GB" view="week"',
  ],
  [
    'timezone',
    'Timezone',
    'Display instants in an IANA timezone without mutating values.',
    'timezone="UTC" displayTimezone="Europe/London"',
  ],
  [
    'rtl',
    'RTL',
    'Mirror time geometry, resource rails, keyboard direction, and toolbar alignment.',
    'rtl view="timelineWeek"',
  ],
  [
    'data-operations',
    'JSON/CSV/ICS Import and Export',
    'Parse to a merge preview before the application accepts imported records.',
    'view="agenda"',
  ],
  [
    'json-export',
    'JSON Import/Export',
    'Preview a versioned JSON document before merge.',
    'view="agenda"',
  ],
  [
    'ics-export',
    'ICS Import/Export',
    'Round-trip common iCalendar fields and recurrence.',
    'view="agenda"',
  ],
  [
    'excel-pdf',
    'Excel and PDF Export',
    'Generate native ZIP-based XLSX and a Scheduler PDF byte stream without commercial dependencies.',
    'view="agenda"',
  ],
  [
    'remote-range',
    'Remote Visible Ranges',
    'Request only the visible range with cancellable adjacent-range prefetch.',
    'view="week" remoteData remotePrefetch',
  ],
  ['print', 'Print', 'Print supported standard views without transient controls.', 'view="week"'],
  [
    'controlled',
    'Controlled State',
    'Own date, view, events, resources, filters, and selections in the application.',
    'view="week"',
  ],
  [
    'event-adapter',
    'Backend Event Adapter',
    'Render immutable application-specific records through one typed adapter without pre-transforming each data array.',
    '[eventData]="bookings" [eventAdapter]="bookingAdapter" view="week"',
  ],
  [
    'granular-editing',
    'Granular Editing Permissions',
    'Allow creation while independently blocking edits, deletion, drag, resize, and resource transfers.',
    'view="week" [editableSettings]="{ add: true, edit: false, remove: false, drag: false, resize: false }"',
  ],
  [
    'async-validation',
    'Async Server Validation',
    'Keep drag and keyboard move proposals pending until an asynchronous application guard accepts them.',
    'view="week" editable [eventChangeGuard]="validateMove"',
  ],
  [
    'readonly',
    'Readonly',
    'Allow navigation and inspection while preventing modifications.',
    'readonly quickInfo',
  ],
  [
    'disabled',
    'Disabled',
    'Remove interaction and focus reachability for disabled controls.',
    'disabled',
  ],
  [
    'responsive',
    'Responsive Scrolling',
    'Let the scheduler own the single interaction scroll surface.',
    'view="week"',
  ],
  [
    'keyboard',
    'Keyboard Navigation',
    'Navigate dates, slots, events, clipboard, history, and resizing without a pointer.',
    'view="week"',
  ],
  ['dark', 'Dark Mode', 'Use JRNG semantic Scheduler tokens on dark surfaces.', 'view="week"'],
  [
    'multi-month-stack',
    'Multi-Month Stack',
    'Stack responsive month blocks while preserving navigation and selection.',
    'view="multiMonth"',
  ],
  [
    'virtualized',
    'Virtualized Timeline',
    'Render only the visible horizontal interval plus overscan.',
    'view="timelineYear" timelineVirtualScroll',
  ],
] as const;

const SCHEDULER_FEATURE_EXAMPLES = SCHEDULER_FEATURE_EXAMPLE_DEFINITIONS.map(
  ([key, name, details, inputs]) => ({
    key,
    name,
    details,
    responsivePreview: key === 'adaptive-resources' || key === 'responsive',
    html: `<j-scheduler
  [events]="events"
  [resources]="resources"
  [categories]="categories"
  [date]="date"
  ${inputs}
  (dateChange)="date = $event"
  (viewChange)="view = $event"
  (eventChange)="reviewEventChange($event)" />`,
    ts: `date = new Date(2026, 6, 14);\nview: JSchedulerView = '${key.startsWith('timeline') ? `timeline${key.slice(8, 9).toUpperCase()}${key.slice(9)}` : key === 'basic' ? 'month' : key}';\nevents = createExampleEvents();\nresources = createExampleResources();\ncategories = createExampleCategories();`,
  }),
);

const SIDEBAR_FEATURE_EXAMPLES = [
  {
    key: 'sidebar',
    name: 'Sidebar',
    details: 'Use the standard persistent navigation surface with nested menu groups.',
    html: `<j-sidebar-nav [model]="navigationItems" activeKey="overview" />`,
  },
  {
    key: 'floating',
    name: 'Floating sidebar',
    details: 'Add an elevated rounded navigation surface inside spacious application layouts.',
    html: `<j-sidebar-nav variant="floating" [model]="navigationItems" />`,
  },
  {
    key: 'inset',
    name: 'Inset sidebar',
    details: 'Use a contained muted surface when navigation sits inside another layout panel.',
    html: `<j-sidebar-nav variant="inset" [model]="navigationItems" />`,
  },
  {
    key: 'icon',
    name: 'Icon collapse and hover',
    details: 'Collapse to an icon rail and optionally expand while the pointer is over it.',
    html: `<j-sidebar-nav
  [model]="navigationItems"
  collapseMode="icon"
  [collapsed]="true"
  openOnHover />`,
  },
  {
    key: 'offcanvas',
    name: 'Offcanvas overlay',
    details: 'Present dismissable navigation from either side with an optional backdrop.',
    html: `<j-sidebar-nav
  [model]="navigationItems"
  collapseMode="offcanvas"
  side="right"
  overlay
  backdrop
  [(collapsed)]="sidebarClosed" />`,
  },
] as const;

const SECTION_FOOTER_FEATURE_EXAMPLES = [
  {
    key: 'left',
    name: 'Left aligned',
    details: 'Align all projected footer content to the start of the section.',
    html: `<j-section-footer align="left">...</j-section-footer>`,
  },
  {
    key: 'center',
    name: 'Center aligned',
    details: 'Center related footer actions or supporting content.',
    html: `<j-section-footer align="center">...</j-section-footer>`,
  },
  {
    key: 'right',
    name: 'Right aligned',
    details: 'Align footer actions to the end of the section.',
    html: `<j-section-footer align="right">...</j-section-footer>`,
  },
] as const;

const GRID_FEATURE_EXAMPLES: Readonly<
  Record<string, readonly Omit<DetailFeatureExample, 'index'>[]>
> = {
  'grid-layout': [
    {
      key: 'responsive-cards',
      name: 'Responsive card grid',
      details: 'Set a maximum column count and a minimum useful card width.',
      html: `<j-grid-layout [columns]="3" minItemWidth="12rem">
  <j-card header="Design" />
  <j-card header="Build" />
  <j-card header="Ship" />
</j-grid-layout>`,
    },
    {
      key: 'dashboard',
      name: 'Dashboard tiles',
      details: 'Use a wider minimum when each tile contains a metric or visualization.',
      html: `<j-grid-layout [columns]="2" minItemWidth="16rem" gap="var(--j-spacing-5)">
  <j-card header="Revenue">...</j-card>
  <j-card header="Active users">...</j-card>
</j-grid-layout>`,
    },
    {
      key: 'interactive',
      name: 'Interactive dashboard',
      details:
        'Enable shared drag-drop reordering and constrained keyboard resizing only when needed.',
      html: `<j-grid-layout
  [(layout)]="customerDashboardLayout"
  [columns]="4"
  draggable
  resizable
  compact>
  <ng-template jGridLayoutItem let-tile>
    <button jGridLayoutDragHandle [attr.aria-label]="'Move ' + tile.title">Move</button>
    {{ tile.title }}
  </ng-template>
</j-grid-layout>`,
    },
    {
      key: 'responsive',
      name: 'Responsive layouts',
      details: 'Apply named controlled layouts from the application breakpoint strategy.',
      html: `<j-grid-layout
  [(layout)]="customerDashboardLayout"
  [responsiveLayouts]="customerResponsiveLayouts"
  [columns]="4" />`,
    },
  ],
  grid: [
    {
      key: 'container',
      name: 'Grid container',
      details: 'Grid owns the column system, page padding, and horizontal and vertical gaps.',
      html: `<j-grid gap="md">
  <j-row>
    <j-col size="12" md="8">Main</j-col>
    <j-col size="12" md="4">Aside</j-col>
  </j-row>
</j-grid>`,
    },
    {
      key: 'fixed',
      name: 'Fixed-width container',
      details: 'Constrain a page region to the standard responsive maximum widths.',
      html: `<j-grid fixed gap="lg">
  <j-row><j-col>Centered content</j-col></j-row>
</j-grid>`,
    },
  ],
  row: [
    {
      key: 'alignment',
      name: 'Alignment and distribution',
      details: 'Row controls wrapping, cross-axis alignment, and horizontal distribution.',
      html: `<j-row align="center" justify="between">
  <j-col size="auto">Project title</j-col>
  <j-col size="auto">Actions</j-col>
</j-row>`,
    },
    {
      key: 'wrapping',
      name: 'Wrapping content',
      details: 'Allow responsive columns to move to a new line without overflowing.',
      html: `<j-row gap="sm">
  <j-col size="12" sm="6">First</j-col>
  <j-col size="12" sm="6">Second</j-col>
</j-row>`,
    },
  ],
  col: [
    {
      key: 'responsive',
      name: 'Responsive spans',
      details: 'Start full width, then apply narrower spans at named breakpoints.',
      html: `<j-col size="12" sm="6" lg="4">Responsive column</j-col>`,
    },
    {
      key: 'offset',
      name: 'Offset and order',
      details: 'Reserve column space or change visual order at a specific breakpoint.',
      html: `<j-col size="12" lg="4" offsetLg="4" orderLg="last">Offset column</j-col>`,
    },
  ],
};

export const COMPONENT_PREVIEW_IMPORTS = [
  FormsModule,
  CodeBlockComponent,
  ButtonBasicDemoComponent,
  AvatarZoomDemoComponent,
  LoaderTypesDemoComponent,
  TextExpandBasicDemoComponent,
  CardMetricDemoComponent,
  TableScenarioHostComponent,
  JAccordionComponent,
  JAccordionContentComponent,
  JAccordionHeaderComponent,
  JAccordionPanelComponent,
  JAnchorComponent,
  JAutocompleteComponent,
  JAvatarComponent,
  JBadgeComponent,
  JBarcodeComponent,
  JBreadcrumbComponent,
  JButtonComponent,
  JCardComponent,
  JCascaderComponent,
  JChipComponent,
  JCheckboxComponent,
  JConfirmDialogComponent,
  JContainerComponent,
  JCopyButtonComponent,
  JCronExpressionComponent,
  JColorPickerComponent,
  JDataDisplayComponent,
  JDatePickerComponent,
  JDividerComponent,
  JDiffViewerComponent,
  JDialogComponent,
  JDrawerComponent,
  JEmptyComponent,
  JErrorPageComponent,
  JFieldsetComponent,
  JFilterBarComponent,
  JFileBrowserComponent,
  JFilePreviewComponent,
  JFileUploadComponent,
  JLabelComponent,
  JFormFieldComponent,
  JHighlightComponent,
  JHtmlPreviewComponent,
  JIconComponent,
  JIconFieldComponent,
  JInputGroupComponent,
  JInputMaskComponent,
  JInputNumberComponent,
  JInputOtpComponent,
  JInputComponent,
  JInplaceActionsDirective,
  JInplaceComponent,
  JInplaceContentDirective,
  JInplaceDisplayDirective,
  JListboxComponent,
  JLoaderComponent,
  JMaintenancePageComponent,
  JMenuComponent,
  JMeterGroupComponent,
  JMultiselectComponent,
  JPaginatorComponent,
  JPasswordComponent,
  JPanelComponent,
  JPopoverComponent,
  JPopoutComponent,
  JQueryBuilderComponent,
  JProgressBarComponent,
  JProgressSpinnerComponent,
  JPullToRefreshComponent,
  JRadioGroupComponent,
  JRadioComponent,
  JRatingComponent,
  JSelectComponent,
  JSelectButtonComponent,
  JSignatureComponent,
  JSpeechToTextButtonComponent,
  JSpeechToTextDirective,
  JSectionFooterComponent,
  JSectionHeaderComponent,
  JSkeletonComponent,
  JSparklineComponent,
  JSliderComponent,
  JSwitchComponent,
  JSwipeActionsComponent,
  JSwipeContentDirective,
  JSwipeEndActionsDirective,
  JSwipeStartActionsDirective,
  JTabComponent,
  JTabsComponent,
  JTagComponent,
  JToggleButtonComponent,
  JToolbarComponent,
  JTableComponent,
  JTableCellTemplateDirective,
  JTableEmptyTemplateDirective,
  JTableHeaderTemplateDirective,
  JActionMenuComponent,
  JColumnFilterComponent,
  JTextareaComponent,
  JTextExpandComponent,
  JTimelineComponent,
  JTooltipDirective,
  JTourStepDirective,
  JTourGuideComponent,
  JRippleDirective,
  JToastContainerComponent,
  JAppShellComponent,
  JBottomSheetComponent,
  JCalendarSchedulerComponent,
  JSchedulerComponent,
  JRecurrenceEditorComponent,
  JCarouselComponent,
  JChartComponent,
  JChipsComponent,
  JCommandPaletteComponent,
  JConfirmPopupComponent,
  JContextMenuComponent,
  JDataViewComponent,
  JDynamicDialogComponent,
  JEditorComponent,
  JGalleryComponent,
  JGanttComponent,
  JGridComponent,
  JGridRowComponent,
  JGridColumnComponent,
  JGridLayoutComponent,
  JGridLayoutDragHandleDirective,
  JGridLayoutItemTemplateDirective,
  JSpeedDialComponent,
  JSpeedDialTriggerDirective,
  JImageComponent,
  JKanbanComponent,
  JKnobComponent,
  JMegaMenuComponent,
  JMenubarComponent,
  JNotificationCenterComponent,
  JOrderListComponent,
  JOrgChartComponent,
  JSidebarNavComponent,
  JSplitterComponent,
  JSplitterPanelComponent,
  JSplitButtonComponent,
  JSplitButtonItemDirective,
  JStepperComponent,
  JTieredMenuComponent,
  JTimePickerComponent,
  JTransferListComponent,
  JTreeComponent,
  JTreeSelectComponent,
  JTreeSelectNodeDirective,
  JTreeSelectValueDirective,
  JTreeTableComponent,
  JTreeTableCellTemplateDirective,
  JVideoPlayerComponent,
  JVirtualScrollerComponent,
  JWatermarkComponent,
  JWatermarkDirective,
  JValidationMessageComponent,
  JCurrencyFormatPipe,
  JDateTimeFormatPipe,
  JFileSizeFormatPipe,
  JPercentFormatPipe,
  JTextTruncatePipe,
] as const;

@Directive()
export class ComponentDetailViewBase {
  readonly customerAnchorLinks: readonly JAnchorLink[] = [
    { id: 'customer-overview-preview', label: 'Overview' },
    { id: 'customer-contacts-preview', label: 'Contacts' },
    {
      id: 'customer-account-preview',
      label: 'Account',
      children: [{ id: 'customer-history-preview', label: 'History' }],
    },
  ];
  customerInplaceStatus = 'Active';
  customerInplaceDraft = 'Active';
  readonly splitButtonItems: readonly JMenuItem[] = [
    { label: 'Save and notify', icon: 'check', command: () => undefined },
    { separator: true },
    { label: 'Save as draft', icon: 'file', command: () => undefined },
    { label: 'Delete customer', icon: 'trash', disabled: true },
  ];
  readonly customerQuickActions: readonly JSpeedDialAction[] = [
    { id: 'edit', label: 'Edit customer', icon: 'file-text' },
    { id: 'email', label: 'Email customer', icon: 'message-square' },
    { id: 'archive', label: 'Archive customer', icon: 'archive' },
  ];
  customerDashboardLayout = [
    { id: 'profile', data: { title: 'Customer profile' }, column: 1, row: 1, columnSpan: 2 },
    { id: 'activity', data: { title: 'Recent activity' }, column: 3, row: 1 },
    { id: 'status', data: { title: 'Account status' }, column: 4, row: 1, locked: true },
  ];
  readonly customerResponsiveLayouts = {
    mobile: this.customerDashboardLayout.map((item, index) => ({
      ...item,
      column: 1,
      row: index + 1,
      columnSpan: 1,
    })),
  };
  customerSignature: JSignatureValue | null = null;
  readonly customerTree: readonly JTreeNode[] = [
    {
      key: 'technology',
      label: 'Technology',
      children: [
        { key: 'aster', label: 'Aster Labs', leaf: true },
        { key: 'northstar', label: 'Northstar Systems', leaf: true },
      ],
    },
    {
      key: 'healthcare',
      label: 'Healthcare',
      children: [{ key: 'willow', label: 'Willow Health', leaf: true }],
    },
  ];
  readonly customerLocations = [
    {
      label: 'Americas',
      value: 'americas',
      children: [
        {
          label: 'United States',
          value: 'us',
          children: [
            { label: 'Austin', value: 'austin' },
            { label: 'Seattle', value: 'seattle' },
          ],
        },
      ],
    },
    {
      label: 'Europe',
      value: 'europe',
      children: [
        {
          label: 'Germany',
          value: 'de',
          children: [{ label: 'Berlin', value: 'berlin' }],
        },
      ],
    },
  ];
  readonly cronPreviewFrom = new Date('2026-07-28T00:00:00Z');
  readonly queryBuilderFields: readonly JQueryField[] = [
    { key: 'customer', label: 'Customer', type: 'text' },
    { key: 'total', label: 'Order total', type: 'number' },
    { key: 'active', label: 'Active account', type: 'boolean' },
    { key: 'created', label: 'Created date', type: 'date' },
  ];
  readonly queryBuilderValue: JQueryGroup = jCreateQueryGroup('docs-query-root', 'and', [
    {
      ...jCreateQueryCondition('docs-query-customer', this.queryBuilderFields[0]),
      value: 'Acme',
    },
    jCreateQueryGroup('docs-query-nested', 'or', [
      {
        ...jCreateQueryCondition('docs-query-total', this.queryBuilderFields[1]),
        operator: 'greater-than',
        value: 1000,
      },
      {
        ...jCreateQueryCondition('docs-query-active', this.queryBuilderFields[2]),
        value: true,
      },
    ]),
  ]);
  readonly previewWidths = [
    { label: 'Full', width: null },
    { label: '320', width: 320 },
    { label: '375', width: 375 },
    { label: '768', width: 768 },
  ] as const;
  readonly previewWidth = signal<number | null>(null);
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly toast = inject(JToastService);
  private readonly confirmation = inject(JConfirmationService);
  private readonly dialogService = inject(JDialogService);
  private readonly tour = inject(JTourService);

  readonly doc = input.required<ComponentDoc>();
  readonly detailBreadcrumbItems = computed<readonly JBreadcrumbItem[]>(() => [
    { label: 'Components', routerLink: '/docs/components' },
    { label: this.doc().name },
  ]);
  readonly detailViewTab = signal<'features' | 'api'>('features');
  readonly activeContentsId = signal('component-import');

  priorityGuidance(): PriorityComponentGuidance | null {
    return priorityComponentGuidance[this.doc().slug] ?? null;
  }

  isGeneratedTableScenario(key: string): boolean {
    return TABLE_SCENARIO_COMPONENTS[key] != null;
  }
  readonly featureCodeTabs = signal<Readonly<Record<string, DetailCodeTab>>>({});
  readonly codeTabs: readonly { label: string; value: DetailCodeTab; icon?: JIconName }[] = [
    { label: 'HTML', value: 'html' },
    { label: 'TS', value: 'ts' },
    { label: 'SCSS', value: 'scss' },
    { label: 'Data', value: 'data', icon: 'database' },
  ];

  codeTabsFor(
    example: DetailFeatureExample,
  ): readonly { label: string; value: DetailCodeTab; icon?: JIconName }[] {
    return this.codeTabs.filter((tab) => tab.value !== 'scss' || Boolean(example.scss));
  }
  readonly featureExamples = computed<readonly DetailFeatureExample[]>(() => {
    const doc = this.doc();
    if (doc.slug === 'toast') {
      return this.withApiCoverage(
        doc,
        TOAST_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'table') {
      return [...TABLE_FEATURE_EXAMPLES, ...TABLE_SCENARIO_DOCS]
        .filter((example) => IMPORTANT_TABLE_FEATURE_KEYS.has(example.key))
        .map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'tree-table') {
      return this.withApiCoverage(
        doc,
        TREE_TABLE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'text-expand') {
      return this.withApiCoverage(
        doc,
        TEXT_EXPAND_FEATURE_EXAMPLES.map((example, index) =>
          example.key === 'characters'
            ? { ...example, index, ...demoSources['text-expand-basic-demo'] }
            : { ...example, index, responsivePreview: example.key === 'responsive' },
        ),
      );
    }
    if (doc.slug === 'button') {
      return this.withApiCoverage(
        doc,
        BUTTON_FEATURE_EXAMPLES.map((example, index) =>
          example.key === 'basic'
            ? { ...example, index, ...demoSources['button-basic-demo'] }
            : { ...example, index },
        ),
      );
    }
    if (doc.slug === 'speed-dial') {
      return this.withApiCoverage(
        doc,
        SPEED_DIAL_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'speech-to-text-button') {
      return this.withApiCoverage(doc, [
        {
          key: 'basic',
          name: 'Basic',
          details: 'Connect the dictation button to an editable JRNG input target.',
          index: 0,
          html: `<div class="j-preview-row">
  <j-input
    jSpeechToText
    #speech="jSpeechToText"
    label="Customer note"
    placeholder="Select dictate, then speak" />
  <j-speech-to-text-button [target]="speech" showLabel />
</div>`,
        },
      ]);
    }
    if (doc.slug === 'avatar') {
      return this.withApiCoverage(
        doc,
        AVATAR_FEATURE_EXAMPLES.map((example, index) =>
          example.key === 'zoom'
            ? { ...example, index, ...demoSources['avatar-zoom-demo'] }
            : { ...example, index },
        ),
      );
    }
    if (doc.slug === 'date-picker') {
      return this.withApiCoverage(
        doc,
        DATE_PICKER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'checkbox') {
      return this.withApiCoverage(
        doc,
        CHECKBOX_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'editor') {
      return this.withApiCoverage(
        doc,
        EDITOR_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'icon-field') {
      return this.withApiCoverage(
        doc,
        ICON_FIELD_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'input-group') {
      return this.withApiCoverage(
        doc,
        INPUT_GROUP_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'copy-button') {
      return this.withApiCoverage(
        doc,
        COPY_BUTTON_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'radio') {
      return this.withApiCoverage(
        doc,
        RADIO_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'data-view') {
      return this.withApiCoverage(
        doc,
        DATA_VIEW_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'timeline') {
      return this.withApiCoverage(
        doc,
        TIMELINE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'virtual-scroller') {
      return this.withApiCoverage(
        doc,
        VIRTUAL_SCROLLER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'accordion-header') {
      return this.withApiCoverage(
        doc,
        ACCORDION_HEADER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'accordion-content') {
      return this.withApiCoverage(
        doc,
        ACCORDION_CONTENT_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'divider') {
      return this.withApiCoverage(
        doc,
        DIVIDER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'splitter') {
      return this.withApiCoverage(
        doc,
        SPLITTER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'splitter-panel') {
      return this.withApiCoverage(
        doc,
        SPLITTER_PANEL_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'stepper') {
      return this.withApiCoverage(
        doc,
        STEPPER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'carousel') {
      return this.withApiCoverage(
        doc,
        CAROUSEL_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'gallery') {
      return this.withApiCoverage(
        doc,
        GALLERY_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'video-player') {
      return this.withApiCoverage(
        doc,
        VIDEO_PLAYER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'html-preview') {
      return this.withApiCoverage(
        doc,
        HTML_PREVIEW_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'loader') {
      return this.withApiCoverage(
        doc,
        LOADER_FEATURE_EXAMPLES.map((example, index) =>
          example.key === 'basic'
            ? { ...example, index, ...demoSources['loader-types-demo'] }
            : { ...example, index },
        ),
      );
    }
    if (doc.slug === 'card') {
      return this.withApiCoverage(
        doc,
        CARD_FEATURE_EXAMPLES.map((example, index) =>
          example.key === 'metric'
            ? { ...example, index, ...demoSources['card-metric-demo'] }
            : { ...example, index },
        ),
      );
    }
    if (doc.slug === 'chart') {
      return this.withApiCoverage(
        doc,
        CHART_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'sidebar-nav') {
      return this.withApiCoverage(
        doc,
        SIDEBAR_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'section-footer') {
      return this.withApiCoverage(
        doc,
        SECTION_FOOTER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'badge') {
      return this.withApiCoverage(
        doc,
        BADGE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'chip') {
      return this.withApiCoverage(
        doc,
        CHIP_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'meter-group') {
      return this.withApiCoverage(
        doc,
        METER_GROUP_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'progress-bar') {
      return this.withApiCoverage(
        doc,
        PROGRESS_BAR_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'progress-spinner') {
      return this.withApiCoverage(
        doc,
        PROGRESS_SPINNER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'skeleton') {
      return this.withApiCoverage(
        doc,
        SKELETON_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index })),
      );
    }
    if (doc.slug === 'swipe-actions') {
      return SWIPE_ACTIONS_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'tag') {
      return TAG_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'watermark') {
      return WATERMARK_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'diff-viewer') {
      return DIFF_VIEWER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'error-page') {
      return ERROR_PAGE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'maintenance-page') {
      return MAINTENANCE_PAGE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'calendar-scheduler') {
      return CALENDAR_SCHEDULER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'scheduler') {
      return SCHEDULER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    const gridExamples = GRID_FEATURE_EXAMPLES[doc.slug];
    if (gridExamples) {
      return this.withApiCoverage(
        doc,
        gridExamples.map((example, index) => ({ ...example, index })),
      );
    }
    const keys = FEATURE_VARIANT_KEYS[doc.slug];

    if (!keys?.length) {
      const examples: DetailFeatureExample[] = [
        {
          name: 'Basic',
          details: doc.description,
          key: 'basic',
          index: 0,
          html: doc.code.basic,
        },
      ];
      const stateInput = doc.inputs.find((row) =>
        /^(?:disabled|loading|readonly|invalid)$/.test(row.name),
      );
      if (stateInput) {
        examples.push({
          name: `${stateInput.name.charAt(0).toUpperCase()}${stateInput.name.slice(1)} state`,
          details: `Use the public ${stateInput.name} input to communicate this state consistently.`,
          key: stateInput.name,
          index: 1,
          html: this.addExampleBooleanInput(doc.code.basic, stateInput.name),
        });
      }
      return this.withApiCoverage(doc, examples);
    }

    return this.withApiCoverage(
      doc,
      keys.map((key, index) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        details: doc.variants[index] ?? doc.description,
        key,
        index,
        html: variantExampleHtml(doc, key),
        responsivePreview: key === 'responsive',
      })),
    );
  });

  private withApiCoverage(
    doc: ComponentDoc,
    existing: readonly DetailFeatureExample[],
  ): readonly DetailFeatureExample[] {
    const coverage = generatedApiExampleCoverage.components.find(
      (component) => component.selector === doc.selector,
    );
    if (!coverage) return existing;
    const keys = new Set(existing.map((example) => example.key));
    const additions = coverage.examples
      .filter(
        (example) =>
          example.key !== 'api-appearance' &&
          example.key !== 'api-configuration' &&
          !keys.has(example.key),
      )
      .map((example, offset) => ({
        ...example,
        index: existing.length + offset,
      }));
    return [...existing, ...additions];
  }
  readonly contentsItems = computed<readonly DetailContentsItem[]>(() => {
    if (this.detailViewTab() === 'features') {
      return [
        { id: 'component-overview', label: 'Overview', level: 0 },
        { id: 'component-import', label: 'Import', level: 0 },
        ...this.featureExamples().map((example) => ({
          id: `component-preview-${example.key}`,
          label: example.name,
          level: 0 as const,
        })),
      ];
    }

    const items: DetailContentsItem[] = [
      { id: 'component-api-overview', label: this.doc().name, level: 0 },
      { id: 'component-api', label: 'Properties', level: 1 },
      { id: 'component-events', label: 'Events', level: 1 },
    ];
    items.push(
      { id: 'component-methods', label: 'Methods', level: 1 },
      { id: 'component-templates', label: 'Templates', level: 1 },
    );
    items.push(
      { id: 'component-css-variables', label: 'CSS variables', level: 1 },
      { id: 'component-accessibility', label: 'Accessibility', level: 1 },
      { id: 'component-faq', label: 'FAQ', level: 1 },
      { id: 'component-changelog', label: 'Changelog', level: 1 },
    );
    return items;
  });

  constructor() {
    effect(() => {
      this.doc();
      this.detailViewTab.set('features');
      this.featureCodeTabs.set({});
      this.resetExampleState();
    });
    effect(() => {
      this.activeContentsId.set(this.contentsItems()[0]?.id ?? '');
    });
    afterRenderEffect((onCleanup) => {
      const items = this.contentsItems();
      if (!this.isBrowser) {
        return;
      }
      const Observer = this.documentRef.defaultView?.IntersectionObserver;
      if (!Observer) {
        return;
      }

      const observer = new Observer(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);
          const id = visible[0]?.target.id;
          if (id) {
            this.activeContentsId.set(id);
          }
        },
        { rootMargin: '-12% 0px -72% 0px', threshold: [0, 0.25, 1] },
      );

      for (const item of items) {
        const element = this.documentRef.getElementById(item.id);
        if (element) {
          observer.observe(element);
        }
      }
      onCleanup(() => observer.disconnect());
    });
  }

  scrollToContents(id: string): void {
    this.activeContentsId.set(id);
    this.documentRef.getElementById(id)?.scrollIntoView({ block: 'start' });
  }

  resetExampleState(): void {
    this.previewWidth.set(null);
    this.dialogOpen.set(false);
    this.drawerOpen.set(false);
    this.popoverOpen.set(false);
    this.tableActionMessage.set('');
    this.bottomSheetVisible = false;
    this.commandPaletteOpen = false;
    this.imagePreviewOpen = false;
    this.notificationOpen = false;
    this.receiptEnabled = true;
    this.selectedInterests = ['design'];
    this.policyVerified = true;
    this.managedSetting = true;
    this.enabled = true;
    this.published = false;
    this.plan = 'pro';
    this.radioSizeChoice = 'default';
    this.lockedPlan = 'managed';
    this.viewMode = 'list';
    this.brandColor = '#4f46e5';
    this.dueDate = new Date(2026, 6, 18);
    this.pickerRange = [new Date(2026, 6, 12), new Date(2026, 6, 19)];
    this.multipleDates = [new Date(2026, 6, 8), new Date(2026, 6, 15)];
    this.bookingDate = new Date(2026, 6, 18);
    this.appointmentDate = new Date(2026, 6, 20);
    this.inlineDate = new Date(2026, 6, 16);
    this.dateTimeValue = new Date(2026, 6, 18, 14, 30);
    this.billingMonth = new Date(2026, 6, 1);
    this.reportingMonth = new Date(2028, 4, 1);
    this.lockedDate = new Date(2026, 6, 24);
    this.labeledEmail = 'avery@example.com';
    this.iconFieldBasicSearch = '';
    this.iconFieldDisabledSearch = 'Managed by policy';
    this.groupBudget = 2500;
    this.workspaceSlug = 'operations';
    this.emailAlias = 'avery';
    this.groupQuantity = 3;
    this.quantity = 3;
    this.budget = 2500;
    this.otp = '';
    this.selectedTeam = 'engineering';
    this.selectedSkills = ['angular', 'accessibility'];
    this.rating = 4;
    this.completion = 65;
    this.dateRange = ['2026-07-12', '2026-07-19'];
    this.editorValue = '<p>Customer prefers quarterly account reviews and email updates.</p>';
    this.editorHtmlValue =
      '<h2>Customer note</h2><p>The renewal review is scheduled for August.</p>';
    this.editorMediaValue =
      '<h2>Customer presentation</h2><p>Upload, paste, or drop a customer image, then select it to open the image tools.</p>';
    this.meetingTime = '14:30';
    this.selectedCustomer = 'acme';
    this.tags = [
      { label: 'Angular', severity: 'primary' },
      { label: 'Accessibility', severity: 'success' },
    ];
    this.maskedPhone = '(555) 123-4567';
    this.employeeId = 'JR-2048';
    this.autocompleteSuggestions = [...this.customerSuggestions];
    this.fileBrowserItems = this.createFileBrowserItems();
    this.fileBrowserSelection = ['report'];
    this.fileBrowserSortField = 'name';
    this.fileBrowserViewMode = 'list';
    this.fileBrowserActionMessage.set('');
    this.kanbanPreviewColumns = this.kanbanColumns;
  }

  addExampleBooleanInput(template: string, inputName: string): string {
    return template.replace(/^(\s*<j-[a-z0-9-]+)/, `$1 ${inputName}`);
  }
  readonly tableVariants: readonly JTableVariant[] = [
    'standard',
    'gridlines',
    'striped',
    'minimal',
  ];
  readonly activityItems = [
    {
      id: 1,
      title: 'Record updated',
      description: 'Field values changed.',
      timestamp: '2026-07-18T09:30:00Z',
      actor: 'Actor',
      severity: 'info',
      details: { field: 'Name' },
    },
  ] as const;
  readonly approvalSteps = [
    { id: 1, label: 'Step 1', status: 'approved', actor: 'Actor' },
    { id: 2, label: 'Step 2', status: 'pending' },
  ] as const;
  readonly auditEntries = [
    {
      id: 1,
      actor: 'Actor',
      action: 'updated',
      entity: 'Record',
      timestamp: '2026-07-18T09:30:00Z',
      before: { name: 'Item A' },
      after: { name: 'Item B' },
      severity: 'info',
    },
  ] as const;
  readonly diffBefore = {
    name: 'Aster Labs',
    status: 'Pending',
    owner: 'Avery Reed',
    plan: 'Enterprise',
    legacyId: 'CUS-18',
  };
  readonly diffAfter = {
    name: 'Aster Labs',
    status: 'Approved',
    owner: 'Morgan Kim',
    plan: 'Enterprise',
    region: 'West',
  };
  readonly diffTextBefore = `Notifications: weekly
Exports: CSV
Retention: 30 days`;
  readonly diffTextAfter = `Notifications: daily
Exports: CSV
Retention: 90 days
Audit log: enabled`;
  readonly previewHtml =
    '<!doctype html><html><body><main><h1>Preview</h1><p>Sanitized local HTML.</p></main></body></html>';
  readonly tableDensities = ['compact', 'comfortable', 'spacious'] as const;
  readonly productDescription =
    'A durable task light with adjustable brightness, a compact base, and a warm reading mode for desks and bedside tables. The metal arm rotates smoothly and the controls remain easy to reach.';
  readonly comment =
    'The release is ready after the final keyboard, responsive, and dark-theme checks are complete. Please include the migration note before publishing.';
  readonly policySummary =
    'Workspace records are retained according to the selected plan. Administrators can export, restrict, or delete records according to their organization policy.';
  readonly projectedSummary =
    'The component examples now use focused scenarios and accessible keyboard behavior.';
  readonly dynamicSummary =
    'This summary can be replaced by API data and the collapsed output updates automatically.';

  textExpandValue(key: string): string {
    if (key === 'short') return 'Ready to publish.';
    if (key === 'dynamic') return this.dynamicSummary;
    if (key === 'comment' || key === 'labels') return this.comment;
    if (key === 'policy') return this.policySummary;
    return this.productDescription;
  }

  activeFeatureCode(example: DetailFeatureExample): string {
    const tab = this.featureCodeTab(example);
    if (tab === 'html') return example.html;
    if (tab === 'ts' && example.ts) return example.ts;
    if (tab === 'scss') return example.scss ?? '// This example uses only JRNG UI theme tokens.';
    return this.activeCode(tab);
  }

  featureCodeTab(example: DetailFeatureExample): DetailCodeTab {
    return this.featureCodeTabs()[example.key] ?? 'html';
  }

  setFeatureCodeTab(example: DetailFeatureExample, tab: DetailCodeTab): void {
    this.featureCodeTabs.update((tabs) => ({ ...tabs, [example.key]: tab }));
  }

  activeCode(tab: DetailCodeTab): string {
    const code = this.doc().code;
    if (tab === 'html') {
      return [
        code.basic,
        code.variants ? `<!-- Variants -->\n${code.variants}` : '',
        code.sizes ? `<!-- Sizes -->\n${code.sizes}` : '',
        code.states ? `<!-- States -->\n${code.states}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    if (tab === 'scss') {
      return '// This example uses only JRNG UI theme tokens.';
    }
    if (tab === 'data') {
      return code.angular || '// This example does not require additional data.';
    }
    const className = `${this.doc().name.replace(/[^a-zA-Z0-9]/g, '')}ExampleComponent`;
    const body = code.angular
      ? code.angular
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n')
      : '  // No additional component logic is required.';
    return `${code.importCode}\n\nexport class ${className} {\n${body}\n}`;
  }

  activeCodeLabel(tab: DetailCodeTab): string {
    return tab === 'html'
      ? 'HTML template'
      : tab === 'ts'
        ? 'Angular component'
        : tab === 'scss'
          ? 'Example styles'
          : 'Example data';
  }
  readonly accordionVariants: readonly JAccordionVariant[] = ['default', 'separated', 'minimal'];
  readonly buttonVariants: readonly JButtonVariant[] = [
    'solid',
    'outlined',
    'text',
    'soft',
    'link',
  ];
  buttonExampleLabel(key: string): string {
    const labels: Record<string, string> = {
      basic: 'Apply updates',
      outline: 'Export',
      text: 'Learn more',
      link: 'Open summary',
      raised: 'Create project',
      pill: 'Follow',
      'icon-before': 'Save',
      'icon-after': 'Continue',
      'icon-only': '',
      loading: 'Saving',
      disabled: 'Publish',
      'full-width': 'Continue',
      badge: 'Notifications',
      destructive: 'Delete project',
    };
    return labels[key] ?? 'Action';
  }

  buttonExampleVariant(key: string): JButtonVariant {
    if (key === 'outline') return 'outlined';
    if (key === 'text') return 'text';
    if (key === 'link') return 'link';
    return 'solid';
  }

  buttonExampleIcon(key: string): string {
    if (key === 'icon-before') return 'save';
    if (key === 'icon-after') return 'arrow-right';
    if (key === 'icon-only') return 'settings';
    if (key === 'badge') return 'bell';
    return '';
  }

  loaderExampleType(key: string): JLoaderVariant {
    const types: readonly JLoaderVariant[] = [
      'spinner',
      'dots',
      'pulse',
      'bars',
      'ring',
      'dual-ring',
      'wave',
      'bounce',
      'orbit',
      'typing',
    ];
    return types.includes(key as JLoaderVariant) ? (key as JLoaderVariant) : 'spinner';
  }
  readonly inputVariants: readonly JInputVariant[] = ['outlined', 'filled'];
  readonly paginatorVariants: readonly JPaginatorVariant[] = ['standard', 'simple'];
  readonly breadcrumbVariants: readonly JBreadcrumbVariant[] = ['default', 'contained', 'steps'];
  readonly emptyStateVariants: readonly JEmptyStateVariant[] = ['default', 'inline', 'panel'];
  readonly tabsVariants: readonly JTabsVariant[] = ['default', 'pills', 'segmented'];
  readonly dialogOpen = signal(false);
  readonly drawerOpen = signal(false);
  readonly popoverOpen = signal(false);
  readonly overlayPreviewSlugs = new Set([
    'action-menu',
    'autocomplete',
    'color-picker',
    'confirm-popup',
    'context-menu',
    'date-picker',
    'drawer',
    'menubar',
    'popover',
    'select',
    'tiered-menu',
    'time-picker',
  ]);
  readonly statusPreviewSlugs = new Set(['empty', 'error-page', 'maintenance-page']);

  bottomSheetVisible = false;
  commandPaletteOpen = false;
  imagePreviewOpen = false;
  notificationOpen = false;
  receiptEnabled = true;
  selectedInterests: readonly string[] = ['design'];
  policyVerified = true;
  managedSetting = true;
  enabled = true;
  published = false;
  plan = 'pro';
  radioSizeChoice = 'default';
  lockedPlan = 'managed';
  viewMode = 'list';
  brandColor = '#4f46e5';
  dueDate: Date | null = new Date(2026, 6, 18);
  pickerRange: readonly Date[] = [new Date(2026, 6, 12), new Date(2026, 6, 19)];
  multipleDates: readonly Date[] = [new Date(2026, 6, 8), new Date(2026, 6, 15)];
  bookingDate: Date | null = new Date(2026, 6, 18);
  readonly bookingMinDate = new Date(2026, 6, 10);
  readonly bookingMaxDate = new Date(2026, 6, 28);
  appointmentDate: Date | null = new Date(2026, 6, 20);
  readonly unavailableDates = [new Date(2026, 6, 14), new Date(2026, 6, 21)];
  inlineDate: Date | null = new Date(2026, 6, 16);
  dateTimeValue: Date | null = new Date(2026, 6, 18, 14, 30);
  billingMonth: Date | null = new Date(2026, 6, 1);
  reportingMonth: Date | null = new Date(2028, 4, 1);
  lockedDate: Date | null = new Date(2026, 6, 24);
  readonly datePresets: readonly JDatePickerPreset[] = [
    {
      label: 'Release week',
      start: new Date(2026, 6, 13),
      end: new Date(2026, 6, 17),
    },
    {
      label: 'July reporting',
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 31),
    },
  ];
  labeledEmail = 'avery@example.com';
  iconFieldBasicSearch = '';
  iconFieldDisabledSearch = 'Managed by policy';
  groupBudget = 2500;
  workspaceSlug = 'operations';
  emailAlias = 'avery';
  groupQuantity = 3;
  quantity = 3;
  budget = 2500;
  otp = '';
  selectedTeam = 'engineering';
  selectedSkills: string[] = ['angular', 'accessibility'];
  rating = 4;
  completion = 65;
  dateRange: readonly string[] = ['2026-07-12', '2026-07-19'];
  editorValue = '<p>Customer prefers quarterly account reviews and email updates.</p>';
  editorHtmlValue = '<h2>Customer note</h2><p>The renewal review is scheduled for August.</p>';
  editorMediaValue =
    '<h2>Customer presentation</h2><p>Upload, paste, or drop a customer image, then select it to open the image tools.</p>';
  meetingTime = '14:30';
  selectedCustomer = 'acme';
  tags = [
    { label: 'Angular', severity: 'primary' as const },
    { label: 'Accessibility', severity: 'success' as const },
  ];
  maskedPhone = '(555) 123-4567';
  employeeId = 'JR-2048';

  readonly statuses = ['Draft', 'Published', 'Archived'];
  readonly brandPresets = ['#4f46e5', '#2563eb', '#0891b2', '#16a34a', '#d97706', '#dc2626'];
  readonly teams = [
    { id: 'design', name: 'Design' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'support', name: 'Support', disabled: true },
  ] as const;
  readonly customerSuggestions = [
    { label: 'Acme Inc.', value: 'acme' },
    { label: 'Northwind', value: 'northwind' },
    { label: 'Globex', value: 'globex' },
  ] as const;
  autocompleteSuggestions: readonly { label: string; value: string }[] = [
    ...this.customerSuggestions,
  ];
  readonly teamOptions = [
    { label: 'Design', value: 'design' },
    { label: 'Engineering', value: 'engineering' },
    { label: 'Support', value: 'support' },
  ] as const;
  readonly skillOptions = [
    { label: 'Angular', value: 'angular' },
    { label: 'Accessibility', value: 'accessibility' },
    { label: 'Testing', value: 'testing' },
  ] as const;
  readonly radioGroupOptions = [
    { label: 'Starter', value: 'starter' },
    { label: 'Pro', value: 'pro' },
    { label: 'Enterprise', value: 'enterprise', disabled: true },
  ] as const;
  readonly viewModes = [
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
    { label: 'Kanban', value: 'kanban' },
  ] as const;
  readonly meterSegments = [
    { label: 'Used', value: 42, severity: 'primary' },
    { label: 'Reserved', value: 24, severity: 'success' },
    { label: 'Remaining', value: 18, severity: 'warning' },
  ] as const;
  readonly sparklineValues = [12, 18, 16, 24, 30, 28, 36, 42] as const;
  readonly previewImage = '/assets/images/product-laptop.webp';
  readonly schedulerActiveDate = new Date(2026, 6, 14, 9);
  readonly schedulerEvents = [
    {
      id: 'planning',
      title: 'Customer onboarding',
      start: new Date(2026, 6, 12, 10),
      end: new Date(2026, 6, 12, 11),
      color: '#6366f1',
      location: 'Meeting room A',
      category: 'Customer',
    },
    {
      id: 'review',
      title: 'Renewal review',
      start: new Date(2026, 6, 14, 14),
      end: new Date(2026, 6, 14, 15),
      color: '#0ea5e9',
      location: 'Video call',
      category: 'Review',
    },
    {
      id: 'launch',
      title: 'Release window',
      start: new Date(2026, 6, 14, 16),
      end: new Date(2026, 6, 16, 17),
      color: '#16a34a',
      category: 'Release',
    },
    {
      id: 'quarterly-planning',
      title: 'Quarterly planning',
      start: new Date(2026, 6, 14, 9),
      color: '#d97706',
      location: 'Studio 2',
      category: 'Internal',
    },
    {
      id: 'offsite',
      title: 'Team offsite',
      start: new Date(2026, 6, 17),
      allDay: true,
      color: '#9333ea',
      location: 'Harbor campus',
      category: 'Team',
    },
  ] as const;
  readonly carouselItems = [
    {
      title: 'Alpine dawn',
      description: 'Early light over a quiet mountain valley.',
      image: '/assets/gallery/alpine-dawn.png',
      alt: 'Sunrise over an alpine valley',
    },
    {
      title: 'Coastal light',
      description: 'A bright shoreline framed by calm blue water.',
      image: '/assets/gallery/coastal-light.png',
      alt: 'Sunlit coastline and blue water',
    },
    {
      title: 'Desert arches',
      description: 'Natural sandstone forms in warm evening light.',
      image: '/assets/gallery/desert-arches.png',
      alt: 'Sandstone arches in a desert landscape',
    },
  ] as const;
  readonly chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{ label: 'New customers', data: [32, 48, 41, 64, 78], backgroundColor: '#6366f1' }],
  };
  readonly lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active customers',
        data: [120, 154, 148, 190, 224, 205, 248],
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8, 145, 178, 0.14)',
        fill: true,
        tension: 0.35,
      },
    ],
  };
  readonly doughnutChartData = {
    labels: ['Enterprise', 'Growth', 'Starter'],
    datasets: [{ label: 'Customer segments', data: [46, 34, 20] }],
  };
  readonly radarChartData = {
    labels: ['Speed', 'Reliability', 'Support', 'Security', 'Ease of use'],
    datasets: [
      { label: 'Current', data: [82, 74, 88, 91, 78] },
      { label: 'Previous', data: [68, 70, 75, 84, 72] },
    ],
  };
  readonly polarChartData = {
    labels: ['Web', 'Mobile', 'Partner', 'Retail', 'Direct'],
    datasets: [{ label: 'Orders', data: [38, 27, 18, 22, 31] }],
  };
  readonly scatterChartData = {
    datasets: [
      {
        label: 'Campaigns',
        data: [
          { x: 12, y: 22 },
          { x: 24, y: 35 },
          { x: 38, y: 48 },
          { x: 52, y: 61 },
        ],
      },
    ],
  };
  readonly bubbleChartData = {
    datasets: [
      {
        label: 'Campaigns',
        data: [
          { x: 12, y: 22, r: 8 },
          { x: 24, y: 35, r: 13 },
          { x: 38, y: 48, r: 10 },
          { x: 52, y: 61, r: 16 },
        ],
      },
    ],
  };
  readonly outsideLabelOptions = {
    connectorLength: 20,
    formatter: ({ label, percentage }: { label: string; percentage: number }) =>
      `${label} ${percentage.toFixed(0)}%`,
  };
  readonly mixedChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        type: 'bar',
        label: 'Customer revenue',
        data: [42, 48, 53, 61, 68],
        backgroundColor: '#6366f1',
      },
      {
        type: 'line',
        label: 'Target',
        data: [45, 47, 52, 58, 64],
        borderColor: '#0891b2',
        tension: 0.3,
      },
    ],
  };
  readonly commands = [
    { id: 'new', label: 'Create project', description: 'Start a new project', group: 'Actions' },
    { id: 'search', label: 'Search docs', description: 'Find a component', group: 'Navigate' },
    { id: 'theme', label: 'Toggle theme', description: 'Switch color mode', group: 'Settings' },
  ] as const;
  readonly dataViewItems = [
    { id: 1, name: 'Design system', category: 'Product', owner: 'Avery Reed' },
    { id: 2, name: 'Documentation portal', category: 'Content', owner: 'Morgan Lee' },
    { id: 3, name: 'Admin workspace', category: 'Operations', owner: 'Jordan Patel' },
  ];
  readonly dataViewSortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'category', label: 'Category' },
    { field: 'owner', label: 'Owner' },
  ];
  fileBrowserItems: readonly JFileBrowserItem[] = this.createFileBrowserItems();
  readonly fileBrowserBreadcrumbs = [
    { id: 'home', label: 'Home' },
    { id: 'customers', label: 'Customers' },
    { id: 'acme', label: 'Acme Pty Ltd' },
  ] as const;
  readonly fileBrowserActions = [
    { id: 'download', label: 'Download', icon: 'download', selection: 'any' as const },
    { id: 'delete', label: 'Delete', icon: 'trash', selection: 'any' as const },
  ];
  fileBrowserSelection: readonly string[] = ['report'];
  fileBrowserSortField: JFileBrowserSortField = 'name';
  fileBrowserViewMode: JFileBrowserViewMode = 'list';
  readonly fileBrowserActionMessage = signal('');

  handleFileBrowserAction(event: JFileBrowserActionEvent): void {
    const names = event.items.map((item) => item.name).join(', ');
    this.fileBrowserActionMessage.set(`${event.action.label}: ${names}`);
    if (event.action.id === 'delete') {
      const removed = new Set(event.items.map((item) => item.id));
      this.fileBrowserItems = this.fileBrowserItems.filter((item) => !removed.has(item.id));
      this.fileBrowserSelection = this.fileBrowserSelection.filter((id) => !removed.has(id));
    }
  }

  handleFileBrowserCreateFolder(): void {
    if (!this.fileBrowserItems.some((item) => item.id === 'new-folder')) {
      this.fileBrowserItems = [
        { id: 'new-folder', name: 'New customer folder', kind: 'folder', modifiedAt: '2026-08-03' },
        ...this.fileBrowserItems,
      ];
    }
    this.fileBrowserActionMessage.set('New folder created.');
  }

  handleFileBrowserUpload(): void {
    if (!this.fileBrowserItems.some((item) => item.id === 'uploaded-file')) {
      this.fileBrowserItems = [
        ...this.fileBrowserItems,
        {
          id: 'uploaded-file',
          name: 'Customer brief.pdf',
          kind: 'file',
          size: 128000,
          modifiedAt: '2026-08-03',
        },
      ];
    }
    this.fileBrowserActionMessage.set('Customer brief.pdf uploaded.');
  }

  handleFileBrowserRefresh(): void {
    this.fileBrowserActionMessage.set('File list refreshed.');
  }

  private createFileBrowserItems(): readonly JFileBrowserItem[] {
    return [
      { id: 'invoices', name: 'Invoices', kind: 'folder', modifiedAt: '2026-07-14' },
      {
        id: 'report',
        name: 'Quarterly report.xlsx',
        kind: 'file',
        size: 245760,
        modifiedAt: '2026-07-12',
      },
      {
        id: 'agreement',
        name: 'Signed agreement.pdf',
        kind: 'file',
        size: 845120,
        modifiedAt: '2026-07-10',
      },
      {
        id: 'logo',
        name: 'Brand mark.png',
        kind: 'file',
        size: 56320,
        modifiedAt: '2026-07-08',
      },
    ];
  }
  readonly galleryItems = [
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
    {
      src: '/assets/gallery/desert-arches.png',
      thumbnail: '/assets/gallery/desert-arches.png',
      alt: 'Sandstone arches in a desert landscape',
      caption: 'Desert arches',
    },
  ] as const;
  readonly ganttTasks = [
    {
      id: 'discovery',
      label: 'Customer discovery',
      start: '2026-07-06',
      end: '2026-07-12',
      progress: 100,
    },
    { id: 'setup', label: 'Account setup', start: '2026-07-10', end: '2026-07-20', progress: 65 },
    {
      id: 'launch',
      label: 'Customer launch',
      start: '2026-07-18',
      end: '2026-07-24',
      progress: 20,
    },
  ] as const;
  readonly kanbanColumns = [
    {
      id: 'todo',
      title: 'To do',
      cards: [
        { id: 'harbor', title: 'Harbor & Pine', metadata: 'Growth subscription' },
        { id: 'summit', title: 'Summit Route', metadata: 'Enterprise subscription' },
      ],
    },
    {
      id: 'doing',
      title: 'In progress',
      cards: [{ id: 'crescent', title: 'Crescent Health', metadata: 'Account setup' }],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [{ id: 'northstar', title: 'Northstar Logistics', metadata: 'Customer launched' }],
    },
  ] as const;
  kanbanPreviewColumns: readonly JKanbanColumn[] = this.kanbanColumns;
  readonly megaMenuItems = [
    {
      label: 'Products',
      groups: [
        {
          label: 'Build',
          items: [{ label: 'Components' }, { label: 'Templates' }, { label: 'Themes' }],
        },
        { label: 'Learn', items: [{ label: 'Documentation' }, { label: 'Examples' }] },
      ],
    },
    { label: 'Resources' },
  ] as const;
  readonly transferSource = [
    { label: 'Customer', value: 'customer' },
    { label: 'Status', value: 'status' },
    { label: 'Date added', value: 'created' },
  ] as const;
  readonly transferTarget = [{ label: 'Order number', value: 'order' }] as const;
  readonly organization = {
    key: 'ceo',
    label: 'Avery Reed',
    expanded: true,
    children: [
      { key: 'design', label: 'Morgan Kim' },
      { key: 'engineering', label: 'Jordan Lee' },
    ],
  } as const;
  readonly stepperItems = [
    { label: 'Details', completed: true },
    { label: 'Review', description: 'Check your changes' },
    { label: 'Publish' },
  ] as const;
  readonly treeNodes: readonly JTreeNode[] = [
    {
      key: 'enterprise',
      label: 'Enterprise customers',
      data: { type: 'Segment' },
      children: [
        {
          key: 'northstar',
          label: 'Northstar Logistics',
          data: { type: 'Customer' },
          leaf: true,
        },
        {
          key: 'crescent',
          label: 'Crescent Health',
          data: { type: 'Customer' },
          leaf: true,
        },
      ],
    },
    {
      key: 'growth',
      label: 'Growth customers',
      data: { type: 'Segment' },
      children: [
        {
          key: 'harbor',
          label: 'Harbor & Pine',
          data: { type: 'Customer' },
          leaf: true,
        },
      ],
    },
  ] as const;
  readonly lazyTreeNodes: readonly JTreeNode[] = [
    {
      key: 'onboarding',
      label: 'Onboarding customers',
      data: { type: 'Segment' },
      leaf: false,
    },
    { key: 'paused', label: 'Paused customers', data: { type: 'Segment' }, leaf: true },
  ] as const;
  treeExpandedKeys: ReadonlySet<string> = new Set(['enterprise']);
  treeSelection: JTreeNode | readonly JTreeNode[] | null = null;
  readonly tableLoadError = new Error('Customer records could not be loaded.');
  readonly treeColumns: readonly JTableColumn[] = [
    { field: 'label', header: 'Customer hierarchy' },
    { field: 'type', header: 'Record type' },
  ];
  readonly treeSortableColumns: readonly JTableColumn[] = this.treeColumns.map((column) => ({
    ...column,
    sortable: true,
  }));
  readonly virtualItems = Array.from({ length: 100 }, (_, index) => `Record ${index + 1}`);
  readonly tableActionMessage = signal('');
  readonly orderColumns: readonly JTableColumn[] = [
    { field: 'order', header: 'Order', sortable: true },
    { field: 'customer', header: 'Customer', filterable: true, resizable: true },
    { field: 'status', header: 'Status', filterable: true },
    { field: 'total', header: 'Total', align: 'end', sortable: true },
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        { key: 'view', label: 'View', command: (event) => this.handleTableAction(event) },
        {
          key: 'delete',
          label: 'Delete',
          severity: 'danger',
          command: (event) => this.handleTableAction(event),
        },
      ],
    },
  ];
  readonly customerColumns: readonly JTableColumn[] = [
    {
      field: 'code',
      header: 'Customer ID',
      sortable: true,
      filterable: true,
      resizable: true,
      minWidth: '9rem',
      filter: {
        placeholder: 'Search code',
        operators: ['contains', 'startsWith', 'equals', 'notEquals'],
      },
    },
    {
      field: 'customerName',
      header: 'Customer Name',
      sortable: true,
      filterable: true,
      resizable: true,
      minWidth: '13rem',
      filter: {
        placeholder: 'Search name',
        operators: ['contains', 'startsWith', 'endsWith', 'equals', 'notContains'],
      },
    },
    {
      field: 'company',
      header: 'Company',
      filterable: true,
      minWidth: '12rem',
      filter: { operators: ['contains', 'equals', 'notEquals'] },
    },
    {
      field: 'accountManager',
      header: 'Account Manager',
      filterable: true,
      minWidth: '11rem',
      filter: { operators: ['contains', 'equals', 'isEmpty', 'isNotEmpty'] },
    },
    {
      field: 'subscription',
      header: 'Subscription',
      sortable: true,
      filterable: true,
      minWidth: '10rem',
      filter: {
        type: 'select',
        operators: ['equals', 'notEquals'],
        options: [
          { label: 'Starter', value: 'Starter' },
          { label: 'Growth', value: 'Growth' },
          { label: 'Enterprise', value: 'Enterprise' },
        ],
      },
    },
    {
      field: 'active',
      header: 'Active',
      type: 'boolean',
      filterable: true,
      align: 'center',
      minWidth: '8rem',
      filter: { type: 'boolean', operators: ['equals', 'notEquals'] },
    },
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      minWidth: '8rem',
      actions: [
        {
          key: 'view',
          label: 'View customer',
          command: (event) => this.handleTableAction(event),
        },
        {
          key: 'edit',
          label: 'Edit customer',
          command: (event) => this.handleTableAction(event),
        },
        {
          key: 'archive',
          label: 'Archive',
          severity: 'danger',
          command: (event) => this.handleTableAction(event),
        },
      ],
    },
  ];

  readonly customerRows = [
    {
      id: 1,
      code: 'CUS-10018',
      customerName: 'Avery Morgan',
      company: 'Northstar Logistics',
      accountManager: 'Jordan Lee',
      subscription: 'Enterprise',
      active: true,
    },
    {
      id: 2,
      code: 'CUS-10024',
      customerName: 'Riley Chen',
      company: 'Harbor & Pine',
      accountManager: 'Morgan Kim',
      subscription: 'Growth',
      active: true,
    },
    {
      id: 3,
      code: 'CUS-10031',
      customerName: 'Noah Brooks',
      company: 'Summit Field Services',
      accountManager: 'Avery Reed',
      subscription: 'Starter',
      active: false,
    },
    {
      id: 4,
      code: 'CUS-10042',
      customerName: 'Maya Patel',
      company: 'Blue Cedar Technologies',
      accountManager: 'Jordan Lee',
      subscription: 'Enterprise',
      active: true,
    },
    {
      id: 5,
      code: 'CUS-10056',
      customerName: 'Elliot James',
      company: 'Crescent Energy',
      accountManager: 'Morgan Kim',
      subscription: 'Growth',
      active: true,
    },
    {
      id: 6,
      code: 'CUS-10063',
      customerName: 'Zoe Carter',
      company: 'Oakline Property Services',
      accountManager: 'Avery Reed',
      subscription: 'Starter',
      active: false,
    },
  ];

  readonly tableConfig: JTableConfig = {
    pagination: true,
    sortable: true,
    multiSort: true,
    filterDisplay: 'row',
    columnFilter: true,
    globalSearch: true,
    columnManager: true,
    exportable: true,
    stateful: true,
    reorderableRows: true,
    lockableRows: true,
    reorderableColumns: true,
    resizableColumns: true,
    maximizable: true,
    export: { rows: 'selected', visibleColumnsOnly: true },
  };

  readonly orders = [
    { order: '#1008', customer: 'Acme Inc.', status: 'Ready', total: '$428.00' },
    { order: '#1009', customer: 'Northwind', status: 'Pending', total: '$219.00' },
    { order: '#1010', customer: 'Globex', status: 'Shipped', total: '$814.00' },
    { order: '#1011', customer: 'Initech', status: 'Draft', total: '$132.00' },
  ];
  readonly breadcrumbHome: JBreadcrumbItem = { label: 'Home', routerLink: '/' };
  readonly breadcrumbItems: readonly JBreadcrumbItem[] = [
    { label: 'Docs', routerLink: '/docs' },
    { label: 'Components', routerLink: '/docs/components' },
    { label: 'Breadcrumb' },
  ];

  readonly rowActions: readonly JTableAction[] = [
    { key: 'view', label: 'View' },
    { key: 'duplicate', label: 'Duplicate' },
    { key: 'delete', label: 'Delete', severity: 'danger' },
  ];

  handleTableAction(event: JTableActionEvent): void {
    const record =
      event.row['code'] ?? event.row['order'] ?? event.row['name'] ?? `row ${event.index + 1}`;
    this.tableActionMessage.set(`${event.action.label}: ${String(record)}`);
  }

  readonly timelineItems: readonly JTimelineItem[] = [
    { title: 'Created', content: 'Order was created.', opposite: '09:00', severity: 'info' },
    {
      title: 'Approved',
      content: 'Manager approved the request.',
      opposite: '10:15',
      severity: 'success',
    },
    {
      title: 'Queued',
      content: 'Waiting for fulfillment.',
      opposite: '11:20',
      severity: 'warning',
    },
  ];

  readonly sampleDate = new Date(2026, 6, 5, 14, 30);
  readonly longText = 'Quarterly operations report with regional summaries and exception details';

  readonly menuItems: readonly JMenuItem[] = [
    { label: 'Open', icon: 'file' },
    { label: 'Duplicate', icon: 'copy', badge: 'New' },
    { separator: true },
    {
      label: 'More',
      icon: 'more-horizontal',
      items: [
        { label: 'Archive', icon: 'archive' },
        { label: 'Settings', icon: 'settings', disabled: true },
      ],
    },
  ];
  readonly sidebarMenuItems: readonly JMenuItem[] = [
    { id: 'overview', label: 'Overview', icon: 'layout-dashboard', badge: 3 },
    { id: 'inbox', label: 'Inbox', icon: 'message-square', badge: 12 },
    { id: 'search', label: 'Search', icon: 'search' },
    { separator: true },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'folder-code',
      items: [
        { id: 'analytics', label: 'Analytics', icon: 'chart-no-axes-column' },
        { id: 'reports', label: 'Reports', icon: 'file-text' },
      ],
    },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  readonly menubarItems: readonly JMenuItem[] = [
    {
      label: 'File',
      icon: 'file',
      items: [
        { label: 'Open project', icon: 'folder-code' },
        { label: 'Duplicate', icon: 'copy' },
      ],
    },
    {
      label: 'Manage',
      icon: 'settings',
      items: [
        { label: 'Archive', icon: 'archive' },
        { label: 'Preferences', icon: 'settings' },
      ],
    },
  ];
  showToast(severity: 'success' | 'error' | 'warning' | 'info'): void {
    if (severity === 'success') {
      this.toast.success('The project was saved.', 'Saved');
      return;
    }
    if (severity === 'error') {
      this.toast.error('Check the required fields and try again.', 'Could not save');
      return;
    }
    if (severity === 'warning') {
      this.toast.warning('Some changes still need review.', 'Review required');
      return;
    }
    this.toast.info('Your export is being prepared.', 'Export started');
  }

  showToastStyle(variant: JToastVariant): void {
    this.toast.show({
      severity: 'info',
      variant,
      summary: `${variant.charAt(0).toUpperCase()}${variant.slice(1)} toast`,
      detail: 'Appearance is independent from severity.',
    });
  }

  showActionToast(): void {
    this.toast.show({
      severity: 'neutral',
      variant: 'outlined',
      summary: 'Project archived',
      detail: 'The project was moved to the archive.',
      sticky: true,
      actions: [
        {
          label: 'Undo',
          style: 'primary',
          command: () =>
            this.toast.success('The project is active again.', 'Archive undone', {
              variant: 'soft',
            }),
        },
      ],
      cancelAction: { label: 'Dismiss', command: () => undefined },
    });
  }

  openConfirm(severity: 'default' | 'danger' = 'default'): void {
    this.confirmation.confirm({
      header: severity === 'danger' ? 'Delete record' : 'Confirm action',
      message:
        severity === 'danger'
          ? 'This action cannot be undone.'
          : 'Review the details before continuing.',
      acceptLabel: severity === 'danger' ? 'Delete' : 'Continue',
      rejectLabel: 'Cancel',
    });
  }

  openConfirmPopup(event: Event): void {
    this.confirmation.confirm({
      target: event.currentTarget as HTMLElement,
      header: 'Archive project?',
      message: 'You can restore it later from the archive.',
      acceptLabel: 'Archive',
      rejectLabel: 'Cancel',
    });
  }

  startPreviewTour(): void {
    void this.tour.start({
      id: 'docs-tour-preview',
      steps: ['create-button', 'filter-button'],
      showProgress: true,
    });
  }

  handleKanbanReorder(event: JKanbanMoveEvent): void {
    this.kanbanPreviewColumns = event.columns;
  }

  addKanbanCard(event: JKanbanColumnEvent): void {
    const nextNumber = this.kanbanPreviewColumns.reduce(
      (count, column) => count + column.cards.length,
      1,
    );
    this.kanbanPreviewColumns = this.kanbanPreviewColumns.map((column) =>
      column.id === event.column.id
        ? {
            ...column,
            cards: [
              ...column.cards,
              { id: `task-${nextNumber}`, title: `New task ${nextNumber}`, metadata: 'New' },
            ],
          }
        : column,
    );
  }

  removeKanbanCard(event: JKanbanCardEvent): void {
    this.kanbanPreviewColumns = this.kanbanPreviewColumns.map((column) =>
      column.id === event.column.id
        ? { ...column, cards: column.cards.filter((card) => card.id !== event.card.id) }
        : column,
    );
  }

  openDynamicDialog(): void {
    this.dialogService.open({
      title: 'Project summary',
      message: 'This dialog was created through the shared dialog service.',
      size: 'sm',
    });
  }

  filterCustomerSuggestions(query: string): void {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    this.autocompleteSuggestions = normalizedQuery
      ? this.customerSuggestions.filter((item) =>
          item.label.toLocaleLowerCase().includes(normalizedQuery),
        )
      : [...this.customerSuggestions];
  }

  handleTableExport(event: JTableExportEvent): void {
    event.preventDefault();
    this.toast.info(`${event.rows.length} row(s) prepared for export.`, 'Export event', {
      position: 'bottom-right',
    });
  }
}

function variantExampleHtml(doc: ComponentDoc, key: string): string {
  const source = doc.code.variants ?? '';
  const markerIndex = Math.max(
    source.indexOf(`variant="${key}"`),
    source.indexOf(`variant='${key}'`),
  );

  if (markerIndex >= 0) {
    const start = source.lastIndexOf('<', markerIndex);
    const opening = source.slice(start).match(/^<([\w-]+)[^>]*>/)?.[0] ?? '';
    const tagName = opening.match(/^<([\w-]+)/)?.[1];

    if (opening.endsWith('/>')) {
      return opening;
    }
    if (tagName) {
      const closingTag = `</${tagName}>`;
      const closingIndex = source.indexOf(closingTag, markerIndex);
      if (closingIndex >= 0) {
        return source.slice(start, closingIndex + closingTag.length).trim();
      }
    }
  }

  return doc.code.basic.replace(/^<([\w-]+)/, `<$1 variant="${key}"`);
}

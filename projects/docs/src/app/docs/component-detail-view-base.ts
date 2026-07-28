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
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JAvatarGroupComponent } from 'jrng-ui/avatar-group';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JBottomSheetComponent } from 'jrng-ui/bottom-sheet';
import { JBreadcrumbComponent, JBreadcrumbItem, JBreadcrumbVariant } from 'jrng-ui/breadcrumb';
import { JButtonComponent, JButtonVariant } from 'jrng-ui/button';
import { JCalendarSchedulerComponent } from 'jrng-ui/calendar-scheduler';
import { JCardComponent } from 'jrng-ui/card';
import { JCarouselComponent } from 'jrng-ui/carousel';
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
} from 'jrng-ui/file-browser';
import { JFilePreviewComponent } from 'jrng-ui/file-preview';
import { JFileUploadComponent } from 'jrng-ui/file-upload';
import { JLabelComponent } from 'jrng-ui/label';
import { JFormFieldComponent } from 'jrng-ui/form-field';
import { JGalleryComponent } from 'jrng-ui/gallery';
import { JGanttComponent } from 'jrng-ui/gantt';
import { JGridColumnComponent, JGridComponent, JGridRowComponent } from 'jrng-ui/grid';
import { JGridLayoutComponent } from 'jrng-ui/grid-layout';
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
import { JPageHeaderComponent, JPageHeaderVariant } from 'jrng-ui/page-header';
import { JPopoverComponent } from 'jrng-ui/popover';
import {
  JQueryBuilderComponent,
  JQueryField,
  JQueryGroup,
  jCreateQueryCondition,
  jCreateQueryGroup,
} from 'jrng-ui/query-builder';
import { JProgressBarComponent, JProgressBarVariant } from 'jrng-ui/progress-bar';
import { JProgressSpinnerComponent } from 'jrng-ui/progress-spinner';
import { JRadioGroupComponent } from 'jrng-ui/radio-group';
import { JRadioComponent } from 'jrng-ui/radio';
import { JRatingComponent } from 'jrng-ui/rating';
import { JSelectComponent } from 'jrng-ui/select';
import { JSelectButtonComponent } from 'jrng-ui/select-button';
import { JSectionFooterComponent } from 'jrng-ui/section-footer';
import { JSectionHeaderComponent } from 'jrng-ui/section-header';
import { JSidebarNavComponent } from 'jrng-ui/sidebar-nav';
import { JSkeletonComponent } from 'jrng-ui/skeleton';
import { JSparklineComponent } from 'jrng-ui/sparkline';
import { JSplitterComponent, JSplitterPanelComponent } from 'jrng-ui/splitter';
import { JResponsiveSidebarComponent } from 'jrng-ui/responsive-sidebar';
import { JStatusChipComponent } from 'jrng-ui/status-chip';
import { JStepperComponent } from 'jrng-ui/stepper';
import { JSliderComponent } from 'jrng-ui/slider';
import { JSwitchComponent } from 'jrng-ui/switch';
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
import { JTopbarComponent } from 'jrng-ui/topbar';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JTourGuideComponent, JTourService, JTourStepDirective } from 'jrng-ui/tour';
import { JToastContainerComponent, JToastService } from 'jrng-ui/toast';
import { JTransferListComponent } from 'jrng-ui/transfer-list';
import { JTreeComponent } from 'jrng-ui/tree';
import { JTreeTableComponent } from 'jrng-ui/tree-table';
import { JVideoPlayerComponent } from 'jrng-ui/video-player';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';
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
  'page-header': ['default', 'stacked', 'centered'],
  'progress-bar': ['default', 'segmented', 'labeled'],
  stepper: ['default', 'rail', 'progress'],
  tabs: ['default', 'pills', 'segmented'],
  textarea: ['outlined', 'filled'],
  timeline: ['default', 'activity', 'alternating'],
};

const TABLE_FEATURE_EXAMPLES = [
  {
    key: 'basic',
    name: 'Basic table',
    details: 'Render flat, comparable records with semantic column headers.',
    html: `<j-table [value]="orders" [columns]="columns" caption="Recent orders" />`,
  },
  {
    key: 'columns',
    name: 'Typed columns',
    details:
      'Use JTableColumn<T> for checked fields, widths, alignment, value getters, and formatters.',
    html: `<j-table [value]="orders" [columns]="columns" />`,
  },
  {
    key: 'templates',
    name: 'Header and cell templates',
    details:
      'Replace selected headers or cells while retaining the table data and interaction model.',
    html: `<j-table [value]="orders" [columns]="columns">
  <ng-template jTableHeader="status" let-column>{{ column.header }} / owner</ng-template>
  <ng-template jTableCell="status" let-value="formattedValue"><strong>{{ value }}</strong></ng-template>
</j-table>`,
  },
  {
    key: 'variants',
    name: 'Visual variants',
    details: 'Choose a recognizable surface concept without changing table behavior.',
    html: `<j-table [value]="orders" [columns]="columns" variant="gridlines" />`,
  },
  {
    key: 'density',
    name: 'Density',
    details: 'Set information spacing independently from the visual variant.',
    html: `<j-table [value]="orders" [columns]="columns" density="compact" />`,
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
    html: `<j-table [value]="orders" [columns]="columns" loading loadingVariant="overlay" />`,
  },
  {
    key: 'no-data',
    name: 'No data',
    details:
      'Explain that the source dataset has no records and optionally offer a recovery action.',
    html: `<j-table [value]="[]" [columns]="columns" emptyTitle="No orders yet" emptyDescription="New orders will appear here." emptyActionLabel="Create order" />`,
  },
  {
    key: 'no-results',
    name: 'No results',
    details:
      'Automatically distinguish an active filter returning zero matches from an empty dataset.',
    html: `<j-table [value]="orders" [columns]="columns" globalFilter="not-a-match" noResultsTitle="No matching orders" />`,
  },
  {
    key: 'error',
    name: 'Error state',
    details: 'Present a loading failure as an alert without treating it as ordinary emptiness.',
    html: `<j-table [value]="[]" [columns]="columns" [errorState]="loadError" emptyActionLabel="Retry" />`,
  },
  {
    key: 'selection',
    name: 'Selection',
    details: 'Use the established row or checkbox selection behavior with any presentation.',
    html: `<j-table [value]="orders" [columns]="columns" selectionMode="checkbox" />`,
  },
  {
    key: 'pagination',
    name: 'Pagination',
    details: 'Page local or server-backed rows without changing empty-state semantics.',
    html: `<j-table [value]="orders" [columns]="columns" paginator [rows]="3" />`,
  },
  {
    key: 'sorting',
    name: 'Sorting',
    details: 'Mark sortable columns and activate them with pointer or keyboard input.',
    html: `<j-table [value]="orders" [columns]="columns" sortField="total" [sortOrder]="-1" />`,
  },
  {
    key: 'filtering',
    name: 'Filtering',
    details: 'Use the reusable filter row and typed match-mode configuration.',
    html: `<j-table [value]="orders" [columns]="columns" filterDisplay="row" showGlobalFilter />`,
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
    html: `<j-table [value]="orders" [columns]="columns" caption="Orders awaiting review" selectionMode="checkbox" />`,
  },
  {
    key: 'composition',
    name: 'Composition',
    details:
      'Column metadata, empty content, and loading content are integrated Table capabilities.',
    html: `<j-table [value]="orders" [columns]="columns" loadingVariant="skeleton">
  <ng-template jTableEmpty let-state>{{ state }}</ng-template>
  <ng-template jTableLoading let-variant>{{ variant }}</ng-template>
</j-table>`,
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
    'group',
    'Avatar group',
    `<j-avatar-group [items]="avatarPeople" [max]="3" ariaLabel="Project team" />`,
  ],
  [
    'overflow',
    'Overflow count',
    `<j-avatar-group [items]="avatarPeople" [max]="2" ariaLabel="Project team, three more members" />`,
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
    'team',
    'Assigned team',
    `<j-avatar-group [items]="avatarPeople" [max]="4" ariaLabel="Assigned team" />`,
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
    details: 'Format content with JRNG icon actions, word count, and fullscreen support.',
    html: `<j-editor
  label="Description"
  placeholder="Write a short summary"
  hint="Use the toolbar to format the document."
  showWordCount
  showFullscreen
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
    `<j-card header="Release plan" subheader="Version 0.0.9" footer="Updated today">All milestones are on track.</j-card>`,
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
    html: `<j-chart type="bar" [data]="monthlySignups" ariaLabel="Monthly signups" />`,
  },
  {
    key: 'line',
    name: 'Line chart',
    details: 'Show a time-series trend with accessible alternative text.',
    html: `<j-chart type="line" [data]="activeUsers" ariaLabel="Daily active users" />`,
  },
  {
    key: 'doughnut',
    name: 'Doughnut chart',
    details: 'Communicate a small part-to-whole comparison with clearly named segments.',
    html: `<j-chart type="doughnut" [data]="trafficSources" ariaLabel="Traffic sources" />`,
  },
  {
    key: 'mixed',
    name: 'Mixed chart',
    details: 'Combine related volume and target series when they share the same horizontal scale.',
    html: `<j-chart type="mixed" [data]="revenueAndTarget" ariaLabel="Revenue and target" />`,
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
  JAutocompleteComponent,
  JAvatarGroupComponent,
  JAvatarComponent,
  JBadgeComponent,
  JBreadcrumbComponent,
  JButtonComponent,
  JCardComponent,
  JChipComponent,
  JCheckboxComponent,
  JConfirmDialogComponent,
  JContainerComponent,
  JCopyButtonComponent,
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
  JListboxComponent,
  JLoaderComponent,
  JMaintenancePageComponent,
  JMenuComponent,
  JMeterGroupComponent,
  JMultiselectComponent,
  JPaginatorComponent,
  JPasswordComponent,
  JPanelComponent,
  JPageHeaderComponent,
  JPopoverComponent,
  JQueryBuilderComponent,
  JProgressBarComponent,
  JProgressSpinnerComponent,
  JRadioGroupComponent,
  JRadioComponent,
  JRatingComponent,
  JSelectComponent,
  JSelectButtonComponent,
  JSectionFooterComponent,
  JSectionHeaderComponent,
  JSkeletonComponent,
  JSparklineComponent,
  JResponsiveSidebarComponent,
  JStatusChipComponent,
  JSliderComponent,
  JSwitchComponent,
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
  JStepperComponent,
  JTieredMenuComponent,
  JTimePickerComponent,
  JTopbarComponent,
  JTransferListComponent,
  JTreeComponent,
  JTreeTableComponent,
  JVideoPlayerComponent,
  JVirtualScrollerComponent,
  JValidationMessageComponent,
  JCurrencyFormatPipe,
  JDateTimeFormatPipe,
  JFileSizeFormatPipe,
  JPercentFormatPipe,
  JTextTruncatePipe,
] as const;

@Directive()
export class ComponentDetailViewBase {
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
  readonly featureExamples = computed<readonly DetailFeatureExample[]>(() => {
    const doc = this.doc();
    if (doc.slug === 'table') {
      return [...TABLE_FEATURE_EXAMPLES, ...TABLE_SCENARIO_DOCS].map((example, index) => ({
        ...example,
        index,
      }));
    }
    if (doc.slug === 'text-expand') {
      return TEXT_EXPAND_FEATURE_EXAMPLES.map((example, index) =>
        example.key === 'characters'
          ? { ...example, index, ...demoSources['text-expand-basic-demo'] }
          : { ...example, index, responsivePreview: example.key === 'responsive' },
      );
    }
    if (doc.slug === 'button') {
      return BUTTON_FEATURE_EXAMPLES.map((example, index) =>
        example.key === 'basic'
          ? { ...example, index, ...demoSources['button-basic-demo'] }
          : { ...example, index },
      );
    }
    if (doc.slug === 'avatar') {
      return AVATAR_FEATURE_EXAMPLES.map((example, index) =>
        example.key === 'zoom'
          ? { ...example, index, ...demoSources['avatar-zoom-demo'] }
          : { ...example, index },
      );
    }
    if (doc.slug === 'date-picker') {
      return DATE_PICKER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'checkbox') {
      return CHECKBOX_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'editor') {
      return EDITOR_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'icon-field') {
      return ICON_FIELD_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'input-group') {
      return INPUT_GROUP_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'copy-button') {
      return COPY_BUTTON_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'radio') {
      return RADIO_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'data-view') {
      return DATA_VIEW_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'timeline') {
      return TIMELINE_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'virtual-scroller') {
      return VIRTUAL_SCROLLER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'accordion-header') {
      return ACCORDION_HEADER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'accordion-content') {
      return ACCORDION_CONTENT_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'divider') {
      return DIVIDER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'splitter') {
      return SPLITTER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'splitter-panel') {
      return SPLITTER_PANEL_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'stepper') {
      return STEPPER_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'carousel') {
      return CAROUSEL_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'gallery') {
      return GALLERY_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'html-preview') {
      return HTML_PREVIEW_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    if (doc.slug === 'loader') {
      return LOADER_FEATURE_EXAMPLES.map((example, index) =>
        example.key === 'basic'
          ? { ...example, index, ...demoSources['loader-types-demo'] }
          : { ...example, index },
      );
    }
    if (doc.slug === 'card') {
      return CARD_FEATURE_EXAMPLES.map((example, index) =>
        example.key === 'metric'
          ? { ...example, index, ...demoSources['card-metric-demo'] }
          : { ...example, index },
      );
    }
    if (doc.slug === 'chart') {
      return CHART_FEATURE_EXAMPLES.map((example, index) => ({ ...example, index }));
    }
    const gridExamples = GRID_FEATURE_EXAMPLES[doc.slug];
    if (gridExamples) {
      return gridExamples.map((example, index) => ({ ...example, index }));
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
      return examples;
    }

    return keys.map((key, index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      details: doc.variants[index] ?? doc.description,
      key,
      index,
      html: variantExampleHtml(doc, key),
      responsivePreview: key === 'responsive',
    }));
  });
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
    this.editorValue = '<p>Build accessible Angular interfaces with stable components.</p>';
    this.editorHtmlValue = '<h2>Release 0.0.9</h2><p>Accessibility checks passed.</p>';
    this.meetingTime = '14:30';
    this.selectedCustomer = 'acme';
    this.tags = [
      { label: 'Angular', severity: 'primary' },
      { label: 'Accessibility', severity: 'success' },
    ];
    this.maskedPhone = '(555) 123-4567';
    this.employeeId = 'JR-2048';
    this.autocompleteSuggestions = [...this.customerSuggestions];
    this.fileBrowserSelection = ['report'];
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
  readonly diffBefore = { name: 'Item A', status: 'Pending', amount: 100 };
  readonly diffAfter = { name: 'Item A', status: 'Approved', amount: 125 };
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
  readonly avatarPeople = [
    { label: 'Avery Reed', image: '/assets/images/avatar-user-01.webp' },
    { label: 'Morgan Kim', image: '/assets/images/avatar-user-02.webp' },
    { label: 'Jordan Lee', image: '/assets/images/avatar-user-03.webp' },
    { label: 'Sam Rivera', image: '/assets/images/avatar-user-04.webp' },
    { label: 'Sam Rivera' },
    { label: 'Taylor Brooks' },
  ] as const;

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
  readonly progressBarVariants: readonly JProgressBarVariant[] = [
    'default',
    'segmented',
    'labeled',
  ];
  readonly breadcrumbVariants: readonly JBreadcrumbVariant[] = ['default', 'contained', 'steps'];
  readonly emptyStateVariants: readonly JEmptyStateVariant[] = ['default', 'inline', 'panel'];
  readonly pageHeaderVariants: readonly JPageHeaderVariant[] = ['standard', 'stacked', 'centered'];
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
  editorValue = '<p>Build accessible Angular interfaces with stable components.</p>';
  editorHtmlValue = '<h2>Release 0.0.9</h2><p>Accessibility checks passed.</p>';
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
  readonly avatarGroupItems = [
    { label: 'Avery Reed' },
    { label: 'Morgan Kim' },
    { label: 'Jordan Lee' },
    { label: 'Taylor Smith' },
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
  readonly schedulerEvents = [
    {
      id: 'planning',
      title: 'Planning',
      start: new Date(2026, 6, 12, 10),
      end: new Date(2026, 6, 12, 11),
      color: '#6366f1',
    },
    {
      id: 'review',
      title: 'Design review',
      start: new Date(2026, 6, 14, 14),
      end: new Date(2026, 6, 14, 15),
      color: '#0ea5e9',
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
    datasets: [{ label: 'Signups', data: [32, 48, 41, 64, 78], backgroundColor: '#6366f1' }],
  };
  readonly lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active users',
        data: [120, 154, 148, 190, 224, 205, 248],
        borderColor: '#0891b2',
        backgroundColor: 'rgba(8, 145, 178, 0.14)',
        fill: true,
        tension: 0.35,
      },
    ],
  };
  readonly doughnutChartData = {
    labels: ['Direct', 'Search', 'Referrals'],
    datasets: [{ label: 'Sessions', data: [46, 34, 20] }],
  };
  readonly mixedChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
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
  readonly fileBrowserItems: readonly JFileBrowserItem[] = [
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
    { id: 'logo', name: 'Brand mark.png', kind: 'file', size: 56320, modifiedAt: '2026-07-08' },
  ];
  readonly fileBrowserBreadcrumbs = [
    { id: 'home', label: 'Home' },
    { id: 'clients', label: 'Clients' },
    { id: 'acme', label: 'Acme Pty Ltd' },
  ] as const;
  readonly fileBrowserActions = [
    { id: 'download', label: 'Download', selection: 'any' as const },
    { id: 'delete', label: 'Delete', selection: 'any' as const },
  ];
  fileBrowserSelection: readonly string[] = ['report'];
  readonly fileBrowserActionMessage = signal('');

  handleFileBrowserAction(event: JFileBrowserActionEvent): void {
    const names = event.items.map((item) => item.name).join(', ');
    this.fileBrowserActionMessage.set(`${event.action.label}: ${names}`);
    if (event.action.id === 'delete') {
      const removed = new Set(event.items.map((item) => item.id));
      this.fileBrowserSelection = this.fileBrowserSelection.filter((id) => !removed.has(id));
    }
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
    { id: 'design', label: 'Design', start: '2026-07-06', end: '2026-07-12', progress: 100 },
    { id: 'build', label: 'Build', start: '2026-07-10', end: '2026-07-20', progress: 65 },
    { id: 'qa', label: 'QA', start: '2026-07-18', end: '2026-07-24', progress: 20 },
  ] as const;
  readonly kanbanColumns = [
    {
      id: 'todo',
      title: 'To do',
      cards: [
        { id: 'docs', title: 'Polish docs spacing', metadata: 'Design system' },
        { id: 'tests', title: 'Add visual tests', metadata: 'Quality' },
      ],
    },
    {
      id: 'doing',
      title: 'In progress',
      cards: [{ id: 'previews', title: 'Complete previews', metadata: 'Documentation' }],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [{ id: 'checkbox', title: 'Fix checkbox alignment', metadata: 'Components' }],
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
  readonly treeNodes = [
    {
      key: 'workspace',
      label: 'Workspace',
      children: [
        { key: 'components', label: 'Components', leaf: true },
        { key: 'guides', label: 'Guides', leaf: true },
      ],
    },
    { key: 'archive', label: 'Archive', leaf: true },
  ] as const;
  readonly lazyTreeNodes = [
    { key: 'shared', label: 'Shared workspace', leaf: false },
    { key: 'archive', label: 'Archive', leaf: true },
  ] as const;
  readonly tableLoadError = new Error('Client records could not be loaded.');
  readonly treeColumns: readonly JTableColumn[] = [
    { field: 'label', header: 'Name' },
    { field: 'type', header: 'Type' },
  ];
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
  readonly clientColumns: readonly JTableColumn[] = [
    {
      field: 'code',
      header: 'Client code',
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
      field: 'legalName',
      header: 'Legal name',
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
      field: 'tradingName',
      header: 'Public name',
      filterable: true,
      minWidth: '12rem',
      filter: { operators: ['contains', 'equals', 'notEquals'] },
    },
    {
      field: 'parentClient',
      header: 'Parent account',
      filterable: true,
      minWidth: '11rem',
      filter: { operators: ['contains', 'equals', 'isEmpty', 'isNotEmpty'] },
    },
    {
      field: 'billingType',
      header: 'Billing type',
      sortable: true,
      filterable: true,
      minWidth: '10rem',
      filter: {
        type: 'select',
        operators: ['equals', 'notEquals'],
        options: [
          { label: 'Monthly', value: 'Monthly' },
          { label: 'Prepaid', value: 'Prepaid' },
          { label: 'Project', value: 'Project' },
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
          label: 'View client',
          command: (event) => this.handleTableAction(event),
        },
        {
          key: 'edit',
          label: 'Edit client',
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

  readonly clientRows = [
    {
      id: 1,
      code: 'CL-10018',
      legalName: 'Northstar Logistics Ltd.',
      tradingName: 'Northstar',
      parentClient: 'Northstar Group',
      billingType: 'Monthly',
      active: true,
    },
    {
      id: 2,
      code: 'CL-10024',
      legalName: 'Harbor & Pine Retail Co.',
      tradingName: 'Harbor & Pine',
      parentClient: '',
      billingType: 'Prepaid',
      active: true,
    },
    {
      id: 3,
      code: 'CL-10031',
      legalName: 'Summit Field Services',
      tradingName: 'Summit Field',
      parentClient: 'Summit Holdings',
      billingType: 'Project',
      active: false,
    },
    {
      id: 4,
      code: 'CL-10042',
      legalName: 'Blue Cedar Technologies',
      tradingName: 'Blue Cedar',
      parentClient: '',
      billingType: 'Monthly',
      active: true,
    },
    {
      id: 5,
      code: 'CL-10056',
      legalName: 'Crescent Energy Partners',
      tradingName: 'Crescent Energy',
      parentClient: 'Crescent Group',
      billingType: 'Project',
      active: true,
    },
    {
      id: 6,
      code: 'CL-10063',
      legalName: 'Oakline Property Services',
      tradingName: 'Oakline',
      parentClient: '',
      billingType: 'Prepaid',
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

  readonly pageHeaderBreadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Operations', url: '/docs' },
    { label: 'Orders' },
  ] as const;

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
  showToast(severity: 'success' | 'error' | 'warning'): void {
    if (severity === 'success') {
      this.toast.success('The project was saved.', 'Saved', { position: 'bottom-right' });
      return;
    }
    if (severity === 'error') {
      this.toast.error('Check the required fields and try again.', 'Could not save', {
        position: 'bottom-right',
      });
      return;
    }
    this.toast.warning('Some changes still need review.', 'Review required', {
      position: 'bottom-right',
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

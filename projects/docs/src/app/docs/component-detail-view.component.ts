import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  PLATFORM_ID,
  ChangeDetectionStrategy,
  Component,
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
import { JAuthLayoutComponent } from 'jrng-ui/auth-layout';
import { JAutocompleteComponent } from 'jrng-ui/autocomplete';
import { JAvatarGroupComponent } from 'jrng-ui/avatar-group';
import { JAvatarComponent } from 'jrng-ui/avatar';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JBottomSheetComponent } from 'jrng-ui/bottom-sheet';
import { JBreadcrumbComponent, JBreadcrumbItem, JBreadcrumbVariant } from 'jrng-ui/breadcrumb';
import { JButtonComponent, JButtonVariant } from 'jrng-ui/button';
import { JCalendarSchedulerComponent } from 'jrng-ui/calendar-scheduler';
import { JCalendarComponent } from 'jrng-ui/calendar';
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
import { JDataGridComponent } from 'jrng-ui/data-grid';
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
import { JFileBrowserComponent, JFileBrowserItem } from 'jrng-ui/file-browser';
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
import { JStepperComponent, JStepperVariant } from 'jrng-ui/stepper';
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
import { JTimelineComponent, JTimelineItem, JTimelineVariant } from 'jrng-ui/timeline';
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
import { demoSources } from '../demos/demo-sources.generated';
import {
  PriorityComponentGuidance,
  priorityComponentGuidance,
} from './priority-component-guidance';

type DetailCodeTab = 'html' | 'ts' | 'scss' | 'data';

interface DetailFeatureExample {
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
    `<j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" size="lg" />`,
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
    `<span class="avatar-badge"><j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" /><j-badge value="4" severity="danger" /></span>`,
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
    `<div class="profile"><j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" size="lg" previewable /><div><strong>Avery Reed</strong><span>Product designer</span></div></div>`,
  ],
  [
    'comment',
    'Comment author',
    `<div class="comment"><j-avatar image="/assets/avatars/morgan.svg" label="Morgan Kim" /><div><strong>Morgan Kim</strong><span>Updated the release checklist.</span></div></div>`,
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
    `<j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" previewable previewAriaLabel="Preview Avery Reed profile image" />`,
  ],
  [
    'zoom',
    'Zoomable avatar',
    `<j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" previewable />`,
  ],
  [
    'static',
    'Non-zoomable avatar',
    `<j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" size="lg" />`,
  ],
].map(([key, name, html]) => ({
  key,
  name,
  details: `${name} in a realistic people or assignment context.`,
  html,
}));

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
    `<j-card header="Avery Reed" subheader="Product designer"><j-avatar image="/assets/avatars/avery.svg" label="Avery Reed" size="lg" /></j-card>`,
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

@Component({
  selector: 'app-component-detail-view',
  imports: [
    FormsModule,
    CodeBlockComponent,
    ButtonBasicDemoComponent,
    AvatarZoomDemoComponent,
    LoaderTypesDemoComponent,
    TextExpandBasicDemoComponent,
    CardMetricDemoComponent,
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
    JDataGridComponent,
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
    JAuthLayoutComponent,
    JBottomSheetComponent,
    JCalendarSchedulerComponent,
    JCalendarComponent,
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
  ],
  template: `
    <div class="j-doc-detail-layout">
      <article class="j-doc-detail" [class.j-doc-detail--api]="detailViewTab() === 'api'">
        <nav class="j-component-view-tabs" aria-label="Component documentation view">
          <button
            type="button"
            [class.is-active]="detailViewTab() === 'features'"
            [attr.aria-pressed]="detailViewTab() === 'features'"
            (click)="detailViewTab.set('features')"
          >
            Features
          </button>
          <button
            type="button"
            [class.is-active]="detailViewTab() === 'api'"
            [attr.aria-pressed]="detailViewTab() === 'api'"
            (click)="detailViewTab.set('api')"
          >
            API
          </button>
        </nav>

        @if (detailViewTab() === 'features') {
          <header class="j-doc-detail__header">
            <div>
              <h1 tabindex="-1" data-component-heading>{{ doc().name }}</h1>
              <p class="j-doc-lead">{{ doc().description }}</p>
            </div>
          </header>

          <section class="j-doc-opening-section" id="component-overview">
            <h3>Overview</h3>
            <p>{{ doc().description }}</p>
          </section>

          <section class="j-doc-opening-section" id="component-import">
            <h3>Import</h3>
            <app-code-block label="Import" language="ts" [code]="doc().code.importCode" />
          </section>

          @for (example of featureExamples(); track example.key) {
            <section
              class="j-preview-code-tabs j-feature-example"
              [attr.id]="'component-preview-' + example.key"
              [attr.aria-label]="example.name + ' preview and code'"
            >
              <div class="j-doc-opening-section">
                <h3>{{ example.name }}</h3>
                <p>{{ example.details }}</p>
              </div>
              <div class="j-preview-card" [attr.id]="'component-live-preview-' + example.key">
                @if (example.responsivePreview) {
                  <div class="j-preview-viewport-toolbar" aria-label="Preview viewport">
                    @for (viewport of previewWidths; track viewport.label) {
                      <button
                        type="button"
                        [attr.aria-pressed]="previewWidth() === viewport.width"
                        (click)="previewWidth.set(viewport.width)"
                      >
                        {{ viewport.label }}
                      </button>
                    }
                  </div>
                }
                <div
                  class="j-preview-surface"
                  [style.max-width.px]="example.responsivePreview ? previewWidth() : null"
                  [class.j-preview-surface--overlay]="overlayPreviewSlugs.has(doc().slug)"
                  [class.j-preview-surface--status]="statusPreviewSlugs.has(doc().slug)"
                >
                  @defer {
                    @switch (doc().slug) {
                      @case ('accordion') {
                        <j-accordion [variant]="accordionVariants[example.index]" value="account">
                          <j-accordion-panel value="account">
                            <j-accordion-header>Account details</j-accordion-header>
                            <j-accordion-content
                              >Update profile and contact information.</j-accordion-content
                            >
                          </j-accordion-panel>
                          <j-accordion-panel value="disabled" disabled>
                            <j-accordion-header>Disabled section</j-accordion-header>
                            <j-accordion-content>Unavailable content.</j-accordion-content>
                          </j-accordion-panel>
                        </j-accordion>
                      }
                      @case ('accordion-panel') {
                        <j-accordion value="summary">
                          <j-accordion-panel value="summary">
                            <j-accordion-header>Project summary</j-accordion-header>
                            <j-accordion-content
                              >This panel is expanded by default.</j-accordion-content
                            >
                          </j-accordion-panel>
                          <j-accordion-panel value="team">
                            <j-accordion-header>Team members</j-accordion-header>
                            <j-accordion-content
                              >Panel content can contain any Angular template.</j-accordion-content
                            >
                          </j-accordion-panel>
                        </j-accordion>
                      }
                      @case ('autocomplete') {
                        <div class="j-overlay-form-preview">
                          <j-autocomplete
                            label="Customer"
                            [suggestions]="autocompleteSuggestions"
                            placeholder="Type a customer name"
                            (completeMethod)="filterCustomerSuggestions($event)"
                          />
                          <p class="j-preview-note">
                            Type “Acme” or “Northwind” to filter suggestions.
                          </p>
                        </div>
                      }
                      @case ('avatar') {
                        <div class="j-preview-row">
                          @if (example.key === 'zoom') {
                            <app-avatar-zoom-demo />
                          } @else {
                            @switch (example.key) {
                              @case ('character') {
                                <j-avatar initials="A" ariaLabel="Avery" />
                              }
                              @case ('icon') {
                                <j-avatar ariaLabel="Unassigned user"
                                  ><j-icon name="user" aria-hidden="true"
                                /></j-avatar>
                              }
                              @case ('image') {
                                <j-avatar
                                  image="/assets/avatars/avery.svg"
                                  label="Avery Reed"
                                  size="lg"
                                />
                              }
                              @case ('square') {
                                <j-avatar
                                  initials="AR"
                                  ariaLabel="Avery Reed"
                                  shape="square"
                                  size="lg"
                                />
                              }
                              @case ('sizes') {
                                <j-avatar initials="AR" ariaLabel="Avery Reed" size="sm" /><j-avatar
                                  initials="AR"
                                  ariaLabel="Avery Reed"
                                /><j-avatar initials="AR" ariaLabel="Avery Reed" size="lg" />
                              }
                              @case ('colors') {
                                <j-avatar
                                  initials="AR"
                                  ariaLabel="Avery Reed"
                                  style="--j-color-surface-subtle: var(--j-color-primary-soft); --j-color-text: var(--j-color-primary)"
                                />
                              }
                              @case ('status') {
                                <j-avatar
                                  initials="AR"
                                  ariaLabel="Avery Reed, online"
                                  status="online"
                                /><j-avatar
                                  initials="MK"
                                  ariaLabel="Morgan Kim, away"
                                  status="away"
                                /><j-avatar
                                  initials="JL"
                                  ariaLabel="Jordan Lee, offline"
                                  status="offline"
                                />
                              }
                              @case ('badge') {
                                <span class="j-avatar-doc-badge"
                                  ><j-avatar
                                    image="/assets/avatars/avery.svg"
                                    label="Avery Reed" /><j-badge value="4" severity="danger"
                                /></span>
                              }
                              @case ('group') {
                                <j-avatar-group
                                  [items]="avatarPeople"
                                  [max]="3"
                                  ariaLabel="Project team"
                                />
                              }
                              @case ('overflow') {
                                <j-avatar-group
                                  [items]="avatarPeople"
                                  [max]="2"
                                  ariaLabel="Project team, three more members"
                                />
                              }
                              @case ('profile') {
                                <div class="j-profile-avatar-example">
                                  <j-avatar
                                    image="/assets/avatars/avery.svg"
                                    label="Avery Reed"
                                    size="lg"
                                    previewable
                                  />
                                  <div>
                                    <strong>Avery Reed</strong><span>Product designer</span>
                                  </div>
                                </div>
                              }
                              @case ('comment') {
                                <div class="j-profile-avatar-example">
                                  <j-avatar image="/assets/avatars/morgan.svg" label="Morgan Kim" />
                                  <div>
                                    <strong>Morgan Kim</strong
                                    ><span>Updated the release checklist.</span>
                                  </div>
                                </div>
                              }
                              @case ('team') {
                                <j-avatar-group
                                  [items]="avatarPeople"
                                  [max]="4"
                                  ariaLabel="Assigned team"
                                />
                              }
                              @case ('fallback') {
                                <j-avatar
                                  image="/assets/avatars/missing.svg"
                                  label="Avery Reed"
                                  initials="AR"
                                />
                              }
                              @case ('clickable') {
                                <j-avatar
                                  image="/assets/avatars/avery.svg"
                                  label="Avery Reed"
                                  previewable
                                  previewAriaLabel="Preview Avery Reed profile image"
                                />
                              }
                              @case ('static') {
                                <j-avatar
                                  image="/assets/avatars/avery.svg"
                                  label="Avery Reed"
                                  size="lg"
                                />
                              }
                              @default {
                                <j-avatar initials="AR" ariaLabel="Avery Reed" />
                              }
                            }
                          }
                        </div>
                      }
                      @case ('chip') {
                        <div class="j-preview-row">
                          <j-chip label="Design" />
                          <j-chip label="Approved" severity="success" />
                          <j-chip
                            label="Removable filter"
                            removable
                            removeAriaLabel="Clear criterion"
                          />
                        </div>
                      }
                      @case ('color-picker') {
                        <div class="j-overlay-form-preview j-overlay-form-preview--compact">
                          <j-color-picker
                            label="Brand colour"
                            [(ngModel)]="brandColor"
                            [presetColors]="brandPresets"
                            clearable
                          />
                        </div>
                      }
                      @case ('date-picker') {
                        <div class="j-preview-grid j-overlay-form-preview">
                          <j-date-picker
                            label="Due date"
                            placeholder="Choose a date"
                            [(ngModel)]="dueDate"
                          />
                          <j-date-picker
                            label="Date range"
                            selectionMode="range"
                            placeholder="Choose dates"
                            [presets]="datePresets"
                            [(ngModel)]="pickerRange"
                          />
                        </div>
                      }
                      @case ('divider') {
                        <div class="j-preview-stack">
                          <span>Profile details</span>
                          <j-divider />
                          <span>Notification preferences</span>
                        </div>
                      }
                      @case ('icon') {
                        <div class="j-preview-row">
                          <j-icon name="search" ariaLabel="Search" />
                          <j-icon name="settings" ariaLabel="Settings" size="24" />
                          <j-icon name="circle-check" ariaLabel="Complete" size="32" />
                        </div>
                      }
                      @case ('input-mask') {
                        <div class="j-preview-grid">
                          <j-input-mask
                            label="Call-back line"
                            mask="(999) 999-9999"
                            placeholder="(555) 123-4567"
                            [(ngModel)]="maskedPhone"
                          />
                          <j-input-mask
                            label="Employee ID"
                            mask="aa-9999"
                            placeholder="AB-2048"
                            [(ngModel)]="employeeId"
                          />
                        </div>
                      }
                      @case ('input-number') {
                        <div class="j-preview-grid">
                          <j-input-number
                            label="Quantity"
                            [min]="1"
                            [max]="100"
                            [(ngModel)]="quantity"
                          />
                          <j-input-number
                            label="Budget"
                            mode="currency"
                            currency="USD"
                            [(ngModel)]="budget"
                          />
                        </div>
                      }
                      @case ('input-otp') {
                        <j-input-otp
                          label="Verification code"
                          [length]="6"
                          numericOnly
                          [(ngModel)]="otp"
                        />
                      }
                      @case ('listbox') {
                        <j-listbox
                          label="Team"
                          [options]="teamOptions"
                          [(ngModel)]="selectedTeam"
                        />
                      }
                      @case ('multiselect') {
                        <j-multiselect
                          label="Skills"
                          [options]="skillOptions"
                          placeholder="Select skills"
                          [(ngModel)]="selectedSkills"
                        />
                      }
                      @case ('paginator') {
                        <j-paginator
                          [variant]="paginatorVariants[example.index]"
                          [first]="20"
                          [rows]="10"
                          [totalRecords]="96"
                          [rowsPerPageOptions]="[10, 20, 50]"
                          showCurrentPageReport
                        />
                      }
                      @case ('password') {
                        <j-password
                          label="Password"
                          placeholder="Enter a secure password"
                          feedback
                          toggleVisibility
                        />
                      }
                      @case ('progress-spinner') {
                        <div class="j-preview-row">
                          <j-progress-spinner label="Loading orders" />
                          <j-progress-spinner
                            label="Loading report"
                            [size]="48"
                            [strokeWidth]="3"
                          />
                        </div>
                      }
                      @case ('rating') {
                        <j-rating label="Product rating" [(ngModel)]="rating" />
                      }
                      @case ('slider') {
                        <j-slider
                          label="Completion"
                          [min]="0"
                          [max]="100"
                          [step]="5"
                          tooltip
                          [(ngModel)]="completion"
                        />
                      }
                      @case ('input') {
                        <j-input
                          label="Email"
                          placeholder="name@example.com"
                          [variant]="inputVariants[example.index]"
                        />
                      }
                      @case ('textarea') {
                        <j-textarea
                          label="Message"
                          placeholder="Write a short message"
                          [variant]="inputVariants[example.index]"
                          showCount
                          [maxLength]="120"
                          [rows]="4"
                          fullWidth
                        />
                      }
                      @case ('select') {
                        <div class="j-preview-grid j-overlay-form-preview">
                          <j-select
                            label="Status"
                            [options]="statuses"
                            placeholder="Choose status"
                            clearable
                          />
                          <j-select
                            label="Searchable team"
                            [options]="teams"
                            optionLabel="name"
                            optionValue="id"
                            searchable
                          />
                          <j-select label="Loading" [options]="statuses" loading />
                          <j-select
                            label="Required"
                            [options]="statuses"
                            invalid
                            error="Choose a status"
                          />
                        </div>
                      }
                      @case ('checkbox') {
                        <div class="j-preview-row">
                          <j-checkbox label="Send receipt" [(ngModel)]="checked" />
                          <j-checkbox label="Partial selection" indeterminate />
                          <j-checkbox label="Disabled" disabled />
                          <j-checkbox label="Invalid" invalid error="Required" />
                        </div>
                      }
                      @case ('radio') {
                        <div class="j-preview-row">
                          <j-radio
                            name="plan-docs"
                            label="Starter"
                            value="starter"
                            [(ngModel)]="plan"
                          />
                          <j-radio name="plan-docs" label="Pro" value="pro" [(ngModel)]="plan" />
                          <j-radio
                            name="plan-docs"
                            label="Enterprise"
                            value="enterprise"
                            disabled
                            [(ngModel)]="plan"
                          />
                        </div>
                      }
                      @case ('switch') {
                        <div class="j-preview-row">
                          <j-switch label="Email alerts" [(ngModel)]="enabled" />
                          <j-switch onLabel="Published" offLabel="Draft" [(ngModel)]="published" />
                          <j-switch label="Disabled" disabled />
                          <j-switch label="Large" size="lg" [(ngModel)]="enabled" />
                        </div>
                      }
                      @case ('button') {
                        @if (example.key === 'basic') {
                          <app-button-basic-demo />
                        } @else if (example.key === 'group') {
                          <div class="j-preview-row">
                            <j-button label="Save" /><j-button
                              label="Preview"
                              variant="outlined"
                            /><j-button label="Cancel" variant="soft" />
                          </div>
                        } @else if (example.key === 'toolbar') {
                          <j-toolbar
                            ><j-button label="New" icon="plus" /><j-button
                              label="Export"
                              variant="outlined" /><j-button
                              icon="settings"
                              actionDisplay="icon"
                              ariaLabel="Toolbar settings"
                              variant="soft"
                          /></j-toolbar>
                        } @else if (example.key === 'form') {
                          <form class="j-preview-row">
                            <j-button label="Submit" type="submit" /><j-button
                              label="Reset"
                              type="reset"
                              variant="soft"
                            />
                          </form>
                        } @else if (example.key === 'severity') {
                          <div class="j-preview-row">
                            <j-button label="Primary" /><j-button
                              label="Success"
                              severity="success"
                            /><j-button label="Info" severity="info" /><j-button
                              label="Warning"
                              severity="warning"
                            /><j-button label="Danger" severity="danger" /><j-button
                              label="Neutral"
                              severity="neutral"
                            /><j-button label="Contrast" severity="contrast" />
                          </div>
                        } @else if (example.key === 'template') {
                          <j-button
                            ><strong>Approve</strong><span jButtonSuffix>⌘ Enter</span></j-button
                          >
                        } @else {
                          <j-button
                            [label]="buttonExampleLabel(example.key)"
                            [variant]="buttonExampleVariant(example.key)"
                            [severity]="example.key === 'destructive' ? 'danger' : 'primary'"
                            [shape]="example.key === 'pill' ? 'pill' : 'rounded'"
                            [icon]="buttonExampleIcon(example.key)"
                            [iconPosition]="example.key === 'icon-after' ? 'right' : 'left'"
                            [actionDisplay]="example.key === 'icon-only' ? 'icon' : 'icon-label'"
                            [ariaLabel]="example.key === 'icon-only' ? 'Open settings' : ''"
                            [loading]="example.key === 'loading'"
                            [disabled]="example.key === 'disabled'"
                            [width]="example.key === 'full-width' ? 'full' : 'auto'"
                            [badge]="example.key === 'badge' ? 4 : null"
                            badgeAriaLabel="4 unread notifications"
                          />
                        }
                      }
                      @case ('icon-button') {
                        <j-button
                          icon="settings"
                          ariaLabel="Settings"
                          actionDisplay="icon"
                          [variant]="buttonVariants[example.index]"
                        />
                      }
                      @case ('card') {
                        @if (example.key === 'metric') {
                          <app-card-metric-demo />
                        } @else {
                          @switch (example.key) {
                            @case ('slots') {
                              <j-card
                                header="Release plan"
                                subheader="Version 0.0.9"
                                footer="Updated today"
                                >All milestones are on track.</j-card
                              >
                            }
                            @case ('form') {
                              <j-card header="Workspace settings"
                                ><j-input label="Workspace name" value="Operations" /><j-button
                                  jCardActions
                                  label="Save"
                              /></j-card>
                            }
                            @case ('profile') {
                              <j-card header="Avery Reed" subheader="Product designer"
                                ><j-avatar
                                  image="/assets/avatars/avery.svg"
                                  label="Avery Reed"
                                  size="lg"
                              /></j-card>
                            }
                            @case ('product') {
                              <j-card header="Team plan" subheader="For growing teams"
                                ><strong>$24 / month</strong
                                ><j-button jCardActions label="Choose plan"
                              /></j-card>
                            }
                            @case ('pricing') {
                              <j-card header="Business" subheader="Advanced controls"
                                ><strong>$49 / month</strong
                                ><j-button jCardActions label="Start trial"
                              /></j-card>
                            }
                            @case ('trend') {
                              <j-card header="Active accounts"
                                ><strong>1,284</strong><j-badge value="+8.2%" severity="success"
                              /></j-card>
                            }
                            @case ('chart') {
                              <j-card header="Weekly volume"
                                ><j-progress-bar [value]="64" label="64% of weekly target"
                              /></j-card>
                            }
                            @case ('progress') {
                              <j-card header="Storage"
                                ><strong>72 GB of 100 GB</strong
                                ><j-progress-bar [value]="72" label="72% used"
                              /></j-card>
                            }
                            @case ('status') {
                              <j-card header="Release status"
                                ><j-badge value="Ready" severity="success" />
                                <p>All required checks passed.</p></j-card
                              >
                            }
                            @case ('clickable') {
                              <j-card
                                header="Open project"
                                subheader="Keyboard focusable"
                                interactive
                                ><p>View project details.</p></j-card
                              >
                            }
                            @case ('loading') {
                              <j-card header="Loading report" skeleton />
                            }
                            @case ('empty') {
                              <j-card header="Saved views"
                                ><j-empty
                                  title="No saved views"
                                  description="Save a filter to reuse it here."
                                  variant="inline"
                              /></j-card>
                            }
                            @case ('error') {
                              <j-card header="Account summary"
                                ><j-empty
                                  title="Could not load summary"
                                  description="Try again in a moment."
                                  variant="inline"
                              /></j-card>
                            }
                            @case ('template') {
                              <j-card
                                ><div jCardHeader><strong>Custom header</strong></div>
                                <p>Projected card content.</p>
                                <j-button jCardActions label="Continue"
                              /></j-card>
                            }
                            @default {
                              <j-card header="Design review"
                                ><p>
                                  Review navigation and responsive behavior before release.
                                </p></j-card
                              >
                            }
                          }
                        }
                      }
                      @case ('badge') {
                        <div class="j-preview-row">
                          <j-badge value="12" />
                          <j-badge value="Active" severity="success" />
                          <j-badge value="Warning" severity="warning" />
                          <j-badge value="Error" severity="danger" />
                          <j-badge value="Info" severity="info" size="lg" />
                        </div>
                      }
                      @case ('tag') {
                        <div class="j-preview-row">
                          <j-tag label="Design" />
                          <j-tag label="Published" severity="success" rounded />
                          <j-tag label="Blocked" severity="danger" />
                          <j-tag label="Filter" removable removeLabel="Clear criterion" />
                        </div>
                      }
                      @case ('table') {
                        <div class="j-table-doc-example">
                          @switch (example.key) {
                            @case ('templates') {
                              <j-table [value]="clientRows" [columns]="clientColumns">
                                <ng-template jTableHeader="legalName" let-column>
                                  {{ column.header }} / account
                                </ng-template>
                                <ng-template jTableCell="active" let-value="formattedValue">
                                  <strong>{{ value }}</strong>
                                </ng-template>
                              </j-table>
                            }
                            @case ('variants') {
                              @for (variant of tableVariants; track variant) {
                                <div class="j-table-doc-variant">
                                  <span class="j-preview-label">{{ variant }}</span>
                                  <j-table
                                    [value]="clientRows.slice(0, 2)"
                                    [columns]="clientColumns"
                                    [variant]="variant"
                                  />
                                </div>
                              }
                            }
                            @case ('density') {
                              @for (density of tableDensities; track density) {
                                <div class="j-table-doc-variant">
                                  <span class="j-preview-label">{{ density }}</span>
                                  <j-table
                                    [value]="clientRows.slice(0, 2)"
                                    [columns]="clientColumns"
                                    [density]="density"
                                  />
                                </div>
                              }
                            }
                            @case ('skeleton') {
                              <j-table
                                [value]="[]"
                                [columns]="clientColumns"
                                loading
                                loadingVariant="skeleton"
                                [skeletonRows]="4"
                              />
                            }
                            @case ('overlay') {
                              <j-table
                                [value]="clientRows.slice(0, 3)"
                                [columns]="clientColumns"
                                loading
                                loadingVariant="overlay"
                              />
                            }
                            @case ('no-data') {
                              <j-table
                                [value]="[]"
                                [columns]="clientColumns"
                                emptyTitle="No clients yet"
                                emptyDescription="New client records will appear here."
                                emptyActionLabel="Add account"
                              />
                            }
                            @case ('no-results') {
                              <j-table
                                [value]="clientRows"
                                [columns]="clientColumns"
                                globalFilter="no matching client"
                                noResultsTitle="No matching clients"
                              />
                            }
                            @case ('error') {
                              <j-table
                                [value]="[]"
                                [columns]="clientColumns"
                                [errorState]="tableLoadError"
                                emptyActionLabel="Retry"
                              />
                            }
                            @case ('tree-table') {
                              <j-tree-table [value]="treeNodes" [columns]="treeColumns" />
                            }
                            @case ('lazy-tree-table') {
                              <j-tree-table [value]="lazyTreeNodes" [columns]="treeColumns" lazy />
                            }
                            @case ('migration') {
                              <j-table [value]="[]" [columns]="clientColumns">
                                <ng-template jTableEmpty let-state>
                                  <div class="j-preview-note">Integrated state: {{ state }}</div>
                                </ng-template>
                              </j-table>
                            }
                            @default {
                              <j-table
                                [value]="clientRows"
                                [columns]="clientColumns"
                                [selectionMode]="
                                  example.key === 'selection' || example.key === 'accessibility'
                                    ? 'checkbox'
                                    : 'none'
                                "
                                [paginator]="example.key === 'pagination'"
                                [rows]="3"
                                [filterDisplay]="example.key === 'filtering' ? 'row' : 'none'"
                                [showGlobalFilter]="example.key === 'filtering'"
                                [sortField]="example.key === 'sorting' ? 'legalName' : ''"
                                [sortOrder]="example.key === 'sorting' ? 1 : 0"
                                [caption]="
                                  example.key === 'accessibility' ? 'Clients awaiting review' : ''
                                "
                                hover
                              />
                            }
                          }
                        </div>
                      }
                      @case ('data-grid') {
                        <j-data-grid
                          title="Orders"
                          description="Sortable, filterable operational data with pagination."
                          [value]="orders"
                          [columns]="orderColumns"
                          [rows]="3"
                          [totalRecords]="orders.length"
                          [globalFilterFields]="['order', 'customer', 'status']"
                          [config]="tableConfig"
                          selectionMode="checkbox"
                          bulkActions
                          showColumnManager
                          showExport
                          variant="striped"
                          hover
                        >
                          <j-button jDataGridActions label="Create order" size="sm" />
                          <j-button
                            jDataGridBulkActions
                            label="Archive selected"
                            size="sm"
                            variant="outlined"
                          />
                        </j-data-grid>
                      }
                      @case ('action-menu') {
                        <div class="j-action-menu-preview">
                          <section>
                            <span class="j-preview-label">Inline actions</span>
                            <j-action-menu [actions]="rowActions" [row]="orders[0]" />
                          </section>
                          <section>
                            <span class="j-preview-label">Compact popup</span>
                            <j-action-menu
                              popup
                              triggerIcon="More"
                              triggerLabel="Open order actions"
                              [actions]="rowActions"
                              [row]="orders[0]"
                            />
                          </section>
                        </div>
                      }
                      @case ('column-filter') {
                        <div class="j-preview-grid">
                          <j-column-filter field="status" label="Status" />
                          <j-column-filter field="customer" label="Customer" value="Acme" />
                        </div>
                      }
                      @case ('filter-bar') {
                        <div class="j-filter-bar-preview">
                          <j-filter-bar
                            [statuses]="statuses"
                            showDateRange
                            showExport
                            showAdvancedToggle
                            (apply)="showToast('success')"
                          >
                            <div jFilterBarAdvanced class="j-doc-muted">
                              Advanced filters can host app-specific controls.
                            </div>
                          </j-filter-bar>
                        </div>
                      }
                      @case ('status-chip') {
                        <div class="j-preview-row">
                          <j-status-chip status="active" />
                          <j-status-chip status="pending" />
                          <j-status-chip status="approved" />
                          <j-status-chip status="rejected" />
                          <j-status-chip status="overdue" />
                        </div>
                      }
                      @case ('page-header') {
                        <j-page-header
                          [variant]="pageHeaderVariants[example.index]"
                          title="Orders"
                          subtitle="Review fulfillment, exceptions, and exportable operational data that may wrap on narrow screens."
                          [breadcrumbs]="pageHeaderBreadcrumbs"
                        >
                          <j-button jPageActions label="Export" variant="outlined" />
                          <j-button jPageActions label="Create order" />
                        </j-page-header>
                      }
                      @case ('empty-state') {
                        <j-empty
                          [variant]="emptyStateVariants[example.index]"
                          title="No orders found"
                          description="Try changing filters or create a new order."
                          icon="0"
                        >
                          <j-button jEmptyStateAction label="Create order" />
                        </j-empty>
                      }
                      @case ('toast') {
                        <div class="j-preview-stack">
                          <div class="j-preview-row">
                            <j-button label="Show success" (onClick)="showToast('success')" />
                            <j-button
                              label="Show error"
                              severity="danger"
                              (onClick)="showToast('error')"
                            />
                            <j-button
                              label="Show warning"
                              severity="warning"
                              (onClick)="showToast('warning')"
                            />
                          </div>
                          <j-toast position="bottom-right" />
                        </div>
                      }
                      @case ('progress-bar') {
                        <j-progress-bar
                          [variant]="progressBarVariants[example.index]"
                          [value]="example.index === 1 ? 80 : example.index === 2 ? 42 : 64"
                          [severity]="example.index === 1 ? 'success' : 'primary'"
                          label="Operation progress"
                        />
                      }
                      @case ('skeleton') {
                        <div class="j-preview-grid">
                          <j-skeleton variant="text" />
                          <j-skeleton variant="avatar" />
                          <j-skeleton variant="button" width="8rem" />
                          <j-skeleton variant="card" />
                          <j-skeleton variant="table" [rows]="3" />
                        </div>
                      }
                      @case ('copy-button') {
                        <div class="j-preview-row">
                          <j-copy-button text="npm install jrng-ui" />
                          <j-copy-button text="INV-2048" label="Copy ID" copiedLabel="Copied ID" />
                          <j-copy-button text="Disabled" disabled />
                        </div>
                      }
                      @case ('tabs') {
                        <j-tabs [variant]="tabsVariants[example.index]">
                          <j-tab header="Overview"><p>Summary for this record.</p></j-tab>
                          <j-tab header="Activity"><p>Recent audit history.</p></j-tab>
                          <j-tab header="Long settings label" disabled><p>Unavailable.</p></j-tab>
                        </j-tabs>
                      }
                      @case ('breadcrumb') {
                        <j-breadcrumb
                          [variant]="breadcrumbVariants[example.index]"
                          [home]="breadcrumbHome"
                          [model]="breadcrumbItems"
                        />
                      }
                      @case ('menu') {
                        <j-menu [model]="menuItems" ariaLabel="Project actions" />
                      }
                      @case ('responsive-sidebar') {
                        <div class="j-sidebar-demo">
                          <j-responsive-sidebar title="Workspace" [open]="true">
                            <nav class="j-sidebar-demo__nav" aria-label="Preview sidebar">
                              <a>Dashboard</a>
                              <a class="is-active">Projects</a>
                              <a>Settings</a>
                            </nav>
                          </j-responsive-sidebar>
                        </div>
                      }
                      @case ('dialog') {
                        <div class="j-preview-row">
                          <j-button label="Open dialog" (onClick)="dialogOpen.set(true)" />
                          <j-dialog
                            header="Edit project"
                            [visible]="dialogOpen()"
                            (visibleChange)="dialogOpen.set($event)"
                          >
                            <div class="j-dialog-demo">
                              <j-input label="Project name" value="JRNG UI Docs" />
                              <div class="j-preview-row">
                                <j-button
                                  label="Cancel"
                                  variant="soft"
                                  (onClick)="dialogOpen.set(false)"
                                />
                                <j-button label="Save" (onClick)="dialogOpen.set(false)" />
                              </div>
                            </div>
                          </j-dialog>
                        </div>
                      }
                      @case ('confirm-dialog') {
                        <div class="j-preview-row">
                          <j-button label="Confirm save" (onClick)="openConfirm()" />
                          <j-button
                            label="Delete record"
                            severity="danger"
                            (onClick)="openConfirm('danger')"
                          />
                          <j-confirm-dialog />
                        </div>
                      }
                      @case ('data-display') {
                        <div class="j-preview-grid">
                          <j-data-display label="Name" value="Item A" />
                          <j-data-display label="Amount" type="currency" [value]="1250" />
                          <j-data-display
                            label="Status"
                            type="status"
                            value="Active"
                            severity="success"
                          />
                        </div>
                      }
                      @case ('diff-viewer') {
                        <j-diff-viewer
                          mode="object"
                          layout="side-by-side"
                          [before]="diffBefore"
                          [after]="diffAfter"
                        />
                      }
                      @case ('drawer') {
                        <div class="j-preview-row">
                          <j-button label="Open drawer" (onClick)="drawerOpen.set(true)" />
                          <j-drawer
                            header="Filters"
                            styleClass="j-doc-preview-drawer"
                            [modal]="false"
                            contained
                            [visible]="drawerOpen()"
                            (openChange)="drawerOpen.set($event)"
                          >
                            <div class="j-preview-stack">
                              <j-input label="Search" type="search" clearable />
                              <j-select label="Status" [options]="statuses" />
                            </div>
                          </j-drawer>
                        </div>
                      }
                      @case ('tooltip') {
                        <div class="j-preview-row">
                          <button
                            class="j-doc-preview-button"
                            type="button"
                            jTooltip="Refresh data"
                            tooltipPosition="top"
                          >
                            Hover or focus me
                          </button>
                          <button
                            class="j-doc-icon-button"
                            type="button"
                            aria-label="Settings"
                            jTooltip="Settings"
                            tooltipPosition="right"
                          >
                            <j-icon name="settings" />
                          </button>
                        </div>
                      }
                      @case ('popover') {
                        <div class="j-preview-row">
                          <button
                            #popoverTrigger
                            class="j-doc-preview-button"
                            type="button"
                            (click)="previewPopover.toggle(popoverTrigger)"
                          >
                            Toggle popover
                          </button>
                          <j-popover
                            #previewPopover
                            [target]="popoverTrigger"
                            position="bottom"
                            [dismissable]="false"
                          >
                            <strong>Project health</strong>
                            <p>Build is passing and docs coverage improved.</p>
                          </j-popover>
                        </div>
                      }
                      @case ('ripple') {
                        <div class="j-preview-row">
                          <button class="j-doc-preview-button" type="button" jRipple>
                            Ripple button
                          </button>
                          <button class="j-doc-preview-button" type="button" [jRipple]="false">
                            Disabled ripple
                          </button>
                        </div>
                      }
                      @case ('tour-guide') {
                        <div class="j-preview-stack">
                          <div class="j-preview-row">
                            <button
                              id="createBtn"
                              class="j-doc-preview-button"
                              type="button"
                              jTourStep="create-button"
                              tourTitle="Create"
                              tourDescription="Click here to create a new record."
                            >
                              Create
                            </button>
                            <button
                              class="j-doc-preview-button"
                              type="button"
                              jTourStep="filter-button"
                              tourTitle="Filter"
                              tourDescription="Narrow the table to the records that matter."
                            >
                              Filter
                            </button>
                          </div>
                          <j-button label="Start guided tour" (onClick)="startPreviewTour()" />
                        </div>
                      }
                      @case ('timeline') {
                        <j-timeline
                          [variant]="timelineVariants[example.index]"
                          [value]="timelineItems"
                        />
                      }
                      @case ('file-upload') {
                        <div class="j-preview-stack">
                          <j-file-upload
                            title="Add files"
                            description="Drag files here or choose from your device."
                            multiple
                          />
                          <j-file-preview
                            fileName="statement.pdf"
                            [fileSize]="245760"
                            description="Uploaded 2 minutes ago"
                            url="#"
                          />
                        </div>
                      }
                      @case ('file-browser') {
                        <j-file-browser
                          title="Shared files"
                          [items]="fileBrowserItems"
                          [breadcrumbs]="fileBrowserBreadcrumbs"
                          [selection]="fileBrowserSelection"
                          selectionMode="multiple"
                          [actions]="fileBrowserActions"
                          (selectionChange)="fileBrowserSelection = $event"
                        />
                      }
                      @case ('file-preview') {
                        <div class="j-preview-row">
                          <j-file-preview
                            fileName="statement.pdf"
                            [fileSize]="245760"
                            description="Uploaded 2 minutes ago"
                            url="#"
                          />
                          <j-file-preview
                            fileName="avatar.png"
                            [fileSize]="56320"
                            description="Image asset"
                            showTypeLabel
                            typeLabel="PNG image"
                          />
                        </div>
                      }
                      @case ('avatar-group') {
                        <j-avatar-group
                          [items]="avatarGroupItems"
                          [max]="3"
                          ariaLabel="Project team"
                        />
                      }
                      @case ('container') {
                        <j-container>
                          <j-card
                            header="Contained content"
                            subheader="Max-width layout helper"
                            variant="outlined"
                          >
                            <p>
                              Container keeps page content aligned with consistent horizontal
                              rhythm.
                            </p>
                          </j-card>
                        </j-container>
                      }
                      @case ('fieldset') {
                        <j-fieldset legend="Billing address" toggleable>
                          <div class="j-preview-grid">
                            <j-input label="Street" placeholder="123 Market St" />
                            <j-input label="City" placeholder="San Francisco" />
                          </div>
                        </j-fieldset>
                      }
                      @case ('label') {
                        <j-label
                          label="Email address"
                          variant="floating"
                          description="We use this for account notices."
                        >
                          <j-input type="email" [(ngModel)]="labeledEmail" width="full" />
                        </j-label>
                      }
                      @case ('form-field') {
                        <j-form-field
                          label="Workspace name"
                          hint="Use a short, recognizable team name."
                        >
                          <j-input placeholder="Operations" />
                        </j-form-field>
                      }
                      @case ('icon-field') {
                        <j-icon-field
                          prefixIcon="search"
                          clearable
                          fullWidth
                          ariaLabel="Project search"
                          (clear)="iconFieldSearch = ''"
                        >
                          <j-input
                            placeholder="Search projects"
                            [(ngModel)]="iconFieldSearch"
                            width="full"
                          />
                        </j-icon-field>
                      }
                      @case ('input-group') {
                        <j-input-group prefixAddon="$" suffixAddon=".00">
                          <j-input placeholder="Amount" />
                        </j-input-group>
                      }
                      @case ('panel') {
                        <j-panel header="Project health" toggleable>
                          The latest build passed and documentation coverage is improving.
                        </j-panel>
                      }
                      @case ('radio-group') {
                        <j-radio-group
                          label="Plan"
                          [options]="radioGroupOptions"
                          direction="horizontal"
                          [(ngModel)]="plan"
                        />
                      }
                      @case ('select-button') {
                        <j-select-button
                          label="View mode"
                          [options]="viewModes"
                          [(ngModel)]="viewMode"
                        />
                      }
                      @case ('section-header') {
                        <j-section-header
                          title="Projects"
                          description="Track active work and ownership."
                        >
                          <j-button label="New project" />
                        </j-section-header>
                      }
                      @case ('section-footer') {
                        <j-section-footer>
                          <j-button label="Cancel" variant="soft" />
                          <j-button label="Apply updates" />
                        </j-section-footer>
                      }
                      @case ('toolbar') {
                        <j-toolbar>
                          <j-button label="New" />
                          <j-button label="Export" variant="outlined" />
                          <j-button label="Archive" variant="soft" />
                        </j-toolbar>
                      }
                      @case ('toggle-button') {
                        <j-toggle-button
                          onLabel="Published"
                          offLabel="Draft"
                          [(ngModel)]="published"
                        />
                      }
                      @case ('loader') {
                        @if (example.key === 'basic') {
                          <app-loader-types-demo />
                        } @else if (example.key === 'button') {
                          <j-button label="Saving" loading loadingLabel="Saving record" />
                        } @else if (example.key === 'card') {
                          <j-card header="Account summary"
                            ><j-loader type="spinner" inline label="Loading account summary"
                          /></j-card>
                        } @else {
                          <div
                            class="j-loader-preview-grid"
                            [class.j-loader-demo-overlay]="example.key === 'overlay'"
                          >
                            <j-loader
                              [type]="loaderExampleType(example.key)"
                              [inline]="example.key === 'inline' || example.key === 'label'"
                              [overlay]="example.key === 'overlay'"
                              [fullscreen]="false"
                              [value]="example.key === 'determinate' ? 68 : null"
                              [size]="example.key === 'size' ? 56 : 'md'"
                              [label]="
                                example.key === 'label' ? 'Loading customer profile' : 'Loading'
                              "
                            />
                          </div>
                        }
                      }
                      @case ('text-expand') {
                        <div class="j-preview-stack">
                          @if (example.key === 'characters') {
                            <app-text-expand-basic-demo />
                          } @else if (example.key === 'responsive') {
                            <j-card header="Release summary">
                              <j-text-expand
                                [text]="productDescription"
                                mode="lines"
                                [collapsedLines]="2"
                              />
                            </j-card>
                          } @else if (example.key === 'projected') {
                            <j-text-expand mode="lines" [collapsedLines]="2">
                              <strong>Release note:</strong> {{ projectedSummary }}
                            </j-text-expand>
                          } @else {
                            <j-text-expand
                              [text]="textExpandValue(example.key)"
                              [mode]="
                                example.key === 'lines' || example.key === 'policy'
                                  ? 'lines'
                                  : 'characters'
                              "
                              [collapsedLength]="example.key === 'comment' ? 80 : 100"
                              [collapsedLines]="3"
                              [showMoreLabel]="
                                example.key === 'labels' ? 'Read comment' : 'Show more'
                              "
                              [showLessLabel]="
                                example.key === 'labels' ? 'Collapse comment' : 'Show less'
                              "
                              [expanded]="example.key === 'expanded'"
                              [animation]="example.key !== 'motion'"
                            />
                          }
                        </div>
                      }
                      @case ('error-page') {
                        <j-error-page
                          code="500"
                          title="Something went wrong"
                          description="The page could not be loaded."
                          ><j-button label="Try again"
                        /></j-error-page>
                      }
                      @case ('maintenance-page') {
                        <j-maintenance-page
                          title="Maintenance in progress"
                          description="The application will be back soon."
                          detail="Estimated recovery: 20 minutes"
                          ><j-button label="View system status" variant="outlined"
                        /></j-maintenance-page>
                      }
                      @case ('meter-group') {
                        <j-meter-group [value]="meterSegments" />
                      }
                      @case ('sparkline') {
                        <div class="j-preview-row">
                          <j-sparkline [value]="sparklineValues" ariaLabel="Revenue trend" />
                          <j-sparkline
                            [value]="sparklineValues"
                            type="bar"
                            ariaLabel="Volume trend"
                          />
                        </div>
                      }
                      @case ('app-shell') {
                        <div class="j-layout-preview-frame">
                          <j-app-shell styleClass="j-doc-compact-shell">
                            <strong jShellHeader>Workspace</strong>
                            <nav jShellSidebar class="j-preview-mini-nav">
                              <span class="is-active">Overview</span><span>Projects</span
                              ><span>Settings</span>
                            </nav>
                            <j-card
                              header="Dashboard"
                              subheader="Application shell content"
                              variant="outlined"
                            />
                            <small jShellFooter>JRNG UI workspace</small>
                          </j-app-shell>
                        </div>
                      }
                      @case ('auth-layout') {
                        <div class="j-layout-preview-frame">
                          <j-auth-layout variant="centered" styleClass="j-doc-compact-auth">
                            <div class="j-preview-stack">
                              <strong>Access your workspace</strong>
                              <j-input label="Email" type="email" placeholder="name@example.com" />
                              <j-button label="Sign in" />
                            </div>
                          </j-auth-layout>
                        </div>
                      }
                      @case ('bottom-sheet') {
                        <div class="j-preview-row">
                          <j-button
                            label="Open bottom sheet"
                            (onClick)="bottomSheetVisible = true"
                          />
                          <j-bottom-sheet
                            header="Project actions"
                            [(visible)]="bottomSheetVisible"
                            [modal]="false"
                          >
                            <div class="j-preview-stack">
                              <j-button label="Duplicate" variant="outlined" />
                              <j-button label="Archive" variant="soft" />
                            </div>
                          </j-bottom-sheet>
                        </div>
                      }
                      @case ('calendar') {
                        <div class="j-calendar-preview">
                          <j-calendar [value]="calendarDate" (dateSelect)="calendarDate = $event" />
                        </div>
                      }
                      @case ('calendar-scheduler') {
                        <j-calendar-scheduler
                          [events]="schedulerEvents"
                          ariaLabel="Team schedule"
                        />
                      }
                      @case ('carousel') {
                        <j-carousel [value]="carouselItems" [visibleItems]="2" autoplay />
                      }
                      @case ('chart') {
                        <div class="j-live-chart-preview-grid">
                          <section>
                            <strong>Monthly signups</strong>
                            <j-chart type="bar" [data]="chartData" ariaLabel="Monthly signups" />
                          </section>
                          <section>
                            <strong>Active users</strong>
                            <j-chart type="line" [data]="lineChartData" ariaLabel="Active users" />
                          </section>
                        </div>
                      }
                      @case ('chips') {
                        <j-chips label="Skills" placeholder="Add a skill" [(ngModel)]="tags" />
                      }
                      @case ('command-palette') {
                        <div class="j-preview-row">
                          <j-button
                            label="Open command palette"
                            (onClick)="commandPaletteOpen = true"
                          />
                          <j-command-palette
                            [commands]="commands"
                            [(visible)]="commandPaletteOpen"
                            placeholder="Search commands"
                          />
                        </div>
                      }
                      @case ('confirm-popup') {
                        <div class="j-preview-row">
                          <j-button label="Confirm archive" (onClick)="openConfirmPopup($event)" />
                          <j-confirm-popup />
                        </div>
                      }
                      @case ('context-menu') {
                        <div #contextTarget class="j-context-preview-target" tabindex="0">
                          Right-click this area
                        </div>
                        <j-context-menu [target]="contextTarget" [model]="menubarItems" />
                      }
                      @case ('data-view') {
                        <j-data-view
                          [value]="dataViewItems"
                          layout="grid"
                          [rows]="3"
                          [paginator]="false"
                        />
                      }
                      @case ('dynamic-dialog') {
                        <div class="j-preview-row">
                          <j-button label="Open dynamic dialog" (onClick)="openDynamicDialog()" />
                          <j-dynamic-dialog />
                        </div>
                      }
                      @case ('editor') {
                        <j-editor
                          label="Description"
                          placeholder="Write a short summary"
                          hint="Select text, then use formatting, alignment, list, link, image, undo, or redo controls."
                          [(ngModel)]="editorValue"
                        />
                      }
                      @case ('gallery') {
                        <div class="j-preview-stack">
                          <div class="j-preview-row">
                            @for (animation of galleryAnimations; track animation) {
                              <button
                                type="button"
                                class="j-doc-preview-button"
                                [class.is-active]="galleryAnimation === animation"
                                (click)="galleryAnimation = animation"
                              >
                                {{ animation }}
                              </button>
                            }
                          </div>
                          <j-gallery [value]="galleryItems" [animation]="galleryAnimation" />
                        </div>
                      }
                      @case ('gantt') {
                        <j-gantt [tasks]="ganttTasks" scale="week" />
                      }
                      @case ('grid-layout') {
                        <j-grid-layout [columns]="3" minItemWidth="10rem">
                          <j-card header="Design" variant="outlined" /><j-card
                            header="Build"
                            variant="outlined"
                          /><j-card header="Ship" variant="outlined" />
                        </j-grid-layout>
                      }
                      @case ('highlight') {
                        <j-highlight
                          text="Search matching text without injecting HTML."
                          [term]="['matching', 'HTML']"
                        />
                      }
                      @case ('html-preview') {
                        <j-html-preview
                          mode="iframe"
                          device="mobile"
                          [height]="240"
                          [html]="previewHtml"
                        />
                      }
                      @case ('grid') {
                        <div class="j-doc-grid-demo">
                          <j-grid gutterX="var(--j-spacing-4)" gutterY="var(--j-spacing-4)">
                            <j-row>
                              <j-col size="12" md="8">
                                <div class="j-doc-grid-cell j-doc-grid-cell--primary">
                                  <strong>Main workspace</strong>
                                  <span>12 columns on mobile, 8 from md</span>
                                </div>
                              </j-col>
                              <j-col size="12" md="4">
                                <div class="j-doc-grid-cell">
                                  <strong>Context panel</strong>
                                  <span>12 columns on mobile, 4 from md</span>
                                </div>
                              </j-col>
                              <j-col size="6" lg="3">
                                <div class="j-doc-grid-cell">
                                  <strong>25%</strong><span>at lg</span>
                                </div>
                              </j-col>
                              <j-col size="6" lg="3">
                                <div class="j-doc-grid-cell">
                                  <strong>25%</strong><span>at lg</span>
                                </div>
                              </j-col>
                              <j-col size="12" lg="6">
                                <div class="j-doc-grid-cell">
                                  <strong>50%</strong><span>at lg</span>
                                </div>
                              </j-col>
                            </j-row>
                          </j-grid>
                        </div>
                      }
                      @case ('row') {
                        <div class="j-doc-grid-demo">
                          <j-grid>
                            <j-row align="center" justify="between">
                              <j-col size="auto">
                                <div class="j-doc-grid-cell"><strong>Project title</strong></div>
                              </j-col>
                              <j-col size="auto">
                                <div class="j-doc-grid-cell"><span>Header actions</span></div>
                              </j-col>
                            </j-row>
                          </j-grid>
                        </div>
                      }
                      @case ('col') {
                        <div class="j-doc-grid-demo">
                          <j-grid>
                            <j-row>
                              <j-col size="12" sm="6" lg="4">
                                <div class="j-doc-grid-cell">
                                  <strong>Responsive column</strong>
                                </div>
                              </j-col>
                              <j-col size="12" sm="6" lg="4" offsetLg="4">
                                <div class="j-doc-grid-cell">
                                  <strong>Responsive offset</strong>
                                </div>
                              </j-col>
                            </j-row>
                          </j-grid>
                        </div>
                      }
                      @case ('image') {
                        <j-image
                          [src]="previewImage"
                          alt="Abstract product preview"
                          width="18rem"
                          preview
                        />
                      }
                      @case ('kanban') {
                        <j-kanban
                          [value]="kanbanPreviewColumns"
                          (reorder)="handleKanbanReorder($event)"
                          (addCard)="addKanbanCard($event)"
                          (removeCard)="removeKanbanCard($event)"
                        />
                      }
                      @case ('knob') {
                        <j-knob label="Completion" [(ngModel)]="completion" />
                      }
                      @case ('mega-menu') {
                        <j-mega-menu [model]="megaMenuItems" ariaLabel="Product navigation" />
                      }
                      @case ('menubar') {
                        <j-menubar [model]="menubarItems" ariaLabel="Application menu" />
                      }
                      @case ('notification-center') {
                        <div class="j-preview-row">
                          <button
                            #notificationTrigger
                            class="j-doc-preview-button"
                            type="button"
                            (click)="notificationOpen = !notificationOpen"
                          >
                            Notifications
                          </button>
                          <j-notification-center
                            [target]="notificationTrigger"
                            [(visible)]="notificationOpen"
                          />
                        </div>
                      }
                      @case ('order-list') {
                        <j-order-list header="Priorities" [value]="transferSource" filter />
                      }
                      @case ('org-chart') {
                        <j-org-chart [value]="organization" />
                      }
                      @case ('sidebar-nav') {
                        <j-sidebar-nav [model]="menuItems" activeKey="Open" />
                      }
                      @case ('splitter') {
                        <j-splitter styleClass="j-doc-splitter">
                          <j-splitter-panel [size]="35">Navigation panel</j-splitter-panel>
                          <j-splitter-panel [size]="65">Content panel</j-splitter-panel>
                        </j-splitter>
                      }
                      @case ('stepper') {
                        <j-stepper
                          [variant]="stepperVariants[example.index]"
                          [items]="stepperItems"
                          [activeIndex]="1"
                        />
                      }
                      @case ('tab') {
                        <j-tabs>
                          <j-tab header="Overview">Overview content</j-tab>
                          <j-tab header="Activity">Activity content</j-tab>
                        </j-tabs>
                      }
                      @case ('tiered-menu') {
                        <j-tiered-menu [model]="menuItems" />
                      }
                      @case ('time-picker') {
                        <j-time-picker label="Meeting time" [(ngModel)]="meetingTime" />
                      }
                      @case ('topbar') {
                        <j-topbar [model]="menuItems" activeKey="Open">
                          <strong jTopbarBrand>JRNG UI</strong>
                        </j-topbar>
                      }
                      @case ('transfer-list') {
                        <j-transfer-list
                          [source]="transferSource"
                          [target]="transferTarget"
                          sourceHeader="Fields to add"
                          targetHeader="Visible fields"
                          filter
                        />
                      }
                      @case ('tree') {
                        <j-tree [value]="treeNodes" filter ariaLabel="Workspace folders" />
                      }
                      @case ('tree-table') {
                        <j-tree-table
                          [value]="treeNodes"
                          [columns]="treeColumns"
                          ariaLabel="Project hierarchy"
                        />
                      }
                      @case ('video-player') {
                        <j-video-player
                          src="/assets/demo-video.mp4"
                          caption="YouTube embed example"
                        />
                      }
                      @case ('validation-message') {
                        <j-validation-message
                          message="Enter a valid value."
                          displayMode="always"
                          severity="danger"
                        />
                      }
                      @case ('virtual-scroller') {
                        <j-virtual-scroller
                          [items]="virtualItems"
                          [itemSize]="40"
                          [viewportItems]="5"
                          height="12rem"
                        />
                      }
                      @case ('formatting') {
                        <div class="j-format-demo">
                          <span
                            >Date/time <strong>{{ sampleDate | jDateTimeFormat }}</strong></span
                          >
                          <span
                            >Currency <strong>{{ 42800 | jCurrencyFormat: 'USD' }}</strong></span
                          >
                          <span
                            >Percent <strong>{{ 0.128 | jPercentFormat }}</strong></span
                          >
                          <span
                            >File size <strong>{{ 2457600 | jFileSizeFormat }}</strong></span
                          >
                          <span
                            >Truncate <strong>{{ longText | jTruncate: 36 }}</strong></span
                          >
                        </div>
                      }
                      @default {
                        <div class="j-generated-component-preview">
                          <header>
                            <span class="j-doc-icon"><j-icon [name]="doc().icon" /></span>
                            <div>
                              <strong>{{ doc().name }} preview</strong>
                              <p>
                                Generated preview built from the public selector and import
                                metadata. Use the code tab for the exact starter snippet.
                              </p>
                            </div>
                          </header>

                          <div
                            class="j-generated-component-preview__sample"
                            [attr.data-category]="doc().category"
                          >
                            <div class="j-generated-preview-card">
                              <div class="j-generated-preview-card__header">
                                <span class="j-generated-preview-card__icon">
                                  <j-icon [name]="doc().icon" />
                                </span>
                                <div>
                                  <strong>{{ doc().name }}</strong>
                                  <span>{{ doc().category }}</span>
                                </div>
                              </div>

                              <div class="j-generated-preview-card__body">
                                @if (doc().category.includes('Forms')) {
                                  <div class="j-generated-field">
                                    <span>{{ doc().name }}</span>
                                    <span class="j-generated-input">Enter value</span>
                                  </div>
                                  <div class="j-generated-actions">
                                    <span></span>
                                    <span></span>
                                  </div>
                                } @else if (doc().category.includes('Layout')) {
                                  <div class="j-generated-layout">
                                    <aside></aside>
                                    <main>
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                    </main>
                                  </div>
                                } @else if (doc().category.includes('Data')) {
                                  <div class="j-generated-table">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                  </div>
                                } @else if (doc().category.includes('Navigation')) {
                                  <nav class="j-generated-menu" aria-label="Generated preview">
                                    <span class="is-active">Overview</span>
                                    <span>Activity</span>
                                    <span>Settings</span>
                                  </nav>
                                } @else if (
                                  doc().category.includes('Overlay') ||
                                  doc().category.includes('Status')
                                ) {
                                  <div class="j-generated-overlay">
                                    <strong>{{ doc().name }}</strong>
                                    <p>{{ doc().description }}</p>
                                    <j-button label="Action" />
                                  </div>
                                } @else if (
                                  doc().category.includes('Media') ||
                                  doc().category.includes('Visualization')
                                ) {
                                  <div class="j-generated-visual">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                  </div>
                                } @else {
                                  <div class="j-generated-surface">
                                    <strong>{{ doc().name }}</strong>
                                    <p>{{ doc().description }}</p>
                                  </div>
                                }
                              </div>

                              <footer>
                                <code>{{ doc().selector }}</code>
                              </footer>
                            </div>
                          </div>

                          <div class="j-generated-component-preview__meta">
                            <span
                              >Selector <code>{{ doc().selector }}</code></span
                            >
                            <span
                              >Import <code>{{ doc().importPath }}</code></span
                            >
                          </div>

                          <div class="j-generated-component-preview__code">
                            <app-code-block
                              label="Import"
                              language="ts"
                              [code]="doc().code.importCode"
                            />
                            <app-code-block
                              label="Basic usage"
                              language="html"
                              [code]="doc().code.basic"
                            />
                            <app-code-block
                              label="Example values"
                              language="ts"
                              [code]="doc().code.angular ?? ''"
                            />
                          </div>
                        </div>
                      }
                    }
                  } @placeholder {
                    <div class="j-preview-stack" aria-label="Loading component preview">
                      <j-skeleton variant="text" width="12rem" />
                      <j-skeleton variant="card" />
                    </div>
                  }
                </div>
              </div>
              <div class="j-full-code" id="j-component-example-code">
                <div class="j-code-header">
                  <div class="j-code-tabs" role="tablist" aria-label="Example source files">
                    @for (tab of codeTabs; track tab.value) {
                      <button
                        type="button"
                        role="tab"
                        [attr.aria-label]="tab.label"
                        [attr.title]="tab.label"
                        [attr.aria-selected]="featureCodeTab(example) === tab.value"
                        [class.is-active]="featureCodeTab(example) === tab.value"
                        (click)="setFeatureCodeTab(example, tab.value)"
                      >
                        @if (tab.icon) {
                          <j-icon [name]="tab.icon" aria-hidden="true" />
                        } @else {
                          {{ tab.label }}
                        }
                      </button>
                    }
                  </div>
                  <div class="j-example-toolbar" aria-label="Example code actions">
                    <j-copy-button
                      [text]="activeFeatureCode(example)"
                      label="Copy"
                      copiedLabel="Copied"
                      ariaLabel="Copy active example code"
                      icon="copy"
                      iconOnly
                    />
                  </div>
                </div>
                <app-code-block
                  [label]="activeCodeLabel(featureCodeTab(example))"
                  [language]="featureCodeTab(example) === 'html' ? 'html' : 'ts'"
                  [code]="activeFeatureCode(example)"
                />
              </div>
            </section>
          }
        } @else {
          <section class="j-doc-opening-section" id="component-api-overview">
            <h2>{{ doc().name }} API</h2>
            <p>Public inputs, outputs, styling hooks, accessibility, and integration contracts.</p>
          </section>

          <section class="j-doc-grid-sections" id="component-variants">
            <div class="j-doc-section-block">
              <h3>Variants</h3>
              @if (doc().variants.length) {
                <ul>
                  @for (item of doc().variants; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>{{ doc().name }} does not provide separate visual variants.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block">
              <h3>Sizes</h3>
              @if (doc().sizes.length) {
                <ul>
                  @for (item of doc().sizes; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>{{ doc().name }} uses its natural or container-defined size.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block">
              <h3>States</h3>
              @if (doc().states.length) {
                <ul>
                  @for (item of doc().states; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="info" />
                  <p>No additional component-specific states are documented.</p>
                </div>
              }
            </div>
          </section>

          @if (priorityGuidance(); as guide) {
            <section class="j-doc-section-block">
              <h3>Advanced example</h3>
              <app-code-block
                label="Advanced usage"
                language="html"
                [code]="guide.advancedExample"
              />
            </section>

            <section class="j-doc-grid-sections j-priority-doc-grid" id="component-advanced-api">
              <div class="j-doc-section-block" id="component-methods">
                <h3>Public methods</h3>
                @if (guide.publicMethods.length) {
                  <ul>
                    @for (item of guide.publicMethods; track item) {
                      <li>
                        <code>{{ item }}</code>
                      </li>
                    }
                  </ul>
                } @else {
                  <div class="j-doc-empty-detail">
                    <j-icon name="info" />
                    <p>
                      {{ doc().name }} has no imperative public methods; prefer inputs and outputs.
                    </p>
                  </div>
                }
              </div>
              <div class="j-doc-section-block" id="component-templates">
                <h3>Templates and slots</h3>
                <ul>
                  @for (item of guide.templates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Reactive Forms</h3>
                <p>{{ guide.reactiveForms }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Validation states</h3>
                <ul>
                  @for (item of guide.validationStates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Loading and disabled states</h3>
                <ul>
                  @for (item of guide.loadingDisabledStates; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Keyboard behaviour</h3>
                <ul>
                  @for (item of guide.keyboardBehaviour; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="j-doc-section-block">
                <h3>Responsive behaviour</h3>
                <p>{{ guide.responsiveBehaviour }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Dark-mode preview</h3>
                <div class="j-dark-mode-preview j-dark">
                  <span><j-icon [name]="doc().icon" /></span>
                  <div>
                    <strong>{{ doc().name }}</strong>
                    <p>{{ guide.darkMode }}</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="j-doc-grid-sections">
              <div class="j-doc-section-block">
                <h3>Composed example</h3>
                <p>{{ guide.composedExample }}</p>
              </div>
              <div class="j-doc-section-block">
                <h3>Troubleshooting</h3>
                <ul>
                  @for (item of guide.troubleshooting; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            </section>
          }

          @if (!priorityGuidance()) {
            <section class="j-doc-grid-sections" id="component-advanced-api">
              <div class="j-doc-section-block" id="component-methods">
                <h3>Public methods</h3>
                @if (doc().publicMethods?.length) {
                  <ul>
                    @for (item of doc().publicMethods ?? []; track item) {
                      <li>
                        <code>{{ item }}</code>
                      </li>
                    }
                  </ul>
                } @else {
                  <p>No imperative method is required; prefer inputs and outputs.</p>
                }
              </div>
              <div class="j-doc-section-block" id="component-templates">
                <h3>Templates and content projection</h3>
                <ul>
                  @for (item of doc().templates ?? []; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
            </section>
          }

          <section class="j-doc-grid-sections" id="component-behaviour-guidance">
            <div class="j-doc-section-block">
              <h3>Keyboard support</h3>
              <ul>
                @for (item of doc().keyboard ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Responsive behaviour</h3>
              <ul>
                @for (item of doc().responsive ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Edge cases and limitations</h3>
              <ul>
                @for (item of doc().limitations ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Related components</h3>
              <ul>
                @for (item of doc().relatedComponents ?? []; track item) {
                  <li>{{ item }}</li>
                } @empty {
                  <li>See components in the same documentation category.</li>
                }
              </ul>
            </div>
            <div class="j-doc-section-block">
              <h3>Testing notes</h3>
              <ul>
                @for (item of doc().testingNotes ?? []; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </section>

          <section class="j-doc-section-block" id="component-api">
            <h3>Props / Inputs</h3>
            @if (doc().inputs.length) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().inputs; track row.name) {
                      <tr>
                        <td>
                          <code>{{ row.name }}</code>
                        </td>
                        <td>{{ row.type }}</td>
                        <td>
                          <code>{{ row.defaultValue }}</code>
                        </td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="info" />
                <p>
                  {{ doc().name }} does not expose additional component-specific inputs. Use its
                  documented selector and projected content.
                </p>
              </div>
            }
          </section>

          <section class="j-doc-section-block" id="component-events">
            <h3>Events / Outputs</h3>
            @if (doc().outputs.length) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Payload</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().outputs; track row.event) {
                      <tr>
                        <td>
                          <code>{{ row.event }}</code>
                        </td>
                        <td>{{ row.payload }}</td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="info" />
                <p>{{ doc().name }} does not emit component-specific events.</p>
              </div>
            }
          </section>

          <section class="j-doc-section-block" id="component-css-variables">
            <h3>CSS variables</h3>
            @if ((doc().cssVariables?.length ?? 0) > 0) {
              <div class="j-table-wrap">
                <table class="j-api-table">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Default / fallback</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of doc().cssVariables ?? []; track row.variable) {
                      <tr>
                        <td>
                          <code>{{ row.variable }}</code>
                        </td>
                        <td>
                          <code>{{ row.fallback }}</code>
                        </td>
                        <td>{{ row.description }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="j-doc-empty-detail">
                <j-icon name="palette" />
                <p>
                  {{ doc().name }} has no component-specific CSS variables. It inherits the shared
                  JRNG UI semantic theme tokens.
                </p>
              </div>
            }
          </section>

          <section class="j-doc-grid-sections j-api-support-grid">
            <div class="j-doc-section-block" id="component-accessibility">
              <h3>Accessibility</h3>
              @if (doc().accessibility.length) {
                <ul>
                  @for (item of doc().accessibility; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="accessibility" />
                  <p>No additional accessibility requirements beyond the documented usage.</p>
                </div>
              }
            </div>
            <div class="j-doc-section-block" id="component-best-practices">
              <h3>Best Practices</h3>
              @if (doc().bestPractices.length) {
                <ul>
                  @for (item of doc().bestPractices; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="j-doc-empty-detail">
                  <j-icon name="lightbulb" />
                  <p>No additional component-specific best practices are required.</p>
                </div>
              }
            </div>
          </section>

          @if (doc().commonMistakes?.length) {
            <section class="j-doc-section-block">
              <h3>Common mistakes</h3>
              <ul>
                @for (item of doc().commonMistakes; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </section>
          }
        }
      </article>
      <aside class="j-component-contents" aria-label="On this page">
        @for (item of contentsItems(); track item.id) {
          <button
            type="button"
            [class.is-active]="activeContentsId() === item.id"
            [class.is-nested]="item.level === 1"
            [attr.aria-current]="activeContentsId() === item.id ? 'location' : null"
            (click)="scrollToContents(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </aside>
    </div>
    <j-tour-guide />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDetailViewComponent {
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
      return TABLE_FEATURE_EXAMPLES.map((example, index) => ({
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
    { label: 'Avery Reed', image: '/assets/avatars/avery.svg' },
    { label: 'Morgan Kim', image: '/assets/avatars/morgan.svg' },
    { label: 'Jordan Lee', image: '/assets/avatars/jordan.svg' },
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
  readonly stepperVariants: readonly JStepperVariant[] = ['default', 'rail', 'progress'];
  readonly tabsVariants: readonly JTabsVariant[] = ['default', 'pills', 'segmented'];
  readonly timelineVariants: readonly JTimelineVariant[] = ['default', 'activity', 'alternating'];
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
  checked = true;
  enabled = true;
  published = false;
  plan = 'pro';
  viewMode = 'list';
  brandColor = '#4f46e5';
  dueDate: Date | null = new Date(2026, 6, 18);
  pickerRange: readonly Date[] = [new Date(2026, 6, 12), new Date(2026, 6, 19)];
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
  iconFieldSearch = '';
  quantity = 3;
  budget = 2500;
  otp = '';
  selectedTeam = 'engineering';
  selectedSkills: string[] = ['angular', 'accessibility'];
  rating = 4;
  completion = 65;
  calendarDate = new Date(2026, 6, 12);
  dateRange: readonly string[] = ['2026-07-12', '2026-07-19'];
  editorValue = '<p>Build accessible Angular interfaces with stable components.</p>';
  meetingTime = '14:30';
  selectedCustomer = 'acme';
  tags = [
    { label: 'Angular', severity: 'primary' as const },
    { label: 'Accessibility', severity: 'success' as const },
  ];
  maskedPhone = '(555) 123-4567';
  employeeId = 'JR-2048';
  galleryAnimation: 'fade' | 'zoom' | 'slide' | 'none' = 'fade';
  readonly galleryAnimations = ['fade', 'zoom', 'slide', 'none'] as const;

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
  readonly previewImage = '/assets/gallery/alpine-dawn.png';
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
      description: 'A quiet mountain lake at first light.',
      image: '/assets/gallery/alpine-dawn.png',
      alt: 'Mountain lake reflecting a warm sunrise',
    },
    {
      title: 'Coastal light',
      description: 'A lighthouse above a vivid blue coast.',
      image: '/assets/gallery/coastal-light.png',
      alt: 'Lighthouse on a rugged blue coastline',
    },
    {
      title: 'Desert arches',
      description: 'Sunlit sandstone against cobalt shadows.',
      image: '/assets/gallery/desert-arches.png',
      alt: 'Sandstone arches in golden desert light',
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
  readonly commands = [
    { id: 'new', label: 'Create project', description: 'Start a new project', group: 'Actions' },
    { id: 'search', label: 'Search docs', description: 'Find a component', group: 'Navigate' },
    { id: 'theme', label: 'Toggle theme', description: 'Switch color mode', group: 'Settings' },
  ] as const;
  readonly dataViewItems = ['Design system', 'Documentation portal', 'Admin workspace'];
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
  readonly galleryItems = [
    {
      src: '/assets/gallery/alpine-dawn.png',
      alt: 'Mountain lake at dawn',
      caption: 'Alpine dawn',
    },
    {
      src: '/assets/gallery/coastal-light.png',
      alt: 'Lighthouse on the coast',
      caption: 'Coastal light',
    },
    {
      src: '/assets/gallery/desert-arches.png',
      alt: 'Desert sandstone arches',
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
        { key: 'view', label: 'View' },
        { key: 'delete', label: 'Delete', severity: 'danger' },
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
        { key: 'view', label: 'View client' },
        { key: 'edit', label: 'Edit client' },
        { key: 'archive', label: 'Archive', severity: 'danger' },
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

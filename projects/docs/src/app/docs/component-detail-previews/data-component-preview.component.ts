import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import type { JTableSelection } from 'jrng-ui/table';
import type {
  JSchedulerEvent,
  JSchedulerEventAdapter,
  JSchedulerEventChangeRequest,
  JSchedulerEditableSettings,
  JSchedulerAppointmentDisplay,
  JSchedulerExternalDropRequest,
  JSchedulerFilterState,
  JSchedulerMoreEventsMode,
  JSchedulerRecurrenceRule,
  JSchedulerResourceDimension,
  JSchedulerSelection,
  JSchedulerToolbarConfig,
  JSchedulerView,
} from 'jrng-ui/scheduler';
import { JSchedulerComponent, JSchedulerEventEditorComponent } from 'jrng-ui/scheduler';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-data-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS, JSchedulerEventEditorComponent],
  template: `
    @let example = previewExample();
    @switch (doc().slug) {
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
      @case ('table') {
        <div class="j-table-doc-example">
          @if (isGeneratedTableScenario(example.key)) {
            <app-table-scenario-host [scenario]="example.key" />
          } @else {
            @switch (example.key) {
              @case ('templates') {
                <j-table [value]="customerRows" [columns]="customerColumns">
                  <ng-template jTableHeader="customerName" let-column>
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
                      [value]="customerRows.slice(0, 2)"
                      [columns]="customerColumns"
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
                      [value]="customerRows.slice(0, 2)"
                      [columns]="customerColumns"
                      [density]="density"
                    />
                  </div>
                }
              }
              @case ('skeleton') {
                <j-table
                  [value]="[]"
                  [columns]="customerColumns"
                  loading
                  loadingVariant="skeleton"
                  [skeletonRows]="4"
                />
              }
              @case ('overlay') {
                <j-table
                  [value]="customerRows.slice(0, 3)"
                  [columns]="customerColumns"
                  loading
                  loadingVariant="overlay"
                />
              }
              @case ('no-data') {
                <j-table
                  [value]="[]"
                  [columns]="customerColumns"
                  emptyTitle="No customers yet"
                  emptyDescription="New customer records will appear here."
                  emptyActionLabel="Add customer"
                />
              }
              @case ('no-results') {
                <j-table
                  [value]="customerRows"
                  [columns]="customerColumns"
                  globalFilter="no matching customer"
                  noResultsTitle="No matching customers"
                />
              }
              @case ('error') {
                <j-table
                  [value]="[]"
                  [columns]="customerColumns"
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
                <j-table [value]="[]" [columns]="customerColumns">
                  <ng-template jTableEmpty let-state>
                    <div class="j-preview-note">Integrated state: {{ state }}</div>
                  </ng-template>
                </j-table>
              }
              @default {
                <j-table
                  [value]="customerRows"
                  [columns]="customerColumns"
                  [selectionMode]="
                    example.key === 'selection' || example.key === 'accessibility'
                      ? 'checkbox'
                      : 'none'
                  "
                  [selection]="example.key === 'selection' ? tableSelection : null"
                  (selectionChange)="tableSelection = $event"
                  [paginator]="example.key === 'pagination'"
                  [rows]="3"
                  [filterDisplay]="example.key === 'filtering' ? 'row' : 'none'"
                  [showGlobalFilter]="example.key === 'filtering'"
                  [sortField]="example.key === 'sorting' ? 'customerName' : ''"
                  [sortOrder]="example.key === 'sorting' ? 1 : 0"
                  [caption]="example.key === 'accessibility' ? 'Customers awaiting review' : ''"
                  hover
                />
              }
            }
          }
          @if (tableActionMessage()) {
            <p class="j-preview-note" role="status" aria-live="polite">
              {{ tableActionMessage() }}
            </p>
          }
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
      @case ('data-display') {
        <div class="j-preview-grid">
          <j-data-display label="Name" value="Item A" />
          <j-data-display label="Amount" type="currency" [value]="1250" />
          <j-data-display label="Status" type="status" value="Active" severity="success" />
        </div>
      }
      @case ('timeline') {
        <j-timeline
          [variant]="
            example.key === 'activity'
              ? 'activity'
              : example.key === 'alternating'
                ? 'alternating'
                : 'default'
          "
          [layout]="example.key === 'horizontal' ? 'horizontal' : 'vertical'"
          [compact]="example.key === 'activity'"
          [collapsible]="example.key === 'collapsible'"
          [value]="timelineItems"
          [ariaLabel]="example.name"
        />
      }
      @case ('calendar-scheduler') {
        <j-calendar-scheduler
          [events]="schedulerEvents"
          [activeDate]="schedulerActiveDate"
          [view]="
            example.key === 'agenda'
              ? 'agenda'
              : example.key === 'week'
                ? 'week'
                : example.key === 'day'
                  ? 'day'
                  : 'month'
          "
          [locale]="example.key === 'locale' ? 'en-GB' : 'en-US'"
          [firstDayOfWeek]="example.key === 'week' || example.key === 'locale' ? 1 : 0"
          [showWeekends]="example.key !== 'week'"
          [hour12]="example.key !== 'locale'"
          [maxEventsPerDay]="2"
          ariaLabel="Customer meeting schedule"
        />
      }
      @case ('recurrence-editor') {
        <j-recurrence-editor
          [(value)]="schedulerRecurrenceRule"
          [startDate]="schedulerActiveDate"
          ariaLabel="Fictional event recurrence"
        />
      }
      @case ('scheduler-event-editor') {
        <j-scheduler-event-editor
          [event]="schedulerPreviewEvents[0]"
          [resources]="schedulerResources"
          [categories]="schedulerCategories"
          [timezones]="['local', 'UTC', 'Europe/London']"
          ariaLabel="Fictional schedule event editor"
          (saveRequest)="schedulerActionMessage = 'Event save request emitted'"
          (deleteRequest)="schedulerActionMessage = 'Event delete request emitted'"
          (cancel)="schedulerActionMessage = 'Event editor cancelled'"
        />
        <p role="status">{{ schedulerActionMessage }}</p>
      }
      @case ('scheduler') {
        <div
          [attr.dir]="example.key === 'rtl' ? 'rtl' : null"
          [class.j-dark]="example.key === 'dark'"
        >
          @if (example.key === 'recurrence-scope') {
            <j-recurrence-editor
              [(value)]="schedulerRecurrenceRule"
              [startDate]="schedulerActiveDate"
              ariaLabel="Event recurrence"
            />
          }
          @if (example.key === 'external-drop') {
            <div class="j-preview-actions">
              <j-button
                label="Drop fictional work item at July 16, 10:00"
                size="sm"
                (onClick)="simulateExternalDrop()"
              />
              <span role="status">{{ schedulerActionMessage }}</span>
            </div>
          }
          @if (example.key === 'dialog-edit') {
            <div class="j-preview-actions">
              <j-button label="Create event" size="sm" (onClick)="scheduler()?.openEventEditor()" />
              <span>Double-click an existing event to edit it.</span>
            </div>
          }
          @if (example.key === 'granular-editing') {
            <div class="j-preview-actions">
              <j-button label="Add permitted event" size="sm" (onClick)="addGranularEvent()" />
              <j-button
                label="Try blocked delete"
                size="sm"
                variant="outlined"
                (onClick)="tryGranularDelete()"
              />
              <span role="status">{{ schedulerActionMessage }}</span>
            </div>
          }
          @if (example.key === 'toolbar' && schedulerActionMessage) {
            <p role="status">{{ schedulerActionMessage }}</p>
          }
          @if (example.key === 'overflow-modes') {
            <div class="j-preview-actions" aria-label="Month overflow mode">
              @for (mode of schedulerMoreModes; track mode) {
                <j-button
                  [label]="mode"
                  size="sm"
                  [variant]="schedulerMoreMode === mode ? 'solid' : 'outlined'"
                  (onClick)="schedulerMoreMode = mode"
                />
              }
            </div>
          }
          @if (example.key === 'appointments') {
            <div class="j-preview-actions" aria-label="Appointment display mode">
              @for (mode of schedulerAppointmentDisplays; track mode) {
                <j-button
                  [label]="mode"
                  size="sm"
                  [variant]="schedulerAppointmentDisplay === mode ? 'solid' : 'outlined'"
                  (onClick)="schedulerAppointmentDisplay = mode"
                />
              }
            </div>
          }
          @if (example.key === 'timeline-interactions') {
            <div class="j-preview-actions" aria-label="Timeline zoom">
              <j-button label="Zoom out" size="sm" (onClick)="scheduler()?.zoomOut()" />
              <j-button
                label="Reset zoom"
                size="sm"
                variant="outlined"
                (onClick)="scheduler()?.resetZoom()"
              />
              <j-button label="Zoom in" size="sm" (onClick)="scheduler()?.zoomIn()" />
              <span>Multi-level month, week, and day headers remain aligned while zooming.</span>
            </div>
          }
          @if (example.key === 'async-validation') {
            <p>
              Focus an event and press Alt+Arrow to move it. The controlled update is emitted only
              after the simulated server guard approves it.
            </p>
            @if (schedulerActionMessage) {
              <p role="status">{{ schedulerActionMessage }}</p>
            }
          }
          @if (
            example.key === 'clipboard' ||
            example.key === 'undo-redo' ||
            example.key === 'excel-pdf'
          ) {
            <div class="j-preview-actions">
              @if (example.key === 'clipboard') {
                <j-button label="Copy selected" size="sm" (onClick)="copySchedulerEvents()" />
                <j-button
                  label="Paste on July 16"
                  size="sm"
                  variant="outlined"
                  (onClick)="pasteSchedulerEvents()"
                />
              }
              @if (example.key === 'undo-redo') {
                <j-button label="Move selected" size="sm" (onClick)="moveSchedulerEvent()" />
                <j-button
                  label="Undo"
                  size="sm"
                  variant="outlined"
                  (onClick)="scheduler()?.undo()"
                />
                <j-button
                  label="Redo"
                  size="sm"
                  variant="outlined"
                  (onClick)="scheduler()?.redo()"
                />
              }
              @if (example.key === 'excel-pdf') {
                <j-button label="Generate XLSX" size="sm" (onClick)="previewExcel()" />
                <j-button
                  label="Generate PDF"
                  size="sm"
                  variant="outlined"
                  (onClick)="previewPdf()"
                />
              }
              @if (schedulerActionMessage) {
                <span role="status">{{ schedulerActionMessage }}</span>
              }
            </div>
          }
          <j-scheduler
            [events]="schedulerEventsFor(example.key)"
            [eventData]="example.key === 'event-adapter' ? schedulerBackendEvents : []"
            [eventAdapter]="example.key === 'event-adapter' ? schedulerEventAdapter : null"
            [resources]="
              example.key === 'virtualized' ? schedulerLargeResources : schedulerResources
            "
            [resourceDimensions]="
              example.key === 'resource-dimensions' ? schedulerResourceDimensions : []
            "
            [categories]="schedulerCategories"
            [blockedIntervals]="example.key === 'blocked' ? schedulerBlockedIntervals : []"
            [businessHours]="example.key === 'business-hours' ? schedulerBusinessHours : []"
            [availability]="example.key === 'business-hours' ? schedulerAvailability : []"
            [appointmentSlots]="example.key === 'appointments' ? schedulerAppointmentSlots : []"
            [appointmentDisplay]="schedulerAppointmentDisplay"
            [date]="schedulerActiveDate"
            [view]="example.key === 'basic' ? schedulerPreviewView : schedulerViewFor(example.key)"
            [views]="schedulerViewsFor(example.key)"
            [customViews]="schedulerCustomViews"
            [customViewId]="
              example.key === 'custom-three-day'
                ? 'three-day'
                : example.key === 'custom-resource-timeline'
                  ? 'operations-window'
                  : null
            "
            [multiMonthLayout]="example.key === 'multi-month-stack' ? 'stack' : 'grid'"
            [daysOfWeek]="example.key === 'working-days' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6]"
            slotDuration="00:30"
            [maxEventsVisible]="example.key === 'more' || example.key === 'overflow-modes' ? 2 : 3"
            [moreEventsMode]="example.key === 'overflow-modes' ? schedulerMoreMode : 'popover'"
            [editable]="
              example.key === 'drag-drop' ||
              example.key === 'month-drag' ||
              example.key === 'resize' ||
              example.key === 'dialog-edit' ||
              example.key === 'cross-scheduler' ||
              example.key === 'external-drop' ||
              example.key === 'move-dialog' ||
              example.key === 'timeline-interactions' ||
              example.key === 'resource-timeline-interactions' ||
              example.key === 'granular-editing' ||
              example.key === 'async-validation'
            "
            [editableSettings]="
              example.key === 'granular-editing'
                ? schedulerGranularEditing
                : example.key === 'resize'
                  ? schedulerResizeFromStart
                  : {}
            "
            [eventChangeGuard]="example.key === 'async-validation' ? schedulerAsyncGuard : null"
            [readonly]="example.key === 'readonly'"
            [disabled]="example.key === 'disabled'"
            [rtl]="example.key === 'rtl'"
            [quickInfo]="
              example.key === 'quick-info' ||
              example.key === 'readonly' ||
              example.key === 'move-dialog'
            "
            [eventPopover]="example.key === 'event-popover'"
            [eventSelection]="example.key === 'event-selection'"
            [selectable]="example.key === 'range-selection'"
            [dateSelectionMode]="example.key === 'range-selection' ? 'dateRange' : null"
            [selectedRange]="example.key === 'range-selection' ? schedulerSelectedRange : null"
            [selectedEventIds]="example.key === 'event-selection' ? schedulerSelectedEventIds : []"
            [clipboardEnabled]="example.key === 'clipboard'"
            [historyEnabled]="example.key === 'undo-redo'"
            [externalDrag]="example.key === 'cross-scheduler'"
            [externalDropEnabled]="example.key === 'external-drop'"
            [builtInEditor]="example.key === 'dialog-edit'"
            [resourceEditable]="example.key === 'resource-reorder'"
            [resourceAggregateColumns]="example.key === 'resource-aggregate-columns'"
            [headerToolbar]="example.key === 'toolbar' ? schedulerToolbar : true"
            [footerToolbar]="example.key === 'toolbar' ? schedulerFooterToolbar : false"
            [filters]="schedulerFilters"
            schedulerId="preview-source"
            [remoteData]="example.key === 'remote-range'"
            [remotePrefetch]="example.key === 'remote-range'"
            [timelineVirtualScroll]="example.key === 'virtualized'"
            [(timelineZoom)]="schedulerTimelineZoom"
            [adaptiveMode]="example.key === 'adaptive-resources' ? 'always' : 'auto'"
            [locale]="example.key === 'locale' || example.key === 'time-format' ? 'en-GB' : 'en-US'"
            [calendar]="example.key === 'alternate-calendar' ? 'indian' : undefined"
            [timezone]="example.key === 'timezone' ? 'UTC' : 'local'"
            [displayTimezone]="example.key === 'timezone' ? 'Europe/London' : 'local'"
            height="34rem"
            ariaLabel="Operations schedule"
            (viewChange)="schedulerPreviewView = $event"
            (selectedEventIdsChange)="schedulerSelectedEventIds = $event"
            (selectedRangeChange)="schedulerSelectedRange = $event"
            (eventChange)="acceptSchedulerEventChange($event, example.key)"
            (eventAdd)="acceptSchedulerEventChange($event, example.key)"
            (eventRemove)="acceptSchedulerEventChange($event, example.key)"
            (eventDrop)="
              example.key === 'resource-timeline-interactions'
                ? (schedulerActionMessage = $event.valid
                    ? 'Moved to ' + $event.resourceId
                    : 'Move rejected: ' + $event.reason)
                : null
            "
            (filtersChange)="schedulerFilters = $event"
            (resourceMoveRequest)="
              schedulerActionMessage =
                'Move ' + $event.resource.name + ' ' + $event.position + ' ' + $event.target.name
            "
            (exportRequest)="schedulerActionMessage = 'JSON export requested'"
            (visibleRangeRequest)="
              schedulerActionMessage = $event.prefetch
                ? 'Prefetch range requested'
                : 'Visible range requested'
            "
          >
            @if (example.key === 'event-template') {
              <ng-template #jSchedulerEvent let-item>
                <span class="j-scheduler-doc-event-template">
                  <strong>{{ item.source.title }}</strong>
                  <small>{{ item.source.location || 'Flexible location' }}</small>
                </span>
              </ng-template>
            }
            @if (example.key === 'resource-template') {
              <ng-template #jSchedulerResourceRow let-resource let-count="eventCount">
                <span class="j-scheduler-doc-resource-template">
                  <strong>{{ resource.name }}</strong>
                  <small>{{ count }} scheduled</small>
                </span>
              </ng-template>
            }
            @if (example.key === 'cells-headers') {
              <ng-template #jSchedulerWeekdayHeader let-label>
                <strong class="j-scheduler-doc-weekday">{{ label }}</strong>
              </ng-template>
              <ng-template #jSchedulerDateNumber let-label>
                <span class="j-scheduler-doc-date-number">{{ label }}</span>
              </ng-template>
              <ng-template #jSchedulerMonthCell let-date>
                @if (date.getDay() === 1) {
                  <small aria-label="Planning day">Plan</small>
                }
              </ng-template>
            }
          </j-scheduler>
          @if (example.key === 'resource-reorder' && schedulerActionMessage) {
            <p role="status">{{ schedulerActionMessage }}</p>
          }
          @if (example.key === 'resource-timeline-interactions' && schedulerActionMessage) {
            <p role="status">{{ schedulerActionMessage }}</p>
          }
          @if (example.key === 'cross-scheduler') {
            <p><strong>Destination schedule</strong></p>
            <j-scheduler
              [events]="schedulerTargetEvents"
              [date]="schedulerActiveDate"
              view="week"
              [views]="['week']"
              editable
              externalDropEnabled
              schedulerId="preview-target"
              height="24rem"
              ariaLabel="Destination operations schedule"
              (externalDrop)="acceptExternalDrop($event)"
            />
          }
        </div>
      }
      @case ('data-view') {
        <j-data-view
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
        </j-data-view>
      }
      @case ('gantt') {
        <j-gantt [tasks]="ganttTasks" scale="week" />
      }
      @case ('kanban') {
        <j-kanban
          [value]="kanbanPreviewColumns"
          (reorder)="handleKanbanReorder($event)"
          (addCard)="addKanbanCard($event)"
          (removeCard)="removeKanbanCard($event)"
        />
      }
      @case ('order-list') {
        <j-order-list header="Priorities" [value]="transferSource" filter />
      }
      @case ('org-chart') {
        <j-org-chart [value]="organization" />
      }
      @case ('transfer-list') {
        <j-transfer-list
          [source]="transferSource"
          [target]="transferTarget"
          sourceHeader="Fields to add"
          targetHeader="Visible fields"
          filter
          moveOnDoubleClick
          responsiveMode="none"
        />
      }
      @case ('tree') {
        <j-tree [value]="treeNodes" filter ariaLabel="Customer folders" />
      }
      @case ('tree-table') {
        <div [attr.dir]="example.key === 'rtl' ? 'rtl' : null">
          <j-tree-table
            [value]="
              example.key === 'empty'
                ? []
                : example.key === 'lazy-children'
                  ? lazyTreeNodes
                  : treeNodes
            "
            [columns]="example.key === 'sorting' ? treeSortableColumns : treeColumns"
            [lazy]="example.key === 'lazy-children'"
            [filter]="example.key === 'filtering'"
            filterPlaceholder="Search customers"
            [selectionMode]="
              example.key === 'multiple-selection'
                ? 'multiple'
                : example.key === 'checkbox-selection'
                  ? 'checkbox'
                  : example.key === 'single-selection'
                    ? 'single'
                    : 'none'
            "
            [selection]="treeSelection"
            (selectionChange)="treeSelection = $event"
            [expandedKeys]="treeExpandedKeys"
            (expandedKeysChange)="treeExpandedKeys = $event"
            [propagateSelectionDown]="example.key === 'checkbox-selection'"
            [propagateSelectionUp]="example.key === 'checkbox-selection'"
            emptyMessage="No customer records found."
            [ariaLabel]="example.name + ' customer hierarchy'"
          >
            @if (example.key === 'custom-template') {
              <ng-template jTreeTableCell="type" let-value="value">
                <strong>{{ value }}</strong>
              </ng-template>
            }
          </j-tree-table>
        </div>
      }
      @case ('virtual-scroller') {
        <j-virtual-scroller
          [items]="virtualItems"
          [itemSize]="40"
          [viewportItems]="5"
          [loading]="example.key === 'loading'"
          [loadingThreshold]="example.key === 'loading' ? 100 : 4"
          loadingLabel="Loading more records"
          height="12rem"
        />
      }
    }
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataComponentPreviewComponent extends ComponentDetailViewBase {
  readonly scheduler = viewChild(JSchedulerComponent);
  readonly previewExample = input.required<DetailFeatureExample>();
  tableSelection: JTableSelection = [this.customerRows[1]];
  schedulerPreviewView: JSchedulerView = 'month';
  schedulerPreviewEvents: JSchedulerEvent[] = this.schedulerEvents.map((event) => ({ ...event }));
  schedulerResourceTimelineEvents: JSchedulerEvent[] = [
    {
      id: 'lane-booking',
      title: 'Lane booking',
      start: new Date(2026, 6, 14, 10),
      end: new Date(2026, 6, 14, 11),
      resourceId: 'room-a',
    },
  ];
  schedulerActionMessage = '';
  readonly schedulerMoreModes: readonly JSchedulerMoreEventsMode[] = [
    'popover',
    'dialog',
    'drawer',
    'expand',
  ];
  schedulerMoreMode: JSchedulerMoreEventsMode = 'popover';
  readonly schedulerAppointmentDisplays: readonly JSchedulerAppointmentDisplay[] = [
    'overlay',
    'grid',
    'indicator',
    'lane',
  ];
  schedulerAppointmentDisplay: JSchedulerAppointmentDisplay = 'overlay';
  schedulerTimelineZoom = 1;
  readonly schedulerGranularEditing: JSchedulerEditableSettings = {
    add: true,
    edit: false,
    remove: false,
    drag: false,
    resize: false,
    moveBetweenResources: false,
    moveBetweenSchedulers: false,
  };
  readonly schedulerResizeFromStart: JSchedulerEditableSettings = {
    resize: true,
    resizeFromStart: true,
  };
  readonly schedulerBackendEvents = [
    {
      bookingKey: 'adapter-briefing',
      subject: 'Backend model briefing',
      beginsAt: '2026-07-15T09:30:00',
      finishesAt: '2026-07-15T11:00:00',
      assignedResource: 'field-team',
    },
  ];
  readonly schedulerEventAdapter: JSchedulerEventAdapter = {
    fromSource: (source) => {
      const record = source as (typeof this.schedulerBackendEvents)[number];
      return {
        id: record.bookingKey,
        title: record.subject,
        start: new Date(record.beginsAt),
        end: new Date(record.finishesAt),
        resourceId: record.assignedResource,
      };
    },
  };
  schedulerFilters: JSchedulerFilterState = {};
  schedulerSelectedEventIds: readonly (string | number)[] = ['planning', 'review'];
  schedulerSelectedRange: JSchedulerSelection | null = null;
  schedulerTargetEvents: JSchedulerEvent[] = [];
  schedulerRecurrenceRule: JSchedulerRecurrenceRule | null = {
    frequency: 'weekly',
    weekdays: [1, 3],
    count: 8,
  };
  readonly schedulerCustomViews = [
    { id: 'three-day', label: 'Three day', type: 'timeGrid' as const, duration: { days: 3 } },
    {
      id: 'operations-window',
      label: 'Operations window',
      type: 'resourceTimeline' as const,
      duration: { days: 2 },
      slotDuration: { minutes: 45 },
    },
  ];
  readonly schedulerToolbar: JSchedulerToolbarConfig = {
    start: [
      'prev',
      'next',
      'today',
      'datePicker',
      {
        id: 'workflow-actions',
        ariaLabel: 'Workflow actions',
        buttons: [
          {
            id: 'create-shift',
            label: 'Create shift',
            onClick: () => (this.schedulerActionMessage = 'Custom Create shift action activated'),
          },
          {
            id: 'review-capacity',
            label: 'Review capacity',
            onClick: () => (this.schedulerActionMessage = 'Custom capacity review activated'),
          },
        ],
      },
    ],
    center: ['title'],
    end: ['resourceFilter', 'categoryFilter', 'search', 'print', 'export'],
  };
  readonly schedulerFooterToolbar: JSchedulerToolbarConfig = {
    start: ['today', 'timezone'],
    center: ['title'],
    end: ['month', 'week', 'day', 'agenda'],
  };
  readonly schedulerResources = [
    { id: 'operations', name: 'Operations', children: [{ id: 'room-a', name: 'Room A' }] },
    { id: 'field-team', name: 'Field team', capacity: 2 },
  ];
  readonly schedulerResourceDimensions: readonly JSchedulerResourceDimension[] = [
    {
      id: 'department',
      label: 'Department',
      resources: [
        { id: 'operations', name: 'Operations' },
        { id: 'support', name: 'Support' },
      ],
    },
    {
      id: 'room',
      label: 'Room',
      resources: [
        { id: 'north-room', name: 'North room' },
        { id: 'south-room', name: 'South room' },
      ],
    },
  ];
  readonly schedulerLargeResources = Array.from({ length: 500 }, (_, index) => ({
    id: `resource-${index + 1}`,
    name: `Resource ${index + 1}`,
  }));
  readonly schedulerCategories = [
    { id: 'customer', label: 'Customer', color: '#4f46e5' },
    { id: 'operations', label: 'Operations', color: '#0f766e' },
  ];
  readonly schedulerBlockedIntervals = [
    {
      id: 'maintenance',
      start: new Date(2026, 6, 14, 12),
      end: new Date(2026, 6, 14, 13),
      label: 'Equipment maintenance',
    },
  ];
  readonly schedulerBusinessHours = [
    { daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '17:00' },
  ];
  readonly schedulerAvailability = [
    {
      id: 'field-team-bookable',
      resourceId: 'field-team',
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:30',
      endTime: '15:30',
      label: 'Bookable window',
    },
  ];
  readonly schedulerAppointmentSlots = [
    {
      id: 'consultation',
      start: new Date(2026, 6, 14, 11),
      end: new Date(2026, 6, 14, 11, 30),
      capacity: 2,
      bookedCount: 1,
      status: 'available' as const,
    },
  ];

  schedulerEventsFor(key: string): readonly JSchedulerEvent[] {
    if (key === 'background-events')
      return [
        ...this.schedulerPreviewEvents,
        {
          id: 'availability-background',
          title: 'Preferred service window',
          start: new Date(2026, 6, 14, 8),
          end: new Date(2026, 6, 14, 12),
          display: 'background',
          color: '#0f766e',
        },
      ];
    if (['recurring', 'recurrence-exceptions', 'edit-occurrence', 'edit-future'].includes(key))
      return [
        ...this.schedulerPreviewEvents,
        {
          id: 'recurring-rounds',
          title: 'Service rounds',
          start: new Date(2026, 6, 13, 9),
          end: new Date(2026, 6, 13, 10),
          recurrenceRule: { frequency: 'daily', count: 8 },
          recurrenceExceptions: [
            { originalStart: new Date(2026, 6, 15, 9), excluded: true },
            {
              originalStart: new Date(2026, 6, 16, 9),
              start: new Date(2026, 6, 16, 11),
              end: new Date(2026, 6, 16, 12),
              title: 'Rescheduled service rounds',
            },
          ],
        },
      ];
    if (key === 'multiple-resources')
      return [
        ...this.schedulerPreviewEvents,
        {
          id: 'shared-booking',
          title: 'Shared resource booking',
          start: new Date(2026, 6, 14, 14),
          end: new Date(2026, 6, 14, 15),
          resourceIds: ['room-a', 'field-team'],
        },
      ];
    if (key === 'resource-dimensions')
      return [
        {
          id: 'dimension-booking',
          title: 'Operations in North room',
          start: new Date(2026, 6, 14, 10),
          end: new Date(2026, 6, 14, 11, 30),
          resourceIds: ['operations', 'north-room'],
        },
        {
          id: 'dimension-briefing',
          title: 'Support in South room',
          start: new Date(2026, 6, 15, 13),
          end: new Date(2026, 6, 15, 14),
          resourceIds: ['support', 'south-room'],
        },
      ];
    if (key === 'resource-timeline-interactions') return this.schedulerResourceTimelineEvents;
    if (key === 'custom-resource-timeline')
      return [
        {
          id: 'custom-window-booking',
          title: 'Custom operations window',
          start: new Date(2026, 6, 14, 10),
          end: new Date(2026, 6, 14, 12),
          resourceId: 'room-a',
        },
      ];
    return this.schedulerPreviewEvents;
  }

  schedulerViewFor(key: string): JSchedulerView {
    if (
      key === 'week' ||
      ['working-days', 'overlap', 'drag-drop', 'thirty-minute-slots'].includes(key)
    ) {
      return 'week';
    }
    if (['toolbar', 'background-events', 'keyboard', 'dark', 'event-adapter'].includes(key))
      return 'week';
    if (key === 'work-week') return 'workWeek';
    if (key === 'custom-three-day' || key === 'custom-resource-timeline') return 'custom';
    if (key === 'multi-month' || key === 'multi-month-stack') return 'multiMonth';
    if (key === 'month-agenda') return 'monthAgenda';
    if (['day', 'resize', 'appointments'].includes(key)) return 'day';
    if (
      key === 'agenda' ||
      key === 'data-operations' ||
      key === 'json-export' ||
      key === 'ics-export' ||
      key === 'excel-pdf'
    )
      return 'agenda';
    if (key === 'year') return 'year';
    if (key === 'timeline-interactions') return 'timelineWeek';
    if (key.startsWith('timeline-')) {
      return `timeline${key.slice(9, 10).toUpperCase()}${key.slice(10)}` as JSchedulerView;
    }
    if (
      [
        'flat-resources',
        'resource-week',
        'capacity',
        'adaptive-resources',
        'multiple-resources',
        'resource-dimensions',
        'resource-grouping',
        'resource-aggregate-columns',
        'business-hours',
      ].includes(key)
    ) {
      return 'resourceWeek';
    }
    if (
      [
        'hierarchical-resources',
        'resource-timeline',
        'resource-template',
        'resource-reorder',
        'resource-timeline-interactions',
      ].includes(key)
    ) {
      return 'resourceTimelineWeek';
    }
    if (key === 'date-grouping') return 'dateWeek';
    if (key === 'rtl') return 'timelineWeek';
    if (key === 'virtualized') return 'timelineYear';
    if (
      key === 'clipboard' ||
      key === 'undo-redo' ||
      key === 'remote-range' ||
      key === 'cross-scheduler' ||
      key === 'external-drop' ||
      key === 'granular-editing' ||
      key === 'async-validation'
    )
      return 'week';
    return 'month';
  }

  schedulerViewsFor(key: string): readonly JSchedulerView[] {
    const active = this.schedulerViewFor(key);
    const views: JSchedulerView[] = ['month', 'week', 'workWeek', 'day', active];
    return views.filter((view, index, views) => views.indexOf(view) === index);
  }

  acceptSchedulerEventChange(request: JSchedulerEventChangeRequest, key?: string): void {
    const source =
      key === 'resource-timeline-interactions'
        ? this.schedulerResourceTimelineEvents
        : this.schedulerPreviewEvents;
    if (request.reason === 'remove') {
      const updated = source.filter((event) => String(event.id) !== String(request.event.id));
      if (key === 'resource-timeline-interactions') this.schedulerResourceTimelineEvents = updated;
      else this.schedulerPreviewEvents = updated;
      return;
    }
    const index = source.findIndex((event) => String(event.id) === String(request.event.id));
    const updated =
      index < 0
        ? [...source, request.event]
        : source.map((event, eventIndex) => (eventIndex === index ? request.event : event));
    if (key === 'resource-timeline-interactions') this.schedulerResourceTimelineEvents = updated;
    else this.schedulerPreviewEvents = updated;
  }

  copySchedulerEvents(): void {
    const count = this.scheduler()?.copyEvents().length ?? 0;
    this.schedulerActionMessage = `${count} events copied`;
  }

  pasteSchedulerEvents(): void {
    const count = this.scheduler()?.pasteEvents({ start: new Date(2026, 6, 16, 9) }).length ?? 0;
    this.schedulerActionMessage = `${count} events proposed for paste`;
  }

  moveSchedulerEvent(): void {
    const event = this.schedulerPreviewEvents[0];
    if (!event) return;
    this.scheduler()?.updateEvent({
      ...event,
      start: new Date(event.start.getTime() + 86_400_000),
      end: event.end ? new Date(event.end.getTime() + 86_400_000) : undefined,
    });
    this.schedulerActionMessage = 'Move proposed; use Undo or Redo';
  }

  addGranularEvent(): void {
    this.scheduler()?.addEvent({
      id: `permitted-${this.schedulerPreviewEvents.length}`,
      title: 'Permitted new appointment',
      start: new Date(2026, 6, 17, 10),
      end: new Date(2026, 6, 17, 10, 30),
    });
    this.schedulerActionMessage = 'Add request accepted; other mutation permissions remain blocked';
  }

  tryGranularDelete(): void {
    const event = this.schedulerPreviewEvents[0];
    if (event) this.scheduler()?.removeEvent(event.id);
    this.schedulerActionMessage = 'Delete request blocked by editableSettings';
  }

  readonly schedulerAsyncGuard = async (): Promise<boolean> => {
    this.schedulerActionMessage = 'Validating proposed move…';
    await new Promise<void>((resolve) => setTimeout(resolve, 250));
    this.schedulerActionMessage = 'Server validation approved; controlled update accepted';
    return true;
  };

  previewExcel(): void {
    const bytes =
      this.scheduler()?.exportToXLSX({ sheetName: 'Operations schedule' }).byteLength ?? 0;
    this.schedulerActionMessage = `XLSX workbook generated (${bytes} bytes)`;
  }

  previewPdf(): void {
    const bytes = this.scheduler()?.exportToPDF().byteLength ?? 0;
    this.schedulerActionMessage = `PDF generated (${bytes} bytes)`;
  }

  simulateExternalDrop(): void {
    const request = this.scheduler()?.receiveExternalDrop(
      {
        version: 1,
        sourceSchedulerId: 'fictional-work-list',
        copy: true,
        events: [
          {
            id: 'external-work-item',
            title: 'External work item',
            start: new Date(2026, 6, 14, 10),
            end: new Date(2026, 6, 14, 11),
          },
        ],
      },
      { start: new Date(2026, 6, 16, 10) },
    );
    if (request) this.acceptExternalDrop(request, false);
  }

  acceptExternalDrop(request: JSchedulerExternalDropRequest, destination = true): void {
    if (!request.valid) {
      this.schedulerActionMessage = 'Drop rejected';
      return;
    }
    if (destination)
      this.schedulerTargetEvents = [...this.schedulerTargetEvents, ...request.proposedEvents];
    else this.schedulerPreviewEvents = [...this.schedulerPreviewEvents, ...request.proposedEvents];
    this.schedulerActionMessage = `${request.proposedEvents.length} external event proposed`;
  }
}

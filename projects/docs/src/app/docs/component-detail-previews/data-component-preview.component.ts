import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { JTableSelection } from 'jrng-ui/table';
import type { JSchedulerView } from 'jrng-ui/scheduler';
import {
  COMPONENT_PREVIEW_IMPORTS,
  ComponentDetailViewBase,
  DetailFeatureExample,
} from '../component-detail-view-base';

@Component({
  selector: 'app-data-component-preview',
  imports: [COMPONENT_PREVIEW_IMPORTS],
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
      @case ('scheduler') {
        <div [attr.dir]="example.key === 'rtl' ? 'rtl' : null">
          <j-scheduler
            [events]="schedulerEvents"
            [resources]="schedulerResources"
            [categories]="schedulerCategories"
            [blockedIntervals]="example.key === 'blocked' ? schedulerBlockedIntervals : []"
            [appointmentSlots]="example.key === 'appointments' ? schedulerAppointmentSlots : []"
            [date]="schedulerActiveDate"
            [view]="example.key === 'basic' ? schedulerPreviewView : schedulerViewFor(example.key)"
            [daysOfWeek]="example.key === 'working-days' ? [1, 2, 3, 4, 5] : []"
            [maxEventsVisible]="example.key === 'more' ? 2 : 3"
            [editable]="example.key === 'drag-drop' || example.key === 'resize'"
            [readonly]="example.key === 'readonly'"
            [disabled]="example.key === 'disabled'"
            [rtl]="example.key === 'rtl'"
            [quickInfo]="example.key === 'quick-info' || example.key === 'readonly'"
            [eventPopover]="example.key === 'event-popover'"
            [eventSelection]="example.key === 'event-selection'"
            [timelineVirtualScroll]="example.key === 'virtualized'"
            [adaptiveMode]="example.key === 'adaptive-resources' ? 'always' : 'auto'"
            [locale]="example.key === 'locale' || example.key === 'time-format' ? 'en-GB' : 'en-US'"
            [timezone]="example.key === 'timezone' ? 'UTC' : 'local'"
            [displayTimezone]="example.key === 'timezone' ? 'Europe/London' : 'local'"
            height="34rem"
            ariaLabel="Operations schedule"
            (viewChange)="schedulerPreviewView = $event"
          />
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
  readonly previewExample = input.required<DetailFeatureExample>();
  tableSelection: JTableSelection = [this.customerRows[1]];
  schedulerPreviewView: JSchedulerView = 'month';
  readonly schedulerResources = [
    { id: 'operations', name: 'Operations', children: [{ id: 'room-a', name: 'Room A' }] },
    { id: 'field-team', name: 'Field team', capacity: 2 },
  ];
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

  schedulerViewFor(key: string): JSchedulerView {
    if (
      key === 'week' ||
      ['working-days', 'business-hours', 'overlap', 'drag-drop'].includes(key)
    ) {
      return 'week';
    }
    if (['day', 'resize', 'appointments'].includes(key)) return 'day';
    if (key === 'agenda' || key === 'data-operations') return 'agenda';
    if (key === 'year') return 'year';
    if (key.startsWith('timeline-')) {
      return `timeline${key.slice(9, 10).toUpperCase()}${key.slice(10)}` as JSchedulerView;
    }
    if (['flat-resources', 'resource-week', 'capacity', 'adaptive-resources'].includes(key)) {
      return 'resourceWeek';
    }
    if (['hierarchical-resources', 'resource-timeline'].includes(key)) {
      return 'resourceTimelineWeek';
    }
    if (key === 'date-grouping') return 'dateWeek';
    if (key === 'rtl') return 'timelineWeek';
    if (key === 'virtualized') return 'timelineYear';
    return 'month';
  }
}

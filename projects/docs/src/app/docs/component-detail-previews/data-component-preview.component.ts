import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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
        <j-calendar-scheduler [events]="schedulerEvents" ariaLabel="Team schedule" />
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
        />
      }
      @case ('tree') {
        <j-tree [value]="treeNodes" filter ariaLabel="Customer folders" />
      }
      @case ('tree-table') {
        <j-tree-table [value]="treeNodes" [columns]="treeColumns" ariaLabel="Customer hierarchy" />
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
}

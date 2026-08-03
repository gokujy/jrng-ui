import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerFlattenResources, JSchedulerResourceRow } from '../engine/resource-engine';
import { jSchedulerTimelineSlots, jSchedulerVirtualWindow } from '../engine/timeline-engine';
import {
  JSchedulerDateRange,
  JSchedulerEventInteraction,
  JSchedulerId,
  JSchedulerResource,
  JSchedulerView,
  JSchedulerVisibleEvent,
} from '../scheduler.models';

@Component({
  selector: 'j-scheduler-timeline-renderer',
  imports: [JButtonComponent, JTooltipDirective],
  template: `
    <div
      class="j-scheduler-timeline"
      [style.--j-resource-width]="resourceWidth()"
      [style.--j-timeline-width.px]="totalWidth()"
      data-j-slot="timeline"
    >
      <div class="j-scheduler-timeline__resource-heading">Resources</div>
      <div class="j-scheduler-timeline__viewport" (scroll)="handleScroll($event)">
        <div class="j-scheduler-timeline__canvas" [style.width.px]="totalWidth()">
          <div class="j-scheduler-timeline__header" [style.width.px]="totalWidth()">
            @for (slot of window().items; track slot.index) {
              <div
                class="j-scheduler-timeline__header-cell"
                [style.inset-inline-start.px]="slot.index * slotWidth()"
                [style.width.px]="slotWidth()"
                [attr.data-date]="dateKey(slot.start)"
                data-j-slot="timeline-header"
              >
                {{ slot.label }}
              </div>
            }
          </div>
          @for (row of rows(); track row.resource.id) {
            <div
              class="j-scheduler-timeline__lane"
              [attr.data-resource-id]="row.resource.id"
              data-j-slot="resource-lane"
            >
              @for (slot of window().items; track slot.index) {
                <button
                  type="button"
                  class="j-scheduler-timeline__cell"
                  [style.inset-inline-start.px]="slot.index * slotWidth()"
                  [style.width.px]="slotWidth()"
                  [disabled]="disabled() || row.resource.disabled"
                  [attr.aria-label]="row.resource.name + ', ' + slot.label"
                  [attr.data-date]="dateKey(slot.start)"
                  [attr.data-resource-id]="row.resource.id"
                  (click)="cellActivate.emit({ date: slot.start, resourceId: row.resource.id })"
                ></button>
              }
              @for (event of eventsFor(row); track event.occurrenceId) {
                <button
                  type="button"
                  class="j-scheduler-timeline-event"
                  [style.inset-inline-start.px]="eventLeft(event)"
                  [style.width.px]="eventWidth(event)"
                  [style.--j-event-color]="event.source.color || row.resource.color || null"
                  [disabled]="disabled() || event.source.disabled"
                  [attr.data-event-id]="event.source.id"
                  [attr.data-resource-id]="row.resource.id"
                  [jTooltip]="eventLabel(event)"
                  (click)="
                    eventActivate.emit({
                      event: event.source,
                      occurrenceStart: event.start,
                      nativeEvent: $event,
                    })
                  "
                >
                  {{ event.source.title }}
                </button>
              }
            </div>
          }
        </div>
      </div>
      <div class="j-scheduler-timeline__rail" data-j-slot="resource-rail">
        @for (row of rows(); track row.resource.id) {
          <div
            class="j-scheduler-timeline__resource"
            [style.padding-inline-start.rem]="0.75 + row.depth"
            [attr.data-resource-id]="row.resource.id"
          >
            @if (row.parent && expandable()) {
              <j-button
                [icon]="row.expanded ? 'chevron-down' : 'chevron-right'"
                [ariaLabel]="(row.expanded ? 'Collapse ' : 'Expand ') + row.resource.name"
                variant="text"
                size="sm"
                [disabled]="disabled()"
                [jTooltip]="row.expanded ? 'Collapse resource' : 'Expand resource'"
                (onClick)="toggle.emit(row)"
              />
            }
            <button
              type="button"
              class="j-scheduler-timeline__resource-name"
              [disabled]="disabled() || row.resource.disabled"
              [jTooltip]="row.resource.name"
              (click)="resourceActivate.emit(row.resource)"
            >
              {{ row.resource.name }}
            </button>
            <span>{{ row.eventCount }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './timeline-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerTimelineRendererComponent {
  readonly view = input.required<JSchedulerView>();
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly expandedIds = input<readonly JSchedulerId[] | boolean>(true);
  readonly resourceAreaWidth = input<number | string>(240);
  readonly expandable = input(true);
  readonly slotWidth = input(72);
  readonly durationMinutes = input(60);
  readonly virtual = input(true);
  readonly virtualThreshold = input(200);
  readonly overscan = input(4);
  readonly locale = input('en-US');
  readonly disabled = input(false);
  readonly eventActivate = output<JSchedulerEventInteraction>();
  readonly resourceActivate = output<JSchedulerResource>();
  readonly toggle = output<JSchedulerResourceRow>();
  readonly cellActivate = output<{ readonly date: Date; readonly resourceId: JSchedulerId }>();
  readonly scrollLeft = signal(0);
  readonly viewportWidth = signal(800);
  readonly slots = computed(() =>
    jSchedulerTimelineSlots(this.range(), this.view(), this.locale(), this.durationMinutes()),
  );
  readonly totalWidth = computed(() => this.slots().length * this.slotWidth());
  readonly window = computed(() =>
    this.virtual() && this.slots().length >= this.virtualThreshold()
      ? jSchedulerVirtualWindow(
          this.slots(),
          this.slotWidth(),
          this.scrollLeft(),
          this.viewportWidth(),
          this.overscan(),
        )
      : {
          items: this.slots(),
          startIndex: 0,
          endIndex: this.slots().length,
          before: 0,
          after: 0,
          totalSize: this.totalWidth(),
        },
  );
  readonly rows = computed(() =>
    this.resources().length
      ? jSchedulerFlattenResources(
          this.resources(),
          this.expandedIds(),
          this.events().map((item) => item.source),
        )
      : [
          {
            resource: { id: '__schedule', name: 'Schedule' },
            depth: 0,
            parent: false,
            expanded: true,
            eventCount: this.events().length,
          },
        ],
  );
  resourceWidth() {
    return typeof this.resourceAreaWidth() === 'number'
      ? `${this.resourceAreaWidth()}px`
      : this.resourceAreaWidth();
  }
  handleScroll(event: Event) {
    const element = event.currentTarget as HTMLElement;
    this.scrollLeft.set(Math.abs(element.scrollLeft));
    this.viewportWidth.set(element.clientWidth);
  }
  eventsFor(row: JSchedulerResourceRow) {
    return row.resource.id === '__schedule'
      ? this.events()
      : this.events().filter((event) =>
          [event.source.resourceId, ...(event.source.resourceIds ?? [])].some(
            (id) => String(id) === String(row.resource.id),
          ),
        );
  }
  eventLeft(event: JSchedulerVisibleEvent) {
    return Math.max(
      0,
      ((event.start.getTime() - this.range().start.getTime()) /
        (this.range().end.getTime() - this.range().start.getTime())) *
        this.totalWidth(),
    );
  }
  eventWidth(event: JSchedulerVisibleEvent) {
    return Math.max(
      16,
      ((event.end.getTime() - event.start.getTime()) /
        (this.range().end.getTime() - this.range().start.getTime())) *
        this.totalWidth(),
    );
  }
  eventLabel(event: JSchedulerVisibleEvent) {
    return `${event.source.title}, ${new Intl.DateTimeFormat(this.locale(), { dateStyle: 'medium', timeStyle: 'short' }).formatRange(event.start, event.end)}`;
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, computed, contentChild, input } from '@angular/core';

export type JGanttScale = 'day' | 'week' | 'month';

export interface JGanttTask {
  readonly id: string;
  readonly label: string;
  readonly start: Date | string;
  readonly end: Date | string;
  readonly progress?: number;
  readonly dependencies?: readonly string[];
  readonly data?: unknown;
}

export interface JGanttTaskContext {
  readonly $implicit: JGanttTask;
  readonly task: JGanttTask;
  readonly index: number;
}

interface JGanttSlot {
  readonly label: string;
  readonly date: Date;
}

interface JGanttTaskView {
  readonly task: JGanttTask;
  readonly left: number;
  readonly width: number;
}

@Component({
  selector: 'j-gantt',
  imports: [NgTemplateOutlet],
  template: `
    <section class="j-gantt" [class]="styleClass()" data-jc-name="gantt" data-jc-section="root">
      <div class="j-gantt__scroll" data-jc-section="viewport">
        <div class="j-gantt__grid" [style.--j-gantt-slots]="timelineSlots().length">
          <div class="j-gantt__corner">{{ labelHeader() }}</div>
          <div class="j-gantt__timeline">
            @for (slot of timelineSlots(); track slot.label) {
              <span>{{ slot.label }}</span>
            }
          </div>

          @for (view of taskViews(); track view.task.id; let index = $index) {
            <div class="j-gantt__row-label">
              <strong>{{ view.task.label }}</strong>
              @if (dependencyLabel(view.task)) {
                <small>Depends on {{ dependencyLabel(view.task) }}</small>
              }
            </div>
            <div class="j-gantt__row">
              <div class="j-gantt__bar" [style.left.%]="view.left" [style.width.%]="view.width">
                <span class="j-gantt__progress" [style.width.%]="progress(view.task)"></span>
                <span class="j-gantt__bar-content">
                  @if (taskTemplate(); as template) {
                    <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="taskContext(view.task, index)" />
                  } @else {
                    {{ view.task.label }}
                  }
                </span>
              </div>
            </div>
          } @empty {
            <div class="j-gantt__empty">{{ emptyMessage() }}</div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .j-gantt {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        overflow: hidden;
      }

      .j-gantt__scroll {
        overflow-x: auto;
      }

      .j-gantt__grid {
        display: grid;
        grid-template-columns: 14rem minmax(48rem, 1fr);
        min-width: 64rem;
      }

      .j-gantt__corner,
      .j-gantt__timeline,
      .j-gantt__row-label,
      .j-gantt__row {
        border-bottom: 1px solid var(--j-color-border);
      }

      .j-gantt__corner,
      .j-gantt__row-label {
        border-right: 1px solid var(--j-color-border);
        padding: var(--j-spacing-3);
      }

      .j-gantt__corner,
      .j-gantt__timeline {
        background: var(--j-table-header-bg, var(--j-color-muted));
        color: var(--j-color-muted-foreground);
        font-weight: var(--j-font-weight-semibold);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .j-gantt__timeline {
        display: grid;
        grid-template-columns: repeat(var(--j-gantt-slots), minmax(5rem, 1fr));
      }

      .j-gantt__timeline span {
        border-right: 1px solid var(--j-color-border);
        padding: var(--j-spacing-3);
      }

      .j-gantt__row-label {
        display: grid;
        gap: var(--j-spacing-1);
      }

      .j-gantt__row-label small {
        color: var(--j-color-muted-foreground);
      }

      .j-gantt__row {
        background-image: linear-gradient(to right, var(--j-color-border) 1px, transparent 1px);
        background-size: calc(100% / var(--j-gantt-slots)) 100%;
        min-height: 3.5rem;
        position: relative;
      }

      .j-gantt__bar {
        background: color-mix(in srgb, var(--j-color-primary) 16%, var(--j-color-card));
        border: 1px solid var(--j-color-primary);
        border-radius: var(--j-radius-md);
        color: var(--j-color-primary);
        display: grid;
        inset-block-start: 0.75rem;
        min-width: 2rem;
        overflow: hidden;
        position: absolute;
      }

      .j-gantt__progress {
        background: color-mix(in srgb, var(--j-color-primary) 30%, transparent);
        bottom: 0;
        left: 0;
        position: absolute;
        top: 0;
      }

      .j-gantt__bar-content {
        overflow: hidden;
        padding: var(--j-spacing-2);
        position: relative;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .j-gantt__empty {
        color: var(--j-color-muted-foreground);
        grid-column: 1 / -1;
        padding: var(--j-spacing-4);
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGanttComponent {
  readonly tasks = input<readonly JGanttTask[]>([]);
  readonly scale = input<JGanttScale>('week');
  readonly start = input<Date | string | null>(null);
  readonly end = input<Date | string | null>(null);
  readonly labelHeader = input('Task');
  readonly emptyMessage = input('No tasks to display.');
  readonly styleClass = input('');

  readonly taskTemplate = contentChild<unknown, TemplateRef<JGanttTaskContext>>('jGanttTask', { read: TemplateRef });

  readonly range = computed(() => {
    const dates = this.tasks().flatMap((task) => [toDate(task.start), toDate(task.end)]);
    const start = this.start() ? toDate(this.start() as Date | string) : minDate(dates);
    const end = this.end() ? toDate(this.end() as Date | string) : maxDate(dates);
    return { start: startOfDay(start), end: startOfDay(end) };
  });

  readonly timelineSlots = computed<readonly JGanttSlot[]>(() => {
    const slots: JGanttSlot[] = [];
    const step = this.scale();
    let cursor = new Date(this.range().start);
    while (cursor <= this.range().end) {
      slots.push({ date: new Date(cursor), label: formatSlot(cursor, step) });
      cursor = addScale(cursor, step);
    }
    return slots.length ? slots : [{ date: new Date(), label: formatSlot(new Date(), step) }];
  });

  readonly taskViews = computed<readonly JGanttTaskView[]>(() => {
    const total = Math.max(1, diffDays(this.range().start, this.range().end) + 1);
    return this.tasks().map((task) => {
      const start = startOfDay(toDate(task.start));
      const end = startOfDay(toDate(task.end));
      const left = (diffDays(this.range().start, start) / total) * 100;
      const width = ((diffDays(start, end) + 1) / total) * 100;
      return { task, left: Math.max(0, left), width: Math.min(100, Math.max(2, width)) };
    });
  });

  progress(task: JGanttTask): number {
    return Math.min(100, Math.max(0, task.progress ?? 0));
  }

  dependencyLabel(task: JGanttTask): string {
    return task.dependencies?.join(', ') ?? '';
  }

  taskContext(task: JGanttTask, index: number): JGanttTaskContext {
    return { $implicit: task, task, index };
  }
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function minDate(values: readonly Date[]): Date {
  return values.length ? new Date(Math.min(...values.map((date) => date.getTime()))) : new Date();
}

function maxDate(values: readonly Date[]): Date {
  return values.length ? new Date(Math.max(...values.map((date) => date.getTime()))) : new Date();
}

function diffDays(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function addScale(date: Date, scale: JGanttScale): Date {
  const next = new Date(date);
  if (scale === 'day') {
    next.setDate(next.getDate() + 1);
  } else if (scale === 'week') {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

function formatSlot(date: Date, scale: JGanttScale): string {
  if (scale === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

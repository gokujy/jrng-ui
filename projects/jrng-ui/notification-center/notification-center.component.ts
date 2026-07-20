import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { JSeverity } from 'jrng-ui/core';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JToastService } from 'jrng-ui/toast';
import { JButtonComponent } from 'jrng-ui/button';
import { JTooltipDirective } from 'jrng-ui/tooltip';

export type JNotificationCenterLayout = 'panel' | 'drawer' | 'popover';
export interface JNotification<T = unknown> {
  readonly id: string | number;
  readonly title: string;
  readonly message?: string;
  readonly timestamp?: Date | string | number;
  readonly read?: boolean;
  readonly severity?: JSeverity;
  readonly actions?: readonly { id: string; label: string }[];
  readonly data?: T;
}

@Component({
  selector: 'j-notification-center',
  imports: [JPopoverComponent, NgTemplateOutlet, DatePipe, JButtonComponent, JTooltipDirective],
  template: `
    <ng-template #content
      ><section
        class="j-notification-center__panel"
        [class.j-notification-center__panel--drawer]="layout() === 'drawer'"
        data-jc-name="notification-center"
        data-jc-section="root"
      >
        <header>
          <strong>{{ heading() }}</strong>
          @if (showMarkAll() || notifications()) {
            <j-button size="sm" variant="text" [label]="markAllLabel()" (onClick)="markAllRead()" />
          }
          <j-button size="sm" variant="text" [label]="clearLabel()" (onClick)="clearAll()" />
        </header>
        @if (showFilters()) {
          <div class="j-notification-center__filters">
            <j-button
              size="sm"
              variant="soft"
              label="All"
              [ariaPressed]="filter() === 'all'"
              (onClick)="filter.set('all')"
            />
            <j-button
              size="sm"
              variant="soft"
              label="Unread"
              [ariaPressed]="filter() === 'unread'"
              (onClick)="filter.set('unread')"
            />
          </div>
        }
        @if (loading()) {
          <p role="status">Loading notifications...</p>
        } @else if (error()) {
          <p role="alert">{{ error() }}</p>
        } @else {
          <div class="j-notification-center__list">
            @for (item of filtered(); track item.id; let index = $index) {
              @if (groupByDate() && startsDateGroup(item, index)) {
                <h3 class="j-notification-center__date">{{ item.timestamp | date: 'longDate' }}</h3>
              }
              <article
                class="j-notification-center__item"
                [class.is-unread]="!isRead(item)"
                [attr.data-severity]="item.severity || 'neutral'"
              >
                @if (itemTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{ $implicit: item }"
                  />
                } @else {
                  <div class="j-notification-center__content">
                    <j-button variant="text" [label]="item.title" (onClick)="markRead(item)" />
                    @if (item.message) {
                      <p>{{ item.message }}</p>
                    }
                    @if (item.timestamp) {
                      <time>{{ item.timestamp | date: 'medium' }}</time>
                    }
                  </div>
                  @for (actionItem of item.actions || []; track actionItem.id) {
                    <j-button
                      size="sm"
                      variant="text"
                      [label]="actionItem.label"
                      (onClick)="action.emit({ notification: item, actionId: actionItem.id })"
                    />
                  }
                  @if (notifications()) {
                    <j-button
                      size="sm"
                      variant="text"
                      icon="x"
                      ariaLabel="Delete notification"
                      jTooltip="Delete notification"
                      (onClick)="remove(item)"
                    >
                      ×
                    </j-button>
                  }
                }
              </article>
            } @empty {
              <p>{{ emptyMessage() }}</p>
            }
          </div>
        }
        @if (infinite()) {
          <j-button variant="text" label="Load more" (onClick)="loadMore.emit()" />
        }</section
    ></ng-template>
    @if (layout() === 'panel') {
      <ng-container [ngTemplateOutlet]="content" />
    } @else {
      <j-popover
        [visible]="visible()"
        (visibleChange)="visible.set($event)"
        [target]="target()"
        position="bottom"
        styleClass="j-notification-center"
        ><ng-container [ngTemplateOutlet]="content"
      /></j-popover>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .j-notification-center__panel {
        min-width: min(24rem, calc(100vw - 2rem));
        max-height: min(40rem, 80vh);
        overflow: auto;
      }
      .j-notification-center__panel--drawer {
        height: 100vh;
        max-height: none;
        width: min(28rem, 100vw);
      }
      header {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-3);
      }
      header strong {
        margin-inline-end: auto;
      }
      .j-notification-center__filters {
        display: flex;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-2);
      }
      .j-notification-center__list {
        display: grid;
      }
      .j-notification-center__date {
        font-size: var(--j-font-size-sm);
        margin: 0;
        padding: var(--j-spacing-3);
      }
      .j-notification-center__item {
        align-items: start;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-3);
      }
      .j-notification-center__item.is-unread {
        background: color-mix(in srgb, var(--j-color-primary) 8%, transparent);
      }
      .j-notification-center__content {
        background: transparent;
        border: 0;
        color: inherit;
        flex: 1;
        text-align: start;
      }
      .j-notification-center__item p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0;
      }
      .j-notification-center__item time {
        font-size: var(--j-font-size-xs);
        color: var(--j-color-muted-foreground);
      }
      @media (max-width: 40rem) {
        .j-notification-center__panel {
          min-width: calc(100vw - 1rem);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JNotificationCenterComponent<T = unknown> {
  readonly toastService = inject(JToastService);
  readonly visible = model(false);
  readonly target = input<HTMLElement | null>(null);
  readonly heading = input('Notifications');
  readonly clearLabel = input('Clear');
  readonly markAllLabel = input('Mark all read');
  readonly emptyMessage = input('No notifications.');
  readonly notifications = input<readonly JNotification<T>[] | null>(null);
  readonly layout = input<JNotificationCenterLayout>('popover');
  readonly loading = input(false);
  readonly error = input('');
  readonly showFilters = input(false);
  readonly showMarkAll = input(false);
  readonly infinite = input(false);
  readonly groupByDate = input(false);
  readonly markReadChange = output<JNotification<T>>();
  readonly markAllReadChange = output<void>();
  readonly delete = output<JNotification<T>>();
  readonly action = output<{ notification: JNotification<T>; actionId: string }>();
  readonly loadMore = output<void>();
  readonly itemTemplate = contentChild<unknown, TemplateRef<unknown>>('jNotificationItem', {
    read: TemplateRef,
  });
  readonly filter = signal<'all' | 'unread'>('all');
  readonly readIds = signal(new Set<string | number>());
  readonly deletedIds = signal(new Set<string | number>());
  readonly resolved = computed<readonly JNotification<T>[]>(
    () =>
      this.notifications() ??
      this.toastService.toasts().map(
        (t) =>
          ({
            id: t.id,
            title: t.summary,
            message: t.detail,
            severity: t.severity as JSeverity,
          }) as JNotification<T>,
      ),
  );
  readonly filtered = computed(() =>
    this.resolved().filter(
      (n) => !this.deletedIds().has(n.id) && (this.filter() === 'all' || !this.isRead(n)),
    ),
  );
  isRead(n: JNotification<T>) {
    return n.read === true || this.readIds().has(n.id);
  }
  markRead(n: JNotification<T>) {
    if (this.isRead(n)) return;
    this.readIds.update((s) => new Set(s).add(n.id));
    this.markReadChange.emit(n);
  }
  markAllRead() {
    this.readIds.set(new Set(this.resolved().map((n) => n.id)));
    this.markAllReadChange.emit();
  }
  remove(n: JNotification<T>) {
    this.deletedIds.update((s) => new Set(s).add(n.id));
    this.delete.emit(n);
  }
  clearAll() {
    if (this.notifications()) this.deletedIds.set(new Set(this.resolved().map((n) => n.id)));
    else this.toastService.clear();
  }
  startsDateGroup(item: JNotification<T>, index: number): boolean {
    return (
      index === 0 ||
      notificationDay(item.timestamp) !== notificationDay(this.filtered()[index - 1]?.timestamp)
    );
  }
}

function notificationDay(value: Date | string | number | undefined): string {
  const date = value == null ? new Date(Number.NaN) : new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

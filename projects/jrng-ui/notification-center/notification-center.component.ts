import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JrToastService } from 'jrng-ui/toast';
import { inject } from '@angular/core';

@Component({
  selector: 'j-notification-center',
  imports: [JPopoverComponent],
  template: `
    <j-popover
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [target]="target()"
      position="bottom"
      styleClass="j-notification-center"
    >
      <section
        class="j-notification-center__panel"
        data-jc-name="notification-center"
        data-jc-section="root"
      >
        <header class="j-notification-center__header">
          <strong>{{ heading() }}</strong>
          <button type="button" class="j-notification-center__clear" (click)="toastService.clear()">
            {{ clearLabel() }}
          </button>
        </header>
        <div class="j-notification-center__list">
          @for (toast of toastService.toasts(); track toast.id) {
            <article class="j-notification-center__item" [attr.data-j-active]="true">
              <strong>{{ toast.summary }}</strong>
              @if (toast.detail) {
                <p>{{ toast.detail }}</p>
              }
            </article>
          } @empty {
            <p class="j-notification-center__empty">{{ emptyMessage() }}</p>
          }
        </div>
      </section>
    </j-popover>
  `,
  styles: [
    `
      .j-notification-center__panel {
        min-width: min(24rem, calc(100vw - 2rem));
      }

      .j-notification-center__header {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        justify-content: space-between;
        padding-bottom: var(--j-spacing-3);
      }

      .j-notification-center__clear {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
      }

      .j-notification-center__list {
        display: grid;
        gap: var(--j-spacing-2);
        margin-top: var(--j-spacing-3);
      }

      .j-notification-center__item {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        padding: var(--j-spacing-3);
      }

      .j-notification-center__item p,
      .j-notification-center__empty {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JNotificationCenterComponent {
  readonly toastService = inject(JrToastService);
  readonly visible = model(false);
  readonly target = input<HTMLElement | null>(null);
  readonly heading = input('Notifications');
  readonly clearLabel = input('Clear');
  readonly emptyMessage = input('No notifications.');
}

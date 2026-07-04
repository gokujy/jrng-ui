import { ChangeDetectionStrategy, Component, computed, input, booleanAttribute } from '@angular/core';

export type JStatTrend = 'up' | 'down' | 'neutral';

@Component({
  selector: 'j-stat-card',
  imports: [],
  template: `
    <article
      [class]="cardClasses()"
      data-jc-name="stat-card"
      data-jc-section="root"
      data-jc-extend="metric trend icon footer"
      [attr.data-j-loading]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <div class="j-stat-card__skeleton" aria-hidden="true"></div>
      } @else {
        <div class="j-stat-card__header">
          <div>
            <p class="j-stat-card__title">{{ title() }}</p>
            <strong class="j-stat-card__value">{{ value() }}</strong>
          </div>
          @if (icon()) {
            <span class="j-stat-card__icon" aria-hidden="true">{{ icon() }}</span>
          }
        </div>
        @if (trend()) {
          <span class="j-stat-card__trend" [class]="'j-stat-card__trend j-stat-card__trend--' + trend()">
            {{ trendLabel() }}
          </span>
        }
        @if (footer()) {
          <p class="j-stat-card__footer">{{ footer() }}</p>
        }
        <ng-content />
      }
    </article>
  `,
  styles: [
    `
      .j-stat-card {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-card-radius, var(--j-radius-lg));
        box-shadow: var(--j-shadow-sm);
        color: var(--j-color-card-foreground);
        display: grid;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }

      .j-stat-card__header {
        align-items: flex-start;
        display: flex;
        justify-content: space-between;
      }

      .j-stat-card__title,
      .j-stat-card__footer {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-stat-card__value {
        display: block;
        font-size: var(--j-font-size-2xl, 1.5rem);
        line-height: 1.2;
        margin-top: var(--j-spacing-1);
      }

      .j-stat-card__icon {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        display: inline-flex;
        height: 2.5rem;
        justify-content: center;
        width: 2.5rem;
      }

      .j-stat-card__trend {
        border-radius: var(--j-radius-full);
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        justify-self: start;
        padding: var(--j-spacing-1) var(--j-spacing-2);
      }

      .j-stat-card__trend--up {
        background: var(--j-color-success-soft, #dcfce7);
        color: var(--j-color-success);
      }

      .j-stat-card__trend--down {
        background: var(--j-color-danger-soft, #fee2e2);
        color: var(--j-color-danger);
      }

      .j-stat-card__trend--neutral {
        background: var(--j-color-muted);
        color: var(--j-color-muted-foreground);
      }

      .j-stat-card__skeleton {
        animation: j-stat-card-pulse 1.2s ease-in-out infinite;
        background: linear-gradient(90deg, var(--j-color-muted), var(--j-color-surface-subtle), var(--j-color-muted));
        border-radius: var(--j-radius-md);
        min-height: 6rem;
      }

      @keyframes j-stat-card-pulse {
        50% {
          opacity: 0.6;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStatCardComponent {
  readonly title = input('');
  readonly value = input<string | number>('');
  readonly trend = input<JStatTrend>('neutral');
  readonly trendLabel = input('');
  readonly icon = input('');
  readonly footer = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly cardClasses = computed(() => ['j-stat-card', this.styleClass()].filter(Boolean).join(' '));
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';
import { JStatTrend } from 'jrng-ui/stat-card';

@Component({
  selector: 'j-metric-card',
  imports: [],
  template: `
    <article
      [class]="cardClasses()"
      data-jc-name="metric-card"
      data-jc-section="root"
      data-jc-extend="metric trend icon footer"
      [attr.data-j-loading]="loading() ? 'true' : null"
    >
      @if (loading()) {
        <div class="j-metric-card__skeleton" aria-hidden="true"></div>
      } @else {
        <div class="j-metric-card__top">
          @if (icon()) {
            <span class="j-metric-card__icon" aria-hidden="true">{{ icon() }}</span>
          }
          <span class="j-metric-card__title">{{ title() }}</span>
        </div>
        <strong class="j-metric-card__value">{{ value() }}</strong>
        @if (trendLabel()) {
          <span
            class="j-metric-card__trend"
            [class]="'j-metric-card__trend j-metric-card__trend--' + trend()"
          >
            {{ trendLabel() }}
          </span>
        }
        @if (footer()) {
          <p class="j-metric-card__footer">{{ footer() }}</p>
        }
        <ng-content />
      }
    </article>
  `,
  styles: [
    `
      .j-metric-card {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--j-color-card) 92%, var(--j-color-primary) 8%),
          var(--j-color-card)
        );
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-card-radius, var(--j-radius-lg));
        box-shadow: var(--j-shadow-sm);
        color: var(--j-color-card-foreground);
        display: grid;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }

      .j-metric-card__top {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-metric-card__icon {
        align-items: center;
        background: var(--j-color-primary-soft, var(--j-color-muted));
        border-radius: var(--j-radius-md);
        color: var(--j-color-primary);
        display: inline-flex;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-metric-card__value {
        font-size: var(--j-font-size-3xl, 1.875rem);
        line-height: 1.15;
      }

      .j-metric-card__trend {
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-metric-card__trend--up {
        color: var(--j-color-success);
      }

      .j-metric-card__trend--down {
        color: var(--j-color-danger);
      }

      .j-metric-card__trend--neutral {
        color: var(--j-color-muted-foreground);
      }

      .j-metric-card__footer {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-metric-card__skeleton {
        animation: j-metric-card-pulse 1.2s ease-in-out infinite;
        background: linear-gradient(
          90deg,
          var(--j-color-muted),
          var(--j-color-surface-subtle),
          var(--j-color-muted)
        );
        border-radius: var(--j-radius-md);
        min-height: 6rem;
      }

      @keyframes j-metric-card-pulse {
        50% {
          opacity: 0.6;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * @deprecated Compose dashboard metrics with `j-card`, typography, badges, progress, and chart
 * components. This compatibility component remains available throughout the 0.0.x line.
 */
export class JMetricCardComponent {
  readonly title = input('');
  readonly value = input<string | number>('');
  readonly trend = input<JStatTrend>('neutral');
  readonly trendLabel = input('');
  readonly icon = input('');
  readonly footer = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly cardClasses = computed(() =>
    ['j-metric-card', this.styleClass()].filter(Boolean).join(' '),
  );
}

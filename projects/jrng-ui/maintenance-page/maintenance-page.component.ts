import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type JMaintenancePageVariant = 'default' | 'minimal' | 'status';
export type JMaintenancePageAnimation = 'none' | 'pulse' | 'orbit';

@Component({
  selector: 'j-maintenance-page',
  template: `
    <section
      [class]="classes()"
      [style.--j-maintenance-accent]="accentColor()"
      role="status"
      aria-live="polite"
      data-jc-name="maintenance-page"
      data-jc-section="root"
    >
      <div class="j-maintenance-page__visual" aria-hidden="true">
        <span class="j-maintenance-page__orbit"></span>
        <span class="j-maintenance-page__icon">{{ icon() }}</span>
      </div>
      <div class="j-maintenance-page__content">
        <span class="j-maintenance-page__badge">{{ badge() }}</span>
        <h1>{{ title() }}</h1>
        <p>{{ description() }}</p>
        @if (detail()) {
          <p class="j-maintenance-page__detail">{{ detail() }}</p>
        }
        @if (showProgress()) {
          <div
            class="j-maintenance-page__progress"
            role="progressbar"
            [attr.aria-label]="progressLabel()"
          >
            <span></span>
          </div>
          <small>{{ progressLabel() }}</small>
        }
        <div class="j-maintenance-page__actions"><ng-content /></div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .j-maintenance-page {
        align-items: center;
        background:
          radial-gradient(
            circle at 18% 25%,
            color-mix(
              in srgb,
              var(--j-maintenance-accent, var(--j-color-warning)) 14%,
              transparent
            ),
            transparent 34%
          ),
          var(--j-color-surface-subtle);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        box-sizing: border-box;
        display: grid;
        gap: clamp(var(--j-spacing-6), 7vw, var(--j-spacing-12));
        grid-template-columns: minmax(12rem, 0.7fr) minmax(18rem, 1fr);
        min-height: var(--j-maintenance-page-min-height, min(70vh, 40rem));
        overflow: hidden;
        padding: clamp(var(--j-spacing-6), 8vw, var(--j-spacing-12));
        width: 100%;
      }
      .j-maintenance-page__visual {
        align-items: center;
        aspect-ratio: 1;
        background: color-mix(
          in srgb,
          var(--j-maintenance-accent, var(--j-color-warning)) 10%,
          var(--j-color-card)
        );
        border: 1px solid
          color-mix(
            in srgb,
            var(--j-maintenance-accent, var(--j-color-warning)) 28%,
            var(--j-color-border)
          );
        border-radius: 50%;
        display: flex;
        justify-content: center;
        max-width: 18rem;
        position: relative;
        width: 100%;
      }
      .j-maintenance-page__icon {
        font-size: clamp(2.5rem, 8vw, 5rem);
        line-height: 1;
      }
      .j-maintenance-page__orbit {
        border: 2px dashed
          color-mix(in srgb, var(--j-maintenance-accent, var(--j-color-warning)) 55%, transparent);
        border-radius: 50%;
        inset: 10%;
        position: absolute;
      }
      .j-maintenance-page__content {
        align-items: start;
        display: flex;
        flex-direction: column;
      }
      .j-maintenance-page__badge {
        background: color-mix(
          in srgb,
          var(--j-maintenance-accent, var(--j-color-warning)) 14%,
          transparent
        );
        border: 1px solid
          color-mix(in srgb, var(--j-maintenance-accent, var(--j-color-warning)) 35%, transparent);
        border-radius: 999px;
        color: var(--j-maintenance-accent, var(--j-color-warning));
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: 0.06em;
        padding: var(--j-spacing-1) var(--j-spacing-3);
        text-transform: uppercase;
      }
      h1 {
        font-size: clamp(var(--j-font-size-2xl), 5vw, 3rem);
        line-height: 1.08;
        margin: var(--j-spacing-4) 0 var(--j-spacing-2);
      }
      p {
        color: var(--j-color-muted-foreground);
        margin: 0;
        max-width: 36rem;
      }
      .j-maintenance-page__detail {
        color: inherit;
        font-weight: var(--j-font-weight-semibold);
        margin-top: var(--j-spacing-3);
      }
      .j-maintenance-page__progress {
        background: var(--j-color-muted);
        border-radius: 999px;
        height: 0.4rem;
        margin-top: var(--j-spacing-5);
        overflow: hidden;
        width: min(100%, 24rem);
      }
      .j-maintenance-page__progress span {
        animation: j-maintenance-progress 1.8s ease-in-out infinite;
        background: var(--j-maintenance-accent, var(--j-color-warning));
        border-radius: inherit;
        display: block;
        height: 100%;
        transform-origin: left;
        width: 42%;
      }
      small {
        color: var(--j-color-muted-foreground);
        margin-top: var(--j-spacing-2);
      }
      .j-maintenance-page__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-3);
        margin-top: var(--j-spacing-6);
      }
      .j-maintenance-page--minimal {
        display: flex;
        min-height: 22rem;
        text-align: center;
      }
      .j-maintenance-page--minimal .j-maintenance-page__visual {
        max-width: 8rem;
      }
      .j-maintenance-page--minimal .j-maintenance-page__content {
        align-items: center;
      }
      .j-maintenance-page--minimal .j-maintenance-page__actions {
        justify-content: center;
      }
      .j-maintenance-page--status {
        background: var(--j-color-card);
        grid-template-columns: 8rem 1fr;
        min-height: 22rem;
      }
      .j-maintenance-page--status .j-maintenance-page__visual {
        max-width: 8rem;
      }
      .j-maintenance-page--pulse .j-maintenance-page__icon {
        animation: j-maintenance-pulse 1.8s ease-in-out infinite;
      }
      .j-maintenance-page--orbit .j-maintenance-page__orbit {
        animation: j-maintenance-orbit 8s linear infinite;
      }
      @keyframes j-maintenance-pulse {
        50% {
          opacity: 0.6;
          transform: scale(1.08);
        }
      }
      @keyframes j-maintenance-orbit {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes j-maintenance-progress {
        0% {
          transform: translateX(-110%);
        }
        50% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(240%);
        }
      }
      @media (max-width: 40rem) {
        .j-maintenance-page,
        .j-maintenance-page--status {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .j-maintenance-page__visual {
          justify-self: center;
          max-width: 10rem;
        }
        .j-maintenance-page__content {
          align-items: center;
        }
        .j-maintenance-page__actions {
          justify-content: center;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-maintenance-page__icon,
        .j-maintenance-page__orbit,
        .j-maintenance-page__progress span {
          animation: none !important;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMaintenancePageComponent {
  readonly badge = input('Scheduled maintenance');
  readonly icon = input('\u2699');
  readonly title = input('Maintenance in progress');
  readonly description = input('This page is temporarily unavailable.');
  readonly detail = input('');
  readonly variant = input<JMaintenancePageVariant>('default');
  readonly animation = input<JMaintenancePageAnimation>('none');
  readonly accentColor = input('var(--j-color-warning)');
  readonly showProgress = input(false);
  readonly progressLabel = input('Maintenance work is in progress');
  readonly styleClass = input('');

  readonly classes = computed(() =>
    [
      'j-maintenance-page',
      `j-maintenance-page--${this.variant()}`,
      `j-maintenance-page--${this.animation()}`,
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

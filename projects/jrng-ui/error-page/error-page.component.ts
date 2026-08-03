import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type JErrorPageAnimation = 'none' | 'bounce' | 'float' | 'pulse';
export type JErrorPageLayout = 'centered' | 'split' | 'minimal';

@Component({
  selector: 'j-error-page',
  template: `
    <section
      [class]="classes()"
      [style.--j-error-page-code-color]="codeColor()"
      role="alert"
      data-jc-name="error-page"
      data-jc-section="root"
    >
      <div class="j-error-page__visual" aria-hidden="true">
        <span class="j-error-page__glow"></span>
        <div class="j-error-page__code" data-jc-section="code" [style.color]="codeColor()">
          {{ code() }}
        </div>
      </div>
      <div class="j-error-page__content">
        <span class="j-error-page__eyebrow">{{ eyebrow() }}</span>
        <h1 class="j-error-page__title">{{ title() }}</h1>
        <p class="j-error-page__description">{{ description() }}</p>
        <div class="j-error-page__actions"><ng-content /></div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .j-error-page {
        align-items: center;
        background:
          radial-gradient(
            circle at 50% 25%,
            color-mix(
              in srgb,
              var(--j-error-page-code-color, var(--j-color-danger)) 12%,
              transparent
            ),
            transparent 38%
          ),
          var(--j-color-surface-subtle);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: var(--j-error-page-min-height, min(70vh, 40rem));
        padding: clamp(var(--j-spacing-6), 8vw, var(--j-spacing-12));
        text-align: center;
        width: 100%;
      }

      .j-error-page__code {
        color: var(--j-error-page-code-color, var(--j-color-danger));
        font-size: clamp(4.5rem, 16vw, 10rem);
        font-weight: var(--j-font-weight-bold);
        letter-spacing: -0.08em;
        line-height: 0.9;
        text-shadow: 0 0.08em 0 color-mix(in srgb, currentColor 18%, transparent);
        transform-origin: center bottom;
      }

      .j-error-page__visual {
        color: var(--j-error-page-code-color, var(--j-color-danger));
        position: relative;
      }
      .j-error-page__glow {
        background: currentColor;
        border-radius: 50%;
        filter: blur(3rem);
        inset: 20%;
        opacity: 0.08;
        position: absolute;
      }
      .j-error-page__content {
        align-items: center;
        display: flex;
        flex-direction: column;
      }
      .j-error-page__eyebrow {
        color: var(--j-error-page-code-color, var(--j-color-danger));
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .j-error-page__title {
        font-size: clamp(var(--j-font-size-xl), 4vw, var(--j-font-size-3xl, 2rem));
        margin: var(--j-spacing-6) 0 0;
      }

      .j-error-page__description {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-2) 0 0;
        max-width: 36rem;
      }

      .j-error-page__actions {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-3);
        justify-content: center;
        margin-top: var(--j-spacing-6);
      }

      .j-error-page--bounce .j-error-page__code {
        animation: j-error-page-bounce 1.6s ease-in-out infinite;
      }

      .j-error-page--float .j-error-page__code {
        animation: j-error-page-float 2.4s ease-in-out infinite;
      }

      .j-error-page--pulse .j-error-page__code {
        animation: j-error-page-pulse 1.8s ease-in-out infinite;
      }

      .j-error-page--split {
        display: grid;
        gap: clamp(var(--j-spacing-6), 8vw, var(--j-spacing-12));
        grid-template-columns: minmax(14rem, 0.8fr) minmax(18rem, 1fr);
        text-align: start;
      }
      .j-error-page--split .j-error-page__content {
        align-items: flex-start;
      }
      .j-error-page--split .j-error-page__actions {
        justify-content: flex-start;
      }
      .j-error-page--minimal {
        background: var(--j-color-card);
        min-height: 24rem;
      }
      .j-error-page--minimal .j-error-page__code {
        font-size: clamp(3.5rem, 10vw, 6rem);
      }

      @keyframes j-error-page-bounce {
        0%,
        100% {
          transform: translateY(0) scaleY(1);
        }
        45% {
          transform: translateY(-0.16em) scaleY(1.04);
        }
        60% {
          transform: translateY(0) scaleY(0.94);
        }
        72% {
          transform: translateY(-0.05em) scaleY(1.01);
        }
      }

      @keyframes j-error-page-float {
        50% {
          transform: translateY(-0.1em);
        }
      }

      @keyframes j-error-page-pulse {
        50% {
          opacity: 0.65;
          transform: scale(1.04);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-error-page__code {
          animation: none !important;
        }
      }
      @media (max-width: 42rem) {
        .j-error-page--split {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .j-error-page--split .j-error-page__content {
          align-items: center;
        }
        .j-error-page--split .j-error-page__actions {
          justify-content: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JErrorPageComponent {
  readonly code = input('Error');
  readonly title = input('Something went wrong');
  readonly description = input('The page could not be loaded.');
  readonly eyebrow = input('Unexpected error');
  readonly animation = input<JErrorPageAnimation>('none');
  readonly layout = input<JErrorPageLayout>('centered');
  readonly codeColor = input('var(--j-color-danger)');
  readonly styleClass = input('');

  readonly classes = computed(() =>
    [
      'j-error-page',
      `j-error-page--${this.animation()}`,
      `j-error-page--${this.layout()}`,
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

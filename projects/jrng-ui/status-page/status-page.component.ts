import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type JStatusPageVariant = 'empty' | 'error' | 'maintenance';

@Component({
  selector: 'j-status-page',
  template: `
    <section
      [class]="rootClasses()"
      [attr.data-jc-name]="componentName()"
      data-jc-section="root"
      role="status"
    >
      @switch (variant()) {
        @case ('error') {
          <span [class]="markerClasses('j-status-page__code')" data-jc-section="marker">{{
            marker()
          }}</span>
        }
        @case ('maintenance') {
          <span [class]="markerClasses('j-status-page__badge')" data-jc-section="marker">{{
            marker()
          }}</span>
        }
        @default {
          @if (marker()) {
            <span
              [class]="markerClasses('j-status-page__icon')"
              data-jc-section="marker"
              aria-hidden="true"
            >
              {{ marker() }}
            </span>
          }
        }
      }
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
      @if (detail()) {
        <small>{{ detail() }}</small>
      }
      <div [class]="actionClasses()" data-jc-section="actions">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .j-status-page {
        --j-status-page-accent: var(--j-color-primary);
        --j-status-page-glow: color-mix(in srgb, var(--j-status-page-accent) 14%, transparent);
        background:
          radial-gradient(circle at 50% 16%, var(--j-status-page-glow), transparent 32%),
          var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        display: grid;
        gap: var(--j-spacing-3);
        margin: 0 auto;
        max-width: 40rem;
        min-height: 28rem;
        padding: var(--j-spacing-8);
        place-content: center;
        text-align: center;
      }

      .j-status-page--error {
        --j-status-page-accent: var(--j-color-danger);
      }

      .j-status-page--maintenance {
        --j-status-page-accent: var(--j-color-warning);
      }

      .j-status-page h1,
      .j-status-page p,
      .j-status-page small {
        margin: 0;
      }

      .j-status-page p,
      .j-status-page small {
        color: var(--j-color-muted-foreground);
      }

      .j-status-page__icon {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-full);
        color: var(--j-status-page-accent);
        display: inline-flex;
        font-size: var(--j-font-size-lg);
        height: 4rem;
        justify-content: center;
        justify-self: center;
        width: 4rem;
      }

      .j-status-page__code {
        color: var(--j-status-page-accent);
        font-size: clamp(3.5rem, 11vw, 7rem);
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: -0.06em;
        line-height: 0.9;
      }

      .j-status-page__badge {
        background: var(--j-color-warning-soft, var(--j-color-muted));
        border-radius: var(--j-radius-full);
        color: var(--j-status-page-accent);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        justify-self: center;
        padding: var(--j-spacing-1) var(--j-spacing-3);
      }

      .j-status-page__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
        justify-content: center;
      }

      @media (max-width: 640px) {
        .j-status-page {
          min-height: 22rem;
          padding: var(--j-spacing-5);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStatusPageComponent {
  readonly variant = input<JStatusPageVariant>('empty');
  readonly marker = input('');
  readonly title = input('Nothing here yet');
  readonly description = input('There is no content to display.');
  readonly detail = input('');
  readonly styleClass = input('');
  readonly compatibilityClass = input('');
  readonly compatibilityMarkerClass = input('');
  readonly compatibilityActionClass = input('');
  readonly componentName = input('status-page');

  readonly rootClasses = computed(() =>
    [
      'j-status-page',
      `j-status-page--${this.variant()}`,
      this.compatibilityClass(),
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
  readonly actionClasses = computed(() =>
    ['j-status-page__actions', this.compatibilityActionClass()].filter(Boolean).join(' '),
  );

  markerClasses(baseClass: string): string {
    return [baseClass, this.compatibilityMarkerClass()].filter(Boolean).join(' ');
  }
}

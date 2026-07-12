import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-maintenance-page',
  imports: [],
  template: `
    <section
      class="j-maintenance-page"
      [class]="styleClass()"
      data-jc-name="maintenance-page"
      data-jc-section="root"
      role="status"
    >
      <span class="j-maintenance-page__badge">{{ badge() }}</span>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
      @if (detail()) {
        <small>{{ detail() }}</small>
      }
      <div class="j-maintenance-page__actions">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .j-maintenance-page {
        background:
          radial-gradient(
            circle at 50% 15%,
            color-mix(in srgb, var(--j-color-warning) 16%, transparent),
            transparent 32%
          ),
          var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        display: grid;
        gap: var(--j-spacing-3);
        margin: 0 auto;
        max-width: 42rem;
        min-height: 28rem;
        padding: var(--j-spacing-8);
        place-content: center;
        text-align: center;
      }

      .j-maintenance-page__badge {
        background: var(--j-color-warning-soft, var(--j-color-muted));
        border-radius: var(--j-radius-full);
        color: var(--j-color-warning);
        justify-self: center;
        padding: var(--j-spacing-1) var(--j-spacing-3);
        text-transform: uppercase;
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: 0.08em;
      }

      .j-maintenance-page h1 {
        margin: 0;
      }

      .j-maintenance-page p,
      .j-maintenance-page small {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-maintenance-page__actions {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMaintenancePageComponent {
  readonly badge = input('Maintenance');
  readonly title = input('Maintenance in progress');
  readonly description = input('This page is temporarily unavailable.');
  readonly detail = input('');
  readonly styleClass = input('');
}

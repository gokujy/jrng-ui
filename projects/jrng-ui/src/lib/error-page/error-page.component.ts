import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-error-page',
  imports: [],
  template: `
    <section
      class="j-error-page"
      [class]="styleClass()"
      data-jc-name="error-page"
      data-jc-section="root"
      role="status"
    >
      <span class="j-error-page__code">{{ code() }}</span>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
      <div class="j-error-page__actions">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .j-error-page {
        background:
          radial-gradient(
            circle at 50% 15%,
            color-mix(in srgb, var(--j-color-danger) 13%, transparent),
            transparent 30%
          ),
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

      .j-error-page__code {
        color: var(--j-color-danger);
        font-size: clamp(3.5rem, 11vw, 7rem);
        line-height: 0.9;
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: -0.06em;
      }

      .j-error-page h1 {
        margin: 0;
      }

      .j-error-page p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-error-page__actions {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JErrorPageComponent {
  readonly code = input('Error');
  readonly title = input('Something went wrong');
  readonly description = input('The page could not be loaded.');
  readonly styleClass = input('');
}

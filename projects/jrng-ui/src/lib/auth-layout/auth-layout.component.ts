import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type JAuthLayoutVariant = 'split' | 'centered';

@Component({
  selector: 'j-auth-layout',
  imports: [],
  template: `
    <section
      class="j-auth-layout"
      [class]="styleClass()"
      [class.j-auth-layout--centered]="variant() === 'centered'"
      data-jc-name="auth-layout"
      data-jc-section="root"
    >
      <aside class="j-auth-layout__aside" data-jc-section="aside">
        <ng-content select="[jAuthAside]" />
      </aside>
      <main class="j-auth-layout__main" data-jc-section="main">
        <div class="j-auth-layout__card">
          <ng-content />
        </div>
      </main>
    </section>
  `,
  styles: [
    `
      .j-auth-layout {
        background: var(--j-color-background);
        color: var(--j-color-foreground);
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(22rem, 34rem);
        min-height: 100dvh;
      }

      .j-auth-layout__aside {
        background: var(--j-color-muted);
        border-right: 1px solid var(--j-color-border);
        padding: var(--j-spacing-8, 4rem);
      }

      .j-auth-layout__main {
        align-items: center;
        display: grid;
        padding: var(--j-spacing-6, 2rem);
      }

      .j-auth-layout__card {
        margin: 0 auto;
        max-width: 28rem;
        width: 100%;
      }

      .j-auth-layout--centered {
        grid-template-columns: 1fr;
      }

      .j-auth-layout--centered .j-auth-layout__aside {
        display: none;
      }

      @media (max-width: 860px) {
        .j-auth-layout {
          grid-template-columns: 1fr;
        }

        .j-auth-layout__aside {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAuthLayoutComponent {
  readonly variant = input<JAuthLayoutVariant>('split');
  readonly styleClass = input('');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface JPageHeaderBreadcrumb {
  readonly label: string;
  readonly url?: string;
}

@Component({
  selector: 'j-page-header',
  imports: [],
  template: `
    <header class="j-page-header" [class]="styleClass()" data-jc-name="page-header" data-jc-section="root">
      @if (breadcrumbs().length) {
        <nav class="j-page-header__breadcrumbs" aria-label="Breadcrumb" data-jc-section="breadcrumbs">
          @for (item of breadcrumbs(); track item.label; let last = $last) {
            @if (item.url && !last) {
              <a [href]="item.url">{{ item.label }}</a>
            } @else {
              <span [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
            }
          }
        </nav>
      }
      <div class="j-page-header__main">
        <div>
          <h1>{{ title() }}</h1>
          @if (description()) {
            <p>{{ description() }}</p>
          }
        </div>
        <div class="j-page-header__actions" data-jc-section="actions">
          <ng-content select="[jPageActions]" />
        </div>
      </div>
      <div class="j-page-header__tabs" data-jc-section="tabs">
        <ng-content select="[jPageTabs]" />
      </div>
    </header>
  `,
  styles: [
    `
      .j-page-header {
        display: grid;
        gap: var(--j-spacing-4);
      }

      .j-page-header__breadcrumbs {
        color: var(--j-color-muted-foreground);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
        font-size: var(--j-font-size-sm);
      }

      .j-page-header__breadcrumbs a {
        color: inherit;
        text-decoration: none;
      }

      .j-page-header__breadcrumbs > * + *::before {
        content: '/';
        margin-right: var(--j-spacing-2);
      }

      .j-page-header__main {
        align-items: flex-start;
        display: flex;
        gap: var(--j-spacing-4);
        justify-content: space-between;
      }

      .j-page-header h1 {
        font-size: var(--j-font-size-3xl, 1.875rem);
        line-height: 1.2;
        margin: 0;
      }

      .j-page-header p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-page-header__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }

      .j-page-header__tabs:empty {
        display: none;
      }

      @media (max-width: 640px) {
        .j-page-header__main {
          display: grid;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPageHeaderComponent {
  readonly title = input('');
  readonly description = input('');
  readonly breadcrumbs = input<readonly JPageHeaderBreadcrumb[]>([]);
  readonly styleClass = input('');
}

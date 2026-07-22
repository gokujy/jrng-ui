import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';

export interface JPageHeaderBreadcrumb {
  readonly label: string;
  readonly url?: string;
}

export type JPageHeaderVariant = 'standard' | 'stacked' | 'centered' | 'hero';

@Component({
  selector: 'j-page-header',
  imports: [],
  template: `
    <header
      [class]="'j-page-header j-page-header--' + variant() + ' ' + styleClass()"
      [attr.data-j-variant]="variant()"
      [class.j-page-header--sticky]="sticky()"
      [attr.aria-busy]="loading() ? 'true' : null"
      data-jc-name="page-header"
      data-jc-section="root"
    >
      @if (breadcrumbs().length) {
        <nav
          class="j-page-header__breadcrumbs"
          aria-label="Breadcrumb"
          data-jc-section="breadcrumbs"
        >
          @for (item of breadcrumbs(); track item.label; let last = $last) {
            @if (item.url && !last) {
              <a [href]="item.url">{{ item.label }}</a>
            } @else {
              <span [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
            }
          }
        </nav>
      }
      <ng-content select="[jPageHeaderStart]" />
      <div class="j-page-header__main">
        <div [class.has-back]="showBack()">
          @if (showBack()) {
            <button
              class="j-page-header__back"
              type="button"
              [attr.aria-label]="backLabel()"
              (click)="back.emit()"
            >
              {{ backIcon() }}
            </button>
          }
          @if (loading()) {
            <span class="j-page-header__skeleton" aria-label="Loading page header"></span>
          } @else {
            <h1>{{ title() }}</h1>
          }
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
          }
          <div class="j-page-header__metadata"><ng-content select="[jPageMetadata]" /></div>
          <div class="j-page-header__status"><ng-content select="[jPageStatus]" /></div>
        </div>
        <ng-content select="[jPageHeaderCenter]" />
        <div class="j-page-header__actions" data-jc-section="actions">
          <ng-content select="[jPageSecondaryActions]" />
          <ng-content select="[jPageActions]" />
          <ng-content select="[jPagePrimaryAction]" />
          <ng-content select="[jPageRightActions]" />
          <ng-content select="[jPageActionMenu]" />
        </div>
      </div>
      <ng-content select="[jPageHeaderEnd]" />
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

      .j-page-header__main > div:first-child.has-back {
        align-items: flex-start;
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
        grid-template-columns: auto minmax(0, 1fr);
      }

      .j-page-header__main > div:first-child.has-back > p {
        grid-column: 2;
      }

      .j-page-header h1 {
        font-size: var(--j-font-size-3xl, 1.875rem);
        line-height: 1.2;
        margin: 0;
      }

      .j-page-header__back {
        align-items: center;
        background: var(--j-page-header-back-bg, transparent);
        border: 1px solid var(--j-page-header-back-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-page-header-back-color, var(--j-color-muted-foreground, #64748b));
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        height: 2.25rem;
        justify-content: center;
        margin-inline-end: var(--j-spacing-2, 0.5rem);
        width: 2.25rem;
      }

      .j-page-header p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-page-header__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
        justify-content: flex-end;
      }

      .j-page-header__tabs:empty {
        display: none;
      }

      .j-page-header--stacked .j-page-header__main {
        display: grid;
      }

      .j-page-header--stacked .j-page-header__actions {
        justify-content: flex-start;
      }

      .j-page-header--centered {
        justify-items: center;
        text-align: center;
      }

      .j-page-header--centered .j-page-header__main {
        align-items: center;
        flex-direction: column;
      }

      .j-page-header--centered .j-page-header__actions {
        justify-content: center;
      }

      .j-page-header--hero {
        background: var(--j-surface-elevated);
        border-radius: var(--j-radius-xl);
        padding: var(--j-spacing-8);
      }
      .j-page-header--hero h1 {
        font-size: var(--j-font-size-4xl, 2.25rem);
      }
      .j-page-header--sticky {
        background: var(--j-color-background);
        inset-block-start: 0;
        padding-block: var(--j-spacing-3);
        position: sticky;
        z-index: var(--j-z-sticky, 20);
      }
      .j-page-header__metadata,
      .j-page-header__status {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
      .j-page-header__metadata:empty,
      .j-page-header__status:empty {
        display: none;
      }
      .j-page-header__skeleton {
        animation: j-page-header-pulse 1.2s ease-in-out infinite;
        background: var(--j-surface-soft);
        border-radius: var(--j-radius-md);
        display: block;
        height: 2.25rem;
        width: min(20rem, 60vw);
      }
      @keyframes j-page-header-pulse {
        50% {
          opacity: var(--j-loading-opacity);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-page-header__skeleton {
          animation: none;
        }
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
  readonly subtitle = input('');
  readonly breadcrumbs = input<readonly JPageHeaderBreadcrumb[]>([]);
  readonly showBack = input(false, { transform: booleanAttribute });
  readonly backLabel = input('Go back');
  readonly backIcon = input('←');
  readonly styleClass = input('');
  readonly variant = input<JPageHeaderVariant>('standard');
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  readonly back = output<void>();
}

import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

export type JSectionHeaderVariant = 'default' | 'compact' | 'hero';

@Component({
  selector: 'j-section-header',
  imports: [],
  template: `
    <header
      [class]="'j-section-header j-section-header--' + variant() + ' ' + styleClass()"
      [class.j-section-header--sticky]="sticky()"
      [attr.aria-busy]="loading() ? 'true' : null"
      data-jc-name="section-header"
      data-jc-section="root"
    >
      <ng-content select="[jSectionStart]" />
      <div class="j-section-header__content">
        @if (loading()) {
          <span class="j-section-header__skeleton" aria-label="Loading section header"></span>
        } @else {
          <h2>{{ title() }}</h2>
        }
        @if (description()) {
          <p>{{ description() }}</p>
        }
        <div class="j-section-header__metadata"><ng-content select="[jSectionMetadata]" /></div>
      </div>
      <ng-content select="[jSectionCenter]" />
      <div class="j-section-header__actions" data-jc-section="actions">
        <ng-content />
        <ng-content select="[jSectionActionMenu]" />
      </div>
      <ng-content select="[jSectionEnd]" />
    </header>
  `,
  styles: [
    `
      .j-section-header {
        align-items: flex-start;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-section-header h2 {
        font-size: var(--j-font-size-xl, 1.25rem);
        margin: 0;
      }

      .j-section-header p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-section-header__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
      .j-section-header--compact h2 {
        font-size: var(--j-font-size-lg);
      }
      .j-section-header--hero {
        background: var(--j-surface-soft);
        border-radius: var(--j-radius-lg);
        padding: var(--j-spacing-6);
      }
      .j-section-header--sticky {
        background: var(--j-color-background);
        inset-block-start: 0;
        padding-block: var(--j-spacing-2);
        position: sticky;
        z-index: var(--j-z-sticky, 20);
      }
      .j-section-header__metadata {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
      .j-section-header__metadata:empty {
        display: none;
      }
      .j-section-header__skeleton {
        background: var(--j-surface-soft);
        border-radius: var(--j-radius-md);
        display: block;
        height: 1.5rem;
        width: 12rem;
      }
      @media (max-width: 640px) {
        .j-section-header {
          display: grid;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSectionHeaderComponent {
  readonly title = input('');
  readonly description = input('');
  readonly styleClass = input('');
  readonly variant = input<JSectionHeaderVariant>('default');
  readonly sticky = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
}

import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'j-icon-field',
  imports: [],
  template: `
    <div [class]="fieldClasses">
      @if (prefixIcon) {
        <span class="j-icon-field__icon" aria-hidden="true">{{ prefixIcon }}</span>
      }
      <span class="j-icon-field__icon" aria-hidden="true"
        ><ng-content select="[jIconFieldPrefix]"></ng-content
      ></span>
      <div class="j-icon-field__content"><ng-content></ng-content></div>
      <span class="j-icon-field__icon" aria-hidden="true"
        ><ng-content select="[jIconFieldSuffix]"></ng-content
      ></span>
      @if (suffixIcon) {
        <span class="j-icon-field__icon" aria-hidden="true">{{ suffixIcon }}</span>
      }
    </div>
  `,
  styles: [
    `
      .j-icon-field {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm);
      }

      .j-icon-field--fluid {
        width: 100%;
      }

      .j-icon-field__content {
        flex: 1;
        min-width: 0;
      }

      .j-icon-field__icon {
        color: var(--j-color-text-muted);
        display: inline-flex;
      }

      .j-icon-field__icon:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JIconFieldComponent {
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() styleClass = '';
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  get fieldClasses(): string {
    return [
      'j-icon-field',
      this.fluid || this.fullWidth ? 'j-icon-field--fluid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }
}

import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { jCreateId } from '../core/id';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

@Component({
  selector: 'j-form-field',
  imports: [],
  template: `
    <div [class]="fieldClasses">
      @if (label) {
        <label class="j-form-field__label" [for]="forId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-form-field__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <ng-content></ng-content>
      @if (invalid && error) {
        <p class="j-form-field__message j-form-field__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !(invalid && error)) {
        <p class="j-form-field__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      .j-form-field {
        color: var(--j-color-text);
        display: block;
      }

      .j-form-field--fluid {
        width: 100%;
      }

      .j-form-field__label {
        align-items: center;
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-form-field__required,
      .j-form-field__message--error {
        color: var(--j-color-danger);
      }

      .j-form-field__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFormFieldComponent {
  @Input() forId = '';
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  readonly hintId = jCreateId('j-form-field-hint');
  readonly errorId = jCreateId('j-form-field-error');

  get fieldClasses(): string {
    return [
      'j-form-field',
      `j-form-field--${this.size}`,
      `j-form-field--${this.variant}`,
      this.invalid ? 'is-invalid' : '',
      this.fluid || this.fullWidth ? 'j-form-field--fluid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }
}

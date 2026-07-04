import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { jCreateId } from '../core/id';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

@Component({
  selector: 'j-form-field',
  imports: [],
  template: `
    <div
      [class]="fieldClasses()"
      data-jc-name="form-field"
      data-jc-section="root"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
    >
      @if (label()) {
        <label class="j-form-field__label" data-jc-section="label" [for]="forId()">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-form-field__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <ng-content></ng-content>
      @if (invalid() && error()) {
        <p class="j-form-field__message j-form-field__message--error" [id]="errorId">
          {{ error() }}
        </p>
      }
      @if (hint() && !(invalid() && error())) {
        <p class="j-form-field__message" [id]="hintId">{{ hint() }}</p>
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
  readonly forId = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly size = input<JSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly pt = input<JPassThrough | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly hintId = jCreateId('j-form-field-hint');
  readonly errorId = jCreateId('j-form-field-error');

  readonly fieldClasses = computed(() =>
    jMergePartClasses(
      [
        'j-form-field',
        `j-form-field--${this.size()}`,
        `j-form-field--${this.variant()}`,
        this.invalid() ? 'is-invalid' : '',
        this.disabled() ? 'is-disabled' : '',
        this.fluid() || this.fullWidth() ? 'j-form-field--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}

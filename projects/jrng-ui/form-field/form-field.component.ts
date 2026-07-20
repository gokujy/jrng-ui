import { DOCUMENT } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  JComponentSize,
  JDensity,
  JOrientation,
  JPassThrough,
  jCreateId,
  jIsBrowserDocument,
  jMergePartClasses,
} from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';
import {
  JValidationDisplayMode,
  JValidationMessageComponent,
  JValidationMessageMap,
} from 'jrng-ui/validation-message';

export type JFormFieldLabelPosition = 'top' | 'start';

@Component({
  selector: 'j-form-field',
  imports: [JValidationMessageComponent],
  template: `
    <div
      [class]="fieldClasses()"
      data-jc-name="form-field"
      data-jc-section="root"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-invalid]="isInvalid() ? 'true' : null"
      [attr.data-j-readonly]="readonly() ? 'true' : null"
    >
      @if (label()) {
        <label
          class="j-form-field__label"
          data-jc-section="label"
          [id]="labelId"
          [for]="controlId()"
        >
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-form-field__required" aria-hidden="true">*</span
            ><span class="j-sr-only"> required</span>
          } @else if (optional()) {
            <span class="j-form-field__optional">{{ optionalLabel() }}</span>
          }
        </label>
      }
      <div class="j-form-field__body">
        <div class="j-form-field__control-wrap">
          <span class="j-form-field__prefix"
            ><ng-content select="[jFormFieldPrefix], [prefix]"
          /></span>
          <div class="j-form-field__control"><ng-content /></div>
          <span class="j-form-field__suffix"
            ><ng-content select="[jFormFieldSuffix], [suffix]"
          /></span>
        </div>
        @if (isInvalid() && (error() || resolvedErrors())) {
          <j-validation-message
            [id]="errorId"
            [control]="control()"
            [errors]="resolvedErrors()"
            [message]="error()"
            [messages]="validationMessages()"
            [displayMode]="resolvedDisplayMode()"
            [submitted]="submitted()"
            [multiple]="true"
            [density]="density()"
          />
        } @else if (warning()) {
          <j-validation-message
            [id]="warningId"
            [message]="warning()"
            severity="warning"
            [density]="density()"
          />
        } @else if (success()) {
          <j-validation-message
            [id]="successId"
            [message]="success()"
            severity="success"
            [density]="density()"
          />
        }
        <div class="j-form-field__meta">
          @if (hint() && !isInvalid()) {
            <p class="j-form-field__message" [id]="hintId">{{ hint() }}</p>
          }
          @if (showCharacterCount()) {
            <span class="j-form-field__count" [id]="countId" aria-live="polite"
              >{{ resolvedCurrentLength() }}
              @if (maxLength() !== null) {
                / {{ maxLength() }}
              }
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .j-form-field {
        color: var(--j-color-text);
        display: grid;
        gap: var(--j-density-gap, var(--j-spacing-2));
      }
      .j-form-field--fluid {
        width: 100%;
      }
      .j-form-field--orientation-horizontal {
        align-items: start;
        grid-template-columns: minmax(8rem, var(--j-form-field-label-width, 12rem)) minmax(0, 1fr);
      }
      .j-form-field__label {
        align-items: center;
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
      }
      .j-form-field__required,
      .j-form-field.is-invalid {
        --j-validation-color: var(--j-color-danger);
      }
      .j-form-field__optional,
      .j-form-field__message,
      .j-form-field__count {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-normal);
      }
      .j-form-field__body {
        min-width: 0;
      }
      .j-form-field__control-wrap {
        align-items: center;
        display: flex;
        gap: var(--j-density-gap, var(--j-spacing-2));
        min-width: 0;
      }
      .j-form-field__control {
        flex: 1 1 auto;
        min-width: 0;
      }
      .j-form-field__prefix:empty,
      .j-form-field__suffix:empty {
        display: none;
      }
      .j-form-field__meta {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: space-between;
      }
      .j-form-field__message,
      .j-form-field__count {
        margin: var(--j-density-gap, var(--j-spacing-1)) 0 0;
      }
      .j-form-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
      .j-form-field.is-readonly .j-form-field__control-wrap {
        background: var(--j-surface-minimal);
      }
      @media (max-width: 40rem) {
        .j-form-field--orientation-horizontal.j-form-field--responsive-stack {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFormFieldComponent implements AfterContentInit, DoCheck {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private generatedControlId = jCreateId('j-form-field-control');

  readonly forId = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input<string | readonly string[]>('');
  readonly warning = input<string | readonly string[]>('');
  readonly success = input<string | readonly string[]>('');
  readonly styleClass = input('');
  readonly size = input<JComponentSize | JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly pt = input<JPassThrough | null>(null);
  readonly density = input<JDensity>('comfortable');
  readonly orientation = input<JOrientation>('vertical');
  readonly labelPosition = input<JFormFieldLabelPosition>('top');
  readonly control = input<AbstractControl | null>(null);
  readonly errors = input<ValidationErrors | null>(null);
  readonly validationMessages = input<JValidationMessageMap>({});
  readonly displayMode = input<JValidationDisplayMode>('touched');
  readonly currentLength = input<number | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly optionalLabel = input('Optional');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly showCharacterCount = input(false, { transform: booleanAttribute });
  readonly submitted = input(false, { transform: booleanAttribute });
  readonly responsiveStack = input(true, { transform: booleanAttribute });

  readonly labelId = jCreateId('j-form-field-label');
  readonly hintId = jCreateId('j-form-field-hint');
  readonly errorId = jCreateId('j-form-field-error');
  readonly warningId = jCreateId('j-form-field-warning');
  readonly successId = jCreateId('j-form-field-success');
  readonly countId = jCreateId('j-form-field-count');
  readonly controlId = computed(() => this.forId() || this.generatedControlId);
  readonly resolvedErrors = computed(() => this.errors() ?? this.control()?.errors ?? null);
  readonly isInvalid = computed(() => this.invalid() || !!this.resolvedErrors());
  readonly resolvedDisplayMode = computed<JValidationDisplayMode>(() =>
    this.invalid() && !!this.error() ? 'always' : this.displayMode(),
  );
  readonly resolvedCurrentLength = computed(() => this.currentLength() ?? this.readControlLength());
  readonly fieldClasses = computed(() =>
    jMergePartClasses(
      [
        'j-form-field',
        `j-form-field--${this.size()}`,
        `j-form-field--${this.variant()}`,
        `j-form-field--density-${this.density()}`,
        `j-form-field--orientation-${this.orientation() === 'horizontal' || this.labelPosition() === 'start' ? 'horizontal' : 'vertical'}`,
        this.isInvalid() ? 'is-invalid' : '',
        this.disabled() ? 'is-disabled' : '',
        this.readonly() ? 'is-readonly' : '',
        this.fluid() || this.fullWidth() ? 'j-form-field--fluid' : '',
        this.responsiveStack() ? 'j-form-field--responsive-stack' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  ngAfterContentInit(): void {
    this.syncControlRelationships();
  }
  ngDoCheck(): void {
    this.syncControlRelationships();
  }

  private readControlLength(): number {
    const value = this.control()?.value as unknown;
    return typeof value === 'string' || Array.isArray(value) ? value.length : 0;
  }

  private syncControlRelationships(): void {
    if (!jIsBrowserDocument(this.document)) return;
    const control = this.host.nativeElement.querySelector<HTMLElement>(
      'input, textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"], [role="spinbutton"]',
    );
    if (!control) return;
    if (!control.id) control.id = this.controlId();
    else if (!this.forId()) this.generatedControlId = control.id;
    const labelledBy = mergeIds(
      control.getAttribute('aria-labelledby'),
      this.label() ? [this.labelId] : [],
      [this.labelId],
    );
    if (labelledBy) control.setAttribute('aria-labelledby', labelledBy);
    else control.removeAttribute('aria-labelledby');
    const descriptions = [
      this.hint() && !this.isInvalid() ? this.hintId : '',
      this.isInvalid() ? this.errorId : '',
      this.warning() ? this.warningId : '',
      this.success() ? this.successId : '',
      this.showCharacterCount() ? this.countId : '',
    ].filter(Boolean);
    if (descriptions.length)
      control.setAttribute(
        'aria-describedby',
        mergeIds(control.getAttribute('aria-describedby'), descriptions, [
          this.hintId,
          this.errorId,
          this.warningId,
          this.successId,
          this.countId,
        ]),
      );
    else control.removeAttribute('aria-describedby');
    if (this.isInvalid()) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    if (this.required()) control.setAttribute('aria-required', 'true');
    else control.removeAttribute('aria-required');
  }
}

function mergeIds(
  current: string | null,
  additions: readonly string[],
  owned: readonly string[] = [],
): string {
  const ownedIds = new Set(owned);
  return [
    ...new Set(
      [...(current?.split(/\s+/).filter((id) => !ownedIds.has(id)) ?? []), ...additions].filter(
        Boolean,
      ),
    ),
  ].join(' ');
}

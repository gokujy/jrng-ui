import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JRNG_LOCALE } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JComponentSize, JComponentWidth } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';
import { JButtonComponent } from 'jrng-ui/button';

export type JPasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';
export interface JPasswordRule {
  readonly id: string;
  readonly label: string;
  readonly test: (value: string) => boolean;
}
export interface JPasswordRuleResult {
  readonly id: string;
  readonly label: string;
  readonly passed: boolean;
}

export function jEvaluatePassword(
  value: string,
  rules: readonly JPasswordRule[],
): JPasswordRuleResult[] {
  return rules.map((rule) => ({ id: rule.id, label: rule.label, passed: rule.test(value) }));
}

@Component({
  selector: 'j-password',
  imports: [JButtonComponent, NgTemplateOutlet],
  template: `
    @if (label()) {
      <label class="j-password__label" data-jc-name="password" data-jc-section="label" [for]="id()">
        <span>{{ label() }}</span>
        @if (required()) {
          <span class="j-password__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div
      [class]="controlClasses"
      data-jc-name="password"
      data-jc-section="root"
      data-jc-extend="toggle clear meter"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-active]="value ? 'true' : null"
    >
      <input
        class="j-password__field"
        data-jc-section="input"
        [id]="id()"
        [name]="name() || null"
        [type]="visible ? 'text' : 'password'"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [value]="value"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      @if (clearable() && value) {
        <j-button
          class="j-password__clear"
          data-jc-section="clear"
          variant="text"
          severity="neutral"
          actionDisplay="icon"
          icon="close"
          [ariaLabel]="locale.clear"
          [disabled]="isDisabled() || readonly()"
          (onClick)="clearValue()"
        />
      }
      @if (toggleVisibility()) {
        <j-button
          class="j-password__toggle"
          data-jc-section="toggle"
          variant="text"
          severity="neutral"
          actionDisplay="icon"
          [icon]="activeIconTemplate ? '' : visible ? hideIcon() : showIcon()"
          [ariaLabel]="visible ? locale.hidePassword : locale.showPassword"
          [disabled]="isDisabled()"
          (onClick)="togglePassword()"
        >
          @if (activeIconTemplate; as iconTemplate) {
            <span jButtonPrefix><ng-container [ngTemplateOutlet]="iconTemplate" /></span>
          }
        </j-button>
      }
    </div>
    @if (feedback() && value) {
      <div class="j-password__meter" data-jc-section="meter" aria-hidden="true">
        <span [style.width.%]="strength"></span>
      </div>
      <p class="j-password__message" data-jc-section="feedback" aria-live="polite">
        {{ strengthLabel }}
      </p>
      @if (showRules()) {
        <ul class="j-password__rules" aria-label="Password guidance">
          @for (rule of ruleResults; track rule.id) {
            <li [class.is-passed]="rule.passed">
              <span aria-hidden="true">{{ rule.passed ? '✓' : '○' }}</span> {{ rule.label }}
            </li>
          }
        </ul>
      }
    }
    @if (hasError && error()) {
      <p class="j-password__message j-password__message--error" [id]="errorId">{{ error() }}</p>
    }
    @if (hint() && !hasError) {
      <p class="j-password__message" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-password__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-password__required,
      .j-password__message--error {
        color: var(--j-color-danger);
      }

      .j-password {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-md);
      }

      .j-password--filled {
        background: var(--j-color-surface-muted);
      }

      .j-password--fluid {
        width: 100%;
      }

      .j-password:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-password.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-password.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-password__field {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
      }

      .j-password__toggle,
      .j-password__clear {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
        font-size: var(--j-font-size-sm);
        padding: 0;
      }

      .j-password__meter {
        background: var(--j-color-surface-subtle);
        border-radius: var(--j-radius-full);
        height: 0.25rem;
        margin-top: var(--j-spacing-sm);
        overflow: hidden;
      }

      .j-password__meter span {
        background: var(--j-color-primary);
        display: block;
        height: 100%;
      }

      .j-password__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
      .j-password__rules {
        display: grid;
        gap: var(--j-spacing-1);
        font-size: var(--j-font-size-xs);
        list-style: none;
        margin: var(--j-spacing-2) 0 0;
        padding: 0;
      }
      .j-password__rules .is-passed {
        color: var(--j-color-success);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JPasswordComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPasswordComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly locale = inject(JRNG_LOCALE);

  readonly id = input(jCreateId('j-password'));
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly ariaDescribedby = input('', { alias: 'aria-describedby' });
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly toggleVisibility = input(true, { transform: booleanAttribute });
  readonly showIcon = input('eye');
  readonly hideIcon = input('eye-off');
  readonly feedback = input(false, { transform: booleanAttribute });
  readonly showRules = input(false, { transform: booleanAttribute });
  readonly minimumLength = input(8);
  readonly requireUppercase = input(true, { transform: booleanAttribute });
  readonly requireLowercase = input(true, { transform: booleanAttribute });
  readonly requireNumber = input(true, { transform: booleanAttribute });
  readonly requireSpecial = input(true, { transform: booleanAttribute });
  readonly customRules = input<readonly JPasswordRule[]>([]);
  readonly strengthLabels = input<Partial<Record<JPasswordStrength, string>>>({});
  readonly width = input<JComponentWidth>('auto');
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly showIconTemplate = contentChild<TemplateRef<void>>('showIcon');
  readonly hideIconTemplate = contentChild<TemplateRef<void>>('hideIcon');

  readonly valueChange = output<string>();
  readonly clear = output<void>();

  readonly hintId = jCreateId('j-password-hint');
  readonly errorId = jCreateId('j-password-error');
  value = '';
  visible = false;
  readonly isDisabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(
      this.ariaDescribedby(),
      this.hasError ? this.errorId : null,
      this.hint() ? this.hintId : null,
    );
  }

  get controlClasses(): string {
    return jMergePartClasses(
      [
        'j-password',
        `j-password--${this.size()}`,
        `j-password--${this.variant()}`,
        this.hasError ? 'is-invalid' : '',
        this.isDisabled() ? 'is-disabled' : '',
        this.width() === 'full' ? 'j-password--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    );
  }

  get strength(): number {
    const results = this.ruleResults;
    if (!results.length) return 0;
    return Math.round((results.filter((rule) => rule.passed).length / results.length) * 100);
  }

  get activeIconTemplate(): TemplateRef<void> | undefined {
    return this.visible ? this.hideIconTemplate() : this.showIconTemplate();
  }

  togglePassword(): void {
    if (!this.isDisabled()) {
      this.visible = !this.visible;
      this.changeDetectorRef.markForCheck();
    }
  }

  get ruleResults(): JPasswordRuleResult[] {
    const rules: JPasswordRule[] = [
      {
        id: 'length',
        label: `At least ${this.minimumLength()} characters`,
        test: (v) => v.length >= this.minimumLength(),
      },
    ];
    if (this.requireUppercase())
      rules.push({ id: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) });
    if (this.requireLowercase())
      rules.push({ id: 'lowercase', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) });
    if (this.requireNumber())
      rules.push({ id: 'number', label: 'One number', test: (v) => /\d/.test(v) });
    if (this.requireSpecial())
      rules.push({
        id: 'special',
        label: 'One special character',
        test: (v) => /[^A-Za-z0-9]/.test(v),
      });
    return jEvaluatePassword(this.value, [...rules, ...this.customRules()]);
  }

  get strengthLevel(): JPasswordStrength {
    if (this.strength >= 100) return 'very-strong';
    if (this.strength >= 75) return 'strong';
    if (this.strength >= 45) return 'medium';
    return 'weak';
  }

  get strengthLabel(): string {
    const custom = this.strengthLabels()[this.strengthLevel];
    if (custom) return custom;
    if (this.strengthLevel === 'very-strong') return 'Very strong';
    if (this.strengthLevel === 'strong') {
      return this.locale.passwordStrong;
    }

    if (this.strength >= 50) {
      return this.locale.passwordMedium;
    }

    return this.locale.passwordWeak;
  }

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }

  clearValue(): void {
    if (this.isDisabled() || this.readonly() || !this.value) {
      return;
    }

    this.value = '';
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }
}

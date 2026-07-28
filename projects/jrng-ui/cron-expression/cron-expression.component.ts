import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JCopyButtonComponent } from 'jrng-ui/copy-button';
import { jCreateId } from 'jrng-ui/core';
import {
  JCronFieldName,
  JCronIssue,
  JCronParts,
  J_CRON_FIELDS,
  J_CRON_SHORTCUTS,
  jDescribeCronExpression,
  jFormatCronExpression,
  jNextCronRuns,
  jParseCronExpression,
} from './cron-expression';

@Component({
  selector: 'j-cron-expression',
  imports: [JButtonComponent, JCopyButtonComponent],
  template: `
    <section
      class="j-cron-expression"
      [class.j-cron-expression--invalid]="!parsed().valid"
      [class.j-cron-expression--disabled]="isDisabled()"
      [class.j-cron-expression--readonly]="readonly()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="!parsed().valid ? errorId : previewId"
      [attr.aria-disabled]="isDisabled()"
      [attr.aria-readonly]="readonly()"
      [attr.dir]="dir()"
      data-jc-name="cron-expression"
    >
      <header class="j-cron-expression__header">
        <div>
          <strong>{{ label() }}</strong>
          <p>{{ description() }}</p>
        </div>
        <j-copy-button
          [text]="raw()"
          label="Copy expression"
          ariaLabel="Copy cron expression"
          [disabled]="isDisabled() || !parsed().valid"
        />
      </header>

      <label class="j-cron-expression__raw">
        <span>Raw Linux cron expression</span>
        <input
          type="text"
          inputmode="text"
          autocomplete="off"
          dir="ltr"
          [value]="raw()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [attr.aria-invalid]="!parsed().valid"
          [attr.aria-describedby]="!parsed().valid ? errorId : grammarId"
          (input)="changeRaw($event)"
          (blur)="markTouched()"
        />
        <small [id]="grammarId"
          >Five fields in standard token order: minute hour day-of-month month day-of-week.</small
        >
      </label>

      <fieldset class="j-cron-expression__structured" [disabled]="!canMutate()">
        <legend>Structured fields</legend>
        <div class="j-cron-expression__fields" dir="ltr">
          @for (field of fieldDefinitions; track field.name) {
            <label>
              <span>{{ field.label }}</span>
              <input
                type="text"
                [attr.aria-label]="field.label + ' cron field'"
                [value]="part(field.name)"
                [attr.aria-describedby]="fieldIssue(field.name) ? errorId + '-' + field.name : null"
                (input)="changePart(field.name, $event)"
                (blur)="markTouched()"
              />
              <small>{{ field.minimum }}–{{ field.maximum }}, *, range, list, or step</small>
              @if (fieldIssue(field.name); as issue) {
                <span class="j-cron-expression__field-error" [id]="errorId + '-' + field.name">{{
                  issue.message
                }}</span>
              }
            </label>
          }
        </div>
      </fieldset>

      <div class="j-cron-expression__shortcuts" role="group" aria-label="Common cron shortcuts">
        <span>Common schedules</span>
        @for (shortcut of shortcuts; track shortcut.key) {
          <j-button
            [label]="shortcut.label"
            variant="outlined"
            [disabled]="!canMutate()"
            (onClick)="applyShortcut(shortcut.key)"
          />
        }
      </div>

      @if (!parsed().valid) {
        <div class="j-cron-expression__errors" [id]="errorId" role="alert">
          <strong>Invalid expression</strong>
          <ul>
            @for (issue of parsed().issues; track issue.field + issue.token + issue.message) {
              <li>{{ issue.message }}</li>
            }
          </ul>
        </div>
      } @else {
        <div class="j-cron-expression__preview" [id]="previewId" aria-live="polite">
          <strong>{{ humanDescription() }}</strong>
          @if (nextRuns().length) {
            <span>Next runs</span>
            <ol>
              @for (run of nextRuns(); track run.getTime()) {
                <li>{{ formatPreviewDate(run) }}</li>
              }
            </ol>
          } @else {
            <span>No run was found inside the bounded preview window.</span>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-cron-expression {
        background: var(--j-cron-bg, var(--j-color-card));
        border: 1px solid var(--j-cron-border, var(--j-color-border));
        border-radius: var(--j-cron-radius, var(--j-radius-lg, 0.75rem));
        color: var(--j-cron-color, var(--j-color-card-foreground));
        display: grid;
        gap: var(--j-spacing-4, 1rem);
        padding: var(--j-spacing-4, 1rem);
      }

      .j-cron-expression__header,
      .j-cron-expression__shortcuts {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2, 0.5rem);
        justify-content: space-between;
      }

      .j-cron-expression__header p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1, 0.25rem) 0 0;
      }

      .j-cron-expression__raw,
      .j-cron-expression__fields label {
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
      }

      .j-cron-expression input {
        background: var(--j-cron-control-bg, var(--j-color-card));
        border: 1px solid var(--j-cron-control-border, var(--j-color-border));
        border-radius: var(--j-radius-md, 0.5rem);
        color: inherit;
        font: var(--j-cron-font, 500 0.95rem/1.4 ui-monospace, monospace);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-3, 0.75rem);
        width: 100%;
      }

      .j-cron-expression input:focus-visible {
        box-shadow: var(--j-cron-focus, var(--j-focus-ring));
        outline: none;
      }

      .j-cron-expression small {
        color: var(--j-color-muted-foreground);
      }

      .j-cron-expression__structured {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md, 0.5rem);
        margin: 0;
        min-width: 0;
        padding: var(--j-spacing-3, 0.75rem);
      }

      .j-cron-expression__fields {
        display: grid;
        gap: var(--j-spacing-2, 0.5rem);
        grid-template-columns: repeat(5, minmax(7rem, 1fr));
      }

      .j-cron-expression__field-error,
      .j-cron-expression__errors {
        color: var(--j-cron-error, var(--j-color-danger));
      }

      .j-cron-expression__field-error {
        font-size: var(--j-font-size-xs, 0.75rem);
      }

      .j-cron-expression__errors,
      .j-cron-expression__preview {
        background: var(--j-cron-preview-bg, var(--j-color-muted));
        border-radius: var(--j-radius-md, 0.5rem);
        display: grid;
        gap: var(--j-spacing-2, 0.5rem);
        padding: var(--j-spacing-3, 0.75rem);
      }

      .j-cron-expression__errors ul,
      .j-cron-expression__preview ol {
        margin: 0;
        padding-inline-start: var(--j-spacing-5, 1.25rem);
      }

      .j-cron-expression--invalid {
        border-color: var(--j-cron-error, var(--j-color-danger));
      }

      .j-cron-expression--disabled {
        opacity: var(--j-disabled-opacity, 0.6);
      }

      @media (max-width: 820px) {
        .j-cron-expression__fields {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 480px) {
        .j-cron-expression__fields {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JCronExpressionComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => JCronExpressionComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCronExpressionComponent implements ControlValueAccessor, Validator {
  readonly value = input<string>();
  readonly label = input('Cron expression');
  readonly description = input('Create a Linux five-field cron schedule.');
  readonly ariaLabel = input('Cron expression editor');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly dir = input<'ltr' | 'rtl'>('ltr');
  readonly previewCount = input(3);
  readonly previewFrom = input<Date | null>(null);
  readonly maximumPreviewIterations = input(527_040);

  readonly valueChange = output<string>();
  readonly validationChange = output<readonly JCronIssue[]>();

  readonly fieldDefinitions = J_CRON_FIELDS;
  readonly shortcuts = Object.keys(J_CRON_SHORTCUTS).map((key) => ({
    key,
    label: key.slice(1).replace(/^\w/, (letter) => letter.toUpperCase()),
  }));
  readonly errorId = jCreateId('j-cron-error');
  readonly previewId = jCreateId('j-cron-preview');
  readonly grammarId = jCreateId('j-cron-grammar');

  readonly raw = signal('0 * * * *');
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  private lastValidValue = '0 * * * *';
  private lastIssueKey = '';

  readonly parsed = computed(() => jParseCronExpression(this.raw()));
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly humanDescription = computed(() => jDescribeCronExpression(this.raw()));
  readonly nextRuns = computed(() =>
    this.parsed().valid && this.previewFrom()
      ? jNextCronRuns(
          this.parsed().expression,
          this.previewFrom()!,
          Math.max(0, this.previewCount()),
          Math.max(0, this.maximumPreviewIterations()),
        )
      : [],
  );

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined) this.acceptExternal(value);
    });
    effect(() => {
      const issues = this.parsed().issues;
      const key = issues.map((issue) => `${issue.field}:${issue.token}:${issue.message}`).join('|');
      if (key === this.lastIssueKey) return;
      this.lastIssueKey = key;
      this.validationChange.emit(issues);
      this.onValidatorChange();
    });
  }

  canMutate(): boolean {
    return !this.isDisabled() && !this.readonly();
  }

  changeRaw(event: Event): void {
    if (!this.canMutate()) return;
    this.raw.set((event.target as HTMLInputElement).value);
    this.publishIfValid();
  }

  changePart(field: JCronFieldName, event: Event): void {
    if (!this.canMutate()) return;
    const current = this.parsed().parts ?? defaultParts();
    this.raw.set(
      jFormatCronExpression({ ...current, [field]: (event.target as HTMLInputElement).value }),
    );
    this.publishIfValid();
  }

  applyShortcut(shortcut: string): void {
    if (!this.canMutate()) return;
    const expression = J_CRON_SHORTCUTS[shortcut];
    if (!expression) return;
    this.raw.set(expression);
    this.publishIfValid();
  }

  part(field: JCronFieldName): string {
    return this.parsed().parts?.[field] ?? '';
  }

  fieldIssue(field: JCronFieldName): JCronIssue | undefined {
    return this.parsed().issues.find((issue) => issue.field === field);
  }

  formatPreviewDate(value: Date): string {
    return value.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }

  markTouched(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.acceptExternal(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const result = jParseCronExpression(String(control.value ?? ''));
    return result.valid ? null : { cronExpression: result.issues };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private acceptExternal(value: string): void {
    this.raw.set(String(value ?? ''));
    const parsed = jParseCronExpression(String(value ?? ''));
    if (parsed.valid) this.lastValidValue = parsed.expression;
  }

  private publishIfValid(): void {
    const parsed = this.parsed();
    this.onTouched();
    if (!parsed.valid || parsed.expression === this.lastValidValue) return;
    this.lastValidValue = parsed.expression;
    this.valueChange.emit(parsed.expression);
    this.onChange(parsed.expression);
  }
}

function defaultParts(): JCronParts {
  return { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
}

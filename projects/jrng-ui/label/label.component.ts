import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { JPassThrough, jCreateId, jMergePartClasses } from 'jrng-ui/core';

export type JLabelVariant = 'standard' | 'floating' | 'inline' | 'stacked' | 'in-field';
export type JLabelState = 'default' | 'error' | 'success' | 'warning';
export type JLabelDensity = 'compact' | 'normal';

/** Unified accessible label shell for every JRNG form-control composition. */
@Component({
  selector: 'j-label',
  imports: [],
  template: `
    <div
      [class]="classes()"
      data-jc-name="label"
      data-jc-section="root"
      [attr.data-j-variant]="variant()"
      [attr.data-j-state]="state()"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [attr.data-j-readonly]="readonly() ? 'true' : null"
    >
      <label class="j-label__label" data-jc-section="label" [for]="resolvedControlId()">
        @if (icon()) {
          <span class="j-label__icon" aria-hidden="true">{{ icon() }}</span>
        }
        <span>{{ label() }}</span>
        @if (required()) {
          <span class="j-label__required" aria-hidden="true">*</span>
        }
        @if (optional()) {
          <span class="j-label__optional">{{ optionalText() }}</span>
        }
      </label>
      @if (description()) {
        <span class="j-label__description">{{ description() }}</span>
      }
      <div class="j-label__control" data-jc-section="control"><ng-content /></div>
      @if (message()) {
        <span
          class="j-label__message"
          [id]="messageId()"
          [attr.role]="state() === 'error' ? 'alert' : null"
        >
          {{ message() }}
        </span>
      }
      <ng-content select="[jLabelMessage]" />
    </div>
  `,
  styles: [
    `
      .j-label {
        display: grid;
        gap: var(--j-spacing-xs, 0.25rem);
        color: var(--j-color-text, #111827);
      }
      .j-label__label {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-xs, 0.25rem);
        font-size: var(--j-font-size-sm, 0.875rem);
        font-weight: var(--j-font-weight-medium, 550);
      }
      .j-label__required,
      .j-label--error .j-label__message {
        color: var(--j-color-danger, #dc2626);
      }
      .j-label__optional,
      .j-label__description,
      .j-label__message {
        color: var(--j-color-text-muted, #64748b);
        font-size: var(--j-font-size-xs, 0.75rem);
        font-weight: 400;
      }
      .j-label--success .j-label__message {
        color: var(--j-color-success, #15803d);
      }
      .j-label--warning .j-label__message {
        color: var(--j-color-warning, #b45309);
      }
      .j-label--inline {
        align-items: center;
        grid-template-columns: minmax(7rem, auto) minmax(0, 1fr);
      }
      .j-label--inline .j-label__description,
      .j-label--inline .j-label__message {
        grid-column: 2;
      }
      .j-label--floating,
      .j-label--in-field {
        position: relative;
      }
      .j-label--floating .j-label__label {
        background: var(--j-color-surface, #fff);
        inset-block-start: 50%;
        inset-inline-start: var(--j-spacing-md, 0.75rem);
        pointer-events: none;
        position: absolute;
        transform: translateY(-50%);
        transition:
          transform var(--j-duration-fast, 150ms),
          color var(--j-duration-fast, 150ms);
        z-index: 1;
      }
      .j-label--floating.is-focused .j-label__label,
      .j-label--floating.is-filled .j-label__label {
        color: var(--j-color-primary, #4f46e5);
        padding-inline: var(--j-spacing-xs, 0.25rem);
        transform: translateY(-2.05rem) scale(0.86);
      }
      .j-label--in-field {
        border: 1px solid var(--j-color-border, #cbd5e1);
        border-radius: var(--j-input-radius, 0.5rem);
        gap: 0;
        padding: var(--j-spacing-xs, 0.25rem) var(--j-spacing-md, 0.75rem)
          var(--j-spacing-sm, 0.5rem);
        transition:
          border-color var(--j-duration-fast, 150ms),
          box-shadow var(--j-duration-fast, 150ms);
      }
      .j-label--in-field:focus-within {
        border-color: var(--j-color-primary, #4f46e5);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 20%));
      }
      .j-label--in-field .j-label__label {
        color: var(--j-color-text-muted, #64748b);
        font-size: var(--j-font-size-xs, 0.75rem);
      }
      .j-label--in-field .j-label__control :is(input, textarea, select, [role='combobox']) {
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        outline: 0 !important;
        padding-inline: 0;
        width: 100%;
      }
      .j-label--compact {
        gap: var(--j-spacing-2xs, 0.125rem);
      }
      .j-label--compact.j-label--in-field {
        padding-block: var(--j-spacing-2xs, 0.125rem) var(--j-spacing-xs, 0.25rem);
      }
      .j-label--error.j-label--in-field {
        border-color: var(--j-color-danger, #dc2626);
      }
      .j-label--disabled {
        opacity: var(--j-disabled-opacity, 0.55);
      }
      .j-label--readonly.j-label--in-field {
        background: var(--j-color-surface-subtle, #f8fafc);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JLabelComponent implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: MutationObserver | null = null;

  readonly label = input('');
  readonly for = input('', { alias: 'for' });
  readonly variant = input<JLabelVariant>('standard');
  readonly state = input<JLabelState>('default');
  readonly density = input<JLabelDensity>('normal');
  readonly description = input('');
  readonly message = input('');
  readonly icon = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly optional = input(false, { transform: booleanAttribute });
  readonly optionalText = input('Optional');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly messageId = input(jCreateId('j-label-message'));

  readonly focused = signal(false);
  readonly filled = signal(false);
  readonly resolvedControlId = signal('');
  readonly classes = computed(() =>
    jMergePartClasses(
      [
        'j-label',
        `j-label--${this.variant()}`,
        `j-label--${this.density()}`,
        `j-label--${this.state()}`,
        this.focused() ? 'is-focused' : '',
        this.filled() ? 'is-filled' : '',
        this.disabled() ? 'j-label--disabled' : '',
        this.readonly() ? 'j-label--readonly' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  constructor() {
    afterRenderEffect(() => this.syncControl());
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  @HostListener('focusin') onFocusIn(): void {
    this.focused.set(true);
    this.syncControl();
  }
  @HostListener('focusout') onFocusOut(): void {
    this.focused.set(false);
    this.syncControl();
  }
  @HostListener('input') @HostListener('change') onValueChange(): void {
    this.syncControl();
  }

  ngAfterViewInit(): void {
    this.syncControl();
    if (this.browser && typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver(() => this.syncControl());
      this.observer.observe(this.host.nativeElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['value', 'aria-valuenow', 'data-j-active', 'disabled', 'readonly'],
      });
    }
  }

  private syncControl(): void {
    const control = this.host.nativeElement.querySelector<HTMLElement>(
      'input, textarea, select, [role="combobox"], [role="slider"], [role="spinbutton"]',
    );
    if (!control) return;
    const id = this.for() || control.id || jCreateId('j-label-control');
    if (!control.id) control.id = id;
    this.resolvedControlId.set(id);
    const value =
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement
        ? control.value
        : (control.getAttribute('aria-valuenow') ?? '');
    this.filled.set(value !== '' || control.getAttribute('data-j-active') === 'true');
    if (this.message() && !control.getAttribute('aria-describedby'))
      control.setAttribute('aria-describedby', this.messageId());
  }
}

import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';

@Component({
  selector: 'j-icon-field',
  imports: [JButtonComponent, JIconComponent],
  template: `
    <div
      [class]="fieldClasses()"
      data-jc-name="icon-field"
      data-jc-section="root"
      data-jc-extend="prefix suffix"
      role="group"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="disabled()"
      [attr.aria-readonly]="readonly()"
      [attr.aria-invalid]="invalid()"
      [attr.inert]="disabled() ? '' : null"
      (input)="syncClearVisibility()"
      (change)="syncClearVisibility()"
    >
      @if (prefixIcon()) {
        <span class="j-icon-field__icon" data-jc-section="prefix" aria-hidden="true">
          <j-icon [name]="prefixIcon()" />
        </span>
      }
      <span class="j-icon-field__icon" data-jc-section="prefix" aria-hidden="true"
        ><ng-content select="[jIconFieldPrefix]"></ng-content
      ></span>
      <div class="j-icon-field__content" data-jc-section="content"><ng-content></ng-content></div>
      <span class="j-icon-field__icon" data-jc-section="suffix" aria-hidden="true"
        ><ng-content select="[jIconFieldSuffix]"></ng-content
      ></span>
      @if (suffixIcon()) {
        <span class="j-icon-field__icon" data-jc-section="suffix" aria-hidden="true">
          <j-icon [name]="suffixIcon()" />
        </span>
      }
      @if (showClear()) {
        <j-button
          actionDisplay="icon"
          icon="close"
          size="sm"
          variant="text"
          ariaLabel="Clear"
          title="Clear"
          [disabled]="disabled() || readonly()"
          (onClick)="clear.emit()"
        />
      }
      @if (filterable()) {
        <j-button
          actionDisplay="icon"
          icon="filter"
          size="sm"
          variant="text"
          ariaLabel="Apply filter"
          title="Apply filter"
          [disabled]="disabled() || readonly()"
          (onClick)="filter.emit()"
        />
      }
    </div>
  `,
  styles: [
    `
      .j-icon-field {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-2, 0.5rem);
        padding-inline: var(--j-spacing-3, 0.75rem);
      }

      .j-icon-field--fluid {
        width: 100%;
      }

      .j-icon-field__content {
        flex: 1;
        min-width: 0;
      }

      .j-icon-field__icon {
        color: var(--j-color-muted-foreground, var(--j-color-text-muted));
        display: inline-flex;
        flex: 0 0 auto;
      }

      .j-icon-field:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-icon-field.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-icon-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-icon-field.is-readonly {
        background: var(--j-color-muted);
      }

      .j-icon-field.is-dense {
        min-height: var(--j-input-height-sm, 2.125rem);
        padding-inline: var(--j-spacing-2, 0.5rem);
      }

      :host ::ng-deep .j-icon-field .j-input {
        border: 0;
        box-shadow: none;
      }

      .j-icon-field__icon:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JIconFieldComponent implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly hasValue = signal(false);
  private observer: MutationObserver | null = null;

  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly dense = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly filterable = input(false, { transform: booleanAttribute });

  readonly clear = output<void>();
  readonly filter = output<void>();
  readonly showClear = computed(() => this.clearable());

  readonly fieldClasses = computed(() =>
    jMergePartClasses(
      [
        'j-icon-field',
        this.fluid() || this.fullWidth() ? 'j-icon-field--fluid' : '',
        this.invalid() ? 'is-invalid' : '',
        this.disabled() ? 'is-disabled' : '',
        this.readonly() ? 'is-readonly' : '',
        this.dense() ? 'is-dense' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  constructor() {
    afterRenderEffect(() => this.syncClearVisibility());
    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  ngAfterViewInit(): void {
    this.syncClearVisibility();
    if (!this.browser || typeof MutationObserver === 'undefined') return;

    this.observer = new MutationObserver(() => this.syncClearVisibility());
    this.observer.observe(this.host.nativeElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['value', 'data-j-active'],
    });
  }

  protected syncClearVisibility(): void {
    if (!this.browser) return;

    const control = this.host.nativeElement.querySelector<HTMLElement>(
      '.j-icon-field__content input, .j-icon-field__content textarea, .j-icon-field__content select, .j-icon-field__content [contenteditable="true"], .j-icon-field__content [data-j-active]',
    );
    const value =
      control && 'value' in control ? String(control.value ?? '') : (control?.textContent ?? '');
    this.hasValue.set(value.length > 0 || control?.getAttribute('data-j-active') === 'true');
  }
}

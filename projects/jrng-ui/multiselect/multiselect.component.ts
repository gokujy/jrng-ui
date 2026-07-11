import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  numberAttribute,
  Output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JFilterMatchMode, jMatchesFilter } from 'jrng-ui/core';
import { JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';

export type JMultiselectOption = JSelectionOptionSource;

export interface JMultiselectItemContext {
  readonly $implicit: JSelectionOptionSource;
  readonly option: JSelectionOptionSource;
  readonly label: string;
  readonly value: unknown;
  readonly selected: boolean;
  readonly disabled: boolean;
}

@Component({
  selector: 'j-multiselect',
  imports: [JClickOutsideDirective, NgTemplateOutlet, JVirtualScrollerComponent],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="multiselect"
      data-jc-section="root"
      data-jc-extend="panel option filter chips"
      [attr.data-j-open]="isOpen ? 'true' : null"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      jClickOutside
      (jClickOutside)="close()"
    >
      @if (label) {
        <label class="j-multiselect__label" data-jc-section="label" [for]="id">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-multiselect__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <button
        class="j-multiselect"
        data-jc-section="trigger"
        type="button"
        role="combobox"
        [id]="id"
        [disabled]="isDisabled"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="listboxId"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (click)="toggle()"
        (keydown)="handleKeydown($event)"
        (blur)="onTouched()"
      >
        @if (displayChips && selectedOptions.length) {
          <span class="j-multiselect__chips" data-jc-section="chips">
            @for (option of visibleSelectedOptions; track option.value) {
              <span class="j-multiselect__chip" data-jc-section="chip">{{ option.label }}</span>
            }
            @if (selectedOverflowCount > 0) {
              <span class="j-multiselect__chip" data-jc-section="overflow"
                >+{{ selectedOverflowCount }}</span
              >
            }
          </span>
        } @else {
          <span
            class="j-multiselect__value"
            data-jc-section="value"
            [class.is-placeholder]="!selectedOptions.length"
          >
            {{ selectedText }}
          </span>
        }
        @if (canClear) {
          <button
            class="j-multiselect__clear"
            data-jc-section="clear"
            type="button"
            (click)="clearAll($event)"
          >
            x
          </button>
        }
        <span
          class="j-multiselect__indicator"
          data-jc-section="indicator"
          aria-hidden="true"
        ></span>
      </button>

      @if (isOpen) {
        <div
          #panel
          class="j-multiselect__panel"
          data-jc-section="panel"
          [class.j-multiselect__panel--fixed]="appendToBody"
          [id]="listboxId"
          role="listbox"
          aria-multiselectable="true"
        >
          @if (filter || searchable) {
            <input
              class="j-multiselect__filter"
              data-jc-section="filter"
              type="text"
              [placeholder]="filterPlaceholder"
              [value]="filterText"
              (input)="handleFilterInput($event)"
              (keydown)="handleKeydown($event)"
            />
          }
          @if (showSelectAll) {
            <div class="j-multiselect__utilities" data-jc-section="utilities">
              <button class="j-multiselect__utility" type="button" (click)="selectAllVisible()">
                {{ selectAllLabel }}
              </button>
              <button class="j-multiselect__utility" type="button" (click)="unselectAllVisible()">
                {{ unselectAllLabel }}
              </button>
            </div>
          }
          @if (loading) {
            <div class="j-multiselect__empty" data-jc-section="loading" data-j-loading="true">
              {{ loadingMessage }}
            </div>
          }
          @if (!loading && !visibleOptions.length) {
            <div class="j-multiselect__empty" data-jc-section="empty">{{ emptyMessage }}</div>
          }
          <ng-template #optionTpl let-option let-i="index">
            <button
              class="j-multiselect__option"
              data-jc-section="option"
              type="button"
              role="option"
              [disabled]="option.disabled"
              [class.is-active]="i === activeIndex"
              [class.is-selected]="isSelected(option)"
              [attr.data-j-selected]="isSelected(option) ? 'true' : null"
              [attr.data-j-active]="i === activeIndex ? 'true' : null"
              [attr.data-j-disabled]="option.disabled ? 'true' : null"
              [attr.aria-selected]="isSelected(option)"
              (click)="toggleOption(option)"
            >
              <span
                class="j-multiselect__box"
                [class.is-selected]="isSelected(option)"
                aria-hidden="true"
              ></span>
              @if (itemTemplate) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate"
                  [ngTemplateOutletContext]="itemContext(option)"
                ></ng-container>
              } @else {
                <span>{{ option.label }}</span>
              }
            </button>
          </ng-template>

          @if (useVirtual) {
            <j-virtual-scroller
              [items]="visibleOptions"
              [itemSize]="virtualScrollItemSize"
              [height]="scrollHeight"
            >
              <ng-template #jVirtualScrollerItem let-option let-i="index">
                <ng-container
                  [ngTemplateOutlet]="optionTpl"
                  [ngTemplateOutletContext]="{ $implicit: option, index: i }"
                ></ng-container>
              </ng-template>
            </j-virtual-scroller>
          } @else {
            @for (option of visibleOptions; track option.value; let i = $index) {
              <ng-container
                [ngTemplateOutlet]="optionTpl"
                [ngTemplateOutletContext]="{ $implicit: option, index: i }"
              ></ng-container>
            }
          }
        </div>
      }

      @if (hasError && error) {
        <p
          class="j-multiselect__message j-multiselect__message--error"
          data-jc-section="message"
          [id]="errorId"
        >
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-multiselect__message" data-jc-section="message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .j-multiselect-field {
        display: block;
        position: relative;
      }
      .j-multiselect__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }
      .j-multiselect__required,
      .j-multiselect__message--error {
        color: var(--j-color-danger);
      }
      .j-multiselect {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding: var(--j-spacing-xs) var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }
      .j-multiselect-field--filled .j-multiselect {
        background: var(--j-color-surface-muted);
      }
      .j-multiselect:focus-visible,
      .j-multiselect-field.is-open .j-multiselect {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-multiselect-field.is-invalid .j-multiselect {
        border-color: var(--j-color-danger);
      }
      .j-multiselect-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
      .j-multiselect__value,
      .j-multiselect__chips {
        flex: 1;
        min-width: 0;
      }
      .j-multiselect__value.is-placeholder {
        color: var(--j-color-text-muted);
      }
      .j-multiselect__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-xs);
      }
      .j-multiselect__chip {
        background: var(--j-color-surface-muted);
        border-radius: var(--j-radius-full);
        font-size: var(--j-font-size-xs);
        padding: 0 var(--j-spacing-sm);
      }
      .j-multiselect__clear {
        color: var(--j-color-text-muted);
      }
      .j-multiselect__indicator {
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        height: 0.45rem;
        opacity: 0.62;
        transform: rotate(45deg) translateY(-2px);
        width: 0.45rem;
      }
      .j-multiselect__panel {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        left: 0;
        margin-top: var(--j-spacing-xs);
        max-height: 18rem;
        min-width: 100%;
        overflow: auto;
        padding: var(--j-spacing-xs);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }
      .j-multiselect__filter,
      .j-multiselect__utility,
      .j-multiselect__option {
        font: inherit;
        width: 100%;
      }
      .j-multiselect__filter {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        min-height: 2rem;
        outline: none;
        padding: 0 var(--j-spacing-sm);
      }
      .j-multiselect__utilities {
        display: grid;
        gap: var(--j-spacing-xs);
        grid-template-columns: 1fr 1fr;
        margin-block: var(--j-spacing-xs);
      }
      .j-multiselect__utility,
      .j-multiselect__option {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        gap: var(--j-spacing-sm);
        padding: var(--j-spacing-sm) var(--j-spacing-md);
        text-align: left;
      }
      .j-multiselect__option:hover,
      .j-multiselect__option.is-active {
        background: var(--j-color-surface-muted);
      }
      .j-multiselect__box {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xs);
        height: 1rem;
        width: 1rem;
      }
      .j-multiselect__box.is-selected {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        box-shadow: inset 0 0 0 3px var(--j-color-surface);
      }
      .j-multiselect__empty,
      .j-multiselect__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }
      .j-multiselect__empty {
        padding: var(--j-spacing-md);
      }
      .j-multiselect__message {
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JMultiselectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMultiselectComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(JOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private overlayHandle?: JOverlayHandle;

  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  @ViewChild(JVirtualScrollerComponent)
  private scroller?: JVirtualScrollerComponent<JNormalizedSelectionOption>;

  @ContentChild('jMultiselectItem', { read: TemplateRef })
  itemTemplate?: TemplateRef<JMultiselectItemContext>;

  @Input() id = jCreateId('j-multiselect');
  @Input() label = '';
  @Input() options: readonly JMultiselectOption[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() optionDisabled = 'disabled';
  @Input() placeholder = 'Select';
  @Input() error = '';
  @Input() hint = '';
  @Input() filterPlaceholder = 'Search';
  @Input() emptyMessage = 'No options found';
  @Input() loadingMessage = 'Loading...';
  @Input() selectAllLabel = 'Select all';
  @Input() unselectAllLabel = 'Unselect all';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: numberAttribute }) maxSelectedLabels = 3;
  @Input({ transform: booleanAttribute }) virtualScroll = false;
  @Input({ transform: numberAttribute }) virtualScrollItemSize = 40;
  @Input() scrollHeight = '15rem';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) searchable = false;
  @Input({ transform: booleanAttribute }) filter = false;
  @Input() filterMatchMode: JFilterMatchMode = 'contains';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input({ transform: booleanAttribute }) clearable = false;
  @Input({ transform: booleanAttribute }) displayChips = false;
  @Input({ transform: booleanAttribute }) showSelectAll = true;
  @Input({ transform: booleanAttribute }) loading = false;

  @Output() valueChange = new EventEmitter<readonly unknown[]>();
  @Output() selectionChange = new EventEmitter<readonly JNormalizedSelectionOption[]>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-multiselect-hint');
  readonly errorId = jCreateId('j-multiselect-error');
  readonly listboxId = jCreateId('j-multiselect-listbox');
  value: readonly unknown[] = [];
  isDisabled = false;
  isOpen = false;
  filterText = '';
  activeIndex = -1;

  onTouched: () => void = () => undefined;
  private onChange: (value: readonly unknown[]) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(
      this.options,
      this.optionLabel,
      this.optionValue,
      this.optionDisabled,
    );
  }

  get visibleOptions(): readonly JNormalizedSelectionOption[] {
    const query = this.filterText.trim();
    return query
      ? this.normalizedOptions.filter((option) =>
          jMatchesFilter(option.label, query, this.filterMatchMode),
        )
      : this.normalizedOptions;
  }

  get appendToBody(): boolean {
    return this.appendTo === 'body';
  }

  /** Virtual scrolling renders the (flat) option list through the virtual scroller. */
  get useVirtual(): boolean {
    return this.virtualScroll && !this.loading;
  }

  private scrollActiveIntoView(): void {
    if (this.useVirtual && this.activeIndex >= 0) {
      this.scroller?.scrollToIndex(this.activeIndex);
    }
  }

  get selectedOptions(): readonly JNormalizedSelectionOption[] {
    return this.normalizedOptions.filter((option) =>
      this.value.some((value) => jSameSelectionValue(value, option.value)),
    );
  }

  get visibleSelectedOptions(): readonly JNormalizedSelectionOption[] {
    return this.selectedOptions.slice(0, this.maxSelectedLabels);
  }

  get selectedOverflowCount(): number {
    return Math.max(0, this.selectedOptions.length - this.visibleSelectedOptions.length);
  }

  get selectedText(): string {
    return this.selectedOptions.length
      ? this.selectedOptions
          .map((option) => option.label)
          .slice(0, this.maxSelectedLabels)
          .join(', ') + (this.selectedOverflowCount ? ` +${this.selectedOverflowCount}` : '')
      : this.placeholder;
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get canClear(): boolean {
    return this.clearable && this.value.length > 0 && !this.isDisabled && !this.readonly;
  }

  get rootClasses(): string {
    return [
      'j-multiselect-field',
      `j-multiselect-field--${this.size}`,
      `j-multiselect-field--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: readonly unknown[] | null | undefined): void {
    this.value = Array.isArray(value) ? value : [];
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: readonly unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    if (this.isDisabled || this.readonly) {
      return;
    }
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isOpen || this.isDisabled || this.readonly) {
      return;
    }
    this.isOpen = true;
    this.activeIndex = this.visibleOptions.findIndex((option) => !option.disabled);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();

    queueMicrotask(() => {
      this.attachOverlay();
      this.scrollActiveIntoView();
    });
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.filterText = '';
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  private attachOverlay(): void {
    if (!this.isBrowser || !this.appendToBody || !this.panelRef?.nativeElement) {
      return;
    }
    this.overlayHandle = this.overlay.attach(
      this.hostRef.nativeElement,
      this.panelRef.nativeElement,
      {
        appendTo: 'body',
        matchWidth: true,
      },
    );
    this.destroyRef.onDestroy(() => this.overlayHandle?.detach());
  }

  handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
    this.activeIndex = this.visibleOptions.findIndex((option) => !option.disabled);
    this.filterChange.emit(this.filterText);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Tab') {
      this.close();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen) {
        this.open();
        return;
      }
      this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Enter' && this.isOpen) {
      event.preventDefault();
      const option = this.visibleOptions[this.activeIndex];
      if (option) {
        this.toggleOption(option);
      }
    }
  }

  toggleOption(option: JNormalizedSelectionOption): void {
    if (option.disabled) {
      return;
    }

    const nextValue = this.isSelected(option)
      ? this.value.filter((value) => !jSameSelectionValue(value, option.value))
      : [...this.value, option.value];
    this.commitValue(nextValue);
  }

  selectAllVisible(): void {
    const nextValue = [
      ...this.value,
      ...this.visibleOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value)
        .filter((value) => !this.value.some((selected) => jSameSelectionValue(selected, value))),
    ];
    this.commitValue(nextValue);
  }

  unselectAllVisible(): void {
    const visibleValues = this.visibleOptions.map((option) => option.value);
    this.commitValue(
      this.value.filter(
        (value) => !visibleValues.some((visible) => jSameSelectionValue(visible, value)),
      ),
    );
  }

  clearAll(event?: Event): void {
    event?.stopPropagation();
    this.commitValue([]);
    this.clear.emit();
  }

  isSelected(option: JNormalizedSelectionOption): boolean {
    return this.value.some((value) => jSameSelectionValue(value, option.value));
  }

  itemContext(option: JNormalizedSelectionOption): JMultiselectItemContext {
    return {
      $implicit: option.source,
      option: option.source,
      label: option.label,
      value: option.value,
      selected: this.isSelected(option),
      disabled: option.disabled,
    };
  }

  private commitValue(value: readonly unknown[]): void {
    this.value = value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(this.selectedOptions);
    this.changeDetectorRef.markForCheck();
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.visibleOptions;
    if (!options.length) {
      return;
    }
    let next = this.activeIndex;
    let attempts = 0;
    while (attempts < options.length) {
      attempts += 1;
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        this.activeIndex = next;
        this.scrollActiveIntoView();
        this.changeDetectorRef.markForCheck();
        return;
      }
    }
  }
}

import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from '../core/aria';
import { JClickOutsideDirective } from '../core/click-outside.directive';
import { jCreateId } from '../core/id';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

export type JSelectPrimitive = string | number | boolean;
export type JSelectOptionRecord = Readonly<Record<string, unknown>>;
export type JSelectOptionSource = JSelectPrimitive | JSelectOptionRecord;

export interface JSelectOption {
  readonly label: string;
  readonly value: unknown;
  readonly disabled?: boolean;
}

export interface JSelectItemContext {
  readonly $implicit: JSelectOptionSource;
  readonly option: JSelectOptionSource;
  readonly label: string;
  readonly value: unknown;
  readonly selected: boolean;
  readonly disabled: boolean;
}

@Component({
  selector: 'j-select',
  imports: [NgTemplateOutlet, JClickOutsideDirective],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSelectComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('triggerButton') private triggerButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('filterInput') private filterInput?: ElementRef<HTMLInputElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  @ContentChild('jSelectItem', { read: TemplateRef }) itemTemplate?: TemplateRef<JSelectItemContext>;

  @Input() id = jCreateId('j-select');
  @Input() label = '';
  @Input() options: readonly JSelectOptionSource[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() filterPlaceholder = 'Search';
  @Input() emptyMessage = 'No options found';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) searchable = false;
  @Input({ transform: booleanAttribute }) clearable = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) filter = false;

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() selectionChange = new EventEmitter<JSelectOption | null>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-select-hint');
  readonly errorId = jCreateId('j-select-error');
  readonly listboxId = jCreateId('j-select-listbox');
  readonly filterId = jCreateId('j-select-filter');

  value: unknown = null;
  isDisabled = false;
  isOpen = false;
  filterText = '';
  activeIndex = -1;
  overlayLeft = 0;
  overlayTop = 0;
  overlayWidth = 0;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get disabled(): boolean {
    return this.isDisabled;
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get normalizedOptions(): readonly JSelectOption[] {
    return this.options.map((option) => ({
      label: this.resolveLabel(option),
      value: this.resolveValue(option),
      disabled: this.resolveDisabled(option),
    }));
  }

  get visibleOptions(): readonly JSelectOption[] {
    const query = this.filterText.trim().toLowerCase();

    if (!query) {
      return this.normalizedOptions;
    }

    return this.normalizedOptions.filter((option) => option.label.toLowerCase().includes(query));
  }

  get selectedOption(): JSelectOption | null {
    return this.normalizedOptions.find((option) => this.sameValue(option.value, this.value)) ?? null;
  }

  get displayLabel(): string {
    return this.selectedOption?.label ?? '';
  }

  get canClear(): boolean {
    return this.clearable && this.value != null && this.value !== '' && !this.isDisabled && !this.readonly;
  }

  get panelId(): string | null {
    return this.isOpen ? this.listboxId : null;
  }

  get activeDescendant(): string | null {
    return this.isOpen && this.activeIndex >= 0 ? `${this.id}-option-${this.activeIndex}` : null;
  }

  get appendToBody(): boolean {
    return this.appendTo === 'body';
  }

  get rootClasses(): string {
    return [
      'j-select-field',
      `j-select-field--${this.size}`,
      `j-select-field--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
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
    if (this.isDisabled || this.readonly || this.isOpen) {
      return;
    }

    this.isOpen = true;
    this.activeIndex = this.selectedOptionIndex();
    if (this.activeIndex < 0) {
      this.activeIndex = this.firstEnabledIndex();
    }
    this.opened.emit();
    this.changeDetectorRef.markForCheck();

    queueMicrotask(() => {
      this.positionOverlay();
      this.appendOverlayToBody();

      if (this.searchable || this.filter) {
        this.filterInput?.nativeElement.focus();
      }
    });
  }

  close(restoreFocus = false): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.filterText = '';
    this.activeIndex = -1;
    this.closed.emit();
    this.changeDetectorRef.markForCheck();

    if (restoreFocus) {
      queueMicrotask(() => this.triggerButton?.nativeElement.focus());
    }
  }

  handleOutsideClick(): void {
    this.close();
  }

  handleButtonBlur(): void {
    this.onTouched();
  }

  handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.moveActive(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.moveActive(-1);
        }
        break;
      case 'Enter':
        if (this.isOpen) {
          event.preventDefault();
          this.selectActive();
        } else {
          this.open();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.close(true);
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
    this.activeIndex = this.firstEnabledIndex();
    this.filterChange.emit(this.filterText);
  }

  selectOption(option: JSelectOption): void {
    if (option.disabled) {
      return;
    }

    this.value = option.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(option);
    this.onTouched();
    this.close();
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();

    if (!this.canClear) {
      return;
    }

    this.value = null;
    this.onChange(null);
    this.valueChange.emit(null);
    this.selectionChange.emit(null);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }

  optionId(index: number): string {
    return `${this.id}-option-${index}`;
  }

  itemContext(option: JSelectOption, index: number): JSelectItemContext {
    return {
      $implicit: this.options[index],
      option: this.options[index],
      label: option.label,
      value: option.value,
      selected: this.sameValue(option.value, this.value),
      disabled: option.disabled === true,
    };
  }

  isSelected(option: JSelectOption): boolean {
    return this.sameValue(option.value, this.value);
  }

  private selectedOptionIndex(): number {
    return this.visibleOptions.findIndex((option) => this.sameValue(option.value, this.value));
  }

  private firstEnabledIndex(): number {
    return this.visibleOptions.findIndex((option) => !option.disabled);
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.visibleOptions;

    if (!options.length) {
      this.activeIndex = -1;
      return;
    }

    let nextIndex = this.activeIndex;

    for (let attempt = 0; attempt < options.length; attempt += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        this.activeIndex = nextIndex;
        this.changeDetectorRef.markForCheck();
        return;
      }
    }
  }

  private selectActive(): void {
    const option = this.visibleOptions[this.activeIndex];

    if (option) {
      this.selectOption(option);
    }
  }

  private resolveLabel(option: JSelectOptionSource): string {
    if (this.isRecord(option)) {
      return String(option[this.optionLabel] ?? option['label'] ?? option[this.optionValue] ?? option['value'] ?? '');
    }

    return String(option);
  }

  private resolveValue(option: JSelectOptionSource): unknown {
    if (this.isRecord(option)) {
      return option[this.optionValue] ?? option['value'] ?? option[this.optionLabel] ?? option['label'] ?? option;
    }

    return option;
  }

  private resolveDisabled(option: JSelectOptionSource): boolean {
    return this.isRecord(option) && option['disabled'] === true;
  }

  private sameValue(left: unknown, right: unknown): boolean {
    return Object.is(left, right);
  }

  private isRecord(value: JSelectOptionSource): value is JSelectOptionRecord {
    return typeof value === 'object' && value !== null;
  }

  private positionOverlay(): void {
    if (!this.isBrowser || !this.appendToBody) {
      return;
    }

    const hostRect = this.hostRef.nativeElement.getBoundingClientRect();
    this.overlayLeft = hostRect.left;
    this.overlayTop = hostRect.bottom + 4;
    this.overlayWidth = hostRect.width;
    this.changeDetectorRef.markForCheck();
  }

  private appendOverlayToBody(): void {
    if (!this.isBrowser || !this.appendToBody || !this.panelRef?.nativeElement || !this.documentRef.body) {
      return;
    }

    this.documentRef.body.appendChild(this.panelRef.nativeElement);
  }
}

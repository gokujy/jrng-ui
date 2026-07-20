import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JAsyncDataController, JAsyncDataSource, JAsyncDataState } from 'jrng-ui/async-data';
import { JButtonComponent } from 'jrng-ui/button';
import { JRNG_CONFIG, jAriaDescribedBy } from 'jrng-ui/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
import { jCreateTypeahead } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JFilterMatchMode, jMatchesFilter } from 'jrng-ui/core';
import { JAppendTo, JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';

export type JSelectPrimitive = string | number | boolean;
export type JSelectOptionRecord = Readonly<Record<string, unknown>>;
export type JSelectOptionSource = JSelectPrimitive | JSelectOptionRecord;

export interface JSelectAsyncQuery {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface JSelectOption {
  readonly label: string;
  readonly value: unknown;
  readonly disabled?: boolean;
  readonly group?: string;
  readonly source: JSelectOptionSource;
}

export interface JSelectGroupItem {
  readonly type: 'group';
  readonly label: string;
}

export interface JSelectOptionItem {
  readonly type: 'option';
  readonly option: JSelectOption;
  readonly optionIndex: number;
}

export type JSelectListItem = JSelectGroupItem | JSelectOptionItem;

export interface JSelectItemContext {
  readonly $implicit: JSelectOptionSource;
  readonly option: JSelectOptionSource;
  readonly index: number;
  readonly label: string;
  readonly value: unknown;
  readonly selected: boolean;
  readonly disabled: boolean;
}

@Component({
  selector: 'j-select',
  imports: [JButtonComponent, NgTemplateOutlet, JClickOutsideDirective, JVirtualScrollerComponent],
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
  private readonly config = inject(JRNG_CONFIG);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(JOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private overlayHandle?: JOverlayHandle;

  @ViewChild('triggerButton') private triggerButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('filterInput') private filterInput?: ElementRef<HTMLInputElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  @ViewChild(JVirtualScrollerComponent) private scroller?: JVirtualScrollerComponent<JSelectOption>;
  @ContentChild('jSelectItem', { read: TemplateRef })
  itemTemplate?: TemplateRef<JSelectItemContext>;
  @ContentChild('jSelectSelectedItem', { read: TemplateRef })
  selectedItemTemplate?: TemplateRef<JSelectItemContext>;

  readonly id = input(jCreateId('j-select'));
  readonly label = input('');
  readonly options = input<readonly JSelectOptionSource[]>([]);
  readonly dataSource = input<JAsyncDataSource<JSelectOptionSource, JSelectAsyncQuery> | null>(
    null,
  );
  readonly asyncPageSize = input(50, { transform: numberAttribute });
  readonly debounce = input(250, { transform: numberAttribute });
  readonly cache = input(true, { transform: booleanAttribute });
  readonly infiniteLoading = input(false, { transform: booleanAttribute });
  readonly loadMoreLabel = input('Load more');
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly groupLabel = input('label');
  readonly groupOptions = input('items');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly filterPlaceholder = input('Search');
  readonly emptyMessage = input('No options found');
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly styleClass = input('');
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant | undefined>(undefined);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingMessage = input('Loading options');
  readonly loadErrorMessage = input('Options could not be loaded');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly filterMatchMode = input<JFilterMatchMode>('contains');
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input(40, { transform: numberAttribute });
  readonly scrollHeight = input('15rem');
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<unknown>();
  readonly selectionChange = output<JSelectOption | null>();
  readonly filterChange = output<string>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly asyncError = output<unknown>();

  readonly hintId = jCreateId('j-select-hint');
  readonly errorId = jCreateId('j-select-error');
  readonly listboxId = jCreateId('j-select-listbox');
  readonly filterId = jCreateId('j-select-filter');

  value: unknown = null;
  readonly isDisabled = signal(false);
  readonly asyncState = signal<JAsyncDataState<JSelectOptionSource>>({
    loading: false,
    items: [],
    error: null,
  });
  isOpen = false;

  filterText = '';
  activeIndex = -1;
  private readonly typeahead = jCreateTypeahead<JSelectOption>();
  private asyncController?: JAsyncDataController<JSelectOptionSource, JSelectAsyncQuery>;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private asyncPage = 0;
  private asyncSearch = '';

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
    effect(() => {
      const source = this.dataSource();
      this.asyncController?.destroy();
      this.asyncController = source
        ? new JAsyncDataController(source, {
            cache: this.cache(),
            onStateChange: (state) => {
              this.asyncState.set(state);
              if (state.error) this.asyncError.emit(state.error);
              this.changeDetectorRef.markForCheck();
            },
          })
        : undefined;
      if (source) void this.loadAsync('');
    });
    this.destroyRef.onDestroy(() => {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.asyncController?.destroy();
    });
  }

  get isLoading(): boolean {
    return this.loading() || this.asyncState().loading;
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  get normalizedOptions(): readonly JSelectOption[] {
    const source = this.dataSource() ? this.asyncState().items : this.options();
    return source.flatMap((option) => this.normalizeOptionSource(option));
  }

  get visibleOptions(): readonly JSelectOption[] {
    const query = this.filterText.trim();

    if (!query) {
      return this.normalizedOptions;
    }

    return this.normalizedOptions.filter((option) =>
      jMatchesFilter(option.label, query, this.filterMatchMode()),
    );
  }

  get visibleItems(): readonly JSelectListItem[] {
    const items: JSelectListItem[] = [];
    let currentGroup = '';

    this.visibleOptions.forEach((option, optionIndex) => {
      if (option.group && option.group !== currentGroup) {
        currentGroup = option.group;
        items.push({ type: 'group', label: option.group });
      }

      items.push({ type: 'option', option, optionIndex });
    });

    return items;
  }

  get isGrouped(): boolean {
    return this.visibleOptions.some((option) => !!option.group);
  }

  /** Virtual scrolling applies only to flat (ungrouped) lists. */
  get useVirtual(): boolean {
    return this.virtualScroll() && !this.isGrouped && !this.isLoading;
  }

  private scrollActiveIntoView(): void {
    if (this.useVirtual && this.activeIndex >= 0) {
      this.scroller?.scrollToIndex(this.activeIndex);
    }
  }

  get selectedOption(): JSelectOption | null {
    return (
      this.normalizedOptions.find((option) => this.sameValue(option.value, this.value)) ?? null
    );
  }

  get displayLabel(): string {
    return this.selectedOption?.label ?? '';
  }

  get canClear(): boolean {
    return (
      this.clearable() &&
      this.value != null &&
      this.value !== '' &&
      !this.isDisabled() &&
      !this.readonly()
    );
  }

  get panelId(): string | null {
    return this.isOpen ? this.listboxId : null;
  }

  get activeDescendant(): string | null {
    return this.isOpen && this.activeIndex >= 0 ? `${this.id()}-option-${this.activeIndex}` : null;
  }

  get appendToBody(): boolean {
    return this.overlay.resolveTarget(this.appendTo()) !== null;
  }

  get rootClasses(): string {
    return [
      'j-select-field',
      `j-select-field--${this.size()}`,
      `j-select-field--${this.variant() ?? this.config.inputStyle}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    if (this.value != null) void this.asyncController?.hydrate([this.value]);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.isOpen) {
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
      this.attachOverlay();
      this.scrollActiveIntoView();

      if (this.searchable() || this.filter()) {
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
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
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
      default:
        this.handleTypeahead(event);
        break;
    }
  }

  handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
    this.activeIndex = this.firstEnabledIndex();
    this.filterChange.emit(this.filterText);
    if (this.dataSource()) {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => void this.loadAsync(this.filterText), this.debounce());
    }
  }

  retryAsync(): void {
    this.asyncController?.invalidate();
    void this.loadAsync(this.filterText);
  }

  loadMoreAsync(): void {
    if (!this.dataSource() || this.isLoading || !this.asyncState().hasMore) return;
    void this.loadAsync(this.asyncSearch, this.asyncPage + 1, true);
  }

  handlePanelScroll(event: Event): void {
    if (!this.infiniteLoading()) return;
    const panel = event.currentTarget as HTMLElement;
    if (panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 32) this.loadMoreAsync();
  }

  private loadAsync(search: string, page = 0, append = false): Promise<unknown> {
    if (!append) {
      this.asyncPage = 0;
      this.asyncSearch = search;
    }
    return (
      this.asyncController
        ?.load({ search, page, pageSize: this.asyncPageSize() }, append)
        .then((result) => {
          this.asyncPage = result.page ?? page;
          this.asyncSearch = search;
          return result;
        })
        .catch(() => undefined) ?? Promise.resolve()
    );
  }

  selectOption(option: JSelectOption): void {
    if (option.disabled || this.isDisabled() || this.readonly()) {
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
    return `${this.id()}-option-${index}`;
  }

  itemContext(option: JSelectOption, index: number): JSelectItemContext {
    return {
      $implicit: option.source,
      option: option.source,
      index,
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

    let attempts = 0;
    while (attempts < options.length) {
      attempts += 1;
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        this.activeIndex = nextIndex;
        this.scrollActiveIntoView();
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
      return String(
        option[this.optionLabel()] ??
          option['label'] ??
          option[this.optionValue()] ??
          option['value'] ??
          '',
      );
    }

    return String(option);
  }

  private resolveValue(option: JSelectOptionSource): unknown {
    if (this.isRecord(option)) {
      return (
        option[this.optionValue()] ??
        option['value'] ??
        option[this.optionLabel()] ??
        option['label'] ??
        option
      );
    }

    return option;
  }

  private resolveDisabled(option: JSelectOptionSource): boolean {
    return (
      this.isRecord(option) &&
      (option[this.optionDisabled()] === true || option['disabled'] === true)
    );
  }

  private normalizeOptionSource(option: JSelectOptionSource): readonly JSelectOption[] {
    if (!this.isRecord(option)) {
      return [
        {
          label: this.resolveLabel(option),
          value: this.resolveValue(option),
          disabled: false,
          source: option,
        },
      ];
    }

    const groupOptions = option[this.groupOptions()] ?? option['options'] ?? option['items'];

    if (Array.isArray(groupOptions)) {
      const group = String(option[this.groupLabel()] ?? option['label'] ?? '');
      return groupOptions.map((child) => ({
        label: this.resolveLabel(child as JSelectOptionSource),
        value: this.resolveValue(child as JSelectOptionSource),
        disabled: this.resolveDisabled(child as JSelectOptionSource),
        group,
        source: child as JSelectOptionSource,
      }));
    }

    return [
      {
        label: this.resolveLabel(option),
        value: this.resolveValue(option),
        disabled: this.resolveDisabled(option),
        source: option,
      },
    ];
  }

  private handleTypeahead(event: KeyboardEvent): void {
    if (!this.isOpen || event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const nextIndex = this.typeahead.search(
      event.key,
      this.visibleOptions.map((option) => ({
        item: option,
        text: option.label,
        disabled: option.disabled,
      })),
      this.activeIndex,
    );

    if (nextIndex >= 0) {
      event.preventDefault();
      this.activeIndex = nextIndex;
      this.changeDetectorRef.markForCheck();
    }
  }

  private sameValue(left: unknown, right: unknown): boolean {
    return Object.is(left, right);
  }

  private isRecord(value: JSelectOptionSource): value is JSelectOptionRecord {
    return typeof value === 'object' && value !== null;
  }

  private attachOverlay(): void {
    if (!this.isBrowser || !this.appendToBody || !this.panelRef?.nativeElement) {
      return;
    }

    this.overlayHandle = this.overlay.attach(
      this.hostRef.nativeElement,
      this.panelRef.nativeElement,
      {
        appendTo: this.appendTo(),
        matchWidth: true,
      },
    );
    this.destroyRef.onDestroy(() => this.overlayHandle?.detach());
  }
}

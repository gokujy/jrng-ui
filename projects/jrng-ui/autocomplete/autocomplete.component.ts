import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  JAsyncDataController,
  JAsyncDataSource,
  JAsyncDataState,
  JAsyncOptionsQuery,
} from 'jrng-ui/async-data';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JAppendTo, JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionRecord,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';

export type JAutocompleteSuggestion = JSelectionOptionSource;

@Component({
  selector: 'j-autocomplete',
  imports: [JClickOutsideDirective],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="autocomplete"
      data-jc-section="root"
      data-jc-extend="panel option dropdown"
      [attr.data-j-open]="isOpen ? 'true' : null"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      jClickOutside
      (jClickOutside)="close()"
    >
      @if (label()) {
        <label class="j-autocomplete__label" data-jc-section="label" [for]="id()">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-autocomplete__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="j-autocomplete" data-jc-section="control">
        <input
          class="j-autocomplete__field"
          data-jc-section="input"
          [id]="id()"
          type="text"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [value]="query"
          [attr.aria-expanded]="isOpen"
          [attr.aria-controls]="listboxId"
          [attr.aria-invalid]="hasError ? 'true' : null"
          [attr.aria-describedby]="describedBy"
          [attr.aria-activedescendant]="activeDescendant"
          role="combobox"
          (input)="handleInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
          (keydown)="handleKeydown($event)"
        />
        @if (dropdown()) {
          <button
            class="j-autocomplete__dropdown"
            data-jc-section="dropdown"
            type="button"
            [disabled]="isDisabled()"
            (click)="toggle()"
          >
            <span aria-hidden="true"></span>
          </button>
        }
      </div>

      @if (isOpen) {
        <div
          #panel
          class="j-autocomplete__panel"
          data-jc-section="panel"
          [class.j-autocomplete__panel--fixed]="appendToBody"
          [id]="listboxId"
          role="listbox"
        >
          @if (asyncState().loading) {
            <div class="j-autocomplete__empty" role="status" aria-live="polite">
              Loading suggestions
            </div>
          }
          @if (asyncState().error) {
            <div class="j-autocomplete__empty" role="alert">
              Suggestions could not be loaded
              <button type="button" (click)="retryAsync()">Retry</button>
            </div>
          }
          @if (!asyncState().loading && !asyncState().error && !normalizedSuggestions.length) {
            <div class="j-autocomplete__empty" data-jc-section="empty">{{ emptyMessage() }}</div>
          }
          @for (
            item of suggestionItems;
            track item.type === 'group' ? item.label : item.suggestion.value;
            let i = $index
          ) {
            @if (item.type === 'group') {
              <div class="j-autocomplete__group" data-jc-section="group" role="presentation">
                {{ item.label }}
              </div>
            } @else {
              <button
                class="j-autocomplete__option"
                data-jc-section="option"
                type="button"
                role="option"
                [id]="optionId(item.index)"
                [disabled]="item.suggestion.disabled"
                [class.is-active]="item.index === activeIndex"
                [attr.data-j-active]="item.index === activeIndex ? 'true' : null"
                [attr.data-j-selected]="isSelected(item.suggestion) ? 'true' : null"
                [attr.data-j-disabled]="item.suggestion.disabled ? 'true' : null"
                [attr.aria-selected]="isSelected(item.suggestion)"
                (mousedown)="$event.preventDefault()"
                (click)="selectSuggestion(item.suggestion)"
              >
                {{ item.suggestion.label }}
              </button>
            }
          }
        </div>
      }

      @if (hasError && error()) {
        <p class="j-autocomplete__message j-autocomplete__message--error" [id]="errorId">
          {{ error() }}
        </p>
      }
      @if (hint() && !hasError) {
        <p class="j-autocomplete__message" [id]="hintId">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-autocomplete-field {
        display: block;
        position: relative;
      }

      .j-autocomplete__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-autocomplete__required,
      .j-autocomplete__message--error {
        color: var(--j-color-danger);
      }

      .j-autocomplete {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        min-height: 2.5rem;
      }

      .j-autocomplete-field--filled .j-autocomplete {
        background: var(--j-color-surface-muted);
      }

      .j-autocomplete:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-autocomplete-field.is-invalid .j-autocomplete {
        border-color: var(--j-color-danger);
      }

      .j-autocomplete-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-autocomplete__field {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
        padding: 0 var(--j-spacing-md);
      }

      .j-autocomplete__dropdown {
        align-items: center;
        background: transparent;
        border: 0;
        color: var(--j-color-text-muted);
        cursor: pointer;
        display: inline-flex;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-autocomplete__dropdown span {
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        height: 0.45rem;
        transform: rotate(45deg) translateY(-2px);
        width: 0.45rem;
      }

      .j-autocomplete__panel {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        left: 0;
        margin-top: var(--j-spacing-xs);
        max-height: 16rem;
        min-width: 100%;
        overflow: auto;
        padding: var(--j-spacing-xs);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }

      .j-autocomplete__option {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: block;
        font: inherit;
        padding: var(--j-spacing-sm) var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }

      .j-autocomplete__group {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        padding: var(--j-spacing-sm) var(--j-spacing-md) var(--j-spacing-xs);
        text-transform: uppercase;
      }

      .j-autocomplete__option:hover,
      .j-autocomplete__option.is-active {
        background: var(--j-color-surface-muted);
      }

      .j-autocomplete__empty,
      .j-autocomplete__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }

      .j-autocomplete__empty {
        padding: var(--j-spacing-md);
      }

      .j-autocomplete__message {
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JAutocompleteComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAutocompleteComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly overlay = inject(JOverlayService);
  private overlayHandle?: JOverlayHandle;

  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  private completeTimer: ReturnType<typeof setTimeout> | null = null;

  readonly id = input(jCreateId('j-autocomplete'));
  readonly label = input('');
  readonly suggestions = input<readonly JAutocompleteSuggestion[]>([]);
  readonly dataSource = input<JAsyncDataSource<JAutocompleteSuggestion, JAsyncOptionsQuery> | null>(
    null,
  );
  readonly asyncPageSize = input(50);
  readonly cache = input(true, { transform: booleanAttribute });
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly groupLabel = input('label');
  readonly groupOptions = input('items');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly emptyMessage = input('No suggestions found');
  readonly styleClass = input('');
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly delay = input(250);
  readonly minLength = input(1);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly dropdown = input(false, { transform: booleanAttribute });
  readonly forceSelection = input(false, { transform: booleanAttribute });

  readonly valueChange = output<unknown>();
  readonly selectionChange = output<JNormalizedSelectionOption | null>();
  readonly searchChange = output<string>();
  readonly completeMethod = output<string>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly asyncError = output<unknown>();

  readonly hintId = jCreateId('j-autocomplete-hint');
  readonly errorId = jCreateId('j-autocomplete-error');
  readonly listboxId = jCreateId('j-autocomplete-listbox');
  value: unknown = null;
  query = '';
  readonly isDisabled = signal(false);
  readonly asyncState = signal<JAsyncDataState<JAutocompleteSuggestion>>({
    loading: false,
    items: [],
    error: null,
  });
  isOpen = false;
  activeIndex = -1;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private asyncController?: JAsyncDataController<JAutocompleteSuggestion, JAsyncOptionsQuery>;

  readonly disabled = input(false, { transform: booleanAttribute });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearCompleteTimer();
      this.asyncController?.destroy();
    });
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
  }

  get normalizedSuggestions(): readonly JNormalizedSelectionOption[] {
    const source = this.dataSource() ? this.asyncState().items : this.suggestions();
    return source.flatMap((suggestion) => this.normalizeSuggestion(suggestion));
  }

  get suggestionItems(): readonly (
    | { readonly type: 'group'; readonly label: string }
    | {
        readonly type: 'suggestion';
        readonly suggestion: JNormalizedSelectionOption;
        readonly index: number;
      }
  )[] {
    const items: (
      | { readonly type: 'group'; readonly label: string }
      | {
          readonly type: 'suggestion';
          readonly suggestion: JNormalizedSelectionOption;
          readonly index: number;
        }
    )[] = [];
    let group = '';
    this.normalizedSuggestions.forEach((suggestion, index) => {
      const sourceGroup = this.groupFor(suggestion.source);
      if (sourceGroup && sourceGroup !== group) {
        group = sourceGroup;
        items.push({ type: 'group', label: group });
      }
      items.push({ type: 'suggestion', suggestion, index });
    });
    return items;
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  /** Stable per-index id so the active option can be referenced via aria-activedescendant. */
  optionId(index: number): string {
    return `${this.listboxId}-option-${index}`;
  }

  /** Id of the active option, exposed on the combobox input for assistive tech. */
  get activeDescendant(): string | null {
    return this.isOpen && this.activeIndex >= 0 ? this.optionId(this.activeIndex) : null;
  }

  get rootClasses(): string {
    return [
      'j-autocomplete-field',
      `j-autocomplete-field--${this.size()}`,
      `j-autocomplete-field--${this.variant()}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    if (this.value != null) void this.asyncController?.hydrate([this.value]);
    const selected = this.normalizedSuggestions.find((suggestion) =>
      jSameSelectionValue(suggestion.value, this.value),
    );
    this.query = selected?.label ?? (typeof this.value === 'string' ? this.value : '');
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

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query = target.value;
    this.value = this.query;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.searchChange.emit(this.query);
    this.scheduleComplete(this.query);
    if (this.dataSource()) {
      this.clearCompleteTimer();
      this.completeTimer = setTimeout(() => void this.loadAsync(this.query), this.delay());
    }
    this.open();
  }

  retryAsync(): void {
    this.asyncController?.invalidate();
    void this.loadAsync(this.query);
  }

  private loadAsync(search: string): Promise<unknown> {
    return (
      this.asyncController
        ?.load({
          search,
          page: 0,
          pageSize: this.asyncPageSize(),
          selectedValues: this.value == null ? [] : [this.value],
        })
        .catch(() => undefined) ?? Promise.resolve()
    );
  }

  selectSuggestion(suggestion: JNormalizedSelectionOption): void {
    if (suggestion.disabled) {
      return;
    }
    this.value = suggestion.value;
    this.query = suggestion.label;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(suggestion);
    this.close();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.activeIndex = this.normalizedSuggestions.findIndex((suggestion) => !suggestion.disabled);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();

    queueMicrotask(() => this.attachOverlay());
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  get appendToBody(): boolean {
    return this.overlay.resolveTarget(this.appendTo()) !== null;
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

  handleBlur(): void {
    this.onTouched();
    if (this.forceSelection()) {
      const selected = this.normalizedSuggestions.find(
        (suggestion) => suggestion.label === this.query,
      );
      if (!selected) {
        this.value = null;
        this.query = '';
        this.onChange(null);
        this.valueChange.emit(null);
        this.selectionChange.emit(null);
      }
    }
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
      const suggestion = this.normalizedSuggestions[this.activeIndex];
      if (suggestion) {
        this.selectSuggestion(suggestion);
      }
    }
  }

  isSelected(suggestion: JNormalizedSelectionOption): boolean {
    return jSameSelectionValue(this.value, suggestion.value);
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.normalizedSuggestions;
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
        this.changeDetectorRef.markForCheck();
        return;
      }
    }
  }

  private scheduleComplete(query: string): void {
    this.clearCompleteTimer();

    if (query.length < this.minLength()) {
      return;
    }

    this.completeTimer = setTimeout(
      () => {
        this.completeMethod.emit(query);
        this.completeTimer = null;
      },
      Math.max(0, this.delay()),
    );
  }

  private clearCompleteTimer(): void {
    if (!this.completeTimer) {
      return;
    }
    clearTimeout(this.completeTimer);
    this.completeTimer = null;
  }

  private normalizeSuggestion(
    suggestion: JAutocompleteSuggestion,
  ): readonly JNormalizedSelectionOption[] {
    if (!this.isRecord(suggestion)) {
      return jNormalizeSelectionOptions(
        [suggestion],
        this.optionLabel(),
        this.optionValue(),
        this.optionDisabled(),
      );
    }

    const children =
      suggestion[this.groupOptions()] ?? suggestion['items'] ?? suggestion['options'];
    if (Array.isArray(children)) {
      const group = String(suggestion[this.groupLabel()] ?? suggestion['label'] ?? '');
      return jNormalizeSelectionOptions(
        children as readonly JSelectionOptionSource[],
        this.optionLabel(),
        this.optionValue(),
        this.optionDisabled(),
      ).map((option) => ({
        ...option,
        source: { ...(option.source as object), __group: group } as JSelectionOptionRecord,
      }));
    }

    return jNormalizeSelectionOptions(
      [suggestion],
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    );
  }

  private groupFor(source: JSelectionOptionSource): string {
    return this.isRecord(source) ? String(source['__group'] ?? '') : '';
  }

  private isRecord(value: JSelectionOptionSource): value is JSelectionOptionRecord {
    return typeof value === 'object' && value !== null;
  }
}

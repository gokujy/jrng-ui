import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  JAppendTo,
  JClickOutsideDirective,
  JOverlayHandle,
  JOverlayService,
  jCreateId,
} from 'jrng-ui/core';

export type JCascaderOptionRecord = Readonly<Record<string, unknown>>;

export interface JCascaderFieldNames {
  readonly label?: string;
  readonly value?: string;
  readonly children?: string;
  readonly disabled?: string;
  readonly leaf?: string;
}

export interface JCascaderOption {
  readonly label: string;
  readonly value: unknown;
  readonly disabled: boolean;
  readonly leaf: boolean;
  readonly source: JCascaderOptionRecord;
  readonly children: readonly JCascaderOption[];
}

export interface JCascaderLazyLoadEvent {
  readonly option: JCascaderOptionRecord;
  readonly path: readonly JCascaderOptionRecord[];
}

export interface JCascaderOptionContext {
  readonly $implicit: JCascaderOptionRecord;
  readonly option: JCascaderOptionRecord;
  readonly label: string;
  readonly level: number;
  readonly active: boolean;
  readonly loading: boolean;
}

@Directive({ selector: 'ng-template[jCascaderOption]' })
export class JCascaderOptionDirective {
  readonly templateRef = inject<TemplateRef<JCascaderOptionContext>>(TemplateRef);
}

@Component({
  selector: 'j-cascader',
  imports: [JClickOutsideDirective, NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JCascaderComponent),
      multi: true,
    },
  ],
  template: `
    <div class="j-cascader" jClickOutside (jClickOutside)="close()">
      @if (label()) {
        <label class="j-cascader__label" [for]="id()">{{ label() }}</label>
      }
      <button
        #trigger
        class="j-cascader__trigger"
        type="button"
        [id]="id()"
        [disabled]="isDisabled()"
        aria-haspopup="listbox"
        [attr.aria-expanded]="openState()"
        [attr.aria-controls]="panelId"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
        (blur)="onTouched()"
      >
        <span [class.j-cascader__placeholder]="!selectedPath().length">{{ displayValue() }}</span>
        <span aria-hidden="true">⌄</span>
      </button>
      @if (clearable() && selectedPath().length && !isDisabled()) {
        <button
          class="j-cascader__clear"
          type="button"
          aria-label="Clear selection"
          (click)="clear($event)"
        >
          ×
        </button>
      }
      @if (error()) {
        <small class="j-cascader__error" role="alert">{{ error() }}</small>
      } @else if (hint()) {
        <small class="j-cascader__hint">{{ hint() }}</small>
      }

      @if (openState()) {
        <section
          #panel
          class="j-cascader__panel"
          [id]="panelId"
          tabindex="-1"
          (keydown)="onPanelKeydown($event)"
        >
          @if (searchable()) {
            <label class="j-cascader__search">
              <span class="j-hidden-accessible">Search full paths</span>
              <input
                #searchInput
                type="search"
                [placeholder]="searchPlaceholder()"
                [value]="searchText()"
                (input)="setSearch($event)"
              />
            </label>
          }
          @if (loading()) {
            <div class="j-cascader__state" role="status">{{ loadingMessage() }}</div>
          } @else if (loadError()) {
            <div class="j-cascader__state j-cascader__state--error" role="alert">
              {{ loadError() }}
            </div>
          } @else if (searchText()) {
            <ul class="j-cascader__results" role="listbox" [attr.aria-label]="ariaLabel()">
              @for (result of searchResults(); track pathKey(result)) {
                <li role="option" aria-selected="false">
                  <button
                    type="button"
                    [disabled]="result.at(-1)?.disabled"
                    (click)="choosePath(result)"
                  >
                    {{ pathLabel(result) }}
                  </button>
                </li>
              } @empty {
                <li class="j-cascader__state">{{ emptyMessage() }}</li>
              }
            </ul>
          } @else {
            <div class="j-cascader__mobile-path">
              @if (activePath().length) {
                <button type="button" (click)="back()" aria-label="Previous level">‹</button>
              }
              <span>{{ pathLabel(activePath()) || label() }}</span>
            </div>
            <div class="j-cascader__columns" role="group" [attr.aria-label]="ariaLabel()">
              @for (column of columns(); track $index; let level = $index) {
                <ul
                  class="j-cascader__column"
                  [class.j-cascader__column--mobile-active]="level === activePath().length"
                  role="listbox"
                  [attr.aria-label]="'Level ' + (level + 1)"
                >
                  @for (option of column; track option.value; let optionIndex = $index) {
                    <li role="option" [attr.aria-selected]="isPathOption(level, option)">
                      <button
                        type="button"
                        [disabled]="option.disabled"
                        [attr.data-level]="level"
                        [attr.data-index]="optionIndex"
                        [class.is-active]="isPathOption(level, option)"
                        (click)="activate(option, level)"
                        (mouseenter)="hover(option, level)"
                      >
                        @if (optionTemplate()) {
                          <ng-container
                            [ngTemplateOutlet]="optionTemplate()!.templateRef"
                            [ngTemplateOutletContext]="optionContext(option, level)"
                          />
                        } @else {
                          <span>{{ option.label }}</span>
                        }
                        @if (loadingKey() === optionKey(option)) {
                          <span role="status">…</span>
                        } @else if (!option.leaf) {
                          <span aria-hidden="true">›</span>
                        }
                      </button>
                    </li>
                  } @empty {
                    <li class="j-cascader__state">{{ emptyMessage() }}</li>
                  }
                </ul>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styleUrl: './cascader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-cascader-host',
    'data-jc-name': 'cascader',
    'data-jc-extend': 'trigger panel column option',
  },
})
export class JCascaderComponent implements ControlValueAccessor, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly overlay = inject(JOverlayService);
  private overlayHandle?: JOverlayHandle;
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private loadRun = 0;
  private readonly formDisabled = signal(false);

  readonly id = input(jCreateId('j-cascader'));
  readonly options = input<readonly JCascaderOptionRecord[]>([]);
  readonly fieldNames = input<JCascaderFieldNames>({});
  readonly label = input('');
  readonly placeholder = input('Select');
  readonly hint = input('');
  readonly error = input('');
  readonly loadError = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingMessage = input('Loading options');
  readonly emptyMessage = input('No options found');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input('Search paths');
  readonly expandTrigger = input<'click' | 'hover'>('click');
  readonly hoverDelay = input(150, { transform: numberAttribute });
  readonly displayMode = input<'path' | 'value'>('path');
  readonly separator = input(' / ');
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly ariaLabel = input('Cascading options');
  readonly loadChildren = input<
    | ((
        option: JCascaderOptionRecord,
      ) => readonly JCascaderOptionRecord[] | Promise<readonly JCascaderOptionRecord[]>)
    | null
  >(null);

  readonly valueChange = output<unknown>();
  readonly pathChange = output<readonly JCascaderOptionRecord[]>();
  readonly lazyLoad = output<JCascaderLazyLoadEvent>();
  readonly loadFailed = output<unknown>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly optionTemplate = contentChild(JCascaderOptionDirective);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly openState = signal(false);
  readonly searchText = signal('');
  readonly activePath = signal<readonly JCascaderOption[]>([]);
  readonly selectedPath = signal<readonly JCascaderOption[]>([]);
  readonly loadingKey = signal<unknown>(null);
  readonly loadedChildren = signal(new Map<unknown, readonly JCascaderOption[]>());
  readonly panelId = jCreateId('j-cascader-panel');
  private value: unknown = null;
  private activeLevel = 0;
  private activeIndex = 0;

  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  readonly isDisabled = () => this.disabled() || this.formDisabled();

  normalizedOptions(): readonly JCascaderOption[] {
    return this.normalize(this.options());
  }

  columns(): readonly (readonly JCascaderOption[])[] {
    const columns: (readonly JCascaderOption[])[] = [this.normalizedOptions()];
    for (const option of this.activePath()) {
      const children = this.childrenFor(option);
      if (children.length) columns.push(children);
    }
    return columns;
  }

  searchResults(): readonly (readonly JCascaderOption[])[] {
    const query = this.searchText().trim().toLocaleLowerCase();
    if (!query) return [];
    return this.allPaths(this.normalizedOptions()).filter((path) =>
      this.pathLabel(path).toLocaleLowerCase().includes(query),
    );
  }

  displayValue(): string {
    if (!this.selectedPath().length) return this.placeholder();
    return this.displayMode() === 'value'
      ? (this.selectedPath().at(-1)?.label ?? this.placeholder())
      : this.pathLabel(this.selectedPath());
  }

  writeValue(value: unknown): void {
    this.value = value;
    this.selectedPath.set(this.findPath(this.normalizedOptions(), value) ?? []);
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }

  toggle(): void {
    this.openState() ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.openState()) return;
    this.openState.set(true);
    this.activePath.set(this.selectedPath().slice(0, -1));
    this.opened.emit();
    queueMicrotask(() => {
      const trigger = this.trigger()?.nativeElement;
      const panel = this.panel()?.nativeElement;
      if (trigger && panel) {
        this.overlayHandle = this.overlay.attach(trigger, panel, {
          appendTo: this.appendTo(),
          matchWidth: false,
        });
        (this.searchInput()?.nativeElement ?? panel.querySelector<HTMLElement>('button'))?.focus();
      }
    });
  }

  close(restoreFocus = false): void {
    if (!this.openState()) return;
    this.openState.set(false);
    this.searchText.set('');
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
    this.closed.emit();
    if (restoreFocus) queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }

  activate(option: JCascaderOption, level: number): void {
    if (option.disabled) return;
    const path = [...this.activePath().slice(0, level), option];
    if (option.leaf) {
      this.choosePath(path);
      return;
    }
    this.activePath.set(path);
    this.activeLevel = level + 1;
    this.activeIndex = 0;
    if (!this.childrenFor(option).length) void this.requestChildren(option, path);
  }

  hover(option: JCascaderOption, level: number): void {
    if (this.expandTrigger() !== 'hover' || option.disabled) return;
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(
      () => this.activate(option, level),
      Math.max(0, this.hoverDelay()),
    );
  }

  choosePath(path: readonly JCascaderOption[]): void {
    const option = path.at(-1);
    if (!option || option.disabled || !option.leaf) return;
    this.value = option.value;
    this.selectedPath.set(path);
    const sources = path.map((entry) => entry.source);
    this.onChange(option.value);
    this.valueChange.emit(option.value);
    this.pathChange.emit(sources);
    this.close(true);
  }

  clear(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) return;
    this.value = null;
    this.selectedPath.set([]);
    this.onChange(null);
    this.valueChange.emit(null);
    this.pathChange.emit([]);
  }

  back(): void {
    this.activePath.update((path) => path.slice(0, -1));
  }

  setSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
      return;
    }
    if (this.searchText()) return;
    const columns = this.columns();
    const column = columns[this.activeLevel] ?? [];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex = Math.max(0, Math.min(column.length - 1, this.activeIndex + direction));
      this.focusActive();
    } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
      event.preventDefault();
      const option = column[this.activeIndex];
      if (option) this.activate(option, this.activeLevel);
      queueMicrotask(() => this.focusActive());
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.activePath.update((path) => path.slice(0, -1));
      this.activeLevel = Math.max(0, this.activeLevel - 1);
      this.activeIndex = 0;
      queueMicrotask(() => this.focusActive());
    }
  }

  isPathOption(level: number, option: JCascaderOption): boolean {
    return this.activePath()[level]?.value === option.value;
  }

  pathLabel(path: readonly JCascaderOption[]): string {
    return path.map((entry) => entry.label).join(this.separator());
  }

  pathKey(path: readonly JCascaderOption[]): string {
    return path.map((entry) => String(entry.value)).join('|');
  }

  optionKey(option: JCascaderOption): unknown {
    return option.value ?? option.source;
  }

  optionContext(option: JCascaderOption, level: number): JCascaderOptionContext {
    return {
      $implicit: option.source,
      option: option.source,
      label: option.label,
      level,
      active: this.isPathOption(level, option),
      loading: this.loadingKey() === this.optionKey(option),
    };
  }

  ngOnDestroy(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.loadRun++;
    this.overlayHandle?.detach();
  }

  private normalize(records: readonly JCascaderOptionRecord[]): readonly JCascaderOption[] {
    const fields = this.fieldNames();
    const labelField = fields.label ?? 'label';
    const valueField = fields.value ?? 'value';
    const childrenField = fields.children ?? 'children';
    const disabledField = fields.disabled ?? 'disabled';
    const leafField = fields.leaf ?? 'leaf';
    return records.map((source) => {
      const rawChildren = source[childrenField];
      const children = Array.isArray(rawChildren)
        ? this.normalize(rawChildren as readonly JCascaderOptionRecord[])
        : [];
      return {
        label: String(source[labelField] ?? ''),
        value: source[valueField],
        disabled: Boolean(source[disabledField]),
        leaf: Boolean(source[leafField]) || (!children.length && source[leafField] !== false),
        source,
        children,
      };
    });
  }

  private childrenFor(option: JCascaderOption): readonly JCascaderOption[] {
    return this.loadedChildren().get(this.optionKey(option)) ?? option.children;
  }

  private async requestChildren(
    option: JCascaderOption,
    path: readonly JCascaderOption[],
  ): Promise<void> {
    this.lazyLoad.emit({ option: option.source, path: path.map((entry) => entry.source) });
    const loader = this.loadChildren();
    if (!loader) return;
    const run = ++this.loadRun;
    this.loadingKey.set(this.optionKey(option));
    try {
      const children = this.normalize(await loader(option.source));
      if (run !== this.loadRun) return;
      this.loadedChildren.update((current) => {
        const next = new Map(current);
        next.set(this.optionKey(option), children);
        return next;
      });
    } catch (error) {
      if (run === this.loadRun) this.loadFailed.emit(error);
    } finally {
      if (run === this.loadRun) this.loadingKey.set(null);
    }
  }

  private allPaths(
    nodes: readonly JCascaderOption[],
    parent: readonly JCascaderOption[] = [],
  ): readonly (readonly JCascaderOption[])[] {
    return nodes.flatMap((node) => {
      const path = [...parent, node];
      return node.leaf ? [path] : this.allPaths(this.childrenFor(node), path);
    });
  }

  private findPath(
    nodes: readonly JCascaderOption[],
    value: unknown,
    parent: readonly JCascaderOption[] = [],
  ): readonly JCascaderOption[] | null {
    for (const node of nodes) {
      const path = [...parent, node];
      if (node.value === value) return path;
      const found = this.findPath(this.childrenFor(node), value, path);
      if (found) return found;
    }
    return null;
  }

  private focusActive(): void {
    this.panel()
      ?.nativeElement.querySelector<HTMLElement>(
        `[data-level="${this.activeLevel}"][data-index="${this.activeIndex}"]`,
      )
      ?.focus();
  }
}

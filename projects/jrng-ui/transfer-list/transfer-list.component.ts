import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  input,
  model,
  signal,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

export type JTransferListResponsiveMode = 'auto' | 'stack' | 'none';

@Component({
  selector: 'j-transfer-list',
  imports: [JButtonComponent, JInputComponent],
  template: `
    <section [class]="rootClasses()" data-jc-name="transfer-list" data-jc-section="root">
      <div class="j-transfer-list__pane" data-jc-section="source">
        <header>{{ sourceHeader() }}</header>
        @if (filter()) {
          <j-input
            [placeholder]="filterPlaceholder()"
            [value]="sourceFilter()"
            width="full"
            (valueChange)="sourceFilter.set($event)"
          />
        }
        <div role="listbox" aria-multiselectable="true" [attr.aria-label]="sourceAriaLabel()">
          @for (item of visibleSource(); track item.value) {
            <button
              type="button"
              role="option"
              [class.j-is-selected]="isSourceSelected(item)"
              [attr.aria-selected]="isSourceSelected(item)"
              (click)="toggleSource(item)"
            >
              {{ item.label }}
            </button>
          }
        </div>
      </div>
      <div class="j-transfer-list__actions" data-jc-section="actions">
        <j-button
          label="Move selected"
          icon="chevron-right"
          actionDisplay="icon"
          ariaLabel="Move selected to target"
          title="Move selected to target"
          (onClick)="moveSelectedToTarget()"
          [disabled]="!sourceSelected().length"
        />
        <j-button label="Move all" icon="chevron-right" actionDisplay="icon" ariaLabel="Move all to target" title="Move all to target" (onClick)="moveAllToTarget()" [disabled]="!source().length" />
        <j-button
          label="Remove selected"
          icon="chevron-left"
          actionDisplay="icon"
          ariaLabel="Move selected to source"
          title="Move selected to source"
          (onClick)="moveSelectedToSource()"
          [disabled]="!targetSelected().length"
        />
        <j-button label="Remove all" icon="chevron-left" actionDisplay="icon" ariaLabel="Move all to source" title="Move all to source" (onClick)="moveAllToSource()" [disabled]="!target().length" />
      </div>
      <div class="j-transfer-list__pane" data-jc-section="target">
        <header>{{ targetHeader() }}</header>
        @if (filter()) {
          <j-input
            [placeholder]="filterPlaceholder()"
            [value]="targetFilter()"
            width="full"
            (valueChange)="targetFilter.set($event)"
          />
        }
        <div role="listbox" aria-multiselectable="true" [attr.aria-label]="targetAriaLabel()">
          @for (item of visibleTarget(); track item.value) {
            <button
              type="button"
              role="option"
              [class.j-is-selected]="isTargetSelected(item)"
              [attr.aria-selected]="isTargetSelected(item)"
              (click)="toggleTarget(item)"
            >
              {{ item.label }}
            </button>
          }
        </div>
        <div class="j-transfer-list__reorder" aria-label="Target ordering">
          <j-button variant="text" actionDisplay="icon" icon="chevron-up" ariaLabel="Move selected target items up" title="Move selected target items up" (onClick)="reorderTarget(-1)" [disabled]="!targetSelected().length" />
          <j-button variant="text" actionDisplay="icon" icon="chevron-down" ariaLabel="Move selected target items down" title="Move selected target items down" (onClick)="reorderTarget(1)" [disabled]="!targetSelected().length" />
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .j-transfer-list {
        display: grid;
        gap: var(--j-spacing-md);
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      }
      .j-transfer-list__pane {
        display: grid;
        gap: var(--j-spacing-sm);
      }
      .j-transfer-list__pane header {
        font-weight: var(--j-font-weight-semibold);
      }
      .j-transfer-list__pane input {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        font: inherit;
        min-height: 2.25rem;
        padding-inline: var(--j-spacing-md);
      }
      .j-transfer-list__pane [role='listbox'] {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        max-height: 18rem;
        min-height: 12rem;
        overflow: auto;
        padding: var(--j-spacing-xs);
      }
      .j-transfer-list__pane button {
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
      .j-transfer-list__pane button:hover,
      .j-transfer-list__pane button.j-is-selected {
        background: var(--j-color-surface-muted);
        color: var(--j-color-primary);
      }
      .j-transfer-list__actions {
        align-content: center;
        display: grid;
        gap: var(--j-spacing-xs);
      }
      .j-transfer-list__reorder { display: flex; gap: var(--j-spacing-xs); justify-content: flex-end; }
      .j-transfer-list--stacked { grid-template-columns: minmax(0, 1fr); }
      .j-transfer-list--stacked .j-transfer-list__actions { display: flex; flex-wrap: wrap; justify-content: center; }
      .j-transfer-list--stacked .j-transfer-list__pane { width: 100%; }
      .j-transfer-list__actions button {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        background: var(--j-color-surface);
        color: var(--j-color-text);
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
        padding-inline: var(--j-spacing-md);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTransferListComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly source = model<readonly JSelectionOptionSource[]>([]);
  readonly target = model<readonly JSelectionOptionSource[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly sourceHeader = input('Available');
  readonly targetHeader = input('Selected');
  readonly sourceAriaLabel = input('Available items');
  readonly targetAriaLabel = input('Selected items');
  readonly filterPlaceholder = input('Search');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly responsiveMode = input<JTransferListResponsiveMode>('auto');
  readonly breakpoint = input('768px');
  readonly stacked = signal(false);

  readonly sourceFilter = signal('');
  readonly targetFilter = signal('');
  readonly sourceSelected = signal<readonly unknown[]>([]);
  readonly targetSelected = signal<readonly unknown[]>([]);

  readonly normalizedSource = computed<readonly JNormalizedSelectionOption[]>(() =>
    jNormalizeSelectionOptions(
      this.source(),
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    ),
  );
  readonly normalizedTarget = computed<readonly JNormalizedSelectionOption[]>(() =>
    jNormalizeSelectionOptions(
      this.target(),
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    ),
  );
  readonly visibleSource = computed<readonly JNormalizedSelectionOption[]>(() =>
    this.filterOptions(this.normalizedSource(), this.sourceFilter()),
  );
  readonly visibleTarget = computed<readonly JNormalizedSelectionOption[]>(() =>
    this.filterOptions(this.normalizedTarget(), this.targetFilter()),
  );

  readonly rootClasses = computed(() => [
    'j-transfer-list',
    this.responsiveMode() === 'stack' || (this.responsiveMode() === 'auto' && this.stacked())
      ? 'j-transfer-list--stacked'
      : '',
  ].filter(Boolean).join(' '));

  constructor() {
    if (!this.isBrowser || typeof ResizeObserver === 'undefined') return;
    afterNextRender(() => {
      const observer = new ResizeObserver(([entry]) => {
        const threshold = Number.parseFloat(this.breakpoint()) || 768;
        this.stacked.set((entry?.contentRect.width ?? this.host.nativeElement.clientWidth) <= threshold);
      });
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  updateSourceFilter(event: Event): void {
    this.sourceFilter.set(this.inputValue(event));
  }

  updateTargetFilter(event: Event): void {
    this.targetFilter.set(this.inputValue(event));
  }

  toggleSource(item: JNormalizedSelectionOption): void {
    this.sourceSelected.set(this.toggle(this.sourceSelected(), item.value));
  }
  toggleTarget(item: JNormalizedSelectionOption): void {
    this.targetSelected.set(this.toggle(this.targetSelected(), item.value));
  }
  isSourceSelected(item: JNormalizedSelectionOption): boolean {
    return this.sourceSelected().some((value) => jSameSelectionValue(value, item.value));
  }
  isTargetSelected(item: JNormalizedSelectionOption): boolean {
    return this.targetSelected().some((value) => jSameSelectionValue(value, item.value));
  }

  private inputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
  }

  moveSelectedToTarget(): void {
    this.moveToTarget(this.sourceSelected());
  }
  moveAllToTarget(): void {
    this.moveToTarget(this.normalizedSource().map((item) => item.value));
  }
  moveSelectedToSource(): void {
    this.moveToSource(this.targetSelected());
  }
  moveAllToSource(): void {
    this.moveToSource(this.normalizedTarget().map((item) => item.value));
  }

  reorderTarget(direction: 1 | -1): void {
    const next = [...this.target()];
    const selectedIndexes = this.normalizedTarget()
      .map((item, index) => (this.isTargetSelected(item) ? index : -1))
      .filter((index) => index >= 0);
    const ordered = selectedIndexes.sort((a, b) => (direction > 0 ? b - a : a - b));
    for (const index of ordered) {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) continue;
      [next[index], next[targetIndex]] = [
        next[targetIndex] as JSelectionOptionSource,
        next[index] as JSelectionOptionSource,
      ];
    }
    this.target.set(next);
  }

  protected moveToTarget(values: readonly unknown[]): void {
    const moving = this.source().filter((item) =>
      values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    const remaining = this.source().filter(
      (item) => !values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.sourceSelected.set([]);
    this.source.set(remaining);
    this.target.set([...this.target(), ...moving]);
  }

  protected moveToSource(values: readonly unknown[]): void {
    const moving = this.target().filter((item) =>
      values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    const remaining = this.target().filter(
      (item) => !values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.targetSelected.set([]);
    this.target.set(remaining);
    this.source.set([...this.source(), ...moving]);
  }

  private filterOptions(
    options: readonly JNormalizedSelectionOption[],
    query: string,
  ): readonly JNormalizedSelectionOption[] {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? options.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
      : options;
  }
  private toggle(values: readonly unknown[], value: unknown): readonly unknown[] {
    return values.some((item) => jSameSelectionValue(item, value))
      ? values.filter((item) => !jSameSelectionValue(item, value))
      : [...values, value];
  }
  private valueFor(item: JSelectionOptionSource): unknown {
    return jNormalizeSelectionOptions(
      [item],
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    )[0]?.value;
  }
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';

@Component({
  selector: 'j-transfer-list',
  imports: [],
  template: `
    <section class="j-transfer-list" data-jc-name="transfer-list" data-jc-section="root">
      <div class="j-transfer-list__pane" data-jc-section="source">
        <header>{{ sourceHeader }}</header>
        @if (filter) {
          <input
            [placeholder]="filterPlaceholder"
            [value]="sourceFilter"
            (input)="updateSourceFilter($event)"
          />
        }
        <div role="listbox" aria-multiselectable="true" [attr.aria-label]="sourceAriaLabel">
          @for (item of visibleSource; track item.value) {
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
        <button type="button" (click)="moveSelectedToTarget()" [disabled]="!sourceSelected.length">
          Move selected
        </button>
        <button type="button" (click)="moveAllToTarget()" [disabled]="!source.length">
          Move all
        </button>
        <button type="button" (click)="moveSelectedToSource()" [disabled]="!targetSelected.length">
          Remove selected
        </button>
        <button type="button" (click)="moveAllToSource()" [disabled]="!target.length">
          Remove all
        </button>
        <button type="button" (click)="reorderTarget(-1)" [disabled]="!targetSelected.length">
          Up
        </button>
        <button type="button" (click)="reorderTarget(1)" [disabled]="!targetSelected.length">
          Down
        </button>
      </div>
      <div class="j-transfer-list__pane" data-jc-section="target">
        <header>{{ targetHeader }}</header>
        @if (filter) {
          <input
            [placeholder]="filterPlaceholder"
            [value]="targetFilter"
            (input)="updateTargetFilter($event)"
          />
        }
        <div role="listbox" aria-multiselectable="true" [attr.aria-label]="targetAriaLabel">
          @for (item of visibleTarget; track item.value) {
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
  @Input() source: readonly JSelectionOptionSource[] = [];
  @Input() target: readonly JSelectionOptionSource[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() optionDisabled = 'disabled';
  @Input() sourceHeader = 'Available';
  @Input() targetHeader = 'Selected';
  @Input() sourceAriaLabel = 'Available items';
  @Input() targetAriaLabel = 'Selected items';
  @Input() filterPlaceholder = 'Search';
  @Input({ transform: booleanAttribute }) filter = false;

  @Output() sourceChange = new EventEmitter<readonly JSelectionOptionSource[]>();
  @Output() targetChange = new EventEmitter<readonly JSelectionOptionSource[]>();

  sourceFilter = '';
  targetFilter = '';
  sourceSelected: readonly unknown[] = [];
  targetSelected: readonly unknown[] = [];

  get normalizedSource(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(
      this.source,
      this.optionLabel,
      this.optionValue,
      this.optionDisabled,
    );
  }
  get normalizedTarget(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(
      this.target,
      this.optionLabel,
      this.optionValue,
      this.optionDisabled,
    );
  }
  get visibleSource(): readonly JNormalizedSelectionOption[] {
    return this.filterOptions(this.normalizedSource, this.sourceFilter);
  }
  get visibleTarget(): readonly JNormalizedSelectionOption[] {
    return this.filterOptions(this.normalizedTarget, this.targetFilter);
  }

  updateSourceFilter(event: Event): void {
    this.sourceFilter = this.inputValue(event);
  }

  updateTargetFilter(event: Event): void {
    this.targetFilter = this.inputValue(event);
  }

  toggleSource(item: JNormalizedSelectionOption): void {
    this.sourceSelected = this.toggle(this.sourceSelected, item.value);
  }
  toggleTarget(item: JNormalizedSelectionOption): void {
    this.targetSelected = this.toggle(this.targetSelected, item.value);
  }
  isSourceSelected(item: JNormalizedSelectionOption): boolean {
    return this.sourceSelected.some((value) => jSameSelectionValue(value, item.value));
  }
  isTargetSelected(item: JNormalizedSelectionOption): boolean {
    return this.targetSelected.some((value) => jSameSelectionValue(value, item.value));
  }

  private inputValue(event: Event): string {
    return event.target instanceof HTMLInputElement ? event.target.value : '';
  }

  moveSelectedToTarget(): void {
    this.moveToTarget(this.sourceSelected);
  }
  moveAllToTarget(): void {
    this.moveToTarget(this.normalizedSource.map((item) => item.value));
  }
  moveSelectedToSource(): void {
    this.moveToSource(this.targetSelected);
  }
  moveAllToSource(): void {
    this.moveToSource(this.normalizedTarget.map((item) => item.value));
  }

  reorderTarget(direction: 1 | -1): void {
    const next = [...this.target];
    const selectedIndexes = this.normalizedTarget
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
    this.target = next;
    this.targetChange.emit(this.target);
  }

  protected moveToTarget(values: readonly unknown[]): void {
    const moving = this.source.filter((item) =>
      values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.source = this.source.filter(
      (item) => !values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.target = [...this.target, ...moving];
    this.sourceSelected = [];
    this.sourceChange.emit(this.source);
    this.targetChange.emit(this.target);
  }

  protected moveToSource(values: readonly unknown[]): void {
    const moving = this.target.filter((item) =>
      values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.target = this.target.filter(
      (item) => !values.some((value) => jSameSelectionValue(value, this.valueFor(item))),
    );
    this.source = [...this.source, ...moving];
    this.targetSelected = [];
    this.sourceChange.emit(this.source);
    this.targetChange.emit(this.target);
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
      this.optionLabel,
      this.optionValue,
      this.optionDisabled,
    )[0]?.value;
  }
}

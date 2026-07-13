import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from '../core/selection-options';

export interface JOrderListReorderEvent {
  readonly value: readonly JSelectionOptionSource[];
  readonly from: number;
  readonly to: number;
}

@Component({
  selector: 'j-order-list',
  imports: [],
  template: `
    <section class="j-order-list" data-jc-name="order-list" data-jc-section="root">
      @if (header) {
        <header class="j-order-list__header" data-jc-section="header">{{ header }}</header>
      }
      @if (filter) {
        <input class="j-order-list__filter" data-jc-section="filter" [placeholder]="filterPlaceholder" [value]="filterText" (input)="handleFilter($event)" />
      }
      <div class="j-order-list__body">
        <div class="j-order-list__items" role="listbox" aria-multiselectable="true" [attr.aria-label]="ariaLabel">
          @for (option of visibleOptions; track option.value; let i = $index) {
            <button
              class="j-order-list__item"
              data-jc-section="option"
              type="button"
              role="option"
              [disabled]="option.disabled"
              [class.is-selected]="isSelected(option)"
              [attr.aria-selected]="isSelected(option)"
              [attr.aria-disabled]="option.disabled ? 'true' : null"
              (click)="toggleSelected(option)"
            >
              {{ option.label }}
            </button>
          }
          @if (!visibleOptions.length) {
            <div class="j-order-list__empty" data-jc-section="empty">{{ emptyMessage }}</div>
          }
        </div>
        <div class="j-order-list__actions" data-jc-section="actions">
          <button type="button" (click)="moveTop()" [disabled]="!selectedIndexes.length">Top</button>
          <button type="button" (click)="moveUp()" [disabled]="!selectedIndexes.length">Up</button>
          <button type="button" (click)="moveDown()" [disabled]="!selectedIndexes.length">Down</button>
          <button type="button" (click)="moveBottom()" [disabled]="!selectedIndexes.length">Bottom</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .j-order-list { display: grid; gap: var(--j-spacing-sm); }
    .j-order-list__header { font-weight: var(--j-font-weight-semibold); }
    .j-order-list__filter { border: 1px solid var(--j-color-border); border-radius: var(--j-radius-md); font: inherit; min-height: 2.25rem; padding-inline: var(--j-spacing-md); }
    .j-order-list__body { display: grid; gap: var(--j-spacing-sm); grid-template-columns: minmax(0, 1fr) auto; }
    .j-order-list__items { border: 1px solid var(--j-color-border); border-radius: var(--j-radius-md); max-height: 18rem; overflow: auto; padding: var(--j-spacing-xs); }
    .j-order-list__item { background: transparent; border: 0; border-radius: var(--j-radius-sm); color: var(--j-color-text); cursor: pointer; display: block; font: inherit; padding: var(--j-spacing-sm) var(--j-spacing-md); text-align: left; width: 100%; }
    .j-order-list__item:hover, .j-order-list__item.is-selected { background: var(--j-color-surface-muted); color: var(--j-color-primary); }
    .j-order-list__actions { display: grid; gap: var(--j-spacing-xs); }
    .j-order-list__actions button { border: 1px solid var(--j-color-border); border-radius: var(--j-radius-sm); background: var(--j-color-surface); color: var(--j-color-text); cursor: pointer; font: inherit; min-height: 2rem; padding-inline: var(--j-spacing-md); }
    .j-order-list__empty { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-xs); padding: var(--j-spacing-md); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JOrderListComponent {
  @Input() value: readonly JSelectionOptionSource[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() optionDisabled = 'disabled';
  @Input() header = '';
  @Input() ariaLabel = 'Order list';
  @Input() filterPlaceholder = 'Search';
  @Input() emptyMessage = 'No items found';
  @Input({ transform: booleanAttribute }) filter = false;
  @Input({ transform: booleanAttribute }) multiple = true;

  @Output() valueChange = new EventEmitter<readonly JSelectionOptionSource[]>();
  @Output() reorder = new EventEmitter<JOrderListReorderEvent>();

  filterText = '';
  selected: readonly unknown[] = [];

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(this.value, this.optionLabel, this.optionValue, this.optionDisabled);
  }

  get visibleOptions(): readonly JNormalizedSelectionOption[] {
    const query = this.filterText.trim().toLowerCase();
    return query ? this.normalizedOptions.filter((item) => item.label.toLowerCase().includes(query)) : this.normalizedOptions;
  }

  get selectedIndexes(): readonly number[] {
    return this.normalizedOptions
      .map((option, index) => (this.isSelected(option) ? index : -1))
      .filter((index) => index >= 0);
  }

  handleFilter(event: Event): void {
    this.filterText = (event.target as HTMLInputElement).value;
  }

  toggleSelected(option: JNormalizedSelectionOption): void {
    if (option.disabled) return;
    this.selected = this.isSelected(option)
      ? this.selected.filter((value) => !jSameSelectionValue(value, option.value))
      : this.multiple ? [...this.selected, option.value] : [option.value];
  }

  isSelected(option: JNormalizedSelectionOption): boolean {
    return this.selected.some((value) => jSameSelectionValue(value, option.value));
  }

  moveTop(): void { this.moveSelectedTo(0); }
  moveBottom(): void { this.moveSelectedTo(this.value.length - 1); }
  moveUp(): void { this.shiftSelected(-1); }
  moveDown(): void { this.shiftSelected(1); }

  private shiftSelected(direction: 1 | -1): void {
    const indexes = [...this.selectedIndexes].sort((a, b) => direction > 0 ? b - a : a - b);
    const next = [...this.value];
    for (const index of indexes) {
      const target = index + direction;
      if (target < 0 || target >= next.length) continue;
      [next[index], next[target]] = [next[target] as JSelectionOptionSource, next[index] as JSelectionOptionSource];
      this.reorder.emit({ value: next, from: index, to: target });
    }
    this.commit(next);
  }

  private moveSelectedTo(targetIndex: number): void {
    const selectedIndexes = this.selectedIndexes;
    if (!selectedIndexes.length) return;
    const selectedItems = selectedIndexes.map((index) => this.value[index]).filter((item): item is JSelectionOptionSource => item != null);
    const remaining = this.value.filter((_, index) => !selectedIndexes.includes(index));
    const insertAt = Math.max(0, Math.min(targetIndex, remaining.length));
    const next = [...remaining.slice(0, insertAt), ...selectedItems, ...remaining.slice(insertAt)];
    this.reorder.emit({ value: next, from: selectedIndexes[0] ?? 0, to: insertAt });
    this.commit(next);
  }

  private commit(value: readonly JSelectionOptionSource[]): void {
    this.value = value;
    this.valueChange.emit(this.value);
  }
}

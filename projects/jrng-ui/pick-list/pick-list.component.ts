import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';

@Component({
  selector: 'j-pick-list',
  imports: [],
  template: `
    <section class="j-pick-list" data-jc-name="pick-list" data-jc-section="root">
      <header class="j-pick-list__summary" data-jc-section="header">
        <div>
          <strong>{{ sourceHeader() }}</strong>
          <span>{{ visibleSource().length }} available</span>
        </div>
        <button type="button" (click)="addAll()" [disabled]="!movableSource().length">
          Add all
        </button>
      </header>

      <div class="j-pick-list__layout">
        <section class="j-pick-list__available" data-jc-section="source">
          @if (filter()) {
            <label class="j-pick-list__filter">
              <span class="j-visually-hidden">{{ filterPlaceholder() }}</span>
              <input
                type="search"
                [placeholder]="filterPlaceholder()"
                [value]="sourceFilter()"
                (input)="updateSourceFilter($event)"
              />
            </label>
          }

          <div class="j-pick-list__options" role="list" [attr.aria-label]="sourceAriaLabel()">
            @for (item of visibleSource(); track item.value) {
              <article class="j-pick-list__option" [class.j-is-disabled]="item.disabled">
                <span>{{ item.label }}</span>
                <button
                  type="button"
                  [disabled]="item.disabled"
                  [attr.aria-label]="'Add ' + item.label"
                  (click)="add(item)"
                >
                  Add
                </button>
              </article>
            } @empty {
              <p class="j-pick-list__empty">No available items.</p>
            }
          </div>
        </section>

        <section class="j-pick-list__selected" data-jc-section="target">
          <header>
            <div>
              <strong>{{ targetHeader() }}</strong>
              <span>{{ normalizedTarget().length }} selected</span>
            </div>
            <button type="button" (click)="removeAll()" [disabled]="!movableTarget().length">
              Clear
            </button>
          </header>

          <div class="j-pick-list__picks" role="list" [attr.aria-label]="targetAriaLabel()">
            @for (item of normalizedTarget(); track item.value; let index = $index) {
              <article class="j-pick-list__pick" [class.j-is-disabled]="item.disabled">
                <span class="j-pick-list__index">{{ index + 1 }}</span>
                <span class="j-pick-list__label">{{ item.label }}</span>
                <span class="j-pick-list__order-actions">
                  <button
                    type="button"
                    [disabled]="item.disabled || index === 0"
                    [attr.aria-label]="'Move ' + item.label + ' up'"
                    (click)="move(item, -1)"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    [disabled]="item.disabled || index === normalizedTarget().length - 1"
                    [attr.aria-label]="'Move ' + item.label + ' down'"
                    (click)="move(item, 1)"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    class="j-pick-list__remove"
                    [disabled]="item.disabled"
                    [attr.aria-label]="'Remove ' + item.label"
                    (click)="remove(item)"
                  >
                    Remove
                  </button>
                </span>
              </article>
            } @empty {
              <p class="j-pick-list__empty">Choose items from the available list.</p>
            }
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .j-pick-list {
        background: var(--j-color-card, var(--j-color-surface));
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: grid;
        gap: var(--j-spacing-4, 1rem);
        padding: var(--j-spacing-4, 1rem);
      }

      .j-pick-list__summary,
      .j-pick-list__selected > header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3, 0.75rem);
        justify-content: space-between;
      }

      .j-pick-list__summary > div,
      .j-pick-list__selected > header > div {
        display: grid;
        gap: 0.125rem;
      }

      .j-pick-list__summary span,
      .j-pick-list__selected header span,
      .j-pick-list__empty {
        color: var(--j-color-muted-foreground, var(--j-color-text-muted));
        font-size: var(--j-font-size-sm);
      }

      .j-pick-list__layout {
        display: grid;
        gap: var(--j-spacing-4, 1rem);
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      .j-pick-list__available,
      .j-pick-list__selected {
        display: grid;
        gap: var(--j-spacing-3, 0.75rem);
        min-width: 0;
      }

      .j-pick-list__filter input {
        background: var(--j-color-background, var(--j-color-surface));
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-3, 0.75rem);
        width: 100%;
      }

      .j-pick-list__options,
      .j-pick-list__picks {
        align-content: start;
        display: grid;
        gap: var(--j-spacing-2, 0.5rem);
        max-height: 19rem;
        min-height: 12rem;
        overflow: auto;
      }

      .j-pick-list__option,
      .j-pick-list__pick {
        align-items: center;
        background: var(--j-color-background, var(--j-color-surface));
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-2, 0.5rem);
        min-height: 2.75rem;
        padding: var(--j-spacing-2, 0.5rem) var(--j-spacing-3, 0.75rem);
      }

      .j-pick-list__option {
        justify-content: space-between;
      }

      .j-pick-list__pick {
        border-left: 3px solid var(--j-color-primary);
      }

      .j-pick-list__index {
        align-items: center;
        background: var(--j-color-primary-subtle, var(--j-color-surface-muted));
        border-radius: 999px;
        color: var(--j-color-primary);
        display: inline-flex;
        flex: 0 0 1.5rem;
        font-size: var(--j-font-size-xs, 0.75rem);
        height: 1.5rem;
        justify-content: center;
      }

      .j-pick-list__label {
        flex: 1;
        min-width: 0;
      }

      .j-pick-list__order-actions {
        display: flex;
        gap: var(--j-spacing-1, 0.25rem);
      }

      button {
        background: transparent;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
        padding-inline: var(--j-spacing-2, 0.5rem);
      }

      button:hover:not(:disabled) {
        background: var(--j-color-primary-subtle, var(--j-color-surface-muted));
      }

      button:focus-visible,
      input:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      button:disabled,
      .j-is-disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      .j-pick-list__remove {
        color: var(--j-color-danger, var(--j-color-error));
      }

      .j-pick-list__empty {
        margin: 0;
        padding: var(--j-spacing-4, 1rem);
        text-align: center;
      }

      .j-visually-hidden {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

      @media (max-width: 720px) {
        .j-pick-list__layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPickListComponent {
  readonly source = model<readonly JSelectionOptionSource[]>([]);
  readonly target = model<readonly JSelectionOptionSource[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly sourceHeader = input('Available options');
  readonly targetHeader = input('Selected options');
  readonly sourceAriaLabel = input('Available options');
  readonly targetAriaLabel = input('Selected options');
  readonly filterPlaceholder = input('Search available options');
  readonly filter = input(false, { transform: booleanAttribute });

  readonly sourceFilter = signal('');

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

  readonly visibleSource = computed<readonly JNormalizedSelectionOption[]>(() => {
    const query = this.sourceFilter().trim().toLocaleLowerCase();
    const normalized = this.normalizedSource();
    return query
      ? normalized.filter((item) => item.label.toLocaleLowerCase().includes(query))
      : normalized;
  });

  readonly movableSource = computed<readonly JNormalizedSelectionOption[]>(() =>
    this.normalizedSource().filter((item) => !item.disabled),
  );

  readonly movableTarget = computed<readonly JNormalizedSelectionOption[]>(() =>
    this.normalizedTarget().filter((item) => !item.disabled),
  );

  updateSourceFilter(event: Event): void {
    this.sourceFilter.set(event.target instanceof HTMLInputElement ? event.target.value : '');
  }

  add(item: JNormalizedSelectionOption): void {
    if (item.disabled) return;
    this.moveToTarget([item.value]);
  }

  remove(item: JNormalizedSelectionOption): void {
    if (item.disabled) return;
    this.moveToSource([item.value]);
  }

  addAll(): void {
    this.moveToTarget(this.movableSource().map((item) => item.value));
  }

  removeAll(): void {
    this.moveToSource(this.movableTarget().map((item) => item.value));
  }

  move(item: JNormalizedSelectionOption, direction: -1 | 1): void {
    if (item.disabled) return;
    const next = [...this.target()];
    const index = this.normalizedTarget().findIndex((candidate) =>
      jSameSelectionValue(candidate.value, item.value),
    );
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [
      next[targetIndex] as JSelectionOptionSource,
      next[index] as JSelectionOptionSource,
    ];
    this.target.set(next);
  }

  private moveToTarget(values: readonly unknown[]): void {
    const moving = this.source().filter((option) => this.includesValue(option, values));
    if (!moving.length) return;
    this.source.set(this.source().filter((option) => !this.includesValue(option, values)));
    this.target.set([...this.target(), ...moving]);
  }

  private moveToSource(values: readonly unknown[]): void {
    const moving = this.target().filter((option) => this.includesValue(option, values));
    if (!moving.length) return;
    this.target.set(this.target().filter((option) => !this.includesValue(option, values)));
    this.source.set([...this.source(), ...moving]);
  }

  private includesValue(option: JSelectionOptionSource, values: readonly unknown[]): boolean {
    const normalized = jNormalizeSelectionOptions(
      [option],
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    )[0];
    return values.some((value) => jSameSelectionValue(value, normalized?.value));
  }
}

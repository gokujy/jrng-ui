import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface JColumnFilterChange {
  readonly field: string;
  readonly value: string;
}

@Component({
  selector: 'j-column-filter',
  imports: [],
  template: `
    <label class="j-column-filter">
      <span class="j-column-filter__label">Filter {{ label() || field() }}</span>
      <input
        class="j-column-filter__control"
        type="search"
        [attr.aria-label]="'Filter ' + (label() || field())"
        [value]="stringValue()"
        (input)="handleInput($event)"
      />
    </label>
  `,
  styles: [
    `
      .j-column-filter {
        display: block;
        margin-top: var(--j-spacing-sm, 0.5rem);
      }

      .j-column-filter__label {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

      .j-column-filter__control {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
        width: 100%;
      }

      .j-column-filter__control:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JColumnFilterComponent {
  readonly field = input.required<string>();
  readonly label = input('');
  readonly value = input<unknown>('');
  readonly filterChange = output<JColumnFilterChange>();

  readonly stringValue = computed<string>(() => {
    const value = this.value();
    return value == null ? '' : String(value);
  });

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.filterChange.emit({ field: this.field(), value: input?.value ?? '' });
  }
}

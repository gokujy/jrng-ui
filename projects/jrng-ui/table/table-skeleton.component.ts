import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

@Component({
  selector: 'j-table-skeleton',
  imports: [],
  template: `
    <div class="j-table-skeleton" aria-hidden="true">
      @for (item of placeholders(); track item) {
        <span class="j-table-skeleton__cell" [style.width.%]="item"></span>
      }
    </div>
  `,
  styles: [
    `
      .j-table-skeleton {
        display: grid;
        gap: var(--j-spacing-md, 0.75rem);
      }

      .j-table-skeleton__cell {
        animation: j-table-skeleton-pulse 1.2s ease-in-out infinite;
        background: linear-gradient(
          90deg,
          var(--j-color-surface-muted, #f8fafc),
          var(--j-color-surface-subtle, #eef2f7),
          var(--j-color-surface-muted, #f8fafc)
        );
        border-radius: var(--j-radius-sm, 0.375rem);
        display: block;
        height: 0.875rem;
      }

      @keyframes j-table-skeleton-pulse {
        0%,
        100% {
          opacity: 0.55;
        }

        50% {
          opacity: 1;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTableSkeletonComponent {
  readonly rows = input(5, { transform: numberAttribute });
  readonly columns = input(4, { transform: numberAttribute });

  readonly placeholders = computed<readonly number[]>(() => {
    const columns = this.columns();
    const count = Math.max(1, this.rows() * columns);
    return Array.from({ length: count }, (_, index) => (index % columns === columns - 1 ? 55 : 80));
  });
}

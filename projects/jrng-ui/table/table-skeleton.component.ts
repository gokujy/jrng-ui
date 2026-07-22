import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JTableSkeletonColumn } from './table.types';

@Component({
  selector: 'j-table-skeleton',
  imports: [],
  template: `
    <div class="j-table-skeleton" aria-hidden="true">
      @for (row of skeletonRows(); track row) {
        <div class="j-table-skeleton__row" [style.grid-template-columns]="skeletonGridTemplate()">
          @for (width of skeletonWidths(); track $index) {
            <span class="j-table-skeleton__cell" [style.width]="width"></span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .j-table-skeleton {
        display: grid;
        gap: var(--j-spacing-md, 0.75rem);
      }

      .j-table-skeleton__row {
        display: grid;
        gap: var(--j-spacing-lg, 1rem);
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
        max-width: 100%;
      }

      @media (prefers-reduced-motion: reduce) {
        .j-table-skeleton__cell {
          animation: none;
        }
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
  readonly columnConfig = input<readonly JTableSkeletonColumn[]>([]);

  readonly skeletonRows = computed<readonly number[]>(() =>
    Array.from({ length: Math.max(1, this.rows()) }, (_, index) => index),
  );
  readonly skeletonWidths = computed<readonly string[]>(() => {
    const configured = this.columnConfig();
    const count = Math.max(1, configured.length || this.columns());
    return Array.from(
      { length: count },
      (_, index) => configured[index]?.width ?? (index === count - 1 ? '55%' : '80%'),
    );
  });
  readonly skeletonGridTemplate = computed(() => {
    const configured = this.columnConfig();
    if (configured.length) {
      return configured.map((column) => column.width || 'minmax(0, 1fr)').join(' ');
    }
    return `repeat(${Math.max(1, this.columns())}, minmax(0, 1fr))`;
  });

  readonly placeholders = computed<readonly number[]>(() => {
    const columns = this.columns();
    const count = Math.max(1, this.rows() * columns);
    return Array.from({ length: count }, (_, index) => (index % columns === columns - 1 ? 55 : 80));
  });
}

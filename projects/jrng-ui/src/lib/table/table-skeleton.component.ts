import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';

@Component({
  selector: 'j-table-skeleton',
  imports: [],
  template: `
    <div class="j-table-skeleton" aria-hidden="true">
      @for (item of placeholders; track item) {
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
  @Input({ transform: numberAttribute }) rows = 5;
  @Input({ transform: numberAttribute }) columns = 4;

  get placeholders(): readonly number[] {
    const count = Math.max(1, this.rows * this.columns);
    return Array.from({ length: count }, (_, index) =>
      index % this.columns === this.columns - 1 ? 55 : 80,
    );
  }
}

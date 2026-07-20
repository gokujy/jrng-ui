import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSeverity, JComponentSize } from 'jrng-ui/core';

export type JBusinessStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'paid'
  | 'unpaid'
  | 'overdue'
  | 'completed'
  | 'failed';

export interface JStatusChipColor {
  readonly background?: string;
  readonly border?: string;
  readonly color?: string;
}

@Component({
  selector: 'j-status-chip',
  imports: [],
  template: `
    <span
      [class]="chipClasses()"
      [style.--j-status-chip-bg]="customColor()?.background || null"
      [style.--j-status-chip-border]="customColor()?.border || null"
      [style.--j-status-chip-color]="customColor()?.color || null"
      data-jc-name="status-chip"
      data-jc-section="root"
    >
      <span class="j-status-chip__dot" data-jc-section="dot" aria-hidden="true"></span>
      <span data-jc-section="label">{{ displayLabel() }}</span>
    </span>
  `,
  styles: [
    `
      .j-status-chip {
        align-items: center;
        background: var(--j-status-chip-bg, var(--j-color-muted, #f1f5f9));
        border: 1px solid var(--j-status-chip-border, transparent);
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-status-chip-color, var(--j-color-foreground, #111827));
        display: inline-flex;
        font-weight: var(--j-font-weight-semibold, 650);
        gap: var(--j-spacing-sm, 0.5rem);
        line-height: 1;
      }

      .j-status-chip--sm {
        font-size: var(--j-font-size-xs, 0.75rem);
        min-height: 1.5rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-status-chip--md {
        font-size: var(--j-font-size-sm, 0.875rem);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-md, 0.75rem);
      }

      .j-status-chip--lg {
        font-size: var(--j-font-size-md, 1rem);
        min-height: 2.125rem;
        padding: 0 var(--j-spacing-lg, 1rem);
      }

      .j-status-chip__dot {
        background: currentColor;
        border-radius: var(--j-radius-full, 999px);
        height: 0.5rem;
        width: 0.5rem;
      }

      .j-status-chip--primary {
        --j-status-chip-bg: var(--j-color-primary-soft, #eef2ff);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-primary, #4f46e5);
      }

      .j-status-chip--secondary {
        --j-status-chip-bg: var(--j-color-secondary-soft, #dbeafe);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-secondary, #2563eb);
      }

      .j-status-chip--success {
        --j-status-chip-bg: var(--j-color-success-soft, #dcfce7);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-success, #16a34a);
      }

      .j-status-chip--warning {
        --j-status-chip-bg: var(--j-color-warning-soft, #fef3c7);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-warning, #d97706);
      }

      .j-status-chip--danger {
        --j-status-chip-bg: var(--j-color-danger-soft, #fee2e2);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-danger, #dc2626);
      }

      .j-status-chip--info {
        --j-status-chip-bg: var(--j-color-info-soft, #e0f2fe);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-info, #0284c7);
      }

      .j-status-chip--neutral {
        --j-status-chip-bg: var(--j-color-surface-subtle, #eef2f7);
        --j-status-chip-border: var(--j-color-border, #dbe2ea);
        --j-status-chip-color: var(--j-color-text, #111827);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStatusChipComponent {
  readonly label = input('');
  readonly status = input<JBusinessStatus | string>('');
  readonly severity = input<JSeverity>('neutral');
  readonly size = input<JComponentSize>('md');
  readonly colorMap = input<Record<string, JStatusChipColor>>({});
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly normalizedStatus = computed(() => this.status().trim().toLowerCase());
  readonly displayLabel = computed(() => this.label() || toTitleCase(this.normalizedStatus()));
  readonly resolvedSeverity = computed(() => {
    const status = this.normalizedStatus();
    if (!status) {
      return this.severity();
    }
    return statusSeverityMap[status] ?? this.severity();
  });
  readonly customColor = computed(() => {
    const status = this.normalizedStatus();
    return status ? this.colorMap()[status] : undefined;
  });

  readonly chipClasses = computed(() =>
    jMergePartClasses(
      [
        'j-status-chip',
        `j-status-chip--${this.resolvedSeverity()}`,
        `j-status-chip--${this.size()}`,
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}

const statusSeverityMap: Record<string, JSeverity> = {
  active: 'success',
  approved: 'success',
  paid: 'success',
  completed: 'success',
  pending: 'warning',
  draft: 'neutral',
  inactive: 'neutral',
  unpaid: 'warning',
  overdue: 'danger',
  rejected: 'danger',
  failed: 'danger',
};

function toTitleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

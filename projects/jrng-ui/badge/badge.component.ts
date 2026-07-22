import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JComponentSize, JPassThrough, JSeverity, jMergePartClasses } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';

export type JBadgeVariant = 'solid' | 'soft' | 'outlined';

@Component({
  selector: 'j-badge',
  imports: [JIconComponent],
  template: `
    <span
      [class]="badgeClasses()"
      data-jc-name="badge"
      data-jc-section="root"
      [attr.data-j-active]="active() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="disabled()"
    >
      @if (dot()) {
        <span class="j-hidden-accessible">{{ ariaLabel() || 'Status' }}</span>
      } @else {
        @if (icon()) {
          <j-icon [name]="icon()" aria-hidden="true" />
        }
        {{ displayValue() }}<ng-content />
      }
    </span>
  `,
  styles: [
    `
      .j-badge {
        --j-badge-accent: var(--j-color-primary);
        --j-badge-soft: var(--j-color-primary-soft);
        --j-badge-foreground: var(--j-color-on-primary);
        align-items: center;
        background: var(--j-badge-accent);
        border: 1px solid transparent;
        border-radius: var(--j-radius-sm);
        color: var(--j-badge-foreground);
        display: inline-flex;
        font-weight: var(--j-font-weight-bold);
        gap: var(--j-spacing-1);
        justify-content: center;
        line-height: var(--j-line-height-tight);
        min-width: 1.25rem;
        white-space: nowrap;
      }
      .j-badge--soft {
        background: var(--j-badge-soft);
        color: var(--j-badge-accent);
      }
      .j-badge--outlined {
        background: transparent;
        border-color: var(--j-badge-accent);
        color: var(--j-badge-accent);
      }
      .j-badge--sm {
        font-size: var(--j-font-size-xs);
        min-height: 1rem;
        padding: 0 var(--j-spacing-xs);
      }
      .j-badge--md {
        font-size: var(--j-font-size-xs);
        min-height: 1.25rem;
        padding: 0 var(--j-spacing-sm);
      }
      .j-badge--lg {
        font-size: var(--j-font-size-sm);
        min-height: 1.5rem;
        padding: 0 var(--j-spacing-md);
      }
      .j-badge--rounded {
        border-radius: var(--j-radius-full);
      }
      .j-badge--dot {
        border-radius: 50%;
        min-height: 0.5rem;
        min-width: 0.5rem;
        padding: 0;
        width: 0.5rem;
      }
      .j-badge--secondary {
        --j-badge-accent: var(--j-color-secondary);
        --j-badge-soft: var(--j-color-secondary-soft);
      }
      .j-badge--success {
        --j-badge-accent: var(--j-color-success);
        --j-badge-soft: var(--j-color-success-soft);
      }
      .j-badge--warning {
        --j-badge-accent: var(--j-color-warning);
        --j-badge-soft: var(--j-color-warning-soft);
        --j-badge-foreground: #111827;
      }
      .j-badge--danger {
        --j-badge-accent: var(--j-color-danger);
        --j-badge-soft: var(--j-color-danger-soft);
      }
      .j-badge--info {
        --j-badge-accent: var(--j-color-info);
        --j-badge-soft: var(--j-color-info-soft);
      }
      .j-badge--contrast {
        --j-badge-accent: var(--j-color-contrast);
        --j-badge-soft: var(--j-color-contrast-soft);
      }
      .j-badge--neutral {
        --j-badge-accent: var(--j-color-muted-foreground);
        --j-badge-soft: var(--j-color-muted);
        --j-badge-foreground: var(--j-color-card);
      }
      .j-badge.is-muted,
      .j-badge.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBadgeComponent {
  readonly value = input<string | number>('');
  readonly max = input(0, { transform: numberAttribute });
  readonly severity = input<JSeverity>('primary');
  readonly variant = input<JBadgeVariant>('solid');
  readonly size = input<JComponentSize>('md');
  readonly icon = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly rounded = input(true, { transform: booleanAttribute });
  readonly active = input(false, { transform: booleanAttribute });
  readonly dot = input(false, { transform: booleanAttribute });
  readonly muted = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly displayValue = computed(() => {
    const value = this.value();
    const max = this.max();
    return typeof value === 'number' && max > 0 && value > max ? `${max}+` : String(value);
  });

  readonly badgeClasses = computed(() =>
    jMergePartClasses(
      [
        'j-badge',
        `j-badge--${this.severity()}`,
        `j-badge--${this.variant()}`,
        `j-badge--${this.size()}`,
        this.rounded() ? 'j-badge--rounded' : '',
        this.dot() ? 'j-badge--dot' : '',
        this.muted() ? 'is-muted' : '',
        this.disabled() ? 'is-disabled' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}

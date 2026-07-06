import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JSeverity } from 'jrng-ui/core';

export interface JMeterGroupItem {
  readonly label: string;
  readonly value: number;
  readonly max?: number;
  readonly severity?: JSeverity;
}

interface JMeterGroupViewItem extends JMeterGroupItem {
  readonly percent: number;
}

@Component({
  selector: 'j-meter-group',
  imports: [],
  template: `
    <div
      class="j-meter-group"
      [class]="styleClass()"
      data-jc-name="meter-group"
      data-jc-section="root"
    >
      @for (item of normalizedItems(); track item.label || $index) {
        <div class="j-meter-group__item" data-jc-section="item">
          <div class="j-meter-group__meta">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <div
            class="j-meter-group__track"
            role="meter"
            [attr.aria-label]="item.label"
            [attr.aria-valuemin]="0"
            [attr.aria-valuemax]="item.max ?? max()"
            [attr.aria-valuenow]="item.value"
          >
            <span
              class="j-meter-group__bar"
              [class]="'j-meter-group__bar j-meter-group__bar--' + (item.severity || 'primary')"
              [style.width.%]="item.percent"
            ></span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .j-meter-group {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-meter-group__item {
        display: grid;
        gap: var(--j-spacing-2);
      }

      .j-meter-group__meta {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        font-size: var(--j-font-size-sm);
        justify-content: space-between;
      }

      .j-meter-group__meta strong {
        color: var(--j-color-foreground);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-meter-group__track {
        background: var(--j-color-muted);
        border-radius: var(--j-radius-full);
        height: 0.5rem;
        overflow: hidden;
      }

      .j-meter-group__bar {
        background: var(--j-color-primary);
        border-radius: inherit;
        display: block;
        height: 100%;
        transition: width var(--j-duration-normal) var(--j-ease-standard);
      }

      .j-meter-group__bar--success {
        background: var(--j-color-success);
      }

      .j-meter-group__bar--warning {
        background: var(--j-color-warning);
      }

      .j-meter-group__bar--danger {
        background: var(--j-color-danger);
      }

      .j-meter-group__bar--info,
      .j-meter-group__bar--secondary,
      .j-meter-group__bar--neutral {
        background: var(--j-color-info);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMeterGroupComponent {
  readonly value = input<readonly JMeterGroupItem[]>([]);
  readonly max = input(100, { transform: numberAttribute });
  readonly styleClass = input('');

  readonly normalizedItems = computed<readonly JMeterGroupViewItem[]>(() =>
    this.value().map((item) => {
      const max = item.max ?? this.max();
      const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (item.value / max) * 100));
      return { ...item, percent };
    }),
  );
}

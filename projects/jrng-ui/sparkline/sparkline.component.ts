import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type JSparklineType = 'line' | 'bar';

interface JSparklinePoint {
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

interface JSparklineBar {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly value: number;
}

@Component({
  selector: 'j-sparkline',
  imports: [],
  template: `
    <svg
      class="j-sparkline"
      [class]="styleClass()"
      data-jc-name="sparkline"
      data-jc-section="root"
      role="img"
      [attr.aria-label]="ariaLabel()"
      [attr.viewBox]="'0 0 ' + renderedWidth() + ' ' + renderedHeight()"
      [attr.width]="renderedWidth()"
      [attr.height]="renderedHeight()"
      preserveAspectRatio="none"
    >
      @if (type() === 'line') {
        <polyline class="j-sparkline__line" [attr.points]="linePoints()" fill="none" />
      } @else {
        @for (bar of bars(); track $index) {
          <rect
            class="j-sparkline__bar"
            [class.j-sparkline__bar--negative]="bar.value < 0"
            [attr.x]="bar.x"
            [attr.y]="bar.y"
            [attr.width]="bar.width"
            [attr.height]="bar.height"
            rx="1"
          />
        }
      }
    </svg>
  `,
  styles: [
    `
      .j-sparkline {
        color: var(--j-color-primary);
        display: inline-block;
        overflow: visible;
        vertical-align: middle;
      }

      .j-sparkline__line {
        stroke: var(--j-sparkline-positive-color, var(--j-color-success));
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
      }

      .j-sparkline__bar {
        fill: var(--j-sparkline-positive-color, var(--j-color-success));
      }

      .j-sparkline__bar--negative {
        fill: var(--j-sparkline-negative-color, var(--j-color-danger));
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSparklineComponent {
  readonly value = input<readonly number[]>([]);
  readonly type = input<JSparklineType>('line');
  readonly width = input(120, { transform: numberAttribute });
  readonly height = input(32, { transform: numberAttribute });
  readonly ariaLabel = input('Sparkline');
  readonly styleClass = input('');
  readonly renderedWidth = computed(() => normalizeDimension(this.width(), 120));
  readonly renderedHeight = computed(() => normalizeDimension(this.height(), 32));

  readonly points = computed<readonly JSparklinePoint[]>(() => {
    const values = this.value().map(normalizeValue);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const range = max - min || 1;
    const xStep =
      values.length > 1 ? this.renderedWidth() / (values.length - 1) : this.renderedWidth();
    return values.map((value, index) => ({
      x: index * xStep,
      y: this.renderedHeight() - ((value - min) / range) * this.renderedHeight(),
      value,
    }));
  });

  readonly linePoints = computed(() =>
    this.points()
      .map((point) => `${point.x},${point.y}`)
      .join(' '),
  );

  readonly bars = computed<readonly JSparklineBar[]>(() => {
    const values = this.value().map(normalizeValue);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 0);
    const range = max - min || 1;
    const barWidth = values.length ? this.renderedWidth() / values.length : this.renderedWidth();
    const zeroY = this.renderedHeight() - ((0 - min) / range) * this.renderedHeight();
    return values.map((value, index) => {
      const y = this.renderedHeight() - ((value - min) / range) * this.renderedHeight();
      return {
        x: index * barWidth + 1,
        y: Math.min(y, zeroY),
        width: Math.max(1, barWidth - 2),
        height: Math.max(1, Math.abs(zeroY - y)),
        value,
      };
    });
  });
}

function normalizeDimension(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(1, value) : fallback;
}

function normalizeValue(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

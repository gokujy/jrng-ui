import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type JChartType =
  'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble' | 'mixed';

export interface JChartInteractionEvent {
  readonly nativeEvent: Event;
  readonly elements: readonly unknown[];
  readonly chart: unknown;
}

type JChartRecord = Record<string, unknown>;

interface JChartRuntimeConfig {
  readonly type: string;
  readonly data: unknown;
  readonly options: JChartRecord;
  readonly plugins?: readonly unknown[];
}

interface JChartInstance {
  destroy(): void;
  resize(): void;
  update(mode?: string): void;
  toBase64Image?(type?: string, quality?: number): string;
}

type JChartConstructor = new (
  item: HTMLCanvasElement,
  config: JChartRuntimeConfig,
) => JChartInstance;

@Component({
  selector: 'j-chart',
  imports: [],
  template: `
    <section
      class="j-chart"
      [class]="styleClass()"
      data-jc-name="chart"
      data-jc-section="root"
      data-jc-extend="chart canvas legend tooltip export"
      [attr.data-j-loading]="loading() ? 'true' : null"
      [style.width.px]="width() || null"
      [style.height.px]="height() || null"
    >
      @if (loading()) {
        <div class="j-chart__state" data-jc-section="loading" role="status">Loading...</div>
      } @else if (!hasData()) {
        <div class="j-chart__state" data-jc-section="empty">{{ emptyMessage() }}</div>
      } @else if (loadError()) {
        <div class="j-chart__state" data-jc-section="error">{{ loadError() }}</div>
      } @else {
        <canvas
          #canvas
          data-jc-section="canvas"
          role="img"
          [attr.aria-label]="ariaLabel()"
          [attr.width]="width() || null"
          [attr.height]="height() || null"
        ></canvas>
      }
    </section>
  `,
  styles: [
    `
      .j-chart {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-card-radius, var(--j-radius-lg));
        color: var(--j-color-card-foreground);
        min-height: 12rem;
        padding: var(--j-spacing-4);
        position: relative;
      }

      .j-chart canvas {
        display: block;
        max-height: 100%;
        max-width: 100%;
      }

      .j-chart__state {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        justify-content: center;
        min-height: 10rem;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JChartComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private chart: JChartInstance | null = null;
  private chartConstructor: JChartConstructor | null = null;
  private renderVersion = 0;
  private destroyed = false;

  readonly type = input<JChartType>('bar');
  readonly data = input<unknown>(null);
  readonly options = input<JChartRecord | null>(null);
  readonly plugins = input<readonly unknown[]>([]);
  readonly width = input(0, { transform: numberAttribute });
  readonly height = input(0, { transform: numberAttribute });
  readonly responsive = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input('No chart data available.');
  readonly ariaLabel = input('Chart');
  readonly styleClass = input('');

  readonly chartClick = output<JChartInteractionEvent>();
  readonly chartHover = output<JChartInteractionEvent>();

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly loadError = signal('');

  readonly hasData = computed(() => {
    const data = this.data();
    if (!isRecord(data)) {
      return false;
    }
    const datasets = data['datasets'];
    if (Array.isArray(datasets)) {
      return datasets.length > 0;
    }
    const labels = data['labels'];
    return Array.isArray(labels) && labels.length > 0;
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.destroyChart();
    });

    effect(() => {
      this.canvasRef();
      this.type();
      this.data();
      this.options();
      this.plugins();
      this.responsive();
      this.loading();

      if (!this.isBrowser || this.loading() || !this.hasData()) {
        this.destroyChart();
        return;
      }

      void this.renderChart();
    });
  }

  refresh(): void {
    this.chart?.update();
  }

  resize(): void {
    this.chart?.resize();
  }

  exportImage(type = 'image/png', quality?: number): string {
    return this.chart?.toBase64Image?.(type, quality) ?? '';
  }

  private async renderChart(): Promise<void> {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }

    const version = ++this.renderVersion;
    const ChartConstructor = await this.loadChartConstructor();
    if (!ChartConstructor || this.destroyed || version !== this.renderVersion) {
      return;
    }

    this.destroyChart();
    this.chart = new ChartConstructor(canvas, {
      type: this.resolvedType(),
      data: this.themedData(canvas),
      options: this.mergedOptions(),
      plugins: this.plugins(),
    });
  }

  private async loadChartConstructor(): Promise<JChartConstructor | null> {
    if (this.chartConstructor) {
      return this.chartConstructor;
    }

    try {
      const module: unknown = await import('chart.js/auto');
      const candidate = isRecord(module) ? (module['default'] ?? module['Chart']) : null;
      if (typeof candidate !== 'function') {
        this.loadError.set('Chart renderer is unavailable.');
        return null;
      }
      this.loadError.set('');
      this.chartConstructor = candidate as JChartConstructor;
      return this.chartConstructor;
    } catch {
      this.loadError.set('Install chart.js to render j-chart.');
      return null;
    }
  }

  private resolvedType(): string {
    return this.type() === 'mixed' ? 'bar' : this.type();
  }

  private mergedOptions(): JChartRecord {
    const userOptions = this.options() ?? {};
    const userPlugins = isRecord(userOptions['plugins']) ? userOptions['plugins'] : {};
    const userLegend = isRecord(userPlugins['legend']) ? userPlugins['legend'] : {};
    const userTooltip = isRecord(userPlugins['tooltip']) ? userPlugins['tooltip'] : {};
    // Spread user options FIRST, then apply the built-in plugin defaults and
    // event handlers so they win. The plugins block is deep-merged (per-plugin)
    // so user plugin options extend the legend/tooltip defaults instead of
    // wiping them out, and onClick/onHover are never clobbered.
    return {
      responsive: this.responsive(),
      maintainAspectRatio: this.height() === 0,
      ...userOptions,
      plugins: {
        ...userPlugins,
        legend: {
          display: true,
          labels: {
            color: 'var(--j-color-muted-foreground)',
          },
          ...userLegend,
        },
        tooltip: {
          enabled: true,
          ...userTooltip,
        },
      },
      onClick: (event: Event, elements: readonly unknown[], chart: unknown) => {
        this.chartClick.emit({ nativeEvent: event, elements, chart });
      },
      onHover: (event: Event, elements: readonly unknown[], chart: unknown) => {
        this.chartHover.emit({ nativeEvent: event, elements, chart });
      },
    };
  }

  private themedData(canvas: HTMLCanvasElement): unknown {
    const data = this.data();
    if (!isRecord(data)) {
      return data;
    }

    const datasets = data['datasets'];
    if (!Array.isArray(datasets)) {
      return data;
    }

    const palette = this.palette(canvas);
    const themedDatasets = datasets.map((dataset, index) => {
      if (!isRecord(dataset)) {
        return dataset;
      }
      const color = palette[index % palette.length] ?? '#2563eb';
      const next: JChartRecord = { ...dataset };
      if (next['borderColor'] == null) {
        next['borderColor'] = color;
      }
      if (next['backgroundColor'] == null) {
        next['backgroundColor'] = this.usesSegmentColors() ? palette : withAlpha(color, 0.22);
      }
      if (next['pointBackgroundColor'] == null) {
        next['pointBackgroundColor'] = color;
      }
      return next;
    });

    return { ...data, datasets: themedDatasets };
  }

  private palette(canvas: HTMLCanvasElement): readonly string[] {
    const view = canvas.ownerDocument.defaultView;
    const styles = view?.getComputedStyle(canvas);
    const token = (name: string, fallback: string) =>
      styles?.getPropertyValue(name).trim() || fallback;
    return [
      token('--j-color-primary', '#2563eb'),
      token('--j-color-success', '#16a34a'),
      token('--j-color-warning', '#d97706'),
      token('--j-color-danger', '#dc2626'),
      token('--j-color-info', '#0284c7'),
      token('--j-color-secondary', '#64748b'),
    ];
  }

  private usesSegmentColors(): boolean {
    return ['pie', 'doughnut', 'polarArea'].includes(this.type());
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}

function isRecord(value: unknown): value is JChartRecord {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#') || (color.length !== 7 && color.length !== 4)) {
    return color;
  }
  const normalized =
    color.length === 4
      ? `#${color[1] ?? '0'}${color[1] ?? '0'}${color[2] ?? '0'}${color[2] ?? '0'}${color[3] ?? '0'}${color[3] ?? '0'}`
      : color;
  const opacity = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${normalized}${opacity}`;
}

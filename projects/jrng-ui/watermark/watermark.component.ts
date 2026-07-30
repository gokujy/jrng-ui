import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

@Component({
  selector: 'j-watermark',
  template: `
    <div class="j-watermark__content"><ng-content /></div>
    <div
      class="j-watermark__layer"
      aria-hidden="true"
      [style.background-image]="backgroundImage()"
      [style.background-size]="tileSize()"
      [style.background-position]="backgroundPosition()"
      [style.z-index]="zIndex()"
    ></div>
  `,
  styleUrl: './watermark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-watermark',
    '[class.j-watermark--full-page]': 'fullPage()',
    'data-jc-name': 'watermark',
    'data-jc-section': 'root',
    'data-jc-extend': 'content layer',
  },
})
export class JWatermarkComponent {
  readonly text = input<string | readonly string[]>('JRNG UI');
  readonly image = input('');
  readonly rotate = input(-22, { transform: numberAttribute });
  readonly opacity = input(0.14, { transform: numberAttribute });
  readonly color = input('var(--j-color-text)');
  readonly fontFamily = input('system-ui, sans-serif');
  readonly fontSize = input(16, { transform: numberAttribute });
  readonly fontWeight = input(500, { transform: numberAttribute });
  readonly horizontalGap = input(80, { transform: numberAttribute });
  readonly verticalGap = input(64, { transform: numberAttribute });
  readonly offsetX = input(0, { transform: numberAttribute });
  readonly offsetY = input(0, { transform: numberAttribute });
  readonly width = input(180, { transform: numberAttribute });
  readonly height = input(100, { transform: numberAttribute });
  readonly zIndex = input(1, { transform: numberAttribute });
  readonly fullPage = input(false, { transform: booleanAttribute });

  readonly tileSize = computed(
    () =>
      `${Math.max(1, this.width()) + Math.max(0, this.horizontalGap())}px ${Math.max(1, this.height()) + Math.max(0, this.verticalGap())}px`,
  );
  readonly backgroundPosition = computed(() => `${this.offsetX()}px ${this.offsetY()}px`);
  readonly backgroundImage = computed(() => `url("${this.svgDataUrl()}")`);

  private svgDataUrl(): string {
    const width = Math.max(1, this.width());
    const height = Math.max(1, this.height());
    const opacity = Math.max(0, Math.min(1, this.opacity()));
    const transform = `rotate(${this.rotate()} ${width / 2} ${height / 2})`;
    const content = this.image()
      ? `<image href="${this.escape(this.image())}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" opacity="${opacity}"/>`
      : this.textSvg(width, height, opacity);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="${transform}">${content}</g></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  private textSvg(width: number, height: number, opacity: number): string {
    const value = this.text();
    const lines: readonly string[] = Array.isArray(value)
      ? value.map((line) => String(line))
      : [String(value)];
    const lineHeight = Math.max(1, this.fontSize() * 1.25);
    const firstY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    return lines
      .map(
        (line, index) =>
          `<text x="${width / 2}" y="${firstY + index * lineHeight}" dominant-baseline="middle" text-anchor="middle" fill="${this.escape(this.color())}" fill-opacity="${opacity}" font-family="${this.escape(this.fontFamily())}" font-size="${Math.max(1, this.fontSize())}" font-weight="${this.fontWeight()}">${this.escape(line)}</text>`,
      )
      .join('');
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  input,
  numberAttribute,
} from '@angular/core';

export interface JWatermarkRenderOptions {
  readonly text: string | readonly string[];
  readonly image: string;
  readonly rotate: number;
  readonly opacity: number;
  readonly color: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly width: number;
  readonly height: number;
}

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
  readonly backgroundImage = computed(
    () =>
      `url("${jCreateWatermarkDataUrl({
        text: this.text(),
        image: this.image(),
        rotate: this.rotate(),
        opacity: this.opacity(),
        color: this.color(),
        fontFamily: this.fontFamily(),
        fontSize: this.fontSize(),
        fontWeight: this.fontWeight(),
        width: this.width(),
        height: this.height(),
      })}")`,
  );
}

@Directive({
  selector: '[jWatermark]',
  host: {
    '[style.background-image]': 'backgroundImage()',
    '[style.background-size]': 'tileSize()',
    '[style.background-position]': 'backgroundPosition()',
    '[style.background-repeat]': '"repeat"',
    'data-jc-name': 'watermark-directive',
  },
})
export class JWatermarkDirective {
  readonly text = input<string | readonly string[]>('JRNG UI', { alias: 'jWatermark' });
  readonly image = input('', { alias: 'watermarkImage' });
  readonly rotate = input(-22, { alias: 'watermarkRotate', transform: numberAttribute });
  readonly opacity = input(0.14, { alias: 'watermarkOpacity', transform: numberAttribute });
  readonly color = input('var(--j-color-text)', { alias: 'watermarkColor' });
  readonly fontSize = input(16, { alias: 'watermarkFontSize', transform: numberAttribute });
  readonly horizontalGap = input(80, {
    alias: 'watermarkHorizontalGap',
    transform: numberAttribute,
  });
  readonly verticalGap = input(64, {
    alias: 'watermarkVerticalGap',
    transform: numberAttribute,
  });
  readonly offsetX = input(0, { alias: 'watermarkOffsetX', transform: numberAttribute });
  readonly offsetY = input(0, { alias: 'watermarkOffsetY', transform: numberAttribute });
  readonly width = input(180, { alias: 'watermarkWidth', transform: numberAttribute });
  readonly height = input(100, { alias: 'watermarkHeight', transform: numberAttribute });

  readonly tileSize = computed(
    () =>
      `${Math.max(1, this.width()) + Math.max(0, this.horizontalGap())}px ${Math.max(1, this.height()) + Math.max(0, this.verticalGap())}px`,
  );
  readonly backgroundPosition = computed(() => `${this.offsetX()}px ${this.offsetY()}px`);
  readonly backgroundImage = computed(
    () =>
      `url("${jCreateWatermarkDataUrl({
        text: this.text(),
        image: this.image(),
        rotate: this.rotate(),
        opacity: this.opacity(),
        color: this.color(),
        fontFamily: 'system-ui, sans-serif',
        fontSize: this.fontSize(),
        fontWeight: 500,
        width: this.width(),
        height: this.height(),
      })}")`,
  );
}

export function jCreateWatermarkDataUrl(options: JWatermarkRenderOptions): string {
  const width = Math.max(1, options.width);
  const height = Math.max(1, options.height);
  const opacity = Math.max(0, Math.min(1, options.opacity));
  const transform = `rotate(${options.rotate} ${width / 2} ${height / 2})`;
  const content = options.image
    ? `<image href="${escapeWatermark(options.image)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" opacity="${opacity}"/>`
    : watermarkTextSvg(options, width, height, opacity);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="${transform}">${content}</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function watermarkTextSvg(
  options: JWatermarkRenderOptions,
  width: number,
  height: number,
  opacity: number,
): string {
  const lines: readonly string[] = Array.isArray(options.text)
    ? options.text.map((line) => String(line))
    : [String(options.text)];
  const lineHeight = Math.max(1, options.fontSize * 1.25);
  const firstY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  return lines
    .map(
      (line, index) =>
        `<text x="${width / 2}" y="${firstY + index * lineHeight}" dominant-baseline="middle" text-anchor="middle" fill="${escapeWatermark(options.color)}" fill-opacity="${opacity}" font-family="${escapeWatermark(options.fontFamily)}" font-size="${Math.max(1, options.fontSize)}" font-weight="${options.fontWeight}">${escapeWatermark(line)}</text>`,
    )
    .join('');
}

function escapeWatermark(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

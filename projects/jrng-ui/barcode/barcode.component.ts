import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JDownloadService } from 'jrng-ui/core';
import {
  JBarcodeGraphic,
  JBarcodeIssue,
  JBarcodeSymbology,
  JQrErrorCorrection,
  jBarcodeSvg,
  jEncodeBarcode,
} from './barcode';

@Component({
  selector: 'j-barcode',
  imports: [JButtonComponent],
  template: `
    <figure
      class="j-barcode"
      [class.j-barcode--invalid]="hasErrors()"
      [class.j-barcode--disabled]="disabled()"
      [attr.dir]="dir()"
      [style.width.px]="width()"
      data-jc-name="barcode"
    >
      @if (graphic().path) {
        <svg
          class="j-barcode__graphic"
          xmlns="http://www.w3.org/2000/svg"
          [attr.viewBox]="'0 0 ' + graphic().viewBoxWidth + ' ' + graphic().viewBoxHeight"
          [attr.width]="width()"
          [attr.height]="height()"
          [attr.aria-label]="accessibleLabel()"
          role="img"
          preserveAspectRatio="xMidYMid meet"
          shape-rendering="crispEdges"
        >
          <rect width="100%" height="100%" [attr.fill]="background()" aria-hidden="true" />
          <path [attr.d]="graphic().path" [attr.fill]="foreground()" aria-hidden="true" />
        </svg>
        @if (showValue()) {
          <figcaption class="j-barcode__value" dir="auto">{{ graphic().encodedValue }}</figcaption>
        }
        @if (showExportAction()) {
          <div class="j-barcode__actions">
            <j-button
              label="Export SVG"
              variant="outlined"
              [disabled]="disabled()"
              (onClick)="exportSvg()"
            />
          </div>
        }
      }

      @if (graphic().issues.length) {
        <div
          class="j-barcode__issues"
          [attr.role]="hasErrors() ? 'alert' : 'status'"
          [attr.aria-label]="hasErrors() ? 'Invalid barcode' : 'Barcode warning'"
        >
          @for (issue of graphic().issues; track issue.code + issue.message) {
            <span>{{ issue.message }}</span>
          }
        </div>
      }
    </figure>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        max-width: 100%;
      }

      .j-barcode {
        align-items: center;
        background: var(--j-barcode-surface, transparent);
        display: inline-flex;
        flex-direction: column;
        gap: var(--j-spacing-2, 0.5rem);
        margin: 0;
        max-width: 100%;
      }

      .j-barcode__graphic {
        display: block;
        height: auto;
        max-width: 100%;
        print-color-adjust: exact;
      }

      .j-barcode__value {
        color: var(--j-barcode-text, var(--j-color-foreground, #111827));
        font: var(--j-barcode-caption-font, 500 0.875rem/1.4 ui-monospace, monospace);
        overflow-wrap: anywhere;
        text-align: center;
      }

      .j-barcode__actions {
        align-self: stretch;
        display: flex;
        justify-content: center;
      }

      .j-barcode__issues {
        background: var(--j-barcode-invalid-bg, var(--j-color-muted, #f1f5f9));
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-barcode-invalid, var(--j-color-danger, #b91c1c));
        display: grid;
        font-size: var(--j-font-size-sm, 0.875rem);
        gap: var(--j-spacing-1, 0.25rem);
        padding: var(--j-spacing-2, 0.5rem);
        width: 100%;
      }

      .j-barcode--invalid {
        border: 1px solid var(--j-barcode-invalid, var(--j-color-danger, #b91c1c));
        border-radius: var(--j-radius-md, 0.5rem);
        padding: var(--j-spacing-2, 0.5rem);
      }

      .j-barcode--disabled {
        opacity: var(--j-disabled-opacity, 0.6);
      }

      @media print {
        .j-barcode__actions,
        .j-barcode__issues {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBarcodeComponent {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly downloads = inject(JDownloadService);
  private lastReadyKey = '';
  private lastInvalidKey = '';

  readonly value = input('');
  readonly symbology = input<JBarcodeSymbology>('qr');
  readonly width = input(256, { transform: numberAttribute });
  readonly height = input(256, { transform: numberAttribute });
  readonly quietZone = input<number | undefined>(undefined);
  readonly foreground = input('#000000');
  readonly background = input('#ffffff');
  readonly errorCorrection = input<JQrErrorCorrection>('M');
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly showExportAction = input(false, { transform: booleanAttribute });
  readonly exportFilename = input('barcode');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly dir = input<'ltr' | 'rtl'>('ltr');

  readonly ready = output<JBarcodeGraphic>();
  readonly invalid = output<readonly JBarcodeIssue[]>();
  readonly svgExport = output<string>();

  readonly graphic = computed(() => {
    const graphic = jEncodeBarcode({
      value: this.value(),
      symbology: this.symbology(),
      quietZone: this.quietZone(),
      foreground: this.foreground(),
      background: this.background(),
      errorCorrection: this.errorCorrection(),
    });
    if (
      Number.isFinite(this.width()) &&
      this.width() > 0 &&
      Number.isFinite(this.height()) &&
      this.height() > 0 &&
      (this.quietZone() === undefined || this.quietZone()! >= 0)
    ) {
      return graphic;
    }
    const sizeIssue: JBarcodeIssue = {
      code: 'invalid-size',
      message: 'Width and height must be positive, and quiet zone must not be negative.',
      severity: 'error',
    };
    return { ...graphic, path: '', issues: [...graphic.issues, sizeIssue] };
  });
  readonly hasErrors = computed(() =>
    this.graphic().issues.some((issue) => issue.severity === 'error'),
  );
  readonly accessibleLabel = computed(
    () =>
      this.ariaLabel().trim() ||
      `${this.symbologyName()} barcode encoding ${this.graphic().encodedValue}`,
  );

  constructor() {
    effect(() => {
      const graphic = this.graphic();
      const invalidKey = graphic.issues
        .filter((issue) => issue.severity === 'error')
        .map((issue) => `${issue.code}:${issue.message}`)
        .join('|');
      if (invalidKey) {
        if (invalidKey !== this.lastInvalidKey) this.invalid.emit(graphic.issues);
        this.lastInvalidKey = invalidKey;
        return;
      }
      this.lastInvalidKey = '';
      const readyKey = `${graphic.symbology}:${graphic.encodedValue}:${graphic.path}`;
      if (readyKey !== this.lastReadyKey) this.ready.emit(graphic);
      this.lastReadyKey = readyKey;
    });
  }

  toSvg(): string {
    const graphic = this.graphic();
    if (!graphic.path) return '';
    return jBarcodeSvg(graphic, this.foreground(), this.background(), this.accessibleLabel());
  }

  exportSvg(): string {
    if (this.disabled()) return '';
    const svg = this.toSvg();
    if (!svg) return '';
    this.svgExport.emit(svg);
    if (this.browser) {
      this.downloads.downloadText(
        svg,
        `${this.exportFilename()}.svg`,
        'image/svg+xml;charset=utf-8',
      );
    }
    return svg;
  }

  private symbologyName(): string {
    if (this.symbology() === 'ean13') return 'EAN-13';
    if (this.symbology() === 'code128') return 'Code 128';
    return 'QR Code';
  }
}

# Barcode

`j-barcode` renders deterministic, SSR-safe SVG for QR Code, Code 128 B, and EAN-13. It does not scan codes, use a camera, or manage inventory.

```ts
import { JBarcodeComponent } from 'jrng-ui/barcode';
```

## QR Code

```html
<j-barcode
  value="https://jrngui.dev"
  symbology="qr"
  errorCorrection="M"
  ariaLabel="JRNG website QR code"
/>
```

QR uses byte mode and supports L, M, Q, and H error correction. The QR matrix is provided by the MIT-licensed `qrcode-generator` 2.0.4 dependency: it has no runtime dependencies, provides ESM and types, is SSR-compatible, and was selected to avoid introducing an unverified QR implementation. Code 128, EAN-13, validation, SVG rendering, events, and export are independently implemented by JRNG.

## Inventory Code 128

```html
<j-barcode value="INV-2026-0042" symbology="code128" showValue />
```

The first release uses Code Set B and accepts printable ASCII characters 32–126.

## Retail EAN-13

```html
<j-barcode value="4006381333931" symbology="ean13" showValue />
```

Twelve digits calculate the thirteenth check digit. Thirteen digits are accepted only when their checksum is valid.

## Ticket or URL QR

```html
<j-barcode
  value="https://example.test/tickets/42"
  symbology="qr"
  errorCorrection="Q"
  ariaLabel="Open ticket 42"
/>
```

The accessible label describes the destination; it is separate from the encoded value.

## Size and quiet zone

```html
<j-barcode value="Compact QR" [width]="160" [height]="160" [quietZone]="4" />
<j-barcode value="SHIP-42" symbology="code128" [width]="360" [height]="120" [quietZone]="10" />
```

QR defaults to a four-module quiet zone and linear symbols to ten logical modules. Tiny dimensions or reduced quiet zones can make a valid symbol unscannable.

## Visible value

```html
<j-barcode value="400638133393" symbology="ean13" showValue />
```

The normalized decoded value is a separate `figcaption`; text is never drawn as barcode modules or exposed through thousands of SVG nodes.

## Foreground and background

```html
<j-barcode value="BRAND-42" symbology="code128" foreground="#102a43" background="#ffffff" />
```

Colors must use `#RGB` or `#RRGGBB`. Contrast below 3:1 produces a visible warning. Prefer dark modules on a plain light background and validate the final printed output.

## Invalid value

```html
<j-barcode value="4006381333932" symbology="ean13" />
```

Empty values, invalid EAN length/checksum, Code 128 characters outside printable ASCII, oversized input, and invalid colors produce an accessible invalid state and the `invalid` event. No SVG is rendered for an error.

## Print layout

SVG uses a stable logical viewBox, crisp edges, and `print-color-adjust: exact`. Export actions and issues are hidden in print styles. Print at 100% scale, do not crop the quiet zone, and avoid browser “fit to page” scaling when precise module size matters.

## SVG export

```html
<j-barcode
  value="Export me"
  showExportAction
  exportFilename="ticket-code"
  (svgExport)="storeSvg($event)"
/>
```

`toSvg()` returns deterministic SVG without invoking browser APIs. `exportSvg()` returns and emits the same text, then downloads it only in a browser. Disabled state blocks the export action. PNG export is deliberately excluded to keep the component lightweight and SSR-safe.

## Accessibility

- The complete SVG is one `role="img"` with one accessible name.
- Its background and path are `aria-hidden`; modules and bars are not focusable.
- Visible decoded text is separate from the graphic.
- Invalid state uses an alert; scan-risk warnings use status text.
- The optional Export SVG JRNG button has a clear label and visible focus.

## Responsive behavior

The SVG has `max-width: 100%` and preserves its viewBox and aspect ratio as its container narrows. Responsive scaling never rewrites the matrix, bar order, or quiet-zone coordinates.

## RTL

```html
<div dir="rtl">
  <j-barcode dir="rtl" value="ABC-123" symbology="code128" showValue />
</div>
```

Surrounding content and actions follow RTL. Encoded matrix cells, linear bars, and decoded character order never mirror.

## Theming

| Token                      | Default                | Purpose            |
| -------------------------- | ---------------------- | ------------------ |
| `--j-barcode-surface`      | `transparent`          | Figure surface     |
| `--j-barcode-text`         | `--j-color-foreground` | Visible value      |
| `--j-barcode-caption-font` | `ui-monospace`         | Caption typography |
| `--j-barcode-invalid-bg`   | `--j-color-muted`      | Issue surface      |
| `--j-barcode-invalid`      | `--j-color-danger`     | Invalid state      |

All public classes use `.j-barcode*`. Foreground and background are explicit component inputs because they change encoded graphic output rather than just UI decoration.

## API

Inputs: `value`, `symbology`, `width`, `height`, `quietZone`, `foreground`, `background`, `errorCorrection`, `showValue`, `ariaLabel`, `showExportAction`, `exportFilename`, `disabled`, and `dir`.

Outputs: `ready` with `JBarcodeGraphic`, `invalid` with `readonly JBarcodeIssue[]`, and `svgExport` with SVG text.

Methods: `toSvg()` and `exportSvg()`. Pure helpers include `jEncodeBarcode`, `jValidateBarcode`, `jEan13Checksum`, and `jBarcodeSvg`.

## Testing and scanner validation

Automated tests cover deterministic output, a stable QR version-one fixture, Code 128 start/data/checksum/stop dimensions, the published `4006381333931` EAN example, checksums, invalid characters and lengths, empty/oversized values, quiet zones, contrast, SVG dimensions, SSR-safe export, responsive/print styles, RTL, repeated updates, and Angular cleanup.

Before shipping a label or ticket:

1. Print at the production printer’s DPI and final physical size.
2. Scan at least five samples with two representative phone cameras.
3. Scan the same samples with the target hardware reader.
4. Record size, quiet zone, contrast, material, lighting, distance, and failure rate.

Hardware is not part of the automated suite.

## FAQ

**Can Barcode scan a code?** No. It only renders.

**Why only three symbologies?** Each claimed format has bounded validation and conformance coverage; unsupported formats are not advertised.

**Why does a mathematically valid code sometimes fail to scan?** Print resolution, physical size, contrast, surface, damage, quiet zone, and reader capability all matter.

**Are barcode fonts used?** No. Output is deterministic SVG geometry.

## Changelog

- Introduced in Advanced Components Phase 1 with QR Code, Code 128 B, EAN-13, validation, accessible SVG, responsive and print behavior, and SSR-safe SVG export.
